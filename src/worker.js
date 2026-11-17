const MAX_BODY_BYTES = 16 * 1024;
const MAX_EVENTS_PER_BATCH = 25;

function cleanString(value, maxLen = 180) {
  if (typeof value !== 'string') return undefined;
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
}

function sanitizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const event = {};
  for (const [key, val] of Object.entries(raw)) {
    if (typeof val === 'string') {
      event[key] = cleanString(val, key === 'text' ? 180 : 120);
    } else if (typeof val === 'number' && Number.isFinite(val)) {
      event[key] = val;
    } else if (typeof val === 'boolean' || val === null) {
      event[key] = val;
    }
  }
  return event;
}

function parseByteRange(rangeHeader, total) {
  const match = rangeHeader?.match(/^bytes=(\d*)-(\d*)$/i);
  if (!match || (!match[1] && !match[2])) return null;

  let start;
  let end;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!Number.isFinite(suffix) || suffix <= 0) return null;
    start = Math.max(0, total - suffix);
    end = total - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
  }

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    start > end ||
    start >= total
  ) {
    return 'invalid';
  }

  return { start, end };
}

function sliceStream(body, start, end) {
  const reader = body.getReader();
  let pos = 0;

  return new ReadableStream({
    async pull(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        if (!value || value.byteLength === 0) continue;

        const chunkStart = pos;
        const chunkEnd = pos + value.byteLength - 1;
        pos += value.byteLength;

        if (chunkEnd < start) continue;
        if (chunkStart > end) {
          await reader.cancel();
          controller.close();
          return;
        }

        const sliceStart = Math.max(0, start - chunkStart);
        const sliceEnd = Math.min(value.byteLength, end - chunkStart + 1);
        controller.enqueue(value.subarray(sliceStart, sliceEnd));

        if (chunkEnd >= end) {
          await reader.cancel();
          controller.close();
          return;
        }
        return;
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}

async function handleMediaAsset(request, env) {
  const rangeHeader = request.headers.get('range');
  if (!rangeHeader || request.method === 'HEAD') {
    const res = await env.ASSETS.fetch(request);
    const headers = new Headers(res.headers);
    headers.set('accept-ranges', 'bytes');
    return new Response(request.method === 'HEAD' ? null : res.body, {
      status: res.status,
      headers,
    });
  }

  const assetRes = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
  const headers = new Headers(assetRes.headers);
  headers.set('accept-ranges', 'bytes');

  if (!assetRes.ok || !assetRes.body) {
    return new Response(assetRes.body, { status: assetRes.status, headers });
  }

  let total = Number(assetRes.headers.get('content-length') || '0');
  let buffered = null;
  if (!total) {
    buffered = await assetRes.arrayBuffer();
    total = buffered.byteLength;
  }

  if (!total) {
    return new Response(buffered, { status: assetRes.status, headers });
  }

  const range = parseByteRange(rangeHeader, total);
  if (range === 'invalid') {
    if (!buffered) await assetRes.body.cancel();
    headers.set('content-range', `bytes */${total}`);
    headers.delete('content-length');
    return new Response(null, { status: 416, headers });
  }
  if (!range) {
    return new Response(buffered ?? assetRes.body, { status: 200, headers });
  }

  headers.set('content-range', `bytes ${range.start}-${range.end}/${total}`);
  headers.set('content-length', String(range.end - range.start + 1));
  const body = buffered
    ? buffered.slice(range.start, range.end + 1)
    : sliceStream(assetRes.body, range.start, range.end);
  return new Response(body, {
    status: 206,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/telemetry') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: { allow: 'POST, OPTIONS' } });
      }

      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', {
          status: 405,
          headers: { allow: 'POST, OPTIONS' },
        });
      }

      const contentLength = Number(request.headers.get('content-length') || '0');
      if (contentLength > MAX_BODY_BYTES) {
        return new Response('Payload Too Large', { status: 413 });
      }

      let rawText = '';
      try {
        rawText = await request.text();
      } catch {
        return new Response('Bad Request', { status: 400 });
      }

      if (rawText.length > MAX_BODY_BYTES) {
        return new Response('Payload Too Large', { status: 413 });
      }

      let payload;
      try {
        payload = JSON.parse(rawText);
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }

      const events = Array.isArray(payload?.events)
        ? payload.events.slice(0, MAX_EVENTS_PER_BATCH)
        : [];
      const ts = new Date().toISOString();
      const country = request.cf?.country ?? null;
      const city = request.cf?.city ?? null;
      const userAgent = cleanString(request.headers.get('user-agent') || '', 120) ?? null;

      for (const rawEvent of events) {
        const event = sanitizeEvent(rawEvent);
        if (!event || typeof event.type !== 'string') continue;
        console.log(
          JSON.stringify({
            service: 'mericasaner-telemetry',
            timestamp: ts,
            country,
            city,
            userAgent,
            event,
          }),
        );
      }

      return new Response(null, {
        status: 204,
        headers: { 'cache-control': 'no-store' },
      });
    }

    if (
      url.pathname.startsWith('/media/') &&
      (request.method === 'GET' || request.method === 'HEAD')
    ) {
      return handleMediaAsset(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

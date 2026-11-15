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

    return env.ASSETS.fetch(request);
  },
};

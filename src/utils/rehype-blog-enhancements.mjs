/**
 * Sätteri HAST plugin that enhances Markdown code blocks and tables at build time:
 * - Wraps <table> elements in a scrollable, accessible .table-wrapper region and
 *   annotates <td> cells with data-label attributes for responsive stacked mobile cards.
 * - Wraps <pre> blocks in .code-frame + .copyable with Invoker Commands copy buttons
 *   (command="--copy" commandfor="...") and a sibling role="status" live region.
 */

function svgEl(tagName, properties, children = []) {
  return { type: 'element', tagName, properties, children };
}

function getCodeLanguage(preNode) {
  const props = preNode.properties || {};
  const dataLang = props['data-language'] || props.dataLanguage;
  if (typeof dataLang === 'string' && dataLang.trim()) {
    return dataLang.trim();
  }
  const codeNode = (preNode.children || []).find(
    (child) => child.type === 'element' && child.tagName === 'code',
  );
  const classes = codeNode?.properties?.className;
  if (Array.isArray(classes)) {
    const match = classes.find((c) => typeof c === 'string' && c.startsWith('language-'));
    if (match) return match.replace('language-', '');
  }
  return 'code';
}

function buildCodeFrame(preNode, index) {
  const lang = getCodeLanguage(preNode);
  const snippetId = `code-snippet-${index}`;
  const props = preNode.properties || {};
  const hasTabIndex = props.tabindex != null || props.tabIndex != null;
  const updatedPre = {
    ...preNode,
    properties: {
      ...props,
      id: snippetId,
      ...(hasTabIndex ? {} : { tabIndex: 0 }),
    },
  };

  const copyIcon = svgEl(
    'svg',
    {
      className: ['copy-icon-copy'],
      'aria-hidden': 'true',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [
      svgEl('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
      svgEl('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }),
    ],
  );

  const checkIcon = svgEl(
    'svg',
    {
      className: ['copy-icon-check'],
      'aria-hidden': 'true',
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.2',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
    },
    [svgEl('polyline', { points: '20 6 9 17 4 12' })],
  );

  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['code-frame'] },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-frame-bar'] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['code-lang'] },
            children: [{ type: 'text', value: lang }],
          },
        ],
      },
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['copyable'] },
        children: [
          updatedPre,
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['copy'] },
            children: [
              {
                type: 'element',
                tagName: 'button',
                properties: {
                  type: 'button',
                  className: ['copy-button'],
                  command: '--copy',
                  commandfor: snippetId,
                  'aria-label': `Copy ${lang} code`,
                },
                children: [copyIcon, checkIcon],
              },
              {
                type: 'element',
                tagName: 'span',
                properties: { className: ['tip'], role: 'status' },
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };
}

export default function satteriBlogEnhancements() {
  return () => {
    let codeCount = 0;

    return {
      name: 'satteri-blog-enhancements',
      element: [
        {
          filter: ['pre'],
          visit(node, ctx) {
            codeCount += 1;
            ctx.replaceNode(node, buildCodeFrame(node, codeCount));
          },
        },
        {
          filter: ['table'],
          visit(node, ctx) {
            const children = node.children || [];
            const thead = children.find((c) => c.type === 'element' && c.tagName === 'thead');
            const headerRow = (thead?.children || []).find(
              (c) => c.type === 'element' && c.tagName === 'tr',
            );
            const headers = (headerRow?.children || [])
              .filter((c) => c.type === 'element' && c.tagName === 'th')
              .map((th) => ctx.textContent(th).trim());

            const tbody = children.find((c) => c.type === 'element' && c.tagName === 'tbody');
            if (tbody && headers.length > 0) {
              for (const row of tbody.children || []) {
                if (row.type !== 'element' || row.tagName !== 'tr') continue;
                let cellIndex = 0;
                for (const cell of row.children || []) {
                  if (cell.type !== 'element' || (cell.tagName !== 'td' && cell.tagName !== 'th')) {
                    continue;
                  }
                  if (cell.tagName === 'td' && headers[cellIndex]) {
                    ctx.setProperty(cell, 'data-label', headers[cellIndex]);
                  }
                  cellIndex += 1;
                }
              }
            }

            ctx.wrapNode(node, {
              type: 'element',
              tagName: 'div',
              properties: {
                tabIndex: 0,
                role: 'region',
                'aria-label': 'Data table',
                className: ['table-wrapper'],
              },
              children: [],
            });
          },
        },
      ],
    };
  };
}

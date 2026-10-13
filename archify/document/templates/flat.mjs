// The plain template: one column, no chrome. It is what the renderer produced before there was a
// template layer, kept byte for byte so that introducing the layer changed no artifact.
export const name = 'flat';
export const credit = '';

// 这个设计自己的页面样式。它原来和标注面的样式挤在一个文件里，
// 结果是每个模板都白拿一份 flat 的页面样式。
const STYLE = [
  `body{font:16px/1.75 -apple-system,"Segoe UI",system-ui,"Microsoft YaHei",sans-serif;color:#1a1a1a;max-width:48rem;margin:0 auto;padding:4rem 1.5rem 8rem}`,
  `h1,h2,h3,h4,h5,h6{line-height:1.35;margin:2rem 0 .8rem}`,
  `pre{background:#f6f7f9;border:1px solid #e2e2e2;border-radius:6px;padding:.9rem 1rem;overflow:auto}`,
  `code{font-family:ui-monospace,"Cascadia Code",Consolas,monospace;font-size:.92em}`,
  `:not(pre)>code{background:#f1f2f4;padding:.1em .35em;border-radius:3px}`,
  `table{border-collapse:collapse;width:100%;margin:1rem 0}`,
  `th,td{border:1px solid #e2e2e2;padding:.4rem .7rem;text-align:left}`,
  `blockquote{border-left:3px solid #e2e2e2;margin:1rem 0;padding:.2rem 0 .2rem 1rem;color:#6b6b6b}`,
  `hr{border:0;border-top:1px solid #e2e2e2;margin:2rem 0}`,
].join('\n');

// 这个设计只有一层：一块接一块地排下去。
export const slots = ['page', 'block', 'inline', 'drop'];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

export function page({ html, title, sourceText, map, derived, untouchable, shell }) {
  return [
    '<!doctype html>',
    '<html lang="zh"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + esc(title) + '</title>',
    '<style>' + STYLE + '</style>',

    '</head><body>',
    html,

    '<script id="arc-source" type="text/plain">' + esc(sourceText) + '</script>',
    '<script id="arc-map" type="application/json">' + json(map) + '</script>',
    '<script id="arc-derived" type="application/json">' + json(derived) + '</script>',
    '<script id="arc-untouchable" type="application/json">' + json(untouchable) + '</script>',

    '</body></html>',
  ].join('\n');
}

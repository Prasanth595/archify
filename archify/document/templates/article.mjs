import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 文章版式。页面样式取自 new.css（MIT, xz/new.css）—— 它是给纯语义 HTML 的一份无类设计，
// 接的正是我们本来就产出的那套元素，所以不需要给任何东西加类名。
const here = path.dirname(fileURLToPath(import.meta.url));
const PAGE_CSS = fs.readFileSync(path.join(here, 'newdoc.css'), 'utf8');

export const name = 'article';
export const credit = 'new.css（MIT, xz/new.css）';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = (v) => JSON.stringify(v).replace(/</g, '\u003c');

export const slots = ['page', 'block', 'inline', 'drop'];

// 内容和身份那一串脚本的关系：脚本在最后，正文在前。脚本没有 arc-* 的外壳就只是几行
// 会被排出来的文字 —— 那正是它第一次出来时的样子。
export function page({ html, title, sourceText, map, derived, untouchable, shell }) {
  return [
    '<!doctype html>',
    '<html lang="zh"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + esc(title) + '</title>',
    '<style>' + PAGE_CSS + '</style>',

    '</head><body>',
    '<main>',
    html,
    '</main>',

    '<script id="arc-source" type="text/plain">' + esc(sourceText) + '</script>',
    '<script id="arc-map" type="application/json">' + json(map) + '</script>',
    '<script id="arc-derived" type="application/json">' + json(derived) + '</script>',
    '<script id="arc-untouchable" type="application/json">' + json(untouchable) + '</script>',

    '</body></html>',
  ].join('\n');
}

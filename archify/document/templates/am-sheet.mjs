// A template layer: it decides how the compiler's blocks are laid out, and nothing else.
//
// The design is ported from answer-me-with-html (MIT, Copyright (c) 2026 Answer me with HTML
// contributors): its drawing-board sheet, its panel wrapper and its paper theme. am-base.css is
// copied verbatim -- it references theme variables only and never a hard-coded colour, which is
// what makes the swap a matter of tokens rather than of rewriting style.
//
// This exists to answer one question: can a pre-designed template take our content without the
// compiler or the source map knowing anything about it? Nothing below touches an identity.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slotFor } from './slots.mjs';

export const name = 'am-sheet';
export const credit = 'layout and styles ported from answer-me-with-html (MIT)';

// 这个设计提供五层。表就是说"我们的哪个构造落到它的哪一层"。
export const slots = ['page', 'head', 'panel', 'panelHead', 'panelBody', 'inline', 'drop'];
// 这个设计把块级内容放进面板体里，标题按级别分流：一级是整页题头，二级开一个面板，再往下留在面板里。
export const roles = { block: 'panelBody' };
export const mapping = {
  atxHeading: (b) => (/^<h1\b/.test(b.html) ? 'head' : /^<h2\b/.test(b.html) ? 'panel' : 'panelBody'),
  setextHeading: (b) => (/^<h1\b/.test(b.html) ? 'head' : /^<h2\b/.test(b.html) ? 'panel' : 'panelBody'),
};


const here = path.dirname(fileURLToPath(import.meta.url));
const BASE_CSS = fs.readFileSync(path.join(here, 'am-base.css'), 'utf8');

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", Roboto, "Helvetica Neue", Arial, sans-serif';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const SERIF = '"Iowan Old Style", Palatino, Georgia, "Songti SC", "Noto Serif CJK SC", serif';


const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// am's sheet.js fillRows, kept as it is: when the columns left cannot fit the next panel, widen
// this one to fill the row, leaving no holes.
function fillRows(spans, cols) {
  let used = 0;
  return spans.map((span, i) => {
    if (used + span > cols) used = 0;
    used += span;
    const next = spans[i + 1];
    const fill = next === undefined || used + next > cols ? cols - used : 0;
    used = fill || used === cols ? 0 : used;
    return span + fill;
  });
}

const WIDE_TABLE_COLS = 4;
const TABLE_COLS_PER_SPAN = 2;

// Wide tables do not fit one column: too many columns squeeze Chinese to one character per line.
function minSpan(body, cols) {
  const rows = [...body.matchAll(/<tr\b[\s\S]*?<\/tr>/g)];
  let widest = 0;
  for (const row of rows) widest = Math.max(widest, (row[0].match(/<t[hd]\b/g) || []).length);
  return widest >= WIDE_TABLE_COLS ? Math.min(Math.ceil(widest / TABLE_COLS_PER_SPAN), cols) : 1;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const ruler = (side, labels) => '<div class="am-ruler am-ruler--' + side + '" aria-hidden="true">' + labels.map((l) => '<span>' + l + '</span>').join('') + '</div>';

function panelHtml(p, cols, hintSpan) {
  const span = Math.min(Math.max(1, p.span), cols);
  const style = span > 1 ? ' style="grid-column: span ' + span + '"' : '';
  const data = hintSpan >= 1 ? ' data-span="' + Math.min(hintSpan, cols) + '"' : '';
  // The heading moves into the panel header AS ITS OWN MARKUP. Re-escaping its text would drop the
  // block's data-src, and the heading would stop being annotatable while the map still points at it.
  return '<section class="am-panel" id="panel-' + esc(p.letter) + '"' + style + data + '>' +
    '<header class="am-panel-head"><span class="am-panel-id">' + esc(p.letter) + '</span>' + p.headingHtml + '</header>' +
    '<div class="am-panel-body"><div class="am-md">' + p.body + '</div></div></section>';
}

// Route the block stream through the declared mapping. The table above is the single source of
// truth: routing by hand here is how the headings lost their data-src the first time.
function group(blocks) {
  const intro = [];
  const panels = [];
  let titleBlock = null;
  for (const b of blocks) {
    const slot = slotFor({ mapping }, b);
    if (slot === 'drop') continue;
    if (slot === 'head') { titleBlock = b.html; continue; }
    if (slot === 'panel') { panels.push({ letter: LETTERS[panels.length] || '?', headingHtml: b.html, blocks: [] }); continue; }
    if (panels.length) panels[panels.length - 1].blocks.push(b);
    else intro.push(b);
  }
  return { intro, panels, titleBlock };
}

export function page(ctx) {
  const { blocks, title, sourceText, map, derived, untouchable, options = {} } = ctx;
  // am's sheet assumes its own content: WIDE_TABLE_COLS = 4 means a three-column table is held to
  // fit one column of three, which is fine for short table cells and not for dense Chinese. The
  // grid width is the one number that has to follow the content, so it is an option.
  const cols = Math.max(1, Math.min(Number(options.cols) || 3, 12));
  const { intro, panels, titleBlock } = group(blocks);
  const sized = panels.map((p) => {
    const body = p.blocks.map((b) => b.html).join('\n');
    return { ...p, body, span: minSpan(body, cols) };
  });
  const spans = fillRows(sized.map((p) => p.span), cols);
  const placed = sized.map((p, i) => ({ ...p, span: spans[i] }));
  const nums = ['1','2','3','4','5','6','7','8'];
  const head = '<div class="am-head">' + (titleBlock || '<h1>' + esc(title) + '</h1>') +
    (intro.length ? '<div class="am-intro">' + intro.map((b) => b.html).join('\n') + '</div>' : '') + '</div>';
  return [
    '<!doctype html>',
    '<html lang="zh" data-theme="paper" data-mode="auto">',
    '<head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + esc(title) + '</title>',
    '<style>' + BASE_CSS + '</style>',

    '</head><body>',
    '<main class="am-sheet">',
    head,
    '<div class="am-frame">',
    ruler('top', nums) + ruler('bottom', nums) + ruler('left', ['A','B','C','D']) + ruler('right', ['A','B','C','D']),
    '<div class="am-grid" style="--cols: ' + cols + '">',
    placed.map((p, i) => panelHtml(p, cols, panels[i].span)).join('\n'),
    '</div></div></main>',

    '<script id="arc-source" type="text/plain">' + esc(sourceText) + '</script>',
    '<script id="arc-map" type="application/json">' + JSON.stringify(map).replace(/</g, '\\u003c') + '</script>',
    '<script id="arc-derived" type="application/json">' + JSON.stringify(derived).replace(/</g, '\\u003c') + '</script>',
    '<script id="arc-untouchable" type="application/json">' + JSON.stringify(untouchable).replace(/</g, '\\u003c') + '</script>',

    '</body></html>',
  ].join('\n');
}

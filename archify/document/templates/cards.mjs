// 一个结构变换：把 Markdown 表格排成指标卡。
//
// 与 flat / am-sheet 不同的地方在于，它改的不是样式，是**结构** —— 一张三行两列的表
// 变成两张卡片。表格的块级锚在这里不够用：卡片上的数值要回到它自己那一格，
// 所以每个单元格带着自己的行列出场，而不是靠块内偏移。
import { slotFor } from './slots.mjs';

export const name = 'cards';
export const credit = '';

export const slots = ['page', 'card', 'block', 'inline', 'drop'];
// 这个设计只做一件事：把表格拆成卡片。其余全走默认。
export const mapping = { table: 'card' };


export const accepts = { card: ['label', 'value'] };

// 表头不要，数据行每行一张卡。label 取第 0 列，value 取第 1 列 —— 这是这个设计的约定，
// 而约定写在表里，不藏在渲染代码里。
export const binds = [{
  slot: 'card',
  construct: 'table',
  fill: (block) => (block.cells || []).slice(1).map((row, index) => ({
    label: row[0] ? row[0].text : '',
    value: row[1] ? row[1].text : '',
    labelCell: [index + 1, 0],
    valueCell: [index + 1, 1],
  })),
}];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// 网格子项默认 min-width:auto，长内容会把格子顶宽、再把整页顶出横向滚动。
// 长值使用正文尺寸，避免撑宽卡片。
const STYLE = [
  'body{font:16px/1.7 -apple-system,"Segoe UI",system-ui,"Microsoft YaHei",sans-serif;color:#1a1a1a;max-width:52rem;margin:3rem auto;padding:0 1.5rem 8rem;overflow-wrap:anywhere}',
  '.card-board{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:1rem;margin:1.5rem 0}',
  '.card-board>*{min-width:0}',
  '.metric-card{border:1px solid #e2e2e2;border-radius:12px;padding:1.1rem 1.2rem;background:#fff;min-width:0}',
  '.card-label{display:block;font-size:.85rem;color:#6b6b6b;overflow-wrap:anywhere}',
  '.card-value{display:block;font-size:2rem;line-height:1.2;font-weight:650;margin-top:.2rem;overflow-wrap:anywhere}',
  '.card-value--long{font-size:1rem;line-height:1.5;font-weight:500}',
  'pre{background:#f6f7f9;border:1px solid #e2e2e2;border-radius:6px;padding:.9rem 1rem;overflow:auto}',
  'table{border-collapse:collapse}th,td{border:1px solid #e2e2e2;padding:.4rem .7rem}',
].join('\n');

// 长的值降级成正文尺寸：这个设计的"大数字"位置假定值短，长值放进去会把卡片撑破。
// 阈值写在这里，和映射表一样是设计自己的约定。
const VALUE_IS_SHORT = 24;

function cardHtml(entry) {
  const p = entry.part;
  const long = p.value.length > VALUE_IS_SHORT;
  return '<div class="metric-card">' +
    '<span class="card-label" data-src="' + esc(entry.at) + '" data-cell="' + p.labelCell.join(',') + '">' + esc(p.label) + '</span>' +
    '<strong class="card-value' + (long ? ' card-value--long' : '') + '" data-src="' + esc(entry.at) + '" data-cell="' + p.valueCell.join(',') + '">' + esc(p.value) + '</strong>' +
    '</div>';
}

export function page(ctx) {
  const { join, blocks, title, sourceText, map, derived, untouchable, shell } = ctx;
  // 按接合结果的顺序走，卡片就落在原来表格的位置上。
  const body = join.filled.map((entry) => (entry.slot === 'card' ? cardHtml(entry) : entry.html));
  // 相邻的卡片并到一个板里。
  const flow = [];
  for (const piece of body) {
    const isCard = piece.startsWith('<div class="metric-card">');
    const last = flow[flow.length - 1];
    if (isCard && last && last.cards) last.cards.push(piece);
    else if (isCard) flow.push({ cards: [piece] });
    else flow.push({ html: piece });
  }
  const rendered = flow.map((group) => (group.cards ? '<div class="card-board">' + group.cards.join('') + '</div>' : group.html));

  return [
    '<!doctype html>',
    '<html lang="zh"><head><meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<title>' + esc(title) + '</title>',
    '<style>' + STYLE + '</style>',

    '</head><body>',
    rendered.join('\n'),

    '<script id="arc-source" type="text/plain">' + esc(sourceText) + '</script>',
    '<script id="arc-map" type="application/json">' + json(map) + '</script>',
    '<script id="arc-derived" type="application/json">' + json(derived) + '</script>',
    '<script id="arc-untouchable" type="application/json">' + json(untouchable) + '</script>',

    '</body></html>',
  ].join('\n');
}

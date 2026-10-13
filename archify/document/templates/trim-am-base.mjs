// 把 am 的 base.css 修剪成我们接得进来的那一份。
//
// 接设计的时候容易连它的界面控件一起接进来 —— 那些 class 我们从不产出，规则是死的。
// 清单只列**控件**：版面骨架（.am-sheet/.am-frame/.am-ruler/.am-grid/.am-panel/.am-head）
// 我们是真的产出的，不能删。
//
// 用法：node trim-am-base.mjs <am 仓库的 src/themes/base.css> <目标 am-base.css>
import fs from 'node:fs';

const CONTROLS = ['am-toolbar', 'am-btn', 'am-pick', 'am-comment', 'am-theme', 'am-toast', 'am-viewer'];

const [source, target] = process.argv.slice(2);
const css = fs.readFileSync(source, 'utf8');
let removed = 0;
const trimmed = css.replace(/(^|\})([^{}@]+)\{[^{}]*\}/g, (whole, lead, selector) => {
  if (CONTROLS.some((cls) => selector.includes('.' + cls))) { removed++; return lead; }
  return whole;
});
const header = '/* 取自 answer-me-with-html 的 themes/base.css（MIT）。\n'
  + '   去掉的是它界面控件的规则：' + CONTROLS.join(' ') + '。共 ' + removed + ' 条，'
  + css.length + ' → ' + trimmed.length + ' 字节。\n'
  + '   版面骨架的类名（am-sheet / am-frame / am-ruler / am-grid / am-panel / am-head / am-md）保留 —— 那些是我们真的产出的。\n'
  + '   重新生成：node trim-am-base.mjs <上游 base.css> am-base.css */\n';
fs.writeFileSync(target, header + trimmed);
console.log('  去掉 ' + removed + ' 条控件规则，' + css.length + ' → ' + (header.length + trimmed.length) + ' 字节');

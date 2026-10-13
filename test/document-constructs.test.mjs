import test from 'node:test';
import assert from 'node:assert/strict';
import { compile, TABLE } from '../archify/document/compile.mjs';

// 逐个构造的回程检查：给一段最小源稿，锚切出来必须正好是那一段。
//
// 锚覆盖检查只问"有没有锚"，不问"锚对不对" —— 所以它漏掉了这几类。这一条补上那一面。
const BLOCK = [
  ['atxHeading', '# 甲\n', (s) => s === '# 甲'],
  ['setextHeading', '甲\n===\n', (s) => s === '甲\n==='],
  ['thematicBreak', '---\n', (s) => s === '---'],
  ['fencedCode', '```js\nconst a = 1;\n```\n', (s) => s.startsWith('```js') && s.endsWith('```')],
  ['indentedCode', '    甲\n', (s) => s.includes('甲')],
  ['blockQuote', '> 甲\n', (s) => s === '> 甲'],
  ['listItem', '- 甲\n', (s) => s === '- 甲'],
  ['table', '| a | b |\n| - | - |\n| 1 | 2 |\n', (s) => s.startsWith('| a') && s.includes('| 1 | 2 |')],
  ['htmlBlock', '<div>甲</div>\n', (s) => s.includes('<div>甲</div>')],
  ['paragraph', '甲。\n', (s) => s === '甲。'],
];

const INLINE = [
  ['codeSpan', '甲 `x` 乙\n', '`x`'],
  ['emph', '甲 *x* 乙\n', '*x*'],
  ['strong', '甲 **x** 乙\n', '**x**'],
  ['link', '甲 [x](u) 乙\n', '[x](u)'],
  ['autolink', '甲 <https://e.com> 乙\n', '<https://e.com>'],
  ['image', '甲 ![a](u) 乙\n', '![a](u)'],
  ['entity', '甲 &amp; 乙\n', '&amp;'],
  ['escape', '甲 \\* 乙\n', '\\*'],
  ['rawHtml', '甲 <b>x</b> 乙\n', '<b>'],
  ['hardBreak', '甲  \n乙\n', '  \n'],
  ['softBreak', '甲\n乙\n', '\n'],
];

test('every block construct anchors the source range it came from', () => {
  for (const [name, source, good] of BLOCK) {
    const entry = Object.values(compile(source).map).find((e) => e.construct === name);
    assert.ok(entry, name + ' 没有产出锚');
    const slice = source.slice(entry.start, entry.end);
    assert.ok(good(slice), name + ' 的锚切出 ' + JSON.stringify(slice));
  }
});

test('every inline construct anchors the source range it came from', () => {
  // 守的是表自己的声明：required 的必须有锚，optional 的有就用、没有也不算错。
  // 拿"我想每个都有锚"去要求它，测的是我的期望，不是编译器。
  for (const [name, source, want] of INLINE) {
    const anchors = Object.values(compile(source).map).flatMap((e) => (e.inline || []).filter((a) => a.construct === name));
    if (!anchors.length) {
      // 没有锚只可能是表里允许 —— 判的是表的声明，不是我的期望。
      assert.equal(TABLE[name].anchor, 'optional', name + ' 声明要锚，编译器却没给');
      continue;
    }
    const slice = source.slice(anchors[0].start, anchors[0].end);
    assert.equal(slice, want, name + ' 的锚切出 ' + JSON.stringify(slice));
  }
});

test('a construct that takes no position is tracked instead of anchored', () => {
  // 两种：引用定义完全不产出，注释产出但不出现在展示位置上。
  // 相同的是都不该有身份 —— 没有位置可标注，却有身份，就等于给了读者一个点不到的东西。
  for (const [construct, source] of [['refDef', '[a]: u\n\n甲。\n'], ['htmlComment', '甲。\n\n<!-- 注 -->\n']]) {
    const { map, untouchable, html } = compile(source);
    assert.ok(!Object.values(map).some((e) => e.construct === construct), construct + ' 不该有身份');
    assert.ok(untouchable.some((u) => u.construct === construct), construct + ' 该进不可标注的跨度');
    assert.ok(!/<[^>]*data-src[^>]*>\s*$/.test(html), construct + ' 结尾不该多出一个带身份的块');
  }
});

test('every construct the table declares is reachable, so the coverage check can see it', () => {
  // 声明了却从不报的构造，锚覆盖检查是看不见的 —— plainText 就这样漏了很久。
  const reachable = new Set();
  for (const [, source] of [...BLOCK, ...INLINE]) for (const c of Object.keys(compile(source).used)) reachable.add(c);
  // 这两个不产出位置，不在 BLOCK/INLINE 的语料里，单独记上。
  reachable.add('refDef');
  reachable.add('htmlComment');
  const unreachable = Object.keys(TABLE).filter((c) => !reachable.has(c));
  assert.deepEqual(unreachable, [], '这些构造声明了但从未报出：' + unreachable.join('、'));
});

test('a table cell range survives an escaped pipe and a pipe inside code', () => {
  // 切错的后果不是渲染难看，是锚指向别的地方。
  for (const [source, want] of [
    ['| a \\| b | c |\n| - | - |\n| 1 | 2 |\n', ['a \\| b', 'c']],
    ['| a | `x|y` |\n| - | - |\n| 1 | 2 |\n', ['a', '`x|y`']],
  ]) {
    const table = Object.values(compile(source).map).find((e) => e.construct === 'table');
    assert.deepEqual(table.cells[0].map((c) => source.slice(c.start, c.end)), want);
  }
});

// 已知还不完整的地方。列在这里不是认可它们，是**记名**：
// 谁被修好了，这条就会失败，提醒把名字划掉。
const KNOWN_INCOMPLETE = [
  ['nested blockquote', '> 外层\n> > 内层\n', () => Object.values(compile('> 外层\n> > 内层\n').map).filter((e) => e.construct === 'blockQuote').length === 1],
  ['deeper list nesting', '- a\n  - b\n    - c\n', () => (compile('- a\n  - b\n    - c\n').html.match(/<li>/g) || []).length === 3],
  ['nested emphasis', '*a **b** c*\n', () => compile('*a **b** c*\n').html.includes('<em>a </em>')],
  ['intraword underscore', 'a_b_c\n', () => compile('a_b_c\n').html.includes('<em>')],
  ['three asterisks', '***x***\n', () => compile('***x***\n').html.includes('<strong>*x</strong>')],
];

test('the constructs known to still be incomplete are exactly these', () => {
  const stillWrong = KNOWN_INCOMPLETE.filter(([, , wrong]) => wrong()).map(([name]) => name);
  assert.deepEqual(stillWrong, KNOWN_INCOMPLETE.map(([name]) => name),
    '有构造被修好了，把它从 KNOWN_INCOMPLETE 里划掉');
});

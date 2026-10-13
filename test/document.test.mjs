import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile, materialize, TABLE } from '../archify/document/compile.mjs';
import { buildExample, TEMPLATE_NAMES, TEMPLATES } from '../archify/document/templates/examples.mjs';
import { checkMapping, connect } from '../archify/document/templates/slots.mjs';
import { resolve, patch, readArtifact } from '../archify/document/resolve.mjs';

const skillRoot = fileURLToPath(new URL('../archify/', import.meta.url));
const cli = path.join(skillRoot, 'bin/archify.mjs');

const EMPHASIS = '星号强调 *甲* 与下划线强调 _乙_。\n\n双星加粗 **丙** 与双下划线加粗 __丁__。\n';

function blocks(document, construct) {
  return Object.entries(document.map).filter(([, entry]) => entry.construct === construct);
}

test('the CLI renders a Markdown document into an artifact', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-document-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'draft.md');
  const output = path.join(directory, 'draft.html');
  fs.writeFileSync(input, EMPHASIS);
  const result = spawnSync(process.execPath, [cli, 'document', input, output], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const html = fs.readFileSync(output, 'utf8');
  assert.match(html, /<em>甲<\/em>/);
  assert.match(html, /<strong>丙<\/strong>/);
  assert.doesNotMatch(html, /data-src=|id="arc-source"|id="arc-map"/);
});

test('a generated design example retains the source ranges used by inspection tools', () => {
  const { page, map } = buildExample(EMPHASIS, { title: 'draft' });
  const back = readArtifact(page);
  assert.equal(back.source, EMPHASIS);
  assert.deepEqual(back.map, map);
  for (const entry of Object.values(back.map)) assert.equal(typeof entry.textBase, 'number');
});

test('every construct the table marks required carries an anchor', () => {
  for (const source of [EMPHASIS, '# 标题\n\n> 引用\n\n- 项\n\n```js\nconst a = 1;\n```\n\n---\n', '[孤立]: https://example.com/only\n']) {
    const { map, used } = compile(source);
    const blockCovered = new Set(Object.values(map).filter((entry) => TABLE[entry.construct]?.block).map((entry) => entry.construct));
    const inlineCovered = new Set(Object.values(map).flatMap((entry) => (entry.inline || []).map((anchor) => anchor.construct)));
    for (const construct of Object.keys(used)) {
      const row = TABLE[construct];
      if (row.anchor !== 'required') continue;
      assert.ok(row.block ? blockCovered.has(construct) : inlineCovered.has(construct), `${construct} is required but carries no anchor`);
    }
  }
});

test('a mark resolves back to the exact source range', () => {
  const { map } = buildExample(EMPHASIS);
  const [paragraph] = blocks({ map }, 'paragraph');
  const id = paragraph[0];

  const whole = resolve(map, { src: id, at: null });
  assert.equal(EMPHASIS.slice(whole.start, whole.end), '星号强调 *甲* 与下划线强调 _乙_。');

  // rendered text is 星号强调 甲 与下划线强调 乙。 — offset 5 is the emphasis, 9 is a plain character
  const emphasis = resolve(map, { src: id, at: 5, len: 1 });
  assert.equal(EMPHASIS.slice(emphasis.start, emphasis.end), '*甲*');
  assert.equal(emphasis.span, 'inline');

  const underline = resolve(map, { src: id, at: 14, len: 1 });
  assert.equal(EMPHASIS.slice(underline.start, underline.end), '_乙_');

  const plain = resolve(map, { src: id, at: 9, len: 1 });
  assert.equal(EMPHASIS.slice(plain.start, plain.end), '划');
  assert.equal(plain.span, 'text');
});

test('the minimal edit changes that range and nothing else', () => {
  const { page, map } = buildExample(EMPHASIS);
  const [paragraph] = blocks({ map }, 'paragraph');
  const range = resolve(map, { src: paragraph[0], at: 5, len: 1 });
  const edited = patch(EMPHASIS, range, '**甲**');
  assert.equal(edited.slice(0, range.start), EMPHASIS.slice(0, range.start));
  assert.equal(edited.slice(range.start + 5), EMPHASIS.slice(range.end));

  const after = buildExample(edited);
  assert.equal(readArtifact(page).source, EMPHASIS);
  assert.notEqual(after.page, page, 'the artifact did change');
  // the spelling changed, the reading did not
  assert.match(after.html, /<strong>甲<\/strong>/);
});

test('materialised identities stop moving when the content moves', () => {
  const { derived } = compile(EMPHASIS);
  assert.ok(derived.length > 0, 'a draft with no {#id} derives identities');
  const materialised = materialize(EMPHASIS, derived);
  assert.equal(materialised.inserted, derived.length);

  const authored = compile(materialised.source);
  assert.equal(authored.derived.length, 0, 'written in, they are the author\'s');

  const before = Object.keys(authored.map).sort();
  const reworded = compile(materialised.source.replace('丙', '戊'));
  assert.deepEqual(Object.keys(reworded.map).sort(), before, 'rewording moves no identity');
});

test('every example template keeps the identities used by inspection tools', () => {
  // The one thing a template is not allowed to do. A template decides layout; it must move a block's
  // markup, never re-escape its text. Re-escaping drops the block's data-src, and the heading stops
  // being annotatable while the source map still points at it — which no other check notices,
  // because the map is the compiler's and the page is the template's.
  const source = [
    '# 标题', '', '引言段落。', '', '---', '',
    '## 第一节', '', '正文 *强调*。', '',
    '| 甲 | 乙 |', '| --- | --- |', '| 1 | 2 |', '',
    '## 第二节', '', '```js', 'const a = 1;', '```', '',
  ].join('\n');
  for (const template of TEMPLATE_NAMES) {
    const { page, map } = buildExample(source, { title: '标题', template });
    for (const id of Object.keys(map)) {
      assert.ok(page.includes('data-src="' + id + '"'), `template ${template} dropped ${id}`);
    }
  }
});

test('every example template declares where every construct goes', () => {
  // The second mapping layer: which of a design's containers each construct lands in. A design
  // connects when the table is complete, and a missing row is a failure rather than a silently
  // dropped heading.
  for (const name of TEMPLATE_NAMES) {
    const problems = checkMapping(TEMPLATES[name], TABLE);
    assert.deepEqual(problems, [], 'template ' + name + ': ' + problems.join('; '));
  }
});

// 从表格块里读出行，供下面的接合用。
function tableRows(html) {
  return [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)]
    .map((row) => [...row[0].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) => cell[1].replace(/<[^>]+>/g, '').trim()))
    .filter((cells) => cells.length);
}

const SCORECARD = '# 模型性能比较\n\n| 模型 | 准确率 |\n| --- | --- |\n| A | 80% |\n| B | 92% |\n';

// 两种设计：一种只要名称和数值，一种还要求同比增长率。
const scorecardDesign = (needs) => ({
  name: 'scorecard',
  slots: ['page', 'head', 'card', 'block', 'inline', 'drop'],
  accepts: { card: needs },
  mapping: { atxHeading: (b) => (/^<h1\b/.test(b.html) ? 'head' : 'block'), paragraph: 'block', table: 'card' },
  binds: [{
    slot: 'card',
    construct: 'table',
    fill: (block) => tableRows(block.html).slice(1).map(([label, value]) => ({ label, value })),
  }],
});

test('a slot asking for a field the content does not carry reports a residual', () => {
  const blocks = compile(SCORECARD).blocks;
  const { filled, unmet } = connect(scorecardDesign(['label', 'value', 'growth']), blocks);
  // 缺一个字段，两张卡片就都渲染不出来 —— 不能拿空值顶上，那和"增长率是 0"读起来一样。
  assert.equal(filled.filter((entry) => entry.slot === 'card').length, 0);
  assert.deepEqual(unmet.map((entry) => entry.missing), [['growth'], ['growth']]);
  // 但已经拿到的内容要一起报出来，调用方才有得选。
  assert.deepEqual(unmet.map((entry) => entry.got), [
    { label: 'A', value: '80%' },
    { label: 'B', value: '92%' },
  ]);
  assert.equal(unmet[0].construct, 'table');
});

test('a variant that does not ask for the missing field fills completely', () => {
  const blocks = compile(SCORECARD).blocks;
  const { filled, unmet } = connect(scorecardDesign(['label', 'value']), blocks);
  assert.deepEqual(unmet, []);
  assert.deepEqual(filled.filter((entry) => entry.slot === 'card').map((entry) => entry.part), [
    { label: 'A', value: '80%' },
    { label: 'B', value: '92%' },
  ]);
});

const SCORES = '| 模型 | 准确率 |\n| --- | --- |\n| A | 80% |\n| B | 92% |\n';

test('a table rendered as cards leads back to the same source as the table itself', () => {
  // 这一条比"布局变了映射不变"更强：变的是**结构**。一张三行两列的表排成两张卡片，
  // 读者在卡片上点 92%，要回到源稿里那个 92%。
  const asTable = buildExample(SCORES, { template: 'flat' });
  const asCards = buildExample(SCORES, { template: 'cards' });
  assert.notEqual(asTable.page, asCards.page, '两份产物不同');
  assert.match(asCards.page, /class="metric-card"/, '确实排成了卡片');

  const tableId = Object.keys(asTable.map).find((id) => asTable.map[id].construct === 'table');
  assert.ok(tableId, '表格有身份');
  // 表格那一列一格，和卡片那一张，指的是同一个位置：第 2 行第 1 列（跳过表头）。
  const fromTable = resolve(asTable.map, { src: tableId, cell: [2, 1] });
  assert.equal(SCORES.slice(fromTable.start, fromTable.end), '92%');

  // 卡片自己带着这个引用，从产物里读出来 —— 不是我在测试里替它算的。
  const carried = /data-src="([^"]+)" data-cell="([^"]+)">92%/.exec(asCards.page);
  assert.ok(carried, '卡片上带着自己的行列引用');
  const fromCard = resolve(asCards.map, { src: carried[1], cell: carried[2].split(',').map(Number) });
  assert.equal(SCORES.slice(fromCard.start, fromCard.end), '92%');

  assert.deepEqual(fromCard, fromTable, '两个视图回到的是同一段源稿');
  // 两份产物里的映射是同一张表。
  assert.deepEqual(asCards.map, asTable.map);
});

test('the two views still disagree about nothing else', () => {
  const asTable = buildExample(SCORES, { template: 'flat' });
  const asCards = buildExample(SCORES, { template: 'cards' });
  assert.equal(Object.keys(asTable.map).length, Object.keys(asCards.map).length);
  const tableId = Object.keys(asTable.map).find((id) => asTable.map[id].construct === 'table');
  assert.deepEqual(asCards.map[tableId].cells, asTable.map[tableId].cells);
});

test('no emitted piece leaks a scalar into the content', () => {
  // Emitters with an expression body return Array.push's new length, so writing
  // html.push(target(...)) used to push that number into the page — a stray "11" sat between a
  // rule and the next heading. Every check we had was self-consistent and missed it; this one is
  // not, because it looks at the output itself.
  const source = [
    '# 标题', '', '段落。', '', '---', '', '> 引用', '',
    '- 项一', '- 项二', '', '1. 有序', '',
    '```js', 'const a = 1;', '```', '',
    '    缩进代码', '', '| 甲 | 乙 |', '| --- | --- |', '| 1 | 2 |', '',
    '<div>html 块</div>', '', '另一个段落 *强调* 与 \`代码\`。', '',
  ].join('\n');
  const { html } = compile(source);
  assert.ok(!html.includes('undefined'), 'no undefined leaked into the content');
  for (const line of html.split('\n')) {
    assert.ok(!/^\s*\d+\s*$/.test(line), `a bare number reached the content: ${JSON.stringify(line)}`);
  }
});

test('a construct that emits nothing is not annotatable but is tracked', () => {
  const source = '[孤立]: https://example.com/only\n\n段落。\n';
  const { map, untouchable } = compile(source);
  assert.equal(untouchable.filter((entry) => entry.construct === 'refDef').length, 1);
  assert.ok(!Object.values(map).some((entry) => entry.construct === 'refDef'), 'no rendered position, so no identity');
});

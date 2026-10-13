import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDesign, usage, bindingFor, isLegal } from '../archify/document/design.mjs';
import { compile } from '../archify/document/compile.mjs';
import { connect } from '../archify/document/templates/slots.mjs';

const designs = fileURLToPath(new URL('./fixtures/designs/', import.meta.url));
const read = (name) => readDesign(fs.readFileSync(path.join(designs, name), 'utf8'));

const TABLE = '# 模型性能比较\n\n| 模型 | 准确率 |\n| --- | --- |\n| A | 80% |\n| B | 92% |\n';
const blocks = compile(TABLE).blocks;

const rows = (html) => [...html.matchAll(/<tr\b[\s\S]*?<\/tr>/g)]
  .map((r) => [...r[0].matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => c[1].replace(/<[^>]+>/g, '').trim()))
  .filter((c) => c.length).slice(1);

const scorecard = (name, fields) => ({
  name,
  slots: ['card', 'block'],
  accepts: { card: fields },
  mapping: { table: 'card', paragraph: 'block' },
  binds: [{ slot: 'card', construct: 'table', fill: (b) => rows(b.html).map(([label, value]) => ({ label, value })) }],
});

const fill = (name, fields) => connect(scorecard(name, fields), blocks);

test('what a design requires is read from its markup, not declared by hand', () => {
  assert.deepEqual(read('card-growth.html').requires, ['growth', 'label', 'value']);
  assert.deepEqual(read('card-plain.html').requires, ['label', 'value']);
  assert.deepEqual(read('card-note.html').requires, ['label', 'note', 'value']);
});

test('the shape of a placeholder narrows what a position can hold', () => {
  const byClass = Object.fromEntries(read('card-growth.html').positions.map((p) => [p.classes[0], p]));
  assert.equal(byClass.value.shape, 'number');
  assert.equal(byClass.growth.shape, 'signed-number');
  assert.equal(byClass.label.shape, 'word');
});

test('a named position holds its role and nothing else', () => {
  // 名字钉住角色，形状只收窄候选。growth 位置渲染出来是一小段文字，但它不能拿来放来源说明 ——
  // 放进去不会报错，只会静默读错。
  const growth = read('card-growth.html').positions.find((p) => p.requires === 'growth');
  assert.deepEqual(growth.admits, ['growth']);
});

test('a template that asks for a field the table does not carry leaves a residual', () => {
  const design = read('card-growth.html');
  const { filled, unmet } = fill('card-growth.html', design.requires);
  assert.equal(filled.filter((e) => e.slot === 'card').length, 0);
  assert.deepEqual(unmet.map((e) => e.missing), [['growth'], ['growth']]);
  // 已经拿到的内容一起报出来，调用方才有得选。
  assert.deepEqual(unmet.map((e) => e.got), [{ label: 'A', value: '80%' }, { label: 'B', value: '92%' }]);
});

test('a template that asks only for what the table carries fills completely', () => {
  const { filled, unmet } = fill('card-plain.html', read('card-plain.html').requires);
  assert.deepEqual(unmet, []);
  assert.deepEqual(filled.filter((e) => e.slot === 'card').map((e) => e.part), [
    { label: 'A', value: '80%' },
    { label: 'B', value: '92%' },
  ]);
});

test('a position with no name yields a relation and a residual, not a guess', () => {
  const design = read('card-open.html');
  assert.equal(design.undetermined.length, 1);
  assert.equal(design.undetermined[0].path, design.positions[2].path);
  assert.deepEqual(design.undetermined[0].admits, ['label', 'source', 'note']);
  // 关系，不是铺开的表：报关系多大，不铺出来。
  assert.equal(design.capacity, 4); // 三个角色加"空着"
  assert.equal(design.candidates, undefined, '不铺开');
  assert.deepEqual(design.open.map((p) => p.admits), [['label', 'source', 'note']]);
});

test('the relation answers by lookup, and a huge one costs the same', () => {
  // 十二个未命名位置是 7^12，两百个是 7^200。铺开的话后者有一百七十位，
  // 而这里回答一次查找和一次判定就够。
  const many = '<div>' + Array.from({ length: 200 }, (_, i) => '<span>x' + i + '</span>').join('') + '</div>';
  const t0 = Date.now();
  const design = readDesign(many);
  assert.ok(design.capacity > 1e100, '关系规模巨大');
  const binding = bindingFor(design, ['label', 'value']);
  assert.ok(binding, '照样找得到一个接法');
  assert.ok(isLegal(design, binding.assign).ok);
  assert.ok(Date.now() - t0 < 1000, '而且很快');
});

test('the interpretation protocol is declared rather than taken from HTML', () => {
  // class 本来是样式标识，没有语义权威。命名有约束力是协议声明的结果。
  assert.equal(read('card-growth.html').protocol.name, 'class-and-data-role');
  assert.match(read('card-growth.html').protocol.description, /命名优先于形状/);
});

test('two bindings with the same fields differ in which positions they use', () => {
  // 「第三个位置空着」和「第三个位置也当 label」字段集合一样，是两种接法。
  // 少了分配，usage 会把空着的位置报成用上了。
  const design = read('card-open.html');
  const spare = { assign: { [design.positions[2].path]: null }, fields: ['label', 'value'] };
  const used = { assign: { [design.positions[2].path]: 'label' }, fields: ['label', 'value'] };
  assert.deepEqual([usage(design, spare).taken, usage(design, used).taken], [2, 3]);
  assert.equal(usage(design, spare).declined.length, 1);
  assert.ok(isLegal(design, spare.assign).ok);
  assert.ok(isLegal(design, used.assign).ok);
});

test('a binding that puts a role where it does not belong is rejected', () => {
  // 名字钉住角色：把 source 塞进 .growth 那个位置，看起来是一小段文字，但读出来是错的。
  const design = read('card-growth.html');
  assert.equal(isLegal(design, { [design.positions[2].path]: 'source' }).ok, false);
  assert.equal(bindingFor(design, ['label', 'value']), null, '硬要求没被满足就找不到接法');
});

test('each binding can be run, and reports both its data residual and its spare positions', () => {
  const design = read('card-open.html');
  const seen = [];
  for (const role of [...design.open[0].admits, null]) {
    const assign = { [design.positions[2].path]: role };
    const fields = [...new Set([...design.requires, ...(role ? [role] : [])])].sort();
    const { unmet } = fill('card-open.html', fields);
    const u = usage(design, { assign });
    seen.push(fields.join('+') + ' → 残差 ' + ([...new Set(unmet.flatMap((e) => e.missing))].join('+') || '无') +
      '，位置 ' + u.taken + '/' + u.offered);
  }
  // 两条都没有数据残差，靠位置那一栏才分得开 —— 无残差不等于最佳。
  assert.deepEqual(seen.sort(), [
    'label+source+value → 残差 source，位置 3/3',
    'label+note+value → 残差 note，位置 3/3',
    'label+value → 残差 无，位置 2/3',
    'label+value → 残差 无，位置 3/3',
  ].sort());
});

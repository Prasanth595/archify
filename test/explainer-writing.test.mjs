import test from 'node:test';
import assert from 'node:assert/strict';
import {lintExplainerWriting} from '../archify/explainer/writing.mjs';
const entry = (text, extra = {}) => ({text, line: 1, component: 'prose', ...extra});

test('writing: independently authored hints give concrete repairs without failing by default', () => {
  const result = lintExplainerWriting([
    entry('Perform an analysis of the cache. At the end of the day, many users need each and every result.'),
  ]);
  assert.deepEqual(new Set(result.map(d => d.evidence.rule)), new Set(['light-verb', 'cliche', 'vague-quantity', 'redundancy']));
  assert.ok(result.every(d => d.severity === 'warning' && d.code.startsWith('explainer/writing-')));
  assert.ok(result.every(d => d.evidence.reason && d.evidence.example && d.supportedFixes.length));
  assert.ok(result.some(d => d.evidence.matched === 'Perform an analysis of'));
  assert.ok(result.some(d => d.evidence.matched === 'many users'));
});

test('writing: hints, reasons and examples are English-only', () => {
  const result = lintExplainerWriting([
    entry('Perform an analysis of the cache. In summary, many users need each and every result. This is illustrative.'),
    entry('One. Two. Three. Four. Five.'),
  ]);
  assert.ok(result.length > 0);
  assert.doesNotMatch(JSON.stringify(result), /[㐀-鿿]/u);
});

test('writing: direct technical prose and quoted URL bodies do not trigger phrase hints', () => {
  assert.deepEqual(lintExplainerWriting([
    entry('Analyze the cache. The limit is 32 requests per second. Read https://example.test/many-users/future-plans.'),
    entry('Measured 3.5 ms over 120 requests. Make a request to the API.'),
  ]), []);
});

test('writing: long sentences count words, not punctuation or decimal dots', () => {
  const result = lintExplainerWriting([
    entry('The cache returns nil and the endpoint waits for the database.', {line: 4}),
    entry('Latency is 3.5 ms and the database returns the result before the cache is updated.'),
  ], {sentenceLimit: 8});
  assert.equal(result.length, 2);
  assert.ok(result.every(d => d.code === 'explainer/writing-sentence-length'));
  assert.equal(result[0].subject.line, 4);
  assert.equal(result[1].evidence.units, 15);
  assert.equal(result[1].evidence.limit, 8);
  assert.deepEqual(lintExplainerWriting([entry('The cache returns nil. The endpoint waits. Then it writes back.')], {sentenceLimit: 8}), []);
});

test('writing: strict and off mode preserve explicit severity control', () => {
  assert.ok(lintExplainerWriting([entry('Many users.')], {mode: 'strict'}).every(d => d.severity === 'error'));
  assert.deepEqual(lintExplainerWriting([entry('Many users.')], {mode: 'off'}), []);
  assert.throws(() => lintExplainerWriting([], {mode: 'silent'}), /mode/);
  assert.throws(() => lintExplainerWriting([], {sentenceLimit: 0}), /positive integer/);
});

test('writing: source line offsets, component targets and diagnostic order survive repeated calls', () => {
  const entries = [entry('The endpoint reads the cache.\n\nMake a decision.\nMany users.', {line: 20, component: 'answer', panelId: 'recommendation'})];
  const first = lintExplainerWriting(entries);
  assert.deepEqual(first.map(d => d.subject.line), [22, 23]);
  assert.ok(first.every(d => d.subject.component === 'answer' && d.subject.panelId === 'recommendation'));
  assert.deepEqual(lintExplainerWriting(entries), first);
  assert.equal(entries[0].text, 'The endpoint reads the cache.\n\nMake a decision.\nMany users.');
});

test('writing: a URL with sentence punctuation is excluded from length but leaves the next sentence measurable', () => {
  const entries = [entry('Read https://example.test/a.b?q=3.5. Then read the measured result before changing the cache behavior.')];
  const result = lintExplainerWriting(entries, {sentenceLimit: 5});
  assert.equal(result.length, 1);
  assert.equal(result[0].evidence.units, 10);
});

test('writing: URL masking preserves prose after bare and Markdown links', () => {
  for (const text of [
    '[Source](https://example.com). Many users make a decision.',
    '[Source](https://example.com) many users make a decision.',
    'https://example.com. Many users make a decision.',
    'https://example.com, many users make a decision.',
    '[Source](https://example.com/topic_(one)).\nMany users make a decision.',
  ]) {
    const result = lintExplainerWriting([entry(text, {line: 10})], {mode: 'strict'});
    assert.deepEqual(new Set(result.map(d => d.evidence.rule)), new Set(['vague-quantity', 'light-verb']), text);
    assert.ok(result.every(d => d.severity === 'error'));
    assert.ok(result.every(d => d.subject.line === (text.includes('\n') ? 11 : 10)));
  }
});

test('writing: English URL paths and balanced URL parentheses stay masked', () => {
  assert.deepEqual(lintExplainerWriting([
    entry('[Source](https://example.com/future%20plans/many-users/topic_(choose-a-path)). Check the cache.'),
    entry('Read https://example.com/(future-plans)/many-users?q=3.5. Check the cache.'),
  ], {mode: 'strict'}), []);
});

test('writing: long paragraphs, an all-bold conclusion and a disclaimer-style scope get structural hints', () => {
  const rules = entries => lintExplainerWriting(entries).map(item => item.evidence.rule);
  assert.deepEqual(rules([entry('One. Two. Three. Four. Five.')]), ['paragraph-length']);
  assert.deepEqual(rules([entry('One. Two. Three.', {component: 'list'})]), []);
  const summary = 'Keep a modular monolith until the module boundaries settle, then split the services.';
  assert.deepEqual(rules([entry(summary, {component: 'answer', pointer: '/answer/summary', raw: `**${summary}**`})]), ['verdict-emphasis']);
  assert.deepEqual(rules([entry(summary, {component: 'answer', pointer: '/answer/summary', raw: 'Keep a **modular monolith** until the module boundaries settle, then split the services.'})]), []);
  const disclaimer = 'This page discusses a feature direction that is not implemented yet. It relies on what the user said and did not check the history. The page is only a reading sample, is not a legal review, and was never verified by running it against a real deployment, a staging copy, or any recorded production traffic.';
  assert.deepEqual(rules([entry(disclaimer, {component: 'scope'})]), ['scope-length']);
  assert.deepEqual(rules([entry('Illustrative · eight people', {component: 'scope'})]), []);
});

test('writing: controlled-language hints stay precise', () => {
  const rules = text => lintExplainerWriting([entry(text)]).map(item => item.evidence.rule);
  assert.deepEqual(rules('In order to utilize the cache, read it first.'), ['plain-word', 'plain-word']);
  assert.deepEqual(rules('In summary, this cutting-edge design is seamless.'), ['filler', 'cliche', 'cliche']);
  assert.deepEqual(rules('We make a decision after we give consideration to the logs.'), ['light-verb', 'light-verb']);
  assert.deepEqual(lintExplainerWriting(['Use the cache before the database.', 'Retry more than 3 times.'].map(text => entry(text))), []);
});

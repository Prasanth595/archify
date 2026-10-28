import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { analyzeArchitecture, querySemantic, makeExplainer } from './shared-reach.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(directory, 'fixtures/production-deployment.architecture.json');
const bytes = fs.readFileSync(fixture);
const spec = JSON.parse(bytes);
const query = { a: 'api_a', b: 'api_b', direction: 'downstream' };
const semantic = (ids, pairs) => ({ nodes: ids.map(id => ({ id })), edges: pairs.map(([from, to, id], index) => ({ from, to, id: id || String(index), key: String(index) })) });

// Expected values come from the fixed public fixture, not output snapshots.
test('fixed native fixture preserves all semantics and exact shortest downstream witnesses', async () => {
  const result = await analyzeArchitecture(bytes, query);
  assert.equal(result.input.sha256, '610a5614667e8f108bdcf1769c9d7af5c3ce0fb62be3ea50550b10eb752e4bda');
  assert.equal(result.semantic.nodes.length, 12);
  assert.equal(result.semantic.edges.length, 12);
  assert.deepEqual(result.common, ['events', 'worker', 'audit', 'observability']);
  assert.deepEqual(result.onlyA, ['redis']);
  assert.deepEqual(result.onlyB, ['postgres', 'replica']);
  assert.deepEqual(result.witnesses.map(item => [item.a.edges.map(edge => edge.key), item.b.edges.map(edge => edge.key)]),
    [[['6'], ['7']], [['6', '8'], ['7', '8']], [['6', '8', '10'], ['7', '8', '10']], [['6', '8', '11'], ['7', '8', '11']]]);
  assert.deepEqual(result.witnesses[2].a.nodes, ['api_a', 'events', 'worker', 'audit']);
});

test('upstream witnesses follow original common-to-seed arrow direction', async () => {
  const result = await analyzeArchitecture(bytes, { ...query, direction: 'upstream' });
  assert.deepEqual(result.common, ['clients', 'edge', 'gateway']);
  assert.deepEqual(result.witnesses[0].a.nodes, ['clients', 'edge', 'gateway', 'api_a']);
  assert.deepEqual(result.witnesses[0].a.edges.map(edge => edge.key), ['0', '1', '2']);
  assert.deepEqual(result.witnesses[0].b.edges.map(edge => edge.key), ['0', '1', '3']);
  for (const item of result.witnesses) for (const witness of [item.a, item.b]) {
    assert.equal(witness.hops, witness.edges.length);
    witness.edges.forEach((edge, index) => assert.deepEqual([edge.from, edge.to], witness.nodes.slice(index, index + 2)));
  }
});

test('cycles terminate, origins are excluded, parallel edges keep identity and stable shortest ties', () => {
  const graph = semantic(['a', 'b', 'c', 'd'], [['a', 'c', 'first'], ['a', 'c', 'second'], ['b', 'c'], ['c', 'a'], ['a', 'b'], ['c', 'd']]);
  const result = querySemantic(graph, { a: 'a', b: 'b', direction: 'downstream' });
  assert.deepEqual(result.common, ['c', 'd']);
  assert.equal(graph.edges.length, 6);
  assert.equal(result.witnesses[0].a.edges[0].id, 'first');
  assert.deepEqual(result.witnesses[1].a.nodes, ['a', 'c', 'd']);
  assert.equal(result.witnesses[1].a.hops, 2);
});

test('native extraction preserves parallel edges and presentation annotations preserve author IDs', async () => {
  const parallel = { schema_version: 1, diagram_type: 'architecture', meta: { title: 'Parallel', output: 'parallel.html' },
    components: [{ id: 'a', type: 'backend', label: 'A', pos: [40, 40] }, { id: 'b', type: 'backend', label: 'B', pos: [40, 220] }, { id: 'c', type: 'database', label: 'C', pos: [340, 130] }],
    connections: [{ from: 'a', to: 'c', id: 'e-1', fromSide: 'right', toSide: 'top', via: [[260, 70], [400, 70]] },
      { from: 'a', to: 'c', fromSide: 'bottom', toSide: 'left', via: [[100, 160]] }, { from: 'b', to: 'c' }] };
  const result = await analyzeArchitecture(Buffer.from(JSON.stringify(parallel)), { a: 'a', b: 'b', direction: 'downstream' });
  assert.equal(result.semantic.edges.length, 3);
  assert.deepEqual(result.semantic.edges.filter(edge => edge.from === 'a').map(edge => edge.key), ['0', '1']);
  assert.equal(result.witnesses[0].a.edges[0].id, 'e-1');
  const displayed = makeExplainer(result, parallel).panels[0].blocks.find(block => block.type === 'diagram').spec;
  assert.equal(displayed.connections[0].id, 'e-1');
  assert.equal(displayed.connections[1].id, 'e-1-1');
  assert.equal(parallel.connections[1].id, undefined);
  assert.equal(new Set(displayed.connections.map(edge => edge.id)).size, 3);
});

test('empty intersection is a successful answer and only-side sets remain available', () => {
  const result = querySemantic(semantic(['a', 'b', 'c'], [['a', 'c']]), { a: 'a', b: 'b', direction: 'downstream' });
  assert.deepEqual(result.common, []);
  assert.deepEqual(result.onlyA, ['c']);
  assert.deepEqual(result.onlyB, []);
});

test('reject invalid queries, malformed/non-Architecture input and unsupported direction', async () => {
  for (const invalid of [{ ...query, a: 'missing' }, { ...query, b: 'api_a' }, { ...query, direction: 'sideways' }]) {
    assert.throws(() => querySemantic(semantic(['api_a', 'api_b'], []), invalid), /exist|different|Direction/);
  }
  await assert.rejects(analyzeArchitecture(Buffer.from('{'), query), /valid JSON/);
  await assert.rejects(analyzeArchitecture(Buffer.from('{"diagram_type":"workflow"}'), query), /Architecture/);
  await assert.rejects(analyzeArchitecture(Buffer.from('{"diagram_type":"architecture"}'), query));
  for (const direction of ['forward', 'both', 'none']) {
    const changed = structuredClone(spec); changed.connections[0].direction = direction;
    await assert.rejects(analyzeArchitecture(Buffer.from(JSON.stringify(changed)), query), { code: 'input/unsupported-direction' });
  }
  const collision = structuredClone(spec);
  collision.connections[0].id = 'same'; collision.connections[1].id = 'same';
  await assert.rejects(analyzeArchitecture(Buffer.from(JSON.stringify(collision)), query), /collide|unique|Duplicate/i);
});

test('public experiment CLI delivers a normal finalized Explainer', () => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'shared-reach-test-'));
  try {
    const result = spawnSync(process.execPath, [path.join(directory, 'cli.mjs'), fixture, 'api_a', 'api_b', 'downstream', temporary], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const answer = JSON.parse(fs.readFileSync(path.join(temporary, 'answer.json')));
    assert.deepEqual(answer.common, ['events', 'worker', 'audit', 'observability']);
    const finalize = JSON.parse(fs.readFileSync(path.join(temporary, 'finalize.stdout.log')));
    assert.equal(finalize.ok, true);
    assert.equal(finalize.gates.check, 'pass');
    assert.deepEqual(fs.readFileSync(path.join(temporary, 'input.architecture.json')), bytes);
    assert.ok(fs.statSync(path.join(temporary, 'full-native.html')).size > 0);
    const document = JSON.parse(fs.readFileSync(path.join(temporary, 'explainer.json')));
    const displayed = document.panels[0].blocks.find(block => block.type === 'diagram').spec;
    assert.deepEqual(displayed.components, spec.components);
    assert.deepEqual(displayed.connections.map(({ id, ...edge }) => edge), spec.connections);
    assert.equal(answer.presentation.edgeTargets[6].presentationId, 'e-6');
    assert.equal(answer.presentation.edgeTargets[6].semanticId, '6');
    assert.equal(answer.presentation.edgeTargets[6].originalId, null);
    assert.equal(finalize.browserCheck.ran, false);
    assert.match(fs.readFileSync(path.join(temporary, 'explainer.html'), 'utf8'), /Shared reach/);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
});

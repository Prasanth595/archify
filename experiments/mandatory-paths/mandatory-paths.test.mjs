import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { analyzeArchitecture, querySemantic, makeExplainer } from './mandatory-paths.mjs';
const directory = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(directory, 'fixtures/production-deployment.architecture.json');
const bytes = fs.readFileSync(fixture), spec = JSON.parse(bytes);
const oracle = JSON.parse(fs.readFileSync(path.join(directory, 'fixtures/full-fixture-oracle.json')));
const graph = (ids, pairs) => ({ nodes: ids.map(id => ({ id })), edges: pairs.map(([from, to, id], index) => ({ from, to, id: id || String(index), key: String(index) })) });
const query = { s: 'clients', t: 'audit' };
test('full independent production oracle: coverage, required nodes and every bypass identity', async () => {
  const result = await analyzeArchitecture(bytes, query);
  assert.equal(result.input.sha256, '610a5614667e8f108bdcf1769c9d7af5c3ce0fb62be3ea50550b10eb752e4bda');
  assert.equal(result.semantic.nodes.length, oracle.nodes); assert.equal(result.semantic.edges.length, oracle.edges);
  assert.equal(result.status, 'reachable');
  assert.deepEqual(result.requiredInternalNodes, oracle.requiredInternalNodes);
  assert.deepEqual(result.baselinePath.nodes, oracle.baselinePath.nodes);
  assert.deepEqual(result.nonmandatoryNodes, Object.keys(oracle.bypassPaths));
  for (const [id, expected] of Object.entries(oracle.bypassPaths)) {
    const actual = result.bypassPaths[id];
    assert.deepEqual(actual.nodes, expected.nodes);
    assert.deepEqual(actual.edges.map(edge => Number(edge.key)), expected.edgeKeys);
    assert.equal(actual.nodes.includes(id), false);
    actual.edges.forEach((edge, index) => assert.deepEqual([edge.from, edge.to], actual.nodes.slice(index, index + 2)));
  }
});
test('longer bypass disproves a shortest-route-only required-node classification', () => {
  const result = querySemantic(graph(['s','a','b','c','t'], [['s','a'],['a','t'],['s','b'],['b','c'],['c','t']]), { s: 's', t: 't' });
  assert.deepEqual(result.requiredInternalNodes, []);
  assert.deepEqual(result.bypassPaths.a.nodes, ['s','b','c','t']);
  assert.equal(result.bypassPaths.a.hops, 3);
});
test('cycles terminate without claiming simple-path membership; directed versus undirected cutpoint', () => {
  const result = querySemantic(graph(['s','a','x','t'], [['s','a'],['a','x'],['x','a'],['a','t'],['s','t']]), { s:'s', t:'t' });
  assert.deepEqual(result.requiredInternalNodes, []);
  assert.deepEqual(result.bypassPaths.x.nodes, ['s','t']);
  const cut = querySemantic(graph(['s','a','b','t','q'], [['s','a'],['a','t'],['s','b'],['b','t'],['q','a']]), { s:'s', t:'t' });
  assert.deepEqual(cut.requiredInternalNodes, []);
});
test('unreachable differs from reachable with zero required internal nodes', () => {
  const unreachable = querySemantic(graph(['s','t'], []), { s:'s',t:'t' });
  assert.equal(unreachable.status, 'unreachable'); assert.equal(unreachable.baselinePath, null);
  const direct = querySemantic(graph(['s','t'], [['s','t']]), { s:'s',t:'t' });
  assert.equal(direct.status, 'reachable'); assert.deepEqual(direct.requiredInternalNodes, []);
});
test('authored parallel identity, deterministic ties and presentation ID collisions', async () => {
  const parallel = { schema_version:1, diagram_type:'architecture', meta:{title:'Parallel',output:'parallel.html'},
    components: ['s','a','t'].map((id,index) => ({id,type:'backend',label:id,pos:[40+index*250,100]})),
    connections:[{from:'s',to:'t',id:'e-1'},{from:'s',to:'t'},{from:'s',to:'a'},{from:'a',to:'t'}] };
  const result = await analyzeArchitecture(Buffer.from(JSON.stringify(parallel)), {s:'s',t:'t'});
  assert.equal(result.semantic.edges.length, 4); assert.equal(result.bypassPaths.a.edges[0].id, 'e-1');
  const shown = makeExplainer(result, parallel).panels[0].blocks.find(block => block.type === 'diagram').spec;
  assert.equal(shown.connections[0].id, 'e-1'); assert.equal(shown.connections[1].id, 'e-1-1');
  assert.equal(parallel.connections[1].id, undefined);
  assert.deepEqual(shown.connections.map(({id,...edge}) => edge), parallel.connections.map(({id,...edge}) => edge));
});
// Topology stated in the Apache-2.0 rustworkx dominance test, cited in README.
// Independent expectations; no upstream implementation is executed or copied.
test('public eight-node dominance example keeps a cycle but only node 1 is required', () => {
  const result = querySemantic(graph(['0','1','2','3','4','5','6','7'],
    [['0','1'],['1','2'],['1','3'],['2','7'],['3','4'],['4','5'],['4','6'],['5','7'],['6','4']]), {s:'0',t:'7'});
  assert.deepEqual(result.requiredInternalNodes, ['1']);
  assert.deepEqual(result.bypassPaths['2'].nodes, ['0','1','3','4','5','7']);
});
test('ordinary native IDs matching object properties retain their required classification', async () => {
  const native = { schema_version:1, diagram_type:'architecture', meta:{title:'Chain',output:'chain.html'},
    components:['s','constructor','t'].map((id,index)=>({id,type:'backend',label:id,pos:[40+index*250,100]})),
    connections:[{from:'s',to:'constructor'},{from:'constructor',to:'t'}] };
  const answer = await analyzeArchitecture(Buffer.from(JSON.stringify(native)), {s:'s',t:'t'});
  assert.deepEqual(answer.requiredInternalNodes, ['constructor']);
  const roundTrip=JSON.parse(JSON.stringify(answer));
  const table=makeExplainer(roundTrip,native).panels[0].blocks.find(block=>block.type==='comparison');
  assert.equal(table.rows[0].cells[0].text, 'Required');
});
test('query/input failures and native id-or-key collisions are explicit', async () => {
  for (const invalid of [{s:'clients',t:'clients'},{s:'missing',t:'audit'}]) await assert.rejects(analyzeArchitecture(bytes,invalid), /different|exist/);
  await assert.rejects(analyzeArchitecture(Buffer.from('{'),query), /valid JSON/);
  await assert.rejects(analyzeArchitecture(Buffer.from('{"diagram_type":"workflow"}'),query), /Architecture/);
  for (const direction of ['forward','both','none',null]) {
    const changed = structuredClone(spec); changed.connections[0].direction=direction;
    await assert.rejects(analyzeArchitecture(Buffer.from(JSON.stringify(changed)),query), {code:'input/unsupported-direction'});
  }
  const collision = structuredClone(spec); collision.connections[0].id='duplicate'; collision.connections[1].id='duplicate';
  await assert.rejects(analyzeArchitecture(Buffer.from(JSON.stringify(collision)),query), {code:'input/edge-identity'});
});
test('real CLI finalizes reachable and unreachable normal native artifacts', () => {
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'mandatory-paths-test-'));
  try {
    for (const [s,t,status] of [['clients','audit','reachable'],['audit','clients','unreachable']]) {
      const out=path.join(temporary,status);
      const result=spawnSync(process.execPath,[path.join(directory,'cli.mjs'),fixture,s,t,out],{encoding:'utf8'});
      assert.equal(result.status,0,result.stderr);
      const answer=JSON.parse(fs.readFileSync(path.join(out,'answer.json')));
      assert.equal(answer.status,status);
      assert.deepEqual(fs.readFileSync(path.join(out,'input.architecture.json')),bytes);
      const finalize=JSON.parse(fs.readFileSync(path.join(out,'finalize.stdout.log')));
      assert.equal(finalize.ok,true); assert.equal(finalize.gates.check,'pass'); assert.equal(finalize.browserCheck.ran,false);
      const shown=JSON.parse(fs.readFileSync(path.join(out,'explainer.json'))).panels[0].blocks.find(block=>block.type==='diagram').spec;
      assert.deepEqual(shown.components,spec.components);
      assert.deepEqual(shown.connections.map(({id,...edge})=>edge),spec.connections);
      assert.ok(fs.statSync(path.join(out,'full-native.html')).size>0);
    }
  } finally { fs.rmSync(temporary,{recursive:true,force:true}); }
});

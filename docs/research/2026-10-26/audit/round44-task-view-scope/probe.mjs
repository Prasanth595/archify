import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { project } from './input/project.mjs';

const read = path => readFileSync(new URL(path, import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const source = read('./source/internal/render/assets/app.js');
assert.equal(sha256(source), 'a7e491033a6c89f755930c4d6b628165d7dbb5dc699511633094994acae99865');
const app = source.toString('utf8');
function section(start, end) {
  const a = app.indexOf(start), b = app.indexOf(end, a);
  assert.ok(a >= 0 && b > a);
  assert.equal(app.indexOf(start, a + 1), -1);
  return app.slice(a, b);
}
// Exact archived upstream sections. This is a function probe, not an HTML build,
// schema validation, Git verification, browser run or test execution evidence.
const indexes = section('  // ── Indexes', '  // Copies tagged');
const scope = section('  function scopedNodeIds(', '  // The ids of the nodes the graph shows.');
const mappingBytes = read('./input/mapping.json');
const mapping = JSON.parse(mappingBytes);
const sidecar = JSON.parse(read('./input/flows.json'));
const expected = project(mappingBytes, sidecar);
const expectedRows = expected.flows.map(flow => ({
  flow: flow.id, steps: flow.steps.map(step => ({ node: step.node, tests: step.tests.map(test => test.test) }))
}));
const nodes = mapping.nodes.map(node => ({
  ...node, kind: sidecar.knownTests.includes(node.id) ? 'test' : 'code'
}));
const declaredLink = mapping.edges.find(edge => edge.from === 'regression' && edge.to === 'guard');
assert.equal(declaredLink.label, '声明：测试关联');
const globalEdge = {id: 'regression-to-guard', from: 'regression', to: 'guard', kind: 'tests'};
const reader = reviewData => vm.runInNewContext(
  '(function(){' + indexes + scope + '\nreturn {testsOf, scopedNodeIds};})()',
  {reviewData}, {timeout: 1000}
);
function projectScope(reviewData, flows) {
  const f = reader(reviewData);
  return flows.map(flow => {
    // Preconditions: flow path is the base scope; no manually revealed or
    // expanded neighbours; all nodes pass filters. Full graphNodeIds is NOT run.
    const visible = f.scopedNodeIds(flow.path, new Set(), () => [],
      id => f.testsOf(id).map(edge => edge.from), () => true);
    return {
      flow: flow.id, visible: [...visible],
      steps: flow.path.map(node => ({node, tests: Array.from(f.testsOf(node), edge => edge.from)}))
    };
  });
}
const makeData = (ns, edges, flows) => ({nodes: ns, edges, repos: [], flows});
const shared = projectScope(makeData(nodes, [globalEdge], sidecar.flows), sidecar.flows);
const legacyFlows = sidecar.flows.map(flow => ({
  ...flow, tests: [...new Set(flow.testLinks.map(link => link.test))]
}));
const legacyOnly = projectScope(makeData(nodes, [], legacyFlows), legacyFlows);
const legacyAndEdge = projectScope(makeData(nodes, [globalEdge], legacyFlows), legacyFlows);

// Two explicit alternative encodings, not claims that native validation passed.
// They alter node identity or document scope, so they are not transparent imports.
const occurrences = sidecar.flows.map(flow => ({
  ...flow, path: flow.path.map(id => flow.id + ':' + id)
}));
const occurrenceNodes = nodes.filter(node => node.kind === 'test').concat(
  sidecar.flows.flatMap(flow => flow.path.map(id => ({
    ...nodes.find(node => node.id === id), id: flow.id + ':' + id, originalId: id
  })))
);
const occurrenceEdges = sidecar.flows.flatMap(flow => flow.testLinks.map(link => ({
  id: flow.id + ':' + link.test + ':' + link.step, from: link.test,
  to: flow.id + ':' + link.step, kind: 'tests'
})));
const occurrenceRows = projectScope(makeData(occurrenceNodes, occurrenceEdges, occurrences), occurrences);
const separateDocuments = sidecar.flows.flatMap(flow =>
  projectScope(makeData(nodes, flow.testLinks.map(link => ({
    id: link.test + ':' + link.step, from: link.test, to: link.step, kind: 'tests'
  })), [flow]), [flow])
);
const counts = rows => rows.map(row => row.steps.reduce((sum, step) => sum + step.tests.length, 0));
assert.deepEqual(counts(expectedRows), [1, 0, 0]);
assert.deepEqual(counts(shared), [1, 1, 1]);
assert.deepEqual(counts(legacyOnly), [0, 0, 0]);
assert.deepEqual(legacyAndEdge, shared);
assert.deepEqual(counts(occurrenceRows), [1, 0, 0]);
assert.deepEqual(counts(separateDocuments), [1, 0, 0]);
assert.ok(shared.every(row => row.visible.includes('regression')));
assert.ok(legacyOnly.every(row => !row.visible.includes('regression')));
assert.ok([...shared, ...legacyOnly, ...occurrenceRows, ...separateDocuments]
  .every(row => row.steps[1].tests.length === 0));
const result = {
  kind: 'pinned-function-probe-not-native-app-run',
  sourceCommit: 'a3fa21767bfaeb3077fdda08bddb7249366caa93',
  experimentCommit: '843c877b251baf89925f99e11594fc5630c1c165',
  appSha256: sha256(source), mappingSha256: sha256(mappingBytes),
  sidecarSha256: sha256(read('./input/flows.json')),
  extractedSections: [
    {startLine: app.slice(0, app.indexOf(indexes)).split('\n').length, sha256: sha256(indexes)},
    {startLine: app.slice(0, app.indexOf(scope)).split('\n').length, sha256: sha256(scope)}
  ],
  expectedRows, shared, legacyOnly, legacyAndEdge, occurrenceRows, separateDocuments,
  assertions: 9,
  historicalTests: 'not-run',
  limits: 'Source-level test association differs from an authored per-flow declaration. No native build, schema/Git validation, browser, layout or reader-benefit measurement.'
};
process.stdout.write(JSON.stringify(result, null, 2) + '\n');

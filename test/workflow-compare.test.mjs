import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

const cli = path.resolve('archify/bin/archify.mjs');

function run(base, head, outputName) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-workflow-compare-'));
  const basePath = path.join(directory, 'base.json');
  const headPath = path.join(directory, 'head.json');
  fs.writeFileSync(basePath, JSON.stringify(base));
  fs.writeFileSync(headPath, JSON.stringify(head));
  const args = [cli, 'compare', 'workflow', basePath, headPath];
  if (outputName) args.push(outputName === 'base' ? basePath : path.join(directory, outputName));
  args.push('--json');
  const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
  fs.rmSync(directory, { recursive: true, force: true });
  return { result, receipt: JSON.parse(result.stdout) };
}

function fixture() {
  return JSON.parse(fs.readFileSync('archify/examples/agent-tool-call.workflow.json', 'utf8'));
}

test('Workflow compare reports authored semantic changes and ignores coordinates', () => {
  const base = fixture();
  const head = structuredClone(base);
  head.nodes[0].col = (head.nodes[0].col || 0) + 1;
  head.nodes[0].label = 'Changed';
  const { result, receipt } = run(base, head);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(receipt.changes.nodes.map(change => [change.id, change.change]), [['user', 'modified']]);
  assert.deepEqual(receipt.changes.edges, []);
});

test('Workflow compare ignores presentation-only fields and remains deterministic', () => {
  const base = fixture();
  const head = structuredClone(base);
  head.nodes[0].col = (head.nodes[0].col || 0) + 2;
  head.nodes[0].yOffset = 4;
  if (head.edges[0]) head.edges[0].labelDx = 8;
  const first = run(base, head).receipt;
  const second = run(base, head).receipt;
  assert.deepEqual(first.changes, { nodes: [], edges: [], mainPath: [] });
  assert.deepEqual(first, second);
});

test('Workflow compare rejects invalid inputs with stable diagnostics', () => {
  const base = fixture();
  const invalid = structuredClone(base);
  invalid.diagram_type = 'architecture';
  const { result, receipt } = run(base, invalid);
  assert.equal(result.status, 1);
  assert.equal(receipt.code, 'workflow/type');
});

test('Workflow compare reports main path changes and rejects dangling endpoints', () => {
  const base = fixture();
  const changedPath = structuredClone(base);
  changedPath.mainPath = changedPath.mainPath.slice(0, -1);
  const pathResult = run(base, changedPath);
  assert.equal(pathResult.result.status, 0, pathResult.result.stderr);
  assert.equal(pathResult.receipt.changes.mainPath.length, 1);

  const invalid = structuredClone(base);
  invalid.edges[0].to = 'missing-node';
  const invalidResult = run(base, invalid);
  assert.equal(invalidResult.result.status, 1);
  assert.equal(invalidResult.receipt.code, 'workflow/head-invalid');
  assert.equal(invalidResult.receipt.diagnostics[0].code, 'workflow/unknown-endpoint');
});

test('Workflow compare rejects non-JSON and input-alias outputs before writing', () => {
  const base = fixture();
  const html = run(base, base, 'comparison.html');
  assert.equal(html.result.status, 1);
  assert.equal(html.receipt.code, 'output/cli-extension');
  const alias = run(base, base, 'base');
  assert.equal(alias.result.status, 1);
  assert.equal(alias.receipt.code, 'output/cli-alias');
});

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { spawnSync } from 'node:child_process';

const cli = path.resolve('archify/bin/archify.mjs');

function run(base, head) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-workflow-compare-'));
  const basePath = path.join(directory, 'base.json');
  const headPath = path.join(directory, 'head.json');
  fs.writeFileSync(basePath, JSON.stringify(base));
  fs.writeFileSync(headPath, JSON.stringify(head));
  const result = spawnSync(process.execPath, [cli, 'compare', 'workflow', basePath, headPath, '--json'], { encoding: 'utf8' });
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
  assert.deepEqual(first.changes, { nodes: [], edges: [] });
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

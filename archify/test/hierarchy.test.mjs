import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSchema } from '../renderers/shared/validator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const cli = path.join(skillRoot, 'bin/archify.mjs');
const example = path.join(skillRoot, 'examples/hierarchy-simple.json');

function runCli(args, cwd = process.cwd()) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' });
}

function workspace(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-hierarchy-test-'));
  t.after(() => {
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  });
  return dir;
}

function cloneExample() {
  return structuredClone(JSON.parse(fs.readFileSync(example, 'utf8')));
}

function acceptsSchema(doc) {
  try { validateSchema('hierarchy', doc); return true; }
  catch { return false; }
}

// Stand up the renderer via the CLI for the graph-level invariants (root
// existence, parent existence, exactly-one-null-parent, acyclic chain).
// Those checks live in the renderer's validateHierarchy(), not the JSON
// schema — see #690 and the lifecycle/architecture pattern.
function cliRenderFails(input, dir) {
  const result = runCli(['render', 'hierarchy', input, path.join(dir, 'out.html')], dir);
  return { status: result.status, receipt: parseReceipt(result.stdout), stderr: result.stderr };
}

function cliRenderPasses(input, dir) {
  const result = runCli(['render', 'hierarchy', input, path.join(dir, 'out.html')], dir);
  return result.status;
}

function cliValidateFails(input, dir) {
  const result = runCli(['validate', 'hierarchy', input, '--quality', 'standard', '--json'], dir);
  return { status: result.status, receipt: parseReceipt(result.stdout) };
}

function parseReceipt(text) {
  try { return JSON.parse(text); } catch { return null; }
}

// Schema-only positive case: the bundled example's shape is valid.
test('hierarchy schema accepts the bundled example', () => {
  const doc = cloneExample();
  assert.equal(acceptsSchema(doc), true);
});

// Schema-only negative cases: structural shape violations the JSON Schema
// catches directly. Graph-level invariants (root exists, parent ids
// resolve, no cycles, exactly one null parent) live in the renderer-level
// checks below.
test('hierarchy schema rejects an unknown top-level property', () => {
  const doc = cloneExample();
  doc.invented = 'oops';
  assert.equal(acceptsSchema(doc), false);
});

test('hierarchy schema rejects a node with a malformed id', () => {
  const doc = cloneExample();
  doc.nodes[0].id = '0nly-numbers'; // violates the leading-letter pattern
  assert.equal(acceptsSchema(doc), false);
});

test('hierarchy schema rejects an unknown diagram_type', () => {
  const doc = cloneExample();
  doc.diagram_type = 'not-a-real-type';
  assert.equal(acceptsSchema(doc), false);
});

// Renderer-level graph checks (root existence, parent existence, exactly
// one null parent, cycle detection). These surface via the renderer's
// validateHierarchy() function during render.
test('archify render hierarchy rejects root id missing from nodes[]', (t) => {
  const dir = workspace(t);
  const input = path.join(dir, 'no-root.hierarchy.json');
  const doc = cloneExample();
  doc.root = 'never-was-a-node';
  fs.writeFileSync(input, JSON.stringify(doc));
  const outcome = cliRenderFails(input, dir);
  assert.notEqual(outcome.status, 0, 'expected render to fail for missing root');
  assert.match(outcome.stderr || '', /root|not.*present/);
});

test('archify render hierarchy rejects parent id missing from nodes[]', (t) => {
  const dir = workspace(t);
  const input = path.join(dir, 'no-parent.hierarchy.json');
  const doc = cloneExample();
  doc.nodes[1].parent = 'ghost';
  fs.writeFileSync(input, JSON.stringify(doc));
  const outcome = cliRenderFails(input, dir);
  assert.notEqual(outcome.status, 0, 'expected render to fail for dangling parent');
});

test('archify render hierarchy rejects two null parents', (t) => {
  const dir = workspace(t);
  const input = path.join(dir, 'two-nulls.hierarchy.json');
  const doc = cloneExample();
  doc.nodes.push({ id: 'also-root', label: 'Also Root', parent: null });
  fs.writeFileSync(input, JSON.stringify(doc));
  const outcome = cliRenderFails(input, dir);
  assert.notEqual(outcome.status, 0, 'expected render to fail for two null parents');
});

test('archify render hierarchy rejects a parent chain cycle A↔B', (t) => {
  const dir = workspace(t);
  const input = path.join(dir, 'cycle.hierarchy.json');
  const doc = cloneExample();
  const orders = doc.nodes.find((n) => n.id === 'orders');
  const refunds = doc.nodes.find((n) => n.id === 'refunds');
  orders.parent = 'refunds';
  refunds.parent = 'orders';
  fs.writeFileSync(input, JSON.stringify(doc));
  const outcome = cliRenderFails(input, dir);
  assert.notEqual(outcome.status, 0, 'expected render to fail for parent cycle');
});

// Renderer smoke: validate command returns the ok:true receipt.
test('archify validate hierarchy emits ok:true for the bundled example', () => {
  const result = runCli(['validate', 'hierarchy', example, '--quality', 'showcase', '--json']);
  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.ok, true, JSON.stringify(receipt));
  assert.equal(receipt.type, 'hierarchy');
});

// Renderer smoke: render produces a non-empty HTML containing every node id
// and every required interactive hook.
test('archify render hierarchy produces an HTML artifact with every node id', (t) => {
  const dir = workspace(t);
  const out = path.join(dir, 'hierarchy.html');
  const result = runCli(['render', 'hierarchy', example, out], dir);
  assert.equal(result.status, 0, result.stderr);
  const stat = fs.statSync(out);
  assert.ok(stat.size > 10_000, `HTML must be larger than 10 KB, got ${stat.size} bytes`);
  const html = fs.readFileSync(out, 'utf8');
  const doc = JSON.parse(fs.readFileSync(example, 'utf8'));
  for (const node of doc.nodes) {
    assert.match(html, new RegExp(`data-node-id="${node.id}"`), `missing data-node-id for ${node.id}`);
  }
  // One subtree wrapper per non-leaf node.
  const parentIds = new Set(doc.nodes.filter((n) => doc.nodes.some((other) => other.parent === n.id)).map((n) => n.id));
  const expectedSubs = parentIds.size;
  const openSubtreeCount = (html.match(/data-hierarchy-subtree="/g) || []).length;
  assert.equal(openSubtreeCount, expectedSubs);
  // Tool pair appears when meta.allow_view_all is set.
  assert.match(html, /data-hierarchy-expand-all/);
  assert.match(html, /data-hierarchy-collapse-all/);
  // Interactivity script is shipped inline.
  assert.match(html, /data-hierarchy-open/);
  assert.match(html, /data-hierarchy-toggle/);
});

// Validate command surfaces the cycle as a structured diagnostic.
test('archify validate hierarchy surfaces a cycle diagnostic', (t) => {
  const dir = workspace(t);
  const input = path.join(dir, 'broken.hierarchy.json');
  const doc = cloneExample();
  const orders = doc.nodes.find((n) => n.id === 'orders');
  const refunds = doc.nodes.find((n) => n.id === 'refunds');
  orders.parent = 'refunds';
  refunds.parent = 'orders';
  fs.writeFileSync(input, JSON.stringify(doc));
  const outcome = cliValidateFails(input, dir);
  assert.notEqual(outcome.status, 0, 'expected validate to fail for cycle');
  assert.equal(outcome.receipt?.ok, false);
  const cycleHit = (outcome.receipt?.diagnostics || []).find((d) => /Cycle in parent chain/.test(d.message || ''));
  assert.ok(cycleHit, 'expected cycle diagnostic');
});

// Schema tolerates duplicate default_expand entries (renderer is idempotent
// via Set semantics).
test('hierarchy schema tolerates duplicate default_expand entries', () => {
  const doc = cloneExample();
  doc.default_expand = ['platform', 'platform', 'orders'];
  assert.equal(acceptsSchema(doc), true);
});

// Acceptance gate mirror.
test('hierarchy example renders to > 10 KB with every authored node id', () => {
  const out = path.join(os.tmpdir(), 'archify-hierarchy-gate.html');
  const result = runCli(['render', 'hierarchy', example, out]);
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(out, 'utf8');
  assert.ok(html.length > 10_000);
  const doc = JSON.parse(fs.readFileSync(example, 'utf8'));
  assert.equal(doc.nodes.length >= 7, true, 'example should have at least seven nodes per the acceptance focus');
  for (const node of doc.nodes) {
    assert.match(html, new RegExp(`data-node-id="${node.id}"`), `missing node id ${node.id}`);
  }
});

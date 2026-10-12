import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..');
const cli = path.join(skillRoot, 'bin/archify.mjs');
const renderer = path.join(skillRoot, 'renderers/lifecycle/render-lifecycle.mjs');
const bundled = path.join(skillRoot, 'examples/agent-run.lifecycle.json');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-lifecycle-layout-'));

function render(name, doc) {
  const input = path.join(tmp, `${name}.json`);
  const output = path.join(tmp, `${name}.html`);
  fs.writeFileSync(input, JSON.stringify(doc));
  execFileSync('node', [renderer, input, output], {
    stdio: ['ignore', 'ignore', 'pipe'],
    encoding: 'utf8',
  });
  return fs.readFileSync(output, 'utf8');
}

function validate(name, doc, extra = []) {
  const input = path.join(tmp, `${name}-validate.json`);
  fs.writeFileSync(input, JSON.stringify(doc));
  const result = spawnSync(process.execPath, [
    cli, 'validate', 'lifecycle', input, '--quality', doc.meta.quality_profile || 'showcase', '--json', ...extra,
  ], { encoding: 'utf8' });
  return { status: result.status, receipt: JSON.parse(result.stdout || '{}') };
}

function compositionPoints(html, id) {
  const match = html.match(new RegExp(`data-edge-id="${id}"[^>]+data-composition-points="([^"]+)"`));
  if (!match) return null;
  return match[1].split(';').map((point) => point.split(',').map(Number));
}

function stateRects(svg) {
  const rects = {};
  for (const match of svg.matchAll(/data-node-id="([^"]+)"[\s\S]*?<rect x="([\d.-]+)" y="([\d.-]+)" width="([\d.-]+)" height="([\d.-]+)" rx="7" class="c-mask"/g)) {
    rects[match[1]] = {
      x: Number(match[2]), y: Number(match[3]), width: Number(match[4]), height: Number(match[5]),
    };
  }
  return rects;
}

function isXMonotone(points) {
  if (!points || points.length < 2) return false;
  const x = points[0][0];
  return points.every((p) => p[0] === x);
}

// Issue #739 sanity gate: the bundled agent-run showcase must still pass the
// shared artifact check and keep its Reviewing → Blocked connector clean.
// The bundled example only carries one transition in that pair, so the
// per-state snap path is dormant here; the assertion exists to catch a
// regression that would widen the canvas, add unplaced labels, or break
// the route's vertical alignment.
test('lifecycle: bundled agent-run stays showcase-clean after the snapPorts refactor', () => {
  const source = JSON.parse(fs.readFileSync(bundled, 'utf8'));
  const result = validate('agent-run', source);
  assert.equal(result.status, 0, JSON.stringify(result.receipt.diagnostics, null, 2));
  assert.equal(result.receipt.ok, true);
  assert.equal(result.receipt.composition.summary.errors, 0);
  assert.equal(result.receipt.composition.summary.warnings, 0);

  const html = render('agent-run', source);
  const rects = stateRects(html.match(/<svg\b[\s\S]*?<\/svg>/)?.[0] || '');
  assert.ok(rects.reviewing && rects.blocked, 'reviewing and blocked must render');
  const reviewingBottom = rects.reviewing.y + rects.reviewing.height;
  const blockedTop = rects.blocked.y;
  assert.ok(reviewingBottom <= blockedTop, 'reviewing sits above blocked');

  const reviewBlocked = compositionPoints(html, 'review-blocked');
  assert.ok(reviewBlocked, 'review-blocked edge must render');
  assert.ok(isXMonotone(reviewBlocked), `review-blocked stays x-monotone (constant-x): ${JSON.stringify(reviewBlocked)}`);
  assert.equal(reviewBlocked[0][1], reviewingBottom, 'review-blocked starts at reviewing bottom');
  assert.equal(reviewBlocked.at(-1)[1], blockedTop, 'review-blocked ends at blocked top');
});

// Issue #739 straightening rule: a lower state with a go-and-return pair whose
// ports both fit inside the parent's port band must render both connectors as
// straight (x-monotone) edges. The per-state snap path rewrites every top
// port of the lower state onto its matching upper port, all-or-nothing per
// state, so a go-and-return pair never produces one straight and one jogged
// edge.
test('lifecycle: per-state snap straightens a go-and-return pair offset from its parent', () => {
  const doc = {
    schema_version: 1,
    diagram_type: 'lifecycle',
    meta: { title: 'Snap regression fixture', output: 'snap.html', quality_profile: 'showcase' },
    lanes: [
      { id: 'main', label: 'Main path' },
      { id: 'wait', label: 'Waiting' },
    ],
    states: [
      { id: 'reviewing', type: 'decision', label: 'Reviewing', lane: 'main', col: 2 },
      { id: 'blocked', type: 'waiting', label: 'Blocked', lane: 'wait', col: 0 },
    ],
    transitions: [
      { id: 'go', from: 'reviewing', to: 'blocked', label: 'go' },
      { id: 'return', from: 'blocked', to: 'reviewing', label: 'return' },
    ],
  };
  const result = validate('snap-fixture', doc);
  assert.equal(result.status, 0, JSON.stringify(result.receipt.diagnostics, null, 2));
  assert.equal(result.receipt.ok, true);
  assert.equal(result.receipt.composition.summary.errors, 0);

  const html = render('snap-fixture', doc);
  const goPoints = compositionPoints(html, 'go');
  const returnPoints = compositionPoints(html, 'return');
  assert.ok(goPoints && returnPoints, 'both go and return transitions must render');
  for (const [id, points] of [['go', goPoints], ['return', returnPoints]]) {
    assert.ok(isXMonotone(points), `${id} is x-monotone (constant-x): ${JSON.stringify(points)}`);
  }
});

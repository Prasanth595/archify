import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Canvas-level sequence failures carry typed diagnostics with measured evidence
// and repairs that clear their own diagnostic.
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'archify');
const cli = path.join(skillRoot, 'bin/archify.mjs');
const HIDDEN_LEGEND = { mode: 'hidden' };

function sequence({ participants = ['client', 'api'], messages, viewBox, quality = 'showcase', columnFit, segments, legend = HIDDEN_LEGEND } = {}) {
  return {
    schema_version: 1,
    diagram_type: 'sequence',
    meta: {
      title: 'Canvas diagnostics',
      output: 'diagram.html',
      quality_profile: quality,
      ...(viewBox ? { viewBox } : {}),
      ...(columnFit ? { column_fit: columnFit } : {}),
      ...(legend ? { legend } : {}),
    },
    participants: participants.map((id) => ({ id, type: 'backend', label: id.toUpperCase() })),
    messages,
    ...(segments ? { segments } : {}),
  };
}

function run(t, command, spec) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-sequence-canvas-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const input = path.join(dir, 'candidate.json');
  const output = path.join(dir, 'canvas.html');
  fs.writeFileSync(input, JSON.stringify(spec));
  const args = command === 'render'
    ? [cli, 'render', 'sequence', input, output]
    : [cli, 'validate', 'sequence', input, '--json'];
  const result = spawnSync(process.execPath, args, { cwd: skillRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  return { result, html: command === 'render' && result.status === 0 ? fs.readFileSync(output, 'utf8') : '' };
}

function validate(t, spec) {
  return run(t, 'validate', spec).result;
}

function failure(t, spec, code) {
  const result = validate(t, spec);
  assert.notEqual(result.status, 0, 'validate must fail');
  const diagnostic = JSON.parse(result.stdout).diagnostics.find((entry) => entry.code === code);
  assert.ok(diagnostic, `expected ${code} in ${result.stdout}`);
  assert.equal(diagnostic.severity, 'error');
  return diagnostic;
}

// Read a diagnostic's single "set /json/pointer to value" repair and apply it.
function applyFix(spec, fix) {
  const [, pointer, value] = fix.match(/^set (\/\S+) to (.+)$/);
  const copy = structuredClone(spec);
  const keys = pointer.slice(1).split('/');
  const parent = keys.slice(0, -1).reduce((node, key) => {
    node[key] ??= {};
    return node[key];
  }, copy);
  parent[keys.at(-1)] = JSON.parse(value);
  return copy;
}

test('a message below the readable timeline reports the band and a verified y repair', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 450, label: 'late reply' }],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.deepEqual(diagnostic.subject, {
    diagramType: 'sequence',
    message: 'late reply',
    path: '/messages/0/y',
    from: 'client',
    to: 'api',
  });
  assert.equal(diagnostic.evidence.y, 450);
  assert.equal(diagnostic.evidence.minimumY, 160);
  assert.equal(diagnostic.evidence.maximumY, 397);
  assert.equal(diagnostic.evidence.viewBoxHeight, 480);
  assert.deepEqual(diagnostic.supportedFixes, ['set /messages/0/y to 397']);
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('a segment above the canvas reports both bounds and a verified start repair', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [{ label: 'Setup', from: 40, to: 300 }],
  });
  const diagnostic = failure(t, spec, 'sequence/segment-outside-canvas');
  assert.deepEqual(diagnostic.subject, {
    diagramType: 'sequence',
    segment: 'Setup',
    collection: 'segments',
    index: 0,
    path: '/segments/0',
  });
  assert.equal(diagnostic.evidence.from, 40);
  assert.equal(diagnostic.evidence.to, 300);
  assert.equal(diagnostic.evidence.minimumY, 72);
  assert.equal(diagnostic.evidence.maximumY, 435);
  assert.deepEqual(diagnostic.supportedFixes, ['set /segments/0/from to 72']);
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('a segment below the canvas reports the end repair instead', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [{ label: 'Cooldown', from: 210, to: 460 }],
  });
  const diagnostic = failure(t, spec, 'sequence/segment-outside-canvas');
  assert.equal(diagnostic.evidence.from, 210);
  assert.equal(diagnostic.evidence.maximumY, 435);
  assert.deepEqual(diagnostic.supportedFixes, ['set /segments/0/to to 435']);
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('a segment label wider than its frame reports the viewBox width it needs', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [{ label: 'Segment label '.repeat(14).trimEnd(), from: 300, to: 400 }],
  });
  const diagnostic = failure(t, spec, 'sequence/segment-label-overflow');
  assert.deepEqual(diagnostic.subject, {
    diagramType: 'sequence',
    segment: 'Segment label '.repeat(14).trimEnd(),
    collection: 'segments',
    index: 0,
    path: '/segments/0/label',
  });
  assert.equal(diagnostic.evidence.viewBoxWidth, 920);
  assert.equal(diagnostic.evidence.labelWidth, 1028);
  assert.equal(diagnostic.evidence.requiredViewBoxWidth, 1132);
  assert.ok(diagnostic.evidence.requiredViewBoxWidth > 920);
  assert.deepEqual(diagnostic.supportedFixes, [`set /meta/viewBox/0 to ${diagnostic.evidence.requiredViewBoxWidth}`]);
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('participants beyond the canvas width report the width the row needs', (t) => {
  const spec = sequence({
    participants: ['p0', 'p1', 'p2', 'p3', 'p4'],
    viewBox: [480, 620],
    columnFit: 'fixed',
    messages: [{ from: 'p0', to: 'p4', y: 200, label: 'fan out' }],
  });
  const diagnostic = failure(t, spec, 'sequence/participants-exceed-canvas');
  assert.deepEqual(diagnostic.subject, { diagramType: 'sequence', path: '/meta/viewBox/0' });
  assert.equal(diagnostic.evidence.viewBoxWidth, 480);
  assert.equal(diagnostic.evidence.viewBoxAuthored, true);
  assert.equal(diagnostic.evidence.lastParticipant, 'p4');
  assert.equal(diagnostic.evidence.participantWidth, 86);
  assert.equal(diagnostic.evidence.rightMargin, 40);
  assert.deepEqual(diagnostic.supportedFixes, [`set /meta/viewBox/0 to ${diagnostic.evidence.requiredViewBoxWidth}`]);
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('an authored canvas with no room for the implicit legend reports the height it needs', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    legend: null,
    messages: [{ from: 'client', to: 'api', y: 390, label: 'settle' }],
  });
  const diagnostic = failure(t, spec, 'sequence/legend-canvas-limit');
  assert.deepEqual(diagnostic.subject, { diagramType: 'sequence', path: '/meta/viewBox/1' });
  assert.equal(diagnostic.evidence.contentBottom, 396);
  assert.equal(diagnostic.evidence.viewBoxHeight, 480);
  assert.equal(diagnostic.evidence.viewBoxAuthored, true);
  assert.ok(diagnostic.evidence.legendHeight > 480);
  assert.equal(diagnostic.evidence.requiredViewBoxHeight, diagnostic.evidence.legendHeight);
  assert.deepEqual(diagnostic.supportedFixes, [`set /meta/viewBox/1 to ${diagnostic.evidence.legendHeight}`]);
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('repeated canvas failures of one kind keep their own subject and repair', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [
      { label: 'Setup', from: 40, to: 190 },
      { label: 'Cooldown', from: 210, to: 460 },
    ],
  });
  const result = validate(t, spec);
  assert.notEqual(result.status, 0, 'validate must fail');
  const entries = JSON.parse(result.stdout).diagnostics.filter((entry) => entry.code === 'sequence/segment-outside-canvas');
  assert.equal(entries.length, 2);
  assert.deepEqual(entries.map((entry) => entry.subject.path), ['/segments/0', '/segments/1']);
  assert.deepEqual(entries.map((entry) => entry.evidence.from), [40, 210]);
  assert.deepEqual(
    entries.flatMap((entry) => entry.supportedFixes),
    ['set /segments/0/from to 72', 'set /segments/1/to to 435'],
  );
  let repaired = spec;
  for (const entry of entries) {
    for (const fix of entry.supportedFixes) repaired = applyFix(repaired, fix);
  }
  assert.equal(validate(t, repaired).status, 0);
});

test('a crossing segment reports both the start and the end repair', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [{ label: 'Migration', from: 40, to: 460 }],
  });
  const diagnostic = failure(t, spec, 'sequence/segment-outside-canvas');
  assert.deepEqual(diagnostic.supportedFixes, ['set /segments/0/from to 72', 'set /segments/0/to to 435']);
  let repaired = spec;
  for (const fix of diagnostic.supportedFixes) repaired = applyFix(repaired, fix);
  assert.equal(validate(t, repaired).status, 0);
});

test('the participants repair authors a viewBox when the canvas is automatic', (t) => {
  const ids = Array.from({ length: 12 }, (_, index) => `p${index}`);
  const spec = sequence({
    participants: ids,
    messages: [{ from: 'p0', to: 'p11', y: 200, label: 'fan out' }],
  });
  const diagnostic = failure(t, spec, 'sequence/participants-exceed-canvas');
  assert.equal(diagnostic.evidence.viewBoxAuthored, false);
  assert.deepEqual(diagnostic.subject, { diagramType: 'sequence', path: '/meta/viewBox/0' });
  assert.deepEqual(
    diagnostic.supportedFixes,
    [`set /meta/viewBox to [${diagnostic.evidence.requiredViewBoxWidth}, 480]`],
    'an automatic canvas has no meta.viewBox/0 to raise',
  );
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('a taller automatic canvas keeps its measured height when the repair authors a viewBox', (t) => {
  const ids = Array.from({ length: 12 }, (_, index) => `p${index}`);
  const spec = sequence({
    participants: ids,
    messages: [{ from: 'p0', to: 'p11', y: 200, label: 'fan out' }],
    segments: [{ label: 'Tall', from: 300, to: 600 }],
  });
  const diagnostic = failure(t, spec, 'sequence/participants-exceed-canvas');
  assert.deepEqual(
    diagnostic.supportedFixes,
    [`set /meta/viewBox to [${diagnostic.evidence.requiredViewBoxWidth}, 665]`],
    'the measured automatic height survives the authored viewBox',
  );
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('the segment label repair authors a schema-legal height on an automatic canvas', (t) => {
  const spec = sequence({
    participants: ['p0', 'p1', 'p2', 'p3'],
    messages: [{ from: 'p0', to: 'p3', y: 200, label: 'request' }],
    segments: [{ label: 'Segment label '.repeat(14).trimEnd(), from: 300, to: 400 }],
  });
  const diagnostic = failure(t, spec, 'sequence/segment-label-overflow');
  const required = diagnostic.evidence.requiredViewBoxWidth;
  assert.deepEqual(
    diagnostic.supportedFixes,
    [`set /meta/viewBox to [${required}, 480]`],
    'the authored height must respect the schema minimum of 480',
  );
  const repaired = validate(t, applyFix(spec, diagnostic.supportedFixes[0]));
  assert.equal(repaired.status, 0, repaired.stdout);
});

test('a message repair that would land on a segment border is withheld', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 450, label: 'late reply' }],
    segments: [{ label: 'Cooldown', from: 200, to: 395 }],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.equal(diagnostic.evidence.maximumY, 397);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'the clamp would sit 2px from the segment border and fail the border-run check',
  );
});

test('rejected message repairs keep distinct subjects and offer no fix', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [
      { from: 'client', to: 'api', y: 410, label: 'first' },
      { from: 'client', to: 'api', y: 420, label: 'second' },
    ],
  });
  const result = validate(t, spec);
  assert.notEqual(result.status, 0, 'validate must fail');
  const entries = JSON.parse(result.stdout).diagnostics.filter((entry) => entry.code === 'sequence/message-outside-timeline');
  assert.deepEqual(entries.map((entry) => entry.subject.path), ['/messages/0/y', '/messages/1/y']);
  assert.deepEqual(entries.map((entry) => entry.supportedFixes), [[], []], 'each clamp would crowd the other');
});

test('repeated message repairs clear their own diagnostic individually', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [
      { from: 'client', to: 'api', y: 450, label: 'first' },
      { from: 'client', to: 'api', y: 470, label: 'second' },
    ],
  });
  const result = validate(t, spec);
  assert.notEqual(result.status, 0, 'validate must fail');
  const entries = JSON.parse(result.stdout).diagnostics.filter((entry) => entry.code === 'sequence/message-outside-timeline');
  assert.deepEqual(entries.map((entry) => entry.subject.path), ['/messages/0/y', '/messages/1/y']);
  assert.deepEqual(entries.map((entry) => entry.supportedFixes), [
    ['set /messages/0/y to 397'],
    ['set /messages/1/y to 397'],
  ]);
  const repaired = validate(t, applyFix(spec, entries[0].supportedFixes[0]));
  assert.notEqual(repaired.status, 0, 'the second message is still outside the band');
  const remaining = JSON.parse(repaired.stdout).diagnostics.filter((entry) => entry.code === 'sequence/message-outside-timeline');
  assert.deepEqual(remaining.map((entry) => entry.subject.path), ['/messages/1/y'], 'the repaired message no longer reports');
  const mirrored = validate(t, applyFix(spec, entries[1].supportedFixes[0]));
  assert.notEqual(mirrored.status, 0, 'the first message is still outside the band');
  const mirroredRemaining = JSON.parse(mirrored.stdout).diagnostics.filter((entry) => entry.code === 'sequence/message-outside-timeline');
  assert.deepEqual(mirroredRemaining.map((entry) => entry.subject.path), ['/messages/0/y'], 'the mirrored repair clears only its own diagnostic');
});

test('fully off-canvas segments offer no bound that cannot clear the range', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [
      { label: 'Above', from: 10, to: 30 },
      { label: 'Below', from: 460, to: 470 },
    ],
  });
  const result = validate(t, spec);
  assert.notEqual(result.status, 0, 'validate must fail');
  const entries = JSON.parse(result.stdout).diagnostics.filter((entry) => entry.code === 'sequence/segment-outside-canvas');
  assert.deepEqual(entries.map((entry) => entry.subject.path), ['/segments/0', '/segments/1']);
  assert.deepEqual(entries.map((entry) => entry.supportedFixes), [[], []], 'clamping one bound cannot make the range valid');
});

test('a segment repair that would overlap another label is withheld', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [
      { label: 'Alpha', from: 40, to: 300 },
      { label: 'Beta', from: 100, to: 400 },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/segment-outside-canvas');
  assert.equal(diagnostic.subject.path, '/segments/0');
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'moving Alpha to 72 would place its label on the Beta label',
  );
});

test('sibling segments eligible for the same repair are withheld together', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    messages: [{ from: 'client', to: 'api', y: 200, label: 'request' }],
    segments: [
      { label: 'Alpha', from: 40, to: 300 },
      { label: 'Beta', from: 60, to: 400 },
    ],
  });
  const result = validate(t, spec);
  assert.notEqual(result.status, 0, 'validate must fail');
  const entries = JSON.parse(result.stdout).diagnostics.filter((entry) => entry.code === 'sequence/segment-outside-canvas');
  assert.deepEqual(entries.map((entry) => entry.subject.path), ['/segments/0', '/segments/1']);
  assert.deepEqual(
    entries.map((entry) => entry.supportedFixes),
    [[], []],
    'both repairs would land the labels on the same fallback slot',
  );
});

test('a standard message repair landing exactly on a segment border is withheld', (t) => {
  const spec = sequence({
    viewBox: [920, 480],
    quality: 'standard',
    messages: [{ from: 'client', to: 'api', y: 450, label: 'late' }],
    segments: [{ label: 'Cooldown', from: 150, to: 397 }],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.equal(diagnostic.evidence.maximumY, 397);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'an exact border overlap fails composition/container-border-run in every profile',
  );
});

test('the message clamp is withheld when the moved message would leave a segment label covering it', (t) => {
  const spec = sequence({
    participants: ['a', 'b', 'c'],
    viewBox: [480, 480],
    messages: [
      { from: 'b', to: 'c', y: 450, label: 'late reply' },
      { from: 'a', to: 'b', y: 375, label: 'first request' },
      { from: 'a', to: 'b', y: 331, label: 'second request' },
    ],
    segments: [{ label: 'Phase title '.repeat(4).trimEnd(), from: 419, to: 430 }],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.equal(diagnostic.evidence.maximumY, 397);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'applying the clamp would replace the failure with sequence/segment-label-overlap',
  );
});

test('the message clamp stays withheld when the offending message carries a note', (t) => {
  const spec = sequence({
    participants: ['a', 'b', 'c'],
    viewBox: [480, 480],
    messages: [
      { from: 'b', to: 'c', y: 450, label: 'late reply', note: 'Keep the retry budget small.' },
      { from: 'a', to: 'b', y: 375, label: 'first request' },
      { from: 'a', to: 'b', y: 331, label: 'second request' },
    ],
    segments: [{ label: 'Phase title '.repeat(4).trimEnd(), from: 424, to: 430 }],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'the note moves with the message, so the clamp would leave the segment label covering it',
  );
});

test('the note-overlap clamp is withheld when the blocker would land under a segment label', (t) => {
  const spec = sequence({
    participants: ['a', 'b'],
    viewBox: [560, 480],
    messages: [
      { from: 'a', to: 'b', y: 300, label: 'first', note: 'Keep the retry budget small and local.' },
      { from: 'a', to: 'b', y: 315, label: 'second', note: 'The retry budget stays small because every failed attempt counts against a shared quota that the gateway refreshes on a rolling window.' },
    ],
    segments: [{ label: 'Phase title Phase title Phase title Phase t', from: 390, to: 410 }],
  });
  const diagnostic = failure(t, spec, 'sequence/note-overlap');
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'moving the blocker down would replace this failure with sequence/segment-label-overlap',
  );
});

test('the note-overlap clamp is withheld when the blocker\u2019s own note would pass the canvas limit', (t) => {
  const spec = sequence({
    participants: ['a', 'b'],
    viewBox: [560, 480],
    messages: [
      { from: 'a', to: 'b', y: 318, label: 'first', note: 'Keep the retry budget small and local. Every failed attempt counts against a shared quota, and the gateway refreshes that quota on a rolling window, so bursts of retries are especially expensive.' },
      { from: 'a', to: 'b', y: 370, label: 'second', note: 'The retry budget stays small because every failed attempt counts against a shared quota that the gateway refreshes on a rolling window.' },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/note-overlap');
  assert.equal(diagnostic.evidence.requiredY, 395);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'the blocker\u2019s own note would end below the canvas content limit after the move',
  );
});

test('the note-overlap clamp stays offered on an automatic canvas', (t) => {
  const spec = sequence({
    participants: ['a', 'b'],
    messages: [
      { from: 'a', to: 'b', y: 318, label: 'first', note: 'Keep the retry budget small and local. Every failed attempt counts against a shared quota, and the gateway refreshes that quota on a rolling window, so bursts of retries are especially expensive.' },
      { from: 'a', to: 'b', y: 370, label: 'second', note: 'The retry budget stays small because every failed attempt counts against a shared quota that the gateway refreshes on a rolling window.' },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/note-overlap');
  assert.equal(diagnostic.evidence.requiredY, 395);
  assert.deepEqual(
    diagnostic.supportedFixes,
    ['set /messages/1/y to 395'],
    'an automatic canvas regrows, so the moved note stays inside the content limit',
  );
});

test('the message clamp is withheld when two segment titles would share the fallback slot', (t) => {
  const spec = sequence({
    participants: ['a', 'b', 'c'],
    viewBox: [480, 480],
    messages: [{ from: 'b', to: 'c', y: 450, label: 'late reply' }],
    segments: [
      { label: 'Phase title '.repeat(4).trimEnd(), from: 419, to: 430 },
      { label: 'Beta', from: 375, to: 390 },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.equal(diagnostic.evidence.maximumY, 397);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'applying the clamp would land both segment titles on y=353, where they overlap each other',
  );
});

test('the two-title clamp guard also holds in the standard profile', (t) => {
  const spec = sequence({
    participants: ['a', 'b', 'c'],
    viewBox: [480, 480],
    quality: 'standard',
    messages: [{ from: 'b', to: 'c', y: 450, label: 'late reply' }],
    segments: [
      { label: 'Phase title '.repeat(4).trimEnd(), from: 419, to: 430 },
      { label: 'Beta', from: 375, to: 390 },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.equal(diagnostic.evidence.maximumY, 397);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'the overlapping-label failure is checked in every profile, so the clamp is withheld there too',
  );
});

test('the clamp stays offered when the second title keeps clear of the fallback slot', (t) => {
  const spec = sequence({
    participants: ['a', 'b', 'c'],
    viewBox: [480, 480],
    messages: [{ from: 'b', to: 'c', y: 450, label: 'late reply' }],
    segments: [
      { label: 'Phase title '.repeat(4).trimEnd(), from: 419, to: 430 },
      { label: 'Beta', from: 250, to: 380 },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/message-outside-timeline');
  assert.deepEqual(
    diagnostic.supportedFixes,
    ['set /messages/0/y to 397'],
    'with no second title in the fallback slot the clamp still clears its own diagnostic',
  );
});

test('the note-overlap clamp is withheld when the move would empty the implicit legend band', (t) => {
  const spec = sequence({
    participants: ['a', 'b'],
    viewBox: [560, 480],
    legend: null,
    messages: [
      { from: 'a', to: 'b', y: 318, label: 'first', note: Array(24).fill('word').join(' ') },
      { from: 'a', to: 'b', y: 370, label: 'second' },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/note-overlap');
  assert.equal(diagnostic.evidence.requiredY, 384);
  assert.deepEqual(
    diagnostic.supportedFixes,
    [],
    'moving the blocker down would leave no room for the implicit showcase legend, replacing this failure with sequence/legend-canvas-limit',
  );
});

test('the same blocker move stays offered with the legend hidden', (t) => {
  const spec = sequence({
    participants: ['a', 'b'],
    viewBox: [560, 480],
    messages: [
      { from: 'a', to: 'b', y: 318, label: 'first', note: Array(24).fill('word').join(' ') },
      { from: 'a', to: 'b', y: 370, label: 'second' },
    ],
  });
  const diagnostic = failure(t, spec, 'sequence/note-overlap');
  assert.deepEqual(
    diagnostic.supportedFixes,
    ['set /messages/1/y to 384'],
    'without a legend band the moved blocker still clears its own diagnostic',
  );
});

test('the participant width repair steps past a floating-point-equal width', (t) => {
  const spec = sequence({
    participants: Array.from({ length: 12 }, (_, index) => `p${index}`),
    viewBox: [2059, 480],
    messages: [{ from: 'p0', to: 'p11', y: 200, label: 'ping' }],
  });
  const diagnostic = failure(t, spec, 'sequence/participants-exceed-canvas');
  assert.equal(diagnostic.evidence.requiredViewBoxWidth, 2060);
  assert.deepEqual(
    diagnostic.supportedFixes,
    ['set /meta/viewBox/0 to 2060'],
    'a fractional column gap must not publish a width equal to the current one',
  );
  const repaired = JSON.parse(JSON.stringify(spec));
  repaired.meta.viewBox[0] = 2060;
  const codes = (JSON.parse(validate(t, repaired).stdout).diagnostics ?? []).map((entry) => entry.code);
  assert.deepEqual(
    codes,
    ['composition/desktop-readability'],
    'the bumped width clears its own diagnostic; the only remainder is the documented wide-canvas readability note',
  );
});

test('the suggestion re-evaluates the spread row at the widened canvas', (t) => {
  const spec = sequence({
    participants: Array.from({ length: 31 }, (_, index) => `p${index}`),
    viewBox: [4099, 480],
    messages: [{ from: 'p0', to: 'p30', y: 200, label: 'ping' }],
  });
  const diagnostic = failure(t, spec, 'sequence/participants-exceed-canvas');
  assert.deepEqual(
    diagnostic.supportedFixes,
    ['set /meta/viewBox/0 to 4102'],
    'the offered width must clear the row the wider canvas produces, not just the current one',
  );
  const repaired = JSON.parse(JSON.stringify(spec));
  repaired.meta.viewBox[0] = 4102;
  const codes = (JSON.parse(validate(t, repaired).stdout).diagnostics ?? []).map((entry) => entry.code);
  assert.ok(
    !codes.includes('sequence/participants-exceed-canvas'),
    'the offered width clears this diagnostic in one application',
  );
});

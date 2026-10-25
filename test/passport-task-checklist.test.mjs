import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSchema } from '../archify/renderers/shared/validator.mjs';
import { verifyRepositoryEvidence } from '../archify/renderers/shared/repository-evidence.mjs';
import { fixture, run, evidencePayload } from './helpers/repository-evidence-fixture.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..', 'archify');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-passport-task-checklist-'));

const CASES = {
  architecture: ['web-app.architecture.json', 'components'],
  workflow: ['agent-tool-call.workflow.json', 'nodes'],
  sequence: ['cache-miss-request.sequence.json', 'participants'],
  dataflow: ['product-analytics.dataflow.json', 'nodes'],
  lifecycle: ['agent-run.lifecycle.json', 'states'],
};

const TASKS = [
  { title: 'Zebra-quartz review task', status: 'needs-review', criteria: 'Sentinel criteria that must stay out of the SVG.' },
  { title: 'Expire idle sessions', status: 'pending' },
];

function example(mode) {
  return JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', CASES[mode][0]), 'utf8'));
}

function withTaskChecklist(mode, tasks = TASKS) {
  const diagram = example(mode);
  const collection = diagram[CASES[mode][1]];
  collection[0].task_checklist = tasks;
  return { diagram, id: collection[0].id };
}

function write(mode, diagram, name) {
  const input = path.join(tmp, `${mode}-${name}.json`);
  fs.writeFileSync(input, JSON.stringify(diagram));
  return input;
}

function render(mode, input) {
  const output = path.join(tmp, `${path.basename(input, '.json')}.html`);
  execFileSync(process.execPath, [path.join(skillRoot, `renderers/${mode}/render-${mode}.mjs`), input, output]);
  return fs.readFileSync(output, 'utf8');
}

function svg(html) {
  return html.match(/<svg\b[\s\S]*?<\/svg>/)?.[0] || '';
}

function taskChecklistPayload(html) {
  const block = html.match(/<script id="archify-task-checklists-data" type="application\/json">([\s\S]*?)<\/script>/);
  return block ? JSON.parse(block[1]) : null;
}

test('every semantic node collection accepts an optional task checklist and enforces its task rules', () => {
  // These rules are schema-only: exercise each generated type validator directly.
  const rejected = {
    'unknown status': [{ title: 'Task', status: 'done' }],
    'pending task with sources': [{ title: 'Task', status: 'pending', sources: [{ path: 'src/router.js' }] }],
    'implemented task without sources': [{ title: 'Task', status: 'implemented' }],
    'empty task checklist': [],
    'more than twelve tasks': Array.from({ length: 13 }, (_, index) => ({ title: `Task ${index}`, status: 'pending' })),
    'unknown task field': [{ title: 'Task', status: 'pending', confidence: 0.86 }],
  };
  for (const mode of Object.keys(CASES)) {
    assert.doesNotThrow(() => validateSchema(mode, withTaskChecklist(mode).diagram), mode);
    for (const [name, tasks] of Object.entries(rejected)) {
      assert.throws(() => validateSchema(mode, withTaskChecklist(mode, tasks).diagram),
        (error) => error.archifyDiagnostics.some(({ subject }) => subject.path.includes('/task_checklist')),
        `${mode}: ${name} must fail`);
    }
  }
});

test('task checklists ride in one JSON block outside the SVG; diagrams without one carry none', () => {
  for (const mode of Object.keys(CASES)) {
    const { diagram, id } = withTaskChecklist(mode);
    // One case renders in zh-CN: the chrome localizes while authored tasks ship verbatim.
    if (mode === 'sequence') diagram.meta.locale = 'zh-CN';
    const html = render(mode, write(mode, diagram, 'render'));
    assert.deepEqual(taskChecklistPayload(html), { [id]: TASKS }, mode);
    assert.doesNotMatch(svg(html), /Zebra-quartz|Sentinel criteria/, `${mode}: task checklist leaked into the SVG`);
    assert.match(html, /<details class="semantic-passport-task-checklist" id="focus-task-checklist" hidden>/, mode);
    if (mode === 'sequence') assert.match(html, /<span class="semantic-passport-task-checklist-label">任务清单<\/span>/);
  }
  const plain = render('architecture', write('architecture', example('architecture'), 'plain'));
  assert.equal(taskChecklistPayload(plain), null, 'no task checklist, no block');
  assert.doesNotMatch(plain, /ARCHIFY:TASK_CHECKLISTS_DATA/, 'placeholder must be consumed');
});

test('task sources are verified against the pinned repository like node sources', () => {
  const data = fixture();
  const node = data.diagram.components[0];
  node.task_checklist = [
    { title: 'Route requests by kind', status: 'implemented', sources: [{ path: 'src/router.js', line: 1, end_line: 3 }] },
    { title: 'Keep sessions in a store', status: 'needs-review', sources: [{ path: 'src/store.js' }] },
    { title: 'Expire idle sessions', status: 'pending' },
  ];
  fs.writeFileSync(data.input, JSON.stringify(data.diagram));
  const output = path.join(data.root, 'task-checklist.html');
  const result = run(['render', 'architecture', data.input, output, '--repo-root', data.root]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const html = fs.readFileSync(output, 'utf8');

  const evidence = evidencePayload(html);
  assert.deepEqual(evidence.nodes[node.id].map((source) => source.path), ['src/router.js', 'src/store.js'], 'node sources still verify');
  const tasks = evidence.taskChecklists[node.id];
  assert.equal(tasks.length, 3);
  assert.deepEqual(tasks[0].map(({ path: sourcePath, line, endLine }) => ({ sourcePath, line, endLine })), [{ sourcePath: 'src/router.js', line: 1, endLine: 3 }]);
  assert.match(tasks[0][0].href, new RegExp(`/blob/${data.revision}/src/router\\.js#L1-L3$`));
  assert.deepEqual(tasks[1].map((source) => source.path), ['src/store.js']);
  assert.deepEqual(tasks[2], [], 'a pending task has no verified sources');

  const authored = taskChecklistPayload(html)[node.id];
  assert.deepEqual(authored.map(({ status }) => status), ['implemented', 'needs-review', 'pending']);
  assert.ok(authored.every((task) => !('sources' in task)), 'only verified sources reach the page');

  node.task_checklist[0].sources = [{ path: 'src/missing.js' }];
  fs.writeFileSync(data.input, JSON.stringify(data.diagram));
  const missing = run(['validate', 'architecture', data.input, '--repo-root', data.root, '--json']);
  assert.equal(missing.status, 1);
  assert.deepEqual(JSON.parse(missing.stdout).diagnostics.map(({ code, subject }) => [code, subject.path]), [
    ['repository-evidence/file-missing', '/components/0/task_checklist/0/sources/0/path'],
  ], 'a missing task source fails with the task path');

  // Task sources alone still need the pinned repository.
  delete node.sources;
  delete data.diagram.meta.repository;
  assert.throws(() => verifyRepositoryEvidence('architecture', data.diagram, data.root),
    (error) => error.archifyDiagnostics[0].code === 'repository-evidence/repository-required');
});

process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';

// Aggregate the existing native receipts without changing their identity or claims.
const base = path.dirname(fileURLToPath(import.meta.url));
const read = file => JSON.parse(fs.readFileSync(path.join(base, file), 'utf8'));
const digest = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const write = (file, data) => fs.writeFileSync(path.join(base, file), JSON.stringify(data, null, 2) + '\n');
const catalog = read('catalog.json');
const versions = read('versions.json');
const coverage = read('coverage.json');
const navigation = read('navigation-validation.json');
const review = read('visual-review.json');
const reviewed = new Map(review.diagrams.map(entry => [entry.id, entry]));
const ids = new Map(catalog.diagrams.map(entry => [entry.id, entry]));
const required = new Set(coverage.requirements.flatMap(group => group.diagramIds));
assert.equal(required.size, ids.size, 'Coverage size');
for (const id of ids.keys()) assert.ok(required.has(id), 'Unmapped design: ' + id);
assert.equal(coverage.diagramCount, ids.size);
assert.equal(navigation.ok, true);
assert.ok(navigation.tests.every(test => test.ok));
assert.equal(navigation.indexSha256, digest(path.join(base, 'index.html')), 'Stale index browser record');

const entries = [];
for (const entry of catalog.diagrams) {
  const input = path.join(base, entry.input);
  const output = path.join(base, entry.output);
  const folder = path.dirname(output);
  const specificationSha256 = digest(input);
  const artifactSha256 = digest(output);
  assert.equal(specificationSha256, entry.specificationSha256, entry.id + ' catalog digest');
  const pointer = JSON.parse(fs.readFileSync(path.join(folder, 'evidence/current.json')));
  const summaryFile = path.join(folder, pointer.summary);
  const summary = JSON.parse(fs.readFileSync(summaryFile));
  const fullFile = path.join(path.dirname(summaryFile), entry.id + '.finalize.json');
  const full = JSON.parse(fs.readFileSync(fullFile));
  for (const receipt of [summary, full]) {
    assert.equal(receipt.ok, true, entry.id + ' acceptance');
    assert.equal(receipt.quality, 'showcase');
    assert.equal(receipt.specification.sha256, specificationSha256, entry.id + ' specification');
    assert.equal(receipt.artifact.sha256, artifactSha256, entry.id + ' artifact');
    assert.equal(receipt.diagnostics.length, 0, entry.id + ' diagnostics');
  }
  for (const name of ['validate', 'deliver', 'check', 'browser-check']) {
    assert.equal(summary.gates[name], 'pass', entry.id + ' ' + name);
    assert.equal(full.stages[name].status, 'pass');
    assert.equal(full.stages[name].exitCode, 0);
  }
  const validation = full.stages.validate.receipt.validation;
  assert.equal(validation.errors, 0);
  assert.equal(validation.warnings, 0);
  const artifact = full.stages.check.receipt;
  assert.equal(artifact.provenance, 'current');
  assert.equal(artifact.artifact.sha256, artifactSha256);
  assert.equal(artifact.checks.length, 9);
  assert.ok(artifact.checks.every(check => check.ok));
  assert.equal(artifact.composition.summary.errors, 0);
  assert.equal(artifact.composition.summary.warnings, 0);
  assert.equal(artifact.composition.issues.length, 0);
  const evidence = full.stages.deliver.receipt.evidence;
  assert.equal(evidence.verified, true, entry.id + ' source evidence');
  assert.equal(evidence.revision, versions.repositories[entry.repository].revision);
  const specification = JSON.parse(fs.readFileSync(input));
  assert.equal(specification.meta.repository.revision, evidence.revision);
  assert.equal(specification.components.length, entry.nodeCount);
  assert.equal(specification.connections.length, entry.edgeCount);
  for (const node of specification.components) assert.ok(node.sources?.length, entry.id + ':' + node.id);
  const parents = new Set([entry.id]);
  let parent = entry.parent;
  while (parent) {
    assert.ok(ids.has(parent), 'Missing parent ' + parent);
    assert.ok(!parents.has(parent), 'Parent cycle ' + parent);
    parents.add(parent);
    parent = ids.get(parent).parent;
  }
  if (entry.id !== 'core') assert.ok(parents.has('core'), 'Orphan ' + entry.id);
  const browser = full.stages['browser-check'].receipt;
  assert.equal(browser.ok, true);
  assert.equal(browser.status, 'pass');
  assert.equal(browser.chrome.status, 'available');
  assert.equal(browser.artifact.sha256, artifactSha256);
  for (const field of ['containment', 'themeStates', 'readability', 'viewerChrome']) {
    assert.equal(browser[field].status, 'pass', entry.id + ' browser ' + field);
    assert.ok(browser[field].viewports.every(viewport => viewport.ok), entry.id + ' ' + field + ' viewports');
  }
  const themes = new Set(browser.themeStates.viewports.map(viewport => viewport.resolvedTheme));
  assert.ok(themes.has('light') && themes.has('dark'));
  const captures = JSON.parse(fs.readFileSync(path.join(folder, 'captures/record.json')));
  assert.equal(captures.artifactSha256, artifactSha256);
  assert.equal(captures.captures.length, 2);
  const previews = captures.captures.map(capture => {
    const nativeFile = path.join(folder, capture.path);
    assert.equal(digest(nativeFile), capture.sha256, entry.id + ' capture');
    assert.equal(capture.includesLowerDiagramAndNotes, true);
    const file = capture.theme === 'light' ? 'preview.png' : 'preview-dark.png';
    const previewFile = path.join(folder, file);
    if (capture.theme === 'dark' && !fs.existsSync(previewFile)) fs.copyFileSync(nativeFile, previewFile);
    assert.equal(digest(previewFile), capture.sha256, entry.id + ' portable preview');
    return {theme: capture.theme, path: entry.section + '/' + entry.id + '/' + file,
      sha256: capture.sha256, width: capture.width, height: capture.height, fullPage: true};
  });
  const visual = reviewed.get(entry.id);
  assert.equal(visual?.status, 'layout-reviewed');
  assert.equal(visual.artifactSha256, artifactSha256, entry.id + ' visual review identity');
  assert.deepEqual(visual.captureSha256, Object.fromEntries(previews.map(preview => [preview.theme, preview.sha256])));
  assert.equal(navigation.wrapperSha256[entry.id], digest(path.join(base, entry.navigation)));
  entries.push({id: entry.id, section: entry.section, specification: {path: entry.input, sha256: specificationSha256},
    artifact: {path: entry.output, sha256: artifactSha256, bytes: fs.statSync(output).size},
    gates: summary.gates, artifactChecks: {passed: 9, total: 9}, errors: 0, warnings: 0,
    sources: {repository: entry.repository, revision: evidence.revision, references: evidence.references},
    nativeReceipt: {sha256: digest(fullFile), summarySha256: digest(summaryFile), startedAt: full.startedAt,
      finishedAt: full.finishedAt, visualReview: full.visualReview},
    composition: {resolvedCrossovers: artifact.composition.metrics.resolvedCrossovers,
      routesOverSuggestedBends: artifact.composition.metrics.routesOverSuggestedBends},
    browser: {engine: 'Microsoft Edge Chromium', containment: browser.containment.viewports.map(viewport => ({
      width: viewport.width, height: viewport.height, theme: viewport.theme, ok: viewport.ok,
      verticalScrollAccepted: viewport.verticalScrollAccepted, horizontalOverflow: viewport.overflowX})),
      themes: browser.themeStates.viewports, minimumProjectedNodeTextPx: browser.readability.minimumProjectedNodeTextPx,
      status: 'pass'}, previews, visualReview: {status: visual.status, scope: visual.scope, sheet: visual.sheet}});
}
const result = {schemaVersion: 1, kind: 'portable-atlas-validation-summary', ok: true,
  note: 'Extracted from native Archify finalize receipts. Native absolute-path records remain local; this file is an atlas summary, not a replacement or a newly executed native receipt.',
  tool: versions.archify, configuration: versions.configuration,
  totals: {diagrams: entries.length, gatesPassed: entries.length * 4, artifactChecksPassed: entries.length * 9,
    artifactChecksPerDiagram: '9/9', errors: 0, warnings: 0, fullPageCaptures: entries.length * 2,
    contactSheetLayoutReviews: review.diagrams.length, orphans: 0, missingRequirementPages: 0},
  navigation: {path: 'navigation-validation.json', sha256: digest(path.join(base, 'navigation-validation.json')),
    localLinksChecked: navigation.localLinksChecked, browserTests: navigation.tests.length, status: 'pass'},
  manifest: Object.fromEntries(['versions.json', 'configuration.json', 'catalog.json', 'coverage.json', 'index.html', 'README.md', 'visual-review.json']
    .map(file => [file, digest(path.join(base, file))])),
  visualReview: {record: 'visual-review.json', method: review.method, limitation: review.limitation},
  failed: [], diagrams: entries};
write('validation.json', result);
console.log(JSON.stringify({ok: true, ...result.totals, links: navigation.localLinksChecked}));

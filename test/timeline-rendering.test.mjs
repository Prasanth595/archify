import { test } from 'node:test';
import { createScratchDirectory } from './helpers/scratch-directory.mjs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillRoot = path.resolve(__dirname, '..', 'archify');
const renderer = path.join(skillRoot, 'renderers', 'timeline', 'render-timeline.mjs');
const checker = path.join(skillRoot, 'scripts', 'check-render-output.mjs');
const small = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'payment-incident.timeline.json'), 'utf8'));
const large = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples', 'archify-dev-activity.timeline.json'), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));

function run(diagram, extra = []) {
  const directory = createScratchDirectory(path.join(os.tmpdir(), 'archify-timeline-'));
  const input = path.join(directory, 'candidate.timeline.json');
  const output = path.join(directory, 'candidate.html');
  fs.writeFileSync(input, JSON.stringify(diagram));
  return { ...spawnSync(process.execPath, [renderer, input, output, ...extra], { cwd: directory, encoding: 'utf8' }), output };
}
function layoutOf(diagram) {
  const result = run(diagram, ['--layout-json']);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}
const overlap = (a, b) => a.left < b.left + b.width && b.left < a.left + a.width && a.top < b.top + b.height && b.top < a.top + a.height;

test('timeline: subsecond events retain their time in cards and accessible context', () => {
  const diagram = clone(small);
  diagram.meta.timezone = 'Asia/Kolkata';
  diagram.events = [
    { id: 'sent', title: 'Request sent', at: '2026-10-01T10:00:00.007Z', lane: 'release' },
    { id: 'reply', title: 'Reply received', at: '2026-10-01T15:30:00.900+05:30', lane: 'release' },
    { id: 'done', title: 'Finished', at: '2026-10-01T10:00:01Z', lane: 'release' },
  ];
  const result = run(diagram);
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(result.output, 'utf8');
  for (const [id, time] of [['sent', '15:30:00.007'], ['reply', '15:30:00.900'], ['done', '15:30:01']]) {
    const node = html.match(new RegExp(`<g [^>]*data-node-id="${id}"[^>]*>[\\s\\S]*?</g>`))?.[0];
    assert.ok(node, id);
    assert.ok(node.includes(`UTC+05:30`), node);
    assert.ok(node.includes(`10-01 ${time} UTC+05:30`), node);
    assert.ok(node.includes(`>${time}</text>`), node);
  }
  const axisLabels = [...html.matchAll(/<text [^>]*class="[^"]*\btl-tick\b[^"]*"[^>]*>([^<]*)<\/text>/g)].map(([, label]) => label);
  assert.ok(axisLabels.includes('15:30:00.007'), axisLabels.join(', '));
  const report = layoutOf(diagram);
  assert.equal(report.events[1].t - report.events[0].t, 893);
  assert.ok(report.events[1].x > report.events[0].x);
  for (const card of report.events) for (const other of report.events) {
    if (card.id < other.id) assert.ok(!overlap(card, other), `${card.id} overlaps ${other.id}`);
  }
});

test('timeline: both examples render and pass the showcase artifact checks', () => {
  for (const diagram of [small, large]) {
    const result = run(diagram);
    assert.equal(result.status, 0, result.stderr);
    const receipt = JSON.parse(spawnSync(process.execPath, [checker, result.output], { encoding: 'utf8' }).stdout);
    assert.equal(receipt.ok, true, JSON.stringify(receipt.checks.filter((entry) => !entry.ok)));
    assert.equal(receipt.composition.summary.errors, 0);
  }
});

test('timeline: duplicate lane IDs fail before visual and accessible ownership diverge', () => {
  const diagram = clone(small);
  diagram.lanes.push({ ...diagram.lanes[0], label: 'Conflicting lane' });
  const result = run(diagram);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /timeline\/duplicate-lane-id/);
  assert.match(result.stderr, /Give every lane a unique id/);
  assert.equal(fs.existsSync(result.output), false);
});

test('timeline: position is linear in time on one shared axis across lanes', () => {
  const report = layoutOf(small);
  assert.equal(report.breaks.length, 0);
  const [a, b, c] = report.events;
  // 10:00, 10:05, 10:10 in different lanes: equal time steps are equal x steps.
  assert.ok(Math.abs((b.x - a.x) - (c.x - b.x)) < 0.02);
  assert.notEqual(a.lane, b.lane);
  // Every tick sits at its own timestamp on the same scale.
  for (const tick of report.ticks) {
    assert.ok(Math.abs(tick.x - (a.x + (tick.t - a.t) * report.scalePxPerMinute / 60000)) < 0.05);
  }
});

test('timeline: events are drawn in chronological order whatever the authored order', () => {
  const diagram = clone(small);
  diagram.events.reverse();
  const report = layoutOf(diagram);
  const times = report.events.map((event) => event.t);
  assert.deepEqual(times, [...times].sort((x, y) => x - y));
  assert.ok(report.events.every((event, index, all) => !index || event.x >= all[index - 1].x));
});

test('timeline: historical years retain the actual display-zone UTC offset', () => {
  for (const year of ['0000', '0001', '0099', '0100', '2026']) {
    const diagram = clone(small);
    diagram.meta.timezone = 'UTC';
    diagram.events = [{ id: 'event', at: `${year}-01-01T00:00:00Z`, title: 'Historical event', lane: diagram.lanes[0].id }];
    const result = run(diagram);
    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(result.output, 'utf8');
    assert.match(html, /UTC\+00:00/);
    assert.doesNotMatch(html, /UTC\+\d{3,}:/);
  }
});

test('timeline: offsets are honoured, so the same instant in two offsets aligns', () => {
  const diagram = clone(small);
  diagram.events.push({ id: 'same_instant', at: '2026-10-01T07:35:00+05:30', title: 'Same instant as the alert', lane: 'release' });
  const report = layoutOf(diagram);
  const alert = report.events.find((event) => event.id === 'alert');
  const same = report.events.find((event) => event.id === 'same_instant');
  assert.equal(same.t, alert.t);
  assert.equal(same.x, alert.x);
});

test('timeline: long quiet periods become disclosed breaks, proportional inside each segment', () => {
  const report = layoutOf(large);
  assert.ok(report.breaks.length >= 1);
  for (const gap of report.breaks) assert.ok(gap.x1 - gap.x0 >= 56);
  const result = run(large);
  const svg = fs.readFileSync(result.output, 'utf8').match(/<svg\b[\s\S]*?<\/svg>/)[0];
  assert.equal((svg.match(/data-timeline-break=""/g) || []).length, report.breaks.length);
  assert.match(svg, /quiet period\(s\) compressed/);
  assert.match(svg, /data-timeline-evidence="observed"/);
  // Without breaks the axis is one proportional segment.
  const flat = clone(large);
  flat.layout = { breaks: 'none' };
  assert.equal(layoutOf(flat).breaks.length, 0);
});

test('timeline: simultaneous and close events stack instead of overprinting', () => {
  const diagram = clone(small);
  diagram.events.push(
    { id: 'page_1', at: '2026-10-01T10:05:00+08:00', title: 'Page primary on-call', lane: 'monitoring' },
    { id: 'page_2', at: '2026-10-01T10:05:20+08:00', title: 'Page secondary on-call', lane: 'monitoring' },
  );
  const report = layoutOf(diagram);
  const cards = report.events;
  for (const card of cards) for (const other of cards) if (card.id < other.id) assert.ok(!overlap(card, other), `${card.id} overlaps ${other.id}`);
  assert.equal(report.events.find((event) => event.id === 'page_1').x, report.events.find((event) => event.id === 'alert').x);
});

function failure(mutate) {
  const diagram = clone(small);
  mutate(diagram);
  const result = run(diagram);
  assert.notEqual(result.status, 0, 'renderer accepted invalid input');
  return result.stderr;
}

test('timeline: ambiguous or invalid time input is refused', () => {
  assert.match(failure((d) => { d.events[0].at = '2026-10-01T10:00:00'; }), /\/events\/0\/at/);
  assert.match(failure((d) => { d.events[0].at = '2026-02-30T25:00:00Z'; }), /timeline\/invalid-timestamp/);
  assert.match(failure((d) => { d.meta.timezone = 'Mars/Olympus'; }), /timeline\/invalid-timezone/);
  assert.match(failure((d) => { d.events[0].lane = 'billing'; }), /timeline\/unknown-lane/);
  assert.match(failure((d) => { delete d.meta.evidence; }), /evidence/);
});

test('timeline: invalid calendar dates are rejected before Date.parse can normalize them', () => {
  for (const at of ['2026-02-30T10:00:00Z', '2025-02-29T10:00:00+05:30', '2100-02-29T10:00:00Z', '2026-04-31T10:00:00-04:00']) {
    assert.match(failure((diagram) => { diagram.events[0].at = at; }), /timeline\/invalid-timestamp/);
  }
  for (const at of ['2024-02-29T10:00:00+05:30', '2000-02-29T10:00:00Z']) {
    const diagram = clone(small);
    diagram.events[0].at = at;
    const event = layoutOf(diagram).events.find((entry) => entry.id === diagram.events[0].id);
    assert.equal(event.t, Date.parse(at));
  }
});

function crowdedBreaksDiagram() {
  const diagram = clone(small);
  diagram.layout = { width: 480, breaks: 'auto' };
  const start = Date.parse('2026-01-01T00:00:00Z');
  // Nine short bursts separated by eight eligible quiet periods. Their labels
  // and segment floors previously exhausted a 480px axis and set scale to 0.
  diagram.events = Array.from({ length: 18 }, (_, index) => ({
    id: `event_${index}`,
    at: new Date(start + Math.floor(index / 2) * (35 * 60 * 60000) + (index % 2) * 10 * 60000).toISOString(),
    title: `Event ${index}`,
    lane: 'release',
  }));
  return diagram;
}

test('timeline: automatic breaks leave room for proportional time on a narrow axis', () => {
  const report = layoutOf(crowdedBreaksDiagram());
  assert.ok(report.breaks.length > 0, 'eligible quiet periods still compress');
  assert.ok(report.scalePxPerMinute > 0, 'distinct instants must retain a positive scale');
  assert.ok(report.events.every((event, index, all) => !index || event.x > all[index - 1].x), 'distinct instants must not collapse to one x');
  for (const segment of report.segments) {
    assert.ok(segment.x0 <= segment.x1);
    assert.ok(segment.x1 <= report.viewBox[0] - 28 - 72, 'segments stay within the authored axis');
  }
  for (const gap of report.breaks) assert.ok(gap.x1 <= report.viewBox[0] - 28 - 72, 'breaks stay within the authored axis');
  const result = run(crowdedBreaksDiagram());
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(result.output, 'utf8');
  assert.equal((html.match(/data-timeline-break=""/g) || []).length, report.breaks.length);
  const receipt = JSON.parse(spawnSync(process.execPath, [checker, result.output], { encoding: 'utf8' }).stdout);
  assert.equal(receipt.ok, true, JSON.stringify(receipt.checks.filter((entry) => !entry.ok)));
});

test('timeline: event categories survive rendering instead of becoming technical color roles', () => {
  const diagram = clone(small);
  diagram.events = ['default', 'change', 'alert', 'action', 'recovery'].map((kind, i) => ({
    id: kind, title: kind, at: `2026-10-01T10:0${i}:00Z`, ...(i ? { kind } : {}),
  }));
  delete diagram.lanes;
  const result = run(diagram);
  assert.equal(result.status, 0, result.stderr);
  const html = fs.readFileSync(result.output, 'utf8');
  for (const kind of ['default', 'change', 'alert', 'action', 'recovery']) {
    assert.match(html, new RegExp(`data-node-id="${kind}"[^>]*data-node-kind="timeline-${kind}"`));
  }
});

test('timeline: Passport, Finder, Lens and Story agree on event identity and preserve tone colors', async (t) => {
  const { findChrome } = await import('../archify/bin/visual-check.mjs');
  const chrome = process.env.ARCHIFY_CHROME ? findChrome() : null;
  if (!chrome) return t.skip('Set ARCHIFY_CHROME for real-browser Timeline semantics.');
  const { desktopBrowser } = await import('./helpers/desktop-browser.mjs');
  const { pathToFileURL } = await import('node:url');
  const { scanStory } = await import('../archify/story/tool.mjs');
  const browser = desktopBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result.value;
  };
  const kinds = ['default', 'change', 'alert', 'action', 'recovery'];
  const tones = ['external', 'frontend', 'security', 'messagebus', 'backend'];
  const diagram = clone(small);
  delete diagram.lanes;
  diagram.events = kinds.map((kind, i) => ({ id: kind, title: `Event ${i}`, at: `2026-10-01T10:0${i}:00Z`, ...(i ? { kind } : {}) }));
  const load = async (data, hash = '') => {
    const rendered = run(data);
    assert.equal(rendered.status, 0, rendered.stderr);
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(rendered.output).href + hash });
    await loaded;
    await evaluate('document.fonts.ready');
    return rendered.output;
  };
  const file = await load(diagram);
  await evaluate('Archify.semanticLens.open()');
  assert.deepEqual(await evaluate(`Array.from(document.querySelectorAll('#semantic-lens-kinds strong'),n=>n.textContent).sort()`), ['Event', 'Change', 'Alert', 'Response', 'Recovery'].sort());
  assert.deepEqual(scanStory(file).nodes.map(n => n.kind), kinds.map(k => `timeline-${k}`));
  assert.doesNotMatch(await evaluate(`document.querySelector('.semantic-lens-instruction').textContent`), /traffic/i);
  const colors = await evaluate(`(${JSON.stringify(kinds)}).map((kind,i)=>{
    const node=document.querySelector('[data-node-id="'+kind+'"]');
    const button=document.querySelector('#semantic-lens-kinds [data-kind="timeline-'+kind+'"]');
    return {accent:getComputedStyle(node.querySelector('.tl-accent')).stroke,swatch:getComputedStyle(button.querySelector('.semantic-lens-swatch')).backgroundColor};
  })`);
  for (const color of colors) assert.equal(color.accent, color.swatch);
  // A user's existing palette variables continue to control both consumers.
  await evaluate(`document.documentElement.style.setProperty('--frontend-stroke','rgb(12, 34, 56)')`);
  assert.deepEqual(await evaluate(`({accent:getComputedStyle(document.querySelector('#node-change .tl-accent')).stroke,swatch:getComputedStyle(document.querySelector('[data-kind="timeline-change"] .semantic-lens-swatch')).backgroundColor})`), { accent: 'rgb(12, 34, 56)', swatch: 'rgb(12, 34, 56)' });
  await evaluate(`Archify.semanticLens.close(); document.querySelector('#node-default').dispatchEvent(new MouseEvent('click',{bubbles:true}))`);
  assert.equal(await evaluate(`document.getElementById('focus-kind').textContent`), 'Event');
  await evaluate('Archify.finder.open()');
  assert.match(await evaluate(`document.getElementById('node-finder-results').textContent`), /Event/);
  assert.doesNotMatch(await evaluate(`document.getElementById('node-finder-results').textContent`), /External|Frontend|Message bus|Backend|Security/);
  for (let i = 0; i < tones.length; i++) {
    await load(diagram, '#lens=' + tones[i]);
    assert.deepEqual(await evaluate('Archify.semanticLens.active()'), [`timeline-${kinds[i]}`]);
    await evaluate(`Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:value=>{window.timelineCopied=value;return Promise.resolve();}}})`);
    assert.equal(await evaluate('Archify.semanticLens.copyLink()'), true);
    assert.match(await evaluate('window.timelineCopied'), new RegExp('lens=timeline-' + kinds[i]));
    await evaluate(`Archify.semanticLens.select('timeline-${kinds[(i+1)%5]}')`);
    assert.match(await evaluate('location.hash'), /lens=timeline-/);
    assert.doesNotMatch(await evaluate('location.hash'), new RegExp('lens=' + tones[i]));
  }
  for (const [translations, expected] of [
    [Object.fromEntries(tones.map((tone,i) => ['viewer.kind.' + tone, 'Legacy ' + kinds[i]])), 'Legacy default'],
    [{ 'viewer.kind.external': 'Legacy event', 'viewer.kind.timeline.default': 'New event', 'viewer.lens.instruction': 'Authored lens' }, 'New event'],
    [{ 'legend.timeline.default': 'Milestone' }, 'Milestone'],
  ]) {
    const custom = clone(diagram);
    custom.meta.locale = 'en'; custom.meta.translations = translations;
    await load(custom); await evaluate('Archify.semanticLens.open()');
    assert.equal(await evaluate(`document.querySelector('[data-kind="timeline-default"] strong').textContent`), expected);
    assert.doesNotMatch(await evaluate(`document.querySelector('[data-legend]').textContent`), /Legacy/);
    if (expected === 'Legacy default') for (const kind of kinds) assert.equal(await evaluate(`document.querySelector('[data-kind="timeline-${kind}"] strong').textContent`), 'Legacy ' + kind);
    if (translations['viewer.lens.instruction']) assert.equal(await evaluate(`document.querySelector('.semantic-lens-instruction').textContent`), 'Authored lens');
  }
  const minimal = clone(diagram); minimal.events = [minimal.events[0]];
  await load(minimal); await evaluate('Archify.semanticLens.open()');
  assert.equal(await evaluate(`document.querySelector('[data-kind="timeline-default"] strong').textContent`), 'Event');
  const unsupported = clone(minimal); unsupported.meta.locale = 'zz';
  await load(unsupported);
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  const localized = clone(diagram); localized.meta.locale = 'zh-CN';
  await load(localized); await evaluate('Archify.semanticLens.open()');
  assert.equal(await evaluate(`document.querySelector('[data-kind="timeline-default"] strong').textContent`), '事件');
  // The old technical hash retains its original meaning in another mode.
  const directory = path.dirname(file);
  const architecture = path.join(directory, 'architecture.html');
  const rendered = spawnSync(process.execPath, [path.join(skillRoot, 'renderers/architecture/render-architecture.mjs'), path.join(skillRoot, 'examples/web-app.architecture.json'), architecture], { encoding: 'utf8' });
  assert.equal(rendered.status, 0, rendered.stderr);
  const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
  await send('Page.navigate', { url: pathToFileURL(architecture).href + '#lens=backend' }); await loaded;
  assert.deepEqual(await evaluate('Archify.semanticLens.active()'), ['backend']);
});

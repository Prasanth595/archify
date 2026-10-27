import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { findChrome } from '../archify/bin/visual-check.mjs';
import { desktopBrowser, desktopPointerCheck } from './helpers/desktop-browser.mjs';
import { fixture, run as cli } from './helpers/repository-evidence-fixture.mjs';
import { createViewerClick } from './helpers/viewer-click.mjs';

const chrome = process.env.ARCHIFY_CHROME ? findChrome() : null;

test('Semantic Passport lists an authored task checklist read-only with verified task sources', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run real-browser passport task checklist checks.',
}, async (t) => {
  const data = fixture();
  data.diagram.components[0].task_checklist = [
    { title: 'Route requests by kind', status: 'implemented', criteria: 'Every request reaches exactly one handler.', sources: [{ path: 'src/router.js', line: 1, end_line: 3, label: 'Request router' }] },
    { title: 'Keep sessions in a store', status: 'needs-review', sources: [{ path: 'src/store.js', line: 1 }] },
    { title: 'Expire idle sessions', status: 'pending' },
  ];
  // A long list on a bottom-row node checks placement and scrolling on the same page.
  data.diagram.components.find((component) => component.id === 'worker').task_checklist = Array.from({ length: 12 }, (_, index) => ({
    title: `Task ${index + 1} with a title long enough to wrap in the passport`,
    status: index % 2 ? 'pending' : 'needs-review',
    criteria: 'A full-sentence acceptance criterion that wraps onto a second line.',
  }));
  fs.writeFileSync(data.input, JSON.stringify(data.diagram));
  const output = path.join(data.root, 'task-checklist.html');
  const rendered = cli(['render', 'architecture', data.input, output, '--repo-root', data.root]);
  assert.equal(rendered.status, 0, rendered.stderr || rendered.stdout);

  const browser = desktopBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const checkPointer = await desktopPointerCheck(browser, session);
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  await browser.cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  async function run(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(r.exceptionDetails, undefined, r.exceptionDetails?.exception?.description);
    return r.result?.value;
  }
  const click = await createViewerClick({ send, run, timeout: 10000 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.pageErrors=[];addEventListener('error',e=>pageErrors.push(e.message));` });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
  await send('Page.navigate', { url: pathToFileURL(output).href + '?theme=dark' });
  await loaded;
  await checkPointer();
  await run('document.fonts.ready');
  await run('Archify.viewerChromeLayout.whenStable()');

  const settle = () => run('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const state = () => run(`(() => { const section = document.getElementById('focus-task-checklist');
    return { hidden: section.hidden, open: section.open, count: document.getElementById('focus-task-checklist-count').textContent,
      tasks: Array.from(section.querySelectorAll('.semantic-passport-task-checklist-task')).map(task => ({
        status: task.getAttribute('data-status'), mark: task.querySelector('[role="img"]').getAttribute('aria-label'),
        title: task.querySelector('strong').textContent, criteria: task.querySelector('p') && task.querySelector('p').textContent,
        links: Array.from(task.querySelectorAll('a.semantic-passport-source')).map(link => link.getAttribute('href')) })),
      focused: document.activeElement && document.activeElement.tagName, errors: pageErrors }; })()`);

  assert.equal(await run(`Archify.focus.set('users')`), true);
  await settle();
  const closed = await state();
  assert.equal(closed.hidden, false, 'a node with a task checklist shows the section');
  assert.equal(closed.open, false, 'the task checklist starts as one counted line');
  assert.equal(closed.count, '1/3 implemented');

  await click('#focus-task-checklist > summary');
  await settle();
  const opened = await state();
  assert.equal(opened.open, true, 'clicking the counted line expands the tasks');
  assert.deepEqual(opened.tasks.map(({ status, mark }) => [status, mark]), [
    ['implemented', 'Implemented'], ['needs-review', 'Needs review'], ['pending', 'Pending'],
  ]);
  assert.equal(opened.tasks[0].criteria, 'Every request reaches exactly one handler.');
  assert.equal(opened.tasks[0].links.length, 1);
  assert.match(opened.tasks[0].links[0], new RegExp(`/blob/${data.revision}/src/router\\.js#L1-L3$`));
  assert.equal(opened.tasks[1].links.length, 1);
  assert.deepEqual(opened.tasks[2].links, [], 'a pending task shows no evidence');
  if (process.env.ARCHIFY_TEST_EVIDENCE_DIR) {
    fs.mkdirSync(process.env.ARCHIFY_TEST_EVIDENCE_DIR, { recursive: true });
    const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(process.env.ARCHIFY_TEST_EVIDENCE_DIR, 'task-checklist-1440x900.png'), Buffer.from(capture.data, 'base64'));
  }

  // `text` makes Chromium emit the character event that natively toggles <summary>.
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
  await settle();
  const keyboard = await state();
  assert.equal(keyboard.focused, 'SUMMARY', 'the counted line takes keyboard focus');
  assert.equal(keyboard.open, false, 'Enter on the counted line collapses the tasks');

  const canonical = await run(`document.querySelector('.diagram-container > svg').outerHTML`);
  assert.doesNotMatch(canonical, /Route requests by kind|Expire idle sessions/, 'tasks stay outside the canonical SVG');

  assert.equal(await run(`Archify.focus.set('cdn')`), true);
  await settle();
  assert.equal((await state()).hidden, true, 'nodes without a task checklist show no section');
  await run(`Archify.focus.clear()`);
  await settle();
  const cleared = await state();
  assert.equal(cleared.hidden, true);
  assert.deepEqual(cleared.tasks, []);
  assert.deepEqual(cleared.errors, []);

  // A long task checklist expanded near the bottom of the stage must stay inside
  // it and scroll rather than clip, and the next node starts collapsed.
  assert.equal(await run(`Archify.focus.set('worker')`), true);
  await settle();
  await click('#focus-task-checklist > summary');
  await run('new Promise(resolve => setTimeout(resolve, 100))');
  await settle();
  const expanded = await run(`(() => { const chip = document.getElementById('focus-chip').getBoundingClientRect();
    const stage = document.querySelector('.diagram-container').getBoundingClientRect();
    const list = document.getElementById('focus-task-checklist-tasks');
    list.scrollTop = list.scrollHeight;
    const last = list.lastElementChild.getBoundingClientRect();
    return { open: document.getElementById('focus-task-checklist').open, chipBottom: chip.bottom, stageBottom: Math.min(stage.bottom, innerHeight),
      scrolls: list.scrollHeight > list.clientHeight, lastVisible: last.bottom <= list.getBoundingClientRect().bottom + 1 }; })()`);
  assert.equal(expanded.open, true);
  assert.ok(expanded.chipBottom <= expanded.stageBottom + 1, `expanded passport ends at ${expanded.chipBottom}, stage at ${expanded.stageBottom}`);
  assert.equal(expanded.scrolls, true, 'a long task checklist scrolls inside the passport');
  assert.equal(expanded.lastVisible, true, 'the last task can be scrolled into view');
  assert.equal(await run(`Archify.focus.set('users')`), true);
  await settle();
  assert.equal(await run(`document.getElementById('focus-task-checklist').open`), false, 'the next node starts collapsed');
  assert.deepEqual(await run('pageErrors'), []);
});

test('a twelve-task checklist stays reachable beside a parent link and long explanation at 320×300', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run real-browser passport task checklist checks.',
}, async (t) => {
  const data = fixture();
  data.diagram.meta.parentHref = 'grandparent.html';
  const users = data.diagram.components[0];
  users.explanation = ('A reader needs the complete explanation, with every paragraph available.\n\n').repeat(20).slice(0, 1190);
  users.task_checklist = Array.from({ length: 12 }, (_, index) => ({
    title: `Task ${index + 1} with a title long enough to wrap in a narrow passport`,
    status: index % 2 ? 'needs-review' : 'implemented',
    criteria: 'A full-sentence acceptance criterion that wraps onto a second line.',
    sources: [{ path: index % 2 ? 'src/store.js' : 'src/router.js', line: 1 }],
  }));
  data.diagram.components.find((component) => component.id === 'api').task_checklist = [{ title: 'Serve requests', status: 'pending' }];
  fs.writeFileSync(data.input, JSON.stringify(data.diagram));
  const output = path.join(data.root, 'short-viewport.html');
  const rendered = cli(['render', 'architecture', data.input, output, '--repo-root', data.root]);
  assert.equal(rendered.status, 0, rendered.stderr || rendered.stdout);

  const browser = desktopBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  async function run(expression) {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(r.exceptionDetails, undefined, r.exceptionDetails?.exception?.description);
    return r.result?.value;
  }
  const settle = () => run('new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  const key = async (name, code, windowsVirtualKeyCode, modifiers = 0) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code, windowsVirtualKeyCode, modifiers, ...(name === 'Enter' ? { text: '\r' } : {}) });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code, windowsVirtualKeyCode, modifiers });
    await settle();
  };
  const click = await createViewerClick({ send, run, timeout: 10000 });
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.pageErrors=[];addEventListener('error',e=>pageErrors.push(e.message));` });
  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 300, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
  await send('Page.navigate', { url: pathToFileURL(output).href + '?theme=light' });
  await loaded;
  await run('document.fonts.ready');
  await run('Archify.readerLayout.whenStable()');

  // "Visible" means inside the viewport and inside every scrolling ancestor.
  const state = () => run(`(() => { const chip = document.getElementById('focus-chip'), section = document.getElementById('focus-task-checklist'), active = document.activeElement;
    const visible = (el) => { const r = el.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight + 1) return false;
      for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
        if (p.scrollHeight > p.clientHeight && /auto|scroll/.test(getComputedStyle(p).overflowY)) { const b = p.getBoundingClientRect(); if (r.top < b.top - 1 || r.bottom > b.bottom + 1) return false; }
      }
      return true; };
    const back = document.getElementById('btn-parent-back').getBoundingClientRect(), hit = document.elementFromPoint(back.left + back.width / 2, back.top + back.height / 2);
    return { chipShown: !chip.hidden, chipFits: !chip.hidden && chip.getBoundingClientRect().top >= 0 && chip.getBoundingClientRect().bottom <= innerHeight + 1,
      hidden: section.hidden, open: section.open, explaining: Archify.focus.explaining(), focused: active.id || active.tagName, focusedVisible: visible(active),
      links: section.querySelectorAll('a.semantic-passport-source').length, linkIndex: [...section.querySelectorAll('a.semantic-passport-source')].indexOf(active),
      parentBackShown: !document.querySelector('.parent-back-bar').hidden, parentBackClickable: !!hit && document.getElementById('btn-parent-back').contains(hit), errors: pageErrors }; })()`);

  assert.equal(await run(`Archify.focus.set('users')`), true);
  await settle();
  let s = await state();
  assert.equal(s.parentBackShown, true, 'the page keeps its parent return link');
  assert.equal(s.chipFits, true, 'the passport fits the short viewport');
  assert.equal(s.open, false, 'the task checklist starts collapsed');

  await click('#focus-task-checklist > summary');
  s = await state();
  assert.equal(s.open, true, 'clicking the counted line expands the tasks');
  assert.equal(s.links, 12);
  for (let index = 0; index < s.links; index += 1) {
    await key('Tab', 'Tab', 9);
    const step = await state();
    assert.equal(step.linkIndex, index, `Tab reaches task link ${index + 1}`);
    assert.equal(step.focusedVisible, true, `task link ${index + 1} is scrolled into view`);
  }
  if (process.env.ARCHIFY_TEST_EVIDENCE_DIR) {
    fs.mkdirSync(process.env.ARCHIFY_TEST_EVIDENCE_DIR, { recursive: true });
    const capture = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(process.env.ARCHIFY_TEST_EVIDENCE_DIR, 'task-checklist-320x300.png'), Buffer.from(capture.data, 'base64'));
  }
  for (let index = 0; index < s.links; index += 1) await key('Tab', 'Tab', 9, 8);
  s = await state();
  assert.equal(s.focused, 'SUMMARY', 'Shift+Tab walks back to the counted line');
  assert.equal(s.focusedVisible, true);
  await key('Enter', 'Enter', 13);
  assert.equal((await state()).open, false, 'Enter collapses the tasks');
  await key('Enter', 'Enter', 13);
  assert.equal((await state()).open, true, 'Enter expands them again');

  await click('#btn-focus-explain');
  s = await state();
  assert.equal(s.explaining, true);
  assert.equal(s.focused, 'focus-explanation-back');
  assert.equal(s.focusedVisible, true, 'Back to passport is visible');
  await key('Escape', 'Escape', 27);
  s = await state();
  assert.equal(s.explaining, false);
  assert.equal(s.focused, 'btn-focus-explain');
  assert.equal(s.focusedVisible, true);
  assert.equal(s.open, true, 'returning from the explanation keeps the expanded tasks');

  await click('#btn-focus-clear');
  s = await state();
  assert.equal(s.chipShown, false, 'the close control hides the passport');
  assert.equal(s.parentBackClickable, true, 'the parent return link is clickable once the passport closes');

  assert.equal(await run(`Archify.focus.set('users')`), true);
  await settle();
  assert.equal((await state()).open, false, 'refocusing the node starts collapsed');
  await click('#focus-task-checklist > summary');
  assert.equal(await run(`Archify.focus.set('api')`), true);
  await settle();
  s = await state();
  assert.equal(s.hidden, false);
  assert.equal(s.open, false, 'switching nodes starts collapsed');
  assert.deepEqual(s.errors, []);
});

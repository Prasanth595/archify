import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ChromeVisualBrowser, findChrome } from '../archify/bin/visual-check.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'archify');
const chromeConfigured = Object.prototype.hasOwnProperty.call(process.env, 'ARCHIFY_CHROME');
const chrome = chromeConfigured ? findChrome() : null;
if (chromeConfigured && !chrome) throw new Error(`ARCHIFY_CHROME does not resolve to an executable browser: ${process.env.ARCHIFY_CHROME}`);

test('Mobile Viewer chrome stays reachable, clear of the dock, and the stage scrolls its full scene', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run the real-browser mobile chrome check.',
}, async (t) => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-mobile-chrome-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const artifact = path.join(scratch, 'architecture.html');
  execFileSync(process.execPath, [
    path.join(skillRoot, 'renderers/architecture/render-architecture.mjs'),
    path.join(skillRoot, 'examples/web-app.architecture.json'),
    artifact,
  ]);

  const browser = new ChromeVisualBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  await send('Browser.setDownloadBehavior', { behavior: 'deny' });

  async function run(expression) {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result?.value;
  }
  async function settle() {
    await run('Archify.viewerChromeLayout.whenStable()');
    await run('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  }
  async function loadAt(width, height) {
    await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width <= 720 });
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(artifact).href + '?theme=dark' });
    await loaded;
    await run('document.fonts.ready');
    await settle();
  }

  await loadAt(360, 760);

  // 1. Every nav action must sit inside the container and be the element that
  //    receives a hit at its centre. A single scrolling row used to push the
  //    zoom-in button past the edge.
  const nav = await run(`(() => {
    const container = document.querySelector('.diagram-container').getBoundingClientRect();
    const buttons = [...document.querySelectorAll('.diagram-nav button')]
      .filter((button) => button.getBoundingClientRect().width > 0);
    return {
      count: buttons.length,
      clipped: buttons
        .map((button) => {
          const rect = button.getBoundingClientRect();
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
          return {
            label: (button.getAttribute('aria-label') || button.textContent || '').trim(),
            insideContainer: rect.left >= container.left - 0.5 && rect.right <= container.right + 0.5,
            hittable: Boolean(hit && (hit === button || button.contains(hit))),
          };
        })
        .filter((button) => !button.insideContainer || !button.hittable),
    };
  })()`);
  assert.ok(nav.count > 0, 'the viewer must render its nav actions');
  assert.deepEqual(nav.clipped, [], 'every nav action must sit inside the container and be hit-testable');

  // 2. The dock height is measured, and the authored scene must clear it.
  const dock = await run(`(() => {
    const nav = document.querySelector('.diagram-nav').getBoundingClientRect();
    const svg = document.querySelector('.diagram-container svg').getBoundingClientRect();
    const container = document.querySelector('.diagram-container');
    return { navTop: nav.top, navHeight: nav.height, svgBottom: svg.bottom, dockH: getComputedStyle(container).getPropertyValue('--archify-dock-h').trim() };
  })()`);
  assert.ok(parseFloat(dock.dockH) >= dock.navHeight - 1, 'the chrome layout must publish the measured dock height');
  assert.ok(dock.svgBottom <= dock.navTop + 0.5, `scene bottom ${dock.svgBottom} must clear dock top ${dock.navTop}`);

  // 3. An overlay opened from the dock must clear the dock and leave its
  //    actions clickable; only the header visible behind the dock is the defect.
  for (const [trigger, panelSelector, closeSelector] of [
    ['#btn-route-probe', '#route-probe', '#route-probe-clear'],
    ['#btn-semantic-lens', '.semantic-lens', '.semantic-lens-close'],
  ]) {
    const triggerFound = await run(`Boolean(document.querySelector('${trigger}'))`);
    assert.equal(triggerFound, true, `${trigger} must exist`);
    await run(`document.querySelector('${trigger}').click()`);
    await settle();
    const overlay = await run(`(() => {
      const panel = document.querySelector('${panelSelector}');
      const nav = document.querySelector('.diagram-nav').getBoundingClientRect();
      if (!panel || panel.hidden) return null;
      const rect = panel.getBoundingClientRect();
      const centre = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      const navHits = [...document.querySelectorAll('.diagram-nav button')]
        .filter((button) => button.getBoundingClientRect().width > 0)
        .map((button) => {
        const r = button.getBoundingClientRect();
        const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return Boolean(hit && (hit === button || button.contains(hit)));
      });
      return {
        bottom: rect.bottom,
        navTop: nav.top,
        panelHit: Boolean(centre && panel.contains(centre)),
        navHittable: navHits.every(Boolean),
      };
    })()`);
    assert.ok(overlay, `${panelSelector} must be visible after opening it`);
    assert.ok(overlay.bottom <= overlay.navTop + 0.5, `${panelSelector} bottom ${overlay.bottom} must clear dock top ${overlay.navTop}`);
    assert.equal(overlay.panelHit, true, `${panelSelector} must be hit-testable at its centre`);
    assert.equal(overlay.navHittable, true, 'the dock must stay clickable while an overlay is open');
    await run(`(() => { const close = document.querySelector('${closeSelector}'); if (close) close.click(); })()`);
    await settle();
  }

  // 3b. With a large root font the dock grows; the lens head and its close
  //     control must stay inside the clipped stage.
  await run(`document.documentElement.style.fontSize = '24px'`);
  await settle();
  await run(`document.querySelector('#btn-semantic-lens').click()`);
  await settle();
  const tall = await run(`(() => {
    const panel = document.querySelector('.semantic-lens');
    const container = document.querySelector('.diagram-container').getBoundingClientRect();
    if (!panel || panel.hidden) return null;
    const rect = panel.getBoundingClientRect();
    const close = panel.querySelector('.semantic-lens-close');
    const closeRect = close ? close.getBoundingClientRect() : null;
    const hit = closeRect ? document.elementFromPoint(closeRect.left + closeRect.width / 2, closeRect.top + closeRect.height / 2) : null;
    return { top: rect.top, containerTop: container.top, closeInside: Boolean(closeRect && closeRect.top >= container.top - 0.5), closeHit: Boolean(hit && close.contains(hit)) };
  })()`);
  assert.ok(tall, 'the lens must open at a large root font');
  assert.ok(tall.top >= tall.containerTop - 0.5, `lens top ${tall.top} must stay inside the stage ${tall.containerTop}`);
  assert.equal(tall.closeInside, true, 'the lens close control must stay inside the stage');
  assert.equal(tall.closeHit, true, 'the lens close control must be hit-testable');

  // The lens actions are pinned below the scrollable kinds list; at a large
  // root font they must stay inside the panel, not clipped by its height cap.
  const lensActions = await run(`(() => {
    const panel = document.querySelector('.semantic-lens');
    const kind = document.querySelector('.semantic-lens-kinds button');
    if (kind) kind.click();
    const check = (element) => {
      if (!element || element.hidden) return { visible: false, hittable: false };
      const rect = element.getBoundingClientRect();
      const panelRect = panel.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        visible: rect.height > 0 && rect.bottom <= panelRect.bottom + 0.5,
        hittable: Boolean(hit && (hit === element || element.contains(hit))),
      };
    };
    return {
      clear: check(document.querySelector('#semantic-lens-clear')),
      copy: check(document.querySelector('#semantic-lens-copy')),
    };
  })()`);
  assert.equal(lensActions.clear.visible, true, 'the lens clear action must stay inside the panel');
  assert.equal(lensActions.clear.hittable, true, 'the lens clear action must be hit-testable');
  assert.equal(lensActions.copy.visible, true, 'the lens copy action must stay inside the panel');
  assert.equal(lensActions.copy.hittable, true, 'the lens copy action must be hit-testable');
  await run(`document.querySelector('.semantic-lens-close').click()`);
  await run(`document.documentElement.style.fontSize = ''`);
  await settle();

  // 4. Presentation stage: a wider-than-stage scene must remain scrollable in
  //    full; plain `center` clipped an unreachable strip.
  await run(`(() => { const guide = document.querySelector('#btn-diagram-guide'); if (guide) guide.click(); })()`);
  await settle();
  const presented = await run(`(() => { const button = document.querySelector('[data-guide-action="present"]'); if (!button) return false; button.click(); return true; })()`);
  assert.equal(presented, true, 'the guide must expose the presentation action');
  await settle();
  const stage = await run(`(() => {
    const container = document.querySelector('.diagram-container');
    const svg = container.querySelector(':scope > svg').getBoundingClientRect();
    return {
      present: document.documentElement.getAttribute('data-present'),
      scrollWidth: container.scrollWidth,
      clientWidth: container.clientWidth,
      svgWidth: svg.width,
    };
  })()`);
  assert.equal(stage.present, 'true', 'the presentation stage must activate');
  assert.ok(stage.svgWidth > stage.clientWidth + 100, 'the stage fixture must overflow before scroll coverage is asserted');
  assert.ok(stage.scrollWidth >= stage.svgWidth - 2, `stage scroll width ${stage.scrollWidth} must cover the ${stage.svgWidth}px scene`);

  // 5. A scene that fits must stay centred: start alignment plus auto inline
  //    margins must not degrade the fitting case while making overflow reachable.
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await settle();
  const desktop = await run(`(() => {
    const container = document.querySelector('.diagram-container');
    const svg = container.querySelector(':scope > svg').getBoundingClientRect();
    const rect = container.getBoundingClientRect();
    return { centreDelta: Math.abs((svg.left + svg.right) / 2 - (rect.left + rect.right) / 2), present: document.documentElement.getAttribute('data-present') };
  })()`);
  assert.equal(desktop.present, 'true', 'the stage must still be in presentation at 1280px');
  assert.ok(desktop.centreDelta < 1, `a scene that fits must stay centred (delta ${desktop.centreDelta})`);
});

test('320×300 composition keeps parent Back and the explained Passport clear of the wrapped dock', {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run the real-browser mobile composition check.',
}, async (t) => {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-mobile-composition-'));
  t.after(() => fs.rmSync(scratch, { recursive: true, force: true }));
  const diagram = JSON.parse(fs.readFileSync(path.join(skillRoot, 'examples/web-app.architecture.json'), 'utf8'));
  diagram.meta.parentHref = 'grandparent.html';
  const explained = diagram.components.find((component) => component.id === 'users');
  const paragraph = 'The signed-in reader opens this explained node and expects the Passport to stay above the wrapped dock while its prose scrolls instead of being clipped.';
  explained.explanation = Array.from({ length: 7 }, (_, index) => `${paragraph} Part ${index + 1}.`).join('\n\n');
  assert.ok(explained.explanation.length <= 1200, 'the fixture must stay within the schema explanation limit');
  const input = path.join(scratch, 'composition.json');
  const artifact = path.join(scratch, 'composition.html');
  fs.writeFileSync(input, JSON.stringify(diagram));
  execFileSync(process.execPath, [path.join(skillRoot, 'renderers/architecture/render-architecture.mjs'), input, artifact]);

  const browser = new ChromeVisualBrowser(chrome);
  t.after(() => browser.close());
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  await send('Browser.setDownloadBehavior', { behavior: 'deny' });
  const run = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result?.value;
  };
  const settle = async () => {
    await run('Archify.readerLayout.whenStable()');
    await run('Archify.viewerChromeLayout.whenStable()');
    await run('new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))');
  };
  const click = async (id) => {
    await run(`document.getElementById(${JSON.stringify(id)}).scrollIntoView({ block: 'nearest' })`);
    await settle();
    const point = await run(`(() => { const rect = document.getElementById(${JSON.stringify(id)}).getBoundingClientRect(); return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', buttons: 1, clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', buttons: 0, clickCount: 1 });
    await settle();
  };

  await send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 300, deviceScaleFactor: 1, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
  await send('Page.navigate', { url: pathToFileURL(artifact).href + '?theme=light' });
  await loaded;
  await run('document.fonts.ready');
  await settle();
  const top = await run(`(() => {
    const button = document.getElementById('btn-parent-back');
    const rect = button.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      parentBarHidden: document.getElementById('parent-back-bar').hidden,
      parentBackHittable: Boolean(hit && (hit === button || button.contains(hit))),
    };
  })()`);
  assert.equal(await run(`Archify.focus.set('users')`), true);
  await settle();
  await click('btn-focus-explain');
  await run(`document.querySelector('.diagram-nav').scrollIntoView({ block: 'end' })`);
  await settle();

  const state = await run(`(() => {
    const container = document.querySelector('.diagram-container');
    const nav = document.querySelector('.diagram-nav');
    const navRect = nav.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const navStyle = getComputedStyle(nav);
    const buttons = [...nav.querySelectorAll('button')].filter((button) => button.getBoundingClientRect().width > 0);
    const buttonHeight = Math.max(...buttons.map((button) => button.getBoundingClientRect().height));
    const hit = (element) => {
      if (!element || element.hidden) return { visible: false, hittable: false };
      const rect = element.getBoundingClientRect();
      const centre = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return { visible: rect.height > 0, hittable: Boolean(centre && (centre === element || element.contains(centre))), rect: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } };
    };
    const title = document.getElementById('focus-explanation-title');
    const titleRect = title.getBoundingClientRect();
    const titleCentre = document.elementFromPoint(titleRect.left + titleRect.width / 2, titleRect.top + titleRect.height / 2);
    const body = document.getElementById('focus-explanation-body');
    const back = document.getElementById('focus-explanation-back');
    const explain = document.getElementById('btn-focus-explain');
    return {
      viewport: { width: innerWidth, height: innerHeight },
      scrollY: window.scrollY,
      nav: { wrap: navStyle.flexWrap, height: navRect.height, top: navRect.top, bottom: navRect.bottom },
      chip: (() => { const rect = document.getElementById('focus-chip').getBoundingClientRect(); return { top: rect.top, bottom: rect.bottom, height: rect.height }; })(),
      buttons: buttons.map((button) => {
        const rect = button.getBoundingClientRect();
        const centre = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
        return {
          label: (button.getAttribute('aria-label') || button.textContent || '').trim(),
          inside: rect.left >= containerRect.left - 0.5 && rect.right <= containerRect.right + 0.5 && rect.top >= containerRect.top - 0.5 && rect.bottom <= containerRect.bottom + 0.5,
          hittable: Boolean(centre && (centre === button || button.contains(centre))),
        };
      }),
      buttonHeight,
      dock: parseFloat(getComputedStyle(container).getPropertyValue('--archify-dock-h')) || 0,
      title: { hit: Boolean(titleCentre && (titleCentre === title || title.contains(titleCentre))), bottom: titleRect.bottom, navTop: navRect.top },
      prose: (() => { const rect = body.getBoundingClientRect(); return { text: body.textContent.trim(), scrollHeight: body.scrollHeight, clientHeight: body.clientHeight, scrollTop: body.scrollTop, top: rect.top, bottom: rect.bottom }; })(),
      parentBack: hit(document.getElementById('btn-parent-back')),
      parentBarHidden: document.getElementById('parent-back-bar').hidden,
      back: hit(back),
      explain: hit(explain),
      focused: document.activeElement && document.activeElement.id,
    };
  })()`);

  assert.ok(state.viewport.width === 320 && state.viewport.height === 300, JSON.stringify(state));
  assert.equal(state.nav.wrap, 'wrap', 'the mobile dock must opt into wrapping');
  assert.ok(state.nav.height > state.buttonHeight * 1.5, `the dock must actually wrap at 320px: ${JSON.stringify(state.nav)}`);
  assert.ok(state.buttons.length > 0, 'the dock must render actions');
  assert.deepEqual(state.buttons.filter((button) => !button.inside || !button.hittable), [], 'every wrapped dock action must stay inside the stage and be hit-testable');
  assert.ok(state.dock > 0 && state.dock >= state.nav.height - 1, `the measured dock height must cover the wrapped dock: ${JSON.stringify(state)}`);
  assert.equal(top.parentBarHidden, false, 'parent navigation must be visible on the sibling page');
  assert.equal(top.parentBackHittable, true, 'parent Back must be hit-testable before the Passport covers the header');
  assert.equal(state.title.hit, true, 'the explanation title must be unobscured');
  assert.ok(state.title.bottom <= state.nav.top + 0.5, `the explanation title must stay above the dock: ${JSON.stringify(state.title)}`);
  assert.ok(state.prose.text.length > 0, 'the authored explanation must be rendered');
  assert.ok(state.prose.scrollHeight > state.prose.clientHeight, 'a schema-maximum explanation must scroll inside the capped Passport');
  assert.ok(state.prose.bottom <= state.nav.top + 0.5, `the explanation prose must stay above the dock: ${JSON.stringify(state.prose)}`);
  assert.ok(state.back.rect.bottom <= state.nav.top + 0.5, `the explanation Back must stay above the dock: ${JSON.stringify(state.back.rect)}`);
  assert.equal(state.focused, 'focus-explanation-back', 'opening the explained Passport must focus its Back control');
  assert.equal(state.back.hittable, true, 'the explanation Back must be hit-testable');

  // The dock is absolutely positioned inside the scrolling container, not a
  // fixed viewport band. Re-check the Passport at a mid-viewport dock offset:
  // it may move below the dock, but it must not be painted over by it.
  await run('window.scrollTo(0, 520)');
  await settle();
  const mid = await run(`(() => {
    const nav = document.querySelector('.diagram-nav').getBoundingClientRect();
    const chip = document.getElementById('focus-chip').getBoundingClientRect();
    const title = document.getElementById('focus-explanation-title').getBoundingClientRect();
    const body = document.getElementById('focus-explanation-body');
    const prose = body.getBoundingClientRect();
    const back = document.getElementById('focus-explanation-back').getBoundingClientRect();
    const hit = (element) => {
      const rect = element.getBoundingClientRect();
      const centre = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return Boolean(centre && (centre === element || element.contains(centre)));
    };
    return {
      scrollY: window.scrollY,
      nav: { top: nav.top, bottom: nav.bottom },
      chip: { top: chip.top, bottom: chip.bottom },
      title: { top: title.top, bottom: title.bottom, hit: hit(document.getElementById('focus-explanation-title')) },
      prose: { top: prose.top, bottom: prose.bottom, clientHeight: body.clientHeight, scrollHeight: body.scrollHeight },
      back: { top: back.top, bottom: back.bottom, hit: hit(document.getElementById('focus-explanation-back')) },
      separated: chip.bottom <= nav.top + 0.5 || chip.top >= nav.bottom - 0.5,
    };
  })()`);
  assert.equal(mid.title.hit, true, `the explanation title must stay visible at the mid-scroll dock: ${JSON.stringify(mid)}`);
  assert.ok(mid.prose.clientHeight > 0, `the explanation prose must stay readable at the mid-scroll dock: ${JSON.stringify(mid)}`);
  assert.equal(mid.back.hit, true, `the explanation Back must stay hit-testable at the mid-scroll dock: ${JSON.stringify(mid)}`);
  assert.equal(mid.separated, true, `the Passport must not overlap the dock at the mid-scroll position: ${JSON.stringify(mid)}`);

  await run(`window.scrollTo(0, ${state.scrollY})`);
  await settle();
  await click('focus-explanation-back');
  const restored = await run(`(() => {
    const explain = document.getElementById('btn-focus-explain');
    const rect = explain.getBoundingClientRect();
    const nav = document.querySelector('.diagram-nav').getBoundingClientRect();
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      focused: document.activeElement && document.activeElement.id,
      hittable: Boolean(hit && (hit === explain || explain.contains(hit))),
      overlapsDock: !(rect.right <= nav.left || rect.left >= nav.right || rect.bottom <= nav.top || rect.top >= nav.bottom),
      explaining: Archify.focus.explaining(),
    };
  })()`);
  assert.equal(restored.explaining, false);
  assert.equal(restored.focused, 'btn-focus-explain', 'closing the explanation must restore Explain focus');
  assert.equal(restored.hittable, true, 'the restored Explain action must be hit-testable');
  assert.equal(restored.overlapsDock, false, 'the restored Explain action must not sit under the dock');
});

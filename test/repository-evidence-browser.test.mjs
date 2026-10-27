import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { ChromeVisualBrowser, findChrome } from '../archify/bin/visual-check.mjs';
import { git, fixture, run } from './helpers/repository-evidence-fixture.mjs';

test('source link accessible names distinguish labels and locations', {
  skip: process.env.ARCHIFY_CHROME ? false : 'Set ARCHIFY_CHROME to run evidence browser checks.',
  timeout: 60000,
}, async () => {
  const data = fixture();
  data.diagram.components[0].sources = [
    { path: 'src/router.js', line: 1, label: 'Entry point' },
    { path: 'src/router.js', line: 2, end_line: 3, label: 'Route body' },
    { path: 'src/store.js' },
  ];
  const browser = new ChromeVisualBrowser(findChrome());
  try {
    for (const locale of ['en', 'zh-CN']) {
      for (const local of [false, true]) {
        const url = local ? 'http://git.internal/Team/repo' : 'https://github.com/example/evidence-repo';
        data.diagram.meta.locale = locale;
        data.diagram.meta.repository = { url, revision: data.revision, ...(local ? { link_mode: 'local-only' } : {}) };
        git(data.root, 'remote', 'set-url', 'origin', url);
        fs.writeFileSync(data.input, JSON.stringify(data.diagram));
        const artifactPath = path.join(data.root, `names-${locale}-${local}.html`);
        const result = run(['deliver', 'architecture', data.input, artifactPath, '--repo-root', data.root, '--json']);
        assert.equal(result.status, 0, result.stderr || result.stdout);
        await browser.inspect({ artifactPath, width: 1440, height: 900, theme: 'light' });
        const sessionId = await browser.sessionPromise;
        const rows = await browser.cdp.send('Runtime.evaluate', {
          expression: `(() => {
            Archify.focus.set('users', { toggle: false });
            return [...document.querySelectorAll('#focus-evidence .semantic-passport-source')].map(row => ({
              tag: row.tagName, href: row.getAttribute('href'), text: row.textContent
            }));
          })()`, returnByValue: true,
        }, sessionId);
        assert.equal(rows.exceptionDetails, undefined);
        const observed = rows.result.value;
        assert.equal(observed.length, 3);
        if (local) {
          assert.deepEqual(observed.map(row => row.tag), ['DIV', 'DIV', 'DIV']);
          assert.deepEqual(observed.map(row => row.href), [null, null, null]);
          assert.match(observed[0].text, /Entry pointL1/);
          assert.match(observed[1].text, /Route bodyL2–3/);
          continue;
        }
        const base = `${url}/blob/${data.revision}`;
        assert.deepEqual(observed.map(row => row.href), [`${base}/src/router.js#L1`, `${base}/src/router.js#L2-L3`, `${base}/src/store.js`]);
        const names = [];
        for (let index = 0; index < 3; index++) {
          const remote = await browser.cdp.send('Runtime.evaluate', {
            expression: `document.querySelectorAll('#focus-evidence .semantic-passport-source')[${index}]`,
          }, sessionId);
          const tree = await browser.cdp.send('Accessibility.getPartialAXTree', { objectId: remote.result.objectId, fetchRelatives: false }, sessionId);
          names.push(tree.nodes.find(node => !node.ignored)?.name?.value);
        }
        assert.notEqual(names[0], names[1]);
        for (const [index, label, location, sourcePath] of [[0, 'Entry point', 'L1', 'src/router.js'], [1, 'Route body', 'L2–3', 'src/router.js'], [2, 'store.js', '', 'src/store.js']]) {
          assert.ok(names[index].includes(label), names[index]);
          if (location) assert.ok(names[index].includes(location), names[index]);
          assert.ok(names[index].includes(sourcePath), names[index]);
          assert.ok(names[index].includes(data.revision.slice(0, 7)), names[index]);
          assert.match(names[index], locale === 'en' ? /Open/ : /打开/);
        }
      }
    }
  } finally { await browser.close(); }
});

test('browser renders local-only sources as searchable text and web sources as links', {
  skip: process.env.ARCHIFY_CHROME ? false : 'Set ARCHIFY_CHROME to run evidence browser checks.',
  timeout: 60000,
}, async () => {
  const data = fixture();
  const browser = new ChromeVisualBrowser(findChrome());
  try {
    for (const mode of ['github', 'gitee', 'gitlab', 'local-only']) {
      const local = mode === 'local-only';
      const url = local ? 'http://git.internal/Team/repo' : `https://${mode}.com/example/evidence-repo`;
      data.diagram.meta.repository = { url, revision: data.revision, ...(local ? { link_mode: mode } : {}) };
      git(data.root, 'remote', 'set-url', 'origin', url);
      fs.writeFileSync(data.input, JSON.stringify(data.diagram));
      const artifactPath = path.join(data.root, `${mode}.html`);
      const result = run(['deliver', 'architecture', data.input, artifactPath, '--repo-root', data.root, '--json']);
      assert.equal(result.status, 0, result.stderr || result.stdout);
      for (const theme of ['light', 'dark']) {
        await browser.inspect({ artifactPath, width: 1440, height: 900, theme });
        const sessionId = await browser.sessionPromise;
        const response = await browser.cdp.send('Runtime.evaluate', {
          expression: `(() => {
            document.querySelector('[data-node-id="users"]').dispatchEvent(new MouseEvent('click', { bubbles: true }));
            const panel = document.getElementById('focus-evidence');
            const rows = [...panel.querySelectorAll('.semantic-passport-source')];
            const input = document.getElementById('node-finder-input');
            input.value = 'src/router.js';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            return {
              visible: !panel.hidden,
              links: rows.filter(row => row.tagName === 'A').map(row => row.getAttribute('href')),
              paths: rows.map(row => row.querySelector('small').textContent),
              locations: rows.map(row => row.querySelector('code').textContent),
              repositoryHref: document.getElementById('focus-repository').getAttribute('href'),
              scope: panel.title,
              badges: document.querySelectorAll('[data-source-evidence-beacon]').length,
              sourceCount: document.querySelector('[data-node-id="users"]').getAttribute('data-source-evidence-count'),
              sourceAria: document.querySelector('[data-node-id="users"]').getAttribute('aria-label'),
              invalidLinks: [...panel.querySelectorAll('a[href]')].some(a => /undefined|javascript:/.test(a.getAttribute('href'))),
              search: document.getElementById('node-finder-results').textContent
            };
          })()`, returnByValue: true,
        }, sessionId);
        assert.equal(response.exceptionDetails, undefined);
        const observed = response.result.value;
        assert.equal(observed.visible, true);
        assert.equal(observed.badges, 0);
        assert.equal(observed.sourceCount, '2');
        assert.match(observed.sourceAria, /2 verified source references/);
        assert.equal(observed.invalidLinks, false);
        assert.deepEqual(observed.paths, ['src/router.js', 'src/store.js']);
        assert.match(observed.scope, /local Git/);
        assert.match(observed.search, /Users/);
        assert.equal(observed.links.length, local ? 0 : 2);
        assert.equal(observed.locations[0], local ? 'L1–3' : 'L1–3 ↗');
        assert.equal(observed.repositoryHref, local ? null : `${url}/${mode === 'gitlab' ? '-/' : ''}tree/${data.revision}`);
      }
    }
  } finally { await browser.close(); }
});

test('browser announces verified source counts without visual marks and restores canonical export labels', {
  skip: process.env.ARCHIFY_CHROME ? false : 'Set ARCHIFY_CHROME to run evidence browser checks.',
  timeout: 30000,
}, async (t) => {
  const data = fixture();
  t.after(() => fs.rmSync(data.root, { recursive: true, force: true }));
  data.diagram.meta.locale = 'zh-CN';
  fs.writeFileSync(data.input, JSON.stringify(data.diagram));
  const artifactPath = path.join(data.root, 'source-aria.html');
  const delivered = run(['deliver', 'architecture', data.input, artifactPath, '--repo-root', data.root, '--json']);
  assert.equal(delivered.status, 0, delivered.stderr || delivered.stdout);
  const html = fs.readFileSync(artifactPath, 'utf8');
  const initialization = html.match(/Archify\.sourceEvidence = \(function \(\) \{[\s\S]*?\}\)\(\);/)?.[0];
  assert.ok(initialization);
  const browser = new ChromeVisualBrowser(findChrome());
  try {
    await browser.inspect({ artifactPath, width: 1440, height: 900, theme: 'light' });
    const sessionId = await browser.sessionPromise;
    async function accessibleNodeName() {
      const remote = await browser.cdp.send('Runtime.evaluate', {
        expression: `document.querySelector('[data-node-id="users"]')`,
      }, sessionId);
      const tree = await browser.cdp.send('Accessibility.getPartialAXTree', {
        objectId: remote.result.objectId, fetchRelatives: false,
      }, sessionId);
      const name = tree.nodes.find(node => !node.ignored)?.name?.value;
      assert.equal(typeof name, 'string', JSON.stringify(tree));
      return name;
    }
    assert.match(await accessibleNodeName(), /2 个已验证来源引用/);
    const response = await browser.cdp.send('Runtime.evaluate', {
      expression: `(async () => {
        const reinitialize = () => { ${initialization} };
        const svg = document.querySelector('.diagram-container > svg');
        const node = svg.querySelector('[data-node-id="users"]');
        const element = document.getElementById('archify-source-evidence-data');
        const payload = JSON.parse(element.textContent);
        const originalSources = payload.nodes.users.slice();
        const authoredLabel = node.getAttribute('data-source-evidence-original-label');
        const geometry = [...svg.querySelectorAll('rect,path,line,polyline,text')].map(el => el.outerHTML).join('');
        const initial = node.getAttribute('aria-label');
        reinitialize();
        const repeated = node.getAttribute('aria-label');
        const noVisualMarks = !svg.querySelector('[data-source-evidence-beacon], .source-evidence-beacon');
        const geometryPreserved = geometry === [...svg.querySelectorAll('rect,path,line,polyline,text')].map(el => el.outerHTML).join('');
        Archify.focus.set('users', { toggle: false });
        const passportLinks = document.querySelectorAll('#focus-evidence a[href]').length;
        const before = svg.outerHTML;
        const originalCreate = URL.createObjectURL;
        let exportedBlob;
        URL.createObjectURL = function(blob) {
          if (blob.type.startsWith('image/svg+xml')) exportedBlob = blob;
          return originalCreate.call(URL, blob);
        };
        let exportPreservesLive;
        try {
          const pending = Archify.exportMenu.run('svg');
          exportPreservesLive = before === svg.outerHTML;
          await pending;
        } finally { URL.createObjectURL = originalCreate; }
        const exported = new DOMParser().parseFromString(await exportedBlob.text(), 'image/svg+xml');
        const exportedLabel = exported.querySelector('[data-node-id="users"]').getAttribute('aria-label');
        const exportClean = !exported.querySelector('[data-source-evidence-count], [data-source-evidence-original-label], [data-reader-legend-corner], [data-source-evidence-beacon]');
        // The download anchor can clear Focus through its existing outside-click
        // behavior. Reopen via the public interface to verify sources survive.
        Archify.focus.set('users', { toggle: false });
        const passportLinksAfter = document.querySelectorAll('#focus-evidence a[href]').length;
        payload.nodes.users = [];
        element.textContent = JSON.stringify(payload);
        reinitialize();
        const zeroRestored = node.getAttribute('aria-label') === authoredLabel && !node.hasAttribute('data-source-evidence-count');
        const results = [];
        for (const label of [null, '', 'Authored focus label']) {
          node.removeAttribute('data-source-evidence-count');
          node.removeAttribute('data-source-evidence-original-label');
          if (label === null) node.removeAttribute('aria-label'); else node.setAttribute('aria-label', label);
          payload.nodes.users = [originalSources[0]];
          payload.verified = true;
          element.textContent = JSON.stringify(payload);
          reinitialize();
          const once = node.getAttribute('aria-label');
          reinitialize();
          const twice = node.getAttribute('aria-label');
          let labelBlob;
          URL.createObjectURL = function(blob) {
            if (blob.type.startsWith('image/svg+xml')) labelBlob = blob;
            return originalCreate.call(URL, blob);
          };
          try { await Archify.exportMenu.run('svg'); }
          finally { URL.createObjectURL = originalCreate; }
          const exportedNode = new DOMParser().parseFromString(await labelBlob.text(), 'image/svg+xml').querySelector('[data-node-id="users"]');
          payload.nodes.users = [];
          element.textContent = JSON.stringify(payload);
          reinitialize();
          const zeroRestored = node.getAttribute('aria-label');
          payload.nodes.users = [originalSources[0]];
          element.textContent = JSON.stringify(payload);
          reinitialize();
          payload.verified = false;
          element.textContent = JSON.stringify(payload);
          reinitialize();
          results.push({ once, twice, zeroRestored, exportedLabel: exportedNode.getAttribute('aria-label'), restored: node.getAttribute('aria-label'), count: node.getAttribute('data-source-evidence-count') });
        }
        return { initial, repeated, noVisualMarks, geometryPreserved, authoredLabel, exportedLabel,
          exportClean, exportPreservesLive, passportLinks, passportLinksAfter,
          zeroRestored, results };
      })()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    assert.equal(response.exceptionDetails, undefined);
    const observed = response.result.value;
    assert.match(observed.initial, /2 个已验证来源引用/);
    assert.equal(observed.repeated, observed.initial);
    for (const key of ['noVisualMarks', 'geometryPreserved', 'exportClean', 'exportPreservesLive', 'zeroRestored']) assert.equal(observed[key], true, key);
    assert.equal(observed.exportedLabel, observed.authoredLabel);
    assert.equal(observed.passportLinks, 3);
    assert.equal(observed.passportLinksAfter, 3);
    for (const [index, result] of observed.results.entries()) {
      assert.match(result.once, /1 个已验证来源引用/);
      assert.equal(result.twice, result.once);
      assert.equal(result.restored, [null, '', 'Authored focus label'][index]);
      assert.equal(result.zeroRestored, [null, '', 'Authored focus label'][index]);
      assert.equal(result.exportedLabel, [null, '', 'Authored focus label'][index]);
      assert.equal(result.count, null);
    }
    const restored = await browser.cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const element = document.getElementById('archify-source-evidence-data');
        const payload = JSON.parse(element.textContent);
        payload.verified = true;
        element.textContent = JSON.stringify(payload);
        ${initialization}
        return document.querySelector('[data-node-id="users"]').getAttribute('aria-labelledby');
      })()`, returnByValue: true,
    }, sessionId);
    assert.equal(restored.exceptionDetails, undefined);
    assert.equal(restored.result.value, null, 'node has no competing aria-labelledby');
    assert.equal(await accessibleNodeName(), 'Authored focus label, 1 个已验证来源引用');
  } finally { await browser.close(); }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { startPreview } from '../archify/bin/preview.mjs';
import { findChrome } from '../archify/bin/visual-check.mjs';
import { desktopBrowser } from './helpers/desktop-browser.mjs';

const cli = fileURLToPath(new URL('../archify/bin/archify.mjs', import.meta.url));
const chrome = process.env.ARCHIFY_CHROME ? findChrome() : null;
const browserOptions = {
  skip: chrome ? false : 'Set ARCHIFY_CHROME to run the live preview browser checks.',
  timeout: 60000,
};
const diagram = title => ({
  schema_version: 1, diagram_type: 'architecture',
  meta: { title, output: 'diagram.html' },
  components: [
    { id: 'api', type: 'backend', label: 'API', pos: [80, 80], size: [160, 80] },
    { id: 'store', type: 'database', label: 'Store', pos: [380, 80], size: [160, 80] },
  ],
  connections: [{ id: 'write', from: 'api', to: 'store', label: 'write' }],
});

async function waitFor(read, accepts, message) {
  const deadline = Date.now() + 15000;
  let value;
  do {
    value = await read();
    if (accepts(value)) return value;
    await new Promise(resolve => setTimeout(resolve, 30));
  } while (Date.now() < deadline);
  assert.fail(`${message}: ${JSON.stringify(value)}`);
}

async function fixture(t, source, { paused = false } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'archify-preview-browser-'));
  const input = path.join(directory, 'input.json');
  const gate = path.join(directory, 'delivery-paused');
  const deliveryCli = path.join(directory, 'delivery.mjs');
  let preview;
  let browser;
  t.after(async () => {
    try { await browser?.close(); }
    finally {
      try { await preview?.stop({ force: true }); }
      finally { fs.rmSync(directory, { recursive: true, force: true }); }
    }
  });
  fs.writeFileSync(input, source);
  if (paused) fs.writeFileSync(gate, '');
  // 只暂停交付调度；放行后仍执行真实 CLI，避免依赖机器速度捕捉 checking。
  fs.writeFileSync(deliveryCli, `
    import fs from 'node:fs';
    const deadline = Date.now() + 30000;
    while (fs.existsSync(${JSON.stringify(gate)})) {
      if (Date.now() > deadline) throw new Error('Preview test delivery was not released');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    process.env.ARCHIFY_UPDATE_CHECK_DISABLED = '1';
    await import(${JSON.stringify(pathToFileURL(cli).href)});
  `);
  preview = await startPreview({
    type: 'architecture', input, output: path.join(directory, 'diagram.html'),
    open: false, watch: false, pollMs: 40, debounceMs: 20, deliveryCli,
  });
  browser = desktopBrowser(chrome);
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result?.value;
  };
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const navigate = async () => {
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: preview.url });
    await loaded;
  };
  const ui = () => evaluate(`(() => {
    const frame = document.getElementById('artifact');
    return {
      state: document.body.dataset.state,
      hasArtifact: document.body.dataset.hasArtifact,
      status: document.getElementById('status').textContent,
      errorVisible: !document.getElementById('failure').hidden,
      diagnostic: document.getElementById('diagnostic').textContent,
      src: frame.getAttribute('src'),
      title: frame.contentDocument?.querySelector('#archify-diagram-title')?.textContent,
      ready: !!frame.contentWindow?.Archify?.focus,
      focused: frame.contentWindow?.Archify?.focus?.active(),
      sameDocument: window.savedPreviewDocument === frame.contentDocument,
    };
  })()`);
  const state = status => waitFor(preview.state, value => value.status === status, `Server did not reach ${status}`);
  const visibleState = status => {
    const generation = preview.state().generation;
    // 壳页初始就是 checking / generation 1；后续轮次必须等真正的 SSE 状态渲染。
    return waitFor(ui, value => value.state === status
      && (status !== 'checking' || value.status === `Checking · generation ${generation}`),
    `Preview did not show ${status} for generation ${generation}`);
  };
  const artifact = title => waitFor(ui, value => value.ready && value.title === title, `Preview did not load ${title}`);
  const rememberFocus = () => evaluate(`(() => {
    const frame = document.getElementById('artifact');
    window.savedPreviewDocument = frame.contentDocument;
    return frame.contentWindow.Archify.focus.set('api', { toggle: false });
  })()`);
  return {
    navigate, ui, state, visibleState, artifact, rememberFocus,
    pause: () => fs.writeFileSync(gate, ''),
    resume: () => fs.rmSync(gate, { force: true }),
    write: source => fs.writeFileSync(input, source),
  };
}

test('preview browser: a first connection without a verified revision keeps the empty state', browserOptions, async t => {
  const preview = await fixture(t, '{"meta":', { paused: true });
  await preview.navigate();
  const checking = await preview.visibleState('checking');
  assert.equal(checking.hasArtifact, 'false');
  assert.equal(checking.src, null);
  preview.resume();
  await preview.state('needs-fix');
  await preview.navigate();
  const failed = await preview.visibleState('needs-fix');
  assert.equal(failed.hasArtifact, 'false');
  assert.equal(failed.src, null);
  assert.equal(failed.errorVisible, true);
  assert.match(failed.status, /no verified revision/);
});

test('preview browser: reconnect restores the last verified revision through failures and checking', browserOptions, async t => {
  const firstTitle = 'Last verified diagram';
  const nextTitle = 'Repaired diagram';
  const source = JSON.stringify(diagram(firstTitle));
  const preview = await fixture(t, source);
  await preview.state('verified');
  await preview.navigate();
  await preview.artifact(firstTitle);
  assert.equal(await preview.rememberFocus(), true);

  preview.write('{"meta":');
  await preview.state('needs-fix');
  const kept = await preview.visibleState('needs-fix');
  assert.equal(kept.sameDocument, true, '失败不能重载已经打开的上一版图');
  assert.equal(kept.focused, 'api');
  await preview.navigate();
  const restored = await preview.visibleState('needs-fix');
  assert.equal(restored.hasArtifact, 'true', '新连接必须恢复服务仍持有的已验证图');
  assert.equal(restored.errorVisible, true, '恢复旧图不能隐藏新候选的错误');
  assert.match(restored.status, /showing rev 1/);
  assert.match(restored.diagnostic, /input\/json-parse/);
  await preview.artifact(firstTitle);

  preview.pause();
  preview.write(JSON.stringify(diagram(nextTitle)));
  await preview.state('checking');
  await preview.navigate();
  const checking = await preview.visibleState('checking');
  assert.equal(checking.hasArtifact, 'true', '检查期间的新连接也应恢复上一版图');
  assert.equal(checking.errorVisible, false);
  await preview.artifact(firstTitle);
  assert.equal(await preview.rememberFocus(), true);
  preview.resume();
  const repaired = await preview.state('verified');
  assert.equal(repaired.revision, 2);
  const next = await preview.artifact(nextTitle);
  assert.equal(next.sameDocument, false, '新的已验证版本必须替换旧图');
  assert.match(next.src, /revision=2&sha=/);

  assert.equal(await preview.rememberFocus(), true);
  preview.pause();
  // 只修改 JSON 排版，实际产物及 revision 不变。
  preview.write(JSON.stringify(diagram(nextTitle), null, 2));
  await preview.state('checking');
  await preview.visibleState('checking');
  preview.resume();
  const unchanged = await preview.state('verified');
  assert.equal(unchanged.revision, 2);
  const stable = await preview.visibleState('verified');
  assert.equal(stable.sameDocument, true, '同一个 revision 不能因状态更新而重载');
  assert.equal(stable.focused, 'api', '同一个 revision 保留 Viewer 聚焦状态');
});

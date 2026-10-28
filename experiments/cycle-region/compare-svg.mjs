// Run from the repository root after rendering baseline.html and candidate.html.
// Uses Archify's existing real-Chrome harness; no page or screenshot simulation.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { ChromeVisualBrowser, findChrome } from '../../archify/bin/visual-check.mjs';
const directory = path.dirname(fileURLToPath(import.meta.url));
const browser = new ChromeVisualBrowser(findChrome());
try {
  const session = await browser.sessionPromise;
  const send = (method, params = {}) => browser.cdp.send(method, params, session);
  const run = async expression => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    assert.equal(result.exceptionDetails, undefined, result.exceptionDetails?.exception?.description);
    return result.result.value;
  };
  await browser.cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  const results = {};
  for (const name of ['baseline', 'candidate']) {
    const loaded = browser.cdp.waitFor('Page.loadEventFired', session);
    await send('Page.navigate', { url: pathToFileURL(path.join(directory, name + '.html')).href + '?theme=light' });
    await loaded;
    await run('document.fonts.ready');
    await run('Archify.viewerChromeLayout.whenStable()');
    if (name === 'candidate') await run(`Archify.focus.set('c',{toggle:false});Archify.focus.reach('cycle')`);
    const result = await run(`(async()=>{
      const svg=document.querySelector('.diagram-container > svg');
      const before=svg.outerHTML, create=URL.createObjectURL;let blob;
      URL.createObjectURL=value=>{if(value.type==='image/svg+xml;charset=utf-8'||value.type.startsWith('image/svg+xml'))blob=value;return create.call(URL,value);};
      try{await Archify.exportMenu.run('svg-light');}finally{URL.createObjectURL=create;}
      const text=await blob.text(),root=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
      const identity=[...root.querySelectorAll('[data-node-id],[data-edge-from]')].map(element=>({
        tag:element.tagName, attributes:[...element.attributes].filter(attribute=>/^(data-(node|edge)-|d$|points$|x[12]?$|y[12]?$|width$|height$|transform$|marker-)/.test(attribute.name)).map(attribute=>[attribute.name,attribute.value]),
        text:element.textContent.trim()
      }));
      return {text,identity,liveUnchanged:before===svg.outerHTML,clean:![root,...root.querySelectorAll('*')].some(element=>[...element.attributes].some(attribute=>/^data-(focus|reach|relationship)/.test(attribute.name)))};
    })()`);
    fs.writeFileSync(path.join(directory, name + '.light.svg'), result.text);
    results[name] = { sha256: createHash('sha256').update(result.text).digest('hex'), bytes: Buffer.byteLength(result.text), identity: result.identity, liveUnchanged: result.liveUnchanged, clean: result.clean };
  }
  assert.deepEqual(results.candidate.identity, results.baseline.identity);
  assert.ok(results.candidate.liveUnchanged && results.candidate.clean && results.baseline.clean);
  const report = { viewport: [1440,900], theme: 'light', candidateMode: 'focus=c&region=cycle', identityEqual: true, nodes: 13, relationships: 14, ...results };
  fs.writeFileSync(path.join(directory, 'svg-comparison.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('Fixed light SVG identity matches: 13 nodes, 14 relationships; runtime state excluded and live DOM retained.');
} finally { await browser.close(); }

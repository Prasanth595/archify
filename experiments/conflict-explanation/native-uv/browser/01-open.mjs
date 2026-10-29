const fs = await import('node:fs/promises');
const crypto = await import('node:crypto');
const here = new URL('.', import.meta.url);
const task = await taskSpace(3);
const page = task.page('p1');
await page.goto('http://127.0.0.1:8877/index.html');
await page.waitForFunction(() => document.fonts.status === 'loaded', undefined, { timeout: 10000 });
const observed = await page.evaluate(() => ({
  title: document.title, url: location.href, userAgent: navigator.userAgent,
  width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  streams: Object.fromEntries([...document.querySelectorAll('pre')].map(n => [n.id, n.textContent])),
  resources: [...document.querySelectorAll('[src],link[href]')].map(n => n.src || n.href)
}));
const checks = [];
for (const name of ['missing-bar','provided-bar']) for (const stream of ['stdout','stderr']) {
  const expected = await fs.readFile(new URL('../run2/' + name + '.' + stream + '.txt', here), 'utf8');
  checks.push({id:name+'-'+stream, exactText:observed.streams[name+'-'+stream] === expected});
}
const html = await fs.readFile(new URL('../index.html', here));
observed.servedFileSha256 = crypto.createHash('sha256').update(html).digest('hex');
observed.streamChecks = checks;
await fs.writeFile(new URL('observation.json', here), JSON.stringify(observed,null,2)+'\n');
await page.screenshot({path: new URL('native-output-overview.png', here).pathname});
console.log(JSON.stringify({checks,width:observed.width,height:observed.height,scrollHeight:observed.scrollHeight}));
console.log(await page.snapshot());

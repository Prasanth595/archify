const fs = await import('node:fs/promises');
const here = new URL('.', import.meta.url);
const task = await taskSpace(3);
const page = task.page('p1');
await page.waitForFunction(() => {const r=[...document.querySelectorAll('tr.diffchanged')].find(n=>n.textContent.includes('15462')); const b=r.getBoundingClientRect(); return b.top>=0&&b.bottom<=innerHeight;},undefined,{timeout:5000});
const observed = await page.evaluate(() => ({
 hash:decodeURIComponent(location.hash),
 markers:[...document.querySelectorAll('tr.diffchanged')].filter(r=>r.textContent.replaceAll('\u200b','').includes('lines')).map(r=>({cells:[...r.cells].map(c=>c.textContent),controls:r.querySelectorAll('a,button,input,details').length,html:r.outerHTML})),
 scripts:document.scripts.length,buttons:document.querySelectorAll('button').length,footer:document.querySelector('.footer').textContent,
 width:innerWidth,height:innerHeight
}));
await fs.writeFile(new URL('sql-dom.json',here),JSON.stringify(observed,null,2)+'\n');
await page.screenshot({path:new URL('03-omitted-lines.png',here).pathname});
console.log(JSON.stringify({...observed,markers:observed.markers.map(({html,...r})=>r)}));
await fs.writeFile(new URL('05-marker-snapshot.txt',here),await page.snapshot());

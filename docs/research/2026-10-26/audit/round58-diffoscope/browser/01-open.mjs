const fs = await import('node:fs/promises');
const here = new URL('.', import.meta.url);
const task = await taskSpace(3);
const page = task.page('p1');
await page.goto('http://127.0.0.1:8878/native.html');
await page.waitForFunction(() => document.fonts.status === 'loaded', undefined, {timeout:10000});
const observed = await page.evaluate(() => ({
 title:document.title,footer:document.querySelector('.footer').textContent,
 headers:[...document.querySelectorAll('.diffheader')].map(n => ({text:n.innerText,anchor:n.querySelector('a')?.getAttribute('href')})),
 comments:[...document.querySelectorAll('.comment,.error')].map(n=>n.innerText),
 removed:[...document.querySelectorAll('tr')].filter(n=>n.textContent.includes('lines')).map(n=>({class:n.className,text:n.innerText.slice(0,600)})),
 scripts:[...document.scripts].map(n=>n.src),
 viewport:{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}
}));
await fs.writeFile(new URL('initial-dom.json',here),JSON.stringify(observed,null,2)+'\n');
await page.screenshot({path:new URL('01-listing.png',here).pathname});
console.log(JSON.stringify(observed));
console.log(await page.snapshot());

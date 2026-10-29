const fs = await import('node:fs/promises');
const here = new URL('.', import.meta.url);
const task = await taskSpace(3);
const page = task.page('p1');
await page.hover('loc=css:.diffheader:has(a[name="chrome/content/about.xul"])', {label:'reveal member permalink'});
await page.click('loc=css:a[name="chrome/content/about.xul"]', {label:'open member permalink'});
await page.waitForFunction(() => decodeURIComponent(location.hash) === '#chrome/content/about.xul', undefined, {timeout:5000});
const observed = await page.evaluate(() => {
 const header=document.querySelector('a[name="chrome/content/about.xul"]').closest('.diffheader');
 const table=header.closest('.difference').querySelector('table');
 const listing=[...document.querySelector('a[name="zipinfo {}"]').closest('.difference').querySelectorAll('tr')].find(r=>r.textContent.replaceAll('\u200b','').includes('chrome/content/about.xul'));
 return {hash:location.hash,header:header.innerText,headerTop:header.getBoundingClientRect().top,
 listing:{class:listing.className,cells:[...listing.cells].map(c=>c.textContent)},
 changes:[...table.querySelectorAll('tr.diffchanged')].map(r=>({class:r.className,cells:[...r.cells].map(c=>c.textContent)})),
 width:innerWidth,height:innerHeight};
});
await fs.writeFile(new URL('member-dom.json',here),JSON.stringify(observed,null,2)+'\n');
await page.screenshot({path:new URL('02-member-content.png',here).pathname});
console.log(JSON.stringify(observed));
await fs.writeFile(new URL('02-member-snapshot.txt',here),await page.snapshot());

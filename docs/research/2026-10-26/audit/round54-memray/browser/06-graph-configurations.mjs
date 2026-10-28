import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
for(const variant of ['default','unfiltered','inverted']){
 if(variant==='unfiltered')await page.click('#hideUninteresting');
 if(variant==='inverted')await page.click('#invertButton');
 await page.hover('#chart g.frame[name="<root>"]');
 await page.waitForFunction(()=>[...document.querySelectorAll('body>div')].some(e=>/total/.test(e.innerText)&&getComputedStyle(e).opacity==='1'&&e.className.includes('tip')),undefined,{timeout:10000});
 console.log(await page.snapshot());
 const state=await page.evaluate(()=>({url:location.href,viewport:{width:innerWidth,height:innerHeight},scroll:{x:scrollX,y:scrollY},timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,inputs:[...document.querySelectorAll('input[type=checkbox]')].map(e=>({id:e.id,checked:e.checked})),tooltips:[...document.querySelectorAll('body>div')].filter(e=>e.className.includes('tip')).map(e=>({className:e.className,text:e.innerText,opacity:getComputedStyle(e).opacity})),frames:[...document.querySelectorAll('#chart g.frame')].map(e=>({name:e.getAttribute('name'),transform:e.getAttribute('transform'),width:e.getAttribute('width'),label:e.querySelector('.d3-flame-graph-label')?.textContent,display:e.querySelector('.d3-flame-graph-label')?.style.display})),resources:[...document.querySelectorAll('script[src],link[href]')].map(e=>e.src||e.href)}));
 await fs.writeFile('/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round54-memray/browser/'+variant+'-state.json',JSON.stringify(state,null,2));
 await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round54-memray/browser/'+variant+'-root.png'});
}

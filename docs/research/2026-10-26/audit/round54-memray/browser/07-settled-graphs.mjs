import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
await page.goto('http://127.0.0.1:8874/report.html');
await page.waitForFunction(()=>document.querySelector('#chart g.frame'),undefined,{timeout:15000});
for(const variant of ['default','unfiltered','inverted']){
 if(variant==='unfiltered')await page.click('#hideUninteresting');
 if(variant==='inverted')await page.click('#invertButton');
 const settled=await page.evaluate(()=>new Promise(resolve=>{let previous='',since=performance.now(),start=since;function check(){const value=[...document.querySelectorAll('#chart g.frame')].map(e=>e.outerHTML).join('');const now=performance.now();if(value!==previous){previous=value;since=now;}if(now-since>=350)return resolve({stable:true,elapsedMs:now-start});if(now-start>5000)return resolve({stable:false,elapsedMs:now-start});requestAnimationFrame(check);}check();}));
 if(!settled.stable)throw new Error('graph DOM did not settle');
 await page.hover('#chart g.frame[name="<root>"]');
 await page.waitForFunction(()=>[...document.querySelectorAll('body>div')].some(e=>e.className.includes('d3-flame-graph-tip')&&getComputedStyle(e).opacity==='1'),undefined,{timeout:10000});
 const state=await page.evaluate(()=>({url:location.href,viewport:{width:innerWidth,height:innerHeight},scroll:{x:scrollX,y:scrollY},timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,inputs:[...document.querySelectorAll('input[type=checkbox]')].map(e=>({id:e.id,checked:e.checked})),tooltips:[...document.querySelectorAll('body>div')].filter(e=>e.className.includes('tip')).map(e=>({className:e.className,text:e.innerText,opacity:getComputedStyle(e).opacity})),frames:[...document.querySelectorAll('#chart g.frame')].map(e=>({name:e.getAttribute('name'),transform:e.getAttribute('transform'),width:e.getAttribute('width'),label:e.querySelector('.d3-flame-graph-label')?.textContent,display:e.querySelector('.d3-flame-graph-label')?.style.display})),resources:[...document.querySelectorAll('script[src],link[href]')].map(e=>e.src||e.href)}));
 state.settled=settled;
 await fs.writeFile('/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round54-memray/browser/'+variant+'-state.json',JSON.stringify(state,null,2));
 await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round54-memray/browser/'+variant+'-root.png'});
 console.log(JSON.stringify({variant,frames:state.frames.length,root:state.frames[0],settled,tips:state.tooltips.filter(e=>e.opacity==='1')}));
}

import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
await page.waitForFunction(()=>{const e=document.querySelector('.modal.show');return e&&getComputedStyle(e).opacity==='1';},undefined,{timeout:10000});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({dialogs:[...document.querySelectorAll('.modal.show')].map(e=>({id:e.id,text:e.innerText,box:(()=>{const b=e.getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}})()}))})));
await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round54-memray/browser/04-stats-settled.png'});
await fs.writeFile('/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round54-memray/browser/04-stats-state.json',JSON.stringify(await page.evaluate(()=>({url:location.href,viewport:{width:innerWidth,height:innerHeight},dialogs:[...document.querySelectorAll('.modal.show')].map(e=>({id:e.id,text:e.innerText}))})),null,2));

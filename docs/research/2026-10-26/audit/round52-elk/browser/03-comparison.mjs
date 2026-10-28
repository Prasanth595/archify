import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
await page.goto('http://127.0.0.1:8872/original.html');
for(const variant of ['original','fixed-side','separate-children']){
 if(variant!=='original')await page.click('a[href="'+variant+'.html"]');
 console.log(await page.snapshot());
 await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round52-elk/browser/'+variant+'.png'});
 const state=await page.evaluate(()=>({url:location.href,title:document.title,viewport:{width:innerWidth,height:innerHeight},text:document.body.innerText,renderedEdges:[...document.querySelectorAll('polyline[data-edge]')].map(e=>({id:e.dataset.edge,points:e.getAttribute('points')})),svgBox:(()=>{const b=document.querySelector('svg').getBoundingClientRect();return{x:b.x,y:b.y,width:b.width,height:b.height}})()}));
 await fs.writeFile('/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round52-elk/browser/'+variant+'-state.json',JSON.stringify(state,null,2));
}

import fs from 'node:fs/promises';
const root="/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round55-wavedrom",task=await taskSpace(3),page=task.page('p1');
for(const name of ['baseline','phase-zero','scale-two']){
 const input=await fs.readFile(root+'/cases/'+name+'.json','utf8');
 await page.goto('http://127.0.0.1:8875/editor.html?'+encodeURIComponent(input));
 await page.waitForFunction(()=>document.querySelector('#WaveDrom_Display_0 svg')?.textContent.includes('3 ms'),undefined,{timeout:15000});
 const state=await page.evaluate(()=>{const svg=document.querySelector('#WaveDrom_Display_0 svg');return{url:location.href,viewport:{width:innerWidth,height:innerHeight},version:document.querySelector('#version')?.textContent,svg:svg.outerHTML,paths:[...svg.querySelectorAll('[id^="gmark_"]')].map(e=>({id:e.id,d:e.getAttribute('d'),bounds:(()=>{let b=e.getBBox();return{x:b.x,y:b.y,width:b.width,height:b.height}})()})),texts:[...svg.querySelectorAll('text')].map(e=>({text:e.textContent,x:e.getAttribute('x'),y:e.getAttribute('y'),parentTransform:e.parentElement.getAttribute('transform')})),resources:[...document.querySelectorAll('script[src],link[href]')].map(e=>e.src||e.href),lanes:[...svg.querySelectorAll('[id^="wavelane_"]')].map(e=>({id:e.id,transform:e.getAttribute('transform')}))}});
 await fs.writeFile(root+'/browser/'+name+'-state.json',JSON.stringify(state,null,2));
 await fs.writeFile(root+'/browser/'+name+'-dom.svg',state.svg);
 await page.screenshot({path:root+'/browser/'+name+'.png'});
 console.log(JSON.stringify({name,version:state.version,paths:state.paths}));
}
console.log(await page.snapshot());

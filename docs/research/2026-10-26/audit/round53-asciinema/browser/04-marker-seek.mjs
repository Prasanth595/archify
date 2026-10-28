import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
for(const variant of ['original-external','compressed-external','compressed-embedded']){
 await page.goto('http://127.0.0.1:8873/?case='+variant);
 await page.waitForFunction(()=>document.querySelector('.ap-marker-container'),undefined,{timeout:15000});
 await page.click('.ap-marker-container');
 await page.waitForFunction(()=>document.querySelector('.ap-time-elapsed')?.textContent!=='00:00',undefined,{timeout:10000});
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 console.log(await page.snapshot());
 await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round53-asciinema/browser/'+variant+'.png'});
 const state=await page.evaluate(()=>({url:location.href,title:document.getElementById('title').textContent,options:document.getElementById('options').textContent,viewport:{width:innerWidth,height:innerHeight},elapsed:document.querySelector('.ap-time-elapsed')?.textContent,remaining:document.querySelector('.ap-time-remaining')?.textContent,markers:[...document.querySelectorAll('.ap-marker-container')].map(e=>({text:e.textContent,left:e.style.left})),playerText:document.getElementById('player').innerText,canvas:[...document.querySelectorAll('#player canvas')].map(e=>({width:e.width,height:e.height})),buttons:[...document.querySelectorAll('#player button')].map(e=>e.getAttribute('aria-label'))}));
 await fs.writeFile('/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round53-asciinema/browser/'+variant+'-state.json',JSON.stringify(state,null,2));
}

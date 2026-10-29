import fs from 'node:fs/promises';
const root="/Users/tsk/.codex/worktrees/lab-operation-order/archify/experiments/operation-order/native-comparison",task=await taskSpace(3),page=task.page('p1');
await page.hover('.target-rect[data-partition="0"][data-index="2"]');
await page.waitForFunction(()=>document.body.innerText.includes('invalid op'),undefined,{timeout:10000});
const state=await page.evaluate(()=>({url:location.href,viewport:{width:innerWidth,height:innerHeight},text:document.body.innerText,visibleDivs:[...document.querySelectorAll('div')].filter(e=>getComputedStyle(e).display!=='none'&&e.innerText.includes('Previous state')).map(e=>({id:e.id,cls:e.className,text:e.innerText})),canvas:document.querySelector('#canvas').innerHTML,resources:[...document.querySelectorAll('script[src],link[href]')].map(e=>e.src||e.href)}));
await fs.writeFile(root+'/browser/original-invalid-state.json',JSON.stringify(state,null,2));
await page.screenshot({path:root+'/browser/original-invalid.png'});
console.log(await page.snapshot());

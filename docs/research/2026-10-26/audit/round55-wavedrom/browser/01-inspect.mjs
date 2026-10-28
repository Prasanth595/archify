import fs from 'node:fs/promises';
const root="/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round55-wavedrom",task=await taskSpace(3),page=task.page('p1');
const input=await fs.readFile(root+'/cases/baseline.json','utf8');await page.goto('http://127.0.0.1:8875/editor.html?'+encodeURIComponent(input));
await page.waitForFunction(()=>document.querySelector('#WaveDrom_Display_0 svg')?.textContent.includes('3 ms'),undefined,{timeout:15000});
console.log(await page.evaluate(()=>({svg:document.querySelector('#WaveDrom_Display_0 svg').outerHTML.slice(-13000),inputs:[...document.querySelectorAll('textarea')].map(e=>({id:e.id,cls:e.className})),scripts:[...document.scripts].map(e=>e.src).filter(Boolean)})));console.log(await page.snapshot());

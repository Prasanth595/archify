import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
await page.goto('http://127.0.0.1:8873/?case=original-external');
await page.waitForFunction(()=>document.querySelector('.ap-marker-container'),undefined,{timeout:15000});
console.log(await page.snapshot());
await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round53-asciinema/browser/03-initial.png'});
console.log(await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight},markers:[...document.querySelectorAll('.ap-marker-container')].map(e=>({text:e.textContent,html:e.outerHTML})),paragraphs:[...document.querySelectorAll('#player p')].map(e=>e.textContent)})));

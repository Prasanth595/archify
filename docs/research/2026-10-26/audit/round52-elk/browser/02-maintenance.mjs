import fs from 'node:fs/promises';
const task=await taskSpace(3),page=task.page('p1');
console.log(await page.snapshot());
await page.screenshot({path:'/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round52-elk/browser/01-maintenance.png'});
await fs.writeFile('/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round52-elk/browser/01-maintenance-state.json',JSON.stringify(await page.evaluate(()=>({url:location.href,title:document.title,text:document.body.innerText})),null,2));
await page.goto('about:blank');

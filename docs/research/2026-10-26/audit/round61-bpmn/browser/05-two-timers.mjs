const page=(await taskSpace(2)).page("p1"); const fs=await import("node:fs/promises"); const actions=[];
for (const count of [1,2]) {
actions.push(await page.click('[data-container-id="Timer_1"] button[title="Trigger Event"]'));
await page.waitForFunction((n)=>document.querySelector('[data-container-id="ParallelJoin_1"]')?.innerText.trim()===String(n),count,{timeout:10000});
}
const observed=await page.evaluate(()=>({url:location.href,text:document.body.innerText,overlays:[...document.querySelectorAll('.djs-overlays')].map(e=>({id:e.getAttribute('data-container-id'),text:e.innerText,html:e.outerHTML})),visibleLog:[...document.querySelectorAll('.bts-text')].map(e=>({title:e.title,text:e.textContent,visible:e.getBoundingClientRect().width>0}))}));
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round61-bpmn/browser/05-two-timers.json",JSON.stringify({actions,observed},null,2));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round61-bpmn/browser/05-two-timers.png"});
console.log({text:observed.text,overlays:observed.overlays.map(({id,text})=>({id,text}))});
console.log(await page.snapshot());

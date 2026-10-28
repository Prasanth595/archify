const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.hover('.plan-node.selected [data-icon="triangle-exclamation"]',{label:'read native average row warning'});
await page.waitForFunction(()=>document.body.innerText.includes("rows count is an average value"),undefined,{timeout:10000});
console.log(await page.snapshot());
const state=await page.evaluate(()=>({url:location.href,selected:document.querySelector('.plan-node.selected')?.innerText,tooltips:[...document.querySelectorAll('[role="tooltip"]')].map(x=>({text:x.innerText,rect:x.getBoundingClientRect().toJSON()}))}));
console.log(state);
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/browser/warning-state.json",JSON.stringify(state,null,2)+'\n');
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/screenshots/03-average-warning.png"});

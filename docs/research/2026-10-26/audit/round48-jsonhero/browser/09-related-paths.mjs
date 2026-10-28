const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('.info-panel .my-4 > .mb-1 > .flex',{label:'expand eight false paths'});
await page.waitForFunction(()=>document.querySelector('.info-panel')?.textContent.includes('root'),undefined,{timeout:10000});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/09-related-paths.png"});
console.log(await page.snapshot());

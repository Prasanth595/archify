const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto('https://jsonhero.io/j/PjHo1o5MVeH4?path=2.created_at');
await page.waitForFunction(()=>document.querySelector('.info-panel')?.textContent.includes('created_at'),undefined,{timeout:15000});
console.log({url:await page.url()});
console.log('PANEL',await page.evaluate(()=>document.querySelector('.info-panel')?.innerText));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/07-date-inference.png"});
console.log(await page.snapshot());

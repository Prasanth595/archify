const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.keyboard.press('Alt+ArrowLeft');
console.log('AFTER_ALT_LEFT',await page.evaluate(()=>document.querySelector('.info-panel')?.innerText));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/05-false-parent-highlight.png"});
await page.keyboard.press('ArrowDown');
await page.waitForFunction(()=>document.querySelector('.info-panel')?.textContent.includes('Index 1'),undefined,{timeout:10000});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/05-false-sibling.png"});
console.log(await page.snapshot());

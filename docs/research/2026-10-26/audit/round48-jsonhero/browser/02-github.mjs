const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('loc=href:/j/PjHo1o5MVeH4',{label:'open existing GitHub sample'});
console.log(await page.snapshot());
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/02-github-sample.png"});

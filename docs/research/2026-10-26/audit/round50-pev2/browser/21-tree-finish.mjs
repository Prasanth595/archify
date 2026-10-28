const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/screenshots/07-archify-existing-tree.png"});
console.log(await page.evaluate(()=>({url:location.href,title:document.title,text:document.body.innerText})));
await page.goto('about:blank');
console.log(await page.snapshot());

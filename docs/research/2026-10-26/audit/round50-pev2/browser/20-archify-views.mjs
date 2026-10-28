const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/screenshots/06-archify-existing-explainer.png"});
console.log(await page.evaluate(()=>({url:location.href,title:document.title,text:document.body.innerText})));
await page.goto('http://127.0.0.1:18751/output/plan-row-counts.html');
await page.waitForFunction(()=>document.body.innerText.includes('Index Scan'),undefined,{timeout:10000});
console.log(await page.snapshot());

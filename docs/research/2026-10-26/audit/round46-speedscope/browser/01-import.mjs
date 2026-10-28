const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.setInputFiles('input#file', ['/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round46-speedscope/source/sample/profiles/Firefox/61/recursion.json']);
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({url:location.href,scripts:[...document.querySelectorAll('script[src]')].map(x=>x.src)})));

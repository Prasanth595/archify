const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({url:location.href,nodes:[...document.querySelectorAll('svg text')].filter(x=>x.textContent==='#12').map(x=>x.parentElement.outerHTML.slice(0,12000))})));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/screenshots/02-index-selected.png"});

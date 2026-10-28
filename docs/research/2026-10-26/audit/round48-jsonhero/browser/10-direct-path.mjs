const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('.info-panel p:text-is("private") >> nth=7',{label:'jump to eighth false field'});
await page.waitForFunction(()=>Array.from(document.querySelectorAll('h2')).some(x=>x.textContent==='Index 7'),undefined,{timeout:10000});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/10-direct-false-path.png"});
console.log(await page.snapshot());

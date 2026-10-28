const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('text="Time Order"');
console.log(await page.evaluate(()=>({top:document.elementFromPoint(150,10)?.outerHTML,main:document.elementFromPoint(30,152)?.outerHTML.slice(0,200)})));
await page.dblclick('canvas._10klzby >> nth=1',{position:{x:30,y:30},label:'fit observed main stack'});
await page.waitForTimeout(300);
console.log(await page.snapshot());
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round46-speedscope/images/time-order-native-dblclick.png"});

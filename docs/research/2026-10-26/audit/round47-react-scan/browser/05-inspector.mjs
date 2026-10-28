const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('#react-scan-inspect-element',{label:'enable component inspection'});
await page.click('text="Script Tag"',{label:'select install guide'});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/images/05-inspector.png"});
console.log(await page.snapshot());

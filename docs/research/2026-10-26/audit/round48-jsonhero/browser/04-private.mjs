const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const download=await page.fetch('/j/PjHo1o5MVeH4.json',{saveAs:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/fixtures/github-sample.json"});
console.log({url:download.url,status:download.status,ok:download.ok});
await page.click('text="private"',{label:'inspect existing false value'});
await page.waitForFunction(()=>document.querySelector('.info-panel')?.textContent.includes('Related values'),undefined,{timeout:10000});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/04-private-false.png"});
console.log(await page.snapshot());

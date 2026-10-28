const task=await taskSpace(2);const page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('button[aria-label="Focus Redis, 2 related connections"]',{label:"Compare Redis Passport relationships"});
await page.evaluate(()=>Archify.viewerChromeLayout.whenStable());
console.log(await page.snapshot());
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-finder-link-count/archify/experiments/finder-link-count/evidence/before-passport-dark.png"});

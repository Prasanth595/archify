const task = await taskSpace(3);
const page = task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride", {width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto("http://127.0.0.1:8839/experiments/jq-current-input/explanation.html");
await page.evaluate(() => document.fonts.ready);
console.log(await page.snapshot({scope:"full_page"}));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-jq-current-input/archify/experiments/jq-current-input/evidence/first-desktop.png"});

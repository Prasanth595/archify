const task = await taskSpace("Archify research 20261026");
console.log({spaceId:task.spaceId});
const page = task.page("p1");
await page.goto("file:///Users/tsk/.codex/worktrees/lab-finder-link-count/archify/experiments/finder-link-count/before.html?theme=dark");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.evaluate(async()=>{await document.fonts.ready;await Archify.viewerChromeLayout.whenStable();});
await page.click("#btn-node-finder",{label:"Inspect native Finder counts"});
console.log(await page.snapshot());
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-finder-link-count/archify/experiments/finder-link-count/evidence/before-finder-dark.png"});

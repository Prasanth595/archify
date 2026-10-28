const task=await taskSpace(3);const page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto("file:///Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/explanation.html");
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/evidence/first-desktop.png"});
console.log(await page.snapshot());

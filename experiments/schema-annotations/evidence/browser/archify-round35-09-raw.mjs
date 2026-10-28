const task=await taskSpace(3);const page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto("file:///Users/tsk/.codex/worktrees/lab-schema-annotations/archify/experiments/schema-annotations/raw-records.html");
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-schema-annotations/archify/experiments/schema-annotations/evidence/raw-desktop.png"});
console.log('RAW',await page.evaluate(()=>({width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,anchors:[...document.querySelectorAll('a')].map(a=>({text:a.textContent,href:a.getAttribute('href')}))})));
console.log(await page.snapshot());

const task=await taskSpace(38);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto('https://live.lean-lang.org/');console.log(await page.snapshot());

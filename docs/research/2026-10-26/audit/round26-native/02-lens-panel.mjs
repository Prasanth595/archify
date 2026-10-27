const task=await taskSpace(34);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('loc=css:button[aria-label="Open semantic lens"]');
console.log(await page.snapshot());

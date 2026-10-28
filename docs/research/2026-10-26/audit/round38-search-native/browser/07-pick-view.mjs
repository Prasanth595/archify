const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('@282');
console.log(await page.snapshot());
await page.screenshot({path:'/tmp/archify-round38-browser/07-views.png'});

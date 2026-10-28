const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('button[data-value="boutique.checkout"]');
console.log(await page.snapshot());
await page.screenshot({path:'/tmp/archify-round38-browser/09-view-choices.png'});

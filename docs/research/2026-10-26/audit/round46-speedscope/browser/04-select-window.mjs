const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.mouse.move(20,60,{label:'select profile time window'});
await page.mouse.down();
await page.mouse.move(40,60,{label:'narrow profile time window'});
await page.mouse.up();
console.log(await page.snapshot());

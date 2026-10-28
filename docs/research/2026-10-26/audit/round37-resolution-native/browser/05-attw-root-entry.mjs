const task = await taskSpace(3); const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('text="."');
console.log(await page.snapshot({scope:'full_page'}));

const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('text="Submit"',{label:'render the sample in local serverless PEV2'});
console.log(await page.snapshot());

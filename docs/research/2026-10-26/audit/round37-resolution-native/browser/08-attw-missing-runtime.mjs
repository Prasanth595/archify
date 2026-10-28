const task=await taskSpace(3); const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.setInputFiles('input[type=file]',['/tmp/archify-round37-native-1/missing-runtime-target.tgz']);
console.log(await page.snapshot({scope:'full_page'}));

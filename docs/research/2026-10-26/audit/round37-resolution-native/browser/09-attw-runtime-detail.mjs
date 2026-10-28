const task=await taskSpace(3); const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.keyboard.press('Home');
await page.screenshot({path:'/tmp/archify-round37-browser/09-missing-runtime.png'});
await page.click('text="node16-esm"');
console.log(await page.snapshot({scope:'full_page'}));

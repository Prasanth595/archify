const task=await taskSpace(3); const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.setInputFiles('input[type=file]',['/tmp/archify-round37-native-1/matched-esm-types.tgz']);
await page.waitForFunction(()=>!document.body.innerText.includes('Used fallback condition'),undefined,{timeout:10000});
await page.keyboard.press('Home');
console.log(await page.snapshot({scope:'full_page'}));
await page.screenshot({path:'/tmp/archify-round37-browser/07-matched-types.png'});

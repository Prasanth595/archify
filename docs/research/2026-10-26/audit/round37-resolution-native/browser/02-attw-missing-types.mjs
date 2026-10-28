const task = await taskSpace(3); const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride', {width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.evaluate(()=>[...document.querySelectorAll('input')].map(x=>({type:x.type,id:x.id}))));
await page.setInputFiles('input[type=file]', ['/tmp/archify-round37-native-1/missing-esm-types.tgz']);
await page.waitForFunction(()=>document.body.innerText.includes('archify-resolution-probe'), undefined, {timeout:30000});
console.log(await page.snapshot({scope:'full_page'}));
await page.screenshot({path:'/tmp/archify-round37-browser/02-missing-types.png'});

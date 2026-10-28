const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.waitForFunction(()=>document.body.innerText.trim().length>0,undefined,{timeout:15000});
console.log(await page.snapshot({scope:'full_page'}));
console.log(await page.evaluate(()=>({url:location.href,title:document.title,scripts:[...document.scripts].map(s=>s.src).filter(Boolean)})));
await page.screenshot({path:'/tmp/archify-round38-browser/02-initial.png'});

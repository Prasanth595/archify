const task=await taskSpace(3),page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.mouse.move(1100,480);
await page.mouse.wheel(0,650,{label:'Inspect alias captured by value'});
await page.mouse.move(350,480);
await page.mouse.wheel(0,510,{label:'Show original alias capture'});
console.log(await page.snapshot());
await page.screenshot({path:'/tmp/archify-round41-native-alias.png'});

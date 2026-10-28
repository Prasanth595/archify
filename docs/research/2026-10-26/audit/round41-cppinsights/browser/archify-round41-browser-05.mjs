const task=await taskSpace(3),page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.evaluate(()=>[...document.querySelectorAll('.CodeMirror')].map(x=>({parent:x.parentElement.id,classes:x.className,rect:{x:x.getBoundingClientRect().x,y:x.getBoundingClientRect().y},sample:x.querySelector('.CodeMirror-line')?.textContent}))));
await page.screenshot({path:"/tmp/archify-round41-native-transform-top.png"});
await page.click('button[title="More..."]');
console.log(await page.snapshot());

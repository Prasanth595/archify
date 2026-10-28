const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>[...document.querySelectorAll('[role="treeitem"]')].map(x=>({tag:x.tagName,html:x.outerHTML.slice(0,3500)}))));

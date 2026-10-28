const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('.plan-node.selected :text-is("Misc")',{label:'inspect native raw node fields'});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>document.querySelector('.plan-node.selected')?.innerText));

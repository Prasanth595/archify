const task=await taskSpace(34);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('loc=css:button[aria-label="Add example"]');
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({activeTag:document.activeElement?.tagName,editors:[...document.querySelectorAll('.CodeMirror')].map(e=>({class:e.className,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))})));

const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.evaluate(()=>{const a=[];function walk(root){for(const e of root.querySelectorAll('*')){if(e.matches('input[type="checkbox"],[role="checkbox"]'))a.push({html:e.outerHTML,checked:e.checked});if(e.shadowRoot)walk(e.shadowRoot);}}walk(document);return a;}));

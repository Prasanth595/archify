const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('a[href="/native/pev2.html#grid"]',{label:'inspect native grid'});
console.log(await page.snapshot());
console.log('TARGET DOM',await page.evaluate(()=>[...document.querySelectorAll('*')].filter(x=>x.children.length===0&&x.textContent.includes('sov_sv')).map(x=>({tag:x.tagName,html:x.parentElement.outerHTML.slice(0,2000)})).slice(0,15)));

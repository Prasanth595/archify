const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({url:location.href,buttons:[...document.querySelectorAll('button')].filter(x=>x.innerText.includes('Online Boutique System')).map(x=>({text:x.innerText,attrs:Object.fromEntries([...x.attributes].map(a=>[a.name,a.value])),rect:x.getBoundingClientRect().toJSON(),opacity:getComputedStyle(x).opacity}))})));
await page.screenshot({path:'/tmp/archify-round38-browser/11-after-timeout.png'});

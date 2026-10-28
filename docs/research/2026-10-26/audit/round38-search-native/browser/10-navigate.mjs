const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('button:has-text("Online Boutique System")');
await page.waitForFunction(()=>location.pathname.endsWith('/boutique')&&document.querySelector('[role="group"][aria-label^="Checkout Service."]'),undefined,{timeout:15000});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({url:location.href,nodes:[...document.querySelectorAll('[role="group"]')].map(n=>({label:n.getAttribute('aria-label'),attrs:[...n.attributes].filter(a=>a.name.startsWith('data-')||a.name==='class').map(a=>[a.name,a.value]),rect:n.getBoundingClientRect().toJSON(),opacity:getComputedStyle(n).opacity})),active:document.activeElement?.outerHTML.slice(0,400)})));
await page.screenshot({path:'/tmp/archify-round38-browser/10-arrival.png'});

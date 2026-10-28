import fs from 'node:fs';
const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.waitForFunction(()=>location.pathname.replace(/\/$/,'').endsWith('/boutique'),undefined,{timeout:10000});
console.log(await page.snapshot());
const observation=await page.evaluate(()=>({url:location.href,title:document.title,viewport:{width:innerWidth,height:innerHeight},groups:[...document.querySelectorAll('[role="group"]')].map(n=>({label:n.getAttribute('aria-label'),attrs:Object.fromEntries([...n.attributes].map(a=>[a.name,a.value])),rect:n.getBoundingClientRect().toJSON(),opacity:getComputedStyle(n).opacity})),active:document.activeElement?.outerHTML.slice(0,400)}));
fs.writeFileSync('/tmp/archify-round38-browser/13-arrival.json',JSON.stringify(observation,null,2));
await page.mouse.move(1250,800);
await page.screenshot({path:'/tmp/archify-round38-browser/13-arrival.png'});

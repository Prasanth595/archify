import fs from 'node:fs';
const task=await taskSpace(3);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log('BEFORE',Date.now());
await page.click('[aria-roledescription="node"][data-id="boutique.checkout"]');
console.log('AFTER',Date.now());
await page.screenshot({path:'/tmp/archify-round38-browser/15-node-focus.png'});
fs.writeFileSync('/tmp/archify-round38-browser/15-focused-dom.json',JSON.stringify(await page.evaluate(()=>({url:location.href,root:[...document.querySelectorAll('[data-likec4-focused],[data-likec4-dimmed]')].map(x=>({tag:x.tagName,attrs:Object.fromEntries([...x.attributes].map(a=>[a.name,a.value]))})),nodes:[...document.querySelectorAll('[aria-roledescription="node"]')].map(n=>({id:n.getAttribute('data-id'),html:n.outerHTML.slice(0,1600)}))})),null,2));
console.log(await page.snapshot());

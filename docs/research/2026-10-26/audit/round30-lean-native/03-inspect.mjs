const fs=await import('node:fs/promises');const task=await taskSpace(38);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const state=await page.evaluate(()=>({url:location.href,text:document.body.innerText,inputs:[...document.querySelectorAll('textarea,input,[contenteditable]')].map(e=>({tag:e.tagName,role:e.getAttribute('role'),label:e.getAttribute('aria-label'),class:e.className,value:e.value})),frames:[...document.querySelectorAll('iframe')].map(e=>({title:e.title,src:e.src}))}));
await fs.writeFile('/tmp/archify-round30-lean/initial.json',JSON.stringify(state,null,2)+'\n');console.log(state);console.log(await page.snapshot());

const fs=await import('node:fs/promises');const task=await taskSpace(34);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const state=await page.evaluate(()=>({editors:[...document.querySelectorAll('.CodeMirror')].map(e=>({value:e.CodeMirror.getValue(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})),checks:[...document.querySelectorAll('input[type=checkbox]')].map(e=>({name:e.name,checked:e.checked}))}));
await fs.writeFile('/tmp/archify-round25-ohm/after-focus-failure.json',JSON.stringify(state,null,2));console.log(state);
console.log(await page.snapshot());

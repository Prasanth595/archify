const fs = await import('node:fs/promises');
const task=await taskSpace(34); const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const state=await page.evaluate(()=>({version:window.ohm?.version,editors:[...document.querySelectorAll('.CodeMirror')].map(e=>({id:e.id,parent:e.parentElement.id,class:e.className,value:e.CodeMirror?.getValue(),html:e.outerHTML.slice(0,500)}))}));
await fs.writeFile('/tmp/archify-round25-ohm/initial-editors.json',JSON.stringify(state,null,2)); console.log(state);
await page.click('text="⋮"');
console.log(await page.snapshot());

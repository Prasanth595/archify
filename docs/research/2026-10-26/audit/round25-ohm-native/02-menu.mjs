const fs = await import('node:fs/promises');
const task = await taskSpace(34); const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('loc=css:select[aria-label="Selected grammar"]');
const state = await page.evaluate(() => ({selects:[...document.querySelectorAll('select')].map(e=>({label:e.getAttribute('aria-label'),options:[...e.options].map(o=>({text:o.text,value:o.value,selected:o.selected}))})),editables:[...document.querySelectorAll('textarea,[contenteditable=true]')].map(e=>({tag:e.tagName,id:e.id,class:e.className,label:e.getAttribute('aria-label'),role:e.getAttribute('role')})),scripts:[...document.scripts].map(e=>e.src).filter(Boolean),ua:navigator.userAgent}));
await fs.writeFile('/tmp/archify-round25-ohm/initial-dom.json',JSON.stringify(state,null,2));
console.log(state);
await page.keyboard.press('Escape');
console.log(await page.snapshot());

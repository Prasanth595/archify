const fs=await import('node:fs/promises');const task=await taskSpace(38);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.selectOption('loc=css:select[name="leanVersion"]','mathlib-stable');
await page.focus('loc=css:textarea[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]');
await page.keyboard.press('Meta+A');await page.keyboard.insertText(await fs.readFile('/tmp/archify-round30-lean/conjunction.lean','utf8'));
console.log(await page.snapshot());

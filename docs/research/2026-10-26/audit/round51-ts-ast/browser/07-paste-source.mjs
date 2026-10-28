const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.mouse.click(150,86,{label:'focus visible source line'});
await page.keyboard.press('ControlOrMeta+A');
await page.keyboard.paste(await fs.readFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/fixture/LineAndColumnComputer.ts",'utf8'));
await page.waitForFunction(()=>document.querySelector('#treeViewer')?.innerText.includes('ClassDeclaration'),undefined,{timeout:10000});
console.log(await page.snapshot());
console.log('SOURCE DOM',await page.evaluate(()=>[...document.querySelectorAll('.propertiesViewer [data-name="text"],.propertiesViewer [data-name="getFullText()"]')].map(x=>({name:x.getAttribute('data-name'),text:x.querySelector('.value')?.textContent}))));

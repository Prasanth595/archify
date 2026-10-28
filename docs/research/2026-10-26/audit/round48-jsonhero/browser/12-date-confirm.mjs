const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto('https://jsonhero.io/j/PjHo1o5MVeH4?path=2.created_at');
await page.waitForFunction(()=>document.querySelector('.info-panel section time'),undefined,{timeout:15000});
console.log('CALENDAR_DOM',await page.evaluate(()=>({timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,panel:document.querySelector('.info-panel')?.innerText,times:[...document.querySelectorAll('.info-panel time')].map(x=>({text:x.textContent,dateTime:x.dateTime,className:x.className}))})));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round48-jsonhero/images/12-date-confirm.png"});
console.log(await page.snapshot());
await page.goto('about:blank');
console.log('CLEANUP',await page.url());

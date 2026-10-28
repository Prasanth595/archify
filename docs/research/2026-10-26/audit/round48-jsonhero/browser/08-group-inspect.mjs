const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log('ENVIRONMENT',await page.evaluate(()=>({url:location.href,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,language:navigator.language})));
await page.goto('https://jsonhero.io/j/PjHo1o5MVeH4?path=2.private');
await page.waitForFunction(()=>document.querySelector('.info-panel')?.textContent.includes('Related values'),undefined,{timeout:15000});
console.log('GROUP_MARKUP',await page.evaluate(()=>document.querySelector('.info-panel')?.innerHTML));
console.log(await page.snapshot());

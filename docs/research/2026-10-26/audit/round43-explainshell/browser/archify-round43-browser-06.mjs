const task=await taskSpace(3),page=task.page('p1');
console.log('UNKNOWN_READY',JSON.stringify(await page.evaluate(()=>({url:location.href,spans:[...document.querySelectorAll('#command span[helpref],#command span.unknown')].map(x=>({text:x.textContent,helpref:x.getAttribute('helpref'),class:x.className,title:x.title,href:x.querySelector('a')?.getAttribute('href')}))}))));
await page.fill('input[name="cmd"]','archify_missing_command notes.txt | wc -l');
await page.press('input[name="cmd"]','Enter');
await page.waitForFunction(()=>[...document.querySelectorAll('#command span.unknown')].some(x=>x.title.length>0),undefined,{timeout:10000});
console.log(await page.snapshot());
console.log('MISSING',JSON.stringify(await page.evaluate(()=>({url:location.href,spans:[...document.querySelectorAll('#command span[helpref],#command span.unknown')].map(x=>({text:x.textContent,helpref:x.getAttribute('helpref'),class:x.className,title:x.title,href:x.querySelector('a')?.getAttribute('href')}))}))));
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.screenshot({path:'/tmp/archify-round43-missing-command.png'});

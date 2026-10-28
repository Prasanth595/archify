const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('#command .dropdown:has(.command1) b.caret');
console.log(await page.snapshot());
await page.screenshot({path:'/tmp/archify-round43-manpage-menu.png'});
await page.click('#command a[href*="gnuwc.1"]');
console.log(await page.snapshot());
console.log('ALTERNATIVE',JSON.stringify(await page.evaluate(()=>({url:location.href,spans:[...document.querySelectorAll('#command span[helpref],#command span.unknown')].map(x=>({text:x.textContent,helpref:x.getAttribute('helpref'),href:x.querySelector('a')?.getAttribute('href')}))}))));
await page.screenshot({path:'/tmp/archify-round43-gnu-manpage.png'});

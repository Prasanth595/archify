const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.fill('input[name="cmd"]',"grep --archify-unknown -e '-foo' notes.txt | wc -l");
await page.press('input[name="cmd"]','Enter');
console.log(await page.snapshot());
console.log('UNKNOWN_CASE',JSON.stringify(await page.evaluate(()=>({url:location.href,spans:[...document.querySelectorAll('#command span[helpref],#command span.unknown')].map(x=>({text:x.textContent,helpref:x.getAttribute('helpref'),class:x.className,title:x.title,href:x.querySelector('a')?.getAttribute('href')}))}))));
await page.screenshot({path:'/tmp/archify-round43-unknown-option.png'});

const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.screenshot({path:'/tmp/archify-round43-known.png'});
await page.hover('#command span[helpref="help-2"]');
console.log('HOVER',JSON.stringify(await page.evaluate(()=>({spans:[...document.querySelectorAll('#command span[helpref],#command span.unknown')].map(x=>({text:x.textContent,helpref:x.getAttribute('helpref'),class:x.className,title:x.title,opacity:getComputedStyle(x).opacity})),help:[...document.querySelectorAll('#help .help-box')].map(x=>({id:x.id,opacity:getComputedStyle(x).opacity,display:getComputedStyle(x).display}))}))));
await page.screenshot({path:'/tmp/archify-round43-quoted-hover.png'});
await page.hover('#command span.unknown');
console.log('UNKNOWN',JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('#command span.unknown')].map(x=>({text:x.textContent,title:x.title,class:x.className})))));
await page.screenshot({path:'/tmp/archify-round43-operand-unknown.png'});

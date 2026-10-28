const task=await taskSpace(3),page=task.page('p1');
await page.fill('input[name="cmd"]',"grep -e '-foo' notes.txt | wc -l");
await page.press('input[name="cmd"]','Enter');
await page.waitForFunction(()=>document.querySelector('#command .unknown')?.title.length>0,undefined,{timeout:10000});
console.log('REPLAY',JSON.stringify(await page.evaluate(()=>({url:location.href,spans:[...document.querySelectorAll('#command span[helpref],#command span.unknown')].map(x=>({text:x.textContent,helpref:x.getAttribute('helpref'),class:x.className,title:x.title,href:x.querySelector('a')?.getAttribute('href')}))}))));

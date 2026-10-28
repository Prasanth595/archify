const task=await taskSpace(3),page=task.page('p1');
await page.fill('input[name="cmd"]',"grep -e '-foo' notes.txt | wc -l");
await page.press('input[name="cmd"]','Enter');
console.log(await page.snapshot());
console.log('DOM',JSON.stringify(await page.evaluate(()=>({command:document.querySelector('#command')?.outerHTML,help:[...document.querySelectorAll('#help .help-box')].map(x=>({id:x.id,text:x.textContent.slice(0,250)})),inputs:[...document.querySelectorAll('input,select')].map(x=>({tag:x.tagName,name:x.name,id:x.id,value:x.value}))}))));

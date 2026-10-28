const task=await taskSpace(3),page=task.page('p1');
console.log(await page.evaluate(()=>[...document.querySelectorAll('button,input[type="submit"]')].map(x=>({tag:x.tagName,text:x.textContent,value:x.value,type:x.type,html:x.outerHTML.slice(0,800)}))));

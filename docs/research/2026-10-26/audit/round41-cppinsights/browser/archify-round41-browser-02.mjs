const task=await taskSpace(3),page=task.page("p1");
console.log(await page.evaluate(()=>({buttons:[...document.querySelectorAll('button')].map(x=>({id:x.id,title:x.title,text:x.textContent,aria:x.getAttribute('aria-label')})),inputs:[...document.querySelectorAll('textarea,input')].map(x=>({tag:x.tagName,id:x.id,cls:x.className,role:x.getAttribute('role')}))})));

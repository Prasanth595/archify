const task=await taskSpace(3),page=task.page('p1');
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({textarea:[...document.querySelectorAll('textarea')].map(x=>({classes:x.className,rect:x.getBoundingClientRect().toJSON()})),editor:document.querySelector('#editor')?.getBoundingClientRect().toJSON()})));

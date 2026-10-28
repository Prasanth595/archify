const task=await taskSpace(3),page=task.page('p1');
console.log(await page.evaluate(()=>({editors:[...document.querySelectorAll('textarea')].map(x=>({id:x.id,cls:x.className})),selects:[...document.querySelectorAll('select')].map(x=>({parent:x.parentElement.id,values:[...x.options].map(o=>o.value)})),review:document.querySelector('#review')?.id})));

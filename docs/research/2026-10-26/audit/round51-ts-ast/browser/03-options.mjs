const task=await taskSpace(3),page=task.page('p1');
await page.click('text="Options"',{label:'inspect compiler and tree settings'});
console.log(await page.snapshot());
console.log(await page.evaluate(()=>({selects:[...document.querySelectorAll('select')].map(x=>({html:x.outerHTML,value:x.value})),editors:[...document.querySelectorAll('textarea')].map(x=>({label:x.getAttribute('aria-label'),cls:x.className}))})));

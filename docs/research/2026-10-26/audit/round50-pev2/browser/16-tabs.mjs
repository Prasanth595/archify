const task=await taskSpace(3),page=task.page('p1');
console.log(await page.evaluate(()=>[...document.querySelectorAll('.plan-node.selected a,.plan-node.selected button')].map(x=>({text:x.innerText,html:x.outerHTML}))));
console.log(await page.snapshot());

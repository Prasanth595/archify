const task=await taskSpace(3),page=task.page("p1");
console.log(await page.snapshot());
console.log('SELECTED_OUTPUT',JSON.stringify(await page.evaluate(()=>({selection:window.getSelection()?.toString(),inputs:[...document.querySelectorAll('#stdout textarea')].map(x=>({value:x.value,start:x.selectionStart,end:x.selectionEnd}))}))));

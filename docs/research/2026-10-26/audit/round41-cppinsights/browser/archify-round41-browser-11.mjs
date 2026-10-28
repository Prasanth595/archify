const task=await taskSpace(3),page=task.page("p1");
console.log(await page.snapshot());
await page.click('#stdout .CodeMirror');
await page.keyboard.press('ControlOrMeta+A');
console.log('SELECTED_OUTPUT',JSON.stringify(await page.evaluate(()=>({selection:window.getSelection()?.toString(),inputs:[...document.querySelectorAll('#stdout textarea')].map(x=>({value:x.value,start:x.selectionStart,end:x.selectionEnd}))}))));

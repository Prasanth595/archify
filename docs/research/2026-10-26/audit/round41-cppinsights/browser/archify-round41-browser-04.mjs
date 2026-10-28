const task=await taskSpace(3),page=task.page("p1");
console.log(await page.snapshot({scope:"full_page"}));
console.log("EDITORS",JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('textarea')].map(x=>({id:x.id,length:x.value.length,display:getComputedStyle(x).display,preview:x.value.slice(0,120)})))));
console.log("CODE_DOM",JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('.CodeMirror')].map(x=>({lines:x.querySelectorAll('.CodeMirror-line').length,text:x.innerText.slice(0,200)})))));

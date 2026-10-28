const task=await taskSpace(3),page=task.page('p1');
console.log(await page.evaluate(()=>[...document.querySelectorAll('tr')].filter(x=>[...x.querySelectorAll('a')].some(a=>a.getAttribute('href')==='#plan/node/12')).map(x=>({text:x.innerText,html:x.outerHTML.slice(0,10000)}))));

const task=await taskSpace(3),page=task.page('p1');
const controls=await page.evaluate(()=>{const a=[];function walk(root){for(const e of root.querySelectorAll('*')){if(e.tagName==='BUTTON'){const r=e.getBoundingClientRect();a.push({text:e.innerText,title:e.title,aria:e.getAttribute('aria-label'),html:e.outerHTML.slice(0,800),rect:[r.x,r.y,r.width,r.height]});}if(e.shadowRoot)walk(e.shadowRoot);}}walk(document);return a;});
console.log(JSON.stringify(controls,null,2));
console.log(await page.snapshot());

const fs=await import('node:fs/promises');const here=new URL('.',import.meta.url);
const task=await taskSpace(3);const page=task.page('p1');
for(const run of [2,3]){
 await page.goto('http://127.0.0.1:8879/index.html');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Complete'),undefined,{timeout:10000});
 const data=await page.evaluate(()=>({results:document.querySelector('#results').textContent,displayed:[...document.querySelectorAll('main pre')].map(p=>({id:p.id,text:p.textContent})),resources:performance.getEntriesByType('resource').map(r=>r.name),userAgent:navigator.userAgent,width:innerWidth,height:innerHeight}));
 await fs.writeFile(new URL('run'+run+'.json',here),JSON.stringify(data,null,2)+'\n');
 if(run===2) await page.screenshot({path:new URL('02-native-reports-plain.png',here).pathname});
 console.log('Saved run '+run);
}
console.log((await page.snapshot()).slice(0,4800));

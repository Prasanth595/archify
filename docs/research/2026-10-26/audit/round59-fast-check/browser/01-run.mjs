const fs=await import('node:fs/promises');
const here=new URL('.',import.meta.url);
const task=await taskSpace(3);const page=task.page('p1');
await page.goto('http://127.0.0.1:8879/index.html');
await page.waitForFunction(()=>/^(Complete|Error)/.test(document.querySelector('#status').textContent),undefined,{timeout:15000});
const state=await page.evaluate(()=>({status:document.querySelector('#status').textContent,results:document.querySelector('#results').textContent,userAgent:navigator.userAgent,width:innerWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));
await fs.writeFile(new URL('run1.json',here),JSON.stringify(state,null,2)+'\n');
await page.screenshot({path:new URL('01-native-reports.png',here).pathname});
console.log(state.status);
if(state.results){const data=JSON.parse(state.results);console.log(JSON.stringify({library:data.library,cases:data.cases.map(c=>({name:c.name,report:c.report,runConfiguration:c.details.runConfiguration,executionSummary:c.details.executionSummary}))}));}
console.log((await page.snapshot()).slice(0,6000));

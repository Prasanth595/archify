const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('.plan-node.selected a.nav-link >> nth=4',{label:'inspect original and calculated fields'});
await page.waitForFunction(()=>document.querySelector('.plan-node.selected')?.innerText.includes('Actual Rows'),undefined,{timeout:10000});
console.log(await page.evaluate(()=>document.querySelector('.plan-node.selected')?.innerText));
const state=await page.evaluate(()=>({url:location.href,text:document.querySelector('.plan-node.selected')?.innerText,rows:[...document.querySelectorAll('.plan-node.selected tr')].map(x=>[...x.querySelectorAll('td')].map(y=>y.innerText)),rect:document.querySelector('.plan-node.selected')?.getBoundingClientRect().toJSON()}));
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/browser/misc-state.json",JSON.stringify(state,null,2)+'\n');
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/screenshots/05-misc-original-fields.png"});

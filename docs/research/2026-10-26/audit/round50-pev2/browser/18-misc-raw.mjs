const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const state=await page.evaluate(()=>({url:location.href,text:document.querySelector('.plan-node.selected')?.innerText,rows:[...document.querySelectorAll('.plan-node.selected tr')].map(x=>[...x.querySelectorAll('td')].map(y=>y.innerText))}));
console.log('MISC',state);
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/browser/misc-state.json",JSON.stringify(state,null,2)+'\n');
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/screenshots/05-misc-fields.png"});
await page.click('a[href="#raw"]',{label:'inspect native original JSON'});
console.log(await page.snapshot());
console.log('RAW DOM',await page.evaluate(()=>[...document.querySelectorAll('pre')].map(x=>({cls:x.className,visible:getComputedStyle(x).display!=='none'&&x.getBoundingClientRect().width>0,bytes:x.textContent.length,start:x.textContent.slice(0,180)}))));

const fs=await import('node:fs/promises');
const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
async function record(name){
 const dom=await page.evaluate(()=>({url:location.href,viewport:[innerWidth,innerHeight],text:document.body.innerText,scan:[...document.getElementById('react-scan-root').shadowRoot.children].filter(x=>x instanceof HTMLElement&&!['STYLE','SCRIPT'].includes(x.tagName)).map(x=>x.innerText).join('\n')}));
 await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/browser/"+name+'.json',JSON.stringify(dom,null,2)+'\n');
 await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/images/"+name+'.png'});
}
await page.click('button:has-text("CopyIcon")',{label:'select adjacent child component'});
await page.waitForTimeout(1500);
await record('10-copyicon');
await page.click('button:has-text("InstallGuide")',{label:'return to install guide'});
await page.waitForTimeout(1500);
await record('10-reselected');
console.log(await page.snapshot());

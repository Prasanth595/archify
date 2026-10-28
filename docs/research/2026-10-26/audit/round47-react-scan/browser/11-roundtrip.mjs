const fs=await import('node:fs/promises');
const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
async function record(name){
 const dom=await page.evaluate(()=>({url:location.href,viewport:[innerWidth,innerHeight],text:document.body.innerText,scan:[...document.getElementById('react-scan-root').shadowRoot.children].filter(x=>x instanceof HTMLElement&&!['STYLE','SCRIPT'].includes(x.tagName)).map(x=>x.innerText).join('\n')}));
 await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/browser/"+name+'.json',JSON.stringify(dom,null,2)+'\n');
 await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/images/"+name+'.png'});
}
await page.click('text="Script Tag"',{label:'return guide to script'});
await page.waitForTimeout(1500);
await record('11-script');
await page.click('text="Vite"',{label:'repeat guide state change'});
await page.waitForTimeout(1500);
await record('11-vite');
await page.click('button:has-text("hook") >> nth=0',{label:'inspect latest state pair'});
await page.click('button:has-text("hook") >> nth=1',{label:'inspect latest height pair'});
await page.waitForTimeout(1500);
await record('11-expanded');
console.log(await page.snapshot());

const fs=await import('node:fs/promises');
const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.mouse.click(460,626,{label:'select highlighted InstallGuide'});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/images/07-component.png"});
const dom=await page.evaluate(()=>{const root=document.getElementById('react-scan-root');return{url:location.href,viewport:[innerWidth,innerHeight],text:document.body.innerText,scan:root?.shadowRoot?.textContent};});
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round47-react-scan/browser/07-component.json",JSON.stringify(dom,null,2)+'\n');
console.log(await page.snapshot());

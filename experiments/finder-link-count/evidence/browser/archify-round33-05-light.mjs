const task=await taskSpace(2);const page=task.page("p1");
const root="/Users/tsk/.codex/worktrees/lab-finder-link-count/archify/experiments/finder-link-count";
for(const stage of ["before","after"]){
 await page.goto("file://"+root+"/"+stage+".html?theme=light");
 await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await page.evaluate(async()=>{await document.fonts.ready;await Archify.viewerChromeLayout.whenStable();});
 await page.click("#btn-node-finder",{label:"Compare light theme counts"});
 console.log(stage,await page.evaluate(()=>[...document.querySelectorAll('.node-finder-result')].map(x=>({id:x.dataset.nodeId,badge:x.querySelector('em').textContent,aria:x.getAttribute('aria-label')}))));
 await page.screenshot({path:root+"/evidence/"+stage+"-finder-light.png"});
}
await page.cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});
await page.fill('#node-finder-input','API');
await page.evaluate(()=>Archify.viewerChromeLayout.whenStable());
console.log(await page.snapshot());
await page.screenshot({path:root+"/evidence/after-finder-compact.png"});

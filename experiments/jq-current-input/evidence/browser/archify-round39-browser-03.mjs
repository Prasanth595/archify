const task=await taskSpace(3),page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('loc=role:button[name="下一步 →"]');
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-jq-current-input/archify/experiments/jq-current-input/evidence/first-step-two.png"});
console.log(await page.evaluate(()=>Array.from(document.querySelectorAll('[class]')).filter(x=>/active|focused|step-current/.test(x.className.baseVal??x.className)).slice(-20).map(x=>({tag:x.tagName,cls:x.getAttribute('class'),text:x.textContent.slice(0,160)}))));

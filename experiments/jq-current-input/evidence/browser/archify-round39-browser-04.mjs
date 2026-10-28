const task=await taskSpace(3),page=task.page("p1");
const dir="/Users/tsk/.codex/worktrees/lab-jq-current-input/archify/experiments/jq-current-input/evidence";
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.goto("http://127.0.0.1:8839/experiments/jq-current-input/explanation.html");
await page.evaluate(()=>document.fonts.ready);
await page.screenshot({path:dir+"/final-light.png"});
await page.click('loc=role:button[name="▶ 逐步看"]');
for(let i=1;i<=6;i++){
 if(i>1)await page.click('loc=role:button[name="下一步 →"]');
 console.log("STEP",i,await page.evaluate(()=>({progress:document.body.innerText.match(/[1-6] \/ 6/g),nodes:[...document.querySelectorAll('svg g')].filter(x=>x.getAttributeNames().some(n=>n.startsWith('data-'))).map(x=>({text:x.textContent.slice(0,90),attributes:Object.fromEntries(x.getAttributeNames().map(n=>[n,x.getAttribute(n)]))}))})));
 if([2,4,6].includes(i))await page.screenshot({path:dir+"/step-"+i+".png"});
}
await page.click('loc=role:button[name="结束"]');
await page.click('loc=role:button[name="打开交互图"]');
console.log(await page.snapshot());
await page.screenshot({path:dir+"/native-modal.png"});

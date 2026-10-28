const task=await taskSpace(3),page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.selectOption('select',{value:"13"});
await page.waitForFunction(()=>document.querySelector('#results-meta').textContent.startsWith('10 row'),undefined,{timeout:10000});
await page.click('#op-0 td:nth-child(5) a[data-addr="24"]');
await page.waitForFunction(()=>{const r=document.querySelector('#op-24').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;},undefined,{timeout:10000});
console.log("JUMP",JSON.stringify(await page.evaluate(()=>{const x=document.querySelector('#op-24'),r=x.getBoundingClientRect();return {text:x.innerText,top:r.top,bottom:r.bottom,height:innerHeight,classes:x.className};})));
await page.screenshot({path:"/tmp/archify-round40-jump-target.png"});
console.log(await page.snapshot());

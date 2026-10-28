const fs=await import('node:fs/promises');
const task=await taskSpace(38);const page=task.page('p1');
const root='file:///Users/tsk/.codex/worktrees/lab-cue-defaults/archify/experiments/cue-defaults/final/artifacts/';
const record={desktop:{},narrow:{}};
for(const name of ['baseline','comparison']){
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await page.goto(root+name+'.html');await page.click('text="Light"');
 await page.evaluate(()=>window.scrollTo(0,0));
 record.desktop[name]=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight},clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,code:[...document.querySelectorAll('pre code')].map(x=>x.textContent),text:document.body.innerText}));
 await page.screenshot({path:`/tmp/archify-round29-cue/final-${name}-desktop.png`});
 await page.screenshot({path:`/tmp/archify-round29-cue/final-${name}-full.png`,fullPage:true});
}
await page.click('text="Dark"');
record.dark=await page.evaluate(()=>({rootAttributes:[...document.documentElement.attributes].map(x=>[x.name,x.value]),background:getComputedStyle(document.body).backgroundColor,buttons:[...document.querySelectorAll('button')].filter(x=>['System','Light','Dark'].includes(x.textContent.trim())).map(x=>({text:x.textContent.trim(),pressed:x.getAttribute('aria-pressed'),active:x.className}))}));
await page.screenshot({path:'/tmp/archify-round29-cue/final-comparison-dark.png'});
await page.click('text="Light"');await page.focus('loc=css:.answer-panel a[href="#source-spec"]');await page.keyboard.press('Enter');await page.waitForFunction(()=>location.hash==='#source-spec');await page.keyboard.press('Tab');
record.source=await page.evaluate(()=>({hash:location.hash,active:{tag:document.activeElement.tagName,text:document.activeElement.textContent?.slice(0,120),href:document.activeElement.getAttribute('href')},sourceText:document.getElementById('source-spec')?.innerText,scrollY}));
await page.screenshot({path:'/tmp/archify-round29-cue/final-source-keyboard.png'});
for(const name of ['baseline','comparison']){
 await page.goto(root+name+'.html');
 await page.cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});
 await page.evaluate(()=>window.scrollTo(0,0));
 record.narrow[name]=await page.evaluate(()=>({requestedWidth:390,viewport:{width:innerWidth,height:innerHeight},clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('button')].filter(e=>e.getBoundingClientRect().top<180).map(e=>({text:e.textContent.trim(),left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}));
 await page.screenshot({path:`/tmp/archify-round29-cue/final-${name}-narrow.png`});
}
await page.evaluate(()=>document.getElementById('controls').scrollIntoView());
record.narrowTable=await page.evaluate(()=>{const e=document.getElementById('controls'),t=e.querySelector('table');return {panelWidth:e.getBoundingClientRect().width,tableWidth:t.getBoundingClientRect().width,containerWidth:t.parentElement.clientWidth,containerScrollWidth:t.parentElement.scrollWidth,overflow:getComputedStyle(t.parentElement).overflowX};});
await page.screenshot({path:'/tmp/archify-round29-cue/final-comparison-narrow-table.png'});
await fs.writeFile('/tmp/archify-round29-cue/final-browser.json',JSON.stringify(record,null,2)+'\n');
console.log({desktop:Object.fromEntries(Object.entries(record.desktop).map(([k,v])=>[k,{viewport:v.viewport,width:v.scrollWidth,height:v.scrollHeight,codeBlocks:v.code.length}])),dark:record.dark,source:record.source,narrow:record.narrow,narrowTable:record.narrowTable});
console.log(await page.snapshot());

const fs=await import('node:fs/promises');const task=await taskSpace(38);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const expected=await fs.readFile('/tmp/archify-round30-lean/conjunction.lean','utf8');
async function capture(label,pos){
 await page.waitForFunction((pos)=>{const d=document.querySelector('iframe').contentDocument;return d.body.innerText.includes(pos)&&[...d.querySelectorAll('.codicon-loading')].every(e=>Number(d.defaultView.getComputedStyle(e).opacity)===0);},pos,{timeout:15000});
 const state=await page.evaluate(()=>{const d=document.querySelector('iframe').contentDocument;return {url:location.href,selectedVersion:document.querySelector('select[name="leanVersion"]').selectedOptions[0].text,sourceLines:[...document.querySelectorAll('.view-line')].map(e=>e.textContent),infoview:d.body.innerText,loadingOpacity:[...d.querySelectorAll('.codicon-loading')].map(e=>d.defaultView.getComputedStyle(e).opacity),controlTitles:[...d.querySelectorAll('a[title]')].map(e=>e.title),viewport:{width:innerWidth,height:innerHeight}};});
 if(state.sourceLines.map(x=>x.replaceAll('\u00a0',' ')).join('\n')!==expected)throw Error('Input mismatch');
 await fs.writeFile(`/tmp/archify-round30-lean/${label}.json`,JSON.stringify(state,null,2)+'\n');await page.screenshot({path:`/tmp/archify-round30-lean/${label}.png`});console.log({label,infoview:state.infoview,loadingOpacity:state.loadingOpacity,controlTitles:state.controlTitles});
}
await capture('constructor-settled','mathlib-stable.lean:4:13');
await page.click('loc=css:a[title="Pin state to top"]');
await page.focus('loc=css:textarea[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]');await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('End');
await capture('pinned-first-branch','mathlib-stable.lean:5:17');
await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');await page.keyboard.press('End');
await capture('pinned-last-branch','mathlib-stable.lean:6:16');
console.log(await page.snapshot());

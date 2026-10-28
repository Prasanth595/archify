const fs=await import('node:fs/promises');const task=await taskSpace(38);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.focus('loc=css:textarea[aria-label="Editor content;Press Alt+F1 for Accessibility Options."]');
const expected=await fs.readFile('/tmp/archify-round30-lean/conjunction.lean','utf8');
for(const [line,col,label] of [[6,16,'last-branch'],[5,17,'first-branch'],[4,13,'constructor']]){
 if(line!==6)await page.keyboard.press('Home');
 await page.keyboard.press('ArrowUp');await page.keyboard.press('End');
 await page.waitForFunction((pos)=>{const t=document.querySelector('iframe')?.contentDocument?.body.innerText||'';return t.includes(pos)&&/Tactic state|No goals/.test(t)&&!t.includes('Loading');},`mathlib-stable.lean:${line}:${col}`);
 const state=await page.evaluate(()=>({url:location.href,selectedVersion:document.querySelector('select[name="leanVersion"]').selectedOptions[0].text,sourceLines:[...document.querySelectorAll('.view-line')].map(x=>x.textContent),infoview:document.querySelector('iframe').contentDocument.body.innerText,viewport:{width:innerWidth,height:innerHeight},userAgent:navigator.userAgent}));
 const normalized=state.sourceLines.map(x=>x.replaceAll('\u00a0',' ')).join('\n');if(normalized!==expected)throw new Error('Visible input differs from complete fixture after NBSP normalization');
 await fs.writeFile(`/tmp/archify-round30-lean/${label}.json`,JSON.stringify(state,null,2)+'\n');await page.screenshot({path:`/tmp/archify-round30-lean/${label}.png`});console.log({label,infoview:state.infoview,inputMatches:true});
}
console.log(await page.snapshot());

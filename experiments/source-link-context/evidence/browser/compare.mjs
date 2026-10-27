const fs=await import('node:fs/promises');const task=await taskSpace(32);const page=task.page('p1');
const root='/Users/tsk/.codex/worktrees/lab-source-link-context/archify/experiments/source-link-context';
const cases=[['base-en',1440,900,'light'],['candidate-en',1440,900,'light'],['base-zh-CN',390,844,'dark'],['candidate-zh-CN',390,844,'dark']];
for(const [name,width,height,theme] of cases){
 await page.goto('file://'+root+'/artifacts/'+name+'.html');
 await page.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 await page.waitForFunction(()=>!!window.Archify?.focus?.set);
 if(await page.evaluate(()=>document.documentElement.dataset.theme)!==theme)await page.click('#btn-theme',{label:'Set comparison theme'});
 await page.keyboard.press('/');await page.fill('#node-finder-input','Users');await page.keyboard.press('Enter');
 const steps=[];let reached=false;
 for(let i=0;i<45;i++){const a=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id,cls:typeof document.activeElement?.className==='string'?document.activeElement.className:'svg',name:document.activeElement?.getAttribute('aria-label')}));steps.push(a);if(a.cls.includes('semantic-passport-source')){reached=true;break;}await page.keyboard.press('Tab');}
 if(!reached)throw Error(name+' source not reached in bounded traversal');
 const rows=await page.evaluate(()=>[...document.querySelectorAll('.semantic-passport-source')].map(a=>({text:a.textContent,name:a.getAttribute('aria-label'),href:a.href,focused:a===document.activeElement})));
 const ax=await page.cdp('Accessibility.getFullAXTree');
 const file=name+(width===390?'-mobile':'-desktop')+'.png';await page.screenshot({path:root+'/screenshots/'+file});
 await page.keyboard.press('Tab');const second=await page.evaluate(()=>({name:document.activeElement?.getAttribute('aria-label'),href:document.activeElement?.href}));
 const result={artifact:name+'.html',viewport:[width,height],theme,steps,rows,second,sourceAX:ax.nodes.filter(n=>n.role?.value==='link'&&n.name?.value?.includes('viewer/focus.js')),userAgent:await page.evaluate(()=>navigator.userAgent),screenshot:file};
 await fs.writeFile('/tmp/archify-round23-browser/'+name+'-final.json',JSON.stringify(result,null,2)+'\n');console.log({name,reached,steps:steps.length,names:rows.map(x=>x.name),second});
}

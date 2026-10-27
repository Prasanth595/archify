const fs=await import('node:fs/promises');const task=await taskSpace(32);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const steps=[];for(let i=0;i<45;i++){const a=await page.evaluate(()=>({tag:document.activeElement?.tagName,id:document.activeElement?.id,cls:document.activeElement?.className,text:document.activeElement?.getAttribute('aria-label')}));steps.push(a);if(String(a.cls).includes('semantic-passport-source'))break;await page.keyboard.press('Tab');}
const rows=await page.evaluate(()=>[...document.querySelectorAll('.semantic-passport-source')].map(a=>({text:a.textContent,name:a.getAttribute('aria-label'),href:a.href,focused:a===document.activeElement})));
const ax=await page.cdp('Accessibility.getFullAXTree');
await page.screenshot({path:'/Users/tsk/.codex/worktrees/lab-source-link-context/archify/experiments/source-link-context/screenshots/base-en-desktop.png'});
await page.keyboard.press('Tab');
const second=await page.evaluate(()=>({name:document.activeElement?.getAttribute('aria-label'),href:document.activeElement?.href}));
const data={artifact:'base-en.html',viewport:[1440,900],theme:await page.evaluate(()=>document.documentElement.dataset.theme),rows,steps,second,sourceAX:ax.nodes.filter(n=>n.role?.value==='link'&&n.name?.value?.includes('viewer/focus.js')),browser:await task.cdp('Browser.getVersion')};
await fs.writeFile('/tmp/archify-round23-browser/base-en.json',JSON.stringify(data,null,2)+'\n');console.log({rows,steps:steps.length,second});

const task=await taskSpace(3);const page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});
await page.keyboard.press('Home');await page.click('loc=role:button[name="浅色"]');
console.log('NARROW',await page.evaluate(()=>({width:innerWidth,height:innerHeight,pageWidth:document.documentElement.scrollWidth,tables:[...document.querySelectorAll('table')].map(t=>({width:t.getBoundingClientRect().width,parentWidth:t.parentElement.clientWidth,overflow:getComputedStyle(t.parentElement).overflowX}))})));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/evidence/final-narrow.png"});
const anchors=await page.evaluate(()=>[...document.querySelectorAll('a[aria-label]')].map(a=>({label:a.getAttribute('aria-label'),href:a.getAttribute('href')})));
const target=anchors.find(a=>a.href==='#verify');if(!target)throw new Error('No observed verify anchor');
await page.click(`loc=css:a[aria-label="${target.label}"]`);
console.log(await page.snapshot());

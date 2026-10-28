const task=await taskSpace(3);const page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('loc=role:button[name="浅色"]');await page.keyboard.press('Home');
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
console.log('LIGHT',await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,guided:[...document.querySelectorAll('.guided')].map(e=>({display:getComputedStyle(e).display,direction:getComputedStyle(e).flexDirection,width:e.clientWidth}))})));
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/evidence/final-light-stable.png"});
await page.mouse.move(1200,600);await page.mouse.wheel(0,290,{label:"Inspect full static size diagram"});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/evidence/final-diagram-light.png"});
await page.click('loc=role:button[name="▶ 逐步看"]');
console.log('STEP1',await page.evaluate(()=>document.body.innerText.match(/\d \/ 5/g)));
for(let n=2;n<=5;n++){await page.click('loc=role:button[name="下一步 →"]');console.log('STEP'+n,await page.evaluate(()=>document.body.innerText.match(/\d \/ 5/g)));}
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/evidence/final-step5.png"});
await page.click('loc=role:button[name="结束"]');
await page.click('loc=role:button[name="打开交互图"]');
await page.waitForFunction(()=>!document.body.innerText.includes('正在打开交互图'),undefined,{timeout:10000});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-binary-size-domains/archify/experiments/binary-size-domains/evidence/final-native-modal.png"});
console.log(await page.snapshot());

const task=await taskSpace(3);const page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.evaluate(()=>({panels:[...document.querySelectorAll('.panel')].map(x=>({id:x.id,class:x.className,h:x.getBoundingClientRect().height})),guided:[...document.querySelectorAll('.guided')].map(x=>({class:x.className,style:getComputedStyle(x).gridTemplateColumns})),overflow:document.documentElement.scrollWidth>innerWidth})));
await page.mouse.move(1000,600);await page.mouse.wheel(0,380,{label:"Inspect full coverage diagram"});
console.log(await page.snapshot());
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-schema-annotations/archify/experiments/schema-annotations/evidence/second-diagram.png"});

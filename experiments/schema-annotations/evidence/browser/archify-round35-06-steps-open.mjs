const task=await taskSpace(3);const page=task.page("p1");
for(let n=2;n<=5;n++){
 await page.click('loc=role:button[name="下一步 →"]');
 console.log(`STEP ${n}`,await page.evaluate(()=>({counter:document.body.innerText.match(/\d \/ 5/g),focused:[...document.querySelectorAll('[class]')].filter(e=>/focus|active-step/.test(e.className?.baseVal??e.className)).slice(-12).map(e=>({id:e.id,class:e.getAttribute('class')}))})));
}
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-schema-annotations/archify/experiments/schema-annotations/evidence/final-guided-step5.png"});
await page.click('loc=role:button[name="结束"]');
await page.click('loc=role:button[name="打开交互图"]');
console.log(await page.snapshot());

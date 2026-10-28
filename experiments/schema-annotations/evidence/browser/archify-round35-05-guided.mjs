const task=await taskSpace(3);const page=task.page("p1");
await page.goto("file:///Users/tsk/.codex/worktrees/lab-schema-annotations/archify/experiments/schema-annotations/explanation.html");
await page.evaluate(()=>document.fonts.ready);
await page.click('loc=role:button[name="▶ 逐步看"]');
console.log(await page.snapshot());
await page.screenshot({path:"/Users/tsk/.codex/worktrees/lab-schema-annotations/archify/experiments/schema-annotations/evidence/final-guided-step1.png"});

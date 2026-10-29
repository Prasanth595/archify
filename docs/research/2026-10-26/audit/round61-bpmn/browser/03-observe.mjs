const task=await taskSpace(2); const page=task.page("p1"); const fs=await import("node:fs/promises");
const observed=await page.evaluate(()=>({url:location.href,viewport:[innerWidth,innerHeight],ua:navigator.userAgent,
buttons:[...document.querySelectorAll("button")].map(e=>({html:e.outerHTML,rect:{x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y}})),
elements:[...document.querySelectorAll("[data-element-id]")].map(e=>({id:e.getAttribute("data-element-id"),tag:e.tagName,cls:e.getAttribute("class")})),
scripts:[...document.scripts].map(e=>e.src)}));
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round61-bpmn/browser/03-initial-dom.json",JSON.stringify(observed,null,2));
console.log(observed);
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round61-bpmn/browser/03-initial.png"});

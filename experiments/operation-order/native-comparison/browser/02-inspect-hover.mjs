import fs from 'node:fs/promises';
const root="/Users/tsk/.codex/worktrees/lab-operation-order/archify/experiments/operation-order/native-comparison",task=await taskSpace(3),page=task.page('p1');
await page.screenshot({path:root+'/browser/original-overview.png'});
console.log(await page.evaluate(()=>({rects:[...document.querySelectorAll('#canvas rect')].map(e=>({attrs:[...e.attributes].map(a=>[a.name,a.value])})),divs:[...document.querySelectorAll('body>div')].map(e=>({id:e.id,cls:e.className}))})));
await page.hover('text="get() -> 0"');
console.log(await page.snapshot());

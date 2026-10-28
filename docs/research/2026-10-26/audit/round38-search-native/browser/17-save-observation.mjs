import fs from 'node:fs';
const task=await taskSpace(3);const page=task.page('p1');
const observed=await page.evaluate(()=>({url:location.href,timeline:window.__r38Observation??null}));
fs.writeFileSync('/tmp/archify-round38-browser/17-observation.json',JSON.stringify(observed,null,2));
console.log({url:observed.url,samples:observed.timeline?.samples.length,done:observed.timeline?.done});
console.log(await page.snapshot());

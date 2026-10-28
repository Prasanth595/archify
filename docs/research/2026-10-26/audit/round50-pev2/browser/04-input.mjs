const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises'),crypto=await import('node:crypto');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('text="Many CTEs"',{label:'load bundled many CTEs'});
const fields=await page.evaluate(()=>[...document.querySelectorAll('textarea')].map(x=>({placeholder:x.placeholder,value:x.value})));
for(let i=0;i<fields.length;i++)console.log({index:i,placeholder:fields[i].placeholder,bytes:Buffer.byteLength(fields[i].value),sha256:crypto.createHash('sha256').update(fields[i].value).digest('hex')});
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round50-pev2/fixture/native-input.json",fields[0].value);
console.log(await page.snapshot());

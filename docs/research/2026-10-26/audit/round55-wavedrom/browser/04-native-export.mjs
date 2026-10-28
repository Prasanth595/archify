import fs from 'node:fs/promises';
const root="/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round55-wavedrom",task=await taskSpace(3),page=task.page('p1');
await fs.mkdir(root+'/exports',{recursive:true});
for(const name of ['baseline','phase-zero','scale-two']){
 const input=await fs.readFile(root+'/cases/'+name+'.json','utf8');
 await page.goto('http://127.0.0.1:8875/editor.html?'+encodeURIComponent(input));
 await page.waitForFunction(input=>document.querySelector('#InputJSON_0')?.value===input,input,{timeout:15000});
 await page.waitForFunction(()=>document.querySelector('#WaveDrom_Display_0 svg')?.textContent.includes('3 ms'),undefined,{timeout:15000});
 for(const ext of ['SVG','PNG']){
  await page.mouse.click(1250,721);
  const pending=page.waitForEvent('download',{timeout:15000});
  await page.click('text="Export '+ext+'..."');
  const download=await pending;
  await download.saveAs(root+'/exports/'+name+'.'+ext.toLowerCase());
  console.log(JSON.stringify({name,format:ext,filename:download.suggestedFilename()}));
 }
}
console.log(await page.snapshot());

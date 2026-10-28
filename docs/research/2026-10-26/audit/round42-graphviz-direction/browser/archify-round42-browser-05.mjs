const task=await taskSpace(3),page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const cases=[['directed_forward','digraph','->','forward'],['directed_none','digraph','->','none'],['directed_both','digraph','->','both'],['directed_back','digraph','->','back'],['undirected_forward','graph','--','forward']];
for(const [name,kind,op,dir] of cases){
  const source=`${kind} ${name} {\n  rankdir=LR;\n  label="${name}";\n  node [shape=box];\n  CRM ${op} ERP [dir=${dir}, label="shared ID"];\n}\n`;
  console.log('INPUT',JSON.stringify({name,source}));
  await page.selectOption('#format select','svg');
  await page.click('#editor');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.paste(source);
  await page.waitForFunction(expected=>document.querySelector('#review svg g.graph > title')?.textContent===expected,name,{timeout:15000});
  console.log('SVG',JSON.stringify({name,svg:await page.evaluate(()=>document.querySelector('#review svg').outerHTML)}));
  await page.screenshot({path:`/tmp/archify-round42-${name}.png`});
  await page.selectOption('#format select','json');
  await page.waitForFunction(expected=>{try{return JSON.parse(document.querySelector('#text')?.textContent).name===expected}catch{return false}},name,{timeout:15000});
  console.log('NATIVE_JSON',JSON.stringify({name,text:await page.evaluate(()=>document.querySelector('#text').textContent)}));
}
console.log(await page.snapshot());

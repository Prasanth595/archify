const task=await taskSpace(3),page=task.page('p1');
const cases=[['directed_forward','digraph','->','forward'],['directed_none','digraph','->','none'],['directed_both','digraph','->','both'],['directed_back','digraph','->','back'],['undirected_forward','graph','--','forward']];
for(const [name,kind,op,dir] of cases){
  const source=`${kind} ${name} {\n  rankdir=LR;\n  label="${name}";\n  node [shape=box];\n  CRM ${op} ERP [dir=${dir}, label="shared ID"];\n}\n`;
  await page.selectOption('#format select','json');
  await page.click('#editor');
  await page.keyboard.press('ControlOrMeta+A');
  await page.keyboard.paste(source);
  await page.waitForFunction(expected=>{try{return JSON.parse(document.querySelector('#text')?.textContent).name===expected}catch{return false}},name,{timeout:15000});
  console.log('REPLAY',JSON.stringify({name,text:await page.evaluate(()=>document.querySelector('#text').textContent),observedSource:await page.evaluate(()=>decodeURIComponent(location.hash.slice(1)))}));
}

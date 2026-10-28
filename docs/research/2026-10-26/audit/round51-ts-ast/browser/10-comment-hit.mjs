const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
async function clickComment(label){
 const target=await page.evaluate(()=>[...document.querySelectorAll('.view-lines .view-line')].filter(x=>x.textContent.includes('efficient')).map(x=>({text:x.textContent,rect:x.getBoundingClientRect().toJSON()})));
 if(target.length!==1)throw new Error('Expected one visible JSDoc source line');
 await page.mouse.click(target[0].rect.x+100,target[0].rect.y+target[0].rect.height/2,{label});
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 return {target:target[0],state:await page.evaluate(()=>({
 selected:document.querySelector('#treeViewer .selected')?.textContent,
 fields:[...document.querySelectorAll('.propertiesViewer [data-name]')].map(x=>({name:x.getAttribute('data-name'),value:x.querySelector(':scope > .value')?.textContent})).filter(x=>x.value!==undefined),
 status:[...document.querySelectorAll('div')].filter(x=>x.children.length===0&&/^Pos /.test(x.textContent)).map(x=>x.textContent),
 mode:document.querySelector('#treeMode')?.value,
 highlights:[...document.querySelectorAll('.editorRangeHighlight')].map(x=>x.getBoundingClientRect().toJSON())
 }))};
}
const token=await clickComment('select the comment in token mode');
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/browser/comment-token-state.json",JSON.stringify(token,null,2)+'\n');
console.log('GETCHILDREN',token);
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/screenshots/04-comment-getchildren.png"});
await page.click('text="Options"',{label:'restore semantic-child traversal'});
await page.selectOption('#treeMode',{value:'0'});
await page.click('text="Options"',{label:'compare the same source location'});
const each=await clickComment('select the same comment position');
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/browser/comment-foreach-state.json",JSON.stringify(each,null,2)+'\n');
console.log('FOREACH',{target:each.target,selected:each.state.selected,fields:each.state.fields.filter(x=>!['getFullText()','getText()'].includes(x.name)),status:each.state.status,mode:each.state.mode,highlightCount:each.state.highlights.length});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/screenshots/05-comment-foreach.png"});

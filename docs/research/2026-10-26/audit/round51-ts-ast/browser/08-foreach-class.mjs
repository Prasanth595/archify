const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises'),crypto=await import('node:crypto');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const input=await page.evaluate(()=>document.querySelector('.propertiesViewer [data-name="getFullText()"] .value')?.textContent);
if(typeof input!=='string')throw new Error('SourceFile public getFullText not shown');
const expected=await fs.readFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/fixture/LineAndColumnComputer.ts",'utf8');
if(input!==expected)throw new Error('Native input differs from upstream bytes');
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/fixture/native-input.ts",input);
console.log('INPUT',{bytes:Buffer.byteLength(input),sha256:crypto.createHash('sha256').update(input).digest('hex')});
await page.click('#treeViewer [data-name="ClassDeclaration"] .nodeText >> nth=0',{label:'select upstream class declaration'});
await page.waitForFunction(()=>document.querySelector('#treeViewer .selected')?.textContent==='ClassDeclaration',undefined,{timeout:10000});
const state=await page.evaluate(()=>({
 selected:document.querySelector('#treeViewer .selected')?.textContent,
 fields:[...document.querySelectorAll('.propertiesViewer [data-name]')].map(x=>({name:x.getAttribute('data-name'),value:x.querySelector(':scope > .value')?.textContent})).filter(x=>x.value!==undefined),
 tree:[...document.querySelectorAll('#treeViewer .nodeText')].map(x=>({kind:x.textContent,parent:x.closest('[data-name]')?.parentElement.closest('[data-name]')?.getAttribute('data-name')??null})),
 highlights:[...document.querySelectorAll('.editorRangeHighlight')].map(x=>({rect:x.getBoundingClientRect().toJSON(),text:x.textContent,html:x.outerHTML})),
 editorText:document.querySelector('.monaco-editor .view-lines')?.innerText,
 options:{compiler:document.querySelector('#compilerVersionSelection')?.value,mode:document.querySelector('#treeMode')?.value,binding:document.querySelector('#bindingEnabled')?.checked,factory:document.querySelector('#showFactoryCode')?.checked}
}));
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/browser/foreach-class-state.json",JSON.stringify(state,null,2)+'\n');
console.log('CLASS',{selected:state.selected,fields:state.fields.filter(x=>!['getFullText()','getText()'].includes(x.name)),treeCount:state.tree.length,classChildren:state.tree.filter(x=>x.parent==='ClassDeclaration'),options:state.options,highlights:state.highlights.slice(0,3)});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/screenshots/02-foreach-class.png"});

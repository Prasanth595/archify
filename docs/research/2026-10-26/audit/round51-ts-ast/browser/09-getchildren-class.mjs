const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log('SETTLED FOREACH',await page.evaluate(()=>({highlightElements:[...document.querySelectorAll('.editorRangeHighlight')].map(x=>({rect:x.getBoundingClientRect().toJSON(),html:x.outerHTML})),classChildren:[...document.querySelectorAll('#treeViewer .nodeText')].filter(x=>x.closest('[data-name]')?.parentElement.closest('[data-name]')?.getAttribute('data-name')==='ClassDeclaration').map(x=>x.textContent)})));
await page.click('text="Options"',{label:'change native traversal mode'});
await page.selectOption('#treeMode',{value:'1'});
await page.click('text="Options"',{label:'inspect token-inclusive syntax tree'});
await page.waitForFunction(()=>document.querySelector('#treeViewer')?.innerText.includes('ClassKeyword'),undefined,{timeout:10000});
await page.click('#treeViewer [data-name="ClassDeclaration"] .nodeText >> nth=0',{label:'compare the same class node'});
await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const state=await page.evaluate(()=>({
 selected:document.querySelector('#treeViewer .selected')?.textContent,
 fields:[...document.querySelectorAll('.propertiesViewer [data-name]')].map(x=>({name:x.getAttribute('data-name'),value:x.querySelector(':scope > .value')?.textContent})).filter(x=>x.value!==undefined),
 tree:[...document.querySelectorAll('#treeViewer .nodeText')].map(x=>({kind:x.textContent,parent:x.closest('[data-name]')?.parentElement.closest('[data-name]')?.getAttribute('data-name')??null})),
 highlights:[...document.querySelectorAll('.editorRangeHighlight')].map(x=>({rect:x.getBoundingClientRect().toJSON(),html:x.outerHTML})),
 editorText:document.querySelector('.monaco-editor .view-lines')?.innerText,
 options:{compiler:document.querySelector('#compilerVersionSelection')?.value,mode:document.querySelector('#treeMode')?.value,binding:document.querySelector('#bindingEnabled')?.checked,factory:document.querySelector('#showFactoryCode')?.checked}
}));
await fs.writeFile("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/browser/getchildren-class-state.json",JSON.stringify(state,null,2)+'\n');
console.log('CLASS',{selected:state.selected,fields:state.fields.filter(x=>!['getFullText()','getText()'].includes(x.name)),treeCount:state.tree.length,classChildren:state.tree.filter(x=>x.parent==='ClassDeclaration'),options:state.options,highlightCount:state.highlights.length,firstHighlight:state.highlights[0]});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/screenshots/03-getchildren-class.png"});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { runFinalize } from '../archify/bin/finalize.mjs';
import { startEditor } from '../archify/editor/session.mjs';
import { readEditScene } from '../archify/editor/model.mjs';
import { cleanFlowProblems } from '../archify/renderers/shared/geometry.mjs';
import { findChrome } from '../archify/bin/visual-check.mjs';
import { desktopBrowser } from './helpers/desktop-browser.mjs';
import { createViewerClick } from './helpers/viewer-click.mjs';
import {connectionDiagram} from './helpers/connection-diagrams.mjs';

const chrome = process.env.ARCHIFY_CHROME ? findChrome() : null;
const root = fileURLToPath(new URL('../', import.meta.url));

test('connection editor uses native selection, drags, undo, and verified source save', { timeout:120000, skip:chrome?false:'Set ARCHIFY_CHROME for native browser editing.' }, async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-browser-'));
  let editor,browser,phase='editor startup';
  t.after(async()=>{
    if(t.signal.aborted)t.diagnostic('Last editor operation: '+phase);
    try { await browser?.close(); }
    finally { await editor?.stop({force:true}); fs.rmSync(dir,{recursive:true,force:true}); }
  },{timeout:15000});
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html');
  const source={schema_version:1,diagram_type:'architecture',meta:{title:'Connection adjustment',output:'diagram.html',legend:{mode:'hidden'}},
    components:[{id:'a',type:'frontend',label:'Intake',pos:[80,120],size:[100,60]},{id:'b',type:'backend',label:'Execute',pos:[320,120],size:[100,60]},{id:'c',type:'database',label:'Store',pos:[560,120],size:[100,60]},{id:'obstacle',type:'external',label:'Other module',pos:[230,230],size:[80,60]}],
    connections:[{id:'first',from:'a',to:'b',label:'Request'},{id:'second',from:'b',to:'c',label:'Result'}]};
  const original=JSON.stringify(source);fs.writeFileSync(input,original);
  let finalizeCount=0;
  editor=await startEditor({type:'architecture',input,output,signal:t.signal,open:false,debounceMs:5,pollMs:20,finalize:options=>{
    finalizeCount++;
    if(finalizeCount===1)return {receipt:{ok:false,failedStage:'deliver',diagnostics:[{message:'Architecture layout validation failed: [clean-flow/edge-through-node] connection crosses component "cache" on segment 2'}]}};
    return runFinalize(options);
  }});
  phase='browser startup';browser=desktopBrowser(chrome);const session=await browser.sessionPromise;
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
  async function run(expression) {
    phase=expression.slice(0,240);
    let r;
    try { r=await browser.cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session); }
    catch(error) {throw Error(expression.slice(0,240)+'\n'+error.message);}
    assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;
  }
  async function wait(expression,timeout=30000) {
    const until=Date.now()+timeout;
    while(Date.now()<until) {if(await run(expression))return;await new Promise(r=>setTimeout(r,50));}
    if(process.env.ARCHIFY_EDIT_EVIDENCE) {
      fs.mkdirSync(process.env.ARCHIFY_EDIT_EVIDENCE,{recursive:true});
      const capture=await browser.cdp.send('Page.captureScreenshot',{format:'png'},session);
      fs.writeFileSync(path.join(process.env.ARCHIFY_EDIT_EVIDENCE,'failure.png'),Buffer.from(capture.data,'base64'));
    }
    assert.fail('Timed out: '+expression+'; status: '+await run(`JSON.stringify({status:document.querySelector('.connection-adjust-status')?.textContent,events:window.editEvents,errors:window.editErrors,initial:window.editInitial,last:window.lastHandle?.outerHTML,connected:window.lastHandle?.isConnected,handles:[...document.querySelectorAll('.connection-adjust-handle')].map(n=>{const r=n.getBoundingClientRect();return {x:r.x,y:r.y,hit:document.elementFromPoint(r.x+6,r.y+6)?.outerHTML.slice(0,180)}})})`));
  }
  async function click(expression) {
    const box=await run(`(()=>{const n=${expression};const r=n.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
    await browser.cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...box},session);
    await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...box},session);
  }
  await browser.cdp.send('Page.navigate',{url:editor.url},session);
  await wait(`!!document.querySelector('.connection-adjust')`);
  const before=editor.state().scene;
  assert.equal(await run(`document.getElementById('btn-draft').closest('.toolbar-group')!==null`),true,'draft mode belongs to the top-right controls');
  assert.equal(await run(`document.getElementById('btn-draft').hidden`),false,'entering draft mode does not require a selected connection');
  await click(`document.getElementById('btn-draft')`);
  assert.equal(await run(`document.getElementById('btn-draft').getAttribute('aria-pressed')`),'true');
  assert.equal(await run(`document.getElementById('connection-draft-panel').hidden`),true,'entering draft mode has no persistent overlay');
  await click(`document.querySelector('[data-relationship-id="first"] .relationship-hit-rail')`);
  assert.equal(await run(`document.getElementById('focus-chip').hidden`),true,'draft selection cannot open the reading passport');
  assert.equal(await run(`Archify.focus.relationship()`),null,'draft selection does not borrow the reader selection');
  await wait(`document.querySelector('[aria-label="Move route segment"]') && !document.querySelector('.connection-adjust-status').textContent.includes('Checking')`);
  const handle=await run(`(()=>{const r=document.querySelector('[aria-label="Move route segment"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await run(`window.draftSentinel='same document';window.editRequests=0;const fetchDraft=window.fetch;window.fetch=(...args)=>{if(String(args[0]).startsWith('/edit/'))editRequests++;return fetchDraft(...args);}`);
  async function dragAt(start,end,follow=false) {
    if(follow)await run(`window.heldDraftHandle=document.elementFromPoint(${start.x},${start.y})`);
    await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',...start},session);
    await browser.cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...start},session);
    await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',button:'left',buttons:1,...end},session);
    if(follow){const p=await run(`(()=>{const r=heldDraftHandle.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert.ok(Math.hypot(p.x-end.x,p.y-end.y)<1,'the held handle follows its segment before pointer release');}
    await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...end},session);
  }
  await dragAt(handle,{x:handle.x,y:handle.y+38},true);
  await wait(`document.querySelector('.connection-adjust-status').textContent.includes('Draft updated')`);
  const route=()=>run(`document.querySelector('path[data-edge-id="first"]').getAttribute('d')`);
  const moved=await route();
  const follow=await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`);
  const movedPoints=await run(`document.querySelector('path[data-edge-id="first"]').getAttribute('data-composition-points').split(';').map(p=>p.split(',').map(Number))`);
  const routeDelta=movedPoints[2][1]-before.edges[0].points[0][1];
  assert.ok(routeDelta>0);
  assert.ok(Math.abs(Number(follow.match(/translate\(0 ([-\d.]+)\)/)[1])-routeDelta)<1e-6,'label follows the newly offset segment in diagram coordinates');
  assert.equal(editor.state().revision,0,'draft gestures do not compile or commit');
  assert.equal(finalizeCount,0);
  assert.equal(fs.readFileSync(input,'utf8'),original);
  assert.equal(await run(`document.querySelector('[aria-label="Move relationship label"]')===null`),true);
  const raisedMiddle=await run(`(()=>{const r=document.querySelectorAll('[aria-label="Move route segment"]')[1].getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await dragAt(raisedMiddle,{x:raisedMiddle.x,y:handle.y});
  const returned=await run(`document.querySelector('path[data-edge-id="first"]').getAttribute('data-composition-points').split(';').map(p=>p.split(',').map(Number))`);
  assert.deepEqual(returned,before.edges[0].points,'a detour can collapse back to the original straight connection');
  assert.equal(await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`),null,'the attached label returns with the straightened route');
  await click(`document.querySelector('.connection-draft-control [aria-label="Undo"]')`);
  assert.equal(await route(),moved);
  await click(`document.querySelector('.connection-draft-control [aria-label="Undo"]')`);
  assert.notEqual(await route(),moved);
  assert.equal(await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`),null,'undo restores the route and attached label together');
  await click(`document.querySelector('.connection-draft-control [aria-label="Redo"]')`);
  assert.equal(await route(),moved);
  const label=await run(`(()=>{const n=[...document.querySelectorAll('g.connection-adjust-label')].find(n=>n.dataset.edgeId==='first');const r=n.querySelector('text').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await dragAt(label,{x:label.x+22,y:label.y+45});
  const labelTransform=await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`);
  assert.match(labelTransform,/translate/,'the label itself is draggable');
  const [,tx,ty]=labelTransform.match(/translate\(([-\d.]+) ([-\d.]+)\)/);
  assert.ok(Number(tx)>0);assert.ok(Math.abs(Number(ty)-routeDelta)<1e-6,'label follows the moved horizontal track despite diagonal mouse movement');
  await wait(`document.querySelectorAll('[aria-label="Move route segment"]').length===3`);
  await run(`document.querySelectorAll('[aria-label="Move route segment"]')[1].focus()`);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40},session);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowDown',code:'ArrowDown',windowsVirtualKeyCode:40},session);
  const followedAgain=await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`);
  assert.ok(Math.abs(Number(followedAgain.match(/translate\([-\d.]+ ([-\d.]+)\)/)[1])-routeDelta-2)<1e-6,'a later segment edit retains the label attachment');
  await click(`document.querySelector('.connection-draft-control [aria-label="Undo"]')`);
  assert.equal(await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`),labelTransform);
  const middle=await run(`(()=>{const r=document.querySelectorAll('[aria-label="Move route segment"]')[1].getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  const crossing=await run(`(()=>{const p=new DOMPoint(250,260).matrixTransform(document.querySelector('.diagram-container>svg').getScreenCTM());return{x:p.x,y:p.y};})()`);
  await dragAt(middle,{x:middle.x,y:crossing.y});
  assert.notEqual(await route(),moved,'the route moves as far as its available clearance');
  const limitedPoints=await run(`document.querySelector('path[data-edge-id="first"]').getAttribute('data-composition-points').split(';').map(p=>p.split(',').map(Number))`);
  assert.ok(limitedPoints[2][1]<228,'motion stops before entering the unrelated node with native clearance');
  assert.deepEqual(cleanFlowProblems({relations:[source.connections[0]],obstacles:before.nodes.map(n=>({id:n.id,...n.box})),pathFor:()=>({points:limitedPoints}),diagramType:'architecture',relationCollection:'connections',obstacleKind:'component'}),[],'the constrained draft meets the native node-crossing rule');
  assert.ok(await run(`document.querySelectorAll('[aria-label="Move route segment"]').length>0`),'reaching a boundary cannot lock the adjustment handles');
  await click(`document.querySelector('[data-relationship-id="second"] .relationship-hit-rail')`);
  assert.equal(await run(`document.querySelector('path[data-edge-id="second"]').classList.contains('connection-draft-selected')`),true);
  const updatedHit=await run(`(()=>{const p=new DOMPoint(214,${limitedPoints[2][1]}).matrixTransform(document.querySelector('.diagram-container>svg').getScreenCTM());return{x:p.x,y:p.y};})()`);
  await browser.cdp.send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...updatedHit},session);
  await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...updatedHit},session);
  assert.equal(await run(`document.querySelector('path[data-edge-id="first"]').classList.contains('connection-draft-selected')`),true,'the moved route can be selected at its current position');
  assert.equal(await run(`document.getElementById('focus-chip').hidden`),true);
  await click(`document.querySelector('.connection-draft-control [aria-label="Undo"]')`);
  assert.equal(await route(),moved,'a constrained edit remains reversible');
  assert.equal(await run('window.draftSentinel'),'same document');
  assert.equal(await run('window.editRequests'),0,'drag, label movement and history have no edit network requests');
  await click(`document.getElementById('btn-export')`);
  await click(`document.querySelector('#export-menu button')`);
  await wait(`document.querySelector('.connection-adjust-status').textContent.includes('Your draft is kept')`);
  assert.equal(finalizeCount,1);
  assert.equal(fs.readFileSync(input,'utf8'),original,'failed save restores original source');
  assert.equal(await route(),moved,'failed save retains the drawn draft');
  assert.equal(await run(`document.querySelector('g.connection-adjust-label[data-edge-id="first"]').getAttribute('transform')`),labelTransform);
  assert.equal(await run(`document.querySelector('.connection-adjust details').open`),false);
  assert.doesNotMatch(await run(`document.querySelector('.connection-adjust-status').textContent`),/layout validation|clean-flow/);
  await click(`document.querySelector('.connection-adjust-dismiss')`);
  assert.equal(await run(`document.getElementById('connection-draft-panel').hidden`),true,'the rejection message is dismissible');
  assert.equal(await run(`document.getElementById('btn-draft').getAttribute('aria-pressed')`),'true','dismissing a message keeps editing enabled');
  assert.equal(await route(),moved);
  await click(`document.getElementById('btn-export')`);
  await click(`document.querySelector('#export-menu button')`);
  await wait(`document.querySelector('.connection-adjust') && JSON.parse(document.querySelector('#archify-edit-data')?.textContent||'{}').revision===1`,60000);
  assert.equal(finalizeCount,2,'one finalize operation per explicit save, including the injected rejection');
  const saved=JSON.parse(fs.readFileSync(input,'utf8'));
  assert.deepEqual(saved.components,source.components);
  assert.deepEqual(saved.connections[1],source.connections[1]);
  assert.ok(saved.connections[0].via.length);
  assert.deepEqual(editor.state().scene.nodes,before.nodes);
  assert.ok(saved.connections[0].labelAt,'route and label edits are saved together');
  const delivered=fs.readFileSync(output,'utf8');assert.doesNotMatch(delivered,/archify-edit-data/);
  const cold=path.join(dir,'cold.html');
  execFileSync(process.execPath,[path.join(root,'archify/renderers/architecture/render-architecture.mjs'),input,cold],{timeout:60000,killSignal:'SIGKILL'});
  assert.deepEqual(readEditScene(fs.readFileSync(cold)),readEditScene(delivered));
  const checked=JSON.parse(execFileSync(process.execPath,[path.join(root,'archify/bin/archify.mjs'),'check',output,'--require-provenance','--json'],{encoding:'utf8',timeout:60000,killSignal:'SIGKILL'}));
  assert.equal(checked.ok,true);
  if(process.env.ARCHIFY_EDIT_EVIDENCE) {
    fs.mkdirSync(process.env.ARCHIFY_EDIT_EVIDENCE,{recursive:true});
    const capture=await browser.cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);
    fs.writeFileSync(path.join(process.env.ARCHIFY_EDIT_EVIDENCE,'editor.png'),Buffer.from(capture.data,'base64'));
  }
  phase='browser shutdown';await browser.close();phase='editor shutdown';await editor.stop();
});


for(const type of ['architecture','workflow','dataflow'])for(const locale of ['en','zh-CN'])test(`${type} two-click connection creation preserves native editing and reading (${locale})`, {timeout:120000,skip:chrome?false:'Set ARCHIFY_CHROME for native browser editing.'}, async t=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-connect-browser-'));
  let editor,browser,phase='editor startup';
  t.after(async()=>{
    if(t.signal.aborted)t.diagnostic('Last editor operation: '+phase);
    try { await browser?.close(); }
    finally { await editor?.stop({force:true}); fs.rmSync(dir,{recursive:true,force:true}); }
  },{timeout:15000});
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html');
  const source=connectionDiagram(type,locale),collection=type==='architecture'?'connections':type==='workflow'?'edges':'flows',nodeCollection=type==='architecture'?'components':'nodes',side=type==='architecture'?'top':'bottom';
  const original=JSON.stringify(source);fs.writeFileSync(input,original);let finalized=0;
  editor=await startEditor({type,input,output,signal:t.signal,open:false,finalize:options=>{finalized++;return runFinalize(options);}});
  phase='browser startup';browser=desktopBrowser(chrome);const session=await browser.sessionPromise;
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false},session);
  async function run(expression){phase=expression.slice(0,240);const r=await browser.cdp.send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},session);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;}
  async function wait(expression){const until=Date.now()+30000;while(Date.now()<until){if(await run(expression))return;await new Promise(r=>setTimeout(r,50));}assert.fail(expression+'; '+await run(`document.querySelector('.connection-adjust-status')?.textContent+' '+document.querySelector('.connection-adjust pre')?.textContent`));}
  const clickTarget=await createViewerClick({send:(method,params)=>browser.cdp.send(method,params,session),run,timeout:10000});
  async function click(expression){
    await run(`document.querySelectorAll('[data-edit-test-click]').forEach(n=>n.removeAttribute('data-edit-test-click'));(${expression}).setAttribute('data-edit-test-click','')`);
    await clickTarget('[data-edit-test-click]');
  }
  async function atNode(id,side){return run(`(()=>{const n=JSON.parse(document.querySelector('#archify-edit-data').textContent).scene.nodes.find(n=>n.id===${JSON.stringify(id)}),b=n.box;const p=new DOMPoint(b.x+b.width/2,${side==='top'?'b.y':'b.y+b.height/2'}).matrixTransform(document.querySelector('.diagram-container>svg').getScreenCTM());return{x:p.x,y:p.y};})()`);}
  async function assertReadings(model){
    for(const node of model[nodeCollection])for(const direction of ['upstream','downstream']){
      const reachable=new Set([node.id]);let changed=true;
      while(changed){changed=false;for(const edge of model[collection]){const [from,to]=direction==='downstream'?[edge.from,edge.to]:[edge.to,edge.from];if(reachable.has(from)&&!reachable.has(to)){reachable.add(to);changed=true;}}}
      const actual=await run(`(()=>{Archify.focus.set(${JSON.stringify(node.id)},{toggle:false,updateUrl:false});Archify.focus.reach(${JSON.stringify(direction)},{toggle:false,updateUrl:false,reveal:false});const reach=Archify.focus.reachability();return reach&&{nodeIds:reach.nodeIds,edgeIds:reach.edgeKeys.map(key=>document.querySelector('path[data-edge-key="'+key+'"][data-edge-id]')?.getAttribute('data-edge-id'))};})()`);
      assert.deepEqual((actual?.nodeIds||[node.id]).sort(),[...reachable].sort(),`${node.id} ${direction} matches the current source graph`);
      assert.deepEqual((actual?.edgeIds||[]).sort(),model[collection].flatMap(edge=>reachable.has(edge.from)&&reachable.has(edge.to)?[edge.id]:[]).sort(),`${node.id} ${direction} preserves exactly the reachable relationships`);
    }
    await run(`Archify.focus.clear({updateUrl:false})`);
  }
  await browser.cdp.send('Page.navigate',{url:editor.url},session);await wait(`!!document.getElementById('btn-draft')`);
  const before=editor.state().scene;
  await assertReadings(source);
  assert.equal(await run(`document.getElementById('btn-draft').textContent`),locale==='en'?'Draft':'草稿');
  await run(`document.getElementById('btn-motion').focus()`);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},session);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},session);
  assert.equal(await run(`document.activeElement.id`),'btn-draft','the existing toolbar navigation includes the edit control');
  await click(`document.getElementById('btn-draft')`);
  const hover=await atNode('c','center');await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',...hover},session);
  await wait(`!!document.querySelector('.connection-node-port[data-node-id="c"][data-side="${side}"]')`);
  assert.equal(await run(`!!document.querySelector('.connection-node-port[data-node-id="c"][data-side="left"]')`),false,'occupied sides are not offered');
  const start=`document.querySelector('.connection-node-port[data-node-id="c"][data-side="${side}"]')`,end=`document.querySelector('.connection-node-port[data-node-id="a"][data-side="${side}"]')`;
  await click(start);
  assert.equal(await run(`(${start}).getAttribute('aria-pressed')`),'true','the first click remains selected after releasing the mouse');
  assert.equal(await run(`document.activeElement===(${start})`),true,'the selected start retains keyboard focus when target ports appear');
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9},session);
  assert.equal(await run(`document.activeElement.matches('.connection-node-port')&&document.activeElement.dataset.nodeId!=='c'`),true,'Tab reaches an available destination point');
  assert.equal(await run(`document.querySelector('.connection-create-form').hidden`),true,'the first click does not open the label form');
  assert.equal(await run(`!!(${end})`),true,'available target points appear without hovering the target node');
  assert.equal(finalized,0);assert.equal(editor.state().revision,0);
  await click(start);
  assert.equal(await run(`!!document.querySelector('.connection-node-port[aria-pressed="true"]')`),false,'clicking the source again cancels');
  await click(start);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27},session);
  assert.equal(await run(`!!document.querySelector('.connection-node-port[aria-pressed="true"]')`),false,'Escape cancels the pending start');
  assert.equal(await run(`document.getElementById('btn-draft').getAttribute('aria-pressed')`),'true','canceling a connection stays in Draft');
  await click(start);
  assert.equal(await run(`(${start})?.getAttribute('aria-pressed')`),'true','the source can be selected again after canceling');
  await click(end);
  await wait(`!document.querySelector('.connection-create-form').hidden`);
  assert.equal(await run(`document.querySelector('.connection-create-form label').firstChild.textContent`),locale==='en'?'Label':'标签');
  assert.equal(await run(`document.querySelector('.connection-create-form button[type="submit"]').textContent`),locale==='en'?'Create':'创建');
  for(const composing of [{isComposing:true},{keyCode:229}]){
    assert.deepEqual(await run(`(()=>{const n=document.querySelector('.connection-create-form input');n.value='中文草稿';const e=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true,...${JSON.stringify(composing)}});n.dispatchEvent(e);return{prevented:e.defaultPrevented,open:!document.querySelector('.connection-create-form').hidden,value:n.value};})()`),{prevented:false,open:true,value:'中文草稿'},'IME Escape must not cancel the connection form');
  }
  assert.deepEqual(await run(`[...document.querySelectorAll('.connection-create-form input')].map(n=>n.name)`),['label']);
  assert.equal(await run(`document.querySelector('.connection-create-form input').required`),type==='dataflow');
  await run(`document.querySelector('.connection-create-form input').value=''`);
  assert.equal(await run(`document.querySelector('.connection-create-form').checkValidity()`),type!=='dataflow','label requirements follow the native diagram schema');
  if(type==='dataflow'){
    await click(`document.querySelector('.connection-create-form button[type="submit"]')`);
    assert.equal(await run(`!!document.querySelector('[data-draft-connection]')`),false,'empty Dataflow labels cannot enter the draft');
    assert.equal(await run(`document.querySelector('.connection-create-form').hidden`),false);
  }
  await run(`document.querySelector('.connection-create-form input').value='W'.repeat(240)`);
  await click(`document.querySelector('.connection-create-form button[type="submit"]')`);
  await wait(`document.querySelector('.connection-adjust-status').getAttribute('data-error')==='true'`);
  assert.ok(await run(`document.querySelector('.connection-adjust-status').textContent.includes(${JSON.stringify(locale==='en'?'cannot fit':'现有布局')})`),'the rejection summary uses the document locale');
  assert.equal(await run(`!!document.querySelector('[data-draft-connection]')`),false,'an infeasible label cannot add half a relationship');
  assert.equal(finalized,0);assert.equal(fs.readFileSync(input,'utf8'),original);
  await click(`document.querySelector('.connection-create-form button[type="button"]')`);
  await browser.cdp.send('Input.dispatchMouseEvent',{type:'mouseMoved',...await atNode('c','center')},session);
  await wait(`!!(${start})`);
  await click(start);
  await run(`(${end}).focus()`);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',windowsVirtualKeyCode:13},session);
  await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},session);
  assert.equal(await run(`document.querySelector('.connection-create-form').hidden`),false,'Enter selects the focused destination');
  await run(`document.querySelector('.connection-create-form input').value='Return'`);
  await click(`document.querySelector('.connection-create-form button[type="submit"]')`);
  await wait(`!!document.querySelector('[data-draft-connection]')`);
  assert.equal(finalized,0,'creating a connection does not compile the complete diagram');
  assert.equal(fs.readFileSync(input,'utf8'),original);
  assert.equal(editor.state().revision,0);
  const newId=await run(`document.querySelector('[data-draft-connection]').getAttribute('data-draft-connection')`);
  await click(`document.querySelectorAll('.connection-draft-history')[0]`);assert.equal(await run(`!!document.querySelector('[data-draft-connection]')`),false);
  await click(`document.getElementById('btn-draft')`);await assertReadings(source);await click(`document.getElementById('btn-draft')`);
  await click(`document.querySelectorAll('.connection-draft-history')[1]`);assert.equal(await run(`document.querySelector('[data-draft-connection]').getAttribute('data-draft-connection')`),newId);
  await click(`document.getElementById('btn-draft')`);
  await assertReadings({...source,[collection]:[...source[collection],{id:newId,from:'c',to:'a',label:'Return'}]});
  const middle=await run(`(()=>{const n=document.querySelector('.connection-draft-hit'),p=n.getPointAtLength(n.getTotalLength()/2).matrixTransform(n.getScreenCTM());return{x:p.x,y:p.y};})()`);
  for(const type of ['mousePressed','mouseReleased'])await browser.cdp.send('Input.dispatchMouseEvent',{type,button:'left',clickCount:1,...middle},session);
  assert.equal(await run(`Archify.focus.relationship()?.id`),newId,'native inspection can read the new relation before saving');
  assert.equal(fs.readFileSync(input,'utf8'),original,'reading the draft does not persist it');
  await click(`document.getElementById('btn-draft')`);
  assert.equal(await run(`document.getElementById('focus-chip').hidden`),true,'returning to editing clears the reading state');
  await click(`document.getElementById('btn-export')`);await click(`document.querySelector('#export-menu button')`);
  await wait(`JSON.parse(document.querySelector('#archify-edit-data')?.textContent||'{}').revision===1`);
  const saved=JSON.parse(fs.readFileSync(input));assert.equal(finalized,1);
  assert.deepEqual(saved[collection].slice(0,2),source[collection]);assert.deepEqual(saved[nodeCollection],source[nodeCollection]);
  assert.equal(saved[collection].at(-1).id,newId);assert.equal(saved[collection].at(-1).label,'Return');
  assert.deepEqual(editor.state().scene.nodes,before.nodes);
  for(const edge of before.edges)assert.deepEqual({...editor.state().scene.edges.find(e=>e.id===edge.id),key:edge.key},edge);
  assert.equal(editor.state().selection,editor.state().scene.edges.find(e=>e.id===newId).key,'selection follows the saved relationship when native rendering reorders it');
  await assertReadings(saved);
  await run(`Archify.focus.set('c',{toggle:false,updateUrl:false});Archify.focus.reach('downstream')`);
  assert.deepEqual((await run(`Archify.focus.reachability().nodeIds`)).sort(),['a','b','c'],'native reachability includes the newly saved relation');
  const checked=JSON.parse(execFileSync(process.execPath,[path.join(root,'archify/bin/archify.mjs'),'check',output,'--require-provenance','--json'],{encoding:'utf8',timeout:60000,killSignal:'SIGKILL'}));assert.equal(checked.ok,true);
  if(process.env.ARCHIFY_EDIT_EVIDENCE){fs.mkdirSync(process.env.ARCHIFY_EDIT_EVIDENCE,{recursive:true});const capture=await browser.cdp.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false},session);fs.writeFileSync(path.join(process.env.ARCHIFY_EDIT_EVIDENCE,'new-connection.png'),Buffer.from(capture.data,'base64'));}
  phase='browser shutdown';await browser.close();phase='editor shutdown';await editor.stop();
});

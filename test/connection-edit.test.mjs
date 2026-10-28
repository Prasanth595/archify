import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { request } from 'node:http';
import { compileWorkflow } from '../archify/renderers/workflow/workflow-compiler.mjs';
import { captureWorkflowLayout } from '../archify/renderers/workflow/workflow-migration-geometry.mjs';
import { applyConnectionEdit, checkEditScope, readEditScene } from '../archify/editor/model.mjs';
import { startEditor } from '../archify/editor/session.mjs';
import { proposeConnection, prepareEdits } from '../archify/editor/create.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
function stackedWorkflow() {
  return { schema_version:2, diagram_type:'workflow', meta:{ title:'Measured lanes',output:'diagram.html',legend:{mode:'hidden'} },
    lanes:[{id:'stages',label:'Stages'},{id:'worker',label:'Worker'},{id:'audit',label:'Audit'},{id:'observer',label:'Observer'}],
    groups:[{id:'stages',label:'Stages',lane:'stages',fromCol:1,toCol:3,variant:'security'}],
    nodes:[...[-90,0,90].map((yOffset,i)=>({id:'s'+i,lane:'stages',col:2,type:'security',label:'Stage '+i,yOffset})),
      {id:'worker',lane:'worker',col:2,type:'backend',label:'Worker'},
      {id:'audit',lane:'audit',col:2,type:'external',label:'Audit'},
      {id:'observer',lane:'observer',col:2,type:'external',label:'Observer'}],
    edges:[{id:'handoff',from:'worker',to:'audit',fromSide:'right',toSide:'right'}] };
}
function architecture() {
  return { schema_version:1,diagram_type:'architecture',meta:{title:'Connection adjustment',output:'diagram.html',legend:{mode:'hidden'}},
    components:[{id:'a',type:'frontend',label:'Intake',pos:[80,120],size:[100,60]},
      {id:'b',type:'backend',label:'Execute',pos:[320,120],size:[100,60]},
      {id:'c',type:'database',label:'Store',pos:[560,120],size:[100,60]}],
    connections:[{id:'first',from:'a',to:'b',label:'Request'},{id:'second',from:'b',to:'c',label:'Result'}] };
}

test('adding a native connection preserves every existing relationship and its geometry', t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-create-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const source=architecture();source.meta.viewBox=[760,480];
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html'),render=path.join(root,'archify/renderers/architecture/render-architecture.mjs');
  fs.writeFileSync(input,JSON.stringify(source));execFileSync(process.execPath,[render,input,output]);
  const before=readEditScene(fs.readFileSync(output));
  const proposal=proposeConnection(source,before,{from:'c',to:'a',fromSide:'top',toSide:'top',label:'Return'},'standard');
  const command={key:proposal.edge.key,field:'create',value:proposal.value};
  const draft=prepareEdits(source,'architecture',before,[command],'standard');
  assert.deepEqual(draft.source.connections.slice(0,-1),source.connections);
  assert.deepEqual(draft.source.components,source.components);
  assert.equal(source.connections.length,2,'the original source is immutable');
  fs.writeFileSync(input,JSON.stringify(draft.source));execFileSync(process.execPath,[render,input,output]);
  const after=readEditScene(fs.readFileSync(output));
  const impact=checkEditScope(source,'architecture',before,after,[command]);
  assert.deepEqual(impact.added,[proposal.value.id]);assert.deepEqual(impact.changed,[]);
  assert.throws(()=>proposeConnection(source,before,{from:'a',to:'c',fromSide:'right',toSide:'left',label:'Busy'},'standard'),/existing route|already in use/);
  assert.throws(()=>prepareEdits(source,'workflow',before,[command],'standard'),/architecture/);
  const forged=structuredClone(command);forged.value.points[0][0]+=10;
  assert.throws(()=>prepareEdits(source,'architecture',before,[forged],'standard'),/anchors/);
});

test('route assertion retains measured lanes after source serialization', () => {
  const source=stackedWorkflow(), before=compileWorkflow({workflow:source});
  assert.equal(before.ok,true,before.error);
  const captured=captureWorkflowLayout(source);
  assert.equal(compileWorkflow({workflow:captured}).svg,before.svg,'capturing a policy changes no current geometry');
  captured.edges[0].via=before.receipt.edges[0].points.slice(1,-1);
  const after=compileWorkflow({workflow:JSON.parse(JSON.stringify(captured))});
  assert.equal(after.ok,true,after.error);
  assert.deepEqual(after.receipt.nodes,before.receipt.nodes,'an unconnected node cannot drift when a route is pinned');
  assert.deepEqual(after.receipt.viewBox,before.receipt.viewBox);
  assert.equal(after.svg,before.svg);
  assert.equal(source.layout,undefined,'capture cannot mutate the source');
  assert.deepEqual(captureWorkflowLayout(captured),captured,'later edits retain the recorded policy');
});

test('unannotated inputs retain their original fixed and absolute interpretations', () => {
  const source=stackedWorkflow(), before=compileWorkflow({workflow:source});
  source.edges[0].via=before.receipt.edges[0].points.slice(1,-1);
  const legacy=compileWorkflow({workflow:source});
  assert.equal(legacy.ok,false,'existing absolute pins keep their historical coordinate system');
  assert.match(legacy.error,/orthogonal/);
  const v1=stackedWorkflow();v1.schema_version=1;v1.layout={contract:'readable-v2',lanes:'independent',sizing:'adaptive'};
  assert.equal(compileWorkflow({workflow:v1}).ok,false,'v2 policy cannot silently migrate v1');
});

test('binding edits preserve source content and cannot replace endpoints', t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-model-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const input=path.join(dir,'source.json'),html=path.join(dir,'diagram.html'),source=architecture();
  fs.writeFileSync(input,JSON.stringify(source));
  execFileSync(process.execPath,[path.join(root,'archify/renderers/architecture/render-architecture.mjs'),input,html]);
  const scene=readEditScene(fs.readFileSync(html)),edge=scene.edges[0];
  assert.ok(edge.labelAnchor?.every(Number.isFinite));
  const command={key:edge.key,field:'labelAt',value:[edge.labelAnchor[0],edge.labelAnchor[1]-16]};
  const edited=applyConnectionEdit(source,'architecture',scene,command);
  assert.deepEqual(edited.components,source.components);
  assert.deepEqual(edited.connections[1],source.connections[1]);
  assert.deepEqual(edited.connections.map(e=>[e.id,e.from,e.to,e.label]),source.connections.map(e=>[e.id,e.from,e.to,e.label]));
  const moved=structuredClone(edge.points);moved[0][0]+=4;
  assert.throws(()=>applyConnectionEdit(source,'architecture',scene,{key:edge.key,field:'via',value:moved}),/anchors/);
  assert.throws(()=>applyConnectionEdit(source,'architecture',scene,{key:edge.key,field:'from',value:'c'}),/Only route/);
  assert.throws(()=>applyConnectionEdit(source,'architecture',scene,{key:edge.key,field:'labelAt',value:[NaN,0]}),/finite/);
  const drift=structuredClone(scene);drift.nodes.at(-1).box.y+=20;
  assert.throws(()=>checkEditScope(source,'architecture',scene,drift,command),/move a node/);
  const [a,b]=edge.points, detour=[a,[a[0]+24,a[1]],[a[0]+24,a[1]+30],[b[0]-24,b[1]+30],[b[0]-24,b[1]],b];
  assert.throws(()=>checkEditScope(source,'architecture',scene,scene,{key:edge.key,field:'via',value:detour}),/retain the requested route/);
});

async function post(editor, operation, command={}, overrides={}) {
  const state=editor.state();
  const response=await fetch(new URL('/edit/'+operation,editor.url),{method:'POST',headers:{'Content-Type':'application/json',Origin:new URL(editor.url).origin,'X-Archify-Edit-Token':state.token,...overrides},body:JSON.stringify({revision:state.revision,...command})});
  return { status:response.status, body:await response.json() };
}

test('native linked pages retain navigation on a separate read-only origin', async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-links-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const source=architecture();source.components[0].href='artifact.html';
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html');
  const child='<!doctype html><html><body><a href="diagram.html">Back</a></body></html>';
  fs.writeFileSync(input,JSON.stringify(source));
  fs.writeFileSync(path.join(dir,'artifact.html'),child);
  fs.writeFileSync(path.join(dir,'private.html'),'unrelated');
  const editor=await startEditor({type:'architecture',input,output,open:false,debounceMs:5,pollMs:20});
  t.after(()=>editor.stop({force:true}));
  assert.equal(new URL(editor.url).pathname,'/diagram.html');
  assert.match(await (await fetch(editor.url)).text(),/archify-edit-data/);
  const redirected=await fetch(new URL('/artifact.html',editor.url),{redirect:'manual'});
  assert.equal(redirected.status,302);
  const childUrl=redirected.headers.get('location');
  assert.notEqual(new URL(childUrl).origin,new URL(editor.url).origin,'linked HTML cannot read the edit token');
  assert.equal(await (await fetch(childUrl)).text(),child);
  const parent=await fetch(new URL('/diagram.html?from=artifact.html',childUrl),{redirect:'manual'});
  assert.equal(parent.headers.get('location'),editor.url+'?from=artifact.html');
  for(const origin of [editor.url,childUrl]) {
    assert.equal((await fetch(new URL('/private.html',origin))).status,404);
  }
  await editor.stop();
});

test('native session only accepts explicit batch saves and keeps failures concise', async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-session-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html'),original=JSON.stringify(architecture());
  fs.writeFileSync(input,original);
  const editor=await startEditor({type:'architecture',input,output,open:false,debounceMs:5,pollMs:20});
  t.after(()=>editor.stop({force:true}));
  const page=await (await fetch(editor.url)).text();assert.match(page,/archify-edit-data/);
  const rejected=await post(editor,'connect',{edits:[],connection:{from:'a',to:'c',fromSide:'right',toSide:'left',label:'Busy'}});
  assert.equal(rejected.status,409);assert.match(rejected.body.error,/cannot fit/);
  assert.equal(editor.state().scene.edges.length,2);assert.equal(editor.state().revision,0);
  const first=editor.state().scene.edges[0],move={key:first.key,field:'labelAt',value:[first.labelAnchor[0],first.labelAnchor[1]-16]};
  const batch={edits:[move]};
  assert.equal((await post(editor,'save',batch,{'X-Archify-Edit-Token':'wrong'})).status,403);
  assert.equal((await post(editor,'save',batch,{Origin:'https://example.com'})).status,403);
  assert.equal((await post(editor,'apply',move)).status,409,'individual drags are not compilation endpoints');
  assert.equal(fs.readFileSync(input,'utf8'),original);assert.equal(fs.existsSync(output),false);
  const invalid=await post(editor,'save',{edits:[{...move,value:[NaN,0]}]});assert.equal(invalid.status,409);
  assert.match(invalid.body.error,/draft is kept/);assert.ok(invalid.body.error.length<250);assert.ok(invalid.body.details);
  fs.writeFileSync(input,original+'\n');
  const conflicted=await post(editor,'save',batch);assert.equal(conflicted.status,409);assert.match(conflicted.body.error,/changed elsewhere/);
  assert.equal(fs.readFileSync(input,'utf8'),original+'\n');
  await editor.stop();
});

test('split request chunks preserve a multibyte connection label', async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-utf8-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html');
  const source=architecture();source.meta.viewBox=[760,480];
  const original=JSON.stringify(source);fs.writeFileSync(input,original);
  const editor=await startEditor({type:'architecture',input,output,open:false});
  t.after(()=>editor.stop({force:true}));
  const label='回查 · 状态',body=Buffer.from(JSON.stringify({revision:0,edits:[],connection:{from:'c',to:'a',fromSide:'top',toSide:'top',label}}));
  const split=body.indexOf(Buffer.from('回'))+1;
  const response=await new Promise((resolve,reject)=>{
    const req=request(new URL('/edit/connect',editor.url),{method:'POST',headers:{Origin:new URL(editor.url).origin,'Content-Type':'application/json','X-Archify-Edit-Token':editor.state().token}},res=>{
      res.setEncoding('utf8');let text='';res.on('data',part=>{text+=part;});res.on('end',()=>resolve({status:res.statusCode,body:JSON.parse(text)}));res.on('error',reject);
    });
    req.on('error',reject);req.write(body.subarray(0,split));setTimeout(()=>req.end(body.subarray(split)),30);
  });
  assert.equal(response.status,200,response.body.details);
  assert.equal(response.body.edge.label,label,'a label must not depend on network chunk boundaries');
  assert.equal(fs.readFileSync(input,'utf8'),original);
  assert.equal(editor.state().revision,0);
  await editor.stop();
});

test('unchanged relationships cannot bridge an edit scope to a distant change', () => {
  const source={connections:[{id:'edit',from:'a',to:'b'},{id:'bridge',from:'a',to:'c'},{id:'far',from:'c',to:'d'}]};
  const before={viewBox:'0 0 1400 500',nodes:[],frames:[],edges:[
    {key:'edit',id:'edit',from:'a',to:'b',label:'',points:[[100,100],[300,100]]},
    {key:'bridge',id:'bridge',from:'a',to:'c',label:'',points:[[100,110],[150,110],[150,300],[1000,300]]},
    {key:'far',id:'far',from:'c',to:'d',label:'',points:[[1000,310],[960,310],[960,400],[1200,400]]}]};
  const after=structuredClone(before);
  const renamed=structuredClone(before);renamed.edges[0].id='different';
  assert.throws(()=>checkEditScope(source,'architecture',before,renamed,[]),/changed the diagram relationships/,'stable relationship IDs belong to the preserved graph');
  after.edges[0].points=[[100,100],[140,100],[140,150],[260,150],[260,100],[300,100]];
  after.edges[2].points[1][0]=940;after.edges[2].points[2][0]=940;
  assert.throws(()=>checkEditScope(source,'architecture',before,after,{key:'edit',field:'via',value:after.edges[0].points}),/outside the visual/);
  assert.deepEqual(checkEditScope(source,'architecture',before,after,[{key:'edit',field:'via',value:after.edges[0].points},{key:'far',field:'via',value:after.edges[2].points}]).changed,['edit','far'],'a batch can explicitly adjust separate regions');
});

for (const existing of [false,true]) test(`failed save restores source and ${existing?'existing':'absent'} HTML and provenance`, async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-restore-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html'),delivery=path.join(dir,'diagram.delivery.json');
  const original=JSON.stringify(architecture());fs.writeFileSync(input,original);
  const failureMessage='Architecture layout validation failed: [clean-flow/edge-through-node] connection crosses component "cache" on segment 2';
  let oldHtml=null,oldDelivery=null;
  if(existing) {
    execFileSync(process.execPath,[path.join(root,'archify/renderers/architecture/render-architecture.mjs'),input,output]);
    oldHtml=fs.readFileSync(output);oldDelivery=Buffer.from('{"receiptId":"previous"}');fs.writeFileSync(delivery,oldDelivery);
  }
  const editor=await startEditor({type:'architecture',input,output,open:false,debounceMs:5,pollMs:20,
    finalize:async()=>{
      const html=Buffer.from('failed candidate');fs.writeFileSync(output,html);fs.writeFileSync(delivery,'{"receiptId":"candidate"}');
      return {receipt:{ok:false,failedStage:'browser-check',diagnostics:[{message:failureMessage}],stages:{deliver:{receipt:{receiptId:'candidate',artifact:{sha256:createHash('sha256').update(html).digest('hex')}}}}}};
    }});
  t.after(()=>editor.stop({force:true}));
  const edge=editor.state().scene.edges[0];
  const saved=await post(editor,'save',{edits:[{key:edge.key,field:'labelAt',value:[edge.labelAnchor[0],edge.labelAnchor[1]-16]}]});
  assert.equal(saved.status,409);assert.equal(saved.body.details,failureMessage);
  assert.match(saved.body.error,/generated route crosses cache/);assert.doesNotMatch(saved.body.error,/layout validation|clean-flow/);
  assert.equal(fs.readFileSync(input,'utf8'),original);
  if(existing) {assert.deepEqual(fs.readFileSync(output),oldHtml);assert.deepEqual(fs.readFileSync(delivery),oldDelivery);}
  else {assert.equal(fs.existsSync(output),false);assert.equal(fs.existsSync(delivery),false);}
  assert.equal(editor.state().revision,0,'a failed save cannot accept the candidate');
  await editor.stop();
});

for(const changedElsewhere of [false,true])test(`unidentifiable output ${changedElsewhere?'preserves external source changes':'cannot prevent source restoration'}`, async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-incomplete-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const input=path.join(dir,'source.json'),output=path.join(dir,'diagram.html');
  const original=JSON.stringify(architecture());fs.writeFileSync(input,original);
  const external=original+'\n';
  const unexpected='output changed without a delivery receipt';
  let attempts=0;
  const editor=await startEditor({type:'architecture',input,output,open:false,finalize:async()=>{
    if(++attempts===1){execFileSync(process.execPath,[path.join(root,'archify/renderers/architecture/render-architecture.mjs'),input,output]);return {receipt:{ok:true}};}
    fs.writeFileSync(output,unexpected);
    if(changedElsewhere)fs.writeFileSync(input,external);
    throw Error('Generation interrupted');
  }});
  t.after(()=>editor.stop({force:true}));
  const initial=editor.state().scene.edges[0];
  assert.equal((await post(editor,'save',{edits:[{key:initial.key,field:'labelAt',value:[initial.labelAnchor[0],initial.labelAnchor[1]-2]}]})).status,200);
  const lastSaved=fs.readFileSync(input,'utf8');
  const edge=editor.state().scene.edges[0];
  const response=await post(editor,'save',{edits:[{key:edge.key,field:'labelAt',value:[edge.labelAnchor[0],edge.labelAnchor[1]-16]}]});
  assert.equal(response.status,409);
  assert.match(response.body.details,/Generation interrupted.*Restoration incomplete/s);
  assert.equal(fs.readFileSync(input,'utf8'),changedElsewhere?external:lastSaved,'source recovery is independent of output recovery and preserves external edits');
  assert.equal(fs.readFileSync(output,'utf8'),unexpected,'unidentified output is preserved for inspection');
  assert.equal(editor.state().revision,1);
  assert.deepEqual(editor.state().scene.edges[0],edge);
  const recovery=response.body.details.match(/Recovery copy: (.+)$/)[1];
  assert.equal(fs.readFileSync(recovery,'utf8'),lastSaved,'recovery restores the latest accepted source rather than the session starting point');
  await editor.stop();
});

test('official geometry families bind explicit label drafts to the native source', async t => {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'archify-edit-families-'));
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  const examples={architecture:'web-app',workflow:'agent-tool-call',dataflow:'product-analytics',class:'payments',erd:'orders'};
  for(const [type,name] of Object.entries(examples)) {
    const original=path.join(root,`archify/examples/${name}.${type}.json`),input=path.join(dir,type+'.json'),output=path.join(dir,type+'.html');
    const render=path.join(root,`archify/renderers/${type}/render-${type}.mjs`);
    execFileSync(process.execPath,[render,original,output]);
    const before=readEditScene(fs.readFileSync(output)),edge=before.edges.find(e=>e.labelAnchor);
    assert.ok(edge,`${type} label binding`);
    const command={key:edge.key,field:'labelAt',value:[edge.labelAnchor[0],edge.labelAnchor[1]-2]};
    fs.writeFileSync(input,JSON.stringify(applyConnectionEdit(JSON.parse(fs.readFileSync(original)),type,before,command)));
    execFileSync(process.execPath,[render,input,output]);
    const after=readEditScene(fs.readFileSync(output));
    checkEditScope(JSON.parse(fs.readFileSync(original)),type,before,after,[command]);
  }
});

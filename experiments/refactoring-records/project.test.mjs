import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {project,hash} from './project.mjs';
import {scanHtml} from '../../archify/explainer/check.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(dir,'../..');
const bytes=fs.readFileSync(path.join(dir,'fixtures/refactoring-toy-example-commit-expected.json'));
const original=JSON.parse(bytes), manifest=JSON.parse(fs.readFileSync(path.join(dir,'fixtures/identity.json')));
const encode=x=>Buffer.from(JSON.stringify(x));
const changed=fn=>{const x=structuredClone(original);fn(x.commits[0].refactorings,x);return x;};
function prepared(result){const blocks=result.document.panels[0].blocks;return {map:blocks.find(x=>x.id==='refactoring-map'),steps:blocks.find(x=>x.id==='records')};}

test('complete fixture matches independent four-record / eight-location oracle',()=>{
  assert.equal(bytes.length,3180);assert.equal(hash(bytes),'abb1a93274946a7db8bd81de10feb925a3fc5a8107788390e44766028e3a381d');
  const projected=project(bytes,manifest);const {ledger}=projected;
  assert.deepEqual(ledger.count,{commits:1,records:4,locations:8,projected:4,unsupported:0,before:4,after:2});
  assert.deepEqual(ledger.originalReport,original);
  const oracle=[['Labrador','METHOD_DECLARATION',7,9,2,3],['Poodle','METHOD_DECLARATION',7,9,2,3],['Labrador','FIELD_DECLARATION',5,5,14,21],['Poodle','FIELD_DECLARATION',5,5,14,21]];
  ledger.records.forEach((record,i)=>{
    const [animal,kind,sl,el,sc,ec]=oracle[i];const left=record.raw.leftSideLocations[0],right=record.raw.rightSideLocations[0];
    assert.deepEqual([left.filePath,left.codeElementType,left.startLine,left.endLine,left.startColumn,left.endColumn],[`src/org/animals/${animal}.java`,kind,sl,el,sc,ec]);
    assert.deepEqual([right.filePath,right.codeElementType,right.startLine,right.endLine,right.startColumn,right.endColumn],['src/org/animals/Dog.java',kind,sl,el,sc,ec]);
    assert.equal(record.raw.type,i<2?'Pull Up Method':'Pull Up Attribute');
    assert.equal(left.description,i<2?'original method declaration':'original attribute declaration');
    assert.equal(right.description,i<2?'pulled up method declaration':'pulled up attribute declaration');
    assert.equal(left.codeElement,i<2?'public getAge() : int':'private age : int');assert.equal(right.codeElement,left.codeElement);
    assert.equal(ledger.edges[i].id,`record-${i}`);
  });
  assert.equal(ledger.edges[0].to,ledger.edges[1].to);assert.equal(ledger.edges[2].to,ledger.edges[3].to);assert.notEqual(ledger.edges[0].to,ledger.edges[2].to);
  assert.equal(ledger.endpoints.filter(x=>x.side==='before').every(x=>x.revision===manifest.base),true);
  prepared(projected).steps.items.forEach((step,i)=>{
    for(const endpointId of ledger.records[i].endpoints) {const node=ledger.endpoints.find(n=>n.id===endpointId);assert.ok(step.detail.includes(`[](source:${node.sourceId})`),`R${i} must cite each side, including a shared target`);}
  });
});

test('same codeElement at different paths or full ranges remains distinct; duplicate occurrences retain independent edges',()=>{
  const input=changed(records=>{
    const duplicate=structuredClone(records[0]);records.push(duplicate);
    for(const [key,value] of [['filePath','another/Labrador.java'],['startColumn',1],['endColumn',4],['startLine',6],['endLine',10]]){
      const r=structuredClone(records[0]);r.leftSideLocations[0][key]=value;records.push(r);
    }
  });
  const {ledger}=project(encode(input));
  assert.equal(ledger.records.length,10);assert.equal(ledger.edges.length,10);
  assert.equal(ledger.edges[0].from,ledger.edges[4].from);assert.notEqual(ledger.edges[0].id,ledger.edges[4].id);
  assert.equal(new Set(ledger.edges.slice(5).map(e=>e.from)).size,5);
  ledger.edges.slice(5).forEach(e=>assert.notEqual(e.from,ledger.edges[0].from));
});

test('unsupported type, zero/multiple endpoints and multiple commits preserve all fields without a fabricated diagram',()=>{
  for(const mutate of [r=>{r.type='Unknown move';r.extra={retained:true};},r=>{r.leftSideLocations=[];},r=>{r.rightSideLocations.push(structuredClone(r.rightSideLocations[0]));}]){
    const x=changed(records=>{records.splice(1);mutate(records[0]);});
    const result=project(encode(x));assert.deepEqual(result.ledger.originalReport,x);assert.deepEqual(result.ledger.records[0].raw,x.commits[0].refactorings[0]);
    assert.equal(result.ledger.count.unsupported,1);assert.equal(prepared(result).map,undefined);assert.equal(prepared(result).steps.items[0].target,undefined);
  }
  const x=structuredClone(original);x.commits.push(structuredClone(x.commits[0]));const result=project(encode(x));
  assert.deepEqual(result.ledger.originalReport,x);assert.equal(result.ledger.records.length,8);assert.equal(result.ledger.count.unsupported,8);assert.equal(prepared(result).map,undefined);
  assert.match(result.summary,/0 条已投影/);
});

test('absent base keeps coordinates and explicit unknown revision, with only report-head URLs',()=>{
  const result=project(bytes);const before=result.ledger.endpoints.filter(n=>n.side==='before');
  assert.equal(before.length,4);assert.equal(before.every(n=>n.revision===null && !n.sourceId),true);
  assert.equal(result.document.sources.length,2);
  result.document.sources.forEach(s=>{assert.match(s.url,new RegExp(`/blob/${manifest.head}/`));assert.deepEqual(Object.keys(s),['id','title','url']);});
  assert.match(prepared(result).steps.items[0].detail,/before · 版本未知/);assert.match(prepared(result).steps.items[0].detail,/L7–9 C2–3/);
});

test('manifest mismatches and malformed required input fail with meaningful diagnostics',()=>{
  for(const key of ['inputSha256','repository','head']) assert.throws(()=>project(bytes,{...manifest,[key]:'wrong'}),new RegExp(`manifest.${key} does not match input`));
  assert.throws(()=>project(bytes,{...manifest,base:'main'}),/manifest.base must be/);
  assert.throws(()=>project(Buffer.from('{broken')),/invalid JSON/);
  assert.throws(()=>project(Buffer.from('{}')),/input.commits must be an array/);
  const invalid=changed(r=>{delete r[0].leftSideLocations;});assert.throws(()=>project(encode(invalid)),/leftSideLocations must be an array/);
  const empty=project(encode({commits:[]}));assert.equal(empty.ledger.count.records,0);assert.equal(prepared(empty).map,undefined);
});

test('actual offline CLI and public finalize preserve bytes and bind each record to its exact edge',t=>{
  const out=fs.mkdtempSync(path.join(os.tmpdir(),'archify-refactoring-records-test-'));t.after(()=>fs.rmSync(out,{recursive:true,force:true}));
  const run=args=>spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024,env:{...process.env,ARCHIFY_UPDATE_CHECK_DISABLED:'1'}});
  const projected=run([path.join(dir,'project.mjs'),path.join(dir,'fixtures/refactoring-toy-example-commit-expected.json'),out,path.join(dir,'fixtures/identity.json')]);assert.equal(projected.status,0,projected.stderr);
  assert.deepEqual(fs.readFileSync(path.join(out,'input.json')),bytes);
  const output=path.join(out,'index.html');const finalized=run(['archify/bin/archify.mjs','finalize','explainer',path.join(out,'explainer.json'),output,'--quality','standard','--json']);assert.equal(finalized.status,0,finalized.stdout+finalized.stderr);
  const receipt=JSON.parse(finalized.stdout);assert.equal(receipt.ok,true);assert.deepEqual(receipt.gates,{validate:'pass',deliver:'pass',check:'pass','browser-check':'not-run'});
  const html=fs.readFileSync(output,'utf8');const bundle=JSON.parse(scanHtml(html).scripts.find(x=>x.attrs.id==='archify-explainer-prepared').text);
  const map=bundle.document.panels[0].blocks.find(b=>b.id==='refactoring-map');const steps=bundle.document.panels[0].blocks.find(b=>b.id==='records');
  assert.equal(map.spec.connections.length,4);
  steps.items.forEach((s,i)=>{assert.deepEqual(s.target,{diagram:'refactoring-map',edges:[`record-${i}`]});assert.equal(map.spec.connections.filter(e=>e.id===s.target.edges[0]).length,1);const links=scanHtml(html).elements.filter(e=>e.tag==='a' && e.attrs['data-diagram-link']==='refactoring-map');assert.equal(links.filter(e=>e.attrs['data-diagram-edges']===JSON.stringify([`record-${i}`])).length,1);});
  assert.equal(html.includes(root),false);
});

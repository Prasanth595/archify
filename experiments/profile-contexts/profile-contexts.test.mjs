import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build, folded, flatten, model, ROOT } from './generate.mjs';
import { parseInline } from '../../archify/explainer/inline.mjs';

// Independent constant oracle transcribed from all ten source lines / five JSON slots.
// These expectations do not call the aggregation or flatten implementation.
const rawOracle={
 'a':[0,9,[1,3,4,5,6,7,8,9,10]],'a;a':[1,1,[1]],'b':[0,1,[2]],'b;b':[1,1,[2]],
 'a;b':[1,8,[3,4,5,6,7,8,9,10]],'a;b;a':[0,7,[4,5,6,7,8,9,10]],
 'a;b;a;b':[2,5,[4,6,7,8,10]],'a;b;a;c':[2,2,[5,9]],
 'a;b;a;b;a':[0,1,[6]],'a;b;a;b;a;b':[1,1,[6]],'a;b;a;b;c':[2,2,[7,10]],
};
const flatOracle={'a':[1,9,[1,3,4,5,6,7,8,9,10]],'b':[1,1,[2]],'a;b':[4,8,[3,4,5,6,7,8,9,10]],'a;b;c':[4,4,[5,7,9,10]]};
const jsonOracle={'0':[0,14,[1,2,3,4,5]],'0;1':[5,14,[1,2,3,4,5]],'0;1;2':[5,5,[1,2,4]],'0;1;3':[4,4,[3]]};
function records(m){return Object.fromEntries(m.contexts.map(c=>[c.prefix.join(';'),[c.self,c.total,c.rows.map(id=>Number(id.slice(1)))]]));}
function frames(m){return Object.fromEntries(m.frames.map(f=>[f.key,[f.self,f.total]]));}
const b=build(), l=b.ledger;

test('complete fixtures preserve pinned bytes, source positions, repeats and units',()=>{
 assert.deepEqual(b.source.map(s=>s.bytes),[96,458,1067]);
 assert.equal(l.rawOccurrences.length,10);assert.equal(l.jsonOccurrences.length,5);
 assert.deepEqual(l.rawOccurrences.map(o=>o.source.line),[1,2,3,4,5,6,7,8,9,10]);
 assert.equal(l.rawOccurrences[3].literal,'a;b;a;b 1');assert.equal(l.rawOccurrences[7].literal,'a;b;a;b 1');
 assert.notEqual(l.rawOccurrences[3].id,l.rawOccurrences[7].id);
 assert.deepEqual(l.jsonOccurrences.map(o=>o.weight),[1,1,4,3,5]);
 assert.equal(l.raw.unit,'unknown');assert.equal(l.json.unit,'seconds');
 for(const [i,o]of l.jsonOccurrences.entries())assert.deepEqual(o.source,{samplesLine:11,weightsLine:12,samplePointer:`/profiles/0/samples/${i}`,weightPointer:`/profiles/0/weights/${i}`});
 assert.deepEqual(l.jsonOccurrences[0].stack,l.jsonOccurrences[1].stack);assert.notEqual(l.jsonOccurrences[0].id,l.jsonOccurrences[1].id);
 const lines=b.source[1].text.split('\n');assert.match(lines[10],/"samples":/);assert.match(lines[11],/"weights":/);
 const snippets=b.document.panels.flatMap(p=>p.blocks).filter(v=>v.type==='snippet');
 assert.equal(snippets.find(v=>v.id==='original-raw').text,b.source[0].text);
 assert.equal(snippets.find(v=>v.id==='original-json').text,b.source[1].text);
 assert.equal(snippets.find(v=>v.id==='original-license').text,b.source[2].text);
});

test('all raw context values and Frame aggregates match independent constants',()=>{
 assert.deepEqual(records(l.raw),rawOracle);assert.equal(l.raw.totalWeight,10);
 assert.deepEqual(Object.fromEntries(l.raw.contexts.map(c=>[c.prefix.join(';'),c.selfRows])),{'a':[],'a;a':['R01'],'b':[],'b;b':['R02'],'a;b':['R03'],'a;b;a':[],'a;b;a;b':['R04','R08'],'a;b;a;c':['R05','R09'],'a;b;a;b;a':[],'a;b;a;b;a;b':['R06'],'a;b;a;b;c':['R07','R10']});
 assert.deepEqual(frames(l.raw),{a:[1,9],b:[5,9],c:[4,4]});
 assert.equal(l.raw.contexts.filter(c=>c.prefix.at(-1)==='a').reduce((s,c)=>s+c.total,0),18);
 assert.equal(l.raw.frames.reduce((s,f)=>s+f.total,0),22);
 assert.deepEqual(l.raw.frames.find(f=>f.key==='a').rows,['R01','R03','R04','R05','R06','R07','R08','R09','R10']);
 for(const n of l.raw.contexts){const children=l.raw.contexts.filter(c=>c.prefix.length===n.prefix.length+1&&c.prefix.slice(0,-1).join(';')===n.prefix.join(';'));assert.equal(n.self+children.reduce((s,c)=>s+c.total,0),n.total);}
 assert.equal(l.raw.contexts.filter(n=>n.prefix.length===1).reduce((s,c)=>s+c.total,0),10);
});

test('event-based flatten retains every original row and null layers do not leave outer frames',()=>{
 assert.deepEqual(records(l.flat.model),flatOracle);
 assert.deepEqual(Object.fromEntries(l.flat.model.contexts.map(c=>[c.prefix.join(';'),c.selfRows])),{'a':['R01'],'b':['R02'],'a;b':['R03','R04','R06','R08'],'a;b;c':['R05','R07','R09','R10']});
 assert.deepEqual(l.flat.trace.map(t=>t.retained.join(';')),['a','b','a;b','a;b','a;b;c','a;b','a;b;c','a;b','a;b;c','a;b;c']);
 assert.deepEqual(l.flat.trace.map(t=>t.suppressed),[[2],[2],[],[3,4],[3],[3,4,5,6],[3,4],[3,4],[3],[3,4]]);
 assert.deepEqual(l.flat.trace.map(t=>t.interval),[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10]]);
 assert.deepEqual(frames(l.flat.model),{a:[1,9],b:[5,9],c:[4,4]});
 const atFour=l.flat.events.filter(e=>e.at===4);
 assert.deepEqual(atFour.map(e=>[e.action,e.frame,e.effect,e.active.join(';')]),[['close','b','suppressed: no leave','a;b'],['open','c','enter','a;b;c']]);
 // Event integration, computed by the implementation through delta time, must also match constants.
 const integrated=model(l.flat.model.eventIntervals.map((e,i)=>({...e,id:String(i),unit:'unknown'})),'event');
 assert.deepEqual(Object.fromEntries(integrated.contexts.map(c=>[c.prefix.join(';'),[c.self,c.total]])),Object.fromEntries(Object.entries(flatOracle).map(([p,[s,t]])=>[p,[s,t]])));
});

test('complete upstream four-line comment exposes why Frame overwrite is necessary',()=>{
 assert.equal(l.counterexample.text,'a 1\na;b;a 1\na;b;a;b;a 1\na;b;a 1\n');
 assert.deepEqual(records(l.counterexample.model),{'a':[1,4,[1,2,3,4]],'a;b':[3,3,[2,3,4]]});
 assert.deepEqual(frames(l.counterexample.model),{a:[4,4],b:[0,3]});
 assert.deepEqual(Object.fromEntries(l.counterexample.model.framesBeforeOverwrite.map(f=>[f.key,[f.self,f.total]])),{a:[1,4],b:[3,3]});
});

test('JSON uses frame indices, preserves all five occurrences and has unchanged nonrecursive flatten',()=>{
 assert.deepEqual(records(l.json),jsonOracle);assert.deepEqual(records(l.jsonFlat.model),jsonOracle);
 assert.deepEqual(frames(l.json),{'0':[0,14],'1':[5,14],'2':[5,5],'3':[4,4]});
 assert.equal(l.json.totalWeight,14);
 // Supplemental identity probe: two equal display names must not merge different frame indices.
 const sameName=model([{id:'X',stack:[0,1],weight:2,unit:'seconds'},{id:'Y',stack:[1],weight:3,unit:'seconds'}],'same-name',{0:'same',1:'same'});
 assert.deepEqual(frames(sameName),{'0':[0,2],'1':[5,5]});assert.equal(sameName.contexts.length,3);
 assert.deepEqual(flatten([{id:'X',stack:[0,1],weight:2,unit:'seconds'}],'same-flat',{0:'same',1:'same'}).trace[0].retained,[0,1]);
});

test('every complete prefix, contribution, detail and exact return has a real native target',()=>{
 const blocks=b.document.panels.flatMap(p=>p.blocks), all=new Map();
 for(const p of b.document.panels)all.set(p.id,p);
 for(const block of blocks){all.set(block.id,block);for(const item of block.rows??(block.type==='steps'?block.items:[])??[])all.set(item.id,item);}
 const diagrams=new Map(blocks.filter(v=>v.type==='diagram').map(v=>[v.id,v]));
 const texts=[];function collect(v){if(typeof v==='string')texts.push(v);else if(v&&typeof v==='object')Object.values(v).forEach(collect);}collect(b.document);
 for(const text of texts)for(const ref of parseInline(text).references){
  if(ref.kind==='block')assert.ok(all.has(ref.id),`missing block ${ref.id}`);
  if(ref.kind==='node'){assert.ok(diagrams.has(ref.diagram));assert.ok(diagrams.get(ref.diagram).spec.nodes.some(n=>n.id===ref.node));}
 }
 for(const [m,occurrences]of [[l.raw,l.rawOccurrences],[l.flat.model,l.rawOccurrences],[l.json,l.jsonOccurrences]]){
  const diagram=diagrams.get(`${m.namespace}-tree`);assert.equal(diagram.spec.nodes.length,m.contexts.length+1);
  for(const c of m.contexts){
   assert.equal(diagram.nodeBlocks[c.id],`contrib-${c.id}`);assert.equal(all.get(`contrib-${c.id}`).type,'prose');
   assert.deepEqual(all.get(`entry-${c.id}`).target,{diagram:diagram.id,node:c.id});
   for(const row of c.rows){
    const d=all.get(`detail-${c.id}-${row.toLowerCase()}`);assert.ok(d);
    assert.ok(d.cells[1].text.includes(`block:entry-${c.id}`));assert.ok(d.cells[1].text.includes(`node:${diagram.id}.${c.id}`));
    assert.ok(d.cells[0].text.includes(occurrences.find(o=>o.id===row).literal));
    assert.ok(all.get(`contrib-${c.id}`).text.includes(`block:${d.id}`));
   }
  }
 }
 assert.equal(l.raw.contexts.reduce((s,c)=>s+c.rows.length,0),38);
 const seven=l.raw.contexts.find(c=>c.prefix.join(';')==='a;b;a');assert.deepEqual(seven.rows,['R04','R05','R06','R07','R08','R09','R10']);
 const cMap=l.rawToFlat.filter(m=>m.prefix.at(-1)==='c');assert.equal(cMap.length,2);assert.deepEqual(cMap.map(m=>m.targets),[['flat-p04'],['flat-p04']]);
 assert.equal(new Set([...l.raw.contexts,...l.flat.model.contexts,...l.json.contexts].map(c=>c.id)).size,19);
});

test('generated public output is reproducible and excludes private absolute paths',()=>{
 for(const file of ['ledger.json','candidate.explainer.json','raw.tree.json','flat.tree.json','json.tree.json','baseline.html']){
  const text=fs.readFileSync(path.join(ROOT,'output',file),'utf8');assert.ok(!text.includes('/Users/')&&!text.includes('/private/')&&!text.includes('/tmp/'));
 }
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(ROOT,'output','ledger.json'))),l);
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(ROOT,'output','candidate.explainer.json'))),b.document);
});

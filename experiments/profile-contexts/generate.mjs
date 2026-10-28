import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

export const ROOT = path.dirname(fileURLToPath(import.meta.url));
export const SHA = 'fe804e6281cf847713448c2c3e0faec3e1f62b2d';
const upstream = `https://github.com/jlfwong/speedscope/blob/${SHA}/`;
const definitions = [
  ['recursion.txt','sample/profiles/stackcollapse/recursion.txt',96,'5e6da30ddbe1e66f4e8a326236f2c9016484c61a6a7022b60389d94920fc4a57'],
  ['simple-sampled.speedscope.json','sample/profiles/speedscope/0.1.2/simple-sampled.speedscope.json',458,'6a4508cd712ee7a1a80929009d4a1b212cadfafd30831722ae6f195601f8967c'],
  ['LICENSE-speedscope','LICENSE',1067,'6244b13e9bf25cfd42d81c939d6c535d932596e8c320050234f2c2ac5a6f36a0'],
];
export function inputs() {
  return definitions.map(([file,source,bytes,sha256]) => {
    const raw=fs.readFileSync(path.join(ROOT,'fixtures',file));
    if(raw.length!==bytes || createHash('sha256').update(raw).digest('hex')!==sha256) throw new Error(`Fixture mismatch: ${file}`);
    return {file,source,url:upstream+source,bytes,sha256,text:raw.toString('utf8')};
  });
}
export function folded(text, namespace='raw') {
  return text.trimEnd().split('\n').map((literal,i)=> {
    const match=/^(.+) (\d+)$/.exec(literal);
    if(!match) throw new Error('Only the pinned folded fixture shape is supported');
    return {id:`R${String(i+1).padStart(2,'0')}`,fixture:namespace,stack:match[1].split(';'),weight:Number(match[2]),unit:'unknown',source:{line:i+1},literal};
  });
}
export function sampled(text) {
  const data=JSON.parse(text), p=data.profiles[0];
  if(p.type!=='sampled'||p.samples.length!==p.weights.length) throw new Error('Expected paired sampled fixture');
  return p.samples.map((stack,i)=>({id:`J${String(i+1).padStart(2,'0')}`,fixture:'json',stack,weight:p.weights[i],unit:p.unit,source:{samplesLine:11,weightsLine:12,samplePointer:`/profiles/0/samples/${i}`,weightPointer:`/profiles/0/weights/${i}`},literal:JSON.stringify(stack),names:stack.map(f=>data.shared.frames[f].name)}));
}
const key=stack=>JSON.stringify(stack);
export function model(occurrences,namespace,names={}) {
  const contexts=new Map(), frames=new Map();
  const frame=f=> {if(!frames.has(f))frames.set(f,{key:f,name:names[f]??String(f),self:0,total:0,rows:[],selfRows:[]});return frames.get(f);};
  for(const occurrence of occurrences) {
    const {stack,weight,id}=occurrence;
    for(const f of new Set(stack)) {const v=frame(f);v.total+=weight;v.rows.push(id);}
    frame(stack.at(-1)).self+=weight;frame(stack.at(-1)).selfRows.push(id);
    for(let i=1;i<=stack.length;i++) {
      const prefix=stack.slice(0,i), k=key(prefix);
      if(!contexts.has(k)) contexts.set(k,{id:`${namespace}-p${String(contexts.size+1).padStart(2,'0')}`,prefix,self:0,total:0,rows:[],selfRows:[]});
      const node=contexts.get(k);node.total+=weight;node.rows.push(id);if(i===stack.length){node.self+=weight;node.selfRows.push(id);}
    }
  }
  return {namespace,unit:occurrences[0].unit,totalWeight:occurrences.reduce((s,o)=>s+o.weight,0),occurrenceCount:occurrences.length,contexts:[...contexts.values()],frames:[...frames.values()]};
}
// A bounded independent reconstruction of the pinned event contract, not an upstream execution.
// Close/open only at the previous/current path LCA; null layers never delete retained frames.
export function flatten(occurrences,namespace='flat',names={}) {
  const events=[], trace=[], active=[], layers=[], retained=new Set(), intervals=[];
  let previous=[], coordinate=0,lastValue=0;
  function tick(value) {
    if(value>lastValue && active.length) intervals.push({stack:[...active],weight:value-lastValue});
    lastValue=value;
  }
  function close(frame, prefix) {
    const kept=layers.pop();
    if(kept!==null) {tick(coordinate);active.pop();retained.delete(kept);}
    events.push({at:coordinate,action:'close',prefix,frame,effect:kept===null?'suppressed: no leave':'leave',active:[...active]});
  }
  for(const o of occurrences) {
    let lca=0;while(lca<previous.length&&lca<o.stack.length&&previous[lca]===o.stack[lca])lca++;
    for(let i=previous.length-1;i>=lca;i--)close(previous[i],previous.slice(0,i+1));
    for(let i=lca;i<o.stack.length;i++) {
      const f=o.stack[i], suppressed=retained.has(f);
      layers.push(suppressed?null:f);
      if(!suppressed){tick(coordinate);active.push(f);retained.add(f);}
      events.push({at:coordinate,action:'open',prefix:o.stack.slice(0,i+1),frame:f,effect:suppressed?'suppress: push null':'enter',active:[...active]});
    }
    trace.push({id:o.id,interval:[coordinate,coordinate+o.weight],original:[...o.stack],retained:[...active],suppressed:o.stack.map((f,i)=>o.stack.indexOf(f)<i?i+1:null).filter(x=>x!==null)});
    coordinate+=o.weight;previous=o.stack;
  }
  for(let i=previous.length-1;i>=0;i--)close(previous[i],previous.slice(0,i+1));
  const transformed=occurrences.map((o,i)=>({...o,stack:trace[i].retained}));
  const result=model(transformed,namespace,names), raw=model(occurrences,'original',names);
  result.framesBeforeOverwrite=result.frames;
  result.frames=structuredClone(raw.frames); // Pinned profile.ts explicitly preserves original Frame weights.
  result.frameWeightPolicy='original Frame self/total overwrite; context node weights stay flattened';
  // Event deltas must independently account for every output context weight.
  result.eventIntervals=intervals;
  return {model:result,occurrences:transformed,trace,events};
}
const prose=(id,text)=>({id,type:'prose',text});
const link=(label,id)=>`[${label}](block:${id})`;
const table=(id,labelColumn,columns,rows)=>({id,type:'comparison',labelColumn,columns,rows:rows.map(([id,label,...cells])=>({id,label,cells:cells.map(text=>({text:String(text)}))}))});
function label(stack,names={}){return stack.map(f=>names[f]??f).join(';');}
function tree(m,names={}) {
  const byKey=new Map(m.contexts.map(c=>[key(c.prefix),c.id]));
  return {schema_version:1,diagram_type:'tree',meta:{title:`${m.namespace} · 完整上下文`,locale:'zh-CN',subtitle:`node self / total · ${m.unit}`},layout:{direction:'down',nodeW:170,gapX:24,gapY:28},nodes:[{id:`${m.namespace}-root`,label:'技术 root',sublabel:`总权重 ${m.totalWeight} · 非函数`},...m.contexts.map(c=>({id:c.id,label:label(c.prefix,names),parent:c.prefix.length===1?`${m.namespace}-root`:byKey.get(key(c.prefix.slice(0,-1))),sublabel:`self ${c.self} / total ${c.total}`}))]};
}
function frameTable(m){return table(`${m.namespace}-frames`,'Frame key / name',['self / 原始 leaf 记录','total / 去重原始记录'],m.frames.map((f,i)=>[`${m.namespace}-frame-${i}`,`${f.key} / ${f.name}`,`${f.self} / ${f.selfRows.join(', ')||'无'}`,`${f.total} / ${f.rows.join(', ')}`]));}
function panel(id,title,blocks,span=12){return {id,title,span,blocks};}
export function build() {
  const source=inputs(), rawOccurrences=folded(source[0].text), jsonOccurrences=sampled(source[1].text);
  const names=Object.fromEntries(JSON.parse(source[1].text).shared.frames.map((f,i)=>[i,f.name]));
  const raw=model(rawOccurrences,'raw'),flat=flatten(rawOccurrences),json=model(jsonOccurrences,'json',names), jsonFlat=flatten(jsonOccurrences,'json-flat',names);
  const counterText='a 1\na;b;a 1\na;b;a;b;a 1\na;b;a 1\n', counter=flatten(folded(counterText,'comment'),'comment-flat');
  const ledger={provenance:{upstreamSHA:SHA,sourceType:'complete upstream fixtures; no upstream execution',sources:source.map(({text,...s})=>s)},rawOccurrences,jsonOccurrences,raw,flat,json,jsonFlat,counterexample:{kind:'complete four-line source comment, not a captured fixture',text:counterText,...counter},rawToFlat:raw.contexts.map(c=>({raw:c.id,prefix:c.prefix,targets:[...new Set(rawOccurrences.filter(o=>c.rows.includes(o.id)).map(o=>{const retained=c.prefix.filter((f,i)=>c.prefix.indexOf(f)===i);return flat.model.contexts.find(n=>key(n.prefix)===key(retained))?.id;}))].filter(Boolean)}))};
  const sources=[{id:'folded-source',title:'speedscope 完整 folded fixture（固定 SHA；URL-only provenance）',url:source[0].url},{id:'json-source',title:'speedscope 完整 sampled fixture（固定 SHA；URL-only provenance）',url:source[1].url},{id:'rule-source',title:'profile.ts 递归折叠与 Frame overwrite（规则阅读；未执行上游）',url:upstream+'src/lib/profile.ts#L222-L330'},{id:'license-source',title:'Jamie Wong · 完整 MIT License',url:source[2].url}];
  const document={schema_version:1,diagram_type:'explainer',meta:{id:'profile-contexts',title:'同一个 a，为什么这里是 7，函数表却是 9？',locale:'zh-CN',style:'clean'},answer:{summary:`递归上下文 a;b;a 的 node total 是 ${raw.contexts.find(c=>label(c.prefix)==='a;b;a').total}；函数 a 的 total 是 ${raw.frames.find(f=>f.key==='a').total}。前者保留完整前缀，后者每条原始记录只计算一次 a。`,reasons:['上下文身份 = fixture namespace + 完整 frame key prefix；显示同名不会合并。','递归折叠改变节点 self，函数 Frame self/total 按上游规则保留。','完整原件、贡献记录、权重算式和固定返回入口一起保存。'],scope:'上游示例 fixture；非实测 workload；非调用次数；未运行 speedscope'},sources,panels:[]};
  const panels=document.panels;
  panels.push(panel('read-first','先读图，再核对原始贡献',[
    prose('navigation','preview 节点 hover / focus 后，“阅读这段”进入贡献账目；点击节点打开原生 Viewer。每个贡献明细返回同 prefix 的固定入口。Viewer 内后来选中的节点不会反向联动父页；关闭 Viewer 回到打开它的链接。'),
    prose('jump-index',`${link('完整 raw 图','raw-view')} · ${link('函数表','frame-view')} · ${link('递归折叠','flat-view')} · ${link('JSON 赋权','json-view')} · ${link('全量贡献与回链','raw-contributions')} · ${link('完整原件','originals')}`)
  ]));
  function view(m,occurrences,names,title) {
    const spec=tree(m,names), diagramId=`${m.namespace}-tree`;
    panels.push(panel(`${m.namespace}-view`,title,[{id:diagramId,type:'diagram',diagramType:'tree',spec,nodeBlocks:Object.fromEntries(m.contexts.map(c=>[c.id,`contrib-${c.id}`]))},prose(`${m.namespace}-note`,`${m.contexts.length} 个完整 prefix；${m.occurrenceCount} 条输入 occurrence；权重和 ${m.totalWeight}，unit=${m.unit}。技术 root 不计为函数。`)]));
  }
  view(raw,rawOccurrences,{},'01 · 原始递归树：11 个上下文都保留');
  panels.push(panel('frame-view','02 · 函数总计：每条记录对每个 Frame 去重',[frameTable(raw),prose('frame-warning',`a 的全部上下文 node total 相加 = ${raw.contexts.filter(c=>c.prefix.at(-1)==='a').reduce((n,c)=>n+c.total,0)}，不能当函数 a total。函数 totals 之和 = ${raw.frames.reduce((n,f)=>n+f.total,0)}，也不是互斥分母；一条记录可经过多个函数。`)]));
  view(flat.model,flat.occurrences,{},'03 · 递归折叠后：4 个上下文，Frame 总计仍来自原始栈');
  panels.push(panel('flatten-rules','折叠追踪：权重区间，不是时间戳',[table('flatten-trace','原始记录',['完整原栈 → 保留栈','区间 / 抑制层'],flat.trace.map(t=>[`trace-${t.id}`,t.id,`${label(t.original)} → ${label(t.retained)}`,`[${t.interval.join(', ')}) / ${t.suppressed.join(', ')||'无'}`])),frameTable(flat.model),prose('counter-intro','以下是上游 profile.ts 注释的完整四行反例，不是新采集记录。折叠 node a;b self=3，而函数 b self 仍为0。'),{id:'counter-source',type:'snippet',title:'完整四行注释反例',text:counterText},table('counter-weights','层次',['self / total'],[...counter.model.contexts.map((c,i)=>[`counter-node-${i}`,`node ${label(c.prefix)}`,`${c.self} / ${c.total}`]),...counter.model.frames.map((f,i)=>[`counter-frame-${i}`,`Frame ${f.name}`,`${f.self} / ${f.total}`])]),prose('rule-reference','规则见 [固定源码](source:rule-source)。完整 open/close/null-layer trace 在 output/ledger.json；按源码合同独立重建，未执行上游。')]));
  view(json,jsonOccurrences,names,'04 · JSON：5 条 occurrence，14 seconds 采样赋权');
  panels.push(panel('json-weights','frame index 保身份；相同栈仍是两条原始记录',[frameTable(json),prose('json-unit','J01 与 J02 同栈同权重，仍各自保留 source pointer。unit=seconds 表示采样赋权；不能解释为5次调用，也不能证明精确执行14秒。所有 samples 在原件第11行，weights在第12行。此 fixture 无递归，折叠结构与权重不变。')]));
  for(const [m,occurrences,frameNames] of [[raw,rawOccurrences,{}],[flat.model,flat.occurrences,{}],[json,jsonOccurrences,names]]) {
    const diagramId=`${m.namespace}-tree`;
    panels.push(panel(`${m.namespace}-entries`,`${m.namespace} · 每个 prefix 的固定阅读入口`,[{id:`${m.namespace}-entry-list`,type:'steps',items:m.contexts.map(c=>({id:`entry-${c.id}`,text:label(c.prefix,frameNames),target:{diagram:diagramId,node:c.id},detail:`self ${c.self} / total ${c.total} · ${link('全部贡献',`contrib-${c.id}`)}`}))}]));
    panels.push(panel(`${m.namespace}-contributions`,`${m.namespace} · 完整贡献账目`,m.contexts.map(c=>prose(`contrib-${c.id}`,`**${label(c.prefix,frameNames)}** · node self ${c.self} / total ${c.total}。self 来源 ${c.selfRows.join(', ')||'无'}。全部 total 贡献：`+c.rows.map(id=>link(`${id} × ${occurrences.find(o=>o.id===id).weight}`,`detail-${c.id}-${id.toLowerCase()}`)).join(' + ')+` = ${c.total} ${m.unit}。${link('返回入口',`entry-${c.id}`)}`))));
    panels.push(panel(`${m.namespace}-details`,`${m.namespace} · 每对 prefix / occurrence 的完整返回链`,[table(`${m.namespace}-detail-table`,'记录归属',['完整原始记录 / 原位','固定返回'],m.contexts.flatMap(c=>c.rows.map(id=> {
      const o=occurrences.find(o=>o.id===id), original=(m.namespace==='json'?jsonOccurrences:rawOccurrences).find(o=>o.id===id);
      const location=m.namespace==='json'?`samples 第11行 ${original.source.samplePointer}；weights 第12行 ${original.source.weightPointer}`:`原始第${original.source.line}行`;
      return [`detail-${c.id}-${id.toLowerCase()}`,`${label(c.prefix,frameNames)} / ${id}`,`\`${original.literal}\` · weight=${o.weight} ${o.unit} · ${location}；${link('完整原件',m.namespace==='json'?'original-json':'original-raw')}`,`${link(`返回 ${label(c.prefix,frameNames)} 入口`,`entry-${c.id}`)} · [打开此精确 prefix](node:${diagramId}.${c.id})`];
    })))]));
  }
  const cRaw=raw.contexts.filter(c=>c.prefix.at(-1)==='c'),cFlat=flat.model.contexts.find(c=>c.prefix.at(-1)==='c');
  panels.push(panel('cross-mapping','两个 raw c 上下文汇合到一个 flat c',[prose('c-mapping',cRaw.map(c=>`[${label(c.prefix)}](node:raw-tree.${c.id})`).join(' 与 ')+` → [${label(cFlat.prefix)}](node:flat-tree.${cFlat.id})。这是两个不同上下文的折叠映射；raw 与 flat ID namespace 分开。`)]));
  panels.push(panel('originals','完整原件与字节指纹：下方为原 bytes 的派生展示',source.flatMap((s,i)=>[prose(`source-meta-${i}`,`${s.file} · ${s.bytes} bytes · SHA-256 \`${s.sha256}\` · [固定原件](source:${['folded-source','json-source','license-source'][i]})`),{id:['original-raw','original-json','original-license'][i],type:'snippet',title:`完整 ${s.file}（未裁剪）`,text:s.text}])));
  panels.push(panel('boundaries','证据边界',[prose('limits','本页由离线脚本从两份完整原件生成；并非通用 profiler/parser。URL 来源声明不等于 Archify Git excerpt 验证。静态固定回链不保存任意旧 DOM opener，不宣称全屏 Viewer 改选会联动父页。浏览器实图、键盘/指针闭环与 CI 状态另见 README；机器 gate 不等于人工视觉验收。')]));
  return {ledger,document,source,trees:{raw:tree(raw),flat:tree(flat.model),json:tree(json,names)}};
}
const escape=s=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export function generate() {
  const b=build();fs.mkdirSync(path.join(ROOT,'output'),{recursive:true});
  const write=(file,value)=>fs.writeFileSync(path.join(ROOT,'output',file),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
  write('ledger.json',b.ledger);write('candidate.explainer.json',b.document);for(const [name,spec]of Object.entries(b.trees))write(`${name}.tree.json`,spec);
  write('baseline.html',`<!doctype html><html lang="zh"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>完整原输入 baseline</title><style>body{font:17px/1.6 system-ui;max-width:1000px;margin:40px auto;padding:20px;color:#182236;background:#fafbfd}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#eef1f5;padding:20px}a{color:#124ec5}</style><h1>完整原输入 baseline</h1><p>两份上游 fixture 完整原文；未执行上游、未采集 workload。与候选使用同一原件。下方账目由独立离线算法派生，不是上游运行输出。</p>${b.source.map(s=>`<h2>${escape(s.file)}</h2><p>${s.bytes} bytes · SHA-256 ${s.sha256} · <a href="${s.url}">固定来源</a></p><pre>${escape(s.text)}</pre>`).join('')}<h2>派生完整账目</h2><pre>${escape(JSON.stringify({raw:b.ledger.raw,json:b.ledger.json,flattened:b.ledger.flat.model},null,2))}</pre></html>`);
  return b;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){generate();console.log('Generated complete ledger, 3 native Tree specs, Explainer candidate and original-text baseline.');}

import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';import {definitions} from './designs.mjs';
const out=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(out,'../..');
const runtime=JSON.parse(fs.readFileSync(path.join(out,'local-runtime.json'),'utf8'));
const versions=JSON.parse(fs.readFileSync(path.join(out,'versions.json'),'utf8'));
const read=(r,f)=>fs.readFileSync(path.join(runtime[r],f),'utf8').replace(/\r\n?/g,'\n');
const sha=s=>createHash('sha256').update(s).digest('hex');
function cite(r,file,token,scope){
 const lines=read(r,file).replace(/\n$/,'').split('\n');
 const start=scope?lines.findIndex(l=>l.includes(scope)&&!l.trim().startsWith('//')):0;
 if(start<0) throw Error('Missing source scope '+scope);
 let i=typeof token==='number'?token-1:lines.findIndex((l,j)=>j>=start&&l.includes(token)&&!l.trim().startsWith('//'));
 if(i<0) throw Error('Missing source anchor '+r+':'+file+' '+token);
 return {path:file,line:Math.max(1,i-1),end_line:Math.min(lines.length,i+8),label:'RTL · '+(typeof token==='number'?'接口连接':token).slice(0,40)};
}
const catalog=[];
for(const def of definitions){
 const folder=path.join(out,def.section,def.id);fs.mkdirSync(folder,{recursive:true});
 let d;
 if(def.reuse){
  d=JSON.parse(fs.readFileSync(path.resolve(repo,def.reuse),'utf8'));
 }else if(def.diagram){d=structuredClone(def.diagram);}
 else{
  const r=def.repository||'xiangshan';const file=def.file;
  const count=def.flow.length;
  const ns=def.flow.map((v,i)=>{const [label,token,kind='backend',role='逻辑步骤']=v;const ref=cite(r,file,token,def.scope);return {id:'n'+i,type:kind,label,sublabel:typeof token==='number'?'RTL 接口':token,tag:role,pos:[80,70+i*210],size:[300,92],sources:[ref]};});
  const structural=new Set(['bit-crypto','integer-region','float-region','vector-region','load-queue','dcache','coupled-l2','open-llc','llc-slice','float-divider','vector-fdiv-kernel','fmul-s0','fmul-s1','fmul-s2','dcache-arrays']).has(def.id);
  const edges=structural?[]:ns.slice(1).map((n,i)=>({id:def.id+'-step-'+i,from:'n'+i,to:n.id,label:def.edgeLabels?.[i]||'数据 / 控制',variant:'emphasis'}));
  if(structural){
   ns.forEach(n=>n.pos[0]=560);
   ns.push({id:'owner',type:'backend',label:'模块内部设计',sublabel:def.id,tag:'结构视图',pos:[80,70+Math.floor(count/2)*210],size:[300,92],sources:[cite(r,file,def.flow[0][1],def.scope)]});
   for(const n of ns.filter(n=>n.id!=='owner'))edges.push({id:def.id+'-owns-'+n.id,from:'owner',to:n.id,label:'结构角色',variant:'default'});
  }
  for(const [i,v] of (def.branches||[]).entries()){
    const [at,label,token,kind='database',direction='to']=v;
    ns.push({id:'b'+i,type:kind,label,sublabel:token,tag:'状态 / 支路',pos:[560,70+at*210],size:[300,92],sources:[cite(r,file,token)]});
    edges.push({id:def.id+'-branch-'+i,from:direction==='to'?'n'+at:'b'+i,to:direction==='to'?'b'+i:'n'+at,label:direction==='to'?'更新 / 查询':'提供状态',variant:direction==='to'?'dashed':'default'});
  }
  d={schema_version:1,diagram_type:'architecture',meta:{title:'昆明湖 V3 · '+def.title,locale:'zh-CN',quality_profile:'showcase',repository:versions.repositories[r],legend:{entries:{backend:{label:'数据通路 / 控制'},database:{label:'内部状态'},messagebus:{label:'队列 / 仲裁'},security:{label:'检查 / 恢复'},external:{label:'输入输出接口'}}}},components:ns,connections:edges,cards:[
   {dot:'cyan',title:'设计职责',items:def.notes},
   {dot:'emerald',title:'图中语义',items:['节点标注实际 RTL 信号或子模块；标记为“逻辑步骤”的框是组合/寄存器操作分组，并非额外硬件实例。',structural?'本页按模块结构角色展开，连线表示组成/控制关联；并行子单元之间不串接。实际I/O主路径在父图或相应细节页。':'沿连线阅读该模块的数据和控制依赖；流水级、同时执行及握手条件以节点和源码为准，图不是周期精确时序。']},
   {dot:'violet',title:'版本与配置',items:['top.DefaultConfig(1) · OpenLLC；'+r+' @ '+versions.repositories[r].revision.slice(0,12),def.status==='variant'?'配置变体：当前默认配置未启用此通路。':'角色、接口和状态根据固定 RTL 核实；多实例的同设计复用本页。',def.instances||'实例数量由父模块/参数配置决定；本页描绘单实例的设计。']}
  ]};
 }
 const r=def.repository||'xiangshan';
 d.meta.repository={url:versions.repositories[r].url,revision:versions.repositories[r].revision};
 d.meta.output=path.relative(repo,path.join(folder,def.id+'.html')).split(path.sep).join('/');
 d.meta.quality_profile='showcase';d.meta.locale='zh-CN';delete d.meta.animation;
 if(!d.meta.title.startsWith('昆明湖')&&!d.meta.title.startsWith('香山'))d.meta.title='昆明湖 V3 · '+d.meta.title;
 for(const c of d.components){if(!c.sources?.length)throw Error('Unsourced node '+def.id+':'+c.id);}
 const body=JSON.stringify(d,null,2)+'\n';fs.writeFileSync(path.join(folder,'candidate.json'),body);
 catalog.push({id:def.id,title:def.title,section:def.section,parent:def.parent||null,level:def.level||'module',repository:r,status:def.status||'active',description:def.description||def.notes?.[0]||d.meta.title,instances:def.instances||null,input:def.section+'/'+def.id+'/candidate.json',output:def.section+'/'+def.id+'/'+def.id+'.html',navigation:def.section+'/'+def.id+'/read.html',sourceFiles:[...new Set(d.components.flatMap(c=>c.sources.map(s=>s.path)))],nodeCount:d.components.length,edgeCount:(d.connections||[]).length,specificationSha256:sha(body)});
}
const ids=new Set(catalog.map(x=>x.id));if(ids.size!==catalog.length)throw Error('Duplicate catalog id');for(const e of catalog)if(e.parent&&!ids.has(e.parent))throw Error('Missing parent '+e.id+':'+e.parent);
fs.writeFileSync(path.join(out,'catalog.json'),JSON.stringify({schemaVersion:1,versionRevision:versions.repositories.xiangshan.revision,configuration:versions.configuration,diagrams:catalog},null,2)+'\n');
console.log('Authored '+catalog.length+' diagrams: '+JSON.stringify(Object.fromEntries([...new Set(catalog.map(x=>x.section))].map(s=>[s,catalog.filter(x=>x.section===s).length]))));

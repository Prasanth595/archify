import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.dirname(fileURLToPath(import.meta.url));
const runtime=JSON.parse(await fs.readFile(path.join(root,'runtime.json'),'utf8'));
const bundle=process.env.ELK_BUNDLE || runtime.files.find(x=>x.member.endsWith('elk.bundled.js')).path;
const ELK=createRequire(import.meta.url)(bundle);
const original=JSON.parse(await fs.readFile(path.join(root,'input-original.json'),'utf8'));
const records=[];
for(const variant of ['original','fixed-side','separate-children']){
 const graph=structuredClone(original);
 if(variant==='fixed-side'){
  const n=graph.children.find(n=>n.id==='n2');
  n.layoutOptions={'org.eclipse.elk.portConstraints':'FIXED_SIDE'};
  for(const p of n.ports)p.layoutOptions={'org.eclipse.elk.port.side':p.id==='p1'?'WEST':'NORTH'};
 }
 if(variant==='separate-children')graph.properties['org.eclipse.elk.hierarchyHandling']='SEPARATE_CHILDREN';
 await fs.writeFile(path.join(root,'input-'+variant+'.json'),JSON.stringify(graph,null,2)+'\n');
 const start=performance.now();
 const engine=new ELK();
 let result;
 try{
  const output=await engine.layout(graph);
  await fs.writeFile(path.join(root,'output-'+variant+'.json'),JSON.stringify(output,null,2)+'\n');
  result={variant,status:'resolved',elapsedMs:performance.now()-start};
 }catch(error){
  result={variant,status:'rejected',elapsedMs:performance.now()-start,errorName:error.name,message:error.message};
  await fs.writeFile(path.join(root,'error-'+variant+'.json'),JSON.stringify(result,null,2)+'\n');
 }finally{engine.terminateWorker();}
 records.push(result);
}
await fs.writeFile(path.join(root,'run.json'),JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,elkVersion:runtime.version,fixture:'Official upstream test/examples/test-browser-draw2.html; researcher-selected example, not an independent user task',scope:'Sequential exploratory layouts. Durations are call observations only, not authoring speed or a benchmark.',records},null,2)+'\n');
console.log(JSON.stringify(records,null,2));

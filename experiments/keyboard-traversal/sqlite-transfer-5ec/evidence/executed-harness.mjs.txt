import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2] || '');
if(!fs.existsSync(path.join(root,'base/archify'))) throw Error('Pass freshly prepared runtime root');
const hash=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function walk(dir,prefix=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='node_modules'?[]:e.isDirectory()?walk(path.join(dir,e.name),path.join(prefix,e.name)):[path.join(prefix,e.name)]).sort();}
const inventory=()=>{const names=walk(path.join(root,'base/archify'));const other=walk(path.join(root,'candidate/archify'));if(JSON.stringify(names)!==JSON.stringify(other)) throw Error('Runtime file sets differ');return names.map(p=>({path:'archify/'+p,baseSha256:hash(path.join(root,'base/archify',p)),candidateSha256:hash(path.join(root,'candidate/archify',p))}));};
const inputs=()=>fs.readdirSync(path.join(root,'inputs')).sort().map(p=>({path:p,sha256:hash(path.join(root,'inputs',p))}));
const before={files:inventory(),inputs:inputs()};const diffs=before.files.filter(x=>x.baseSha256!==x.candidateSha256);if(diffs.length!==1||diffs[0].path!=='archify/explainer/browser-check.mjs') throw Error('Expected exactly one runtime file difference');
fs.writeFileSync(path.join(root,'setup.json'),JSON.stringify(before,null,2)+'\n',{flag:'wx'});
const summary={node:process.version,startedAt:new Date().toISOString(),scope:'dev snapshot with existing candidate checker substituted; no render or finalize',runs:[]};
try {
for(const arm of ['base','candidate']){
 const runtime=path.join(root,arm,'archify');const visual=await import(pathToFileURL(path.join(runtime,'bin/visual-check.mjs')));const check=await import(pathToFileURL(path.join(runtime,'explainer/browser-check.mjs')));const chromePath=visual.findChrome();summary.chrome={path:chromePath,version:spawnSync(chromePath,['--version'],{encoding:'utf8'}).stdout.trim()};
 const artifactPath=path.join(root,'inputs/candidate.html'),outDir=path.join(root,'results',arm,'sqlite');fs.mkdirSync(outDir,{recursive:true});const start=Date.now();const result=await visual.runBrowserCheck({artifactPath,outDir,chromePath});fs.writeFileSync(path.join(outDir,'result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});const run={arm,name:'sqlite',exitCode:result.exitCode,status:result.receipt.status,seconds:(Date.now()-start)/1000,diagnostics:result.receipt.diagnostics};summary.runs.push(run);console.log(JSON.stringify(run));
 const browser=new visual.ChromeVisualBrowser(chromePath);try{const input=path.join(root,'inputs/tab-trap.html');const result=await check.inspectPublicHtml(browser,{artifactPath:input,width:1280,height:900,theme:'light'});fs.writeFileSync(path.join(root,'results',arm,'tab-trap.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});const run={arm,name:'tab-trap',scope:'inspectPublicHtml, not a complete browser gate',keyboardTraversal:result.keyboardTraversal};summary.runs.push(run);console.log(JSON.stringify(run));}finally{await browser.close();}
}
} finally {const after={files:inventory(),inputs:inputs()};fs.writeFileSync(path.join(root,'after.json'),JSON.stringify(after,null,2)+'\n',{flag:'wx'});summary.identitiesUnchanged=JSON.stringify(before)===JSON.stringify(after);summary.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(root,'run-summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});if(!summary.identitiesUnchanged) throw Error('Runtime or input bytes changed');}

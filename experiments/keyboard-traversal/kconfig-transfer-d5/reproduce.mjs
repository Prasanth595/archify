import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const root=path.resolve(process.argv[2] || '.');
if (!fs.existsSync(path.join(root,'setup.json'))) throw new Error('Pass a freshly prepared runtime root containing setup.json');
const hash=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const frozen=JSON.parse(fs.readFileSync(path.join(root,'setup.json'),'utf8'));
for (const row of frozen.files) for (const [arm,key] of [['base','baseSha256'],['candidate','candidateSha256']]) {
 if (hash(path.join(root,arm,row.path))!==row[key]) throw new Error('Runtime mismatch: '+arm+'/'+row.path);
}
for (const row of frozen.inputs) if (hash(path.join(root,'inputs',row.path))!==row.sha256) throw new Error('Input mismatch: '+row.path);
const summary={node:process.version,startedAt:new Date().toISOString(),scope:'existing candidate checker substituted into frozen current dev; HTML reused unchanged; no render or finalize',runs:[]};
for(const arm of ['base','candidate']){
 const runtime=path.join(root,arm,'archify');const visual=await import(pathToFileURL(path.join(runtime,'bin/visual-check.mjs')));const check=await import(pathToFileURL(path.join(runtime,'explainer/browser-check.mjs')));const chromePath=visual.findChrome();summary.chrome={path:chromePath,version:spawnSync(chromePath,['--version'],{encoding:'utf8'}).stdout.trim()};
 for(const name of ['native-baseline','comparison']){
  const artifactPath=path.join(root,'inputs',name+'.html'),outDir=path.join(root,'results',arm,name);fs.mkdirSync(outDir,{recursive:true});const before=hash(artifactPath),start=Date.now();const result=await visual.runBrowserCheck({artifactPath,outDir,chromePath});fs.writeFileSync(path.join(outDir,'result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});const run={arm,name,exitCode:result.exitCode,status:result.receipt.status,seconds:(Date.now()-start)/1000,artifactBefore:before,artifactAfter:hash(artifactPath),diagnosticCodes:result.receipt.diagnostics.map(d=>d.code)};summary.runs.push(run);console.log(JSON.stringify(run));
 }
 const browser=new visual.ChromeVisualBrowser(chromePath);try{const input=path.join(root,'inputs/tab-trap.html');const result=await check.inspectPublicHtml(browser,{artifactPath:input,width:1280,height:900,theme:'light'});const output=path.join(root,'results',arm,'tab-trap.json');fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n',{flag:'wx'});const run={arm,name:'tab-trap',scope:'inspectPublicHtml, not a complete native diagram browser receipt',artifactSha256:hash(input),keyboardTraversal:result.keyboardTraversal};summary.runs.push(run);console.log(JSON.stringify(run));}finally{await browser.close();}
}
summary.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(root,'run-summary.json'),JSON.stringify(summary,null,2)+'\n',{flag:'wx'});

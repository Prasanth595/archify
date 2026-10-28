import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname||path.dirname(new URL(import.meta.url).pathname),'../..');
const experiment=path.join(root,'experiments/diff-file-navigation');
const base='6ca6a5c84439b57ea22e0630fe306e1d91587a6e';
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'archify-file-nav-base-'));
const sha=data=>createHash('sha256').update(data).digest('hex');
const logs=[];
try {
 const archive=path.join(temp,'base.tar');
 execFileSync('git',['archive','--output',archive,base,'archify','LICENSE','LICENSE-MIT','NOTICE','package.json'],{cwd:root});
 execFileSync('tar',['-xf',archive,'-C',temp]);fs.unlinkSync(archive);
 for(const relative of ['node_modules','archify/node_modules'])fs.symlinkSync(path.join(root,relative),path.join(temp,relative),'dir');
 const fixtures=[['upstream','diff2html-multiple-files.diff'],['history','bca9b0ef2ab9150aa91f3c681d1d4f9b453f995f.diff']];
 for(const [name,file] of fixtures){
  const literal=fs.readFileSync(path.join(experiment,'fixtures',file),'utf8');
  const document={schema_version:1,diagram_type:'explainer',meta:{id:`file-navigation-${name}`,title:name==='history'?'Archify history: complete two-file patch':'diff2html: complete two-file fixture',locale:'en'},answer:{summary:'Inspect the complete change to each file.',scope:'Baseline keeps the original table; candidate adds a file list. Original patch preserved in full.'},panels:[{id:'changes',title:'What changed in each file?',span:12,blocks:[{id:'patch',type:'diff',text:literal,caption:file}]}],sources:[{id:'fixture',title:file}]};
  const input=path.join(experiment,`${name}.json`);fs.writeFileSync(input,JSON.stringify(document,null,2)+'\n');
  for(const [variant,checkout] of (process.argv.includes('--candidate-only')?[['candidate',root]]:[['base',temp],['candidate',root]])){
   const output=path.join(experiment,`${name}-${variant}.html`);
   const args=[path.join(checkout,'archify/bin/archify.mjs'),'render','explainer',input,output];
   const result=execFileSync(process.execPath,args,{cwd:root,encoding:'utf8'});
   logs.push({command:[process.execPath,...args],stdout:result,output:path.basename(output),sha256:sha(fs.readFileSync(output))});
  }
 }
 fs.writeFileSync(path.join(experiment,'logs/render.json'),JSON.stringify({base,runtime:process.versions,logs},null,2)+'\n');
}finally{fs.rmSync(temp,{recursive:true,force:true});}

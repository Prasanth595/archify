import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, generate } from './generate.mjs';
const repo=path.resolve(ROOT,'../..');
const logRoot=fs.mkdtempSync(path.join(os.tmpdir(),'archify-profile-contexts-verify-'));
generate();
const commands=[
 ['tests',['--test','experiments/profile-contexts/profile-contexts.test.mjs']],
 ['finalize',['archify/bin/archify.mjs','finalize','explainer','experiments/profile-contexts/output/candidate.explainer.json','experiments/profile-contexts/output/candidate.html','--browser-check','--out-dir',path.join(logRoot,'evidence'),'--json']],
 ['check',['archify/bin/archify.mjs','check','experiments/profile-contexts/output/candidate.html','--require-provenance','--json']],
 ['continued-tab',['experiments/profile-contexts/traverse.mjs']],
];
const results=[];
for(const [name,args] of commands){
 const r=spawnSync(process.execPath,args,{cwd:repo,encoding:'utf8'});
 fs.writeFileSync(path.join(logRoot,`${name}.stdout`),r.stdout??'');fs.writeFileSync(path.join(logRoot,`${name}.stderr`),r.stderr??'');
 results.push({name,exitCode:r.status});
 console.log(`${name}: exit ${r.status}`);
}
const finalized=JSON.parse(fs.readFileSync(path.join(logRoot,'finalize.stdout'),'utf8'));
const check=JSON.parse(fs.readFileSync(path.join(logRoot,'check.stdout'),'utf8'));
const summary={kind:'derived portable summary; original CLI receipts and stdout retained outside public output',node:process.version,base:'6ca6a5c84439b57ea22e0630fe306e1d91587a6e',results,gates:finalized.gates,finalizeStatus:finalized.status,checkStatus:check.status??check.ok,artifact:{path:'candidate.html',sha256:finalized.artifact.sha256,bytes:finalized.artifact.bytes},diagnosticCodes:[...new Set(finalized.diagnostics.map(d=>d.code))],visualReview:'not-performed-by-this-script',ci:'not-run',keyboardEvidence:'keyboard-traversal.json',limitations:'Continued actual Tab evidence does not rewrite a failed public browser-check gate.'};
fs.writeFileSync(path.join(ROOT,'output/verification.json'),JSON.stringify(summary,null,2)+'\n');
console.log(`Raw evidence: ${logRoot}`);
if(results.some(r=>r.exitCode!==0))process.exitCode=1;

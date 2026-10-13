import fs from 'node:fs';import path from 'node:path';import {fileURLToPath,pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';import {spawn} from 'node:child_process';
const base=path.dirname(fileURLToPath(import.meta.url));const repo=path.resolve(base,'../..');
const {ChromeVisualBrowser}=await import(pathToFileURL(path.join(repo,'archify/bin/visual-check.mjs')).href);
const cat=JSON.parse(fs.readFileSync(path.join(base,'catalog.json'))).diagrams;const take=process.argv.find(x=>x.startsWith('--id='))?.split('=')[1];const selected=cat.filter(x=>!take||x.id===take);
const digest=f=>createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const browser=new ChromeVisualBrowser('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',{spawnImpl:(cmd,args,opts)=>spawn(cmd,args,{...opts,windowsHide:true})});
const records=[];
try{
 const session=await browser.sessionPromise;
 for(const e of selected){
 const output=path.join(base,e.output),folder=path.dirname(output),recordFile=path.join(folder,'captures','record.json');
 if(!fs.existsSync(output)){console.log('MISSING '+e.id);continue;}
 const evidencePointer=path.join(folder,'evidence/current.json');const pointer=fs.existsSync(evidencePointer)?JSON.parse(fs.readFileSync(evidencePointer)):null;const summaryPath=pointer?path.join(folder,pointer.summary):path.join(folder,'evidence',e.id+'.finalize-summary.json');const summary=JSON.parse(fs.readFileSync(summaryPath));const hash=digest(output);
 if(!summary.ok||summary.artifact.sha256!==hash)throw Error('No current acceptance '+e.id);
 if(fs.existsSync(recordFile)){const old=JSON.parse(fs.readFileSync(recordFile));if(old.artifactSha256===hash&&old.captures.every(x=>fs.existsSync(path.join(folder,x.path)))){records.push(old);console.log('QA CACHED '+e.id);continue;}}
 fs.mkdirSync(path.dirname(recordFile),{recursive:true});
 const record={id:e.id,artifactSha256:hash,automatedBrowserStatus:'pass',visualReview:'pending',captures:[]};
 for(const theme of ['light','dark']){
 const metrics=await browser.inspect({artifactPath:output,width:1440,height:900,theme});
 if(metrics.scrollWidth>1440||metrics.resolvedTheme!==theme)throw Error('Capture containment/theme '+e.id);
 const layout=await browser.cdp.send('Page.getLayoutMetrics',{},session);const size=layout.cssContentSize||layout.contentSize;
 const height=Math.ceil(size.height);if(height>16000)throw Error('Unexpectedly tall '+e.id);
 const shot=await browser.cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,clip:{x:0,y:0,width:1440,height,scale:1}},session,30000);
 const file=path.join(folder,'captures','full-'+theme+'.png');fs.writeFileSync(file,Buffer.from(shot.data,'base64'));
 record.captures.push({theme,path:'captures/full-'+theme+'.png',width:1440,height,sha256:digest(file),bytes:fs.statSync(file).size,includesLowerDiagramAndNotes:true});
 fs.copyFileSync(file,path.join(folder,theme==='light'?'preview.png':'preview-dark.png'));
 }
 fs.writeFileSync(recordFile,JSON.stringify(record,null,2)+'\n');records.push(record);console.log('CAPTURE '+e.id+' '+record.captures.map(c=>c.height).join('/'));
 }
}finally{await browser.close();}
fs.writeFileSync(path.join(base,'capture-status.json'),JSON.stringify({schemaVersion:1,checkedOn:'2026-10-13',records},null,2)+'\n');
console.log('Captured '+records.length+' diagrams in both themes, full page.');

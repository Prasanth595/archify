import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {fileURLToPath,pathToFileURL} from 'node:url';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
const base=path.dirname(fileURLToPath(import.meta.url));const repo=path.resolve(base,'../..');
const cat=JSON.parse(fs.readFileSync(path.join(base,'catalog.json'))).diagrams;
const ids=new Map(cat.map(e=>[e.id,e]));let links=0;
for(const e of cat){for(const f of [e.input,e.output,e.navigation])assert.ok(fs.existsSync(path.join(base,f)),f);if(e.parent)assert.ok(ids.has(e.parent),e.parent);const doc=fs.readFileSync(path.join(base,e.navigation),'utf8');for(const m of doc.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^https?:|^#/.test(m[1]))continue;const target=path.resolve(path.dirname(path.join(base,e.navigation)),m[1].split('?')[0]);assert.ok(fs.existsSync(target),e.id+' broken link '+m[1]);links++;}}
assert.equal(cat.length,new Set(cat.map(e=>e.id)).size);
const indexDoc=fs.readFileSync(path.join(base,'index.html'),'utf8');
for(const m of indexDoc.matchAll(/(?:href|src)="([^"]+)"/g)){if(/^https?:|^#/.test(m[1]))continue;assert.ok(fs.existsSync(path.resolve(base,m[1].split('?')[0])),'index broken link '+m[1]);links++;}
const digest=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const {ChromeVisualBrowser}=await import(pathToFileURL(path.join(repo,'archify/bin/visual-check.mjs')).href);
const browser=new ChromeVisualBrowser('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',{spawnImpl:(cmd,args,opts)=>spawn(cmd,args,{...opts,windowsHide:true})});
const results=[];
try{
 const session=await browser.sessionPromise;
 const evaluate=async expression=>{const r=await browser.cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
 for(const [width,height]of [[1440,900],[1600,1000],[1920,1080],[2048,1320],[390,844]]){
 const metrics=await browser.inspect({artifactPath:path.join(base,'index.html'),width,height,theme:'dark'});
 assert.ok(metrics.scrollWidth<=width,'index horizontal overflow '+width);
 const initial=await evaluate('({count:document.querySelectorAll(".card:not([hidden])").length,buttons:document.querySelectorAll("button").length})');
 assert.equal(initial.count,cat.length);
 results.push({test:'index-contained',width,height,ok:true});
 }
 const set=async(q,section='',status='')=>evaluate(`(()=>{const q=document.getElementById('search'),s=document.getElementById('section'),t=document.getElementById('status');q.value=${JSON.stringify(q)};s.value=${JSON.stringify(section)};t.value=${JSON.stringify(status)};q.dispatchEvent(new Event('input'));return [...document.querySelectorAll('.card:not([hidden])')].map(e=>e.dataset.id)})()`);
 const mshr=await set('mshr','memory');assert.ok(mshr.includes('l2-mshr'));assert.ok(mshr.includes('l2-mshr-ctl'));assert.ok(!mshr.includes('icache-mshr'));results.push({test:'search-and-section',ok:true});
 const deep=await set('重命名','backend');assert.ok(deep.includes('rename'));assert.ok(!deep.includes('ftq'));results.push({test:'chinese-search',ok:true});
 const variant=await set('','','variant');assert.ok(variant.includes('berti'));assert.ok(variant.includes('vector-perm-legacy'));assert.ok(!variant.includes('load-unit'));results.push({test:'configuration-filter',ok:true});
 const empty=await set('no-such-module-473901');assert.equal(empty.length,0);assert.equal(await evaluate("document.getElementById('empty').hidden"),false);results.push({test:'empty-state',ok:true});
 const reset=await evaluate("(()=>{document.getElementById('reset').click();return {count:document.querySelectorAll('.card:not([hidden])').length,focus:document.activeElement.id}})()");assert.equal(reset.count,cat.length);assert.equal(reset.focus,'search');results.push({test:'reset-and-focus',ok:true});
 await browser.inspect({artifactPath:path.join(base,'index.html'),width:1440,height:900,theme:'dark'});
 const indexShot=await browser.cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true},session);
 fs.writeFileSync(path.join(base,'preview-index.png'),Buffer.from(indexShot.data,'base64'));
 const core=ids.get('core');await browser.inspect({artifactPath:path.join(base,core.navigation),width:1440,height:900,theme:'dark'});const wrapper=await evaluate("({breadcrumb:document.querySelector('[aria-label=面包屑]').textContent,frame:document.querySelector('iframe').getAttribute('src'),links:[...document.querySelectorAll('.childlinks a')].map(e=>e.getAttribute('href'))})");assert.ok(wrapper.breadcrumb.includes('全核'));assert.equal(wrapper.frame,'core.html');assert.ok(wrapper.links.length>=3);results.push({test:'parent-child-and-independent-frame',ok:true});
 const readerShot=await browser.cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true},session);
 fs.mkdirSync(path.join(base,'qa-sheets'),{recursive:true});fs.writeFileSync(path.join(base,'qa-sheets/reader.png'),Buffer.from(readerShot.data,'base64'));
 fs.writeFileSync(path.join(base,'navigation-validation.json'),JSON.stringify({schemaVersion:1,ok:true,diagramCount:cat.length,indexSha256:digest(path.join(base,'index.html')),wrapperSha256:Object.fromEntries(cat.map(e=>[e.id,digest(path.join(base,e.navigation))])),localLinksChecked:links,tests:results},null,2)+'\n');
 console.log(JSON.stringify({ok:true,diagrams:cat.length,links,tests:results.length}));
}catch(e){if(e.message==='placeholder')throw e;throw e;}finally{await browser.close();}

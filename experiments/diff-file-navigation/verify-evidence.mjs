import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
import {parseExplainerDiff} from '../../archify/explainer/diff.mjs';
import {ChromeVisualBrowser,findChrome} from '../../archify/bin/visual-check.mjs';
import {inspectPublicHtml} from '../../archify/explainer/browser-check.mjs';
const directory=path.dirname(new URL(import.meta.url).pathname);
const all=(node,predicate)=>[...(predicate(node)?[node]:[]),...(node.childNodes||[]).flatMap(child=>all(child,predicate))];
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
const text=node=>node.nodeName==='#text'?node.value:(node.childNodes||[]).map(text).join('');
const sha=data=>createHash('sha256').update(data).digest('hex');
const results=[];
const browser=new ChromeVisualBrowser(findChrome());
try{
 for(const name of ['upstream','history']){
  const input=JSON.parse(fs.readFileSync(path.join(directory,`${name}.json`),'utf8'));
  const literal=input.panels[0].blocks[0].text,parsed=parseExplainerDiff(literal);
  assert.equal(parsed.rows.map(row=>row.raw+row.ending).join(''),literal);
  assert.equal(parsed.files.length,2);
  for(const variant of ['base','candidate']){
   const artifactPath=path.join(directory,`${name}-${variant}.html`),html=fs.readFileSync(artifactPath,'utf8'),dom=parse(html);
   const code=all(dom,n=>n.tagName==='table'&&attr(n,'class')==='diff-code')[0];
   assert.deepEqual(all(code,n=>n.tagName==='code').map(text),parsed.rows.map(row=>row.raw));
   const navigation=all(dom,n=>n.tagName==='nav'&&attr(n,'class')==='diff-files');
   assert.equal(navigation.length,variant==='base'?0:1);
   await browser.resetPage();
   const metrics=await inspectPublicHtml(browser,{artifactPath,width:1440,height:900,theme:'light',keyboard:false});
   assert.deepEqual(metrics.references,[]);assert.deepEqual(metrics.consoleErrors,[]);assert.deepEqual(metrics.overflowElements,[]);
   const observation=await browser.cdp.send('Runtime.evaluate',{expression:`(()=>{const rows=[...document.querySelectorAll('.diff-code tbody tr')];const second=rows[${parsed.files[1].rowIndex}];return {secondFileTop:second.getBoundingClientRect().top,viewportHeight:innerHeight,links:[...document.querySelectorAll('.diff-files a')].map(a=>({text:a.textContent,href:a.getAttribute('href')}))};})()`,returnByValue:true},await browser.sessionPromise);
   if(name==='history')assert.ok(observation.result.value.secondFileTop>900);
   results.push({name,variant,sha256:sha(html),bytes:Buffer.byteLength(html),rawLines:parsed.rows.length,counts:parsed.counts,observation:observation.result.value});
  }
 }
 fs.writeFileSync(path.join(directory,'logs/artifact-verification.json'),JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();}

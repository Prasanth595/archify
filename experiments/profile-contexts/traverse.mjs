// Independent experiment observation: real Tab events continue beyond the base QA budget.
// Does not change the shared checker, artifact HTML, tabindex, or controls; no focus() calls.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ChromeVisualBrowser, findChrome } from '../../archify/bin/visual-check.mjs';
import { inspectPublicHtml, inspectNativePreviewLayout } from '../../archify/explainer/browser-check.mjs';
import { ROOT } from './generate.mjs';
const artifact=path.join(ROOT,'output/candidate.html');
const hash=()=>createHash('sha256').update(fs.readFileSync(artifact)).digest('hex');
const artifactBefore=hash(), browser=new ChromeVisualBrowser(findChrome());
const observations=[];
try {
 const session=await browser.sessionPromise;
 const evaluate=async expression=>{
  const result=await browser.cdp.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);
  if(result.exceptionDetails)throw new Error(result.exceptionDetails.text);
  return result.result.value;
 };
 for(const theme of ['light','dark'])for(const width of [1280,1440]){
  const metrics=await inspectPublicHtml(browser,{artifactPath:artifact,width,height:900,theme,keyboard:false});
  const previews=await inspectNativePreviewLayout(browser);
  const count=await evaluate(`(()=>{const elements=Array.from(document.querySelectorAll('[data-qa-key]'));window.__profileTraversal={targets:new Map(elements.map((e,i)=>[e,i])),reached:new Set(),ids:new WeakMap(),next:0};return elements.length})()`);
  const trace=[],radioGroups=new Set();let atOriginalBudget;
  for(let step=1;step<=2000;step++){
   // This fixed observation bound is local to the experiment, not a replacement QA policy.
   const previous=trace.at(-1), key=previous?.radio&&!radioGroups.has(previous.radioName)?'ArrowRight':'Tab';
   if(key==='ArrowRight')radioGroups.add(previous.radioName);
   for(const type of ['keyDown','keyUp'])await browser.cdp.send('Input.dispatchKeyEvent',{type,key,code:key,windowsVirtualKeyCode:key==='Tab'?9:39},session);
   const item=await evaluate(`(()=>{const s=window.__profileTraversal,e=document.activeElement;if(!s.ids.has(e))s.ids.set(e,s.next++);const target=s.targets.get(e);if(target!==undefined)s.reached.add(target);return {focus:s.ids.get(e),target:target??null,reached:s.reached.size,tag:e.tagName,id:e.id,owner:e.closest('[data-block-type],.panel')?.id??'',text:e.textContent.trim().slice(0,100),href:e.getAttribute('href'),radio:e.type==='radio',radioName:e.name??null,hasFocus:document.hasFocus()}})()`);
   trace.push({step,key,...item});
   if(step===count+3)atOriginalBudget={step,reached:item.reached};
   if(item.reached===count)break;
  }
  const missing=await evaluate(`(()=>{const s=window.__profileTraversal;return Array.from(s.targets).filter(([e,id])=>!s.reached.has(id)).map(([e,target])=>({target,id:e.id,tag:e.tagName,text:e.textContent.trim().slice(0,100)}))})()`);
  observations.push({width,theme,initialControls:metrics.controlCount,count,originalBudget:count+3,atOriginalBudget,steps:trace.length,reached:trace.at(-1)?.reached,missing,complete:missing.length===0,previews:previews.map(p=>({component:p.component,minimumTextPx:p.minimum,bodyTextPx:p.body,fit:p.fit,outsidePreview:p.outsidePreview})),trace});
 }
}finally{await browser.close();}
const result={kind:'independent continued actual Tab observation; not a passing public browser-check receipt',artifact:'candidate.html',artifactBefore,artifactAfter:hash(),upstreamCheckerReference:{pr:'https://github.com/tt-a1i/archify/pull/1124',head:'3254fda4fcd61a101cc09e6b68fbdbb4d2779604',merged:false,verification:'PR patch inspected read-only; no checker code copied'},bound:2000,programmaticFocus:false,observations};
fs.writeFileSync(path.join(ROOT,'output/keyboard-traversal.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({sameArtifact:result.artifactBefore===result.artifactAfter,observations:observations.map(({trace,previews,...o})=>o)},null,2));
if(observations.some(o=>!o.complete)||result.artifactBefore!==result.artifactAfter)process.exitCode=1;

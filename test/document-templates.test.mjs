import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {callTool} from '../archify/document/tool.mjs';
import {ChromeVisualBrowser,findChrome} from '../archify/bin/visual-check.mjs';
import {documentBrowser} from '../archify/document/browser.mjs';

const cli=fileURLToPath(new URL('../archify/bin/archify.mjs',import.meta.url));
test('HTML capture, saved templates and six default variants use the same renderer',async t=>{
  const directory=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'archify-templates-')));
  t.after(()=>{assert.equal(path.dirname(directory),fs.realpathSync(os.tmpdir()));assert.ok(path.basename(directory).startsWith('archify-templates-'));fs.rmSync(directory,{recursive:true,force:true});});
  const markdown=path.join(directory,'source.md');fs.writeFileSync(markdown,'# 新标题\n\n引言。\n\n## 甲\n\n第一段。\n\n## 乙\n\n第二段。\n\n## 丙\n\n第三段。');
  const output=path.join(directory,'result.html');
  await t.test('the catalog has three independent designs with two variants and each ID renders',async()=>{
    const catalog=await callTool('list_document_templates',{});assert.equal(catalog.ok,true);assert.equal(catalog.templates.length,6);
    assert.deepEqual(catalog.templates.map(template=>template.id),['decision/static','decision/dynamic','analysis/static','analysis/dynamic','review/static','review/dynamic']);
    for(const template of catalog.templates){const result=await callTool('render_markdown',{markdown_path:markdown,template:template.id,output_path:output});assert.equal(result.ok,true,JSON.stringify(result));assert.ok(fs.readFileSync(output,'utf8').includes('第三段。'));}
    const run=spawnSync(process.execPath,[cli,'document',markdown,output,'--template','analysis/dynamic','--json'],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);assert.equal(JSON.parse(run.stdout).ok,true);
  });
  const design=path.join(directory,'local # design.html');
  fs.writeFileSync(design,'<!doctype html><meta name="viewport" content="width=device-width"><template><img src="thumb.svg"></template><main id="paper"><h1>Old</h1><p>Old paragraph</p></main><footer><p>Fixed footer</p></footer>');
  await t.test('stored HTML and scan metadata remain bound and protect both inputs',async()=>{
    const folder=path.join(directory,'stored');const scanned=await callTool('scan_html',{design_path:design,template_dir:folder});assert.equal(scanned.ok,true,JSON.stringify(scanned));assert.ok(scanned.template.scan.slots.length);assert.equal(scanned.template.scan.snapshot,undefined);
    assert.ok(fs.readFileSync(path.join(folder,'design.html'),'utf8').includes(new URL('thumb.svg',pathToFileURL(design)).href));
    const render=await callTool('render_markdown',{markdown_path:markdown,template_path:folder,output_path:output});assert.equal(render.ok,true,JSON.stringify(render));const before=fs.readFileSync(output);
    const manifest=path.join(folder,'template.json'),manifestBytes=fs.readFileSync(manifest);
    const conflict=await callTool('render_markdown',{markdown:'正文',template_path:folder,output_path:manifest});assert.equal(conflict.ok,false);assert.deepEqual(fs.readFileSync(manifest),manifestBytes);
    const duplicate=await callTool('scan_html',{design_path:design,template_dir:folder});assert.equal(duplicate.ok,false);assert.equal(duplicate.diagnostics[0].code,'document/template-destination');assert.deepEqual(fs.readFileSync(manifest),manifestBytes);
    fs.appendFileSync(path.join(folder,'design.html'),'<!-- modified -->');const changed=await callTool('render_markdown',{markdown:'正文',template_path:folder,output_path:output});assert.equal(changed.ok,false);assert.equal(changed.diagnostics[0].code,'document/template-changed');assert.deepEqual(fs.readFileSync(output),before);
  });
  await t.test('explicit exclusions preserve embedded UI when chapter containers repeat',async()=>{
    const scoped=path.join(directory,'scoped.html');fs.writeFileSync(scoped,'<main><section><h2>Old A</h2><p>Old A body</p><div id="fixed" class="fixed"><p>Counter</p></div></section><section><h2>Old B</h2><p>Old B body</p><div class="fixed"><p>Counter</p></div></section><div id="tail"><p>Preserved tail</p></div></main>');
    const folder=path.join(directory,'scoped');const capture=await callTool('scan_html',{design_path:scoped,content_selector:'main',exclude_selector:'#fixed,.fixed,#tail',template_dir:folder});assert.equal(capture.ok,true,JSON.stringify(capture));
    const render=await callTool('render_markdown',{markdown:'## 甲\n\n第一段。\n\n## 乙\n\n第二段。\n\n## 丙\n\n第三段。',template_path:folder,output_path:output});assert.equal(render.ok,true,JSON.stringify(render));
    const browser=new ChromeVisualBrowser(findChrome());try{const io=await documentBrowser(browser,output);await io.load(fs.readFileSync(output,'utf8'));assert.deepEqual(await io.run('[...document.querySelectorAll(".fixed p")].map(node=>node.textContent)'),['Counter','Counter','Counter']);assert.equal(await io.run('document.querySelector("#tail p").textContent'),'Preserved tail');assert.deepEqual(await io.run('[...document.querySelectorAll("section>p")].map(node=>node.textContent)'),['第一段。','第二段。','第三段。']);}finally{await browser.close();}
    for(const selectors of [{content_selector:'section'},{content_selector:'['},{content_selector:'main',exclude_selector:'main'}]){const failed=await callTool('render_markdown',{markdown:'正文',design_path:scoped,output_path:output,...selectors});assert.equal(failed.ok,false);assert.ok(failed.diagnostics[0].code.startsWith('document/content-'));}
    fs.writeFileSync(scoped,'<main><p>Preserved main</p><aside><div id="custom"><p>Old selected body</p></div></aside></main>');
    const selected=await callTool('render_markdown',{markdown:'Selected body',design_path:scoped,content_selector:'#custom',output_path:output});assert.equal(selected.ok,true,JSON.stringify(selected));const html=fs.readFileSync(output,'utf8');assert.ok(html.includes('Preserved main'));assert.ok(html.includes('Selected body'));assert.ok(!html.includes('Old selected body'));
  });
  await t.test('fetch relocates assets and encoding while capture leaves scripts unexecuted',async()=>{
    let executed=0;const server=http.createServer((request,response)=>{
      if(request.url==='/executed'){executed++;response.end('ok');return;}
      if(request.url==='/assets/page.css'){response.setHeader('Content-Type','text/css');response.end('main p{color:rgb(11,22,33)}');return;}
      if(request.url==='/assets/app.js'){response.setHeader('Content-Type','text/javascript');response.end('if(document.querySelector("[data]").getAttribute("data")!=="literal")throw Error("Custom data mutated");document.body.dataset.ready="true";fetch("/executed").catch(()=>{});');return;}
      if(request.url==='/binary'){response.setHeader('Content-Type','image/png');response.end('not html');return;}
      response.setHeader('Content-Type','text/html; charset=windows-1252');response.end('<!doctype html><meta charset="windows-1252"><base href="/assets/"><link rel="stylesheet" href="page.css"><script src="app.js" defer></script><div data="literal"></div><main><h1>Old</h1><p>Old</p></main>');
    });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));t.after(()=>new Promise(resolve=>server.close(resolve)));
    const url='http://127.0.0.1:'+server.address().port+'/page';const folder=path.join(directory,'remote');const capture=await callTool('scan_html',{design_url:url,template_dir:folder});assert.equal(capture.ok,true,JSON.stringify(capture));assert.equal(executed,0);
    const html=fs.readFileSync(path.join(folder,'design.html'),'utf8');assert.match(html,/charset="utf-8"/);assert.ok(html.includes(url.replace('/page','/assets/page.css')));assert.ok(html.includes('data="literal"'));
    const result=await callTool('render_markdown',{markdown:'# 中文标题\n\n正文。',template_path:folder,output_path:output});assert.equal(result.ok,true,JSON.stringify(result));
    const browser=new ChromeVisualBrowser(findChrome());try{const io=await documentBrowser(browser,output);await io.load(fs.readFileSync(output,'utf8'),{scripts:true});assert.equal(await io.run('getComputedStyle(document.querySelector("main p")).color'),'rgb(11, 22, 33)');assert.equal(await io.run('document.querySelector("main h1").textContent'),'中文标题');assert.equal(await io.run('document.body.dataset.ready'),'true');}finally{await browser.close();}
    const rejected=await callTool('scan_html',{design_url:url.replace('/page','/binary')});assert.equal(rejected.ok,false);assert.equal(rejected.diagnostics[0].code,'document/content-type');
    const direct=await callTool('render_markdown',{markdown:'直连正文。',design_url:url,output_path:output});assert.equal(direct.ok,true,JSON.stringify(direct));
  });
});

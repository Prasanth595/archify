import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { callDocumentTool } from '../../tool.mjs';
import { ChromeVisualBrowser, findChrome } from '../../../bin/visual-check.mjs';
import { documentBrowser } from '../../browser.mjs';

const directory = process.argv[2];
const only=process.argv[3];
if (!directory) throw Error('Provide an existing evidence directory.');
const flatSource=path.join(directory,'flat.md');
fs.writeFileSync(flatSource,'# 没有二级标题的记录\n\n第一段作为文档引言。\n\n第二段必须进入完整阅读空间。\n\n| 状态 | 数值（小时） | 对照（小时） |\n| --- | ---: | ---: |\n| 冻结 | -3 | 2 |\n\n```js\nconst result = -3;\n```\n');
const neutralSource=path.join(directory,'neutral.md');
fs.writeFileSync(neutralSource,'# Z\n\n这里只给出信息结构，不声明用途。\n\n## X\n\n| 条目 | u（ms） | v（%） |\n| --- | ---: | ---: |\n| 甲 | 2 | 9 |\n| 乙 | 6 | 4 |\n| 丙 | 3 | 7 |\n\n## Y\n\n- α\n  - α1\n  - α2\n- β\n  - β1\n  - β2\n\n## W\n\n1. A\n2. B\n3. C\n');
const cases = [
  ...['decision','analysis','review'].map(design=>({key:design+'-neutral',design,scenario:'neutral',source:neutralSource,name:design+' · 中性标题'})),
  ...['decision','analysis','review'].map(design=>({key:design+'-demo',design,scenario:'demo',source:fileURLToPath(new URL('./demo.md',import.meta.url)),name:design+' · 同一份 Markdown'})),
  ...['decision','analysis','review'].map(design=>({key:design,design,scenario:design,source:fileURLToPath(new URL('../../designs/examples/'+design+'.md',import.meta.url)),name:design+' · 对应用途'})),
  ...['decision','analysis','review'].map(design=>({key:design+'-prose',design,scenario:'prose',source:fileURLToPath(new URL('./prose.md',import.meta.url)),name:design+' · 纯文字'})),
  {key:'flat',design:'review',scenario:'flat',source:flatSource,name:'没有章节标题 · 完整正文'},
];
if (only && !cases.some(entry=>entry.key===only)) throw Error('Unknown check case: '+only);
const browser = new ChromeVisualBrowser(findChrome()), results=[];
try {
  const session = await browser.sessionPromise;
  await browser.cdp.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false},session);
  const settle = async io => await io.run('document.fonts.ready.then(()=>Promise.all([...document.querySelectorAll(".scene-layer")].flatMap(node=>node.getAnimations({subtree:true})).map(animation=>animation.finished.catch(()=>{})))).then(()=>new Promise(resolve=>{let previous=null,stable=0;const tick=()=>{const state=[...document.querySelectorAll(".graph-node:not([hidden]),.pair-point,.coordinate-point")].map(node=>node.style.transform).join("|");stable=state===previous?stable+1:0;previous=state;if(stable>=3)resolve();else requestAnimationFrame(tick);};requestAnimationFrame(tick);}));');
  const shot = async key => { const image=await browser.cdp.send('Page.captureScreenshot',{format:'png'},session);fs.writeFileSync(path.join(directory,key+'.png'),Buffer.from(image.data,'base64')); };
  const mouse = async (type,x,y,extra={}) => await browser.cdp.send('Input.dispatchMouseEvent',{type,x,y,...extra},session);
  const click = async (io,selector) => {
    const point=await io.run(`(()=>{const node=document.querySelector(${JSON.stringify(selector)});node.scrollIntoView({block:'nearest',inline:'nearest'});const box=node.getBoundingClientRect();
      for(let y=.5;y<1;y+=.1)for(let x=.05;x<1;x+=.1){const px=box.x+box.width*x,py=box.y+box.height*y,hit=document.elementFromPoint(px,py);if(hit&&(node===hit||node.contains(hit)))return {x:px,y:py};}throw Error('No clickable area: '+${JSON.stringify(selector)});})()`);
    await mouse('mouseMoved',point.x,point.y);await mouse('mousePressed',point.x,point.y,{button:'left',clickCount:1});await mouse('mouseReleased',point.x,point.y,{button:'left',clickCount:1});
  };
  const nextChapter=async io=>{await click(io,'.reader-back');await settle(io);await click(io,'.lane-card.is-active + .lane-card');await settle(io);await click(io,'.lane-card.is-active');await settle(io);};
  for (const entry of cases.filter(entry=>!only||entry.key===only)) {
    const request={markdown_path:entry.source,design_path:fileURLToPath(new URL("./"+entry.design+".html",import.meta.url)),output_path:path.join(directory,entry.key+'.html')};
    fs.writeFileSync(path.join(directory,entry.key+'-request.json'),JSON.stringify(request,null,2));
    const result=await callDocumentTool(request);assert.equal(result.ok,true,JSON.stringify(result));
    const io=await documentBrowser(browser,request.output_path);await io.load(fs.readFileSync(request.output_path,'utf8'),{scripts:true});await settle(io);
    const original=await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()');
    const metrics=await io.run('({title:document.querySelector(".hero h1").textContent,modes:[...document.querySelectorAll("[data-mode]")].map(button=>button.dataset.mode),overflow:document.documentElement.scrollWidth>innerWidth,sourceTables:document.querySelectorAll(".source-reading table").length,sourceChapters:document.querySelectorAll(".source-chapter").length})');
    assert.equal(metrics.overflow,false);await shot(entry.key);
    assert.equal(await io.run('document.documentElement.dataset.design'),entry.design);
    assert.equal(await io.run('document.querySelector("[data-action=motion]")'),null);
    assert.ok(await io.run('document.querySelector("main").getBoundingClientRect().width/innerWidth')>.9,'The information area is still narrow');
    assert.equal(await io.run('document.querySelector(".source-reading").hidden'),true);
    assert.equal(await io.run('document.querySelector(".source-reading").getBoundingClientRect().height'),0);
    assert.equal(await io.run('document.querySelector(".top-actions a")'),null);
    assert.equal(await io.run('document.querySelectorAll(".motion-room input[type=range]").length'),0);
    if(entry.scenario==='demo'&&entry.design==='review') {
      assert.deepEqual(metrics.modes,['comparison','hierarchy','sequence','outline']);
      await click(io,'[data-mode=comparison]');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".dial-value")].map(node=>node.textContent)'),['30','8']);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".choice-list .choice>span:nth-child(2)")].map(node=>node.textContent)'),['材料准备','排队等待','人工复核']);
      await browser.cdp.send('Page.bringToFront',{},session);
      await click(io,'[data-active] .choice[data-index="0"]');await settle(io);
      assert.equal(await io.run('document.querySelector(".comparison-name").textContent'),'材料准备');
      assert.deepEqual(await io.run('[...document.querySelectorAll(".dial-value")].map(node=>node.textContent)'),['8','6']);
      await shot(entry.key+'-comparison');
      await io.run('document.querySelectorAll("[data-active] .choice")[2].focus()');
      await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'},session);
      await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13},session);await settle(io);
      assert.equal(await io.run('document.querySelector(".comparison-name").textContent'),'人工复核');
      assert.deepEqual(await io.run('[...document.querySelectorAll(".dial-value")].map(node=>node.textContent)'),['10','4']);
      await click(io,'[data-mode=hierarchy]');await settle(io);
      assert.equal(await io.run('document.querySelectorAll("[data-active] .choice,.graph-all").length'),0);
      assert.equal(await io.run('document.querySelectorAll("[data-active] .graph-node:not([hidden])").length'),9);
      assert.equal(await io.run('document.querySelectorAll("[data-active] .graph-edges path:not([hidden])").length'),6);
      assert.deepEqual(await io.run('(()=>{const nodes=[...document.querySelectorAll("[data-active] .graph-node:not([hidden])")], overlaps=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i].getBoundingClientRect(),b=nodes[j].getBoundingClientRect();if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlaps.push([nodes[i].textContent,nodes[j].textContent]);}return overlaps;})()'),[],'Graph nodes overlap');
      await shot(entry.key+'-graph-all');
      await click(io,'[data-active] .graph-node[data-index="3"]');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll("[data-active] .graph-node:not(.is-muted)")].map(node=>node.textContent)'),['验证环节','重复提交缺少恢复验证','高峰样本尚未覆盖']);
      assert.equal(await io.run('document.querySelectorAll("[data-active] .graph-edges path:not(.is-muted)").length'),2);
      await click(io,'[data-active] .graph-node[data-index="4"]');await settle(io);
      assert.equal(await io.run('document.querySelector("[data-active] .scene-status").textContent'),'路径：验证环节 › 重复提交缺少恢复验证');
      assert.equal(await io.run('getComputedStyle(document.querySelector("[data-active] .graph-node.is-selected")).outlineStyle'),'none','Pointer selection shows a keyboard focus ring');
      assert.ok(await io.run('(()=>{const button=document.querySelector("[data-active] .graph-node.is-selected"),box=button.getBoundingClientRect();return document.elementFromPoint(box.x+box.width/2,box.y+box.height/2)===button;})()'));
      await shot(entry.key+'-graph-focus');
      await click(io,'[data-active] .graph-node[data-index="4"]');await settle(io);
      assert.equal(await io.run('document.querySelectorAll("[data-active] .graph-node.is-muted").length'),0);
      await click(io,'[data-active] .graph-node[data-index="3"]');await settle(io);
      await io.run('document.querySelector("[data-active] .graph-field").click()');await settle(io);
      assert.equal(await io.run('document.querySelectorAll("[data-active] .graph-node.is-muted").length'),0);

      await click(io,'[data-mode=sequence]');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll("[data-active] .card-number")].map(node=>node.textContent)'),['01','02','03']);
      await click(io,'[data-active] .lane-card[data-index="1"]');await settle(io);
      assert.equal(await io.run('document.querySelector("[data-active] .lane-card.is-active strong").textContent'),'补齐验证。');
      await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},session);
      await browser.cdp.send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39},session);await settle(io);
      assert.equal(await io.run('document.querySelector("[data-active] .lane-card.is-active strong").textContent'),'完成评审。');
      assert.equal(await io.run('getComputedStyle(document.querySelector("[data-active] .lane-card.is-active")).outlineStyle'),'solid','Keyboard selection has no visible focus');
      await click(io,'[data-active] .lane-card[data-index="1"]');await settle(io);
      await click(io,'[data-active] .lane-card[data-index="2"]');await settle(io);
      assert.equal(await io.run('document.querySelector("[data-active] .lane-card.is-active strong").textContent'),'完成评审。');
      assert.equal(await io.run('document.querySelectorAll("[data-active] .scene-nav,[data-active] .lane-progress").length'),0);
      await click(io,'[data-active] .lane-card[data-index="1"]');await settle(io);await shot(entry.key+'-sequence');
      assert.equal(await io.run('document.querySelector("[data-active] .lane-card.is-active strong").textContent'),'补齐验证。');
      await click(io,'[data-mode=outline]');await settle(io);await shot(entry.key+'-chapters');
      await click(io,'[data-active] .lane-card.is-active');await settle(io);
      assert.equal(await io.run('document.querySelector(".chapter-document table").getBoundingClientRect().height>0'),true);
      assert.ok(await io.run('(()=>{const body=document.querySelector(".chapter-document"),style=getComputedStyle(body);return (body.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight))/document.querySelector(".motion-room").clientWidth;})()')>.82,'Chapter content is still constrained to a narrow column');
      assert.equal(await io.run('document.querySelector(".chapter-document .source-body>p:last-child").textContent'),'这些数字描述两组原始记录。它们没有提供连续测量，也没有给出完成率。');
      assert.equal(await io.run('document.querySelectorAll(".source-reading .source-chapter").length'),2);await shot(entry.key+'-reading');
      await nextChapter(io);
      assert.ok(await io.run('document.querySelector(".chapter-document ul").textContent.includes("结论需要附上证据")'));
      await nextChapter(io);
      assert.equal(await io.run('document.querySelector(".chapter-document blockquote").textContent.trim()'),'先把证据讲清楚，再决定下一步。');
      assert.equal(await io.run('document.querySelectorAll(".reader-controls").length'),0);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
      await click(io,'[data-mode=comparison]');await settle(io);
      assert.equal(await io.run('document.querySelectorAll(".source-reading .source-chapter").length'),3);
      assert.equal(await io.run('document.querySelectorAll(".chapter-reader").length'),0);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
      await browser.cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]},session);
      await io.run('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      assert.equal(await io.run('document.documentElement.dataset.motion'),'still');
      assert.equal(await io.run('getComputedStyle(document.querySelector(".ambient i")).animationName'),'none');
      await click(io,'[data-mode=hierarchy]');await settle(io);
      await click(io,'[data-active] .graph-node[data-index="6"]');await settle(io);
      assert.equal(await io.run('document.documentElement.dataset.design'),entry.design);
      assert.equal(await io.run('document.querySelector("[data-active] .graph-node.is-selected").textContent'),'交接环节');
      await browser.cdp.send('Emulation.setEmulatedMedia',{features:[]},session);
    }
    if(entry.scenario==='review') {
      assert.deepEqual(metrics.modes,['comparison','sequence','outline']);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".dial-value")].map(node=>node.textContent)'),['5','10']);
      await click(io,'[data-mode=outline]');await settle(io);await click(io,'.lane-card.is-active');await settle(io);
      assert.ok(await io.run('document.querySelector(".chapter-document").textContent.includes("常规输入验证已经完成")'));
      await nextChapter(io);
      assert.ok(await io.run('document.querySelector(".chapter-document table").textContent.includes("2026-10-20")'));
      await click(io,'.reader-back');await settle(io);
      assert.equal(await io.run('document.querySelectorAll(".source-reading .source-chapter").length'),original.length);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
    }
    if(entry.design==='decision'){
      assert.equal(await io.run('document.querySelector("[data-experience]").dataset.experience'),'paired-comparison');
      assert.equal(await io.run('document.querySelectorAll(".glass-dock,.metric-dial,.lane-card").length'),0);
      assert.equal(await io.run('document.querySelectorAll(".compare-sheet").length'),2);
      if(entry.scenario==='demo'){
        assert.deepEqual(await io.run('[...document.querySelectorAll(".sheet-title")].map(node=>node.textContent)'),['材料准备','排队等待']);
        assert.deepEqual(await io.run('[...document.querySelectorAll(".pair-point")].map(node=>Number(node.dataset.value))'),[8,30]);
        await io.run('(()=>{const select=document.querySelector(".record-select");select.value="2";select.dispatchEvent(new Event("change",{bubbles:true}));})()');await settle(io);
        assert.deepEqual(await io.run('[...document.querySelectorAll(".sheet-title")].map(node=>node.textContent)'),['人工复核','排队等待']);
        assert.deepEqual(await io.run('[...document.querySelectorAll(".pair-point")].map(node=>Number(node.dataset.value))'),[10,30]);
        await io.run('(()=>{const select=document.querySelector(".metric-select");select.value="1";select.dispatchEvent(new Event("change",{bubbles:true}));})()');await settle(io);
        assert.deepEqual(await io.run('[...document.querySelectorAll(".pair-point")].map(node=>Number(node.dataset.value))'),[4,8]);
      }
      if(entry.scenario==='prose')assert.equal(await io.run('document.querySelector(".compare-rail").hidden'),true);
      await click(io,'.chapter-tile');await settle(io);
      assert.ok(await io.run('document.querySelector(".source-dialog[open] .source-chapter")!==null'));
      if(entry.scenario==='decision')assert.ok(await io.run('document.querySelector(".source-dialog blockquote").textContent.includes("此次批准的是验证范围")'));
      await click(io,'.source-close');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
      await shot(entry.key+'-paired');
    }
    if(entry.design==='analysis'){
      assert.equal(await io.run('document.querySelector("[data-experience]").dataset.experience'),'coordinate-explorer');
      assert.equal(await io.run('document.querySelectorAll(".glass-dock,.metric-dial,.lane-card").length'),0);
      if(entry.scenario==='demo'){
        assert.deepEqual(await io.run('[...document.querySelectorAll(".coordinate-point")].map(point=>[Number(point.dataset.x),Number(point.dataset.y)])'),[[8,6],[30,8],[10,4]]);
        await click(io,'.coordinate-point[data-label=排队等待] .coordinate-dot');await settle(io);
        assert.equal(await io.run('document.querySelector(".record-readout>strong").textContent'),'排队等待');
        await io.run('(()=>{const select=document.querySelectorAll(".axis-choice select")[1];select.value="0";select.dispatchEvent(new Event("change",{bubbles:true}));})()');await settle(io);
        assert.deepEqual(await io.run('[...document.querySelectorAll(".coordinate-point")].map(point=>[Number(point.dataset.x),Number(point.dataset.y)])'),[[8,8],[30,30],[10,10]]);
        await shot(entry.key+'-coordinates');
        await click(io,'.index-entry:nth-of-type(2)');await settle(io);
        assert.equal(await io.run('document.querySelectorAll(".graph-node:not([hidden])").length'),9);
        assert.equal(await io.run('document.querySelectorAll(".graph-edges path:not([hidden])").length'),6);
        await shot(entry.key+'-relations');
        await click(io,'.evidence-heading .source-link');await settle(io);
        assert.ok(await io.run('document.querySelector(".source-dialog ul").textContent.includes("回滚条件需要共同确认")'));
        await click(io,'.source-close');await settle(io);
      }
      if(entry.scenario==='analysis'){
        assert.deepEqual(await io.run('[...document.querySelectorAll(".coordinate-point")].map(point=>[Number(point.dataset.x),Number(point.dataset.y)])'),[[160,32],[78,96],[42,188]]);
        const methodSelector=await io.run(`(()=>{const heading=[...document.querySelectorAll('.source-chapter')].find(chapter=>chapter.querySelector('pre code'))?.querySelector('h2')?.textContent;const entries=[...document.querySelectorAll('.index-entry')],index=entries.findIndex(entry=>heading&&entry.textContent.includes(heading));if(index<0)throw Error('The source method chapter is not available');return '.index-entry:nth-of-type('+(index+1)+')';})()`);
        await click(io,methodSelector);await settle(io);
        assert.ok(await io.run('document.querySelector(".analysis-document code").textContent.includes("measurements.push")'));
      }
      if(entry.scenario==='prose'){
        assert.equal(await io.run('document.querySelectorAll(".coordinate-point").length'),0);
        await click(io,'.index-entry:nth-of-type(2)');await settle(io);
        assert.equal(await io.run('document.querySelector(".analysis-document h2").textContent'),'让证据跟随观点');
      }
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
      await shot(entry.key+'-explorer');
    }
    if(entry.scenario==='prose'&&entry.design==='review') {
      assert.deepEqual(metrics.modes,['outline']);
      assert.equal(await io.run('document.querySelectorAll(".metric-dial,.graph-node").length'),0);
      await click(io,'.lane-card.is-active');await settle(io);
      await nextChapter(io);
      assert.equal(await io.run('document.querySelector(".chapter-document h2").textContent'),'让证据跟随观点');
      await click(io,'.reader-back');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
    }
    if(entry.scenario==='neutral'){
      if(entry.design==='decision'){
        assert.deepEqual(await io.run('[...document.querySelectorAll(".sheet-title")].map(node=>node.textContent)'),['甲','乙']);
        assert.deepEqual(await io.run('[...document.querySelectorAll(".pair-point")].map(node=>Number(node.dataset.value))'),[2,6]);
      }
      if(entry.design==='analysis')assert.deepEqual(await io.run('[...document.querySelectorAll(".coordinate-point")].map(node=>[Number(node.dataset.x),Number(node.dataset.y)])'),[[2,9],[6,4],[3,7]]);
      if(entry.design==='review')assert.deepEqual(metrics.modes,['comparison','hierarchy','sequence','outline']);
    }
    if(entry.scenario==='flat') {
      assert.deepEqual(metrics.modes,['outline']);
      await click(io,'.lane-card.is-active');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".chapter-document p")].map(node=>node.textContent)'),['第一段作为文档引言。','第二段必须进入完整阅读空间。']);
      assert.ok(await io.run('document.querySelector(".chapter-document table").textContent.includes("-3")'));
      assert.equal(await io.run('document.querySelector(".chapter-document code").textContent.trim()'),'const result = -3;');
      await click(io,'.reader-back');await settle(io);
      assert.deepEqual(await io.run('[...document.querySelectorAll(".source-chapter")].map(node=>node.textContent).sort()'),original);
    }
    assert.deepEqual(await io.errors(),[]);results.push({...entry,request,result,metrics,errors:[]});console.log(JSON.stringify({key:entry.key,...metrics}));
  }
} finally {await browser.close();}
fs.writeFileSync(path.join(directory,only?'results-'+only+'.json':'results.json'),JSON.stringify(results,null,2));
console.log(JSON.stringify({directory}));

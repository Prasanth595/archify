const fs=await import('node:fs/promises');const task=await taskSpace(34);const page=task.page('p1');
await page.goto('file:///tmp/archify-round26-native/tree-archify-repository-rendered.html?theme=light');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.evaluate(async()=>{await document.fonts.ready;await Archify.viewerChromeLayout.whenStable();});
const state=await page.evaluate(()=>({collapsed:Archify.treeBranches.collapsedIds(),focus:Archify.focus.active(),kinds:Archify.semanticLens.kinds(),lens:Archify.semanticLens.active(),target:{hidden:document.querySelector('[data-node-id="v_tree"]').hasAttribute('data-tree-hidden'),kind:document.querySelector('[data-node-id="v_tree"]').getAttribute('data-node-kind')},ua:navigator.userAgent,url:location.href,at:new Date().toISOString()}));
await fs.writeFile('/tmp/archify-round26-native/initial-state.json',JSON.stringify(state,null,2));console.log(state);
const snapshot=await page.snapshot();await fs.writeFile('/tmp/archify-round26-native/initial-snapshot.json',JSON.stringify(snapshot,null,2));console.log(snapshot);
await page.screenshot({path:'/tmp/archify-round26-native/initial.png'});

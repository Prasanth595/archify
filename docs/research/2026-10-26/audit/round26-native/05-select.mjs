const fs=await import('node:fs/promises');const task=await taskSpace(34);const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.keyboard.press('Enter');
await page.waitForFunction(()=>Archify.focus.active()==='v_tree'&&!document.querySelector('[data-node-id="v_tree"]').hasAttribute('data-tree-hidden'),undefined,{timeout:10000});
await page.evaluate(async()=>{await Archify.viewerChromeLayout.whenStable();await new Promise(requestAnimationFrame);});
const state=await page.evaluate(()=>{const n=document.querySelector('[data-node-id="v_tree"]');const r=n.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {collapsed:Archify.treeBranches.collapsedIds(),lens:Archify.semanticLens.active(),focus:Archify.focus.active(),activeNode:document.activeElement?.getAttribute('data-node-id'),targetHidden:n.hasAttribute('data-tree-hidden'),targetSelected:n.hasAttribute('data-focus-selected'),targetOpacity:getComputedStyle(n).opacity,targetDisplay:getComputedStyle(n).display,targetRect:{x:r.x,y:r.y,width:r.width,height:r.height},withinViewport:r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight,centerHitNode:hit?.closest('[data-node-id]')?.getAttribute('data-node-id'),hash:location.hash,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},at:new Date().toISOString()};});
await fs.writeFile('/tmp/archify-round26-native/selected-state.json',JSON.stringify(state,null,2));
const snapshot=await page.snapshot();await fs.writeFile('/tmp/archify-round26-native/selected-snapshot.json',JSON.stringify(snapshot,null,2));
await page.screenshot({path:'/tmp/archify-round26-native/selected.png'});console.log(state);console.log(snapshot);

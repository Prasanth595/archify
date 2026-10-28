const task=await taskSpace(3);const page=task.page('p1');
console.log(await page.evaluate(()=>({visibility:document.visibilityState,focus:document.hasFocus(),width:innerWidth,height:innerHeight})));

const task=await taskSpace(3),page=task.page('p1'),fs=await import('node:fs/promises');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
console.log(await page.evaluate(()=>[...document.querySelectorAll('[contenteditable], [role="textbox"], .monaco-editor')].map(x=>({tag:x.tagName,cls:x.className,role:x.getAttribute('role'),rect:x.getBoundingClientRect().toJSON(),html:x.outerHTML.slice(0,500)}))));
await fs.mkdir("/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/screenshots",{recursive:true});
await page.screenshot({path:"/Users/tsk/.codex/worktrees/research-lab-20261026/archify/docs/research/2026-10-26/audit/round51-ts-ast/screenshots/01-empty-editor.png"});

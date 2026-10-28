import fs from 'node:fs';
const task=await taskSpace(3); const page=task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('text="trace"');
fs.writeFileSync('/tmp/archify-round37-browser/11-visible-dom.txt',await page.evaluate(()=>document.body.innerText));
console.log(await page.snapshot({scope:'full_page'}));
await page.mouse.move(1100,600);await page.mouse.wheel(0,500,{label:'Inspect implementation resolution trace'});
await page.screenshot({path:'/tmp/archify-round37-browser/11-native-trace.png'});

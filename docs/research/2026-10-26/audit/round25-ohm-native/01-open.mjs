const fs = await import('node:fs/promises');
const task = await taskSpace('Archify research 20261026');
console.log({spaceId:task.spaceId});
const page = task.page('p1');
await page.goto('https://ohmjs.org/editor/');
await page.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
const snapshot = await page.snapshot();
await fs.writeFile('/tmp/archify-round25-ohm/initial-snapshot.json',JSON.stringify(snapshot,null,2));
console.log(snapshot);

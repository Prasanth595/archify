const task = await taskSpace(3);
const page = task.page('p1');
await page.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await page.goto('https://arethetypeswrong.github.io');
console.log(await page.snapshot());

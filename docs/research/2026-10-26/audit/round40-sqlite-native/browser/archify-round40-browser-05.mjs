const task=await taskSpace(3),page=task.page("p1");
await page.cdp("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
await page.click('textarea[placeholder="SELECT ..."]');
await page.screenshot({path:"/tmp/archify-round40-default-scan.png"});
help("page.selectOption");

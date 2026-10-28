const task=await taskSpace(3),page=task.page("p1");
await page.click('button:has-text("Version")');
console.log(await page.snapshot({scope:"viewport"}));
await page.screenshot({path:"/tmp/archify-round41-native-version.png"});

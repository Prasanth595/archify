const task=await taskSpace(3),page=task.page('p1');
await page.goto('about:blank');
console.log({url:await page.url(),reason:'Native captures complete; stop this demo page while preserving the ongoing goal space'});

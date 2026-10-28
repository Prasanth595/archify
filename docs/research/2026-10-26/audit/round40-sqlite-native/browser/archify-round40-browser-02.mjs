const task=await taskSpace(3),page=task.page("p1");
await page.click('loc=role:button[name="Load example database"]');
console.log(await page.snapshot());

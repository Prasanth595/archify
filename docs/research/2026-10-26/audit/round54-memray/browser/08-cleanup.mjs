const task=await taskSpace(3),page=task.page('p1');await page.goto('about:blank');console.log(await page.snapshot());

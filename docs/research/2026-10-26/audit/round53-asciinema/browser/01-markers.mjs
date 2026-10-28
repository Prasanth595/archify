const task=await taskSpace(3),page=task.page('p1');await page.goto('https://docs.asciinema.org/manual/player/markers/');console.log(await page.snapshot());

const task=await taskSpace(3),page=task.page('p1');await page.goto('https://bloomberg.github.io/memray/_static/flamegraphs/memray-flamegraph-sqlite.html');console.log(await page.snapshot());

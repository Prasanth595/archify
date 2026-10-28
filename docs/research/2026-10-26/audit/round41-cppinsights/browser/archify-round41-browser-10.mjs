const task=await taskSpace(3),page=task.page("p1");
await page.click('a[href="/"]');
await page.setInputFiles('#file-input',["/tmp/archify-round41-capture.cpp"]);
console.log(await page.snapshot());
await page.click('button[title="Run C++ Insights (Cmd-Return)"]');

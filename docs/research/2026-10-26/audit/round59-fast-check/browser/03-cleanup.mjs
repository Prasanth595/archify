const task=await taskSpace(3);await task.page('p1').goto('about:blank');console.log(await task.page('p1').snapshot());

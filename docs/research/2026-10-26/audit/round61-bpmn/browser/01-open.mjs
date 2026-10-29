const task = await taskSpace(3);
const page = task.page("p1");
await page.goto("https://bpmn-io.github.io/bpmn-js-token-simulation/modeler.html?e=1&diagram=https%3A%2F%2Fraw.githubusercontent.com%2Fbpmn-io%2Fbpmn-js-token-simulation%2Fb1ce5a9bc7836c2a57bd0900cedd297299324643%2Ftest%2Fspec%2Fsimulator%2FSimulator.parallel-gateway-join.bpmn");
console.log(await page.snapshot());

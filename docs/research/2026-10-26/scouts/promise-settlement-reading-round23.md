# Round 23：Promise 结算与未停止的操作

2026-10-28，只读。**结论：自然疑问真实存在，但暂不启动 Archify 实验或新追踪器。** 已有同输入的原生输出直接显示后续操作继续，官方文档也明确解释和给出取消方式；没有独立读者证据表明图优于完整日志与代码。未安装、运行下载代码、修改仓库或制作截图。

## 实际问题与同输入原生证据

[Stack Overflow 问题](https://stackoverflow.com/questions/67604216/with-promise-race-what-happens-to-losing-promises) 中，提问者观察到 Node 中 race 的其余操作似乎继续，问理解是否正确；问题本身没有其测试代码或 Node 版本，故不能把这次观察当可复现固定运行。回答者另给出[完整代码与示例输出](https://stackoverflow.com/questions/67604216/with-promise-race-what-happens-to-losing-promises)：三个 runner 先启动，随机计时，示例中 Claire 完成后宣布获胜，Alice 与 Bob 随后仍输出完成，最后 `Promise.all` 输出三项。它是回答者自报的一次样例而非本轮运行，随机时间不保证同一获胜者或确切毫秒。输入已经同时执行 `race` 和 `all`，原始完整日志本身就把 race 结果和其他操作完成分开；当前没有证据说明额外图能更快解释。问题中的简写 `Promise.race(promise1, promise2, ...)` 不是 API 正确签名：应传一个 iterable；不能复制该笔误作为运行 fixture。

[MDN 固定版本的完整 Promise.race 文档](https://github.com/mdn/content/blob/5ea23b22929815583ac57f4cb69fcb61321cdce1/files/en-us/web/javascript/reference/global_objects/promise/race/index.md) 包括双 timer 的完整原生例及其预期 winner `two`、实际 fetch 与 timeout 完整代码，并说明失败分支的操作不会因 race 结算自动取消。fetch 例并未记录输家的完成日志，不能把理论行为冒称同输入捕获轨迹。原生解决办法是支持信号的操作用 `AbortController`，timer 则清除；[固定 fetch 指南](https://github.com/mdn/content/blob/5ea23b22929815583ac57f4cb69fcb61321cdce1/files/en-us/web/api/fetch_api/using_fetch/index.md) 的完整示例解释 abort。发出 abort 信号不等于证明远端副作用被撤销或所有底层工作已结束；要看操作自身契约和实际观测。

[同版本 Promise.any](https://github.com/mdn/content/blob/5ea23b22929815583ac57f4cb69fcb61321cdce1/files/en-us/web/javascript/reference/global_objects/promise/any/index.md) 的完整三输入例包含一个先 reject、较快与较慢 fulfill，期望输出 `quick`。`race` 采用首个 settlement（含 rejection），`any` 采用首个 fulfillment，全 reject 时才以 AggregateError reject。`any` 的 winner 输出也不证明输家被取消；不能把 promise 自身描述为执行中任务，或把 resolved 和 fulfilled 混同。[Promise 文档](https://github.com/mdn/content/blob/5ea23b22929815583ac57f4cb69fcb61321cdce1/files/en-us/web/javascript/reference/global_objects/promise/index.md) 区分 resolved/settled，并说明无通用 Promise 取消协议。

## 原生工具的边界

[Node 固定 async_hooks 文档](https://github.com/nodejs/node/blob/628fd73a88c373233e2e36c2237ae0daf5321b63/doc/api/async_hooks.md) 描述 async resource、init/before/after/destroy 和 promiseResolve；文档明确不推荐将低层 createHook 用作一般方案，另列 AsyncLocalStorage 和 active resources 等替代。单个 resolve hook 或 destroy 不能证明网络请求的副作用已撤销，异步 ID/trigger 不能无证据当业务操作身份或完整因果。不存在此自然问题同一输入的完整 hooks 捕获，故不能称其本身已解题。

[Loupe 固定源码 `ce336bc8`](https://github.com/latentflip/loupe/tree/ce336bc8db31ebbd46f6659ac8e26019cfa11fde) 展示 call stack、callback queue 和 timer；但 [#14](https://github.com/latentflip/loupe/issues/14) 提供完整 Promise 示例并报告仅运行首行，[#21](https://github.com/latentflip/loupe/issues/21) 请求区分 microtask，均 open。它们是历史用户报告，未在本轮重跑，不能假设 Loupe 是此 Promise 案例的可靠基线；也不能把它不支持 Promise 当 Archify 有效的证明。该 repo 的 [license 问题 #26](https://github.com/latentflip/loupe/issues/26) 尚未明示许可；不复制代码。Stack Overflow 用户贡献遵循其页面适用 CC BY-SA，具体版本需按文章日期和修订核查；此处只链接而不复制。MDN 文档为 [CC BY-SA 2.5](https://github.com/mdn/content/blob/5ea23b22929815583ac57f4cb69fcb61321cdce1/LICENSE)，Node 为 [项目许可证](https://github.com/nodejs/node/blob/628fd73a88c373233e2e36c2237ae0daf5321b63/LICENSE)。

## 与现有实验关系和研究门槛

[trace-waterfall `8e65f150`](https://github.com/tt-a1i/archify/tree/8e65f150b8db6947c98f9b12e37d970014e0ea7e/experiments/trace-waterfall) 表示测得的 X 区间，不推依赖；[trace-flow-evidence `9f9f9dac`](https://github.com/tt-a1i/archify/tree/9f9f9dacf58832f1c8784a1a24f6e04c456a4881/experiments/trace-flow-evidence) 只显示源事件明示的 flow；[operation-order `bc6cb7cd`](https://github.com/tt-a1i/archify/tree/bc6cb7cde3d11b2f9e3fe65035cc04829e5f2194/experiments/operation-order) 对操作约束做文字/图对照，不是 Promise 流程或完成证据。它们覆盖可视化形态但不自动观测 Promise 与资源，不能复制一个时间轴就算增量价值。

若以后考虑验证：找可合法固定版本的完整公开案例及同一次运行原始事件，记录每个操作启动、实际结束/失败、combinator settlement、是否发送/响应 abort；承认未观测事件为未知。与相同源码和完整原生日志比较，并以独立读者回答“谁决定结果、哪些操作后来完成、是否实际取消、证据是什么”，记录错误、时间和原答。图若只是重排已清楚的文本，或需要从未观察的 Promise/网络状态推断取消，停止。instrumentation、版本变化、受支持操作的取消行为、隐私、系统时钟与性能开销必须计入维护；目前无同输入、跨工具原生捕获或读者试验，故不建议构建。

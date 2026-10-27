# 调试调查交接：先验证选中对象与证据是否一致

2026-10-28，只读，**建议 defer**。Playwright 有真实的历史交接错配报告，但其对应问题已关闭，当前固定源码已按选中的 run 取 trace；没有可公开、同一输入的当前导出实测证明还存在选中 action/截图/source 丢失，不应新建概念页面或 importer。Pernosco 的公开调查与分享已在本地 scout 覆盖，亦不能作为未解决缺口。

## 排重与可复核任务

[reverse-debugger-reading](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/reverse-debugger-reading.md) 已分析 rr/Pernosco 反向 watchpoint、值流、notebook 与会话共享；Pernosco 官网称会话可共享，未核独立实际录制及重开。该商业服务 FAQ 说不计划开源，未找到可固定服务源码/version；没有证据称其分享会丢 selection。[async-trace-reading](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/async-trace-reading.md) 与 trace-flow-evidence 处理显式关联端点，不是 Playwright 的 action/snapshot 交接。历史及当前 scouts 关键词检索不是语义穷尽。

[Playwright #41281](https://github.com/microsoft/playwright/issues/41281) 的真实报告：1.60.0 中有多个 retry 的 HTML report，选非首个 run 后 View Trace 却打开首个含 trace 的 run；这会使接收者看错运行证据。报告给出步骤和 screenshot，没有可供同输入复现的完整 report/trace pair；该 issue 于 2026-06-16 closed/completed。固定 [Playwright@ad5210f22217b64149459c58abfa6069f4b203cc](https://github.com/microsoft/playwright/tree/ad5210f22217b64149459c58abfa6069f4b203cc) 2026-10-27 默认分支、[Apache-2.0](https://github.com/microsoft/playwright/blob/ad5210f22217b64149459c58abfa6069f4b203cc/LICENSE)。当前 [TraceLink](https://github.com/microsoft/playwright/blob/ad5210f22217b64149459c58abfa6069f4b203cc/packages/html-reporter/src/links.tsx#L135-L150) 在有效 run 提供时只从该 run 的 attachments 选 trace；无有效 run 时才回退到 test.results。源码支持较窄的当前选择规则，不是本轮 UI 运行或覆盖所有调用方的证明，也不说明该历史问题仍然发生。

## 原生完整能力是基线

固定 [Trace Viewer 文档](https://github.com/microsoft/playwright/blob/ad5210f22217b64149459c58abfa6069f4b203cc/docs/src/trace-viewer.md)：可打开本地或远端 trace；在 `trace.playwright.dev` 本地浏览器读取，远端访问受 URL 权限与 CORS 约束。动作选择可查 source、日志、before/action/after DOM snapshot；时间选区过滤 console/network，attachments 有截图比较；具体数据取决于录制配置及 archive 实际内容。Trace zip 及 viewer 是原生基线，不能拿一张截图与原始 log 冒充它；DOM 快照是录制状态，不是一次可完整重放的真实 browser execution 或整个生产环境。

公开请求 [#38936](https://github.com/microsoft/playwright/issues/38936) 希望将 trace 转为便于 AI 阅读的 Markdown/快照，包含作者提供的 original/export 对；评论说该诉求由 [#39735](https://github.com/microsoft/playwright/pull/39735) 的 trace CLI 处理，该 PR 2026-03-18 merged，而不是证明原提议的所有导出格式均实现。固定 [traceCli.ts](https://github.com/microsoft/playwright/blob/ad5210f22217b64149459c58abfa6069f4b203cc/packages/playwright-core/src/tools/trace/traceCli.ts) 明列 open、actions、action ID、requests、console、errors、snapshot（before/action/after）、screenshot 和 attachments；这是另一条必须纳入的 native 阅读基线。本轮未下载 issue 的 zip、执行 CLI、查看浏览器或核该用户示例的完整等价性。

固定仓库还提供 [test-trace1.zip](https://github.com/microsoft/playwright/blob/ad5210f22217b64149459c58abfa6069f4b203cc/tests/assets/test-trace1.zip) Git blob `1a7fdf09aa158b49173d409e5a4f099f9077d532`、12,214 bytes 和 [test-trace2.zip](https://github.com/microsoft/playwright/blob/ad5210f22217b64149459c58abfa6069f4b203cc/tests/assets/test-trace2.zip) Git blob `dbc82631e13d79eda37284407d62ef6a07495d26`、12,244 bytes；仅证实公开测试资产存在，尚未读内部内容或证明它们对应 #41281 的同一多 retry 场景，不能拼成虚构 reproducer。

## 具体尚未验证的 seam

用一份许可明确、完整可公开的多 run report + trace，固定 reporter/viewer 版本和每次 trace 的 hash；选择某个 run 和 action、标明 source location、snapshot phase、相关网络或日志，再将原生报告/trace 交给接收者。比较完整 Trace Viewer 的远端入口、HTML report 选 run、以及 trace CLI 的同 action ID 输出，观察接收者是否能恢复相同对象与证据；记录录制缺项、URL 授权和 CORS。只有同输入的实际重开与完整状态观察能证明选中 action 或证据丢失；不从文档未提 permalink 推断功能不存在。若这一点 native 已能解决，不做重复 explainer；若确有受损，再考虑绑定 trace hash、run、action ID、snapshot phase 和引用的 authored handoff，而非新 profiler/trace parser 或因果图。没有安装、执行、构建、浏览器操作、外部消息或仓库更改。

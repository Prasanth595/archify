# Batch 19：SARIF code-flow 阅读去重与原生能力

结论：**defer，0 新实验/通用 importer**。这不是新方向：历史 `origin/codex/research-lab-20261025@60342aa9` 的 `docs/research/2026-10-25/scouts/codeflow-evidence-smalltools.md` 已深入同一规范、同一四步 Semgrep fixture、VS Code Analysis Steps 和“同一行不能按位置去重或重新排序”的问题，并提出有条件的 Explainer 内容原型但未做；没有新证据证明该原型优于完整原生工作流。此次只读公开资料，没有运行 scanner、VS Code/GitHub 界面、目标程序或读者实验。固定源信息不等于当前产品现场行为。

## 直接证据与边界

历史报告固定 SARIF 2.1 [规范 §3.36–3.38](https://github.com/oasis-tcs/sarif-spec/blob/1742a253eb654bf8a4ed7c60eaef7412b2c23553/sarif-2.1/prose/sarif-v2.1.0-committee-specification.htm)：一个 codeFlow 可有多个 threadFlow；每个 threadFlow 的 locations 是生产者提供的有序位置，允许重复和省略中间项。可表达静态模拟，也可表达监测；单凭 SARIF 或 path-problem 不能声称某次真实执行、精确调用、时间或并发。数组出现位置可作为该报告内 ordinal；不能以 `uri:line` 折叠，或按源码列重新排序。标准的跨线程 executionOrder、UTC 等仅在生产者确实提供并有依据时解释，不由数组索引发明。

已固定的最小正式样例是 [Semgrep expected results.sarif@087e93b](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/snapshots/test_output_sarif/test_sarif_output_with_dataflow_traces/results.sarif)，SHA-256 `e56bbc86a088bbf196979098a932ed4abe70d81ddef749bd28078c449fe366db`；[根 LGPL-2.1 许可](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/LICENSE)，不概括其商业服务。result0 有 1 flow / 1 thread / 4 locations：L3 C9–18 source、L3 C5–6 propagator、L8 C9–10 propagator、L9 C5–13 sink；列末端不包含。前两步同一行但不同表达式，按列排序会颠倒报告顺序；相关 [taint.py](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/targets/taint/taint.py) 的 else 步更不能说成真实执行过。此为上游测试 expected，非新的扫描或漏洞确认；不把不同列简化为相同精确 source span。

## 最强原生基线与真实需求

[GitHub CodeQL VS Code 官方文档](https://docs.github.com/en/code-security/how-tos/find-and-fix-code-vulnerabilities/scan-from-vs-code/explore-data-flow)说明 `@kind path-problem` 的 source→sink 结果可展开步骤并点击跳转源码；[GitHub code scanning 文档](https://docs.github.com/en/code-security/concepts/code-scanning/code-scanning-alerts)说明同一漏洞多个相关路径可聚合在同一 alert。两者是官方能力描述、产品会变化，本轮没有实际操作或用相同 fixture 验证；不得把其等同完整 SARIF 所有输入均可显示。

[microsoft/sarif-vscode-extension@7b4a089](https://github.com/microsoft/sarif-vscode-extension/tree/7b4a08983025ba37f545c6ced3ef40d5413edee4) 的 [MIT 许可](https://github.com/microsoft/sarif-vscode-extension/blob/7b4a08983025ba37f545c6ced3ef40d5413edee4/LICENSE) 与 [README](https://github.com/microsoft/sarif-vscode-extension/blob/7b4a08983025ba37f545c6ced3ef40d5413edee4/README.md)覆盖结果面板、过滤、源码映射；固定 [details.tsx](https://github.com/microsoft/sarif-vscode-extension/blob/7b4a08983025ba37f545c6ced3ef40d5413edee4/src/panel/details.tsx) 有 Analysis Steps 和源码定位，但历史源码审计只看到首 codeFlow 的首 threadFlow。正式自然需求 [#137](https://github.com/microsoft/sarif-vscode-extension/issues/137) 于 2019 提出只能显示首 threadflow，查询时仍 open；这说明有人报告该范围缺口，不证明所有当前版本或 GitHub 产品同样缺失。另一真实报告 [#441](https://github.com/microsoft/sarif-vscode-extension/issues/441) 描述不同结果指向同一源码行时装饰意外跳到另一 code flow，附视频和样例，查询时 open；它涉及**不同 result 同行**，并不证明本 Semgrep 同 thread 同行两个不同列也触发问题。两条状态为本次查询，可能变化；未运行其复现样例。

## 已有 Archify 工作和可行动判断

- `codex/lab-static-uses@7be0711d` 展示静态 use occurrence，强调同名 use、控制分支非运行路径；并非 SARIF report 的顺序和多 thread 证据。
- `codex/lab-diagnostic-locations@b6679399` 已将诊断 subject 位置用于普通输出/preview；它解决修复位置识别，不等于 codeFlow 步骤序列。历史 source tour / task-flow-tests 已覆盖按证据跳转和作者声明路径、测试关联，但不把声明路径当执行或覆盖。本轮不将四步内容重复包装为新发现。
- 低维护方案理论上是直接作者编写 Explainer：保留 report-local ordinal、原始 source range 与明确静态 witness，链接固定原始报告/源码；不建立 SARIF parser，不把潜在关系画成真实调用。但同一四步内容和候选已在历史 scout 中定义，VS Code 也有有序跳转。#137 的多 thread 才是有明确需求的不同问题，现有单 thread Semgrep fixture不能验证它；#441 也需不同 result 的完整输入及现行原生对照。没有同一完整输入、操作和可复核期望、真实接手者任务或比较结果，无法证明新内容解决缺口或收益，故目前不启动。
- 若以后获得授权可用的多 thread 原始报告和自然任务，先固定 producer 版本、完整 SARIF、源 revision/columns、每个 thread 的期望及 native VS Code 和 GitHub 实际显示范围；再比较能否正确选择 flow/thread、区分重复 occurrence、不声称真实执行、恢复原文并指出遗漏。无法比较或原生已满足时停止。多 flow、嵌套、索引引用、外部属性、源漂移等会让通用 importer 和长期维护显著扩大，不在本建议范围。

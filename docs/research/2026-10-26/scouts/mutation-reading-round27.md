# Round 27：变异结果阅读与覆盖证据

2026-10-28，只读。**结论：不重复新建 reader、图或执行器。** 既有研究已对同一个完整 Stryker 报告、两种未检出状态及原生 viewer 深核。新增的真实用户问题是报告与手工施加变异的测试结果不一致，属于 producer/runner 证据可靠性，不是把同一报告重画即可解决。未运行、安装、打开浏览器、修改仓库或创建 PR。

## 排重与完整原生样本

历史 [mutation-evidence-smalltools](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/mutation-evidence-smalltools.md) 已调查 Stryker、PIT、mutmut 等，并在检查原生 viewer 后收回两变体新 reader 建议；当前 hub 的 counterexample scout 已引用此结论。现有 test-failure-map 解释测试失败位置，不能代替变异状态；覆盖率本身也不能证明变体可被断言区分。remote 关键词未见新的 mutation 专属分支；并非穷举。

固定 [Stryker Elements `9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a` 完整官方 report](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/testResources/tests-example/mutation-report.json) 保存 11 文件、82 测试、161 mutants，含完整嵌入源码与测试关联；[同目录 HTML fixture](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/testResources/tests-example/index.html) 需要相邻 JSON 与由开发服务提供的脚本路径，不能称双击即完整离线报告。固定源码的 HTML reporter 可内嵌报告与构建好的 viewer，但这不证明本次该 fixture 已构建或实际断网可用。

现有研究核对该报告的 `errors.ts`：id 72 为 Survived、ConditionalExpression，原 `error instanceof Error` 替换为 `true`，4 个覆盖测试 ID；id 81 为 NoCoverage、BlockStatement 替换为 `{}`，`testsCompleted=0`、未提供 `coveredBy` 字段。**未提供不等于明确空数组**。它是完整 producer fixture 中的不同记录，不是生产事故或本次运行。报告包括 Killed 147、Survived 7、NoCoverage 4、Timeout 3；原生 [状态/metrics 合同](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/docs/mutant-states-and-metrics.md) 中 timeout 算 detected，不等同断言杀死或证明无限循环。

[原 file 组件](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/components/file/file.component.ts) 默认展示 Survived、NoCoverage、Timeout，按源码位置呈现变异及替换；[drawer](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/packages/elements/src/components/drawer-mutant/drawer-mutant.component.ts) 可显示覆盖与杀死测试关联；文件搜索和文件级 deep link 在历史报告中逐项核对。没有证据显示再做表/图能减少特定阅读步骤，也没有本轮点击或浏览器验证。

## 新的自然问题：结果是否可信？

[Stryker JS issue #5928](https://github.com/stryker-mutator/stryker-js/issues/5928) 用户报告 Vitest 4.1.2 与 Stryker 9.6.0 `perTest` 下无正确覆盖、NoCoverage 列为零，并提供完整 config、版本、日志与复现 ZIP；[维护者复现并解释](https://github.com/stryker-mutator/stryker-js/issues/5928#issuecomment-4223560601) Vitest API 变更，后表示 9.6.1 发布修复。后续另一用户在 [完整评论](https://github.com/stryker-mutator/stryker-js/issues/5928#issuecomment-4687946420) 报告 9.6.1 + Vitest 4.1.8 的真实项目中两个逻辑变异显示 Survived，而手工应用各 replacement 后现有测试失败；另有声称 NoCoverage 但测试执行该行。[维护者后续](https://github.com/stryker-mutator/stryker-js/issues/5928#issuecomment-4769129416) 表示只能间歇复现，并给两次完整汇总；这不能证明两次是同一 source SHA、同一 mutant 或所有环境的确定性 bug。评论仅链接项目，没有公开绑定完整 report JSON、原始每次运行、手工修改 diff/完整测试日志及固定提交，不能拼成已验证的同次证据。原 issue 为 closed，不等于后续现象被证伪或已修复。

这一问题需要比报告更多的独立证据：固定 source、runner/插件版本、配置和选择范围、完整 baseline、报告、每个 mutant 原 replacement 与同一测试的手工对照、重复运行和覆盖仪器行为。即使新图忠实显示 `coveredBy`，也不能仅从 report 中验证配对本身正确；错误输入会得到整齐但仍错误的图。状态是该运行中 producer 的结论，不是自动等价性判定。Survived 既可能有测试覆盖但缺少区分，也可能是语义等价、配置/检测问题或其他原因；单凭分支/行覆盖不足以证明具体突变体执行、被测试杀死或非等价。Timeout 也不是 Survived，也不自动说明无限循环。

## 可否做低维护内容？

若将来取得上述**同一完整输入和原始对照**，现有 Explainer 可人工并列单个 mutant 的来源行、replacement、报告状态、覆盖记录及独立运行结果，标明未知/冲突，并与完整原生 HTML + 源码 + 测试日志公平比较；只有独立读者确实在证据核对上受阻才做一次有界内容实验。先核固定 fixture 的许可和测试位置口径，不能根据行覆盖代替变异覆盖，不从空字段推断零覆盖，不自动标 equivalent 或建议删除测试。若同一原生 viewer 及日志已回答，或需要维护版本兼容层/重构报告，即拒绝。

上游 [Stryker Elements Apache-2.0](https://github.com/stryker-mutator/mutation-testing-elements/blob/9fea6256a94a5d07ee7e0edde0d499b26dc0cf9a/LICENSE)、[Stryker JS Apache-2.0](https://github.com/stryker-mutator/stryker-js/blob/c18ed458dc9defe1e4d7162cdec345d5073bff38/LICENSE)；[PIT 固定 Apache-2.0](https://github.com/hcoles/pitest/blob/f7fe5adfa5fb6e727c12d2403a48f5e4e9dd2fc6/LICENSE.txt) 的 bytecode mutation 一行可有多个 index、未必提供可精确重建的源码替换；[mutmut BSD-3-Clause](https://github.com/boxed/mutmut/blob/86564d8bbabd7efff0f22cdfe82020e292610956/LICENSE) 自有状态与浏览器/TUI。不同工具状态和分母不可统一重命名。以上是固定全文件链接或公开讨论，未复制执行。

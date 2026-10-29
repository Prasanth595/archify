# 反例收缩阅读：先与完整文本树比较

2026-10-27，只读研究。**结论：暂不启动实验或产品改动。** fast-check 已能输出包含成功、失败和跳过的缩进执行摘要；还没有证据说明 Archify 树图在具体阅读问题上优于它。下述小案例是根据上游测试合同构造的手工演绎，不是一次真实 fast-check 运行，也不是上游现成报告。没有安装、运行上游、生成截图、推送或修改共享运行时。

## 排重

历史 [mutation evidence](https://github.com/tt-a1i/archify/blob/60342aa9/docs/research/2026-10-25/scouts/mutation-evidence-smalltools.md) 比较代码替换和测试判定，最终因原 viewer 已提供相关信息而拒绝另造 reader；它不是生成器的收缩过程。[model witness](https://github.com/tt-a1i/archify/blob/60342aa9/docs/research/2026-10-25/scouts/model-witness-smalltools.md) 讨论模型执行位置与 lasso 回边；这里的子节点是一次失败后的候选尝试，不能解释为程序状态转移或循环。[benchmark reading](https://github.com/tt-a1i/archify/blob/60342aa9/docs/research/2026-10-25/scouts/benchmark-reading-round12.md) 比较数值分布，不是尝试树；[state lifetime](https://github.com/tt-a1i/archify/blob/60342aa9/docs/research/2026-10-25/scouts/round20-state-lifetime-reading.md) 区分静态状态集合与运行事件。既有 test-failure/test-context 关注错误与覆盖上下文，不提供收缩探索语义；但普通树或源码定位本身并非新价值。

## 可核查合同和一个小例子

唯一来源是 [fast-check 固定源码 0207dd291888c8cae224b254230ad01b315df296](https://github.com/dubzzz/fast-check/tree/0207dd291888c8cae224b254230ad01b315df296)，[MIT 许可全文](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/LICENSE)。[RunExecution 测试](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/packages/fast-check/src/check/runner/reporter/RunExecution.spec.ts) 以模拟调用断言：VeryVerbose 保持各层执行顺序，失败节点进入其 children，成功和跳过没有 children；失败列表沿失败链。该测试是组件合同，并不提供下面这组固定输入的真实运行收据。

根据此合同，设一个**原创、未运行的模拟事件序列**：`success(2), fail(8,1), skip(0), success(1), fail(4,2), success(3)`。它对应根层 success 2、failure 8；8 下依次 skipped 0、success 1、failure 4；4 下 success 3。节点出现位置而非数值是身份；不应把所有值排成线性逐步变小的轨迹。按 [RunExecution 实现](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/packages/fast-check/src/check/runner/reporter/RunExecution.ts)，在空 basePath 和给出的调用 id 下，失败链为 8→4，`numShrinks=1`，path 为 `1:2`，最终 counterexample 4；这里的 id 是手工传入，**不是证明真实生成器会产生此 path 或这些值**。`numShrinks` 算失败链后续层数，不是树内全部尝试数量；`numSkips` 只计首次失败之前的跳过，例中失败后的跳过不能随意计入它。相同值出现两次也不能合并。

公平基线是同一实际运行的原生 `VeryVerbose` 报告，不是默认只含 seed/path/最终值的简短输出。[formatter](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/packages/fast-check/src/check/runner/utils/RunDetailsFormatter.ts) 已用缩进和状态符输出 execution summary；`Verbose` 只列失败，`None` 不提供树，缺失成功/跳过不等于它们没有发生。[RunDetails](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/packages/fast-check/src/check/runner/reporter/RunDetails.ts) 定义运行计数、seed、counterexamplePath、verbose、interrupted 等。重放需要 seed 与 path 及相容的测试、生成器、版本和配置；不能将 path 当独立值或保证跨版本稳定。最终反例是该运行收缩结束得到的失败值，不声称全局最小、所有可能候选都执行、测试整体正确；中断和过多跳过也不能伪装为普通失败反例。

## 价值和成本门槛

潜在具体问题是：审阅者能否区分“最终失败链”与其间被尝试但成功或跳过的候选，解释为何 `numShrinks` 少于尝试数？静态图可显式突出失败链、保留同层顺序与原状态，但原生 VeryVerbose 已有相同树和状态；当前没有显示它遗漏了此问题所需信息，也没有真实阅读比较。维护通用导入、序列化任意 JS 值、超大树裁剪、版本兼容与隐私处理的成本不成比例。故只保留问题，不建 reader、parser、runner 或产品功能。

如果后续确实需要验证，先在隔离临时目录固定 fast-check 版本、Node 版本和锁文件，使用自写无网络、无副作用、确定性 property 和固定 seed/参数，记录原始 `fc.check` 结果及同一 `defaultReportMessage` VeryVerbose 文本、版本和完整输入；先核实实际结果包含多个不同状态并适合一屏，否则停止。依赖及被测 property 都是可执行代码，使用可审查固定包和本地合成输入，避免私有源码/路径；不依赖 live Archify 安装。若样本成立，再用现有 Archify 的一张有界静态内容图并列原文本，让独立读者完成相同的失败链、跳过项和计数问题，记录错误与耗时、截图及失败尝试；若文本同样清楚或图需隐去重要节点则拒绝。此步骤只是未来验证方案，**本轮未运行、未实现，也不声称阅读收益**。


## 第 59 批：浏览器构建实际执行

[配置与原生报告对照](fast-check-config-native-round59.md)补充三组固定运行：默认收缩、全局关闭、局部覆盖。原生报告均给出 endOnFailure:true 重放提示，但实际配置分别为 false/true/false；默认六项尝试中含失败后跳过，numSkips 仍为 0。保留来源、原始报告、复跑及两张实拍。这是 4.10.2 浏览器构建的原创合成 property，不是原 3.15.1 讨论重演或手工事件序列的执行，仍没有新增树图的收益证据。

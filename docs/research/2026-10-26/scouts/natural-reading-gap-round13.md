# 第13批：既有阅读方向的自然用户问题核查

2026-10-28，只读；未安装、运行上游、使用浏览器、修改产品或提出 PR。源码基线 fast-check `0207dd291888c8cae224b254230ad01b315df296`、marimo `23162ed14182afdcec9272c022870e710e41f645`；issue 为其各自历史问题，不能假定问题在当前版本仍原样存在。

## fast-check：真实疑惑成立，但不支持树图对照

[Discussion #4956](https://github.com/dubzzz/fast-check/discussions/4956) 是实际用户报告：3.15.1 的简单 integer property 返回 `Shrunk 0 time(s)`，不理解为什么没尝试收缩。另一用户用相同依赖复现获得 1 次收缩；维护者问是否存在全局配置，提问者确认 `configureGlobal({endOnFailure: true})` 是原因。用户又问输出里始终显示 `endOnFailure: true` 是否表示本次配置如此；维护者解释该对象是仅重放反例的建议参数，而非当前运行配置。原讨论包含代码、输出和最终确认。这里没有一棵未理解的真实尝试树：全局设置使收缩根本未发生；图不能从尝试树推断未附带的有效配置，更不能把重放参数误报为运行设置。无需启动树图比较。

完整原生基线应包括当次有效全局/局部配置及它们的优先级、原始错误与重放提示，以及 [VeryVerbose 格式化器](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/packages/fast-check/src/check/runner/utils/RunDetailsFormatter.ts) 的缩进执行摘要及其成功/失败/跳过；[Runner](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/packages/fast-check/src/check/runner/Runner.ts) 合并全局与局部参数，并在 `endOnFailure` 时关闭 shrink。不能用默认简短报告替代 VeryVerbose 来制造优势。即便做固定运行也只能验证配置和报告语义，不能以该问题证明图更易读。

[Discussion #5276](https://github.com/dubzzz/fast-check/discussions/5276) 为另一有具体场景的用户：数据库测试担心每次 property 运行重置开销及依赖生成，维护者解释跨运行遗留数据库状态会让缩小后的反例不再指向真实故障，并讨论重置/模拟。这是测试隔离与外部状态问题；执行树不记录数据库真实状态，不能解决。无需纳入图实验。若未来有完整、真实、多状态报告的自然阅读任务，才考虑同一次运行的 VeryVerbose 对照；须支付值序列化、隐私、版本和大树裁剪成本。

## marimo：真实问题是控制语义与操作，不是证明另一个图有用

[Issue #2100](https://github.com/marimo-team/marimo/issues/2100) 发起者在 2024 年具体困惑 notebook 的 lazy 与 cell disabled/reactive execution：不同术语、UI 和行为导致错误猜测；希望逐 cell lazy。[维护者解释](https://github.com/marimo-team/marimo/issues/2100#issuecomment-2307493115) disabled 会阻止该 cell 及后代，适合避免写生产库等副作用；[进一步说明](https://github.com/marimo-team/marimo/issues/2100#issuecomment-2311484961) disabled cell 可以编辑并加入图而不运行，重新启用后行为取决于 stale 与 autorun/lazy 模式。问题当前 API 查询显示 open，不代表原界面/功能保持不变。

[另一位用户的具体工作流](https://github.com/marimo-team/marimo/issues/2100#issuecomment-3006388644) 是 runnable playbook：读取展示需要响应式，更新外部系统必须手动；`mo.ui.switch` 需在另一 cell 并逐个命名。[维护者建议](https://github.com/marimo-team/marimo/issues/2100#issuecomment-3006403501) `mo.ui.run_button()` 加 `mo.stop()`；[用户回应](https://github.com/marimo-team/marimo/issues/2100#issuecomment-3006523316) 指出跨 cell 移动、SQL 编辑模式及脚本执行的具体摩擦。后续[其他用户](https://github.com/marimo-team/marimo/issues/2100#issuecomment-3407954913) 给出非 notebook 分支与 button callback 的替代方案，但非原提问者确认可解决所有情况。真实需求是控制执行及编辑体验，静态图无法提供控制或证明消除摩擦。

完整对照必须包含原生 notebook 的 cell 状态、lazy/autorun 设置、disabled 与 stale 行为和重新启用动作，以及 [固定 dataflow 文档](https://github.com/marimo-team/marimo/blob/23162ed14182afdcec9272c022870e710e41f645/docs/guides/editor_features/dataflow.md) 中 Dependencies 面板的 minimap、交互式 Graph、引用高亮与跳转；[固定 reactivity 文档](https://github.com/marimo-team/marimo/blob/23162ed14182afdcec9272c022870e710e41f645/docs/guides/reactivity.md) 解释运行与控制。只与手工事实短表比较不足以称优于原生体验。上述自然问题没有提供可核查的真实 notebook 状态快照或独立阅读任务，因此不建议现在启动有界阅读对照，更不建议导入器；若今后可获得公开可重放例子，先在同版本原生 UI 完成同一问题，再考虑并列，记录状态来源与未观察项；切勿推断实际执行顺序。

维护代价：持久同步 notebook 静态依赖与运行时状态、版本/UI 变化、传递禁用和 stale 的独立语义、状态快照、非颜色可访问性及浏览器交互均需维护。仅从源码单测手工抽取链图只能证明对测试事实的展示，不能代表上述用户操作问题得到解决。


## 来源与许可

沿用已核验的同一固定源码版本：[fast-check MIT](https://github.com/dubzzz/fast-check/blob/0207dd291888c8cae224b254230ad01b315df296/LICENSE)、[marimo Apache-2.0](https://github.com/marimo-team/marimo/blob/23162ed14182afdcec9272c022870e710e41f645/LICENSE)。本笔记仅链接和概述来源，没有复制项目源码或截图；讨论内容不假定自动继承仓库代码许可。前序归档分别见[counterexample-reading](counterexample-reading.md)与[reactive-reading](reactive-reading.md)。

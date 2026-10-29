# 并发操作历史：区间、合法顺序与未知结果

2026-10-29 跟进：[第 56 批原生 checker 与页面对照](porcupine-native-round56.md)已实际运行本文同一六事件模型，并验证一个单字段合法对照。以下“未运行”属于初轮调研记录；新的原生证据仍未证明额外约束图能提高阅读效率。

后续实现与真实页面对照已完成，见[总账第三批](../README.md#27-日第三批约束阅读与复用已有候选)。以下保留实施前的筛选依据；“未实现”描述的是调研阶段。

2026-10-27，筛选结论：**选一个受限内容实验候选**：用 Porcupine 作者编排的三操作示例，对照同源行表与三条带依据的顺序约束。说明性输入可以用于可复现实验，必须如实标注，不能冒充自然采集或读者需求。上游还提供 Jepsen 日志，但目前没有把其中一份小原件、明确模型、对应 checker 结果和来源许可链一起核实；不能把 README 的例子和另一个日志拼成“真实检测结果”。没有运行、安装上游工具，也没有做 Archify 实现。

## 已有工作与排重

读过 [PRODUCT](../../../../PRODUCT.md)、[CONTRIBUTING](../../../../CONTRIBUTING.md) 及 prior hub 的 `concurrency-evidence-smalltools`、`concurrency-reading-round13`、`profile-reading-smalltools`。前者已区分历史锁序、当前等待与死锁声明，profile 研究已指出时间包含不能推出因果；这些不回答寄存器操作返回值是否符合某个顺序模型。对 prior hub 的 `docs/research` 搜索 Porcupine、Knossos、`jepsen-io/elle` 没有命中；这不是全世界排重。

已有 [trace-waterfall](https://github.com/tt-a1i/archify/tree/8e65f150b8db6947c98f9b12e37d970014e0ea7e/experiments/trace-waterfall) 显示实测区间但明确不推依赖；[trace-flow-evidence](https://github.com/tt-a1i/archify/tree/9f9f9dacf58832f1c8784a1a24f6e04c456a4881/experiments/trace-flow-evidence) 展示源数据明示的 flow 端点；[task-occurrences](https://github.com/tt-a1i/archify/tree/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences) 区分打印位置与任务身份；[state-contract](https://github.com/tt-a1i/archify/tree/f7269e096ac1891b434842cf7e16b9ffdd54cdf6/experiments/state-contract) 核对静态声明而不运行状态机；[witness-groups](https://github.com/tt-a1i/archify/tree/861ec02283bcd32c8315aa7b5f8b5ef9678dda27/experiments/witness-groups) 保留来源组合。没有任何一个可直接充当线性化 checker 或合法顺序的证据。

本轮对 `tt-a1i/archify` 分别搜索 issues 和 PRs 的 `linearizability`、`operation history`，未返回结果；搜索词有限，不能断言完全没有相关工作。

## 固定来源与阅读合同

- [Porcupine @ 97cd067defd99df172053ba7f4ca5bbae57fe446](https://github.com/anishathalye/porcupine/tree/97cd067defd99df172053ba7f4ca5bbae57fe446)：[完整 MIT 许可](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/LICENSE.md)。[README](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md) 定义输入为顺序模型与调用/返回事件或区间；checker 输出相对该模型的结论。其交互视图展示完整或部分线性化及模型禁止的候选点，而不是仅按开始时间排序。README 的寄存器示例中 `put(200)` 与两次 read 均重叠，但先结束的 read 返回 200，之后的 read 返回 0；README 显示对给定初态与模型调用结果为 false。此处只核对上游文本，不是本轮运行或自然事故。两次 read 的实时先后约束，加上读值与模型，导致无法放置一次写入来解释两者；长写操作重叠两次读取并不能消除此矛盾。
- [checker.go](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/checker.go) 的 `PartialLinearizations` 明确区分完整与最大部分顺序；timeout 可返回 `Unknown`，不等于合法或非法。实际标记的线性化点是与模型相容的解释，不是观察到的内部执行瞬间，也不唯一证明因果。不要因时间位置推断网络消息、内部节点顺序或根因。
- [Knossos @ 14ead19fb3d24745429e367c8ae9779e147ff6cb](https://github.com/jepsen-io/knossos/tree/14ead19fb3d24745429e367c8ae9779e147ff6cb)：[项目声明 EPL-1.0](https://github.com/jepsen-io/knossos/blob/14ead19fb3d24745429e367c8ae9779e147ff6cb/project.clj)，[完整 EPL-1.0 文本](https://www.eclipse.org/legal/epl-v10.html)；固定仓库根没有独立 LICENSE 文件。其 [README](https://github.com/jepsen-io/knossos/blob/14ead19fb3d24745429e367c8ae9779e147ff6cb/README.md) 区分操作 completion 的 `:ok`、`:fail`、`:info`（如超时而结果不明）及 checker 自身的 `true`、`false`、`:unknown`。操作未知与分析未完成是两个不同层面，均不可自动当作失败。上游自己也提醒算法结果需人工核对。
- [Elle @ 4e359e597c52938b0afebb8bc42273914d68a424](https://github.com/jepsen-io/elle/tree/4e359e597c52938b0afebb8bc42273914d68a424)：[完整 EPL-2.0 许可](https://github.com/jepsen-io/elle/blob/4e359e597c52938b0afebb8bc42273914d68a424/LICENSE)。[README](https://github.com/jepsen-io/elle/blob/4e359e597c52938b0afebb8bc42273914d68a424/README.markdown) 讨论事务依赖环与异常见证，并提醒人工核对推断规则；这是不同于单对象线性化顺序的检查合同，不能把任意区间重叠直接画成事务依赖环。

Porcupine [test_data README](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/test_data/README.md) 仅把 Jepsen 数据指向另一项目；该说明不足以确定某日志采集条件、完整许可和对应结果。固定仓库 MIT 不应未经核实自动覆盖外来日志。没有复制日志、代码、UI 或上游依赖。

## 唯一候选：三条顺序约束对照原始行表

**问题**：“这些返回值为什么不能同时满足所给寄存器模型和已记录的实时先后？” [固定 README 第 58–82 行](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md#L58-L82) 给出初态 `0`；`put(v)` 总可执行并将状态设为 `v`，`get` 合法的条件是输出等于当前状态且不改变状态。[第 135–162 行](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md#L135-L162) 给出完整六个事件，按原始事件位置计数如下；没有时间戳或真实时长，位置仅表示事件顺序：

| 操作 | 客户端 / ID | call 位置与输入 | return 位置与输出 |
| --- | --- | --- | --- |
| W | C0 / 0 | 1，`registerInput{false, 200}`（put 200） | 6，`0` |
| R200 | C1 / 1 | 2，`registerInput{true, 0}`（get；输入中的 0 不是返回值） | 3，`200` |
| R0 | C2 / 2 | 4，`registerInput{true, 0}`（get） | 5，`0` |

原文标明 `CheckEvents(registerModel, events)` 返回 `false`；这是作者文档所述，不是本次实际运行结果。两次读取不重叠，R200 的 return 在 R0 的 call 之前，因此线性化必须 `R200 < R0`（实时先后）。给定初态 0、仅有 W 写入 200，R200 读到 200 要求 `W < R200`；R0 读到 0 要求 `R0 < W`。这三条约束构成 `W < R200 < R0 < W` 的矛盾。后两条是**在该完整示例与模型下推导的顺序约束**，不是上游记录的因果边、内部执行或 checker 导出的具体线性化点。时间只给出一个强制顺序；W 与两个读区间重叠，不能以调用开始时间补另外两条边。

**最小对照**：A0 展示相同的三行操作、初态/模型和上述三句顺序解释；A1 在相同信息与来源旁增加仅三个节点、三条箭头的闭环，其中箭头直接写“模型：读 200”“实时：return 先于 call”“模型：读 0”，说明它是约束矛盾而非实际事件流或发生过的循环。图的潜在增益是把两个不同依据的约束及其闭合冲突同时放在视野中，让读者沿边核对；但这个例子只有三条短句，若读者从文字同样能迅速指出冲突，图就是装饰。比较应让读者解释每条边的依据与为何没有合法排序，不能只用作者自评或渲染成功宣称收益。

此候选与 Waterfall 的区别是解释**模型约束与实时约束的矛盾**，不重做区间 importer；与 flow evidence 的区别是两条模型推导边并非记录的 flow；与静态 state-contract 的区别是这是指定历史对指定顺序模型的检查结论。现有 Explainer、表与简单图可能已足够，无需新 renderer、checker、采集器、依赖或共享运行时。成本是一个固定说明例、精确证据和一次 A0/A1 阅读比较；实际用户需求、图能否胜过文字和视觉结果都尚未验证。只在独立实验中验证，不由此声称产品缺陷或要求更改产品。

未知与超时不能由这个完整示例代替。未来使用其他输入时，应保留来源、许可、模型和初态、操作结果及 checker 版本与结论；若结果是 unknown 或只有部分路径，明确保留它们，不猜测因果或把未知变成失败。自然采集不是所有实验的先决条件。

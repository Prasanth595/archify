# Automerge 多值寄存器：官方说明已覆盖主问题

2026-10-27，只读核查。**决定：暂缓，不做运行探针或内容图。** 官方文档已经用短代码同时解释普通读取、冲突集、后续写入和排序规则，原生 API 与 CLI 也分别暴露当前值、冲突和变更历史。还没有具体读者问题表明一张图能比这些材料更好；不因为找到不同领域就新建分支或通用框架。

## 排重和来源

先核 2026-10-26 hub scouts、round6 远程分支及 PR 快照，历史 2026-10-25 scout 文件名、相关正文和实验索引。既有 [delivery-witness](https://github.com/tt-a1i/archify/tree/f2aa251e4e8f93cd6f409df0adaa1b11b368e2e1/experiments/delivery-witness) 讲消息的同 ID 重复投递，[witness-groups](https://github.com/tt-a1i/archify/tree/861ec02283bcd32c8315aa7b5f8b5ef9678dda27/experiments/witness-groups) 讲共同及替代来源，[operation-history](operation-history-reading.md) 针对顺序模型，不等于当前寄存器的并发值；这不证明未命名工作不存在。用户协作编辑同一属性是自然使用场景，但以下例子和上游测试都是构造的，不是我们观察到的真实用户事故。

Automerge 主源码固定 [`5bae7757ef7b92c8cd6850def388f22767305ccb`](https://github.com/automerge/automerge/tree/5bae7757ef7b92c8cd6850def388f22767305ccb)，[完整 MIT license](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/LICENSE)。官方站点源码固定 [`69dc2dc4ed47661a95d4d3a8b3474ddeb4d9aefb`](https://github.com/automerge/automerge.github.io/tree/69dc2dc4ed47661a95d4d3a8b3474ddeb4d9aefb)，[完整 MIT license](https://github.com/automerge/automerge.github.io/blob/69dc2dc4ed47661a95d4d3a8b3474ddeb4d9aefb/LICENSE)。读取了 [官方 conflicts 文档](https://github.com/automerge/automerge.github.io/blob/69dc2dc4ed47661a95d4d3a8b3474ddeb4d9aefb/content/docs/reference/documents/conflicts.md)、[JS API](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/javascript/src/implementation.ts)、[conflict consumer](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/javascript/src/conflicts.ts) 和 [测试](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/javascript/test/conflicts.ts)。没有运行测试、安装包或访问浏览器。

## 三阶段问题与证据边界

问题：两人离线改同一字段，合并后为什么普通读取只给一个值，而 `getConflicts` 还有多个值？在双方都已合并后再写入，又为什么冲突集消失，旧操作是否还在历史中？

1. **分叉和并发写**：同一初始文档 fork 到两个不同 actor，在同一个 map key 分别写不同值，二者不依赖对方的并发写。上游测试用 clone、分别写 `user`、merge 并断言 bob/charlie 都在冲突值里；这是测试定义而非本次运行结果。
2. **合并**：普通读取从可见冲突值选一个，`getConflicts` 返回包含 winner 在内的当前多值，键是写入的 operation ID（counter 与 actor ID），不是墙钟或 change hash。官方文档说明按 counter 排序、相同 counter 以 actor ID 打破平局；相同变更集在各节点得相同选择。源码的 API 契约称选择任意但确定；没有实际产生的 op IDs 前，不能猜具体哪个值胜出，也不要把 actor ID 简化成用户身份。
3. **已见双方后的因果覆盖**：在合并后的文档上对同一属性执行新写入。官方文档称该操作解决此处冲突；[consumer](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/javascript/src/conflicts.ts) 对 `getAll` 得到不多于一项时返回 `undefined`，不是返回单项对象，也不是空对象。它说的是**当前活跃冲突集**，不是清除历史：[`getHistory`](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/javascript/src/implementation.ts) 由 `getAllChanges` 和分段重放构造快照；旧改变在该未压缩实例历史内可检查。不能推广到任意历史裁剪、外部存储或另一个尚未同步副本。后续写入必须因果上看到双方；离线第三方并发写不满足该假设。

固定 actor ID 也不单独固定整个操作 ID：counter 取决于之前的操作。真实记录需保留完整操作、各阶段 heads/dependencies、可见值与 `getConflicts` 结果，检查 winner 是否属于所报告冲突集合及 ID 的实际映射。不要凭直觉给预期 actor 或 counter 编造输出；同值并发写也不能根据值去重以假定只有一个操作。

## 公平原生基线

官方 conflicts 文档已提供从两个并发写到两边 merge、普通值与冲突对象并列的完整文字例，解释后续赋值、op ID 和非墙钟排序。这直接覆盖主要教学问题。测试则覆盖两个对象值的当前冲突；`getConflicts` 本身在冲突对象外也能读取。除简单 console 属性外，[官方 CLI `export` 和 `examine`](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/rust/automerge-cli/src/main.rs) 分别输出当前文档和 JSON 变更；[`examine` 实现](https://github.com/automerge/automerge/blob/5bae7757ef7b92c8cd6850def388f22767305ccb/rust/automerge-cli/src/examine.rs) 从文档解码所有 changes，供核对旧操作。JS 的 `getHistory` 是标记 hidden 的辅助 API，不将其当稳定公共展示产品。没有在本轮已检查的仓库路径中找到正式专用可视化冲突 inspector；这不是证明不存在其他官方 UI。没有执行 CLI，也没有用真实文件验证其输出的可读性。

图或许能把两条因果分叉与之后的覆盖对应到当前/历史两层，但这只是未验证假设。维护通用解析器、操作版本、历史精简、相同值多 op、对象与列表类型、跨设备同步及敏感变更的成本都不成比例；不建议引入这些依赖或产品能力。一次公平比较必须包括官方文档、`getConflicts` 和实际变更历史，而非仅对比 `doc.key`。

## 若将来出现明确需求的可复验选择

npm 官方 registry 当前记录 `@automerge/automerge@3.5.0` 的 `gitHead` 是 [`4d2a8f6bfecfb7f1e4fca126e6d2122ac526f903`](https://github.com/automerge/automerge/tree/4d2a8f6bfecfb7f1e4fca126e6d2122ac526f903)，与 [release tag](https://github.com/automerge/automerge/releases/tag/js%2Fautomerge-3.5.0) 一致；tarball integrity `sha512-ejbqJWfXWM2QbTcUK/5ugYiQiyOP7LYVAp/RuSvthCc07oek0FClMxEuouuhjrLjVPDSI34RP1ftGc45PF7WRA==`。这**不是**上述研究 main SHA；不要把 main 的特性自动视作已发布包行为。已检查 3.5.0 tag 上 JS `clone`、`getConflicts`、`getHistory` 的对应位置；仍需针对实际版本核完整行为。registry 元数据不是安装或运行收据。

如果后续提出具体阅读痛点，可以在隔离目录使用此精确版本与完整锁定依赖、固定合法且不同 actor IDs，原创一个共同初始值→两边并发写→合并后因果覆盖的三阶段脚本；捕获原始普通读取、完整冲突对象、heads、解码 changes 和运行版本，保留 `undefined` 原状。校验再写前有两个当前值、再写后为 undefined、历史仍含两个旧写入，且不预填 winner。只用本地合成数据，不读取私有文档或联网同步；若原生文档和实际文本已回答问题，停止；否则再比较同一证据的有界图和原文、任务错误率与时间。不引入引擎、服务或共享代码。**这只是可复验合同，本轮不要求运行，也没有宣称用户收益。**

## 用户问题来源：有界检索补充

补查了 GitHub 的 `automerge/automerge` 与 `automerge/automerge-repo` **issue/PR 搜索索引**，三条关键词组合分别为 `getConflicts conflict winner`、`conflict actor operation history`、`conflicts overwrite concurrent`；每条最多取 20，三条均返回零结果。因此本轮没有可引用的自然用户困惑、官方回复或可验证工具缺陷，也没有据此找到值得做配对内容实验的具体历史。搜索词为组合匹配，可能漏掉不同措辞；本次未查询独立的 GitHub Discussions 索引，结果也不证明相关需求不存在。官方文档覆盖信息并不证明阅读负担不存在，暂缓是因为**尚缺具体问题起因和与原生基线比较的证据**；未来如找到有代表性的实际困惑，可重新评估。

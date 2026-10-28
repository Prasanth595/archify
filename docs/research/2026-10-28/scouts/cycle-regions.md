# Cycle regions：把同一循环区域与区域之间的单向边分开

2026-10-28。**推荐最多 1 个小实验：在已有 authored 有向图中，回答“哪些点能从所选点出发并回到它；哪些关系只通往另一个循环区域？”** 复用现有上下游 reach 交集与精确 edge key，不引进 parser、SCC 依赖或代码分析 finding 引擎。完整合成探针足以探索，尚无真人效率或误读率证据；这不是实施授权。

应用 research skill 的一手来源要求；本文件是被委派的后台研究产物。已逐项读 current54 gallery 的标题与 value，并读历史 [graph-answers](graph-answers.md)。不继承其“必须先有真实用户失败才探索”门槛，也不重复 Madge circularGraph 反例。没有运行上游工具/叶函数、安装、实施、提交、推送、评论；以下输出均标为源码静态推导或上游断言。

## 先排重：问题落在哪里

当前 dev 基线 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e` 的 [focus.js](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/focus.js#L82-L132) 已求单源有向可达及其诱导边；Route 回答两点之间一条定向路径。current54 的 Shared reach 是“两节点的共同上游/下游”，Route alternative 是另一条等跳数路线；二者不是“单节点的上游与下游交集”。Lasso witness 表达给定有限前缀/无限后缀，Workflow self-loop 保留合法自环路由，均不是拓扑区域查询。[当前54清单](../../2026-10-25/gallery/manifest.json)

实时 GET 远端结果：[#998](https://github.com/tt-a1i/archify/pull/998) OPEN，head `25b767c72e9463a89e9e89b696d26a52318189b3`；[#1103](https://github.com/tt-a1i/archify/pull/1103) OPEN，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`；[#1139](https://github.com/tt-a1i/archify/issues/1139) OPEN。另查 `repo:tt-a1i/archify is:pr cycle`，相关分析仍为 #998/#1103；搜索结果不是全历史无重复证明。

更关键的是实读代码而非只读 PR 文案：#998 [scc.mjs](https://github.com/tt-a1i/archify/blob/25b767c72e9463a89e9e89b696d26a52318189b3/archify/modules/code-analysis/evaluate/rules/coupling/scc.mjs) 已有迭代 Tarjan，按 includeSelf 保留自环；[cycle.mjs](https://github.com/tt-a1i/archify/blob/25b767c72e9463a89e9e89b696d26a52318189b3/archify/modules/code-analysis/evaluate/rules/coupling/cycle.mjs) 按模块 SCC 生成 finding，evidence.edges 仅保留该 SCC 两端内部边，并给一条 shortestCycle；[import-cycle.mjs](https://github.com/tt-a1i/archify/blob/25b767c72e9463a89e9e89b696d26a52318189b3/archify/modules/code-analysis/evaluate/rules/coupling/import-cycle.mjs) 处理文件环/自导入，分开 eager/deferred，不把静态结构说成运行失败。#1103 Atlas 消费 module-cycle/import-cycle finding，已有选中导入环的路径高亮。因此“检测代码环并可视化”不应另立实验；唯一未重叠的候选是独立 Viewer 对作者已有关系图的局部阅读。#1139 尚在决定 both/none 的遍历含义，本候选只覆盖当前单向 authored 边，不先定义新方向。

## 四个其他项目：固定版本与完整许可核对

不按星数选择。下载固定 source archive 后只读源码；以下 SHA 均为本轮读取默认分支得到。MIT/BSD/Apache 的完整许可正文已读，不以 API SPDX 标签代替；没有复制实现。

| 工具 / 固定 SHA / 许可 | 具体读者问题与处置 |
| --- | --- |
| [pydeps](https://github.com/thebjorn/pydeps/tree/9f086edb4edc1ad5cafc56d26f36d16c116baafa) `9f086edb4edc1ad5cafc56d26f36d16c116baafa` / [BSD-2-Clause](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/LICENSE) | “只看有环模块是否就等于只看环边？”深读 SCC→show_cycles→DOT。节点高亮与边归属不同，不能照搬语义。 |
| [dependency-cruiser](https://github.com/sverweij/dependency-cruiser/tree/c5b97371ae93c556c703cfe294af86c9c80ea9fa) `c5b97371ae93c556c703cfe294af86c9c80ea9fa` / [MIT](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/LICENSE) | “这条具体依赖是否能闭合，见证是什么？”深读逐边判定→报告。既有 Dependency map 已用其报告，不另建适配器。 |
| [cargo-guppy](https://github.com/facebookincubator/cargo-guppy/tree/b0779e6b2dc5d9f673c1c6f467e9fe270077a3b3) `b0779e6b2dc5d9f673c1c6f467e9fe270077a3b3` / [MIT](https://github.com/facebookincubator/cargo-guppy/blob/b0779e6b2dc5d9f673c1c6f467e9fe270077a3b3/LICENSE-MIT) OR [Apache-2.0](https://github.com/facebookincubator/cargo-guppy/blob/b0779e6b2dc5d9f673c1c6f467e9fe270077a3b3/LICENSE-APACHE) | “同一 cycle 是一条路线还是整个 SCC？”API 明确多点 SCC，但自同一身份有语义陷阱；仅边界对照，不借 Rust 图引擎。 |
| [DevScope](https://github.com/edouard57/devscope/tree/9053082d082e02bec2e2ce92af01aae9d73f36d6) `9053082d082e02bec2e2ce92af01aae9d73f36d6` / **未找到许可正文** | README 声称 MIT 并链接不存在的 LICENSE；完整 archive 没有 LICENSE/COPYING。深读 analyze→store→D3 后淘汰：实际只识别反向直接边，不是 README 所称 Tarjan，且计数是节点数。不能复制代码或照搬“cycles”数字。 |

### pydeps：SCC 成员集合流入 DOT，但没有保持区域边界

[find_import_cycles](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/pydeps/depgraph.py#L477-L498) 建有向图，Kosaraju 后仅取 `len(c)>1`，把每个 SCC 放入 cycles，却将所有成员合并为 cyclenodes；cyclerelations 填充代码已注释。随后 [show_cycles 过滤](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/pydeps/depgraph.py#L331-L339) 按合并后的 cyclenodes 保留两端；[DOT render](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/pydeps/depgraph2dot.py#L34-L90) 遍历保留下的关系，把这些成员画蓝色 box，没有用 SCC ID 区分区域。因而下文 F1 的 e4 单向跨区边静态预期仍被绘制，x 自环不在 len>1 集合。这是 producer→filter→export consumer 的边界，不能只读“使用 SCC”便认为每条画出的边都在环内。

官方 [test_cycles.py](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/tests/test_cycles.py#L21-L42) 完整最小 fixture：`__init__.py=''`，`a.py='from . import b'`，`b.py='from . import a'`，`c.py='from . import a'`。断言 show_cycles 保留 a↔b，去掉 c；它没有覆盖两个 SCC 之间仍存在单向边，也没有覆盖自环。本轮未执行该测试。

### dependency-cruiser：逐边闭合见证，比只留环节点精确

[detectAndAddCycles](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/src/analyze/derive/circular.mjs#L25-L85) 对每条依赖调用 getCycle(from,to)，仅在存在非空闭合路径时标 `circular:true` 并附 cycle。 [IndexedModuleGraph](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/src/graph-utl/indexed-module-graph.mjs#L181-L255) 返回首先找到的一条闭合路线，不枚举所有简单环，也不承诺最短。随后 [summarize-modules](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/src/analyze/summarize/summarize-modules.mjs#L19-L35) 将其形成 cycle violation；[error reporter](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/src/report/error.mjs#L31-L74) 输出 from→cycle；[DOT theme](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/src/report/dot/default-theme.mjs#L125-L132) 消费 circular 标记。它给的是逐边闭合证据，不是全 SCC 分区 UI。

官方 [TWO_CIRCLES fixture](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/test/graph-utl/__mocks__/cycle-input-graphs.mjs#L120-L169) 完整拓扑：节点 `{a,b,c,d,e}`，边 `{a→b,b→c,c→a,a→d,d→e,e→a}`。一个 SCC `{a,b,c,d,e}`，两条简单环 `a-b-c-a` 与 `a-d-e-a`；[官方断言](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/test/graph-utl/indexed-module-graph.spec.mjs#L429-L459) 分别得到 `[b,c,a]` 与 `[d,e,a]`。这说明“2 环”不等于“2 个循环区域”。本轮没有执行上游程序。

### DevScope：看见红线不等于实现了宣称的 SCC

[README](https://github.com/edouard57/devscope/blob/9053082d082e02bec2e2ce92af01aae9d73f36d6/README.md#L130-L155) 宣称 Tarjan，但活跃 [buildGraph](https://github.com/edouard57/devscope/blob/9053082d082e02bec2e2ce92af01aae9d73f36d6/src/app/analyze/page.tsx#L38-L73) 仅查 `edgeSet.has(target→source)`，且跳过 self imports。analyze 完成后 [setGraph](https://github.com/edouard57/devscope/blob/9053082d082e02bec2e2ce92af01aae9d73f36d6/src/app/analyze/page.tsx#L133-L146) 传入 store；[D3](https://github.com/edouard57/devscope/blob/9053082d082e02bec2e2ce92af01aae9d73f36d6/src/components/graph/DependencyGraph.tsx#L51-L71) 依 isCycle 画红线或 hide cycles 过滤。[dashboard](https://github.com/edouard57/devscope/blob/9053082d082e02bec2e2ce92af01aae9d73f36d6/src/app/dashboard/page.tsx#L32-L35) 的 cycles 是 hasCycle 节点数量，并非环数/SCC 数。完整三文件探针 `src/a.ts="import './b';"`、`src/b.ts="import './c';"`、`src/c.ts="import './a';"` 静态推导有三角定向环，但没有任何一对反向直接边，故这条活跃链不会标红；没有执行它验证运行结果。此项目只提供反例，不是实现范本。

### guppy：SCC API 的“同一点”不证明有自环

[Cycles](https://github.com/facebookincubator/cargo-guppy/blob/b0779e6b2dc5d9f673c1c6f467e9fe270077a3b3/guppy/src/graph/cycles.rs#L31-L51) 的 all_cycles 只返回≥2成员；底层 [is_same_scc](https://github.com/facebookincubator/cargo-guppy/blob/b0779e6b2dc5d9f673c1c6f467e9fe270077a3b3/guppy/src/petgraph_support/scc.rs#L22-L65) 在 a==b 时恒 true。SCC 关系自反与“含长度≥1定向闭合路径”不同；不能直接拿 is_cyclic(i,i) 给孤立节点贴循环标签。固定版本如此，不能用最新 docs.rs 的自环措辞覆盖该 SHA 的实现。

## 完整原创合成 F1：区域、见证、边界分别记账

输入只表示 authored 关系，无省略节点/边，无运行或死锁语义。标签=ID，e1–e14 保留精确边身份。

```json
{"nodes":["s","a","b","c","d","e","f","u","v","w","t","x","i"],"edges":[{"key":"e1","from":"s","to":"a"},{"key":"e2","from":"a","to":"b"},{"key":"e3","from":"b","to":"a"},{"key":"e4","from":"b","to":"c"},{"key":"e5","from":"c","to":"d"},{"key":"e6","from":"d","to":"c"},{"key":"e7","from":"d","to":"e"},{"key":"e8","from":"e","to":"f"},{"key":"e9","from":"f","to":"d"},{"key":"e10","from":"u","to":"v"},{"key":"e11","from":"u","to":"w"},{"key":"e12","from":"v","to":"t"},{"key":"e13","from":"w","to":"t"},{"key":"e14","from":"x","to":"x"}]}
```

下表为完整拓扑的数学答案，未声称程序已实测：

| 读者问题 | 精确预期 / 判错条件 |
| --- | --- |
| 全图 SCC 是什么？ | `{s}`, `{a,b}`, `{c,d,e,f}`, `{u}`, `{v}`, `{w}`, `{t}`, `{x}`, `{i}`，共9组；含非空定向闭环的区域只有 `{a,b}`, `{c,d,e,f}`, `{x}` 三组。 |
| b 的下游是否都是 b 所在循环区域？ | 否；下游含 `{a,b,c,d,e,f}`，循环区域只有 `{a,b}`；e4 是去另一区域的单向连接，不在任何定向环上。这里“连接”不是无向图论 bridge 断言。 |
| c 的循环区域是 c→d→c 吗？ | 区域是 `{c,d,e,f}`；c-d-c 只是一条见证，e/f 通过 d 的另一环也与 c 相互可达。 |
| 哪些边在某个定向环中？ | 恰为 `{e2,e3,e5,e6,e7,e8,e9,e14}`；e4 两端都属于循环节点，却不属于任何环。 |
| 全部简单环有几个？ | 忽略旋转重复后4个：`a-b-a`,`c-d-c`,`d-e-f-d`,`x-x`。4条简单环、3个循环 SCC、7个循环节点是三种不同计数。 |
| 菱形 u-v-t 与 u-w-t 是环吗？ | 否，t 没有返回路径；共享下游不是闭环。 |
| 孤立 i 和自环 x 怎么区分？ | 两者上下游交集都含自己；仅 x 有 e14。单节点交集必须再查原图自环，i 应明确“无循环区域”。 |
| 删除 e4 能消除任何环吗？ | 不能；四条简单环仍在。此答案不表示其业务可删除，也不推导可靠性或运行故障。 |

## 唯一候选实验与停止条件

**候选：Cycle region（产品交互候选，Architecture 当前单向关系）。** 在选中 b 后，显示 `{a,b}` 及内部关系 e2/e3；e4 可保留普通上下文并明确为区域外连接。选中 c 显示 `{c,d,e,f}` 和 e5–e9，保留精确 relation inspection。选中 x 显示自环；选中 i/u 明确没有循环区域，不把自反 reach 当证据。所有答案可由现有 upstream∩downstream 节点集合、原始关系与单节点 self-loop 检查得到，不需要完整全图 SCC 分解，也不需要枚举所有简单环。

新增价值是直接回答一个 selected-node 区域问题，并避免“所有红节点之间的边都在环内”或“一条见证代表整个区域”的误读。与 Shared reach 的区别是同一源的两方向求交；与 #998/#1103 的区别是消费独立作者图，不分析仓库或再造 findings。若 root 选择先做内容示例，可手工冻结 F1 答案展示同一问题，但不能把手工分组宣称为自动 Viewer 功能。

成本：需要一个与 Reach/Route 协调的选中状态、准确空结果/自环说明、节点和边样式、按钮可访问性及分享/清除策略；当前 computeReachability 扫描关系的成本保留，两次遍历没有被测成性能保证。此处不建议新增全图“cycles 数量”、自动故障结论、删除建议或新图层级。若候选必须扩成新的 parser/全图引擎，或先解决 #1139 非单向遍历，停止并收回本候选。

可否证条件：F1 任一精确答案不符；e4 被高亮为环内边；c 只得到一条见证而遗漏 e/f；i 被误报有环；x 自环丢失；或切换后既有 relation 身份/Route/Reach 复位不能保持清楚。本轮未做实现、浏览器、耗时测量或真人验收，因此只推荐探索这一项，不承诺产品收益。

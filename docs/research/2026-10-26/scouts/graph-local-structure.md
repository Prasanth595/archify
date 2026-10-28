# 局部结构与路径：保留一个“另一条同长连接”验证入口

2026-10-26。**本轮一个条件验证候选，零已证实实施建议。** 现有 Route 返回一条最短有向路径；读者若要判断“这是不是唯一同长连接”，可能需要手工拼第二条路径。已找到仓库现成部署图的双分支输入，以及三个外部小工具的实际消费者。尚未观察真实用户因此受阻；如果现有图肉眼、Passport、Reach 已足够，停止，不为多一个按钮开展实现。

沿用 research / archify-review 的一级来源和价值/成本/影响要求。本轮唯一仓库写入为本文件；完整源码/fixture/许可只读下载到 checkout 外临时目录。没有运行上游、测试或浏览器，没有 renderer/安装、分支、提交、评论、PR 或 push，也未复制上游源码到产品。

## 当前边界及发现过程

实际核对 gallery manifest：**50 项，14 product / 15 offline / 21 content**，含刚完成 Relation search；deferred relation-return 不计入。按 owner/repo 扫描 2026-10-25/2026-10-26 scouts，以下三项未命中。先广搜路径替代、局部邻域、循环、图浏览器及知识图谱，不按 stars 过滤；只有三项进入源码深读。GitHub API 当前 stars 为 15 / 17 / 1，仅是发现快照。Tomi-Tom/depgraph 当前 API 返回404，只有旧 npm/搜索结果，未冒充可复核来源。其余 PSS/Hypergraph 等仅作发现线索，未算已研究机制。

同日 GitHub `commits/dev` 与本地 origin/dev 均为 [`e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/tree/e837dc4cb83042d2b6c596e039692e25ec62c2da)。以下产品对照固定此 revision，不把其他实验工作树能力视为已集成：

- [Finder](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/node-finder.js) 已找节点/挑 Route 端点。Relation search、Finder highlighter/context、Spatial focus 均排除重复。
- [Focus 合同](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/README.md#focus--semantic-explorer-contract)：单节点匹配邻接边及邻居；multi-node/显式 selection 只匹配两端都选中的边；Reach 已提供方向遍历，Passport 已有 incoming/outgoing/self-loop 与精确关系阅读。不能把共同邻域、多个选中节点或另一份 inspector 本身称空白。
- [Route 合同](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/README.md#route-probe-contract) 与 [`shortestDirectedPath`](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/route-probe.js#L307-L332)：按 authored 方向、DOM edge 顺序 BFS，保留首个到达路径及确切边 DOM references，忽略 self-loop。Journey 已逐站读该路径；不能再建议“最短路径按钮”或重做动画。
- Atlas、Dependency map、关系复制、搜索/高亮、Tree 折叠/揭示和已有 SCC/cycle 概览方向不重复。任意 compound 折叠涉及原边/代理边身份，不是本轮低成本动作。

## 三个固定新来源

### 1. CSharpCodeAnalyst：所有同长最短连接的关系并集

固定 [`ATrefzer/CSharpCodeAnalyst@266d0536083c91b19cb91dcdf3e61c1d949d720e`](https://github.com/ATrefzer/CSharpCodeAnalyst/tree/266d0536083c91b19cb91dcdf3e61c1d949d720e)，实际 [LICENSE](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/LICENSE) 是 GPL v3 正文；不复制其实现到 Archify。

完整 [`FindPathsBetweenTests.cs`](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/Tests/UnitTests/Exploration/FindPathsBetweenTests.cs) 含完整构造输入：A→X→B 与 A→Y→B 两条2-hop关系，另有 A→Z1→Z2→B 3-hop；expected 保留前四关系，排除较长路径。另一个 case 同一 hop 同时有 Calls 与 Uses，expected 都保留。测试原件完整读取，**没有运行**；它们是官方构造测试，不是自然项目事故。

实际 consumer 链为 [`GraphViewModel.cs` L439–455](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/CSharpCodeAnalyst/Features/Graph/GraphViewModel.cs#L439-L455)：至少两个明确选中的元素→FindPathsBetween→AddToGraph，而非 README 按钮宣称。算法 [`CodeGraphExplorer.cs` L236–391](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/CSharpCodeAnalyst.CodeGraph/Exploration/CodeGraphExplorer.cs#L236-L391) 展开所选元素各自子树，对每个有序端点组做 multi-source BFS，同距离前驱保留，回溯收集关系并集。它返回**连接子图，不是有序路径列表/路径数量**；两类元素之间最早到达某个成员就停止该层，更长成员连接不在结果内。只走 dependency relationship，containment/Handles 不作路径；不能套到所有 Archify authored edge 作为通用推断。

附带读到的 [`CycleFinder`](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/CSharpCodeAnalyst.CodeGraph/Algorithms/Cycles/CycleFinder.cs) 调 Tarjan 后保留 size≥2 SCC，再生成详细图；[`CycleGroupsViewModel`](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/CSharpCodeAnalyst/Features/CycleGroups/CycleGroupsViewModel.cs) 发布 ShowCycleGroupRequest。这里的 group 不是一条 elementary cycle，不能把组大小称循环条数；与 Atlas 的 cycle 方向相邻，不提出第二个候选。

### 2. BrainBar：明确切换“Different route”，但它是无向知识关系

固定 [`roccodaffuso/brain-bar@65c6086ad0928a4982e6c207ed17e058a7d71b49`](https://github.com/roccodaffuso/brain-bar/tree/65c6086ad0928a4982e6c207ed17e058a7d71b49)，实际 [MIT LICENSE](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/LICENSE)，Nova1390 2026。已读完整 path-utils、graph3d.js、runtime test 和4节点fixture。

[`test-graph-runtime.mjs` L905–924](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/scripts/test-graph-runtime.mjs#L905-L924) 给完整5节点/6边输入：直接 a→d、a→b→d、a→c→e→d；expected shortest 为 a-d、different 与 best-explained 为 a-b-d、wikilinks 为 a-c-e-d。**这些是未运行的构造 expected。** 单独 graph-runtime-fixture.json 是简单链，不冒充它覆盖 alternative case。

真实 UI [`graph3d.js` L4278–4305](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/BrainBar/Resources/Graph3D/graph3d.js#L4278-L4305) 生成 Compare paths 按钮，缺失/同基线路径 disabled；L5340–5405 调 computePathVariants，点击 variant 替换当前 node/edge 序列并 focusPath。不是仅有未使用 helper。

完整 [`graph3d-path-utils.mjs`](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/BrainBar/Resources/Graph3D/graph3d-path-utils.mjs) 的 Different route 逐个排除 baseline edge id 再 BFS，取候选中最短并按 edge-id序列比较。它不是 all paths 枚举，也不承诺和基线路径完全 edge-disjoint。重要差别：computeShortestPath 和 weightedAdjacency **都双向插入邻接**，只对 visibleNodes/visibleEdges 搜路；关系是否 authored 箭头方向不约束可走性。Best explained 的1/1.2/2.5权重来自本产品约定，不是知识可靠性实证，不能移植成 Archify 路径质量分数。

可借行为是“端点保留，另一条连接可明确选择；相同结果不要装成新选项”。不引入3D、camera history、weighted/provenance路径类型、Graphify runtime；也不把无向路径实现直接接到现有有向 Route。

### 3. visual-traceroute：回读已有路径成员，避免从拓扑拼出未观测路径

固定 [`tommy812/visual-traceroute@e16c57d659572b0a6dc333b7ce12cef0e5e77f87`](https://github.com/tommy812/visual-traceroute/tree/e16c57d659572b0a6dc333b7ce12cef0e5e77f87)，实际 [MIT LICENSE](https://github.com/tommy812/visual-traceroute/blob/e16c57d659572b0a6dc333b7ce12cef0e5e77f87/LICENSE)，Thomas Tamagni 2026。

完整 [`traceroute_to_graph.test.js`](https://github.com/tommy812/visual-traceroute/blob/e16c57d659572b0a6dc333b7ce12cef0e5e77f87/frontend/src/utils/__tests__/traceroute_to_graph.test.js) 构造四 hop raw 文本，第2 hop为 `* * *`，2001:db8文档地址；expected 保留第1/3 hop和第2位置timeout。这是构造集成输入，不是本轮实抓网络 trace；**也没有覆盖多条路径点击的行为 expected**，不夸大证据。

消费者 [`NetworkGraph.js` L536–548](https://github.com/tommy812/visual-traceroute/blob/e16c57d659572b0a6dc333b7ce12cef0e5e77f87/frontend/src/components/graphPage/graph/NetworkGraph.js#L536-L548) 在点击 node/edge 时调用 highlightPathsForNode/highlightPath。完整 [`usePathHighlighting.js`](https://github.com/tommy812/visual-traceroute/blob/e16c57d659572b0a6dc333b7ce12cef0e5e77f87/frontend/src/hooks/usePathHighlighting.js) 依据 pathMapping 找通过该对象的既有 pathId，按 nodeDetails 中同 pathId 的 hopNumber 排序重建；平行边优先挑 pathMapping 包含该 pathId 的边。若映射缺失会回退第一条 candidate，不能宣称它对所有不完整输入保证精确边身份。

这说明同一邻接图的可达路径，与有记录的实际路径集合是不同合同。Archify Route 只证明 authored 拓扑连接，不能因此声称观测过某条请求/网络/执行路径。若借此动作，需要输入已有 path membership/occurrence证据；那将扩输入合同，且与 Task occurrences / trace 内容方向邻接，本轮不建议新adapter或运行采集器。

## 唯一候选：保留端点，查看另一条同长有向连接

**用户任务与问题来源。** 读者在部署图核对“从 API Gateway 到 Event Bus 是否只有经 AZ-a 这一条最短连接；还有哪条同长连接”。这是本轮为现成图提出的阅读任务，尚无自然用户受阻报告；不能把它称路由缺陷、实际高可用保证或已测效率提升。

**完整固定输入。** 使用现有 [`archify/examples/production-deployment.architecture.json@dev`](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/archify/examples/production-deployment.architecture.json)（12节点、12关系）及该revision的正常交付图，不改JSON凑反例：

| authored 连接 | 两段关系身份 | 能证明 / 不能证明 |
| --- | --- | --- |
| gateway → api_a → events | connections[2] VPC route；connections[6] publish | 两条已有有向边，2-hop；不是观测流量、health或failover结果。 |
| gateway → api_b → events | connections[3] VPC route；connections[7] 空label | 同样2-hop；空label原样保留，不能补写 publish。 |

这些 index 是**原始JSON位置，非产品稳定edge id**；若验证进入浏览器，先从该生成图拿实际 data-edge-key/id 并按精确关系绑定，不新增原件 id。current Route 按 DOM 首达取一条，不保证所有renderer都按JSON顺序，所以仅静态预期先A，不冒充已测UI输出。

**现有流程瓶颈待验证。** 一条 Route/Journey 很适合解释一条链，但不能回答其唯一性；单节点 Reach 会包含 Redis/PostgreSQL 等侧支，Passport 可逐端点检查。12节点图也可能两眼就看明白，因而必须先实走上述现有操作、保留当前相机/选中状态，记录能否正确报出另一条完整有向链及其两个确切边。若无需显著额外操作，不做。

**最小改进草案。** 仅当基线瓶颈成立，在原 Route 结果旁提供查看第二条同hop最短连接的局部动作，保留 source/target，复用现有 Journey 与关系选择；不增加全路径枚举、路径数量/唯一性证明、weighted routing、排除任意节点面板或新路径平台。实现思路可独立沿BFS同距离前驱找第二份精确边序列，而非复制GPL代码或无向工具代码。这是待验证行为边界，非已批准实施细节。

**成本与影响。** 需要保存第二条有序edge序列、切换时同步Route overlays/Journey/copy hash与导出合同，并明确路径不止两条时只显示两份证据，不能把“没有第二份结果”误标为唯一。节点端点Finder、原有单路径默认、authored方向、parallel edge/self-loop原合同要保持。若为此牵动hash/导出或新增更多模式的成本明显大于一次人工读图，放弃；不要先建框架。

**最小对照及停止条件。** 同revision、同输入、同viewport/初始camera，基线允许Finder/Passport/Route/Reach/肉眼，候选只加上述动作。读者回答第二条完整链、边身份和方向；至少再核一个本来只有一条连接的已有图及一个现成重复label/parallel case。无实际操作节省、误把两条当全部、混淆无向/有向、或把空label补成推测语义，均停止。没有运行这些对照；报告不自造“用户提升”数字。

## 原件身份与未测范围

完整下载原件保留在 `/tmp/archify-graph-local-structure-20261026/`，未提交或分发。关键SHA-256如下（材料指纹不是测试receipt）：

| 完整原件 | bytes | SHA-256 |
| --- | ---: | --- |
| CSharpCodeAnalyst LICENSE | 35124 | `2f41ead5be5e41dba65d6352e3c78ef52a5046a86d2e7e0092bdcb4f80cd2f18` |
| CSharpCodeAnalyst FindPathsBetweenTests.cs | 15178 | `8d8dd299bc73d32e28267d50d5f9bd0e2dd92672898a0f94265233b1640960dc` |
| CSharpCodeAnalyst CodeGraphExplorer.cs | 43475 | `586fe4fae95fc8ae71847f7e6839c644cfb8bb9d97d0628d45d936b67d9ae53e` |
| CSharpCodeAnalyst GraphViewModel.cs | 42498 | `b1b2f18d654e9698a7eb4b034a772c181d3ef7d017720e3287ef1415d64f062e` |
| BrainBar LICENSE | 1065 | `216918b3d4b06d33f776554e45a965eebb7b4454127ff86243b8c73beaeb4d72` |
| BrainBar test-graph-runtime.mjs | 50449 | `684d0f103142c40b1337c53745507ed37121a7c7ffd48aff90663cb47256023d` |
| BrainBar graph3d-path-utils.mjs | 16445 | `31882d74a2c0def2fd1c980a26c17b8b51c4d74081b13cff88ddd2dca159251e` |
| BrainBar graph3d.js | 263574 | `b2cacfe390650bf596fd08e26ef8a31a56af2314b1e3efc7ce6e44cd0207ec12` |
| visual-traceroute LICENSE | 1071 | `d56865b961ba3f23280354a5b879e87d79b85e73a6543597d3ba0036372e5d64` |
| visual-traceroute traceroute_to_graph.test.js | 2792 | `9758167697635d1670f2389949fe3ab247fda6e478ca28b3f31fcd4c0df9937c` |
| visual-traceroute usePathHighlighting.js | 12310 | `9f7898c1683eabc2e7c00335e6837b20dd8644fb19833cc977a3453c8ac444c8` |

已区分源码、构造expected和真实用户问题；没有上游执行、UI/键盘/性能验收或真实流量证据。本轮交付一个能被真实图阅读对照否定的候选；若无实证增益，建议零实施。

# Graph answers scout — selected-node questions

日期：2026-10-28。结论：**本轮推荐 0 个新实验**。确有“共同下游集合”“从所选节点闭合的环见证”“结构隔断”的查询差距，但尚无实际用户图证明差距值得增加 Viewer 控件与状态。保留以下源码行为和完整反例，供以后真实阅读任务触发；不把算法能做当成产品应做。

本轮应用 research 与 archify-review 的一手来源、价值/成本/影响方法。仅写本报告，没有修改产品、安装第三方项目、执行其 CLI、提交、推送或执行上游工作。部分叶函数在 Node VM 中实际求值，属于静态算法探针，不是浏览器/整库测试或用户验收。

## 1. 现有能力与排重

本地只读源码基线为 `lab-diff-matches-recovered/archify` 的 `a8456ef796ab62ba490b03fa0c896ae206edb5ea`，读取 README、`viewer/focus.js`、`viewer/route-probe.js`。现有 README 的 Explore and share 列出单节点 focus、上下游 authored reach、定向 Route 与 Journey；`focus.js:82–132` 返回单源可达节点、诱导边与最小深度，`applyReachability` 只接受一个 active ID；`route-probe.js:308–334` 找一条最少跳数定向路径并拒绝 source=target。没有把下游称成运行影响。

已逐卡读取 [52 项 gallery](../../2026-10-25/gallery/index.html) 的标题、价值和验证边界，去掉内嵌图像数据后检查；其中直接排重的是 Relation search、Spatial focus、Route alternative、Dependency map、Retained size、Lasso witness、Task occurrences、Edge-scoped extras、Witness groups。Lasso witness 是有限前缀/无限后缀的内容表达实验，不能误称 Viewer 框选。来源清单中的 lasso/空间选择也不能自动提供拓扑交集。已有 single-source reach、PATH、另一条等跳数路线不重新申报。

GitHub 最新状态同时参考 [resume-status](../resume-status.md)，本轮再次 GET 以下三项，结果与该报告一致：

| 现有工作 | 本轮读取状态 | 本轮处理 |
| --- | --- | --- |
| [#998 Code Analysis](https://github.com/tt-a1i/archify/pull/998) | OPEN，`25b767c72e9463a89e9e89b696d26a52318189b3` | 模块/文件静态分析与 finding 已有候选；不另造 cycle finding 系统 |
| [#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103) | OPEN，`f0be206acbc90eb7c6c6b636030e3eb28963d284` | 文件/函数图与源码往返方向被占有，不另提全图引擎 |
| [#1139 direction](https://github.com/tt-a1i/archify/issues/1139) | OPEN | 有人调查 both/none 与遍历语义；本轮不引入无向遍历或重定义箭头 |

另用 GitHub search API 查询 `is:issue cycle`、`is:pr common dependency`、`is:issue dominator`。前两者返回的相关项仍指向 #998/#1103；dominator 返回空。`is:issue articulation` 请求 TLS 超时，**没有算作无重复**。搜索是有界线索，不是全历史不存在的证明。由于本轮没有推荐实验，未为新方向启动 issue/PR。

## 2. 七个候选的一手源码筛选

选择依据是能否回答一个具体局部问题以及实现是否能读懂，不使用星数。这里“小项目”指可单独理解的工具/库；dependency-cruiser 较大，只作现有覆盖对照，不作为轻量实现范本。许可证由本轮 GitHub repository API 的 SPDX 元数据识别，链接指向固定源码中的许可文件；没有复制其实现。

| 项目、固定 sourceSHA、license | 读者能提出的问题；本轮实际读取的证据 | 处置 |
| --- | --- | --- |
| [npmgraph/npmgraph](https://github.com/npmgraph/npmgraph/tree/a6d5a56a576c85d69931e7e5549a0a97fc85b656) · `a6d5a56a576c85d69931e7e5549a0a97fc85b656` · [MIT](https://github.com/npmgraph/npmgraph/blob/a6d5a56a576c85d69931e7e5549a0a97fc85b656/LICENSE) | 选中模块：谁依赖它、它依赖谁？[gatherSelectionInfo](https://github.com/npmgraph/npmgraph/blob/a6d5a56a576c85d69931e7e5549a0a97fc85b656/lib/graph-util.ts#L560) 与 [DOM classes](https://github.com/npmgraph/npmgraph/blob/a6d5a56a576c85d69931e7e5549a0a97fc85b656/components/GraphDiagram/GraphDiagram.tsx#L284) | 深读；多选求并集，不是共同依赖交集 |
| [square/dependentree](https://github.com/square/dependentree/tree/67a9a2f3f08899696521ebacffa7cf01024d2117) · `67a9a2f3f08899696521ebacffa7cf01024d2117` · [Apache-2.0](https://github.com/square/dependentree/blob/67a9a2f3f08899696521ebacffa7cf01024d2117/LICENSE) | 从一个实体展开依赖时，为何停止？[setTree](https://github.com/square/dependentree/blob/67a9a2f3f08899696521ebacffa7cf01024d2117/src/set-tree.js#L22)、[clone](https://github.com/square/dependentree/blob/67a9a2f3f08899696521ebacffa7cf01024d2117/src/clone.js#L19)、[tests](https://github.com/square/dependentree/blob/67a9a2f3f08899696521ebacffa7cf01024d2117/tests/clone.test.js#L17) | 深读；环闭合/深度截断/缺失实体区分有价值，Archify 不采用它的树引擎 |
| [RJBethune/enterprise-relationship-graph](https://github.com/RJBethune/enterprise-relationship-graph/tree/2a5b4b9a0d15a8dc698837c8dfb42df04a75f22a) · `2a5b4b9a0d15a8dc698837c8dfb42df04a75f22a` · [MIT](https://github.com/RJBethune/enterprise-relationship-graph/blob/2a5b4b9a0d15a8dc698837c8dfb42df04a75f22a/LICENSE) | 删哪个点会让无向图断开？[Tarjan implementation / UI](https://github.com/RJBethune/enterprise-relationship-graph/blob/2a5b4b9a0d15a8dc698837c8dfb42df04a75f22a/enterprise-relationship-graph.html#L11012) | 深读；只借结构问题，拒绝沿用“single point of failure”结论 |
| [pahen/madge](https://github.com/pahen/madge/tree/456057b85c2d063dad9c10147d7686ded4fc5ce5) · `456057b85c2d063dad9c10147d7686ded4fc5ce5` · [MIT](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/LICENSE) | 哪些静态模块有环？[circular/circularGraph/depends](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/lib/api.js#L98)、[DFS](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/lib/cyclic.js)、[test](https://github.com/pahen/madge/blob/456057b85c2d063dad9c10147d7686ded4fc5ce5/test/api.js#L193) | 额外深读 API 并实际探针；环节点诱导子图不可直接称环边集合 |
| [thebjorn/pydeps](https://github.com/thebjorn/pydeps/tree/9f086edb4edc1ad5cafc56d26f36d16c116baafa) · `9f086edb4edc1ad5cafc56d26f36d16c116baafa` · [BSD-2-Clause](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/LICENSE) | 全图之外是否只看环节点？[test_show_cycles_filters_to_cycle_nodes](https://github.com/thebjorn/pydeps/blob/9f086edb4edc1ad5cafc56d26f36d16c116baafa/tests/test_cycles.py#L21) 显式验证 a↔b 留下、外部 c 去掉 | 仅测试级筛选；不重复 #998 的静态检测 |
| [Emeto/dependagraph](https://github.com/Emeto/dependagraph/tree/6abce1036b9576391b18c1e8949e4b7d7526e289) · `6abce1036b9576391b18c1e8949e4b7d7526e289` · [MIT](https://github.com/Emeto/dependagraph/blob/6abce1036b9576391b18c1e8949e4b7d7526e289/LICENSE.txt) | [README](https://github.com/Emeto/dependagraph/blob/6abce1036b9576391b18c1e8949e4b7d7526e289/README.md#L79) 是 package-lock→vis.js HTML；clicked dependency details 与 filtering 位于 roadmap | 淘汰；不能把愿景当已实现行为 |
| [sverweij/dependency-cruiser](https://github.com/sverweij/dependency-cruiser/tree/c5b97371ae93c556c703cfe294af86c9c80ea9fa) · `c5b97371ae93c556c703cfe294af86c9c80ea9fa` · [MIT](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/LICENSE) | [add-focus](https://github.com/sverweij/dependency-cruiser/blob/c5b97371ae93c556c703cfe294af86c9c80ea9fa/src/graph-utl/add-focus.mjs#L30) 合并匹配模块的上下游、按深度过滤并标记 focus | 覆盖对照；gallery 已有 Dependency map，非新增来源 |

## 3. 深读结果：能借什么，不能借什么

### npmgraph：多选高亮的集合语义

`gatherSelectionInfo` 为 selectedKeys、upstream/downstream node/edge keys 分别建 Set；每个选中模块各自遍历，将结果加入同一 Set。因此输出是“至少与一个所选节点相连”，不是“同时为所有节点依赖”。GraphDiagram.tsx 将三类集合转换成 selected/upstream/downstream/unselected class，选择不改拓扑。这个设计可以解释阅读者当前看的集合，却没有提供共同依赖答案。Archify 已有 reach；仅同步两侧高亮不足以证明新增问题值得做。读取了 graph-util.test.ts，没有定位到 gatherSelectionInfo 的专门断言，本轮未运行上游测试。

### DependenTree：回到当前分支才是环

`_cloneNodes` 在当前递归路径上设置并最终清除 `__visited`；同一实体经另一分支再次出现不自动判环。检测环后保存完整 `Cyclic Dependency Paths`，停止展开；缺失实体优先于 maxDepth，cycle 也优先于 maxDepth。官方 tests 的 rock→paper→scissors→rock 路径给出直接断言，另有 cycle/maxDepth 优先级反例。值得借的是解释“为何停止”和显示明确闭合入口，不是把共享节点复制成新身份。

完整官方 fixture（[source](https://github.com/square/dependentree/blob/67a9a2f3f08899696521ebacffa7cf01024d2117/data/rock-paper-scissors.js)）：`rock:{_deps:[paper]}, paper:{_deps:[scissors]}, scissors:{_deps:[rock]}`，三个实体的 `_name` 与 key 相同。它很小，Archify 原生边已能让人直接看出闭合；并未证明额外 cycle 按钮改善真实任务。

### Enterprise relationship graph：结构断开不等于故障

`computeArticulationPoints` 把每条边双向加入邻接表，以 disc/low 和 DFS 子树检测无向割点；runSpof 给节点加 ring，并提供可点回原节点的表格。源码足以证实算法与 UI，不依赖 README 宣称。但其 UI 把无向割点命名为 single points of failure，这需要冗余、边类型、运行策略等额外证据。Archify 不能照搬该措辞，也不能只因有割点就推导业务瘫痪。`scripts/smoke-test.js:398` 对 computeTopRisks 的检查将 computeArticulationPoints stub 成空数组，因此这个用例不是割点正确性的证明。本轮没有跑其浏览器脚本。

### Madge：一个可实际复现的边界

`circularGraph` 保留“任何环中的节点”之间的边，而非要求两端属于同一环。用固定 SHA 的原始 `lib/cyclic.js` 和原始 `circularGraph()` 方法，在 Node VM 实际执行以下**完整原创反例**：

```json
{"a":["b"],"b":["a","c"],"c":["d"],"d":["c"]}
```

实得 `circular() = [["a","b"],["c","d"]]`，`circularGraph()` 却保留整个输入，包括单向 `b→c`。后者不是任何定向环的一部分。没有把这个结果报告成 Madge 通用缺陷；它只是说明借鉴时必须声明输出是“环节点子图”，不能把子图里的每条边讲成闭环证据。测试只验证了 a↔d 的简单环，不能证明上述双环桥接条件。

## 4. 固定完整图：现成控件能答到哪一步

以下是**原创构造探针**，不是用户失败案例、上游完整生产图或真实调用流。没有省略的节点/边；箭头只表示图中关系。节点 ID 就是显示标签，边 ID 固定，顺序也固定。

```json
{
  "nodes":["r","a","b","c","d","e","f","x","y","z"],
  "edges":[
    {"key":"e1","from":"r","to":"a"},
    {"key":"e2","from":"r","to":"b"},
    {"key":"e3","from":"a","to":"c"},
    {"key":"e4","from":"b","to":"c"},
    {"key":"e5","from":"c","to":"d"},
    {"key":"e6","from":"d","to":"a"},
    {"key":"e7","from":"c","to":"e"},
    {"key":"e8","from":"e","to":"f"},
    {"key":"e9","from":"f","to":"e"},
    {"key":"e10","from":"x","to":"y"},
    {"key":"e11","from":"y","to":"x"},
    {"key":"e12","from":"z","to":"z"}
  ]
}
```

实际取本地 `focus.js` 的 `computeReachability`（到下一函数 reachabilityFor 为止）与 `route-probe.js` 的 `shortestDirectedPath`（到下一函数 traceGeometry 为止）原文，`vm.runInContext` 求值。为 route 注入从以上固定边构建的 outgoingByNode；没有更改算法，edge 对象用原 key 字符串替代 DOM 引用。因此这验证的是叶函数输出，不是完整 DOM 接线、可见高亮或键盘/移动端行为。

| 问题 | 实际现有输出 | 差距与反例 |
| --- | --- | --- |
| a 的上游？ | nodes `[a,r,d,c,b]`；edges e1–e6 | 可达已回答，不新增 |
| a 的下游？ | nodes `[a,c,d,e,f]`；edges e3,e5,e6,e7,e8,e9 | 包含下游另一个 e↔f 环；不能把所有高亮节点称“a 所在环” |
| b 的下游？ | nodes `[b,c,d,e,a,f]`；edges e3–e9 | 单源可达已回答 |
| a 与 b 的共同下游，排除所选节点本身？ | 手工取两个结果交集得到 `[c,d,e,f]` | 现有 Viewer 无直接交集结果，但图很小，未证明人工比较造成实际错误 |
| a 如何回到 a？ | Route(a,a) = null | 路径控件有意排除同点；能经关系 inspection 人工读出 a→c→d→a，尚无任务证据支持新控件 |
| a→d？b→f？ | `[a,c,d]` / e3,e5；`[b,c,e,f]` / e4,e7,e8 | 现有 PATH 已回答。另一条等跳数路线不应变成“所有简单路径”枚举 |
| z 的自环？ | 两向 reach 都是 `[z]` 且 edgeKeys `[e12]`；Route(z,z)=null | 叶算法保留自环；focus 按 nodeIds.length−1 计算为0而禁用按钮，不能只凭该叶结果声称 UI 可打开自环 reach；关系 inspection 仍能读 authored 自环 |

必要反例：r→a、r→b、a→c、b→c 形成共享依赖菱形，但仅靠这四边并没有环；a→c→d→a 是 a 的闭环；e↔f 是 a 可达但不包含 a 的环；x↔y 是完全无关环；z→z 是单节点自环。把所有有环/可达/重复出现合在一种颜色里会答错不同问题。

结构隔断也有最小反例：完整图 `s→a→t` 加 `s→b→t`，删除 a 后 s 仍可到 t；“a 出现在一条最短路径上”不是“a 必经”。再在此图加入 `q→a`，无向图的 a 成为隔开 q 的割点，但仍不支配 s→t。所有节点 `{s,a,b,t,q}`、所有边 `{s→a,a→t,s→b,b→t,q→a}` 已完整列出；不能混用无向割点、特定端点的有向必经与业务单点故障。

## 5. 价值、成本与影响判断

| 方向 | 能证实的价值 | 成本/影响 | 本轮决定 |
| --- | --- | --- | --- |
| 共同依赖 | 合成图中确实缺一个集合交集答案 | 需定义选中节点是否计入、方向、不可用图、双节点选择状态与分享语义；新增状态与现有 reach/route 竞争 | 暂缓；没有真实图/真实提问失败证据 |
| 当前节点闭环见证 | 原函数明确拒绝 Route(s,s)，局部最短闭环可给具体边序列 | 要保留自环/平行边身份、与 Reach/Journey 协作、明确一条见证不代表全部；接近 #998 finding 与已有 lasso 内容方向 | 暂缓；小图手工可答，未证明用户收益 |
| 割点/必经/移除后可达 | 能提出不同于 PATH 的结构问题 | 要选定有向/无向/端点相对语义；#1139 语义尚在调查。沿用故障术语会制造错误确定性 | 暂缓；成本与语义影响超出本轮证据 |

**推荐数保持 0。** 不因为来源项目已有按钮就开一个实验。重新考虑的最小触发条件是：拿到一份完整的实际 authored 图、读者的一个具体问题和现有 Viewer 的操作记录，证明 reach、relationship inspection、PATH/alternative 仍不能可靠完成该问题；之后只选一个局部行为，以正确答案和反例为接受/否证条件，再核 #998/#1103/#1139 的最新实现与归属。没有把这个触发条件当作已授权实施，也没有创建额外框架。

## Evidence limits

- 当前源码/远端 PR 状态为本轮实读；过去 gallery 与 resume-status 的验收仅作为既有边界，不重命名成新一轮结果。
- 实际执行：本地两个叶函数与 Madge 两个原始叶实现的固定图求值。未执行上游工具、完整测试、浏览器 UI 或效率实验。
- 没有测量真实问题频率、读者错误率、耗时收益或性能上限，不编造概率。
- 历史记忆只用于定位 gallery 和防止将研究当产品方向；52项数量、当前功能、源码与候选 head 均重新读取。

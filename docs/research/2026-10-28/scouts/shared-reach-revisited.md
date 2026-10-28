# Shared reach revisited — 共同可达集合

日期：2026-10-28。**建议做 1 个独立实验：两个端点按 authored `from → to` 的共同下游集合。** 这是读图实验建议，不是加入正式产品的结论。上一份 [graph-answers](graph-answers.md) 已找到交集缺口，但把“必须先有真实用户失败记录”当作实验前置条件过严；完整公开输入和明确标注的构造读者任务，足以验证答案与可读性，不能据此声称已证明使用频率或效率收益。

本轮只写本报告。应用 research skill；读取固定源码、许可文件完整正文、fixture、CLI producer/consumer 和 GitHub 排重，没有安装依赖、运行上游代码、修改产品、commit、push 或评论。选择依据是实际集合行为，不使用星数。最终只保留 GID、BitBom 两个交集来源及 npmgraph 一个精确反面对照。

## 1. 来源与许可：固定版本，区分结构问题和故障推断

| 项目 / source SHA | 完整许可文件实读 | 实际可借的问题 | 边界 |
| --- | --- | --- | --- |
| [GID CLI](https://github.com/tonioyeme/graph-indexed-development-cli/tree/08c7dc9d793ab6afa5b741d093116ddfca151dc2) / `08c7dc9d793ab6afa5b741d093116ddfca151dc2` | [LICENSE](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/LICENSE) 全文是 AGPL v3-or-later 通知及 commercial-license 提示，并非整部 AGPL 文本；另完整读了 [COMMERCIAL-LICENSE.md](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/COMMERCIAL-LICENSE.md)。本报告仅研究行为，不复制实现 | A、B 沿 `depends_on` 都能走到谁，排除 A、B 本身？ | `common-cause` 是命令名称；输出没有运行时故障或因果证据 |
| [BitBom Minefield](https://github.com/bitbomdev/minefield/tree/699681d20fd3a671af21430806d6eaed695f1fc0) / `699681d20fd3a671af21430806d6eaed695f1fc0` | [LICENSE](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/LICENSE) 完整 Apache-2.0 正文、附录与 Copyright 2024 bitbomdev 已读 | 两个依赖查询结果作 `and`，返回共同包 | [README](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/README.md#L1-L3) 明示 archived / no longer maintained；只借集合问题，不引入其服务、DSL、缓存或 bitmap 栈 |
| [npmgraph](https://github.com/npmgraph/npmgraph/tree/a6d5a56a576c85d69931e7e5549a0a97fc85b656) / `a6d5a56a576c85d69931e7e5549a0a97fc85b656` | [LICENSE](https://github.com/npmgraph/npmgraph/blob/a6d5a56a576c85d69931e7e5549a0a97fc85b656/LICENSE) 完整 MIT 正文，Copyright 2023 Robert Kieffer 已读 | 多选后，把任一所选节点的上下游加入同一高亮集合 | 这是并集，不回答同时从两个端点可达的集合 |

以上“许可实读”陈述的是文件内容和本轮行为，不给兼容性法律结论；实验应独立实现简单集合运算，无须复制上述代码。

## 2. GID：producer → traversal → 结果 consumer 完整成立

[CLI 注册](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/src/index.ts#L67-L74) 把 `query common-cause <nodeA> <nodeB>` 交给 `runCommonCauseQuery`；[command consumer](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/src/commands/query.ts#L139-L177) 加载 graph，构造 `GIDGraph` / `QueryEngine`，调用 `getCommonCause`，打印端点、共同依赖数和每个 ID。这里存在真实命令接线，不只是 README 愿景。

[QueryEngine producer](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/src/core/query-engine.ts#L103-L128) 验证两个节点存在，各取含自身的传递依赖，再做交集，明确剔除两个输入端点。[GIDGraph](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/src/core/graph.ts) 的 `getDependencies` 只读 outgoing `depends_on`，`getAllDependencies` 沿此关系递归；`implements` / `tested_by` 不参与。不能把 GID 的过滤条件自动套到 Archify 的所有 authored 关系上。

完整官方 fixture 是 [valid-graph.yml](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/tests/fixtures/valid-graph.yml)。下表是它的**全部拓扑**，不是局部截图片段；原文件另有 description / layer / priority，未在表中复述，完整输入在固定链接：

| 所有节点 | 类型 |
| --- | --- |
| Feature-A、Feature-B | Feature |
| ComponentA、ComponentB、ComponentC、SharedService | Component |
| TestA | Test |

| from | to | relation |
| --- | --- | --- |
| ComponentA | Feature-A | implements |
| ComponentB | Feature-B | implements |
| ComponentA | SharedService | depends_on |
| ComponentB | ComponentA | depends_on |
| ComponentB | SharedService | depends_on |
| ComponentC | ComponentB | depends_on |
| ComponentA | TestA | tested_by |

[实际测试文件](https://github.com/tonioyeme/graph-indexed-development-cli/blob/08c7dc9d793ab6afa5b741d093116ddfca151dc2/tests/query-engine.test.ts#L98-L112) 从完整 fixture 加载图，断言 `getCommonCause(ComponentA, ComponentB)` 包含 SharedService；另断言 Feature-A / Feature-B 结果空。**测试不是完整结果等值断言**，未证明单侧排除、端点排除、环或传递共享的全部正确性；本轮没有执行它。按已读源码静态推导，A/B 的结果恰为 `{SharedService}`：B 单侧的 ComponentA 被端点排除，Feature-A、Feature-B、TestA 因关系类型不进入依赖遍历。

CLI 最后建议两组件都受影响时优先检查共同依赖；这仍然是调查建议。没有故障事件、健康状态、边的运行策略或影响验证，不能把此输出叫“已定位共同故障根因”。Archify 应叫“共同下游 / Shared reach”，并说明“按图中方向可达”。

## 3. BitBom：显式 AND，及与 GID 不同的自身语义

[README 的 shared-dependencies 示例](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/README.md#L102-L106) 明确给出两个依赖查询的 `and`。[parser.go](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/pkg/graph/parser.go) 的 `ParseAndExecute` 收集两边 package 查询，取 dependencies/dependents bitmap；`iterateExpression` 对 `and` 调 `bm.And(bm2)`，`or` 调 `bm.Or(bm2)`。`iterateTerm` 按请求的节点类型筛选。这是实际实现的集合交集。

producer 的方向可在 [SetDependency / queryBitmap](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/pkg/graph/graph.go#L187-L265) 核对：A.SetDependency(B) 把 B 加入 A.Children，把 A 加入 B.Parents；dependencies 沿 Children BFS，末尾把原节点自身加入结果。缓存路线也在 [cache.go:48–64](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/pkg/graph/cache.go#L48-L64) 加自身。与 GID 的端点剔除不同，不应照搬。

consumer 链是 [CLI custom](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/cmd/query/custom/custom.go) → Query RPC → [Service.Query](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/api/v1/service.go#L263-L308) → ParseAndExecute → result IDs → nodes → CLI JSON 或表格。默认表格最多显示 10 个结果；这不等于只有 10 个匹配。没有把它描述为已经验收的浏览器交互。

**完整且小的官方 mock fixture** 来自 [parser_test.go](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/pkg/graph/parser_test.go)：五节点均以 `AddNode(storage, "PACKAGE", nil, name)` 建立，以下列出全部名字及全部边。

```text
A = pkg:generic/lib-A@1.0.0
B = pkg:generic/lib-B@1.0.0
D1 = pkg:generic/dep1@1.0.0
D2 = pkg:generic/dep2@1.0.0
C = pkg:maven/org.apache.camel.quarkus/camel-quarkus-cassandraql-deployment@3.18.0-SNAPSHOT?type=jar
edges = A→D1, B→D1, D1→D2, C→D2
```

原测试断言 A 的 dependencies 包含 A、D1、D2，并验证带 qualifier 的 C 得 C、D2；没有这张小 fixture 的 positive AND 专门断言。本轮不把自己补出的查询冒称上游测试：**构造查询任务** `dependencies PACKAGE A and dependencies PACKAGE B`（A/B 需替换为上面完整 PURL）按源码应得 `{D1,D2}`；A/C 应得 `{D2}`；A/D1 应得 `{D1,D2}`，最后一项直接暴露它保留输入端点 D1 的语义。这里的“应得”是静态推导，未运行上游。

另完整读了 README 所指 [libA.json](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/testdata/small/libA.json)、[libB.json](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/testdata/small/libB.json)、[dep1.json](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/testdata/small/dep1.json)，但没有执行 SBOM ingest，不把 README 的 `library/pkg:lib-A` 与测试的 `PACKAGE/pkg:generic/lib-A` 当成同一运行收据。[e2e 测试](https://github.com/bitbomdev/minefield/blob/699681d20fd3a671af21430806d6eaed695f1fc0/e2e/e2e_test.go#L150-L155) 有 AND=空集合用例；它也不是小 fixture 的正交集验收。

## 4. npmgraph 是并集对照，不是交集先例

重新读取固定 SHA 的 [gatherSelectionInfo](https://github.com/npmgraph/npmgraph/blob/a6d5a56a576c85d69931e7e5549a0a97fc85b656/lib/graph-util.ts#L560-L623)：每个 selectedModule 各自遍历 upstream/downstream，把节点和边加入共享 Set，没有每源计数或交集步骤。[GraphDiagram consumer](https://github.com/npmgraph/npmgraph/blob/a6d5a56a576c85d69931e7e5549a0a97fc85b656/components/GraphDiagram/GraphDiagram.tsx#L282-L318) 只按这些 Set 开关 selected/upstream/downstream/unselected class。

因此，多选高亮回答“至少从一个所选点可达”，Shared reach 回答“从每个所选点都可达”。生产部署图上的反例很具体：并集会包含 redis、postgres、replica，交集必须排除三者。不能拿 npmgraph 的多选截图当共同依赖能力证据。

## 5. Archify 完整公开输入和实验答案

产品基线固定为 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`（dev 的所选 revision，不含文字前缀）。[完整输入 production-deployment.architecture.json](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/examples/production-deployment.architecture.json)，本轮 `git show` 实读并校验 SHA-256：`610a5614667e8f108bdcf1769c9d7af5c3ce0fb62be3ea50550b10eb752e4bda`。这是公开 authored 示例，不是真实生产调用证据。12 个节点、12 条连接，原文件完整保留组件、位置、样式、boundaries 和 cards；以下只为便于复核列出完整拓扑，实验应直接消费原输入。

```text
nodes = clients, edge, gateway, api_a, api_b, redis, postgres,
        events, worker, replica, audit, observability
edges = clients→edge, edge→gateway, gateway→api_a, gateway→api_b,
        api_a→redis, api_b→postgres, api_a→events, api_b→events,
        events→worker, postgres→replica, worker→audit, worker→observability
```

**明确构造的读者任务**：“API Pods / AZ-a 与 API Pods / AZ-b 沿图中箭头都能到哪些组件？哪些只是某一侧能到？”没有声称某用户已经问过、答错或耗时过长。

本轮用自写的只读 Python BFS 从完整输入计算 oracle，没有执行任何上游实现，也没有声称实际 Viewer 已给出以下结果：

| 集合（排除所选端点） | 精确答案 |
| --- | --- |
| api_a 下游 | events、worker、audit、observability、redis |
| api_b 下游 | events、worker、audit、observability、postgres、replica |
| 两者交集 | **events、worker、audit、observability** |
| 仅 api_a | redis |
| 仅 api_b | postgres、replica |
| 两者并集 | events、worker、audit、observability、redis、postgres、replica |

共同节点不止首次汇合 events：worker、audit、observability 也必须包含。共同上游 gateway、edge、clients 不在共同下游中；反向走回 gateway 再到另一侧属于错误的无向扩张。该图中没有从任一 API 到另一 API 的有向路径，不能用 A→B 的 PATH 问题替代交集问题。

当前基线 [viewer/focus.js](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/focus.js#L82-L132) 已有单源上下游；[applyReachability](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/focus.js#L183-L190) 明确要求 activeIds.length=1。现成方法是先读 api_a 下游再读 api_b、记住两套集合后人工比对。差距是没有直接交集答案，不是单源遍历不正确。本轮没有浏览器操作记录，不能量化人工比较损失。

## 6. 最小实验、反例与值得做的判据

只试一个行为：固定双端点、方向固定 downstream、结果排除两个端点。使用现有图和节点身份显示两个来源、共同节点列表与图上对应位置；保留两条 api→events 分支作为解释共同到达的证据。如果只显示共同节点之间的诱导边，两端到 events 的入口会消失，结果正确但解释不足。实验无需扩成任意多选、任意布尔 DSL、无向语义、故障诊断、全路径枚举或新图引擎。

除公开输入，以下为**完整原创构造反例**，不是上游 fixture 或真实故障，oracle 为静态推导：

| 全部节点；全部边 | 询问 A/B 的共同下游，排除端点 | 排除的误读 |
| --- | --- | --- |
| A,B,X,Y；A→X,B→Y | 空 | 并集 X,Y 不能当交集 |
| A,B,S,T；A→S,B→S,S→T | S,T | 只找直接共同邻居会漏 T |
| A,B,S；A→B,B→S | S | B 从 A 可达但它是输入端点，不能计入结果 |
| A,B,S；A→B,B→A,A→S | S | 环导致端点互可达，仍只保留非端点 S；遍历须终止 |
| A,B,G；G→A,G→B | 空 | 共同上游不等于共同下游 |

接受/否证条件：生产部署图必须精确返回四个共同节点，且能逐个对应到原节点；redis/postgres/replica 无一个误入；读者能清楚区分共同、单侧、空集和端点。图片必须来自实际渲染及实际实验结果，并保留完整输入/基线 provenance；这份报告没有交付图片或 UI 验收。后续若结果仍要读者手工去比两套单源状态、或高亮令来源路径更难辨认，实验应判为收益不足。若测耗时或错误率，应实测再报告，不预设节省比例。

**值得做实验的理由**：两份独立工具都有直接交集 producer/consumer；本仓库的完整公开图提供直接共享、传递共享及三条单侧分支，答案可客观核对；现有单源 reach 不能一次表达这组答案。**尚不足以产品化的部分**：读者任务频率、选点方式、移动端与键盘体验、状态/分享成本、相对于手工比较的收益未测。

## 7. GitHub 排重与方向边界

2026-10-28 本轮通过 authenticated GitHub API 刷新 `common dependency`、`common dependencies`、`shared reach`、`reachability`、`intersection` 有界搜索。搜索会返回词形/文本噪声，不能把结果数量或未命中等同于全历史无重复。读取了下列实际相关正文：

| 现有项 | 当前读到的范围 | 本实验如何避开重复 |
| --- | --- | --- |
| [#83](https://github.com/tt-a1i/archify/issues/83) open；[#294](https://github.com/tt-a1i/archify/pull/294) closed，head `df6ca4dac79f06ca92a4f738bda497355d32d2b6` | bounded role/node comparison、hover preview；PR 最终实现四种 semantic kinds | 多选角色比较不等于可达集合交集；如提正式方向，应明确关联 #83，而不宣称从无节点比较诉求 |
| [#221](https://github.com/tt-a1i/archify/issues/221) open；[#225](https://github.com/tt-a1i/archify/pull/225) open | 单源关系探索可见性、Passport、camera、reach 状态与深链 | 不另造关系状态框架；实验观察应保留该工作的可见性/取消边界 |
| [#998](https://github.com/tt-a1i/archify/pull/998) open，head `25b767c72e9463a89e9e89b696d26a52318189b3`；[#1103](https://github.com/tt-a1i/archify/pull/1103) open，head `f0be206acbc90eb7c6c6b636030e3eb28963d284` | 静态 code analysis / Atlas、文件依赖、finding、源码往返 | 不新增静态发现、源码分析或 Atlas 视图；本实验仅消费 authored 图 |
| [#1139](https://github.com/tt-a1i/archify/issues/1139) **open** | both/none per-connection 方向提案，正文明确把 Route/Reach 是否双向遍历列为待决策项 | **必须保留该问题。本实验只解释既有 from→to，不定义无向语义，不把 none/both 默认为双向可走** |
| [#660](https://github.com/tt-a1i/archify/issues/660) open | 多边共享 port/corridor 路由冲突 | 与共同可达集合不同，不以关键词 shared 判重 |

没有在本轮检索中找到明确实现“两指定端点共同下游集合”的 Archify issue/PR；这仅是有界排重结果。已有 gallery 的单源 reach、Dependency map、Route alternative、Spatial focus 并不自动提供集合交集，沿用上一报告的区别，不把它们改名申报。

## 证据限制

- 外部源码与许可来自本轮固定 SHA 实读；结论依赖静态 producer/consumer 链，不是上游运行收据。
- 本轮唯一算法执行是自写 Python 对固定 Archify JSON 的 oracle 计算；没有执行 GID、BitBom、npmgraph、测试套件或浏览器。
- 没有确认真实故障因果、生产依赖完备性、读者错误率、性能上限或实际时间收益。
- 报告是仓库 prose；按 CONTRIBUTING 的影响分级检查内容/来源/基线即可，没有运行 renderer suite。没有创建 issue、PR、产品控件、发布物或安装。

# task-view 增量：已读身份、流程范围与 Archify 清单

2026-10-28。只读源码研究；唯一建议是修复 Archify **JSON 显式 ID checklist 的序号错项继承**。严格子图范围暂不采用。没有安装、执行上游程序、运行上游测试、运行 Archify 测试或进行浏览器验收；没有实现产品功能。本报告按 research Skill 的一手来源要求，由已受委派的研究 agent 整理。

## 固定来源与增量

- 上游固定 `gtindo/task-view@a3fa21767bfaeb3077fdda08bddb7249366caa93`；Archify 比较固定 `dev@6ca6a5c84439b57ea22e0630fe306e1d91587a6e`。本地检查时 HEAD 为 `b3c85c9656212a4ba83430844603334132f120a9`，报告涉及的 reader/render/parse/revision/schema、focus/lens/guided-views/CSS 和 checklist 测试与固定比较提交无差异。
- 对照 [10/25 原研究](../../2026-10-25/scouts/task-view.md)、[10/26 增量核对](../../2026-10-26/scouts/named-project-refresh.md)与[本日 reading-state](reading-state.md)。上次固定 `f27b8bef63ec336b8e3487e90ccd484a2fa7a235` 到本次的[官方 compare](https://github.com/gtindo/task-view/compare/f27b8bef63ec336b8e3487e90ccd484a2fa7a235...a3fa21767bfaeb3077fdda08bddb7249366caa93) 为 2 commits：`45eb908440d21037864ca12863d19d48afb85d44` **Track review progress and draw flows as branching graphs**；`a3fa217` **Scope the graph to what is picked in Flows**。比较结论沿用本轮协调调查，不重复宣称全新项目发现。
- 源码链：上游 README / USER_GUIDE → review types、load / load_test → reader app.js → 官方 demo JSON；Archify parse/schema → render HTML → reader localStorage → source/content revision → Viewer focus/lens/scenes/steps → 现有测试。
- 上游根 LICENSE 是 MIT；这不覆盖所有 vendored renderer 许可，旧报告已记录 ELK 的 EPL-2.0。本报告只研究机制，不复制上游程序或依赖。

## 完整官方控制 fixture 与来源字节

本轮完整读取了上游 `demo/change-show-code-after.json`，不是截取 JSON 片段。它是官方随仓发布的自述变更 fixture：1 repo、12 nodes、8 edges、1 flow、3 claims、2 notes，repo 内指向历史提交 `12199940391020372c51b1f669dfa83b4f4c8bee`。唯一 flow `inspector-code` 包含 node-inspector、excerpt-box、code-mode-pref、after-rows、excerpt-struct、builder-excerpt、code-table、after-styles，测试节点通过 tests edge 关联 builder-excerpt。fixture 自己的 notes 明说 app.js tabs 没有自动化测试，TestOpenWritesPage 只检查页面写出和嵌入数据；`meta.observed=passed` 是 fixture 的报告字段，本轮没有执行它，不能变成实跑通过。

完整读取的 `internal/review/load_test.go` 是另一份官方控制 fixture，含全部节点、边和 3 组表驱动测试：

| 控制组 | 完整输入边界及源码期望 |
| --- | --- |
| Connected（5 cases） | linear、branching、reversed edge 合法；跳过 unchanged service 报 flow_gap；tests edge 不连接步骤 |
| Steps（5 cases） | code only 合法；test、doc/config 不能作为 flow steps；仅 endpoint 报 flow_without_code；unknown IDs 留给另一个检查 |
| Coverage（3 cases） | 所有 changed code 在 flow 中合法；缺 view 分支报 node_not_in_flow；无 flow 时 handler/store/view 各报遗漏，deleted、unchanged、off-flow kinds 不要求覆盖 |

这些完整官方控制输入足以核对声明的模型和源码分支。它们不是自然生产观察，也不是性能、收益或运行正确性的证据；不把额外“自然生产 fixture”设为研究结论的硬门槛。以后若做产品实现，按具体行为选回归证据。

本地缓存 `/tmp/archify-task-view-refresh-20261028/` 的以下文件均重新计算 bytes/SHA-256，与缓存 manifest 一致（8/8）。缓存是临时工作材料；下表固定提交链接与 hash 是可复查来源身份，报告不依赖缓存永久存在。

| 官方文件 | bytes | SHA-256 |
| --- | ---: | --- |
| [README.md](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/README.md) | 18310 | `dcf4def410823387c49f7b10004f13000796cb1e86ee6365aa832fb24ba0ecc8` |
| [internal/render/assets/app.js](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js) | 139132 | `a7e491033a6c89f755930c4d6b628165d7dbb5dc699511633094994acae99865` |
| [internal/review/load.go](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/load.go) | 18118 | `878222922cfc4faa5e605b534b1b09a3d74fdac58807343756d6f1482b8889d7` |
| [internal/review/load_test.go](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/load_test.go) | 4331 | `5de416f447f380af133d6a9a73f481df77720ff683fd4bb3457bc107583d4997` |
| [internal/review/types.go](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/types.go) | 5135 | `ee3b87c1bb55dc8cfc37ac096c183ed2375dd98b41dec215494432946a3ff3fe` |
| [demo/change-show-code-after.json](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/demo/change-show-code-after.json) | 9178 | `32096a6cd5ff27bce5fe3eeea8a318750608722e038b1a001dca9710cbd3aec5` |
| [LICENSE](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/LICENSE) | 1075 | `1e9de46e2feb8e0b134d0f5eef807be1971e22c3c004ccf29e1b6131e55f916e` |
| [docs/USER_GUIDE.md](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/docs/USER_GUIDE.md) | 17384 | `8f871c81749b964899cbd038a34516f4700e507734728ad40666b02405055dc3` |

## task-view：三种标记不能合称代码审批

[internal/render/assets/app.js#L348-L432](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L348-L432) 的 storage namespace 是 `cv-marks:` + repo abs 路径序列 + reviewName。实体 ID 下保存指纹，并非只保存布尔；重新生成同名审阅页会读取相同 store。改 repo 绝对路径、repo 序列或 reviewName 会换 namespace。storage 被禁用则本页内状态可用，重载不保证保留。

| 标记 | 指纹输入 | 会失效 | 不直接触发失效 |
| --- | --- | --- | --- |
| node read | node.change；ref.repo + refText；excerpt.rows 的 t/h 文本；无 excerpt 回退 node.label | 指纹输入变动；node ID 改动；node 不存在 | why、result、无关代码变化；有 excerpt 时单改 label；普通 repo HEAD 变化不直接入指纹 |
| 独立 hunk mark | hunk.rows 的 t/h 文本 | hunk ID 或行文本/类型变化 | 无关 hunk；仅位置变化但 ID/rows 未变 |
| 无 hunks 文件 mark | file.status + file.path | 文件 ID、状态、路径变化 | 二进制内容本身没有进入这个指纹 |
| flow reviewed | flow.path.join(" ") | flow ID、path 中 ID 或顺序变化 | 相同 path 下节点代码、标题、解释变化 |

`refText` 对 file/range/site 使用文件及行范围，对 commit ref 使用短 SHA；不是整个 Git snapshot 的哈希。node 的代码指纹取 `excerpt.rows`，不是所有最终文件或可达代码。见 [internal/render/assets/app.js#L181-L194](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L181-L194)。

有覆盖节点的 hunk 不消费独立 hunk mark，而是所有 covering nodes（hunk nodes + whole-file nodes）都 read 才算 reviewed；没有覆盖节点才需自己的 mark。文件所有 hunks reviewed 才算文件 reviewed。这是阅读账目规则，不是程序证明自然语言解释正确或测试执行成功。

flow 的 **steps read** 和 **Reviewed** 明确分开：[internal/render/assets/app.js#L1990-L2027](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L1990-L2027) 中 readCount 统计 node，而 Reviewed 单查 flow 指纹，按钮可独立标记并折叠。保持 flow ID/path 而修改节点代码，node 可 unread，但 flow 仍 Reviewed/折叠。这是静态源码可推出的最小场景，未运行复现。因此不能借上游来宣称“任何代码变更自动撤销整条流程批准”。

## 最新 flow.path 是入口可达集合，不是严格执行顺序

[internal/review/load.go#L426-L491](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/load.go#L426-L491) 的 reachableSteps 从 path[0] 做 BFS；只考虑两端均在 path 中、且 kind != tests 的边，并把每条边双向加入邻接表。checkFlowConnected 对每个 path 成员检查可达，不要求相邻数组成员之间有边。完整 branching fixture 把 service/store 分支与 view 并列收进同一 path，端点 `serves` 的反方向也可连通。

所以本次不能沿用旧研究“按 path[] 顺序执行”的强解释。数组仍提供首个入口、展示/指纹身份，但其验证语义是 **flow 内部入口可达的节点集合**。这不是运行时调用轨迹，也不证明分支先后、可执行性或动态覆盖。flow 覆盖检查要求新增/修改的 code/component/entry 节点进入某条 flow；测试、文档、配置与 import 不作步骤。见 [internal/review/load.go#L394-L424](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/load.go#L394-L424)、[internal/review/load.go#L494-L517](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/load.go#L494-L517)。

## Archify：个人任务进度的实际身份

[archify/explainer/reader.js#L667-L671](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L667-L671) 注释把 ticks 定义为读者自己的 progress。唯一消费者是 `.checklist` input 的勾选恢复；没有审查批准、发布门禁或验收状态。

- 键：`archify-checklist:${root.dataset.artifact}:${closest('.block').id}`；值：列表 DOM 顺序对应的 `0/1[]`。读回只检查 saved[index] === 1，忽略 item 文本与页面 revision。
- [archify/explainer/render.mjs#L61-L66](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/render.mjs#L61-L66)、[archify/explainer/render.mjs#L90](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/render.mjs#L90)：list.items 是字符串数组，每项 input 无独立 item ID，外层使用 block.id。
- [archify/explainer/render.mjs#L128](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/render.mjs#L128)：data-artifact = document.meta.id，同时输出 data-revision，但 checklist 不消费后者。
- [archify/explainer/revision.mjs#L5-L19](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/revision.mjs#L5-L19) 实际计算 authored document、source、source revision/text、diagram、assets、dependency 内容身份；不能因为有这份 revision 就假定勾选会据其失效。

### Markdown 已有整块内容身份

[archify/explainer/parse.mjs#L92-L100](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/parse.mjs#L92-L100) 为自动 block ID 使用 `stable(type, panel.id + "\0" + JSON.stringify(block))`，stable 是 SHA-256 前 12 hex（L6）。所以修改 checklist 文字、增加/删除/重排 items 会换整块 key，所有勾选自然清空。panel ID 变动也会换块键。meta ID 可显式指定，否则来自标题（L256），变动也会换 namespace。

[archify/explainer/parse.mjs#L286](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/parse.mjs#L286) 将 `[ ]`、`[x]`、`[X]` 都剥掉，只留 checklist=true 和文字；作者写 `[x]` 不是读者已完成。[test/explainer-charts.test.mjs#L53-L59](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/test/explainer-charts.test.mjs#L53-L59) 也期望两种写法均输出无 checked 的 checkbox。

因此“Archify 清单没有任何内容变更失效”是错误判断。代价是 Markdown 单个 item 变动会清掉整个列表进度，并没有逐项保留身份。

### 确认存在的 JSON 序号错项

JSON 由 [archify/explainer/parse.mjs#L47-L49](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/parse.mjs#L47-L49) 直接解析并保留显式 IDs；[archify/schemas/explainer.schema.json#L168-L194](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/schemas/explainer.schema.json#L168-L194) 要求 list.id，而 items 只有字符串，没有 item 身份。

最小构造场景：同 meta.id=a、block.id=checks，items 为 [核对A, 核对B]；读者勾第一项，storage 为 [1,0]。新 JSON 保持 IDs，改为 [核对B, 核对A]；renderer/reader 按 index 让核对B 显示已完成。即使是第一项原地替换为新任务，也继承旧勾选。这是源码发现的有效错误，不是已发生的生产事故，也未作浏览器复现。

另有条件差异：清单文本不变，仅代码/source revision 或其他面板变化，Markdown 和 JSON 的同键进度均保留。对于个人任务进度未必错误；只有任务被明确要求绑定代码版本，才能将其定义为应失效。目前不据此新增通用版本撤销或审批流程。

相关测试搜索只发现 checklist grammar/HTML 断言，没有发现 checklist localStorage 内容变更/JSON 重排的回归断言。本轮未运行任何测试。

## Flows pick→scope 与现有阅读操作

| 机制 | task-view 最新 | Archify 固定基准 | 判断 |
| --- | --- | --- | --- |
| 小块先读 | 选 step/edge/flow 作为 focus | 节点 focus、关系 pin、scene、steps 已覆盖局部阅读 | 用户任务大幅重叠 |
| 选择与范围 | Flows pick 决定 focus；Graph selection 只切 inspector | scene 通过 focus.setMany，pin/lens 各自显示关联上下文 | 状态机制有差异，不能等同 |
| 真正子图 | graphNodeIds 过滤后只提交可见节点，附带 tests；+N/- 逐环扩展邻居 | focus/lens 通常保留原 SVG，靠 opacity 聚焦；scene 调同一 focus API | 不是同一实现 |
| 步骤引导 | 分支图与 flow 卡片、节点 read 数 | Explainer steps/流程逐步高亮，前后切换并恢复 | 不应再列为全新能力 |

原始链：[internal/render/assets/app.js#L908-L935](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L908-L935) 的 select/setFocus 分开 selection 与 scope 并清 expanded/revealed；[internal/render/assets/app.js#L1148-L1245](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L1148-L1245) 计算 focus 节点、附 tests、递归 expanded 邻居和实际 graph elements。无 flows 显示全图，有 flows 但无 focus 则没有基节点。Graph 内点 inspector 不改 Flows pick。

Archify 对照：[viewer/focus.js#L1010-L1043](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/focus.js#L1010-L1043) 固定关系与 hash；[viewer/focus.js#L1552-L1607](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/focus.js#L1552-L1607) 标记选中节点及关系；[viewer/semantic-lens.js#L371-L429](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/semantic-lens.js#L371-L429) 按 kind 标记匹配/peer；[viewer/viewer.css#L4343-L4346](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/viewer.css#L4343-L4346)、[viewer/viewer.css#L4408-L4413](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/viewer.css#L4408-L4413) 降低非匹配透明度。[viewer/guided-views.js#L1466-L1491](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/guided-views.js#L1466-L1491) scene 调 focus.setMany(mode=selection)；[archify/explainer/reader.js#L446-L501](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L446-L501) 已有 steps 与 workflow 的逐步高亮。

严格子图有布局、可见性、扩展集合、折叠依赖和导出范围等新增维护面。本轮没有证据证明它比既有 focus/lens/scenes 更适合 Archify 实际图，也没有测得阅读时间或错误率收益，因此暂不采用，不安排第二项实现。

## 与既有研究和 PR 的边界

本报告是 [reading-state](reading-state.md) 中 task-view 两提交的精确展开，不重复计新来源。旧 [task-view](../../2026-10-25/scouts/task-view.md) 的 review-map 提案处理 Git hunk、解释遗漏和引用，不是个人 checklist 存储；[Task review map / Round24](../../2026-10-25/scouts/round24-change-reading.md) 及现有 occurrences 研究也不因本报告重新立项。既有 markport 版本绑定已读讨论由 reading-state 指向，不宣称此次首次发现版本指纹。

[PR #1119 Passport Task checklist](https://github.com/tt-a1i/archify/pull/1119) 在本轮协调核对记录的 head 为 `6979ce895ceca594ff90a9a5e7ef43b87514bfc0`，本轮保存的完整 PR 正文说明：在 architecture/workflow/sequence/dataflow/lifecycle 五类节点上展示作者或 Agent 写入的只读 task_checklist，状态为 implemented / needs-review / pending；source 检验只能证明固定提交的文件和行存在，不能证明任务实现或满足验收标准，也不新增读者运行时状态存储。涉及 focus/CSS/template；见[本轮去重快照](../resume-status.md)。该段正文已从 `/tmp/archify-read-progress-overlap-20261028.json` 与 `/tmp/archify-task-view-overlap-20261028.json` 核读，功能结论是 PR 自述范围，没有独立运行验证。它不是 Explainer JSON input 的本地勾选恢复，不据名称含 checklist 就认定已修复或功能重复。PR 状态/范围使用本轮协调调查，不以此声明合并或部署。

## 唯一建议与可验证边界

**推荐修复 JSON 显式 ID 清单的错项继承。** 用户问题是换了任务却继承旧完成状态。最小方向是在恢复勾选时核对清单内容身份，内容不符则不恢复旧 index 数组；可沿用现有 Markdown 的整块失效粒度，不必新增审批、代码依赖图或跨版本逐项合并。具体存储升级、旧数组处理与同内容恢复应在实现时明确，报告不预设接口。

有界验证应覆盖：同 IDs 同内容重载保留；同 IDs 替换/重排/插入 item 不把旧勾选映射到新任务；不同列表互不串状态；现有 Markdown 内容换 ID 和个人操作保持。此为建议的回归集合，尚未执行。代码/source 变化自动清勾、按源码版本复审、flow 子图范围均不列入本项。

证据强度：8 个上游文件字节校验完成；完整官方 JSON 和控制测试源码已读；Archify 数据→HTML→存储链已静态追踪；运行与浏览器结果均未取得。产品收益判断保持为工程推断。

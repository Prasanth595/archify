# Archify research continuation · 2026-10-26–28

> 当前交付规则：按用户最新要求，后续实验只推送独立 `codex/` 远程分支，不新建 PR；已有历史 PR 不作自动合并或关闭。

本批从远程现状开始去重，再为有明确阅读价值的剩余问题制作小实验。用户已授权持续调研、隔离实现和独立 `codex/` 远程分支。**2026-10-27 用户更新交付要求：完成的实验只推送远程分支，附产物、图片和验证记录，后续不新建 PR。** 下方已创建的 Draft 属于此前交付历史。不自动合并、发布版本、部署或安装。此前研究记录中的暂停属于上一轮历史，本次明确继续。

## 开始前核对

- 新实验共同基线：`dev` [`e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/commit/e837dc4cb83042d2b6c596e039692e25ec62c2da)。其中已含 Explainer reader baseline #1113；旧实验的截图、测试与浏览器失败不改称新基线证据。
- 上一轮总账：[`codex/research-lab-20261025@714c1d3c`](https://github.com/tt-a1i/archify/tree/714c1d3ca691499684a1e89842e3188f85bdabea/docs/research/2026-10-25)，已有 49 项实验。保存了[逐项去重索引](audit/prior-experiments.json)，其 gallery 原始来源可能早于最新远程 head；以本批[远程分支快照](audit/remote-branches.tsv)分别核对。
- GitHub connector 查询只返回前 100 条，随后用分页 API 补齐：本批开始时 [118 个开放 PR](audit/open-prs.tsv)、[121 个开放 issue](audit/open-issues.tsv)。快照是当时状态，不代表后续没有变化。未改动现有贡献者分支。
- 主工作区已有网站赞助等未提交修改；实验使用独立 worktree，未将这些修改混入分支。

## 筛选结果

| 方向 | 具体读者问题 | 去重与成本判断 | 本批决定 |
| --- | --- | --- | --- |
| Task-view：行为路径与测试关联 | 一段改动说明中的哪一步关联了测试源码？哪些步骤没有声明关联？ | 既有 task-review-map 已有真实 Git 引用与遗漏 hunk；但其步骤只是节点数组，没有结构化 flow/test 关联。只读固定 mapping，加有限 sidecar 投影，不复制 Git adapter 或上游 renderer。 | 独立实验 `codex/lab-task-flow-tests`，关联声明与测试执行分开。 |
| ExceptionGroup：打印位置与对象身份 | 同一异常打印两处，是否代表两次错误？group 包含与显式 cause 有何不同？ | 延续上一轮 Round 27 未实现研究。原创 stdlib fixture 实跑，保存 traceback 与对象关系；用现有图和解释页，不增加栈解析器、变量采集或产品 schema。 | 独立实验 `codex/lab-exception-identity`；明确为刻意构造示例，非生产事故。 |
| CodeTour / Codecrumbs | 按理解问题跨文件阅读 | 现有 source-question-tour 已有同源对照；上游 HEAD 与既有固定版本相同。新的页面不能证明理解效率。 | 不新建实验；保留[来源与判断](scouts/ecosystem-refresh.md)。 |
| xyflow 隐藏节点／子图 | 先看模块再看细节 | 已有 Focus/Reach/Lens、Atlas 与相关实验；上游示例未提供折叠聚合边的证据语义，增加成本中等。 | 无新缺口证据，不实施。 |
| tldraw focus mode | 暂时隐藏工具界面 | 当前 Presentation 已覆盖主要阅读任务；SDK 自定义许可另有限制，独立借鉴也没有新价值证据。 | 不引入 SDK，不新建实验。 |

Task-view 确认为 [`gtindo/task-view@f27b8bef63ec336b8e3487e90ccd484a2fa7a235`](https://github.com/gtindo/task-view/tree/f27b8bef63ec336b8e3487e90ccd484a2fa7a235)。本次核对仍是同一源码版本，不能把重新发现当新增能力。项目 MIT 与 vendored ELK 的 EPL-2.0 分别记账；实验只独立实现有限投影，不复制依赖。

两个方向的价值目前是有来源支持的阅读假设。通过产图或自动检查不代表真人阅读更快，也不代表适合直接加入正式产品。各分支应保存输入、实际产物、来源许可、复现命令、失败与验证范围，完成独立检查后保留可审查远程分支，按最新交付要求不再新建 PR。

## 交付进度

截至 2026-10-27，本批两个方向已分别完成隔离实现、独立复核、真实浏览器检查和远程推送，均为 Draft PR，目标 `dev`。研究总账另存于 `codex/research-lab-20261026`。两项产物复用的产品代码仍是冻结基线 `e837dc4c`；不存在对新产品基线的验证声明。

| 实验 / Draft PR | 独立分支与最终 head | 已完成的证据 | 保留的限制 |
| --- | --- | --- | --- |
| [Exception identity · #1120](https://github.com/tt-a1i/archify/pull/1120) | [`codex/lab-exception-identity`](https://github.com/tt-a1i/archify/tree/codex/lab-exception-identity/experiments/exception-identity) · `daf243ae7f40f4f989894f894bb354c5ec5a5660` | 原创 Python 3.13.16 fixture 实跑；5 项语义测试；showcase finalize 四阶段与四组 capture 通过；独立 review；实际 Finder→inner→cause→outer、Escape、主题切换 | 刻意构造的对象关系，非生产事故或完整运行轨迹；说明卡需滚动；没有读者效率或人类验收结论 |
| [Task flow/tests · #1121](https://github.com/tt-a1i/archify/pull/1121) | [`codex/lab-task-flow-tests`](https://github.com/tt-a1i/archify/tree/codex/lab-task-flow-tests/experiments/task-flow-tests) · `843c877b251baf89925f99e11594fc5630c1c165` | 固定 mapping 原字节复用；9 项测试；finalize 三个静态阶段通过；实际逐步看、测试源码跳转、明暗/390px截图；47次Tab到达页脚 | visual-check 仍失败：四状态共16条 keyboard-traversal 诊断。实际 Tab 证据单列，不覆盖自动失败；历史测试未执行；手机图为带打开入口的小预览 |

### 真实产物图片

![Exception identity：同一对象、两次打印、不同关系](https://raw.githubusercontent.com/tt-a1i/archify/daf243ae7f40f4f989894f894bb354c5ec5a5660/experiments/exception-identity/evidence/root-overview.png)

![Task flow：每一步的测试关联与未执行状态](https://raw.githubusercontent.com/tt-a1i/archify/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests/root-review/overview-light.png)

修正记录也保留在各分支：异常图首次自动通过，但核心次数藏在默认不显示的 tag 中，改为始终可见的 sublabel；测试路径的硬编码摘要被单路径反例推翻，已改为实际输入驱动，并新增相应检查。前稿、失败 TAP、截图和机器诊断没有改成成功。

两个 Draft PR 均附 immutable head 图片与复现入口。创建时远程 CI 仍在运行；#1120 当时部分 package/core/ZIP/website 检查通过，不能据此称完整 CI 通过。下一批应先刷新两个精确 head 的 CI 与反馈，再决定补证或继续筛选。无需重新创建相同研究分支。

研究和实验没有合并、发布版本、部署或安装；持续目标仍在进行。后续依旧先查远程与现有研究，对没有新缺口的项目明确排除，不以新增分支数量代替用户价值。

## 27 日续批

[新的远程快照与逐项排重](audit/20261027-refresh.md) 已计入历史第 50 项 Relation search、开放 #1119 Task checklist 和 #1117 SVG 导出修复。304 条 ref 中有 53 条 `codex/lab-*`：50 项旧 gallery、1 项 deferred prototype、上批自己的 2 项。不会把 ref 数当成已验收成果数。

| 新调研 | 筛选结论 | 制作范围 |
| --- | --- | --- |
| [Perfetto / Speedscope / Catapult](scouts/async-trace-reading.md) | 找到公开历史 trace 的明确 s/f 端点，能展示 flow 关联、嵌套与时间先后的区别；不是再做 X 区间投影。 | [Draft #1122](https://github.com/tt-a1i/archify/pull/1122)：6 条固定来源记录与一个明确关联，保留全件摘要、未投影范围及来源许可；端点差不称排队或 CPU 时间。 |
| [dive / container-diff / nix-tree / OCI](scouts/layer-and-closure-reading.md) | 保留 whiteout 的下层作用范围问题；Nix 共享闭包与已有 retained-size 重复，排除。 | [Draft #1123](https://github.com/tt-a1i/archify/pull/1123)：原创两层 tar 的实测成员清单，加明确标注为规范推导的可见性；不运行容器，不写 unpacker。 |

本轮内容例使用现有图和 Explainer，不改共享 Viewer 或 schema。源码、第一稿、语义核对与真实页面观察已完成后推送，四个实验分支和 `dev` 都用 `git ls-remote` 核对身份。新建 PR 时 CI 尚无结论，Draft 与用户接受仍是分开的状态。

| 新实验 | 最终远程 head | 实际证据与保留的失败 |
| --- | --- | --- |
| [codex/lab-trace-flow-evidence](https://github.com/tt-a1i/archify/tree/codex/lab-trace-flow-evidence/experiments/trace-flow-evidence) | `9f9f9dacf58832f1c8784a1a24f6e04c456a4881` | 完整 Catapult 原件与 BSD 通知；6 项语义测试及独立复跑；三静态门通过；visual-check 保留 12 条键盘诊断。root 实际逐步看、下一步、结束、来源跳转，Tab 31–33 到达来源/页脚；1440 明暗、390 深色，窄屏页面无横向溢出。 |
| [codex/lab-oci-whiteouts](https://github.com/tt-a1i/archify/tree/codex/lab-oci-whiteouts/experiments/oci-whiteouts) | `5f37aaa707567a4004317cad12fc4c02cb2f27b6` | 原创 tar 与完整 inventory；7 项检查及独立复跑；native 四门、Explainer 三静态门通过；额外浏览器门保留 16 条键盘诊断。root 实际打开图/Escape 焦点返回，Tab 32–36 到达复制/来源/页脚；1440 明暗、390 明暗。 |

两项最后的提交只添加 root 图片、记录与文档。独立源码审查分别绑定 `05f2f243` / `2db99eb8`；对应最终 HTML SHA 仍为 `4cc2274999e58b9f75b717c053528a85964e3545b3cb0a8fe638b8cdf246dff1` / `5b4790c282740cf6d94e71e4b072ad7a3d2b5daab90228e73340c2d716815043`。实际截图不能覆盖键盘门失败，也没有读者效率、真人 AT 或容器执行结论。

![Trace：明确记录的 flow 关联](https://raw.githubusercontent.com/tt-a1i/archify/9f9f9dacf58832f1c8784a1a24f6e04c456a4881/experiments/trace-flow-evidence/root-review/final-light.png)

![OCI：下层被隐藏，同层新增保留](https://raw.githubusercontent.com/tt-a1i/archify/5f37aaa707567a4004317cad12fc4c02cb2f27b6/experiments/oci-whiteouts/root-review/final-light.png)

### 上批 CI 跟进

[本轮第一次完整检查快照](audit/ci-first-refresh-20261027.json)：#1120 的精确 head 有 19 项成功，两个部署任务跳过；CodeRabbit 只报告 Draft 跳过 review。#1121 的 `browser-regression (2)` 失败于共享 Sequence 的 1396×480 短视口首屏 containment，[原失败摘录](audit/task-flow-ci-failure.log) 与[只读诊断](audit/task-flow-ci-diagnosis.md)保存。

#1121 产品、测试、依赖与同样基线上的 #1120 对应路径相同，且测试不读实验输入。本地 exact-head 的 Reader Layout 文件 18/18 通过（17 个 nested subtests 加 parent）；这不能证明已知竞态或覆盖 hosted 红灯。仅尝试重跑失败 job 时远端返回 `job cannot be rerun`，workflow 的 webm-decode 仍在运行；未修改共享代码或启动全套重跑。后续刷新该 run 完成状态后再判断是否能执行单 job 重跑，不把未执行记作通过。

## 27 日第三批：约束阅读与复用已有候选

开始先刷新远程，`dev` 仍为 `e837dc4c`，历史 gallery 的第 50 项 Relation search 已计入排重。收尾时再次保存[306 条远程分支](audit/remote-branches-round3.tsv)、[124 个开放 PR](audit/open-prs-round3.tsv)和[122 个开放 issue](audit/open-issues-round3.tsv)。其中 56 条 `codex/lab-*` 包含历史候选与本批实验，不能当成 56 个已验收能力。

| 调研 | 判断与实际交付 |
| --- | --- |
| [Porcupine / Knossos / Elle](scouts/operation-history-reading.md) | 选 Porcupine 固定 README 的三操作说明例做同源对照。区分实时先后和模型推导，不把区间重叠当因果，不将上游声明的 checker 结果称为本轮执行。 |
| [ESLint Config Inspector / ripgrep ignore](scouts/rule-matching-reading.md) | 找到“匹配否定 glob，但最终没有配置”的具体问题；原工具已有相应阅读入口，目前没有额外价值证据，不新建实现。 |

[操作顺序实验](https://github.com/tt-a1i/archify/tree/4d0d21c6db1530e274fc1b0487ce65329c4574de/experiments/operation-order)已推送到独立 `codex/lab-operation-order`，head `4d0d21c6db1530e274fc1b0487ce65329c4574de`。两版共享六事件、模型、三句解释与枚举表；图版只增加三条约束成环的面板。固定原文、MIT 许可、首稿、独立语义复核、可复现命令、两份 HTML、八张实际截图及便携证据均保留。

两版 finalize 三静态门与独立 browser-check 通过，写作提示保留。实际 1440×900 比较：文字页高 1526px / 156572 bytes，图版 1805px / 541210 bytes；多出 279px 与 384638 bytes。390px 下文字直接可读，图预览需要打开交互图才能细看。原生图默认“后端”图例也不适合操作节点。图能表达矛盾，但没有证据表明它胜过三句文字；本轮保留对照分支，暂不开 Draft PR，不增加共享功能。独立审查绑定 `ef3e751c`，最后提交只添加证据和文档，HTML 字节保持一致。

![三条不同依据的顺序约束组成矛盾](https://raw.githubusercontent.com/tt-a1i/archify/4d0d21c6db1530e274fc1b0487ce65329c4574de/experiments/operation-order/root-review/candidate-constraints-light.png)

已有远程 `codex/lab-keyboard-traversal@c96e8aa7` 被用于[三份冻结 HTML 的限定验证](audit/keyboard-current-artifacts.md)：Task 40/40、Trace 27/27、OCI 29/29 必达目标均通过，四种视口/主题状态零诊断，原 HTML 前后相同。该结果证明旧候选能处理这些输入，不表示当前 dev 已集成；原来的 16/12/16 条失败继续保留。没有创建重复修复分支。临时 validation worktree 已归档，原始回执留在外部目录，公开的派生摘要和原件 SHA 已入库。

### 精确 head 的 CI 与反馈

[第二次完整快照](audit/ci-second-refresh-20261027.json)中，#1120、#1122、#1123 各有 19 项成功、2 个部署任务跳过。#1121 有 16 项成功、`browser-regression (2)` 失败、`webm-decode` 运行中。仅重跑失败 job 的先前请求未成功，此轮没有再次提交；继续等待 workflow 完成状态后再判断。四个 PR 的讨论均只有 CodeRabbit 的 Draft 跳过通知，没有新的人类反馈或实质审查结论。

本轮继续保持目标 active。下一步先刷新已有 PR 的精确 head 与 CI，再筛选新的阅读缺口；不把重复调研、图能生成或 CI 绿灯当作用户价值证明。

## 27 日第四批：筛掉重复表达，推进已有可验证修复

本批开始执行 fetch/prune，研究 hub 为 `4671df2c`、dev 仍为 `e837dc4c`；当前候选分支也在更新前用 `ls-remote` 核为 `c96e8aa7`。没有把重新发现的候选复制成新远程分支。

| 新来源与问题 | 本批决定 |
| --- | --- |
| [Git bisect / git-branchless](scouts/git-history-reading.md)：skip 后候选集合与已知 good/bad 的区别 | 官方固定测试提供了可复现实验方向，但 Git 原始输出已直接列候选。四节点线性图的额外阅读价值不足以支持本批实现，先保留研究与原创 fixture 协议。 |
| [marimo / Observable](scouts/reactive-reading.md)：disabled、stale 与重新启用返回集合 | 与既有 notebook/state 阅读研究重叠；短表已能承载当前三节点案例。保留来源及对照协议，暂不实现 importer、通用状态模型或新的图版。 |

### 已有 keyboard-traversal → Draft #1124

[独立审查](audit/keyboard-draft-readiness.md)确认当前 dev 仍有初始控件数加三步的提前停止问题，没有查到同一修复的现有 PR。恢复隔离 validation worktree后，正常合入当前 dev；唯一 ZIP 冲突由合并后的源码规范重建解决，现有 crossing-budget 变更保留。

原远程 `codex/lab-keyboard-traversal` 已从 `c96e8aa7` 正常推进至 [`9601c9b6e4b6addc2f348677d1c198bc6bc74192`](https://github.com/tt-a1i/archify/tree/9601c9b6e4b6addc2f348677d1c198bc6bc74192/experiments/keyboard-traversal/refresh-dev-e837)，创建 [Draft #1124](https://github.com/tt-a1i/archify/pull/1124)，附原始实际 Tab 图片。该算法继续真实键盘操作、冻结初始目标身份并限制总工作；真正的陷阱、隐藏/替身目标和预算耗尽仍失败，不改变 Reader 页面或成功条件。

本次官方 Node 22.23.2 / canonical zlib 下，完整相关 Chrome 测试文件与 core smoke 各 19 通过、零跳过。当前 public CLI 对 Trace 冻结 HTML 的 authentic-provenance 检查通过，四臂 27/27、33 步，原 HTML SHA 不变。两次 canonical ZIP 与提交版本相同；235 成员与 dev 同名，只有 checker 内容改变，当前 dev 的 CLI/checker 入口保留。解包原生滚动正例 2/2 到达；真实 trap 正确失败。独立复核检查实际日志、源码身份、ZIP 成员与 CLI receipt；最后一笔只补可移植摘要和复现说明，不重复跑未受影响的测试。

本次 runtime 与此前 Node 22.23.3 的三页面 API 比较分开记录。原始 receipt 未保存运行前哈希、初始 shell probe 和 ZIP 比对日志的缺口如实披露；没有把派生摘要当原始收据。历史失败与旧产物保持不变，图片复用原始身份，未声称新视觉设计、人类验收或 AT 支持。Draft 创建时 hosted CI 尚待完成。

### Task-view CI 已完成

同一 head 的 [run 40423164172](https://github.com/tt-a1i/archify/actions/runs/40423164172) attempt 2 于 00:31:02 UTC 成功结束：[精确检查快照](audit/task-flow-ci-attempt2.json)为 19 success、2 deployment skipped。只请求重跑失败的 browser job，依赖汇总随后运行，其余成功结果保留原执行时间。初次 `webm-decode` 已成功，`webm-artifact` 原红灯来自 browser 依赖汇总，不能说成第二个解码错误。首次 Sequence containment 失败和本地通过仍保留，[记录](audit/task-flow-ci-rerun.md)没有推断其根因。

本轮没有合并、发布或安装。目标继续 active，下一批先检查 #1124 的精确 head CI，再依据实际阅读缺口筛选方向。

## 27 日第五批：保留原生阅读优势，修正内容标签

开始先 fetch/prune，`dev` 仍为 `e837dc4c`，历史研究 hub 仍为 `60342aa9`。本批复用已有实验和修复分支，没有因为重新调研而新增重复实现。

| 调研与已有能力 | 判断 |
| --- | --- |
| [fast-check 的收缩过程](scouts/counterexample-reading.md) | 固定 MIT 源码的 VeryVerbose 输出已保留缩进树与成功、失败、跳过状态。不能只拿最终反例作为弱对照；当前缺少比完整原生输出更好的阅读证据，暂不实现导入或图版。报告中的演示事件不是本轮实跑。 |
| [关系阅读与返回](scouts/reading-handoff-followup.md) | 重新检查旧原型和当前四份内容例，没有找到新的自然阅读失败。旧例的 Back 与反向关系行都是一次操作；不能把假设的焦点或滚动问题当成已复现缺陷，不新增阅读历史状态。 |

### Operation order：已有字段解决图例用词

原分支正常推进至 [`90a32138da3f1202de5c36b2bddaeb6c06aa61de`](https://github.com/tt-a1i/archify/tree/90a32138da3f1202de5c36b2bddaeb6c06aa61de/experiments/operation-order)。用现有原生 `meta.legend.entries.backend.label` 将“后端”改为“操作”，没有共享代码改动。简写不能承载该字段，改为引用完整 68 行 JSON，显式保留原图实际采用的三列布局和中文 locale；这增加了内容维护成本。

首次直接序列化单列 spec 的 finalize 失败于两处标签重叠；三列中间稿还遗漏中文 locale，均保留证据。最终四阶段检查通过，原有三条写作提示保留。[独立静态审查](https://github.com/tt-a1i/archify/blob/90a32138da3f1202de5c36b2bddaeb6c06aa61de/experiments/operation-order/legend-label-review/review.md)解码实际 HTML 内的原生图，确认只有图例文字和对应 data 值变化，标题、无障碍名称、正文、事件和约束未变；基线 HTML 与源稿字节一致。当前图版 537543 bytes，基线 156572 bytes，新增 380971 bytes；旧页面高度和八张截图继续绑定 `4d0d21c6`。

新版手动交互观察尚未完成：Ego 研究空间 4 已不存在，库存也没有同名空间。按 browser skill 的运行指南，已询问用户是否允许重建，尚待答复；没有用其他浏览器或新空间绕过，也未升级 Ego。自动 browser-check 与静态比较不替代这项观察。此前“暂不开 Draft PR、尚未证明胜过三句文字”的决定保留。此处只影响新手动浏览器检查，目标仍 active，其他调研可继续。

### Keyboard Draft 的最终 CI

[#1124](https://github.com/tt-a1i/archify/pull/1124) 的最终 head `9601c9b6e4b6addc2f348677d1c198bc6bc74192` 已完成 [run 40427641788](https://github.com/tt-a1i/archify/actions/runs/40427641788)：[00:52:06 UTC 精确快照](audit/keyboard-final-ci.json)记录 19 success、2 deployment skipped，无分页遗漏。PR 说明已从 pending 更新为这一结果。CodeRabbit 的独立 status 只是 Draft 跳过通知，不计作实质审查或人类接受。没有合并、发布、部署或安装。

收尾 `ls-remote` 发现 dev 已推进到 `500d4a65211ffe607fde6b3ce7505027b45bb59e`，随后只 fetch dev 复核：合入 #1031 的 SVG 块扫描修复，净变更为 `archify/scripts/check-render-output.mjs`、`test/render-output-checks.test.mjs`、`archify.zip`，键盘专用路径未变。本批起始基线记录不改写；#1124 的绿灯仍只绑定基于 `e837dc4c` 的 `9601c9b6`，不能证明与新 dev 组合后通过。已在 PR 披露此边界，最终集成前须更新组合并核验；本轮未再次 merge、rebase 或无差别重跑。

## 27 日第六批：补完实际观察，跟进新基线

开始先 fetch/prune，dev 为 `500d4a65211ffe607fde6b3ce7505027b45bb59e`。保存了 [307 条远程 ref](audit/remote-branches-round6.txt)、[124 个开放 PR](audit/open-prs-round6.tsv)、[123 个开放 issue](audit/open-issues-round6.tsv) 的本轮快照；新 #1125 是 zh-TW 页面文字提案，不复制其工作。下面的来源复核先查历史实验与 scout，未新增重复分支。

| 来源复核 | 本轮判断 |
| --- | --- |
| [Aquascope / RustViz](scouts/rust-ownership-reading.md) | 历史研究已覆盖相邻的静态权限与生命周期。当前完整原生工具有源码、所有权时间线及运行时模式；保留 reference 移动与 referent 身份问题，但不把静态输出或存在 expected/actual 差异的快照当运行事实，暂缓新图。 |
| [SQLGlot](scouts/sql-lineage-reading.md) | 补核完整原生 HTML、tooltip、UNION 分支与 schema 星号边界；列来源/筛选影响已有历史研究。没有新的对照证据，不新增 parser 或重复实验。 |
| [Automerge](scouts/automerge-register-reading.md) | 当前可见值、活跃冲突集和历史是不同层次；官方资料已提供完整解释。有限 issue/PR 组合搜索未找到可核查的自然困惑，不能当作需求不存在。暂缓运行探针，保留固定版本、actor、操作和三阶段记录合同。 |

### 图例新版本的实际浏览器观察

用户明确允许重建研究浏览器空间后，恢复本目标唯一空间，返回 id 4。实际打开图版、查看明暗交互图，并按 Escape 返回；“操作”图例和三条约束均可见，关闭后焦点回到打开按钮。三张 1440×900 原始截图逐张查看，新页面实际宽 1440px、高 1805px。原 HTML SHA 仍为 `65f0b87b6b230600971af7e2895f65cc227bfe875d972cc158c350ce8a84b3b2`，历史八张图片不改绑定。

原分支已推进到 [`bc6cb7cde3d11b2f9e3fe65035cc04829e5f2194`](https://github.com/tt-a1i/archify/tree/bc6cb7cde3d11b2f9e3fe65035cc04829e5f2194/experiments/operation-order/legend-label-review)，含图片与实际操作记录。只补证据，没有新产品代码或新阅读效率结论；继续保留研究分支，不创建 Draft PR。Ego 未升级。

![修正图例后的实际交互图](https://raw.githubusercontent.com/tt-a1i/archify/bc6cb7cde3d11b2f9e3fe65035cc04829e5f2194/experiments/operation-order/legend-label-review/modal-light.png)

### Keyboard 候选与 CI 的完整状态

原分支 `codex/lab-keyboard-traversal` 已推进到 [`f9fc38cbc19f5bb2725fd54d957e182831eb1eb9`](https://github.com/tt-a1i/archify/tree/f9fc38cbc19f5bb2725fd54d957e182831eb1eb9/experiments/keyboard-traversal/refresh-dev-500d)，历史关联为 [Draft #1124](https://github.com/tt-a1i/archify/pull/1124)。组合新 dev 后唯一冲突为 ZIP，以组合源码规范重建；候选键盘行为没有再改。新的相关静态检查与 Explainer caller 共 96/0/0，core 19/0/0；两次构包与提交 ZIP 相同，235 个成员保留新 dev，只有键盘 checker 内容不同。两个打包 checker 均等于源码。[独立复核](audit/keyboard-draft-readiness.md)核实原始日志、全部摘要哈希、祖先与 ZIP。旧 Chrome、三产物 API、Trace CLI 和解包交互证据保留原 revision；新记录不冒称重跑它们。

新 head 的 [run 40431526745](https://github.com/tt-a1i/archify/actions/runs/40431526745) attempt 1 为 [17 success、2 failure、2 skipped](audit/keyboard-ci-attempt1.json)：browser shard 2 在 1396×480 compact Sequence 首屏失败；webm-artifact 只汇总 browser 失败，实际 WebM 成功。首次[日志摘录](audit/keyboard-current-ci-failure.log)和[只读诊断](audit/keyboard-current-ci-diagnosis.md)保留。两次不同 PR 的完整几何 JSON 相等，相关源码一致，而且该用例没有调用改动的 Explainer 键盘遍历；这仍不证明根因、flakiness 或误报。

确认整个 workflow 已终止后，只请求重跑失败 browser job，依赖汇总随之重跑；attempt 2 workflow 成功，[最终精确快照](audit/keyboard-ci-attempt2.json)为 19 success、2 deployment skipped。其他成功项复用 attempt 1 的执行结果。首次失败没有被删除或解释成已经修复，PR 说明同步两次状态。本批没有合入产品分支、发布、部署或安装，目标仍 active。

AI assistance：Codex（GPT-6.1-Terra 与 GPT-6.1-Sol 子代理）参与调研、实验实现、验证和文档；本记录不声称维护者已完成个人审查或验收。


## 27 日第七批：固定来源对照与未得到报告的探针

开始前先刷新远程分支并检索历史 50 项实验、scouts 与现有 issue/PR，BPF、ASan 未发现同范围实验；这些有界关键词搜索不保证覆盖全部同义表达。CSS cascade/specificity 已有历史 `style-reading-round9.md`，未重复实现。实验冻结于 `dev@500d4a65`；收尾 [远端精确 ref 快照](audit/round7-delivery.json) 显示 dev 已推进至 `d5d979493bba650b3995836afd379cd249f2d0dd`，增加 compact brand badge 与 edge-label contrast 改动。本批图片和检查仍属于冻结基线，不能当作新版验证。

**按用户更新要求，两方向仅推送独立远程分支，没有新建 PR。** 不将已暂缓的运行探针计为完成图形实验。

| 方向 | 远程分支 / 精确 head | 实际交付和限制 |
| --- | --- | --- |
| [BPF 边界阅读](scouts/bpf-range-reading.md) | [`codex/lab-bpf-range-reading@cd5d94ea`](https://github.com/tt-a1i/archify/tree/cd5d94ea3bf66b9ae4b08459ac5d454994b2aee2/experiments/bpf-range-reading) | 同源 baseline/candidate HTML、完整上游文件与许可、原创 65,536 对数学模型、七张实际截图、机器回执和独立复核。候选只追加对齐表，没有共享代码或 native 图。没有运行 Linux/verifier，也没有证明读者更快。 |
| [ASan 三段栈](scouts/asan-provenance-reading.md) | [`codex/lab-asan-provenance@6f604170`](https://github.com/tt-a1i/archify/tree/6f604170574b5ba854026a7ec8f01fb5ba0dd67a/experiments/asan-provenance) | 原创 C 探针、复现命令及脱敏控制记录。未得到 ASan 报告，因而没有制作图、图片或阅读对照；方向暂缓。 |

### BPF：同一证据的并排组织

固定 Linux `d135ab45` 的完整 `verifier_bounds.c` 与 GPL-2.0/COPYING 原样保留；两臂均展示 map 定义和两个完整函数（原文 9–76 行），原始特权/非特权预期、数学说明及来源一致。独立复核验证远端 blob、实际 HTML 可见 DOM 和数学事实，没有把位向量集合当作 verifier 内部范围。候选新增六行比较表，突显唯一额外移位指令及标为数学模型的 −1/255 结果。既有表格足以承载这个问题，不为研究数量增加 parser、range engine 或通用图功能。

两臂 finalize 的 validate/deliver/check 均通过，各自 browser gate 当时未请求；保留基线 1 条、候选 2 条写作提示。后续 public CLI 的 authentic-provenance browser-check 分别通过四种主题/视口组合，必达目标 21/21 与 23/23，浏览器诊断为零；runtime 是 Node 26.12.0 / Chrome 156.0.8078.48，不是 canonical Node 22 CI。首次并发交付锁失败、首次 audit 尾部换行失败及未改内容的串行重试均保留。发布回执仅脱敏本机绝对路径，完整浏览器机器记录入库，原件/public SHA 清单区分派生副本；未公开原始本机路径的旧本地提交。

[实际页面复核](https://github.com/tt-a1i/archify/blob/cd5d94ea3bf66b9ae4b08459ac5d454994b2aee2/experiments/bpf-range-reading/root-review/review.md)使用本目标唯一 Ego 空间，按既有授权重建后继续，不操作用户其他空间。1440×900 明暗与 390×844 窄桌面视口截图已逐张查看，导航和主题切换可用。比较表三列保持在 332px 内；源码需要水平滚动，实际 wheel 从 0 到 375.5 再返回 0，页面没有横向溢出。窄视口不是手机设备或触摸验收。

基线已有清楚结论与完整预期表；候选只提供另一种组织。代价是 HTML 增加 10,191 bytes，1440px 页面高由 2761 增至 3185（+424px），390px 由 3597 增至 4141（+544px）。没有计时、错误率或真人理解实验，暂不推荐进入共享产品。无需为此次内容与证据提交重跑完整产品测试，也没有声称 hosted CI 通过。

![BPF 同源内容对照：数学限定与指令差异并排呈现](https://raw.githubusercontent.com/tt-a1i/archify/cd5d94ea3bf66b9ae4b08459ac5d454994b2aee2/experiments/bpf-range-reading/root-review/candidate-compare-light.png)

### ASan：先承认运行证据缺失

原创 16-byte 分配/释放/偏移 5 读取示例用 Apple clang 17.0.0 编译成功，但运行约 20 秒无输出，SIGTERM 后 shell status 143；禁用符号化再运行约 10 秒仍无输出。第二次状态是作者记录，不冒称原始退出码流。独立空程序控制中，普通构建运行 0.538 秒后 exit 0；相同工具链加 ASan 后 5 秒无输出，由 runner 终止，return −15。最初 direct-driver 的链接失败与后来正常 launcher 的成功编译分别留档。

一秒 process sample 的选取记录显示初始化过程中通过 dyld/malloc 再入 ASan、落在 StaticSpinMutex 等待。它支持“本机 instrumentation 初始化未正常完成”的观察，不证明特定 OS bug、死锁根因或修复办法。没有安装新工具、修补环境或伪造报告。恢复该方向需先得到完整、带符号的三段真实报告，再做同源阅读对照；当前远程分支只交付可复现探针和诊断边界。

研究总目标继续 active。后续仍先核对远程分支与已有研究，按可证实的阅读价值筛选；不合并、发布版本、部署或安装。


> 第十批更正：下面第八、九批的 B/C 保留为历史记录。Tree 用来表达依赖声明不符合包含关系合同；此前只核对来源与拓扑的复核不足。当前更正候选和证据见 [D](https://github.com/tt-a1i/archify/tree/4805f166d0c3078f06e7b309f1594c788b79ee5f/experiments/conflict-explanation/dependency-model)。

## 27 日第八批：解释范围对照，保持原生阅读能力

开始先 fetch/prune 并检查 [309 条远程 head](audit/remote-branches-round8.txt)，当前 dev 为 `d5d979493bba650b3995836afd379cd249f2d0dd`。复核历史 50 项实验和相关 scouts，再进行 [有界 issue/PR 搜索](audit/round8-dedup.json)；#1136 是跨产物一致性提案，与依赖求解失败阅读不同。零关键词命中不证明全仓不存在同义需求。本批只新增一个远程实验分支，没有新 PR；[收尾精确 ref](audit/round8-delivery.json) 验证远端 head 与本地提交一致，dev 在收尾快照中未变。

| 方向 | 筛选与实际交付 |
| --- | --- |
| [PubGrub / uv 失败解释](scouts/dependency-conflict-reading.md) | PubGrub 有完整离线 fixture 和归约前后双份报告，允许一个有界同源内容实验；uv 的 open3d 快照缺冻结的完整索引，仅保留研究。 |
| [堆保留关系](scouts/heap-retention-reading.md) | Chrome 已能联查分配区间与 retainer；Memray 分配栈不能替代 GC 引用路径。缺少可公开的同源 capture 与完整原生对照，暂缓，不引入 parser、快照采集或 viewer。 |

### PubGrub：既有图的潜在收益和实际成本

独立远程 [`codex/lab-conflict-explanation@ae0acf7d`](https://github.com/tt-a1i/archify/tree/ae0acf7db3014cf4392ae5db9ff7529ec1fe8190/experiments/conflict-explanation)，只提交 `experiments/conflict-explanation/`，工作树干净。两臂固定 PubGrub `2b32d6a1` 的完整 `confusing_with_lots_of_holes`，包含完整测试函数、未归约和归约后报告、相同结论及上下文；保留完整上游文件和 MPL-2.0。报告来自上游预期断言，本轮未运行求解器、Rust 或 registry。输入登记五个 foo 候选，每个引用没有提供版本的 bar；baz 已登记，但归约后的解释包名集合没有引用它。不能把图当安装树、唯一最小冲突或运行时轨迹。

B 在共同文稿后追加现有 native Tree 和范围表，四个包名节点、三条声明边；同时触发 Reader 已有的正文词语标记，不能把对照说成只有静态排版变化。共享 renderer、schema、Skill、依赖均未改。独立来源复核与 HTML 静态核对通过；[实际页面记录](https://github.com/tt-a1i/archify/blob/ae0acf7db3014cf4392ae5db9ff7529ec1fe8190/experiments/conflict-explanation/root-review/review.md)含 14 张末期截图，另有一张首稿观察。旧 B native 图片仍绑定旧父 HTML，只有经解压字节比较确认完全相同的 native 子产物允许复用观察。

1440×900 的 A 首屏已经能解释核心问题；B 将输入/解释范围并排展示，但没有计时、正确率或独立读者结果证明增益。实际验证了打开图、折叠 foo、恢复 bar、切换明暗与 Escape 返回焦点。390×844 发现表头溢出，保全失败前版本后，只缩短两个表头，最终三列完整落在 332px 容器内。原生工具条可以横向滚动，随后两次放大到 150%；放大后节点部分超出视口，需平移查看。平移、触摸、AT 和单独正文词语入口激活没有完整验收，不把窄桌面视口称为手机验收。

最终 A 为 152937 bytes，B 为 539978 bytes，增加 **387041 bytes**；桌面页面高增加 723px，窄视口增加 787px。保留首稿/第二稿/语义修订/窄屏修正的源稿和机器记录，首稿 HTML 本身没有留存，首稿图片未严格绑定加载字节。三静态 gate 与单独 browser-check 通过，各保留一条 writing warning；runtime 是 Node 26.12.0 / Chrome，未运行 canonical CI。脱敏 records 只是历史证据，重新检查需生成当前 sidecar。完整 staged diff-check 的 36 个空白提示来自冻结的生成 HTML，排除 HTML 后文本检查通过；没有为消除提示改写已验产物字节。

**处置：保留研究分支，尚不推荐共享功能。** 现有 native 能承载该解释，但额外体积、滚动和内容维护成本尚未被读者收益抵消。复现命令、原文、许可、各阶段 SHA、失败记录及独立复核都在分支 README 中。没有新建 PR，也没有合并、发布、部署或安装。

![PubGrub 最终声明图与解释范围表的实际页面](https://raw.githubusercontent.com/tt-a1i/archify/ae0acf7db3014cf4392ae5db9ff7529ec1fe8190/experiments/conflict-explanation/root-review/candidate-final-overview-light.png)

### BPF：源码键盘滚动没有复现缺陷

继续固定既有 `cd5d94ea` 的 A，在 390×844 下通过真实 Tab 走到原生 `pre`（DOM tabIndex 为 −1），ArrowRight 能将 scrollLeft 从 0 移至 253.5，再在明确重建焦点后到最右 375.5。完整记录和图片在 [source keyboard audit](audit/bpf-source-keyboard/README.md)。一次跨调用焦点前提失效被保留，没有在失焦状态发送按键或将其报成页面缺陷。这里支持 Chrome 原生水平滚动无需增加 tabindex；没有新键盘分支、BPF 内容改动或 AT 结论。

本批 AI 辅助由 GPT-6.1-Terra medium 作者/研究代理、GPT-6.1-Sol medium 来源复核代理和 root 完成；作者代理在早期阶段中断后由 root 接续。最终包装再经独立只读检查。总目标继续 active，后续按用户最新规则仅交付远程分支。


## 27 日第九批：先验证现有交互，再决定是否扩展

开始先 fetch/prune、保存 [311 条远程 head](audit/remote-branches-round9.txt)，dev 仍为 d5d979493bba650b3995836afd379cd249f2d0dd。查询 task-view 当前 main 仍为历史已研究的 f27b8bef63ec336b8e3487e90ccd484a2fa7a235；没有因为重新查 HEAD 就复制已有 review-map/flow 实验。[有界查重](audit/round9-dedup.json)保存术语、tooltip、线性化与 source keyboard 搜索，并补查当前开放 #221。搜索范围不证明全局没有同义工作。

### 现有 PubGrub 分支补一个内容对照

原远程 [`codex/lab-conflict-explanation@d4f872ee`](https://github.com/tt-a1i/archify/tree/d4f872ee81d3df4e4fd39a2860fccc4f2cae8a65/experiments/conflict-explanation/term-links) 正常推进；本批没有新建分支或 PR，因为这是同一阅读问题的后续验证。原 A/B 文件字节保留，新增 C 与七张实际截图、复现命令、机器记录和独立复核。它只把原文两个包名包装为已有 `node:` 链接，没有新的节点、关系、正文事实或共享 runtime。

在原 B 首屏实际悬停 baz，正确高亮的图节点位于 y≈2187px，当前视口看不到；离开词语正常清除。自动术语本来是 hover 入口，不能把“点击不打开”当失败。27次真实 Tab 能到达原有通用打开按钮，Enter/Escape 都有效；这与正文精确节点入口是不同任务。

C 的两链接在桌面通过真实键盘打开 baz/bar，native 返回的 active/nodes 指向正确目标，Escape 回到各自链接；390×844 也验证了 baz 的进入与返回。只增加 **292 bytes**：539978→540270。原始 native preparedDiagrams 完全相等，编译 document 仅改变链接标记及自动段落 ID。新一轮匹配条件下，两臂页面高相等（1440px宽3161px高，390px宽3451px高）；旧2806px来自另一页面状态，未建立原因，不据跨状态差值归因。

[实际页面复核](https://github.com/tt-a1i/archify/blob/d4f872ee81d3df4e4fd39a2860fccc4f2cae8a65/experiments/conflict-explanation/term-links/root-review/review.md)也记录了不应隐藏的结果：桌面 bar 的节点被详情浮层遮挡，窄屏 baz 被遮住；既有 [#221](https://github.com/tt-a1i/archify/issues/221) 已负责相邻关系探索/护照遮挡工作，因此不另起共享修复。护照还把包名叶节点标为“外部系统”，这是当前 Tree 的泛化标签，不能当作源代码或求解器事实。键盘定位成立，不等于解释语义、视觉可读性或 AT 验收完整通过。

**处置：保留已有链接用法的内容实验，不升级为全面采用图版或改共享 Reader 的建议。** 固定的12次 Tab 是某入口路径计数，不与原通用打开的27次换算阅读速度。没有人类阅读正确率/计时、触摸或 AT 结论，根实验文字 A 的优势仍保留。

第二次生成的精确 C（8c02079d…a9c1f）通过三个静态 gate 与单独 provenance browser-check，保留一条句长提示；机器记录均绑定这次身份，未运行 canonical CI。第一次生成到系统临时目录，虽然检查通过，HTML却包含本机源路径；该首稿私有保全，第二次改为源旁生成并重新检查，没有对已验 HTML 做路径替换。12个 staged 空白提示属于冻结的生成 HTML，排除 HTML 后文本检查通过。

![键盘进入 baz 后的实际页面，浮层类型标签也被保留用于审查](https://raw.githubusercontent.com/tt-a1i/archify/d4f872ee81d3df4e4fd39a2860fccc4f2cae8a65/experiments/conflict-explanation/term-links/root-review/candidate-baz-focused.png)

### 线性化历史排重

[Porcupine / Knossos 补查](scouts/linearizability-reading.md)确认原生 Porcupine 已提供 partition、最长部分顺序、非法候选点、hover 状态与固定选择；同一三操作反例已有 operation-order，未重复制图。Knossos另有16事件、两个未完成操作的完整历史，其 README 对该输入给出 false；这只是固定上游示例，不是本轮运行或绑定的 native 图。记录 pending 与 checker unknown/false 的不同含义和可复现合同，暂缓新的 parser 或同义内容例。

[收尾远端核对](audit/round9-delivery.json)确认实验 head 已推送、工作树干净。用户的仅远程分支规则持续有效；本轮没有新 PR、合并、发布、部署或安装。研究总目标继续 active。


## 第十批：先更正模型，再评价阅读价值

本批开始先 fetch/prune，保存 [311 条远程 head](audit/remote-branches-round10.txt)，冻结 dev `d5d979493bba650b3995836afd379cd249f2d0dd`，对照历史50项实验及当前分支。[有界 issue/PR 查询](audit/round10-dedup.json)和相关 remote branch diff 未发现本例同范围修正；宽泛 tree PR 搜索只取30条，不证明全局不存在同义工作。现有 #221 仍负责护照与相邻关系阅读，未新建重复 issue/PR。D 是原 PubGrub 方向的模型更正，继续推进原分支，没有人为再拆一个方向。

[层级角色研究](scouts/hierarchy-role-reading.md)固定 D3-hierarchy v3.1.2 / ISC 与 Cytoscape.js v3.33.1 / MIT 的源码和官方文档，补充领域数据、结构角色与绘制样式的区别。Cytoscape 的 compound containment 不能拿普通依赖入度/出度代替。与历史 component identity、graph exchange、folding 研究排重后，仅保留本例的具体启发，没有引入其依赖或复制实现。

### 更正此前结论

[独立源码诊断](https://github.com/tt-a1i/archify/blob/4805f166d0c3078f06e7b309f1594c788b79ee5f/experiments/conflict-explanation/dependency-model/root-review/tree-source-diagnosis.md)发现两项独立问题。第一，Tree 合同表达包含关系，B/C 即使满足单父树拓扑，也不能用其连线表达依赖声明；此前“现有 native 能承载该解释”的无条件结论撤回，原产物不改写。第二，Tree 主动把配色 tone 写入 Passport.kind，造成包名叶节点显示“外部系统”；这不是 metadata 缺失后的 Viewer fallback。合法包含树也受第二项影响，本批未修复通用 Tree 默认值。仅把 Tree 文案改成包名的方案已否决，因为依赖/包含的模型错误仍然存在。

原远程 [`codex/lab-conflict-explanation@4805f166`](https://github.com/tt-a1i/archify/tree/4805f166d0c3078f06e7b309f1594c788b79ee5f/experiments/conflict-explanation/dependency-model)增加独立 D：已有 Architecture 的有向连接、四个包名、三条分组依赖箭头、显式任意版本约束。foo 的五个候选合并显示，源输入实际包含七项逐版本声明；没有选定或安装版本、运行 solver、补造证明图。共同正文、四个面板、完整测试函数、两份报告、范围表及来源许可引用保持 C 原样，原始 MPL-2.0 文件仍在实验根目录。

D 按现有领域命名合同统一采用 backend/icon:none，再把图例、Passport、Finder 和 Lens 可见类型称为“包名”。raw IR/DOM、SVG 元数据、Lens kind、Story inspect 仍是 backend，明确不称原生 package 类型。只使用现有字段；没有共享 renderer、schema、Viewer、依赖或产品默认修改。

### 实物、失败与验证

[实际复核](https://github.com/tt-a1i/archify/blob/4805f166d0c3078f06e7b309f1594c788b79ee5f/experiments/conflict-explanation/dependency-model/root-review/review.md)保留13张实际页面图片：4张首版、9张末版，均有文件 SHA 和 HTML 身份。首版 Lens 把输入依赖称为“真实流量”，实际检查发现后，仅补两项文档级 Lens 翻译并重新生成；首版 HTML、初稿、失败截图及两组机器记录保留。[独立产物复核](https://github.com/tt-a1i/archify/blob/4805f166d0c3078f06e7b309f1594c788b79ee5f/experiments/conflict-explanation/dependency-model/root-review/independent-source-review.md)确认 native SVG 未变、解压 HTML 仅两条措辞改变。

1440×900 总览能读到四节点和三条带标签箭头；真实键盘第12次 Tab 进入 baz，Escape 返回，再进 bar，二者显示正确源事实。Finder 查找 bar、Lens 选包名分组后显示4节点3关系均实际观察。新页面进入 bar 另保留13次 Tab 的有效状态，过早读取旧回执的一张总览图没有冒充焦点验收。次数只是固定入口路径，不是阅读计时。

390×844 正文与表格无横向溢出，预览如实提示文字过小需打开原生图；但原生图仍横向滚动、baz右侧被裁切、卡片遮挡其他内容。没有移动端、触摸或 AT 验收结论，也没有拿焦点成功代替可读性通过。

最终 D HTML `09ec711ed24370ea330fe614e0541adf6a5ce621d0324cfdfa66c2676100cd96`，541872 bytes：比 C 增加1602，比文字 A 增加388935。模型与几何已变化，不是同输入图性能优化；没有独立读者错误率/计时，暂不推荐扩大共享功能。额外产物体积、滚动和内容同步成本尚未得到收益证据抵消。

首末两个版本各通过三静态 gate 和独立 provenance browser-check，保留相同1条句长 warning；Node 26.12.0/Chrome 非 canonical Node 22 CI。独立包装复核实算13图、12组raw/public收据映射、归档身份和相对链接全部一致。脱敏副本是历史证据，重现须 fresh finalize；完整 staged diff-check 的32项提示属于冻结HTML尾随空白，排除HTML的文本检查通过。未运行完整产品测试或宣称 hosted CI 通过。

![D 实际依赖声明图：四个包名与三条分组箭头](https://raw.githubusercontent.com/tt-a1i/archify/4805f166d0c3078f06e7b309f1594c788b79ee5f/experiments/conflict-explanation/dependency-model/root-review/declarations-overview-light.png)

[收尾远端记录](audit/round10-delivery.json)核对实验精确 head。AI 辅助由 Terra 研究/作者、Sol 独立诊断与复核、root 页面检查及收尾完成；作者最后包装任务因 capacity 不可用，由 root 接手后再独立复核。用户仅远程分支的规则持续有效，没有新建 PR、合并、发布、部署或安装。研究总目标继续 active。


## 第十一批：合法包含树的类型应来自结构

开始先核对并保存 [311 条远程 head](audit/remote-branches-round11.txt)，dev 仍为 d5d979493bba650b3995836afd379cd249f2d0dd；对照历史研究汇编及相关 Tree 分支。[有界 issue/PR 查询](audit/round11-dedup.json)没有找到本次同范围修正，但不是全局无重复证明。task-view 已在此前批次研究，本批没有重复制图或再次把它当新方向。上一批 PubGrub 模型修正分支保持 4805f166；下面是合法包含树也存在的独立默认语义问题。

新远程 [`codex/lab-tree-roles@a15fbd6e`](https://github.com/tt-a1i/archify/tree/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles) 从冻结 dev 隔离实现。固定官方仓库树31节点、30包含边，只改 Viewer locale 和输出文件名作为相同输入。原 `focus.js` 的 Passport/Finder 显示“外部系统”，根节点显示“前端”；源码证明 Tree 把配色 tone 写成 kind，来源没有这些领域类型。候选采用既有根、分支、叶角色，Lens 也改称层级角色和包含关系。它不改变 Tree 的包含合同，不让依赖图变成合法 Tree。

### 价值、代价和兼容边界

真实键盘 Finder 输入后 Enter，等待同一目标相机矩形稳定：两臂坐标完全相同，“外部系统”变为“叶节点”。原生 SVG 删除唯一变化的 kind 属性后原字节相同；颜色、布局、边和折叠方式未改。输入含1根、6分支、24叶，折叠分支仍显示分支节点。候选 HTML 908519 bytes，比基线增加990。中文实际页面可直接观察到默认假类型消失；这不是读者速度、理解正确率或所有语言人工验收。

实现无新依赖、schema 字段、解析器或通用分类框架。成本是少量 Viewer/CSS 映射、六种内置和六份示例 locale 的六项文案、既有消费者回归覆盖，以及共享模板导致的生成物刷新。旧 Tree Lens URL 能恢复对应结构组，显式旧 kind/Lens 翻译仍被尊重，新键优先；其他图模式不套该映射。raw kind 和 Finder raw 搜索词有意改变，未承诺任意旧 token API 兼容。源启发和许可仍保留在 [D3/Cytoscape 研究](scouts/hierarchy-role-reading.md)，未复制第三方实现。

### 失败、实图和验证

[实验说明](https://github.com/tt-a1i/archify/tree/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles)保留首个实现补丁、翻译键/schema 和示例 locale 失败、新测试 API 错误、独立审查发现的旧 Lens 翻译兼容失败及修复。首个生成候选与最终默认候选字节相同，因为固定输入没有自定义旧翻译；兼容回归另有修前失败和修后通过。没有将首稿丢掉后只展示最终绿灯。

17张实图有14张有效、3张明确排除验收；每张有 SHA、尺寸和产物身份。匹配图片用于前后比较，其他图片仅支持各自状态观察。同页并行导航中断、错误DOM等待及错误尺寸等采集失误另行保留，并串行重做。390×844 的查找能揭开折叠目标、页面无水平溢出，但总览文字仍小、卡片占用较大空间，不能据此宣称移动端、触摸或 AT 验收。

首次完整生成物检查的32项失败均为 stale 示例/模板；最终源刷新15对示例、旧 web-app 模板、Gallery 和 ZIP 后通过。15份原生示例逐一对照：13个非Tree SVG完全一致，2个Tree仅kind元数据变动，开发和打包副本相同。最终官方 Node22.23.2 / zlib1.3.1-e00f703 / Chrome156 下相关测试80/80、core19/19、零skip，生成物检查通过。基线、首候选和最终 HTML 的 finalize 三静态gate与browser-check也通过，使用Node26，visualReview=not-requested；实际视觉检查独立进行，没有hosted CI结论。

[干净提交后的打包复验](audit/round11-clean-build.json)在工作树前后均干净时生成相同 ZIP：SHA256 `46b6b131a6bee934487bd02c66f3026583b787b2dcdcba715c63303a469b7ef9`，7000654 bytes；235个归档成员对应工作源码（package.json按原打包规则去除scripts/devDependencies），不含实验或node_modules。此前连续两次构建也相同。独立交付审计核对66组raw/public哈希、17图尺寸/哈希、HTML/ZIP身份与测试日志，未发现阻塞；它没有重跑历史交互或替代root视觉判断。完整空白告警保留在证据中，仅涉及冻结HTML、日志和统一补丁上下文，实际源码检查通过。借用依赖软链接已清理。

![同一仓库包含树的实际 Lens 页面：结构角色与包含关系](https://raw.githubusercontent.com/tt-a1i/archify/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles/root-review/candidate-lens-paired.png)

### 继续筛选，未证明收益的方向暂缓

[Wireshark包身份与重组阅读](scouts/packet-identity-reading.md)固定官方文档的六段抽象反例，区分捕获到达、流顺序、PDU完成和界面归属。原生已提供相关帧、重组字节和Follow Stream；没有取得并运行对应完整capture，不能把文档字母当抓包或证明产品差距。发现的上游pcap未下载，不推断其单独许可；未安装tshark。

[diffoscope产物差异阅读](scouts/artifact-diff-reading.md)固定镜像版本的两份tar及listing/text/symlink预期，区分元数据、内容和链接目标差异；diffoci的嵌套例另保留出处。没有完整原生HTML执行对照，无法证明另造图表的收益。两项仅保留来源、许可、问题与下一证据门槛，不增加导入器、共享runtime或同义实验分支。

[交付记录](audit/round11-delivery.json)确认实验精确远端head。AI辅助由Terra研究/生成物/交付审计、Sol实现与独立源码复核、root比较与实际页面检查完成。本批只推送远程分支，没有新PR、合并、发布、部署或安装；总目标继续active。


## 第十二批：原生能力足够时，停止新增可视化

上一批已完成源修正、实物验证和远端交付，是有效进展。本批先 fetch/prune，保存 [312 条远程 head](audit/remote-branches-round12.txt)；dev 仍为 d5d979493bba650b3995836afd379cd249f2d0dd，历史汇编仍为60342aa9。[有界查询](audit/round12-dedup.json)与两份研究笔记说明现有覆盖和关键词误命中，不宣称全局没有同义工作。用户仅远程分支的规则继续有效。

[egg 等式重写解释](scouts/equivalence-explanation-reading.md)固定官方源码73975c98与MIT署名。完整教程的原生flat输出已标出规则、子表达式位置和方向；tree/let形式也已有共享表达能力。解释是给定规则下的推导，不是完整执行日志，错误规则甚至可推出错误等价。本批额外识别教程推荐的 `explain_existance` 与同版本changelog已移除该API之间的不一致，避免把旧文案当现有能力。没有运行egg、真实长解释或独立读者收益证据，暂缓parser与图形实验。

[Git bisect 合并DAG阅读](scouts/bisect-reading.md)补充已有线性skip研究。实际Apple Git2.50.1在独立合成空树DAG上运行：A good、D bad、B/C skip、M bad时，退出2并列C/B/M为可能first bad；因此bad标记不排除该节点仍是候选，skip也不是good或bad。默认first-parent visualize仍画出侧支C，但再给原生显示命令传 `--first-parent`，就得到与对应revision查询一致的D/M/B。现有flag已经解决这个显示范围疑问，不能据默认画面另造需求。

[公开原生证据](audit/round12-bisect-native/README.md)保存作者两轮脚本与完整输出，以及root的一次独立可复现运行；9份文件有SHA/字节数。整体exit0、stderr为空，中间歧义exit2符合预期。两轮原始录制来自不同临时目录、五个commit身份一致；原脚本保留，另提供从新临时仓库开始的脚本。空树状态均由命令声明，不是真实bug历史、gitk GUI观察、用户研究或新产品测试。未把原生命令输出改造成Archify图。

两方向均暂缓；重新考虑需完整自然任务及原生强基线上的可重复阅读障碍。缺少这类证据时，新增解释格式维护、关系映射或版本兼容成本没有得到收益支持。本批仅研究与原生复现记录进入总分支，没有通过筛选的实现方向，因此没有新增实验分支或图片，也没有PR、合并、发布、部署、安装。AI辅助由Terra两项研究与原生探针、root补充复现和事实/交付检查完成。总目标继续active。


## 第十三批：Timeline 类型保真与自然问题核查

先fetch/prune并保存[312条远程head](audit/remote-branches-round13.txt)，新实验基线为dev `d5d979493bba650b3995836afd379cd249f2d0dd`；既有Tree方向留在原分支。[有界去重](audit/round13-dedup.json)包括相关分支/历史汇编、issue查询和三个Timeline PR的固定head及diff：#831是DST，#1029是短时长，#1032是年份/表头，没有复做这些工作。该检索不代表全局穷举。继续遵守仅远程分支规则，不创建PR。

### 通过筛选：Timeline 的事件类别进入阅读界面

[九类原生渲染器审计](scouts/timeline-waterfall-kind-audit.md)发现Timeline把调色板技术名称写进Passport.kind：处置成为消息总线，默认事件成为外部系统。新的独立分支 [`codex/lab-timeline-kinds@e5bc4cf0`](https://github.com/tt-a1i/archify/tree/e5bc4cf09129a4f2f49fb799318d18111d9331b0/experiments/timeline-kinds)采用Timeline事件token，并通过既有legend翻译呈现类别。保留技术调色板、用户变量、旧类型文案覆盖、旧Lens分享hash和locale回退；旧hash转换仅限Timeline，新分享链接输出新token。原始data-node-kind选择器有意变化，需迁移旧自定义选择器。没有新增依赖、输入字段、解析器或通用框架。

两份固定输入来自项目原有事故示例和README最小示例，只固定中文与输出名。两臂同输入、同1440×900浅色页面、同Finder查询rollback与真实Enter，目标矩形完全一致；节点详情由“消息总线”改为“处置”，默认事件由“外部系统”改为“事件”。SVG只改变kind元数据，时间、布局、颜色不变；短标签会改变Passport换行，不能称整个页面几何不变。旧messagebus链接在实际深色页面恢复为timeline-action。14张真实截图保留，其中12张为有效观察，2张因视口或动画状态不合条件排除。Lens仍覆盖右侧事件，390×844窄视口仍有详情卡片遮挡，未扩张成移动端验收。

![同条件聚焦后的Timeline处置节点](https://raw.githubusercontent.com/tt-a1i/archify/e5bc4cf09129a4f2f49fb799318d18111d9331b0/experiments/timeline-kinds/root-review/candidate-focus-paired.png)

源码首候选21/22，先修复不合schema的翻译键，再修复未知locale的回退；两次修复预算用完。第一次HTML候选在这两轮源码修复之后生成，与最终HTML字节相同，不能称首份源码通过。最终Node22.23.2 / zlib1.3.1-e00f703 / Chrome156：相关五文件379/379，core19/19，0skip；generated检查通过。初次缺simple-icons、ZIP包装器漏函数、Ego视口/面板采集失败都保留。借用匹配版本依赖后已移除链接，没有安装。五次finalize均通过validate/deliver/check/browser-check且零诊断；visualReview为not-requested，root实际页面验收另有记录。没有hosted CI、自然阅读耗时、AT、触摸、视频或完整测试套件结论。

13份非Timeline原生示例SVG不变，2份Timeline仅kind元数据变化，开发/打包副本一致。主HTML增加1120字节，默认事件增加1095字节。独立源码审查无阻塞；交付审计发现五条失效的改名路径，已修复并去除脱敏副本的重复映射。root最终核对146组raw/public哈希；独立审计核对其中144组业务证据，另两组为随后加入的审计报告。14图、对应HTML、235个ZIP成员及package.json既有字段移除均核对。完整空白告警仅来自冻结HTML、历史日志和补丁上下文，源码检查通过。

[干净提交后的打包复验](audit/round13-clean-build.json)在前后工作树均干净时成功，ZIP仍为 `c002107b581918105fff1099cdc272bdda696272f93af0c2de5e9706c4bdb633`，6999975bytes、235项；与此前两次构建相同，不含实验或node_modules。实际产物、复现命令、第一稿、修复和验证记录都在实验分支，Archify Apache-2.0与来源保留。

### 暂缓与未取得的证据

Waterfall存在同类色调进入类型的机制，但服务、错误状态与span身份不是同一个维度；没有在本轮猜测新分类模型。只保留审计，未建另一个实现分支。

[fast-check与marimo自然问题核查](scouts/natural-reading-gap-round13.md)：fast-check #4956实际是全局endOnFailure关闭收缩、重放建议被当作运行配置；#5276是数据库隔离。二者不能证明尝试树图有价值。marimo #2100涉及lazy、disabled和playbook控制，原生已有依赖图、minimap、引用与运行控制；未取得完整自然状态与独立阅读任务，不能用弱化的原生基线证明新增图的收益。来源、固定版本、许可和重新考虑门槛保留。

[ASan工具链缺口](scouts/asan-toolchain-gap-round13.md)确认旧空程序阻塞发生在main前初始化路径；现有Xcode21只是本地可用替代工具链，没有新运行证据。子代理的新探针执行请求被自动安全检查拦截，提示可能涉及网络安全风险；没有绕过、重试或把准备文件当结果。[原ASan分支状态更新](https://github.com/tt-a1i/archify/tree/9f8d640e2ea5f413560821517e4573738f45aee8/experiments/asan-provenance/toolchain21)仅提交README与JSON，未提交新runner或二进制。旧第二轮运行缺少原始PID/wait记录，当前进程清单不补足历史证据。自然LLVM问题沿用旧笔记，本轮未重新固定全文。

[本批远端交付记录](audit/round13-delivery.json)保存精确head和验证边界。AI辅助由Terra源码/自然问题侦察、生成物和交付核对，Sol实现、独立代码审查和ASan只读缺口分析，root固定输入比较、实际页面、证据修正与远端交付完成。只推送独立实验和研究记录；没有新PR、合并、发布、部署或安装。总目标继续active。


## 第十四批：Waterfall 的兼容取舍与原生工具基线

上一批完成Timeline源码、实物验证和远端交付，属于有效进展。本批先fetch/prune并保存[313条远端head](audit/remote-branches-round14.txt)，dev仍为d5d97949，历史汇编仍为60342aa9。[有界去重](audit/round14-dedup.json)进一步读取Waterfall PR #824/#1028/#1030的固定head与diff：分别涉及服务继承测试、数值时间容差、未结束图例；不重做或修改这些贡献者工作。继续只推远程分支，不创建PR。

### Waterfall：问题真实，修正不等于复制Timeline的映射

[源码决策报告](scouts/waterfall-role-decision.md)核实：自带example-rebuild示例中的25个span分属worker1/2/3和未归属根节点，却按配色成为Frontend9、Backend6、Database9、External1。服务身份仍在context与data-waterfall-service中。原生图例是非交互色键，超过五个服务还会合并同色项，不存在可直接保留的精确service Lens。

root在固定d5 runtime重新生成该输入并完成[实际页面复现](audit/round14-waterfall-native/README.md)：Finder查询worker 1准确返回对应9个ID，真实Enter定位ex0，Passport仍显示Frontend但context保留worker 1；Lens确实显示四个技术色桶，还使用real traffic说明。声明的parent嵌套不因此成为流量或因果。三张1440×900浅色截图、完整HTML、原始输入、CLI回执和浏览器记录已保留。输入数据来自项目已有measured示例，本轮只重新渲染，没有重新计量其中工作负载，也没有人类误读或频次证据。

全部238个冻结archify/文件与d5 git blob匹配。Node22.23.2/zlib1.3.1-e00f703下，finalize的validate/deliver/check/browser-check均通过、零诊断；visualReview=not-requested，实际截图另由root观察。GUI脚本exit0，Ego日志写stderr；独立Browser.getVersion元数据查询不支持并失败，未冒称取得其精确版本。[独立交付核对](audit/round14-delivery-audit.md)确认23项manifest哈希、输入/HTML回执、3图尺寸、原始服务继承与UI节点/查询集合一致。没有新产品源码、全测试套件或hosted CI验收。

统一Span可以消除虚构的系统身份，但会将Lens收敛为一组；旧tone hash可能横跨多个服务和状态，不能一对一映射，更不能静默扩大到所有Span。Radar也按kind着色，需要另保留视觉tone。新增精确service projection则增加选择、标签、URL、兼容和配色合同。现有Finder服务搜索已能完成此固定任务，Outline按context分组是额外源码证据，不冒称GUI验证。本轮判断尚不值得为保留错误色桶新增通用筛选框架，也不先交付有隐性行为损失的role-only修正；暂缓实现是成本判断，并非等待再次授权。

### 外部方向：完整原生能力必须进入对照

[rr/Pernosco逆向调试](scouts/reverse-debugger-reading.md)固定rr5.10.0和wiki版本、许可与官方案例。Pernosco的Node race walkthrough已展示Dataflow追值、栈跳转、notebook，不能重新包装成Archify缺口。rr逆向watchpoint的New value指写入前值，是具体可检验的方向语义，但官方说明已经解释；未取得完整自然会话及接手者误读，暂缓图或导入器。没有安装、录制或执行目标程序。

[Speedscope/Perfetto选区阅读](scouts/profile-window-reading.md)补充旧profile研究：Speedscope #512用户确有按窗口聚合需求，但关闭是因重复#39/PR#366，本次后二者仍open，不能称问题已修复。问题未附完整profile、窗口与预期数字；固定公开Firefox递归fixture虽完整、哈希已记录，却不是同一问题输入，不能拼接成复现。Speedscope原生三视图、self/total、递归折叠与Perfetto区域flamegraph都应进入对照。未运行这些UI或证明Archify额外收益，不再建立同义parser分支。来源与许可保留。

本批新增的是缺陷复现和改变实施决定的证据，没有通过筛选的新实现，因此没有新增实验分支；研究总账远程交付后继续筛选。AI分工为Terra外部研究/交付核对、Sol源码与兼容判断、root固定输入运行/实际页面/取舍与交付。没有新PR、合并、发布、部署或安装；持续目标保持active。


## 第十五批：区分语义差异与需要新界面的缺口

开始先fetch/prune，保存[313条远程head](audit/remote-branches-round15.txt)；dev仍为d5d979493bba650b3995836afd379cd249f2d0dd，既有Tree、Timeline与ASan状态分支不变。[有界issue/PR去重](audit/round15-dedup.json)覆盖ERD/Radar及nbdime/git-machete关键词，不宣称全局没有同义工作。task-view再次读取远程HEAD，仍为f27b8bef63ec336b8e3487e90ccd484a2fa7a235，沿用已有来源/许可研究，不重复制作实验。用户只推远程分支的规则持续有效。

### 既有实现检查：没有证据的修正不做

[Radar类型/配色审计](scouts/radar-kind-audit.md)对固定Tree a15fbd6e和Timeline e5bc4cf0源码确认：Radar保留data-node-kind，显式CSS覆盖各特殊角色，Tree branch与Timeline recovery使用默认backend色，恰与原配色相同。Outline另读SVG实际tone，生成模板也同步。没有发现需要补修的颜色回归；这是源码与映射检查，没有本轮实际UI或computed-color验收，不能拿旧绿灯测试冒充颜色证明。

[ERD类型取舍](scouts/erd-kind-decision.md)拒绝直接照搬Tree/Timeline改名。六个示例节点当前用database，但context明确是Entity，源码没有称其为六个已部署数据库实例；它们已经处于一个Lens组，改成entity也不增加选择能力。raw token迁移会牵动URL、Radar颜色、Story、关系标记与翻译。maintainer在[issue115后续说明](https://github.com/tt-a1i/archify/issues/115#issuecomment-6162488004)已修订早期kind草案，最终范围是实体、键、FK、基数和共享Viewer；不能把最初枚举当遗漏的已批准需求。现有文案override的可行性只做源码确认，未运行实验。当前价值不足以抵消迁移成本。

### Git Machete：完整原生对照已经解释状态差异

[堆栈阅读研究](scouts/stacked-branch-reading.md)固定Git Machete 9578cc2a、MIT与完整上游测试，并单列Git Town #4222自然讨论。后者是远端tracking删除语义，不能与本地squash fixture拼成一份用户复现。

[本轮原生记录](audit/round15-stack-native/README.md)在临时合成四层堆栈上执行已有Python/Git、直接读取固定上游源码，没有安装依赖。develop squash feature后，默认status显示m-feature，关闭squash检测显示x-feature；两条命令exit0、stderr为空。root额外查询确认两分支tree SHA相同，但feature不是develop祖先。内容、提交可达性、声明stack边回答不同问题，现有模式与fork-point说明已经能表达这点。

作者初次、fresh版本与root可移植版本三份运行分开保存，目录/commit身份不同，不冒称同一仓库或三个人类阅读试验。原始HOME设置脚本仅作历史TXT证据；推荐脚本使用干净环境、禁用Git全局/系统配置、新建临时仓库且不改写HOME。48个Python源文件和LICENSE共49个Git blob与固定上游树一致，未把源码vendoring到Archify。[独立交付审计](audit/round15-delivery-audit.md)核对24项文件清单、49个源blob/SHA、MIT字节、日志、实际临时仓库tree/祖先关系以及复现脚本变动，没有发现阻塞。下载超时、克隆中断、SSL失败和随后raw取得路径保留在回执，残片未发布。

本例没有remote、没有执行traverse/rebase/删除，不复现上游完整测试里的origin状态。没有自然仓库同步安全、系统调用审计、UI图片或读者速度结论。原生命令已经回答固定任务，因此暂缓另造stack DAG/parser。

### nbdime：机器差异与阅读界面的选择

[notebook身份研究](scouts/notebook-identity-diff.md)固定nbdime 744c9789、BSD-3许可和完整center/left notebooks，逐文件SHA保留。首cell除id外字段相同；上游已提交截图显示“1 unchanged cell(s) hidden”，它是原作者截图，不是本轮浏览器产物。

[补充源码核对](scouts/notebook-identity-source-followup.md)解决初轮疑问：默认identifier开启且未外部Ignore时，源码路径会产生cell id replace；前端CellDiffModel.unchanged却不计cellId，CSS还隐藏unchanged cell的ID头。这能解释机器字段与阅读摘要的粒度差异，但缺少该上游截图对应的实际响应与server配置，不能把条件推导写成已捕获数据。本机两套Python都缺所需依赖，未安装、未运行nbdime UI或生成新差异图。

既有notebook occurrences实验不含ID，不能替代这次机制判断；但目前也没有必须审计ID的完整真实交接任务，不能把选择隐藏身份字段直接认定为产品缺陷。暂缓导入器或新页面，保留来源、许可和明确重新考虑门槛。

本批交付研究判断、既有实现审计与原生可复现证据，没有通过筛选的新实现，因此没有新增实验分支或产物图片。只修改研究文档和原生回执，未运行无关产品套件；[本地记录检查](audit/round15-validation.json)通过；完整空白检查只有三份冻结Git graph原始输出中的尾随空白，排除这三份记录后通过。检查不等于hosted CI。AI分工为Terra外部研究/Radar/原生探针/交付核对，Sol ERD判断，root补充源码查询、可移植复现与交付。没有新PR、合并、发布、部署或安装，总目标继续active。


## 第十六批：用完整原生结果筛掉重复图示

上一批已推送研究与原生复现证据，是有效进展。本批先fetch/prune并保存[313条远程head](audit/remote-branches-round16.txt)；dev仍为d5d97949，研究hub从021bdf4b继续。[分别查询开放issue与PR](audit/round16-dedup.json)，Ninja/Difftastic/GumTree无关键词命中；order-only返回的正文属于几何、CLI等相邻词误命中，不当作构建依赖需求，也不宣称全局无重复。历史研究总账与相关dependency-map/static-uses/diff-line-numbers分支已对照，task-view沿用已有独立实验与上批版本核对，不重新包装同一方向。

### Ninja：先完成与何时重建是两个问题

[研究笔记](scouts/build-dependency-reading-round16.md)追到固定Ninja源码的完整RebuildOrderOnlyDeps测试，及Android官方关于大段explain难读的自然需求。二者保持分开：上游测试是fake filesystem/runner；Android示例有省略号、没有完整构建状态，不能拼成真实问题复现。

本机没有Ninja后，读取bootstrap并用已有Python/clang在临时目录编译固定源码，没有安装。195个Git blob在构建后与固定上游树一致，源码身份、版本1.14.0.git和二进制SHA分别记录；未发布源码archive或二进制。[实际原生对照](audit/round16-ninja-native/README.md)使用文件复制替代编译，在明确构造的过去mtime下运行query、graph、dry-run explain和真实构建。初次生成oo.h与foo.o，clean无工作，缺失oo.h及推进其输入mtime时各只生成oo.h；三阶段foo.o的hash/mtime/大小均不变。输入内容未修改，阶段时间经过重置，不是自然连续工作流。

原生query已标`|| oo.h`，**本例DOT也已经用dotted边表达order-only**。旧报告的一般类型损失不能扩大成这份图没有类型；DOT地址式ID也不能作稳定身份。已有原生结果已能解释固定问题，尚无理由另造依赖图或parser。

作者首稿会覆盖固定报告路径，原始脚本与回执保留；便携版每次创建独立报告/fixture，root实际复跑一次。11次原生命令含版本查询全部exit0，解释写入各自stderr是正常行为；没有将dry-run说成真实执行。[独立交付审计](audit/round16-delivery-audit.md)核对124份文件的hash/字节、195源blob、许可、binary/harness身份与前后状态。完整输入、脚本、失败边界和复现命令均已归档；没有真人阅读、原生UI或Archify产品测试结论。

### Difftastic / GumTree：原生视图已经很强

[结构化diff研究](scouts/structural-diff-reading-round16.md)固定Difftastic与GumTree源码、MIT/LGPL许可，并找到Difftastic #999完整Java方法提取例。新版本将相同两条println写入新增方法，旧方法改成调用，同时banner和注释另有修改；不能说整个变更保持行为。报告者描述了错误匹配，但没有工具版本或完整输出，评论查询为空，本轮未运行两工具。

补查发现，固定GumTree仓库的官方截图已经展示相同AccountManager示例，对应语句、方法和字符串变化可见；截图hash、尺寸和路径已记录。它是上游图片，不是本轮产物；图例/参数未展开，不能凭颜色宣称特定机器action，图中文字也不能证明与issue字节完全一致。该证据增强了原生基线，暂缓新页面/匹配器；不把AST对应当语义等价，也不为已覆盖的结构差异换一张图。

本批交付改变筛选依据的研究与原生证据，尚无新实现方向通过筛选，因此没有新增实验分支或产物图片。[记录验证](audit/round16-validation.json)覆盖原生探针、JSON、相对链接、脚本语法、全部清单成员已暂存和空白检查；未跑无关产品套件，未宣称hosted CI。AI分工为Terra来源研究/临时bootstrap/首稿探针/独立归档核对，root补查原生基线、修正泛化结论、便携复现和远端交付。只推远程分支；没有新PR、合并、发布、部署或安装，持续目标保持active。

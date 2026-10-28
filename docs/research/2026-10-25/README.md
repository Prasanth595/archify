# Archify 持续探索与实验分支

2026-10-25 启动。项目维护者要求持续寻找代码理解、图形表达与交互阅读项目，把有价值的点做成独立远程分支，附真实产物图片供审阅；直到维护者明确说停才停止。完成某一批并不结束目标。

**当前状态（2026-10-28）：** 用户明确“继续吧”后目标保持 active。Diff matching blocks、Route alternative、Diff file navigation、Shared reach、Mandatory paths 与 Refactoring records 已完成独立审查、真实浏览器对照和各自远程分支交付；总账现为56项。新证据与最新GitHub排重见[本批交付](../2026-10-28/README.md)。以下暂停段落仅保留历史。

**星数不作为门槛或排序依据。** 每个方向都看实际问题、现有能力、维护成本和来源证据；小项目、早期项目同样纳入。与已有 issue/PR 重复的方向先排除或明确剩余差异。

前 30 项首次产出的共同实验基线：[dev `82c7e0f0`](https://github.com/tt-a1i/archify/commit/82c7e0f089a02a4d514714adf37dc2061682da5f)。2026-10-25 15:41（台北）重新核对 GitHub，dev 已推进到 [`3f95f034`](https://github.com/tt-a1i/archify/commit/3f95f0349c8276db71509ca239461b6fe9d00f9f)，main 为 [`51a29177`](https://github.com/tt-a1i/archify/commit/51a291770851ad27a400cca73c753c166b5e0c65)，分别合入 #1098 / #1099 的 Apache-2.0 与软件声明更新。已有产物及测试继续绑定原基线，不能据此宣称已验证新 dev；后续新实验从更新后的 dev 开始；DBML后续更新已纳入新dev，版本与证据另列。下面的“已推送”只表示远程实验分支可审查，不能等同于合入、发布或人类验收。

同次 GitHub 核对中，#1098 / #1099 分别于 15:36:06 / 15:36:19（台北）合入；最新正式 Release 仍为 [v3.2.0](https://github.com/tt-a1i/archify/releases/tag/v3.2.0)（2026-10-19 发布）。分支更新不等于新版本发布。

2026-10-25 16:18（台北）再次核对：dev 已合入 [#1100](https://github.com/tt-a1i/archify/pull/1100)，推进到 [`67f12389`](https://github.com/tt-a1i/archify/commit/67f12389212c54b3122da60e2813c7f8dab7ab2f)，main 仍为 `51a29177`。这次修改 finalize 的源码范围修复、候选文件保留及相关交付逻辑；Copy identity、CLI reading tour 和 Clipboard outcome 保留实际冻结的 `3f95f034` 基线，不把既有结果改称新 dev 验证。

最新状态另见[19:20–19:21晚间GitHub快照](github-status-latest-evening.md)：main/dev、部署等待、实验精确head和PR状态分别记账，不把Actions/check-runs为0当通过。 20:53:28（台北）最新只读快照确认dev/main仍为10b4/51a29177，CI状态与19:20相同（dev成功、main部署等待）；#1103/#1015/#998 heads不变，未发现晚间新增PR。原始API响应留checkout外，不补造部署完成或候选CI通过。 最新核对见[22:07–22:09 GitHub状态](github-status-2207.md)：main51a29177/dev10b4及重点PR身份不变，dev CI成功、main部署仍waiting；最新release仍v3.2.0。

## 2026-10-26 第50项收尾与暂停（历史）

今日曾按用户要求恢复持续探索；昨日暂停和今日恢复均保留为历史。**本批第50项实验、报告和图片总览已收齐；按最新要求停止后续探索，等待用户明确继续。**今日状态与三个有界只读报告见[2026-10-26 日报](../2026-10-26/README.md)，GitHub基线为dev `e837dc4cb83042d2b6c596e039692e25ec62c2da`。原研究没有直接推荐实施候选；协调者随后在既有图上实际对照，选定Relation search作为第50个独立实验，未将构造复现称为自然用户痛点。

第50项已推送 `codex/lab-relation-search`，精确head `e87a858d220c25c97aee4b5920cf59ab77723b41`，远端一致且工作区clean，独立终审READY；协调者报告精确head Actions runs=0、check-runs=0，不能称远端CI通过。索引收尾时间点：`2026-10-26T05:48:55Z`。已推分支不等于合入、发布、部署或人类验收；50项gallery现已补齐并做本批范围的浏览器检查；本批收尾后暂停，不宣布持续探索目标已完成。

## 已推送的 56 个实验

第56项Refactoring records远程分支已交付；当前55版画廊观察保留固定身份，56版静态增量与本批新卡片浏览器观察另行记录。

分支里的 README 含实际图片、原始/示例输入、生成 JSON/HTML、复现命令、来源许可与验证边界。

[离线图片浏览页](gallery/README.md)：已发布55版为17产品交互、17离线适配、21内容示例，source hub `cc347773a8474fb1bf3c6329b15f378d6493da75`，HTML SHA-256 `73201d0fa2195d7c361d2dbacf503b4a68a4749e53614f6c21c7f3fb875a426d`。root已完成Mandatory paths新卡片与通用控件的实际浏览器检查；旧54项记录、卡片与PNG原字节不变。第56项增量尚待单独构建和本批gallery检查，不复用实验截图冒充gallery观察。

| 实验与远程分支 | 具体价值 | 发布 revision | 实际图片 | 验证与限制 |
| --- | --- | --- | --- | --- |
| [Task review map](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map) | 固定Git改动对应独立声明；真实PR #1097的5hunk已记账与ZIP未解析并列 | `dcedd538` | [真实PR前后布局](https://github.com/tt-a1i/archify/tree/codex/lab-task-review-map/experiments/task-review-map/pr-1097) | 原15 tests复用；新增完整4文件证据，映射exit1；只手工改9坐标修阅读性，原输出保留；3静态gate通过，仍30键盘诊断；未跑PR代码 |
| [Dependency map](https://github.com/tt-a1i/archify/tree/codex/lab-dependency-map/experiments/dependency-map) | 把 dependency-cruiser 已有报告变成局部原生图，保留未解析与视图外账目 | `2be2ab55` | [官方样例](https://github.com/tt-a1i/archify/blob/codex/lab-dependency-map/experiments/dependency-map/screenshots/official.png) | 6 tests；两图 finalize 四阶段通过；synthetic 的三条绕行建议仍保留 |
| [Trace waterfall](https://github.com/tt-a1i/archify/tree/codex/lab-trace-waterfall/experiments/trace-waterfall) | 把真实采集的 Chrome X 格式操作区间变成可分享瀑布图 | `8e65f150` | [真实采集](https://github.com/tt-a1i/archify/blob/codex/lab-trace-waterfall/experiments/trace-waterfall/screenshots/workload.png) | 9 tests；四阶段通过；仅 X 子集，不推断调用树或关键路径 |
| [Markdown outline](https://github.com/tt-a1i/archify/tree/codex/lab-markdown-outline/experiments/markdown-outline) | 标题与源行号直接转原生 Tree，保留文档层级 | `3f156e97` | [原生 PNG 导出](https://github.com/tt-a1i/archify/blob/codex/lab-markdown-outline/experiments/markdown-outline/screenshots/contributing-export.png) | 8 tests；三样例四阶段通过；公开 CONTRIBUTING.md 17 节点，受限 Markdown 子集 |
| [DBML ERD](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) | 保留键、关系方向和可空性；接受官方primary key同义写法 | `358c77e0` | [官方主键示例](https://github.com/tt-a1i/archify/blob/codex/lab-dbml-erd/experiments/dbml-erd/primary-key-acceptance/screenshots/primary-key.png) | 已纳新dev；49focused、旧parser两新例失败/新版本通过；完整36B官方输入接受与四阶段通过，127B simple-table仍拒绝；旧拒绝与4表证据不变；未执行数据库 |
| [Change coupling](https://github.com/tt-a1i/archify/tree/codex/lab-change-coupling/experiments/change-coupling) | 解释 Code Maat CSV 的对称共变分数及原始计数 | `44dc5cbc` | [原生证据图](https://github.com/tt-a1i/archify/blob/codex/lab-change-coupling/experiments/change-coupling/screenshots/coupling.png) | 13 tests；原生图仅render，Explainer finalize通过/browser未请求；synthetic，非调用或因果网络 |
| [Payload delta](https://github.com/tt-a1i/archify/tree/codex/lab-payload-delta/experiments/payload-delta) | 借鉴 PR Lens；把明确提供的 JSON 样本差异放在调用旁，区分 null、missing、类型和数组身份 | `823e8705` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-payload-delta/experiments/payload-delta/screenshots/review.png) | 10 tests；render/finalize 通过，单独 Explainer browser 通过；保留一条段落长度建议，不推断 schema 兼容性 |
| [Decision thread](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) | 保留异议、撤回与单方决定；决定不会抹掉尚未解决的异议 | `bdbdf9a9` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-decision-thread/experiments/decision-thread/screenshots/sequence.png) | 8 tests；两种产物四阶段通过；原创虚构对话，颜色图例已修正，不推断群体共识 |
| [Migration plan](https://github.com/tt-a1i/archify/tree/codex/lab-migration-plan/experiments/migration-plan) | 阅读 pg-schema-diff 已有计划中的顺序、timeout 配置与原始 hazard | `b9fe3b9b` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-migration-plan/experiments/migration-plan/screenshots/migration-plan.png) | 14 tests；Workflow仅render，Explainer finalize通过/browser未请求；无 SQL/数据库执行，synthetic；新提交仅澄清文案 |
| [State contract](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | 固定官方机器定义实导出，再核两个观察到的toggle声明 | `f7269e09` | [官方fixture实导出](https://github.com/tt-a1i/archify/blob/codex/lab-state-contract/experiments/state-contract/measured/screenshots/explainer-overview.png) | 补证基线67f；40focused、原版getDAG实导出2状态2边、两页四阶段通过；2declared/0undeclared仅观察事件集；没有运行事件/回调；旧synthetic/rich拒绝记录保留 |
| [Finder canvas matches](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | 输入查询后，列表与画布同步显示匹配节点，保留既有选择与视图 | `ed04916f` | [新dev同输入实图](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights/refresh-dev-10b4) | 基线10b4；19browser、22core/XML、1gallery及68golden通过；57新base/candidate SVG相同；235项ZIP/精确CLI四阶段0诊断；4实图/原DOM字段，非完整camera或效率证明，旧10文件不变 |
| [CI conditions](https://github.com/tt-a1i/archify/tree/codex/lab-ci-conditions/experiments/ci-conditions) | 固定真实 workflow 的 needs、原始 if、隐式 status 门槛与未知矩阵 | `0ec0b834` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-ci-conditions/experiments/ci-conditions/screenshots/overview.png) | 10 tests；三份产物 finalize 四阶段通过；没有运行 CI 或预测 job 结果 |
| [Plan actions](https://github.com/tt-a1i/archify/tree/codex/lab-plan-actions/experiments/plan-actions) | 分别看两种 replacement 顺序，保留 unknown/sensitive/null 路径与 deferred/complete | `729d3a03` | [官方完整fixture](https://github.com/tt-a1i/archify/blob/codex/lab-plan-actions/experiments/plan-actions/upstream-example/screenshots/explainer.png) | 原16tests复用；官方1资源delete→create完整输入通过，Workflow render/Explainer三阶段通过；before/after值不入输出模型，native字节扫描保留一处静态注释普通词重合；未执行Terraform |
| [Recipe stages](https://github.com/tt-a1i/archify/tree/codex/lab-recipe-stages/experiments/recipe-stages) | 官方Just dump保留priors边界：a在空主体b前，c在后 | `062dee5d` | [实际工具输出解释页](https://github.com/tt-a1i/archify/blob/codex/lab-recipe-stages/experiments/recipe-stages/measured/screenshots/explainer-overview.png) | 补证基线67f；官方test有效输入实dump、10tests、两页四阶段通过；自然完整示例因assignments拒绝；公开副本只改/source并保留真实输入sha区别；无recipe执行，旧synthetic不变 |
| [Relation reference](https://github.com/tt-a1i/archify/tree/codex/lab-relation-reference/experiments/relation-reference) | 复制当前 pinned 关系的原始方向、标签、节点 ID 与明确身份，便于准确引用 | `d5691a02` | [新Passport关系引用](https://github.com/tt-a1i/archify/tree/codex/lab-relation-reference/experiments/relation-reference/refresh-dev-10b4) | 基线10b4；57focused/19core/完整generated、235ZIP/解包通过；四页及抽包四阶段0诊断；6实图含390px，root未操作Explain；复制受控注入非OS/AT；旧14文件不变 |
| [Test context map](https://github.com/tt-a1i/archify/tree/codex/lab-test-context-map/experiments/test-context-map) | 精确 context 映射到选择源码行，保留空标签、未知、缺失、排除和不可用 | `9d6b4e3a` | [实跑矩阵](https://github.com/tt-a1i/archify/blob/codex/lab-test-context-map/experiments/test-context-map/measured/screenshots/matrix.png) | 原18 tests复用；新增固定工具实跑原创fixture和逐字段复核；finalize通过，自动browser未请求；sidecar仍是声明，不补造缺失标签 |
| [Test failure map](https://github.com/tt-a1i/archify/tree/codex/lab-test-failure-map/experiments/test-failure-map) | 分开 setup/call/teardown 与 collection，显示提供的行号和缺少的定义文件 | `bb5e7bdb` | [实跑阶段](https://github.com/tt-a1i/archify/blob/codex/lab-test-failure-map/experiments/test-failure-map/measured/screenshots/phases.png) | 11 tests；4旧例四阶段通过，新增2实跑页面finalize通过但自动browser未跑；故意失败exit1/2保留；reader文案收窄、投影不变 |
| [Delta values](https://github.com/tt-a1i/archify/tree/codex/lab-delta-values/experiments/delta-values) | 选中既有exact row读取receipt中的SQL→SQL tx、orders→fraud，未知字段不猜 | `a0a9ba77` | [新dev桌面与横滚实图](https://github.com/tt-a1i/archify/tree/codex/lab-delta-values/experiments/delta-values/refresh-dev-10b4) | 基线10b4；5browser/73相关/19core及4checks、235ZIP/精确CLI通过；public compare+check而非四阶段finalize，provenance unknown；6实图含390横滚300/504，非触屏；旧22文件不变 |
| [Source question tour](https://github.com/tt-a1i/archify/tree/codex/lab-source-question-tour/experiments/source-question-tour) | 同5段固定源码按文件/4个问题组织，解释源码版本与Escape条件 | `94d6a4d0` | [实际图片](https://github.com/tt-a1i/archify/blob/codex/lab-source-question-tour/experiments/source-question-tour/screenshots/question-first-overview.png) | 零共享代码；两页finalize通过，自动browser未跑；源码逐字/摘要一致，root实际hover/Tab/Escape与原生图跳转；无效率结论 |
| [Diagnostic locations](https://github.com/tt-a1i/archify/tree/codex/lab-diagnostic-locations/experiments/diagnostic-locations) | 同文诊断显示已有行号/节点/路径，JSON保持原字节 | `b6679399` | [新dev诊断与预览边界](https://github.com/tt-a1i/archify/tree/codex/lab-diagnostic-locations/experiments/diagnostic-locations/refresh-dev-10b4) | 基线10b4；29诊断/2preview/19core/generated及7Chrome、235ZIP/解包CLI通过；text/JSON两臂均exit1且JSON逐字相同；4实图，已挂载保rev1；late-open空iframe边界未修；旧18文件不变 |
| [Finder result descriptions](https://github.com/tt-a1i/archify/tree/codex/lab-finder-context/experiments/finder-context) | 8个同名结果使用既有ID/类型/耗时作为可访问描述 | `e219bc5b` | [新dev实际UI与AX](https://github.com/tt-a1i/archify/tree/codex/lab-finder-context/experiments/finder-context/refresh-dev-10b4) | 基线10b4；26browser/focus、19core、4generated及golden通过；31产物正常重生成、其余历史单列；235项ZIP与精确抽包四阶段；实际8AX及键盘选择、3图；非真人AT |
| [Delivery witness](https://github.com/tt-a1i/archify/tree/codex/lab-delivery-witness/experiments/delivery-witness) | 同msgId、同t的两次投递保留seq/dup与原始patch，不以时间去重 | `f2aa251e` | [实际证据页](https://github.com/tt-a1i/archify/blob/codex/lab-delivery-witness/experiments/delivery-witness/screenshots/witness.png) | 零共享代码；固定官方模拟fixture选段；2页四阶段通过，独立源/语义复核；小字与错误图例已修，旧图保留；非本次运行/用户收益 |
| [Waterfall status text](https://github.com/tt-a1i/archify/tree/codex/lab-waterfall-status/experiments/waterfall-status) | 已提供error/cancelled同时显示在行尾、节点说明和可访问名称 | `68311bb8` | [新dev实际前后图](https://github.com/tt-a1i/archify/tree/codex/lab-waterfall-status/experiments/waterfall-status/refresh-dev-10b4) | 基线10b4；34focused/core，XML初缺依赖后单独3pass；原生/精确ZIP四阶段；无状态两例相同；7真实图/DOM与AX分列；构造输入、非真人AT |
| [Retained size](https://github.com/tt-a1i/archify/tree/codex/lab-retained-size/experiments/retained-size) | Twiggy自身165B+直接支配子项4B=保留169B，避免跨层重复计数 | `a0c76fc8` | [实际解释页](https://github.com/tt-a1i/archify/blob/codex/lab-retained-size/experiments/retained-size/screenshots/explanation.png) | 零共享代码；固定上游golden；Tree四阶段、Explainer三阶段通过/自动browser未跑；单一模型绑定已修，旧图保留；非删减实测 |
| [Lasso witness](https://github.com/tt-a1i/archify/tree/codex/lab-lasso-witness/experiments/lasso-witness) | 三位置反例保留有限前缀和无限后缀的显式闭合入口 | `900fe5a3` | [实际原文与图对照](https://github.com/tt-a1i/archify/tree/codex/lab-lasso-witness/experiments/lasso-witness) | 零共享代码；固定上游选段；3页四阶段通过；实际回环遮挡已通过输入修复，旧图保留；未运行checker/未验证用户收益 |
| [Workflow self-loop](https://github.com/tt-a1i/archify/tree/codex/lab-workflow-self-loop/experiments/workflow-self-loop) | 同节点双端接触保留合法自环，仍拒绝中段碰撞及立即折返 | `9578b8e4` | [新dev实际自环与证据](https://github.com/tt-a1i/archify/tree/codex/lab-workflow-self-loop/experiments/workflow-self-loop/refresh-dev-10b4) | 基线10b4真实拒绝且无HTML；候选/精确ZIP四阶段0诊断、148focused、4generated通过；4shipped SVG/receipt相同；3实图；构造几何回归，不称运行trace或作者节时 |
| [Plan row counts](https://github.com/tt-a1i/archify/tree/codex/lab-plan-row-counts/experiments/plan-row-counts) | 每次平均3行×352循环≈1056次输出，保留局部估计差异 | `91e2ffad` | [实际解释页](https://github.com/tt-a1i/archify/blob/codex/lab-plan-row-counts/experiments/plan-row-counts/screenshots/explainer.png) | 零共享代码；固定PEV2样例3节点；Tree四阶段、Explainer三阶段通过/自动browser未跑；非SQL执行/unique rows/调优证明 |
| [Diff line numbers](https://github.com/tt-a1i/archify/tree/codex/lab-diff-line-numbers/experiments/diff-line-numbers) | diff行号保持完整单行，长代码仍可横向滚动 | `28f9f95d` | [新dev实际对照](https://github.com/tt-a1i/archify/blob/codex/lab-diff-line-numbers/experiments/diff-line-numbers/dev10b4/screenshots/candidate-1280-light.png) | 已整合10b4；单CSS、25focused/19core/generated、双ZIP/解包通过；8臂DOM 30拆行→0、4新图；两页3静态gate/同7writing warnings，完整browsergate未跑；4docs保留10b历史 |
| [Keyboard traversal](https://github.com/tt-a1i/archify/tree/codex/lab-keyboard-traversal/experiments/keyboard-traversal) | QA按真实DOM身份继续Tab，避免原生滚动区和动态来源卡导致提前停止误报 | `c96e8aa7` | [新dev实际Tab到页尾](https://github.com/tt-a1i/archify/blob/codex/lab-keyboard-traversal/experiments/keyboard-traversal/refresh-dev-10b4/screenshots/task-footer-tab.png) | 同页PR30→0/task16→0诊断；19browser/19core/4checks、235项ZIP及正负例；root实际47/63 Tab与checker48/64步分列；不改HTML、不代表原PR/Gradle执行或AT |
| [Preview dashed ink](https://github.com/tt-a1i/archify/tree/codex/lab-preview-dashed-ink/experiments/preview-dashed-ink) | Explainer预览的虚线关系文字、线和箭头使用可读颜色，保留节点边框 | `ca4baa1d` | [新dev浅色对照](https://github.com/tt-a1i/archify/blob/codex/lab-preview-dashed-ink/experiments/preview-dashed-ink/refresh-dev-10b4/screenshots/candidate-light.png) | 已整合10b4；3CSS映射、2browser/57focused/core、4generatedchecks、基线失败、候选和抽包四阶段通过；4新浅深图，旧20实验/4docs保留36cc历史，不称当前docs已重生成 |
| [Copy identity](https://github.com/tt-a1i/archify/tree/codex/lab-copy-identity/experiments/copy-identity) | 内容相等仍可能共享不同对象：别名、浅拷贝、深拷贝的引用对照 | `18d51b89` | [实际引用图](https://github.com/tt-a1i/archify/blob/codex/lab-copy-identity/experiments/copy-identity/screenshots/native.png) | 新dev3f95；标准库独立观察4变量/7list/10引用、6内容检查、两产物四阶段通过；3张实际图；上游教学构造，未运行上游工具/未观察整个heap |
| [CLI reading tour](https://github.com/tt-a1i/archify/tree/codex/lab-cli-reading-tour/experiments/cli-reading-tour) | 沿真实源码区分三个CLI出口、磁盘JSON、HTTP快照与用户启动 | `1dff88d3` | [实际阅读页](https://github.com/tt-a1i/archify/blob/codex/lab-cli-reading-tour/experiments/cli-reading-tour/screenshots/overview.png) | 新dev3f95；7固定源、11SourceCards、10节点9边；三静态阶段通过/自动browser未请求；实际Walk、hover/Escape及3图；未运行上游服务或scanner |
| [Clipboard outcome](https://github.com/tt-a1i/archify/tree/codex/lab-clipboard-outcome/experiments/clipboard-outcome) | 复制API缺失/拒绝不误报成功，完整追问保留可手工复制，编辑全文后重试不再包装 | `0e4a2c71` | [新dev实际失败恢复](https://github.com/tt-a1i/archify/blob/codex/lab-clipboard-outcome/experiments/clipboard-outcome/refresh-dev-10b4/screenshots/candidate-missing-ask.png) | 基线10b4；8叶场景、32邻近/19core/generated/235ZIP+解包smoke；4docs正常刷新；3实图与受控API缺失/拒绝/恢复exact；静态3gate同7warnings/browser未跑，非OSclipboard/AT |
| [Byte views](https://github.com/tt-a1i/archify/tree/codex/lab-byte-views/experiments/byte-views) | 分清IHDR的25B物理字段与已有type内的4个bit解释，避免重复求和 | `b844ecb2` | [实际解释页](https://github.com/tt-a1i/archify/blob/codex/lab-byte-views/experiments/byte-views/screenshots/explainer-overview.png) | 固定67f；完整97B官方fixture/golden、独立字节观察8事实检查；Tree四阶段/Explainer三静态阶段通过，root四图及citation hover/Escape；未运行fq/CRC/解压 |
| [Source keyboard activation](https://github.com/tt-a1i/archify/tree/codex/lab-source-keyboard/experiments/source-keyboard) | 同一源码预览节点的Enter/Space执行已有鼠标开原图动作，AX提供button语义 | `d81830d3` | [实际Enter打开结果](https://github.com/tt-a1i/archify/blob/codex/lab-source-keyboard/experiments/source-keyboard/screenshots/candidate-enter-viewer.png) | 基线10b4；6browser/15renderer/19core、生成/235项ZIP通过；真实前后AX/按键/返回与5图；Tab及focus原本已有，误判已撤回；4docs继承freshness单列，无AT接受 |
| [Notebook occurrences](https://github.com/tt-a1i/archify/tree/codex/lab-notebook-occurrences/experiments/notebook-occurrences) | 六个重复文本cell按位置保留，分清源码改变与保存输出改变 | `2090b0ff` | [实际六行对照页](https://github.com/tt-a1i/archify/blob/codex/lab-notebook-occurrences/experiments/notebook-occurrences/screenshots/explainer-overview.png) | 内容限定固定nbdime三完整fixture；11事实审计，Tree四阶段/Explainer三阶段且browser未跑；4真实图/DOM字段核实；无kernel/nbdime执行、稳定ID或因果推断 |
| [Config origins](https://github.com/tt-a1i/archify/tree/codex/lab-config-origins/experiments/config-origins) | 区分provider声明、幸存字段与错误归属，解释join的max=20为何未修复整体约束 | `14867942` | [实际来源对照](https://github.com/tt-a1i/archify/blob/codex/lab-config-origins/experiments/config-origins/screenshots/overview.png) | 内容限定固定Figment完整测试；7原件/6源码摘录核对、3静态gate通过/browser未请求；3实图和hover/Escape；未执行Rust/provider或声称配置文件行号 |
| [Benchmark reading](https://github.com/tt-a1i/archify/tree/codex/lab-benchmark-reading/experiments/benchmark-reading) | 四组median与CI/p/n/~并排，区分中心值变化与上游比较结论 | `7b8258cd` | [实际柱图与邻表](https://github.com/tt-a1i/archify/blob/codex/lab-benchmark-reading/experiments/benchmark-reading/screenshots/overview.png) | 固定benchstat完整old/new/CSV与40值；10事实审计、3静态gate通过/browser未跑、3实图；不重算统计、不称本轮benchmark或版本普遍收益 |
| [Task occurrences](https://github.com/tt-a1i/archify/tree/codex/lab-task-occurrences/experiments/task-occurrences) | 11打印位置对应10身份，两个compileJava位置定位同一双父节点 | `caffb4aa` | [实际位置与身份页](https://github.com/tt-a1i/archify/blob/codex/lab-task-occurrences/experiments/task-occurrences/screenshots/overview.png) | 固定Gradle完整8文件fixture/14原件/5源码；原生四阶段、解释页三阶段通过但16键盘诊断；5实图/两次pointer定位；未执行Gradle，打印数不当执行数 |
| [Edge-scoped extras](https://github.com/tt-a1i/archify/tree/codex/lab-edge-extras/experiments/edge-extras) | 同一urllib3沿不同入边extras与显示模式可有不同可见后继 | `1db953a7` | [中文解释页](https://github.com/tt-a1i/archify/blob/1db953a726b79f135187ee3cd2e12723717c7555/experiments/edge-extras/output/explanation.html) / [原PNG](https://github.com/tt-a1i/archify/blob/1db953a726b79f135187ee3cd2e12723717c7555/experiments/edge-extras/screenshots/explainer-desktop-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/1db953a726b79f135187ee3cd2e12723717c7555/experiments/edge-extras/README.md) | 基线10b4；固定pipdeptree45c43受控fixture，未执行上游；native四阶段0诊断，Explainer前三阶段通过/28条keyboard失败；6root实图不抵消失败，非安装报告或收益验证 |
| [Line notes](https://github.com/tt-a1i/archify/tree/codex/lab-line-notes/experiments/line-notes) | 固定源码行→作者解释→同片段原行往返；相同源码两处不串跳 | `079d5629` | [页面](https://github.com/tt-a1i/archify/blob/079d562915a701f8c76b6479e59622432f81ee79/experiments/line-notes/candidate.html) / [原PNG](https://github.com/tt-a1i/archify/blob/079d562915a701f8c76b6479e59622432f81ee79/experiments/line-notes/screenshots/candidate-desktop-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/079d562915a701f8c76b6479e59622432f81ee79/experiments/line-notes/README.md) | 基线10b4，仅experiments后处理原型；源1965B逐字不变；baseline三阶段通过/4footer键盘失败；候选独立审计、5负例、作者四视口与root5图；非normal finalize或strict provenance，非OS clipboard/AT |
| [Static uses](https://github.com/tt-a1i/archify/tree/codex/lab-static-uses/experiments/static-uses) | 7节点8use边解释Beniget模块定义根的局部静态投影，不是执行分支 | `7be0711d` | [页面](https://github.com/tt-a1i/archify/blob/7be0711da68d8db0dafaefef0b64894665f8609f/experiments/static-uses/explainer.html) / [原PNG](https://github.com/tt-a1i/archify/blob/7be0711da68d8db0dafaefef0b64894665f8609f/experiments/static-uses/screenshots/overview-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/7be0711da68d8db0dafaefef0b64894665f8609f/experiments/static-uses/README.md) | 基线10b4；固定官方fixture，未执行上游；native四阶段0诊断/页面三阶段通过且browser未请求，14事实审计/root4图；URL来源元数据非verified snippet，非完整AST/运行trace |
| [Hintful stages](https://github.com/tt-a1i/archify/tree/codex/lab-hintful-stages/experiments/hintful-stages) | 区分A→命名中间态S→B两段声明，删3在第二段 | `8d698cee` | [中文解释页](https://github.com/tt-a1i/archify/blob/8d698ceec15a2ea24012135632c4612e5a58e7b5/experiments/hintful-stages/explainer.html) / [原PNG](https://github.com/tt-a1i/archify/blob/8d698ceec15a2ea24012135632c4612e5a58e7b5/experiments/hintful-stages/screenshots/desktop-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/8d698ceec15a2ea24012135632c4612e5a58e7b5/experiments/hintful-stages/README.md) | 基线10b4，仅25实验文件；固定diff-format826f50完整10Git文件及许可；normal CLI三阶段0诊断/browser未请求，HTML377646B、9审计/root5图；含2来源hover和mobile横向wheel100，非触屏/完整键盘/外链/上游执行 |
| [Spatial focus](https://github.com/tt-a1i/archify/tree/codex/lab-spatial-focus/experiments/spatial-focus) | 屏内完整可见语义node用plain Arrow移动DOM焦点，保留选择/hash/camera，Tree及Route排除 | `08af0911` | [页面](https://github.com/tt-a1i/archify/blob/08af09117396b4d2b62774215bc48d8bd516386f/experiments/spatial-focus/architecture-candidate.html) / [原PNG](https://github.com/tt-a1i/archify/blob/08af09117396b4d2b62774215bc48d8bd516386f/experiments/spatial-focus/screenshots/architecture-candidate-settled-right-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/08af09117396b4d2b62774215bc48d8bd516386f/experiments/spatial-focus/README.md) | 基线10b4；当前Route+spatial16pass、exact包7pass/smoke/CLI四阶段，generated/235双ZIP通过；6root实图；先前Route抢键及Infinity词法失败保留，邻近/core复用scope单列，非overlay遮挡/效率保证 |
| [Maybe initialized](https://github.com/tt-a1i/archify/tree/codex/lab-maybe-initialized/experiments/maybe-initialized) | RustOwl官方expected与概念I/U/union状态表分开，绿色波浪不表示一次执行状态 | `61d43f93` | [页面](https://github.com/tt-a1i/archify/blob/61d43f93ee9d11d30d2a239f80e1b2976539d850/experiments/maybe-initialized/output/explanation.html) / [原PNG](https://github.com/tt-a1i/archify/blob/61d43f93ee9d11d30d2a239f80e1b2976539d850/experiments/maybe-initialized/screenshots/desktop-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/61d43f93ee9d11d30d2a239f80e1b2976539d850/experiments/maybe-initialized/README.md) | 基线10b4，29实验文件/28public绑定，完整MPL-2.0源码/原snapshot与derived材料边界保留；normal finalize前三阶段pass/browser48keyboard失败；root4终版图，未编译/未执行上游，不抵消失败 |
| [Load filter](https://github.com/tt-a1i/archify/tree/codex/lab-load-filter/experiments/load-filter) | enabled最终名单不证明先前未load/invoke，官方True expected与默认False源码推断分列 | `d2ff5f8c` | [中文页面](https://github.com/tt-a1i/archify/blob/d2ff5f8c2cce954d5e20b6dd8970f027f52d46c0/experiments/load-filter/explainer.html) / [原PNG](https://github.com/tt-a1i/archify/blob/d2ff5f8c2cce954d5e20b6dd8970f027f52d46c0/experiments/load-filter/screenshots/desktop-light.png) / [固定README](https://github.com/tt-a1i/archify/blob/d2ff5f8c2cce954d5e20b6dd8970f027f52d46c0/experiments/load-filter/README.md) | 基线10b4；20staged/19public绑定、独立READY；normal finalize三阶段0诊断/browser未请求；4root图，手机两表局部横溢及pre长行保留，未运行Python/插件/metadata discovery，来源URL非verified excerpt |
| [Witness groups](https://github.com/tt-a1i/archify/tree/codex/lab-witness-groups/experiments/witness-groups) | 同一输出的平面来源清单与共同/替代见证组合并排，组数不是执行数 | `861ec022` | [固定README](https://github.com/tt-a1i/archify/blob/861ec02283bcd32c8315aa7b5f8b5ef9678dda27/experiments/witness-groups/README.md) / [中文页面](https://github.com/tt-a1i/archify/blob/861ec02283bcd32c8315aa7b5f8b5ef9678dda27/experiments/witness-groups/explainer.html) / [原PNG](https://github.com/tt-a1i/archify/blob/861ec02283bcd32c8315aa7b5f8b5ef9678dda27/experiments/witness-groups/screenshots/desktop-light.png) | 基线10b4；32文件/31public/28raw，16MIT完整原件与9verified来源；normal三阶段0诊断/browser未请求，6事实/root4图；无DB/SQL/上游执行，非概率或现实因果 |
| [Patch outcome](https://github.com/tt-a1i/archify/tree/codex/lab-patch-outcome/experiments/patch-outcome) | 官方两个true不证明结果等于最初目标B，A/B/I/E完整literal分列 | `b5f7d7b1` | [固定README](https://github.com/tt-a1i/archify/blob/b5f7d7b11482fb272fb88fbfdcb9e864407eabdf/experiments/patch-outcome/README.md) / [中文页面](https://github.com/tt-a1i/archify/blob/b5f7d7b11482fb272fb88fbfdcb9e864407eabdf/experiments/patch-outcome/explainer.html) / [原PNG](https://github.com/tt-a1i/archify/blob/b5f7d7b11482fb272fb88fbfdcb9e864407eabdf/experiments/patch-outcome/screenshots/desktop-light.png) | 基线10b4；19文件/18binding，完整Apache-2.0来源与固定literal位置；normal三阶段+1writing warning/browser未请求，10事实/root4图；无上游patch运行，不是任意补丁parser或等价证明 |
| [Segment origins](https://github.com/tt-a1i/archify/tree/codex/lab-segment-origins/experiments/segment-origins) | 同一source-map查询因GLB/LUB选择不同段原点，不补逐字符偏移 | `6d2b0312` | [固定README](https://github.com/tt-a1i/archify/blob/6d2b0312ebf011e3aa51835f52f9427125f0f2a3/experiments/segment-origins/README.md) / [中文页面](https://github.com/tt-a1i/archify/blob/6d2b0312ebf011e3aa51835f52f9427125f0f2a3/experiments/segment-origins/explainer.html) / [原PNG](https://github.com/tt-a1i/archify/blob/6d2b0312ebf011e3aa51835f52f9427125f0f2a3/experiments/segment-origins/screenshots/desktop-light.png) | 基线10b4；19文件/18ledger、独立READY；normal三阶段0诊断/browser未请求、7事实/root4图；仅来源元数据，未mapper运行；手机首表432/332横滚0→100后右name可读左query裁掉，完整source JSON未横滚 |
| [Relation search](https://github.com/tt-a1i/archify/tree/codex/lab-relation-search/experiments/relation-search) | 按关系标签或ID查找，显示两端并精确pin已有关系 | `e87a858d` | [固定README](https://github.com/tt-a1i/archify/blob/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/screenshots/candidate-enqueue.png) | 基线e837；独立READY，root5图/8原观察；enqueue从0节点到1关系、RAG三词精确ID、Route仍node-only；Finder9/FocusRoute22/locale37/core19，Semantic5pass1skip、generated/ZIP macOS通过；无手机/AT/全平台/效率证明，head Actions/checks均0；RAG生成15空白warning保留 |
| [Route alternative](https://github.com/tt-a1i/archify/tree/codex/lab-route-alternative/experiments/route-alternative) | 在既有有向图中切换另一条等跳数路径，保留默认路线与精确关系身份 | `d61217d8` | [固定README](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/screenshots/candidate-alternative-blueprint.png) | 固定e837基线；Route10/10与focused388/388、generated/ZIP macOS通过，自动browser-check通过；root五图/四观察含切换、键盘、reload、CSS窄屏；独立READY；不证明流量/failover/最佳路线，无触摸/AT/效率验收 |
| [Diff matching blocks](https://github.com/tt-a1i/archify/tree/codex/lab-diff-matches/experiments/diff-matches) | 在同一diff的删除与新增片段之间双向跳转，保留完整补丁和原行号 | `a8456ef7` | [固定README](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/evidence/20261026/candidate-matched-helper-light.png) | 固定e837基线；63focused、9browser及最终同例扩展1pass，base缺链接预期失败；真实9666B历史patch114行双向跳转；四图/五观察，generated/ZIP macOS通过，独立READY；保留基线拆号和窄屏约10px溢出，不证明语义移动或效率 |
| [Diff file navigation](https://github.com/tt-a1i/archify/tree/codex/lab-diff-file-navigation/experiments/diff-file-navigation) | 完整多文件diff增加局部目录，可直达每个文件段并返回原目录项 | `48f076f9` | [固定README](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/browser-evidence/current/final-history-file-list-light.png) | 固定6ca6基线；27focused、39parser/CLI/package、1Chrome扩展及generated/ZIP通过；完整8309B历史patch153行原文不变，root当前5图/3观察及修前原件保留；两类fixture四页仅render/inspect/Ego，未finalize或CLI browser-check；独立READY，保留旧窄屏溢出及拆号，无效率/AT/组合验收 |
| [Shared reach](https://github.com/tt-a1i/archify/tree/codex/lab-shared-reach/experiments/shared-reach) | 对完整原生Architecture求两个节点的共同上下游，列出单侧结果及每项两条精确路径 | `b160b948` | [固定README](https://github.com/tt-a1i/archify/blob/b160b948541f541394457fec3005e2d10b281dea/experiments/shared-reach/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/b160b948541f541394457fec3005e2d10b281dea/experiments/shared-reach/browser-evidence/downstream-overview-light.png) | 固定6ca6基线；离线CLI，保留完整12节点12边及原输入hash；Node22 focused7/7、独立6144查询共同集合/见证核对；三页finalize三阶段通过，自动browser未请求；root13原PNG含桌面双路/上游/空集/键盘，390px溢出与iframe横向阅读限制保留；非因果/运行依赖/效率证据 |
| [Mandatory paths](https://github.com/tt-a1i/archify/tree/codex/lab-mandatory-paths/experiments/mandatory-paths) | 给定两个端点求有向路径必经内部点，并给非必经点可点绕行见证；保留完整原图 | `f79704cb` | [固定README](https://github.com/tt-a1i/archify/blob/f79704cb63f1577246752c93f8d648a000ea978b/experiments/mandatory-paths/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/f79704cb63f1577246752c93f8d648a000ea978b/experiments/mandatory-paths/browser-evidence/reachable-overview-light-final.png) | 固定6ca6基线；离线CLI，完整12节点12边输入原字节不变；Node22 focused9/9，独立49154查询/61448绕行见证；validate/deliver/check通过，CLI browser-check未运行；root浅深色/双路/键盘/Escape原图已存；390px client375/scroll400溢出保留，非故障/因果/运行依赖/效率证据 |
| [Refactoring records](https://github.com/tt-a1i/archify/tree/codex/lab-refactoring-records/experiments/refactoring-records) | 将完整重构报告的4记录8位置投影为4个before/2个after与4条声明边，保留多源同目标和版本未知 | `bec86714` | [固定README](https://github.com/tt-a1i/archify/blob/bec8671465ff9ce6a2c471196907fc741f52dc53/experiments/refactoring-records/README.md) / [原PNG](https://github.com/tt-a1i/archify/blob/bec8671465ff9ce6a2c471196907fc741f52dc53/experiments/refactoring-records/browser-evidence/overview-light-final.png) | 固定6ca6基线；离线导入完整3180B历史@Disabled expected，未运行detector；6focused逻辑同源复用，最终两页三阶段通过/独立复核，CLI browser-check未运行；root9原图与R0键盘/R1共享目标、未知base核对；URL-only非verified excerpt，390px局部record317/321、不能fit-readable保留，无语义等价/效率证据 |

上述前33项均经过另一位 Codex agent 的独立代码/证据复核，协调 agent 实际查看图片。测试数对应各实验自己的 focused tests，不是全仓测试；远端 CI、跨平台验证、实际用户效果与人类验收没有因此自动成立。生成 HTML/Markdown 保留原渲染器或适配器字节；源码 whitespace 检查与生成产物的既有空白分开记录。Payload test 和 State source 各清理了一处无语义影响空白，摘要同时保留实际测试 hash 与当前 hash。

GitHub CI 单独核实：截至 2026-10-25 13:01（台北），前 11 个精确远端 head 的 Actions runs/check-runs 均为 0。当前 [CI 配置](https://github.com/tt-a1i/archify/blob/82c7e0f089a02a4d514714adf37dc2061682da5f/.github/workflows/ci.yml) 只对 main/dev push 自动运行，另外支持 PR/manual。这里的实验分支 push 没有提供远端 CI 通过证据；上表测试均按实际本地来源记录。

2026-10-25 13:17（台北）再次核实，main/dev 仍为 `25cf3708` / `82c7e0f0`；新增 CI conditions、Plan actions、Recipe stages、Relation reference 与未推荐 Relation return 的精确 head 也均为 Actions runs=0、check-runs=0。本地证据与远端 CI 始终分开。

2026-10-25 13:37（台北），main/dev未变；Test context map旧head `c02a74fd`、Test failure map旧head `82af4896`、Delta values `4c35456b`、Source question tour `94d6a4d0`、Diagnostic locations `67328d7d`的精确head也均为Actions runs=0、check-runs=0。之后两个测试分支分别补实跑证据到`9d6b4e3a` / `bb5e7bdb`，远端head已核对；新提交未单独查询CI，不沿用旧head作为新CI结论。

2026-10-25 13:56（台北）增量核对：main/dev仍未变；Finder result descriptions `5b7701c1` 与 Delivery witness `f2aa251e` 两个精确远端head同样都是Actions runs=0、check-runs=0。

2026-10-25 14:09:48（台北），main/dev仍未变；Waterfall status text `e20acd6d`、Retained size `a0c76fc8` 及两个补充实跑证据后的head Test context map `9d6b4e3a`、Test failure map `bb5e7bdb` 均核对远端一致，精确head的Actions runs=0、check-runs=0。

2026-10-25 14:26:57（台北），main/dev仍未变；Lasso witness `900fe5a3`、Task review map补充PR证据后 `dcedd538`、Workflow self-loop `eb299b15`、Plan row counts `91e2ffad` 远端head均匹配，精确head的Actions runs=0、check-runs=0。这里不把未运行CI写成通过。

## 图片速览

以下四张直接来自对应分支的实际产物。点击名称查看完整说明；其余实验的图片见上表。

| [Finder：搜索对应画布节点](https://github.com/tt-a1i/archify/tree/codex/lab-finder-highlights/experiments/finder-highlights) | [DBML：原四表 synthetic 键与关系](https://github.com/tt-a1i/archify/tree/codex/lab-dbml-erd/experiments/dbml-erd) |
| --- | --- |
| <img width="540" alt="Finder：搜索对应画布节点 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/94c165ee6e5213c67e37a75a0b04496564980801/experiments/finder-highlights/screenshots/candidate-api-light.png"> | <img width="540" alt="DBML：原四表 synthetic 键与关系 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/feab6ae685692630d6d837622dc7bdcb57a09679/experiments/dbml-erd/screenshots/order-payments.png"> |

| [State：官方fixture实导出](https://github.com/tt-a1i/archify/tree/codex/lab-state-contract/experiments/state-contract) | [Decision：保留异议](https://github.com/tt-a1i/archify/tree/codex/lab-decision-thread/experiments/decision-thread) |
| --- | --- |
| <img width="540" alt="State：官方fixture实导出 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/f7269e096ac1891b434842cf7e16b9ffdd54cdf6/experiments/state-contract/measured/screenshots/explainer-overview.png"> | <img width="540" alt="Decision：保留异议 actual screenshot" src="https://raw.githubusercontent.com/tt-a1i/archify/bdbdf9a9b5b97c556c5f85547279021b7446a05c/experiments/decision-thread/screenshots/sequence.png"> |

## 保留证据但暂不推荐的原型

[Relation return 分支](https://github.com/tt-a1i/archify/tree/codex/lab-relation-return/experiments/relation-return)（`e323d30f`）保留实际前后 HTML、[截图](https://github.com/tt-a1i/archify/blob/codex/lab-relation-return/experiments/relation-return/screenshots/candidate-destination-light.png)、可应用的候选 patch 与验证摘要。该分支只新增实验文件，**没有共享 Viewer 产品改动**。

在原有 production-deployment 图中，目标 Passport 的 Incoming 行本来就能一步回到来源；新增 Back 按钮同样是一步。既有代表性 Architecture 样例的检查也未找到来源行因长列表而被遮挡的实证。56/56 focused 与独立 18/18 Focus 说明兼容性边界，不能说明更好用，因此暂不引入额外状态和按钮；不为证明收益而另造极端场景。

[390px图内导航实测](evidence/mobile-nav/README.md)：横滚后全部缩放控件可命中，实际100%→125%，因此不把初始裁剪误作不可用，也不新增布局分支。物理触屏和可发现性尚未验证。

2026-10-25 14:56（台北）核对DBML新head `d0472cc3`、Plan actions新head `729d3a03`；15:03核对Diff line numbers `88b0dcb0`：远端head均吻合，Actions runs/check-runs均为0。本地验证不替代远端CI。

2026-10-25 15:26（台北）核对Keyboard traversal `d9308631`：远端head吻合，Actions runs/check-runs均为0；本地浏览器观察与远端CI分别记录。

2026-10-25 15:41（台北）核对Preview dashed ink `36cc35fb`：远端head吻合，Actions runs/check-runs均为0。此次同时发现main/dev已更新，旧基线证据保留原身份。

2026-10-25 16:08核对DBML新head `358c77e0`；16:18核对Copy identity `18d51b89` 与CLI reading tour `1dff88d3`，远端head均一致，Actions runs/check-runs均为0。Migration plan的 `b9fe3b9b` 只澄清render/finalize所属产物，旧测试/图片不变。

2026-10-25 16:30:20（台北）核对Clipboard outcome `68866954`：远端head一致，Actions runs/check-runs均为0；受控浏览器API实测与OS clipboard验收分开。

2026-10-25 16:35的[GitHub状态与查重](github-status-1635.md)确认main/dev未再变；dev精确head CI成功，main测试完成但部署仍等待。新draft #1103与#1102的已有工作已列入下一轮查重，不把它们当成dev已合入能力。

2026-10-25 16:50–16:53再次核main/dev未变；PR #1102 head `98efbfcb`已转非draft但仍OPEN未合入，精确head Actions CI成功、CodeRabbit尚pending。相对先前`3b5b16c0`只改n8n图JSON/HTML，不与当前State/Recipe补证源码交叉。

2026-10-25 17:02:57核State contract新head `f7269e09`：已纳固定dev67f，远端head一致，Actions runs/check-runs均为0；本地真实导出与两产物四阶段通过分开记账。

2026-10-25 17:17:13核Recipe stages新head `062dee5d`：已纳固定dev67f，远端head一致，Actions runs/check-runs均为0。17:15重新核GitHub main/dev仍为51a29177/67f12389。

2026-10-25 17:30:01核Byte views新head `b844ecb2`：远端head一致，Actions runs/check-runs均为0。该产物和截图仍绑定67f；17:29核GitHub dev已推进到 `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`（#1102合入），main仍51a29177，后续新实验从新dev开始；[范围核对](base-refresh-1731.md)记录Viewer/Explainer/finalize影响与精确dev CI。已有分支产物不因此自动获得新dev验证。

2026-10-25 18:07:06核Source keyboard activation `d81830d3`：远端head一致，Actions runs/check-runs均为0，本地验证与远端CI分列。17:59:53重新查GitHub，dev仍10b4、main仍51a29177，latest Release仍v3.2.0（2026-10-19发布）。

2026-10-25 18:14:23核Diff line numbers新head `28f9f95d` 与Preview dashed ink新head `ca4baa1d`：都包含固定dev10b4祖先，远端head一致，Actions runs/check-runs均为0。本文本不把未运行CI写成通过。

2026-10-25 18:37核Waterfall status新head `68311bb8`：远端一致，包含固定dev10b4，精确head的Actions runs/check-runs均为0。本地原生/精确ZIP四阶段与真实图片不代替远端CI。

2026-10-25 18:42核Notebook occurrences `2090b0ff`：远端一致，精确head的Actions runs/check-runs均为0。新内容基于固定dev10b4，仅新增实验目录；当前图片总览仍是35项固定快照，第36项可从上表直达。

2026-10-25 本次增量核对Finder `e219bc5b`、Config origins `14867942`：远端head均一致，精确head的Actions runs/check-runs均为0；dev仍10b4、main仍51a29177。Config为第37个实验，图片浏览页仍固定35项，新项可从表格直达。

2026-10-25 本次核Workflow新head `9578b8e4`、Benchmark reading `7b8258cd`、Task occurrences `caffb4aa`：远端head一致，精确head的Actions runs/check-runs均为0。Task首次push遇GitHub远端写pack失败，原提交不变，重新查询后重试成功。已发布总数39；固定图片页仍35项，准备下一批更新。

2026-10-25 本次核Keyboard新head `c96e8aa7`、Clipboard新head `0e4a2c71`：远端一致、精确head的Actions runs/check-runs均为0。Clipboard的正常merge提交73fe26dc后，以0e4a2c71补入四份已经核验的生成页；此处绑定最终完整head，未把中间提交称最终交付。总数仍39项。

2026-10-25 本次核Finder canvas `ed04916f33cca4cc6475eada7b4397694426f3f8`、Relation reference `d5691a02f2dd77acd38b827e254249981bc142ee`、Diagnostic locations `b6679399ae688e9a6907e2eca4f222aaa964a975`：固定head的Actions runs/check-runs均为0，不表示候选CI通过，不借用parent dev的成功结果。Delta最终head `a0a9ba77cb59e3e3a97be0713ca626df63a3234d` 已推，精确head亦为Actions runs=0、check-runs=0。该次刷新完成时已发布39项；图片gallery继续固定hub `fc7017426177ad44e213242a2b1756ffba43b9e3`，未跟随这些新head重建。

2026-10-25 Edge-scoped extras作为第40个独立远程实验分支推送，固定head `1db953a726b79f135187ee3cd2e12723717c7555`，基线10b4；协调者刚核精确head为Actions runs=0、check-runs=0，没有远端CI通过证据。6张root实图、上游受控fixture、native成功与Explainer的28条键盘失败分别记账；未执行pipdeptree或安装环境。

2026-10-25 Line notes `079d562915a701f8c76b6479e59622432f81ee79` 与Static uses `7be0711da68d8db0dafaefef0b64894665f8609f` 已推送，协调者刚核精确head的Actions runs/check-runs均为0；不把无CI记录称通过。当前42个独立远程分支，gallery仍为固定fc701742的39项快照，未重建或纳入新增三项/四个后续refresh的新图。

2026-10-25 Hintful stages固定head `8d698ceec15a2ea24012135632c4612e5a58e7b5` 已推并保持clean，独立reviewer最终READY；协调者核25 staged文件原字节及diff-check通过，精确远端head为Actions runs=0、check-runs=0。当前43个独立远程分支，gallery仍是39项固定快照，不称43项gallery。

2026-10-25 Spatial focus `08af09117396b4d2b62774215bc48d8bd516386f` 与Maybe initialized `61d43f93ee9d11d30d2a239f80e1b2976539d850` 已推、远程精确一致且clean，独立终审READY；协调者核精确head的Actions runs/check-runs均为0，非CI通过。当前45项；Load filter仍待终审及推送，不提前称第46项已发布。gallery继续固定39项来源快照。

2026-10-25 Load filter `d2ff5f8c2cce954d5e20b6dd8970f027f52d46c0` 已推、远端精确一致且clean，独立终审READY；协调者于UTC13:44:26核精确head的Actions runs/check-runs均为0，不称CI绿。当前46个独立远程实验，图片gallery仍为固定fc701742的39项快照，7个新增与4个后续refresh未纳入，待单独冻结再重建。

2026-10-25 Witness groups `861ec02283bcd32c8315aa7b5f8b5ef9678dda27`、Patch outcome `b5f7d7b11482fb272fb88fbfdcb9e864407eabdf` 已推、远端exact且clean，独立READY；UTC14:05:19精确head均Actions runs=0、check-runs=0，不称CI通过。main51a29177/dev10b4未变。当前48项，gallery仍是46项固定快照。

2026-10-25 Segment origins固定head `6d2b0312ebf011e3aa51835f52f9427125f0f2a3` 已推、远端精确一致且clean，独立终审READY；当前49个已实现并已推实验。协调者于UTC14:14:08核精确head的Actions runs=0、check-runs=0，不称CI通过。图片总览已补齐至49项并完成本批范围的截图核验；收尾后暂停。

## 2026-10-25 本批收尾与暂停（历史）

以下保留2026-10-25收尾记录；2026-10-26曾恢复，最新要求为收尾本批后暂停，见上文。

按用户要求，本批已收尾并暂停。49个实验分支、49项图片总览、已启动的Round27报告及22:07 GitHub快照均已收齐；22:24:55一次只读远端核对确认49个分支与总览固定提交一致。**停止新研究与新实施**；Round26/27保留的内容方向均为研究待定、不启动，等待用户明确继续。

## 本批交付与保留事项

| 方向 | 来源与目标 | 状态 |
| --- | --- | --- |
| 新内容实验 | fq字节区间与位解释视图 | byte-views已推b844ecb2，计入第34项；完整97B官方fixture/golden与四张真实截图，冻结67f基线 |
| 新产品实验 | source-only图节点的键盘激活 | d81830d3已推，计入第35项；真实基线可Tab但Enter/Space不激活，候选补等价动作与button角色；5图及独立审查完成 |
| 已有候选刷新 | Diff行号 / Preview虚线文字 | 两条既有分支均已整合固定dev10b4并完成独立终审：28f9f95d/ca4baa1d已推，新旧证据身份分列 |
| 已有候选刷新 | Waterfall状态 / Finder结果描述 | Waterfall已推68311bb8；Finder已推e219bc5b，独立审查与新基线实图/AX完成；Workflow自环已推9578b8e4，旧证据原字节保留 |
| 新一轮发现 | Shell / CSS / Notebook / 构建阅读 | 第9轮13个新来源，未增加实现；第10轮12个新来源，Notebook已推2090b0ff，task occurrence已推caffb4aa并补5实图，保留最终16键盘诊断；源码卡审计无确认新缺陷；第11轮配置来源已推14867942 |
| 新一轮发现 | Benchmark / 语法 / 并发阅读 | 第12轮6新来源，benchstat已推7b8258cd；第13轮语法/并发共4新来源，暂不增实现；第14轮6个新图交互项目，未确认新实施缺口 |
| 新一轮发现 | 第15轮行为/构建、第16轮条件代码/解析身份 | 研究阶段均0项启动；preview重新打开边界亦不新开修复。后续单独选定edge-extras有界固定fixture内容，现已推1db953a7计入第40项；研究原结论不改，不新增parser或声称生产事故 |
| 新一轮发现 | 第18轮局部阅读 / 第19轮控制与数据阅读 | 第18轮局部阅读、结构差异、小图交互三报告及第19轮控制/数据报告已完成；line-notes与static-uses已作为第41/42项推送，均base10b4且仅experiments；后处理原型与静态内容投影各自验证范围见上表，不改产品/ZIP |
| 已发布产品原型 | spatial-focus屏内空间方向浏览 | 已推08af0911计入第44项，独立终审READY；plain Arrow仅移动DOM焦点，Tree/Route排除；当前与复用机器范围、6root图及保留失败见上表，不声明AT/效率收益 |
| 已发布内容 | Hintful stages | 已推8d698cee计入第43项，独立reviewer最终READY；named intermediate是patch声明中间态，非第三Git commit/运行，invalid另列；CLI/审计/实图各自范围见表 |
| 只读研究 | Round20 / Round21 | Round20报告已完成并修正L152–163及priority/clip边界；Round21完成5个新来源，最多保留Stevedore内容候选，不称已实施或验证 |
| 已发布内容 | maybe-initialized | 已推61d43f93计入第45项，独立终审READY；RustOwl上游expected/derived快照与概念union分开，MPL边界保留；前三阶段pass仍有48条键盘失败，不称完整browser通过 |
| 已发布内容 | load-filter | 已推d2ff5f8c计入第46项，独立最终READY；最终HTML3334dc29…94d2、4root图、2表局部横溢及源码长行边界保留，normal三阶段并非完整browser gate |
| 已发布内容 | Witness groups / Patch outcome | 已推861ec022/b5f7d7b1，计入第47/48项；独立READY，正常三阶段与未请求browser范围/原件/实图分别记账 |
| 已发布内容 | Segment origins | 已推6d2b0312计入第49项，独立终审READY；仅固定fixture原点策略内容，无mapper执行，手机局部横滚/来源元数据边界见表 |
| 研究收尾 | Round24 / Round25 / Round26 / Round27 | Round24/25已READY；Round26完成，仅保留原创URL-only候选未实施，GPL原件私有；Round27报告已冻结，保留方向仅研究待定、不启动。无新实施 |
| 适配器影响盘点 | 15个离线方向对dev10b4 | 静态未见确定格式破坏；五个build helper在更换基线后须更新运行身份记录，旧输入与转换证据继续绑定原版本，不批量刷新 |
| 已有候选刷新 | Keyboard traversal / Clipboard outcome | 已推c96e8aa7/0e4a2c71；同一task页candidate实际41/41可达，原dev37/41；Clipboard受控API前后及全文恢复已核，CI与真实OS剪贴板另列 |
| 已有候选刷新 | Relation reference / Finder canvas matches / Diagnostic locations | 已推d5691a02/ed04916f/b6679399；固定dev10b4新Passport、IME/drilldown及来源规则保留，独立复核/实图完成；各自旧证据原字节不变；Delta也已推a0a9ba77，compare/check与非finalize边界另列 |
| 既有实验真实输出 | Recipe stages / State contract | State官方fixture实导出已推f7269e09；Recipe官方test有效输入dump已推062dee5d，自然完整示例拒绝并保留；历史synthetic不改称实跑 |
| 新发现修复 | Explainer复制结果与手工恢复 | Clipboard outcome已推送68866954，来源、基线/候选和实际截图见第33项 |
| 图片总览 | 49项固定实验图片 | source hub735250ac、HTML5d20fafc；三新增项、四筛选及390px范围由root实际核验，六图已查看并绑定；未完整重测49项，46/39及更早证据保留原身份 |
| 既有实验补证据 | DBML与Plan actions | DBML已补上primary key同义写法接受；原拒绝记录保留；完整plan fixture转换证据不变 |
| 已排除的重复实现 | Mutation报告reader | 原viewer已有文件搜索、状态筛选、diff、测试关联和单HTML打包；只保留研究，不另建reader |
| 新dev影响核对 | 许可声明与finalize源范围修复 | [15:41迁移](base-refresh-1541.md) / [16:18交付逻辑](base-refresh-1618.md)：分别核对实际diff；旧证据保留原身份，新整合按影响验证 |
| 保留候选 | Notebook别名与派生值的不同stale预期 | 6项目只读报告完成；目前无实际notebook交接任务，暂不扩成converter |

## 一手调研报告

| 领域 | 报告 |
| --- | --- |
| Task-view 与改动审阅 | [Task-view](scouts/task-view.md) |
| 代码与依赖地图 | [Code maps](scouts/code-maps.md) |
| 图形探索与阅读 | [Graph reading](scouts/graph-reading.md) |
| 文本及结构数据转图 | [Text diagrams](scouts/text-diagrams.md) |
| 运行轨迹与时间线 | [Traces](scouts/traces-timelines.md) |
| Git 历史及架构证据 | [Git and architecture](scouts/git-architecture.md) |
| PRLens 与小型专用工具 | [PRLens and small tools](scouts/prlens-smalltools.md) |
| 协议、状态机与 schema 演化 | [Protocol/schema small tools](scouts/protocol-schema-smalltools.md) |
| CI、构建与基础设施小工具 | [Build/infra small tools](scouts/build-infra-smalltools.md) |
| Viewer 阅读交互与明确导出范围 | [Interaction small tools](scouts/interaction-smalltools.md) |
| 测试结果、上下文与代码证据 | [Test/code evidence small tools](scouts/test-code-evidence-smalltools.md) |
| 源码导航、上下文和问题导览 | [Source navigation small tools](scouts/source-navigation-smalltools.md) |
| 图差异、事实对照与视觉比较 | [Graph comparison small tools](scouts/graph-comparison-smalltools.md) |
| 布局、边与标签阅读的负面筛选 | [Layout reading small tools](scouts/layout-reading-smalltools.md) |
| 作者纠错、位置与关联诊断 | [Authoring diagnostics small tools](scouts/authoring-diagnostics-smalltools.md) |
| 架构约束、违规见证与检查范围 | [Architecture constraints small tools](scouts/architecture-constraints-smalltools.md) |
| 局部上下文、路径与折叠的负面筛选 | [Local context small tools](scouts/local-context-smalltools.md) |
| 性能图计量、比较与异步归因 | [Profile reading small tools](scouts/profile-reading-smalltools.md) |
| 符号、调用点与来源证据 | [Symbol evidence small tools](scouts/symbol-evidence-smalltools.md) |
| 图的可访问性、身份与键盘阅读 | [Accessible graph small tools](scouts/accessible-graph-smalltools.md) |
| 执行步骤、消息投递与逻辑顺序 | [Execution reading small tools](scouts/execution-reading-smalltools.md) |
| 数据血缘与变换证据 | [Lineage evidence small tools](scouts/lineage-evidence-smalltools.md) |
| Rust/Go代码阅读与构建解释 | [Native code reading small tools](scouts/native-code-reading-smalltools.md) |
| 离线图交换、关系身份与来源链接 | [Graph exchange small tools](scouts/graph-exchange-smalltools.md) |
| 模型检查反例、位置与循环闭合 | [Model witness small tools](scouts/model-witness-smalltools.md) |
| SQL查询计划与统计口径 | [Query plan small tools](scouts/query-plan-smalltools.md) |
| Notebook别名、物化值与stale证据 | [Notebook evidence small tools](scouts/notebook-evidence-smalltools.md) |
| 组件身份、包坐标与出现位置 | [Component identity small tools](scouts/component-identity-smalltools.md) |
| Mutation状态、源码与测试关联 | [Mutation evidence small tools](scouts/mutation-evidence-smalltools.md) |
| 静态代码路径与步骤位置 | [Codeflow evidence small tools](scouts/codeflow-evidence-smalltools.md) |
| 语法树、冲突与失败位置 | [Grammar reading small tools](scouts/grammar-reading-smalltools.md) |
| 增量构建、缓存与失效传播 | [Rebuild evidence small tools](scouts/rebuild-evidence-smalltools.md) |
| 并发程序的锁序与等待证据 | [Concurrency evidence small tools](scouts/concurrency-evidence-smalltools.md) |
| 编译器优化备注、位置与采样来源 | [Compiler remarks small tools](scouts/compiler-remarks-smalltools.md) |
| 字段offset、padding与对象布局 | [Data layout small tools](scouts/data-layout-smalltools.md) |
| 相邻项目的审阅小动作 | [Adjacent discovery round 2](scouts/adjacent-discovery-round2.md) |
| 真实入口流程与仓库导读 | [Repository orientation small tools](scouts/repository-orientation-smalltools.md) |
| 值、对象身份与局部计算解释 | [Visual explanation small tools](scouts/visual-explanation-smalltools.md) |
| 渐进解释、分叉判断与表达式上下文 | [Adjacent discovery round 3](scouts/adjacent-discovery-round3.md) |
| 范围比较与条件上下文 | [Code-reading utilities round 4](scouts/code-reading-utilities-round4.md) |
| 代码导航与多调用点 | [Code navigation round 5](scouts/code-navigation-round5.md) |
| 折叠状态、汇总边与层级阅读 | [Graph reading round 5](scouts/graph-reading-round5.md) |
| 比较策略、移动身份与空白阅读 | [Comparison reading round 5](scouts/comparison-reading-round5.md) |
| 既有来源、diff、code块静态窄核 | [Source block reading audit](scouts/source-block-reading-audit.md) |
| 字节范围、位字段与重叠解释 | [Binary reading round 6](scouts/binary-reading-round6.md) |
| Git父关系与图中路由点 | [Git graph reading round 6](scouts/git-graph-reading-round6.md) |
| 调试缓冲、栈补齐与重新执行 | [Debugging reading round 7](scouts/debugging-reading-round7.md) |
| 标注、完整文字与局部导出 | [Annotation reading round 7](scouts/annotation-reading-round7.md) |
| 新dev与11项产品候选的行为交集 | [Product overlap at dev10b4](scouts/product-overlap-dev-1731.md) |
| 图节点、来源卡与键盘交接的实际缺口 | [Reading handoff audit](scouts/reading-handoff-audit.md) |
| 类型展开、回指与求解候选 | [Type reading round 8](scouts/type-reading-round8.md) |
| 匹配过程、接受条件与截断 | [Matching reading round 8](scouts/matching-reading-round8.md) |
| Shell原文、展开与参数边界 | [Shell reading round 9](scouts/shell-reading-round9.md) |
| 样式贡献、上下文与来源 | [Style reading round 9](scouts/style-reading-round9.md) |
| Notebook位置、源码与保存输出 | [Notebook reading round 10](scouts/notebook-reading-round10.md) |
| 构建打印位置与任务身份 | [Build reading round 10](scouts/build-reading-round10.md) |
| 长源码与多来源交接窄审计 | [Source reading audit round 10](scouts/source-reading-audit-round10.md) |
| 配置叠加、幸存值与错误来源 | [Config reading round 11](scouts/config-reading-round11.md) |
| Benchmark中心值、区间与比较结论 | [Benchmark reading round 12](scouts/benchmark-reading-round12.md) |
| Parser输出策略与共享森林计数 | [Parser reading round 13](scouts/parser-reading-round13.md) |
| 创建关系、上下文与取消请求 | [Concurrency reading round 13](scouts/concurrency-reading-round13.md) |
| 小型代码图交互、显隐与聚合成员 | [Graph interaction round 14](scouts/graph-interaction-round14.md) |
| 记录顺序、样本与行为证据 | [Round 15 behavior evidence](scouts/round15-behavior-evidence.md) |
| 为何重建、缓存与传播边界 | [Round 15 build explanation](scouts/round15-build-explanation.md) |
| 源码存在、给定宏与实际构建 | [Round 16 conditional code](scouts/round16-conditional-code.md) |
| 包身份、解析上下文与edge extras | [Round 16 resolution identity](scouts/round16-resolution-identity.md) |
| Preview重新打开的既有边界 | [Round 16 preview reopen boundary](scouts/round16-preview-reopen-boundary.md) |
| 本地代码阅读与行注释往返 | [Round 18 local reading](scouts/round18-local-reading-smalltools.md) |
| 局部结构差异与声明中间态 | [Round 18 structural diff reading](scouts/round18-structural-diff-reading.md) |
| 屏内空间方向浏览与关系阅读 | [Round 18 small graph interaction](scouts/round18-small-graph-interaction.md) |
| 控制路径、数据依赖与实际执行 | [Round 19 control/data reading](scouts/round19-control-data-reading.md) |
| 变量状态集合、借用与运行事件 | [Round 20 state/lifetime reading](scouts/round20-state-lifetime-reading.md) |
| 符号候选、插件筛选与查询结果 | [Round 21 symbol reading](scouts/round21-symbol-reading.md) |
| 图阅读交互与已有能力排重 | [Round 22 graph reading interactions](scouts/round22-graph-reading-interactions.md)（0新增产品动作） |
| 来源清单与共同/替代见证组 | [Round 23 lineage reading](scouts/round23-lineage-reading.md)（最多一个内容候选，未实施） |
| 补丁应用状态与目标文本身份 | [Round 24 change reading](scouts/round24-change-reading.md) |
| 查询映射原点与字符来源边界 | [Round 25 origin mapping reading](scouts/round25-origin-mapping-reading.md) |
| 覆盖数字背后的计量对象 | [Round 26 coverage reading](scouts/round26-coverage-reading.md)（研究完成，仅原创URL-only候选未实施，GPL原件私有） |
| 异常分组、cause与重复呈现 | [Round 27 error reading](scouts/round27-error-reading.md)（报告冻结，内容方向待定、不启动） |
| 15个适配器对新dev的实际影响 | [Round 17 adapter dev impact](scouts/round17-adapter-dev-impact.md) |
| 源码定位、调用与返回、图形作者辅助（2026-10-28） | [三方向筛查](../2026-10-28/README.md#新一轮筛查源码定位调用序列与图形作者辅助)（本轮0新增实施；19项目条目含复核） |
| 共同可达集合复核（2026-10-28） | [Shared reach revisited](../2026-10-28/scouts/shared-reach-revisited.md)（完整公开图支持一个离线实验） |
| 当前 Archify 集成切口 | [Integration map](integration-map.md) |

报告中的上游声明、局部源码核实、计划中的实验和已经执行的结果分别标注。未推荐方向也保留原因，避免反复研究；没有把上游宣传、星数或作者截图当作 Archify 的效果证明。

## 证据约定

- 图片来自实际 HTML 浏览器截图或原生导出，不使用概念图冒充产物。
- 实测、公开上游样例、原创 synthetic 与作者声明分开标识。
- 来源和许可固定到可核对 revision；未复制实现时仍记录灵感来源。
- 原始含本机路径的 receipts 保存在 checkout 外；公开摘要明确说明是派生记录，保留实际阶段、hash 和失败。
- 修复独立审查发现的问题后再推送；明确限制不通过隐藏数据、关闭检查或改基线来伪装通过。
- 每个方向有独立分支。第一批适配器位于 experiments/，沿用原生 renderer，不扩大已安装 Skill 的公共 CLI。共享 Viewer 实验另外记录其更广影响。

AI 协助：Codex 负责调研、实现、截图及审查；通常 delegated model 为 gpt-6.1-sol medium，共享 Viewer 的复杂实现使用 high。以上不声明人类代码或视觉接受。

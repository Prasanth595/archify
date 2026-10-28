# Graph authoring next：诊断对象与局部结构修改

2026-10-28。**本轮推荐 0 个新实验。** 六个新来源中，确有值得记住的机制：不可见对象的诊断保留真实身份、诊断驱动的局部预览、手动布局与源文分离。但前者需要一个实际编辑器/投影场景，后两者在 Archify 已有作者合同、既有实验或 open PR 中有明确责任。本轮尚未从这些来源形成一个值得新增实验的具体作者问题、完整输入和可比较的操作或输出差异；公开完整 fixture 或明确标为构造的复现同样可以检验探索任务，不要求先有真实用户失败记录。不把别人工具的按钮、漂亮图或测试数量当作收益。

应用 research Skill 的一手来源方法。此报告由研究后台 agent 完成；只写本文件。没有执行上游代码、函数、测试、编译器或浏览器，没有安装、修改产品、commit、push、PR、issue 或评论。源码期望、静态推导、上游作者陈述和本轮实测分开；本轮没有运行效果或图片验收，因此没有新建实验分支或“真实图片”。

## 1. 排重及当前 consumer

逐项核对 [53 项索引](../../2026-10-25/README.md) 的名称与交付边界，并复读 [graph interaction round14](../../2026-10-25/scouts/graph-interaction-round14.md)、[round22 graph reading](../../2026-10-25/scouts/round22-graph-reading-interactions.md)、[graph answers](graph-answers.md)、[authoring diagnostics](../../2026-10-25/scouts/authoring-diagnostics-smalltools.md) 与 [layout reading](../../2026-10-25/scouts/layout-reading-smalltools.md)。六个 owner/repo 在当前 `docs/research` 全文没有既有命中；这只是字面排重，不宣称历史从未有人提及。

GitHub `refs/heads/dev` 本轮实时 GET 仍是 [`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/tree/6ca6a5c84439b57ea22e0630fe306e1d91587a6e)。hub 自身 HEAD 是 `c30c184d68e6391dcb8cf1fd78eacb34cc1f07a6`；产品判断使用 `git show 6ca6…:<path>`，没有把 hub 的研究提交当产品基线。

| 具体 consumer | 本轮核到的现有行为 | 排重结果 |
| --- | --- | --- |
| 作者通过公共 CLI 收到校验失败 | [formatDiagnostics](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/bin/archify.mjs#L2789) 显示 code/message/fixes；[shared diagnostics](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/renderers/shared/diagnostics.mjs#L34) 已把 subject 放入去重身份。 | dev 的文本仍未显示 subject，但第20项 Diagnostic locations 已有独立实验和当前基线刷新；不能再报同一个“显示行号/对象”实验。JSON 结构与人读投影分开。 |
| 作者反复修一个 draft，看 local preview | [preview shell](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/bin/preview.mjs#L113) 有 checking / needs-fix / verified、generation/revision 和保留旧 verified 图；[publishFailure](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/bin/preview.mjs#L600) 投影失败信息。 | 不再新增 last-good / stale 状态实验；Preview dashed ink 与 Diagnostic locations 各自已有证据。 |
| 作者修已交付 Architecture 的几何 | [当前 Skill](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/SKILL.md#L94) 已限制为节点位置/大小的一轮调整，固定语义后再 finalize，失败或更差则恢复。 | 外部“separate nodes”不构成新的安全修复合同；已有量测、验证、回退责任不能被视觉编辑器按钮替代。 |
| 读者定位节点/关系 | Relation reference、Relation search、Finder、Spatial focus、Route alternative 已列入53项；round14/22已排除过滤/折叠/聚合的无证据扩张。 | 不把选节点、切父层、再高亮路径另算新方向。 |

## 2. 六个新项目：固定来源与许可

发现来自本轮网络检索及 GitHub 一手仓库；不按 stars 设门槛或排名。固定 head 由 GitHub API 读取，源码与完整许可通过该 SHA 的 raw 文件读取。未复制实现；完整输入仍由固定链接取回，不把临时目录当持久交付。

| 项目、固定 SHA | 已读取的一手内容与具体行为 | 许可及处置 |
| --- | --- | --- |
| [ayl/openchart](https://github.com/ayl/openchart/tree/41d710613e1dee1c04501eae270e142d11827a58) `41d710613e1dee1c04501eae270e142d11827a58` | 完整 `index.html`、两份 JSON fixture、fixture 测试与 connector/pass8 测试。诊断对象可选择；部分 finding 提供局部修复或两对象 Tidy 预览。深读见 §3。 | [README license 段](https://github.com/ayl/openchart/blob/41d710613e1dee1c04501eae270e142d11827a58/README.md#license) 仅称原项目为 MIT；固定 tree 没有独立 LICENSE，API license=null。**不作为已核准可复用代码/fixture 来源**，仅观察机制。图标另有第三方声明。 |
| [bpmn-io/bpmn-js-bpmnlint](https://github.com/bpmn-io/bpmn-js-bpmnlint/tree/facd541707a340d884a44fd7754d8dde604cb2e0) `facd541707a340d884a44fd7754d8dde604cb2e0` | 完整 `Linting.js`、`LintingSpec.js`、三份 BPMN fixture、两份配置。无图形位置的业务对象问题挂在可见 process/participant，保存 actualElementId。深读见 §4。 | [MIT 正文](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/LICENSE)，1068 B；可参考身份保留，非引入 BPMN 编辑器。 |
| [TheHolyOneZ/ZDraft](https://github.com/TheHolyOneZ/ZDraft/tree/b514f26606298490ce12f64697aacb1e50d625ee) `b514f26606298490ce12f64697aacb1e50d625ee` | 完整 `DiagnosticsStrip.tsx`、overlap、scene、sidecar reader/tests；完整 Mermaid 源+SVG+版本及 sidecar fixture。显示 stale 后可重渲染，finding 可选中节点/跳源/改 pins。深读见 §5。 | [GPL-3.0 正文](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/LICENSE)，35181 B。只借问题分析，不移植组件或 sidecar 实现。 |
| [packerlschupfer/gDiagram](https://github.com/packerlschupfer/gDiagram/tree/34294b9d0d0931ac902f4a4f0bb638ee7263fda6) `34294b9d0d0931ac902f4a4f0bb638ee7263fda6` | 完整 `DiagramLinter.vala`、`DiagramValidator.vala`、README。局部阅读 [lint_flowchart](https://github.com/packerlschupfer/gDiagram/blob/34294b9d0d0931ac902f4a4f0bb638ee7263fda6/src/core/DiagramLinter.vala#L30) 用英文标签中的 start/begin/end/finish/done 与节点数阈值给 best-practice 建议。 | [GPL-3.0 正文](https://github.com/packerlschupfer/gDiagram/blob/34294b9d0d0931ac902f4a4f0bb638ee7263fda6/LICENSE)，35149 B。作为诊断语义反例：合法中文/非流程架构不应因缺英文词而被判问题；建议不是语义错误。 |
| [desastreger/dicegram](https://github.com/desastreger/dicegram/tree/eb4a9e27644ed761739bab97d3b495572ab1474a) `eb4a9e27644ed761739bab97d3b495572ab1474a` | 完整 `compiler.py`、`patch.ts`、`simple-flowchart.txt`、README。文本/树同步有具体 [reparentNode](https://github.com/desastreger/dicegram/blob/eb4a9e27644ed761739bab97d3b495572ab1474a/frontend/src/lib/patch.ts#L621)，而 [normalize](https://github.com/desastreger/dicegram/blob/eb4a9e27644ed761739bab97d3b495572ab1474a/backend/app/dsl/compiler.py#L56) 会删除未知端点边、重命名重复节点、去掉泳道内 pin。 | [AGPL-3.0 正文](https://github.com/desastreger/dicegram/blob/eb4a9e27644ed761739bab97d3b495572ab1474a/LICENSE)，34523 B。可见“self-heal”实际可能改语义/删关系；不复制并不建议 Archify 自动归一化或新建四面同步作者平台。 |
| [hylimo/hylimo](https://github.com/hylimo/hylimo/tree/9c43450b842d933bb27592fa9028c25a991ed2e1) `9c43450b842d933bb27592fa9028c25a991ed2e1` | README、许可、完整 [navigationMouseListener](https://github.com/hylimo/hylimo/blob/9c43450b842d933bb27592fa9028c25a991ed2e1/packages/diagram-ui/src/features/navigation/navigationMouseListener.ts) 和 [getSourceRangeMessage](https://github.com/hylimo/hylimo/blob/9c43450b842d933bb27592fa9028c25a991ed2e1/packages/language-server/src/diagram/remote/getSourceRangeMessage.ts)：Alt-click/doubleclick 按 element ID 发 action，range 回复允许 undefined。 | [根许可](https://github.com/hylimo/hylimo/blob/9c43450b842d933bb27592fa9028c25a991ed2e1/LICENSE) 对多数包为 MIT，明确排除 diagram-ui；[diagram-ui/LICENSE](https://github.com/hylimo/hylimo/blob/9c43450b842d933bb27592fa9028c25a991ed2e1/packages/diagram-ui/LICENSE) 为 **EPL-2.0**，另有 LICENSES。不能按 API NOASSERTION 或根 MIT 笼统许可 UI。仅初筛，不宣称本轮追完宿主处理或建立新 source-map。 |

## 3. OpenChart：局部修复必须保留对象对与预览边界

已读取 [index.html L14585–14800](https://github.com/ayl/openchart/blob/41d710613e1dee1c04501eae270e142d11827a58/index.html#L14585-L14800)。`qualityChecks()` 区分 text-overflow、label-overlap、label-arrowhead、shape-overlap、tight-arrow。label-overlap 对每对 label 只发一条，并同时保留 `id` 与 `otherId`；这是比“有重叠”更具体的作者问题。`reviewAction()` 对 text-overflow fit shape；对 label-overlap/label-arrowhead 把 labelAuto 设回 true 并删除手工位置；对 shape-overlap 先选择两对象，生成 Tidy proposal，再让作者 Apply。locked/不可编辑对象不提供该动作。

**具体复现入口。** 完整官方 [shared-node-overlap.json](https://github.com/ayl/openchart/blob/41d710613e1dee1c04501eae270e142d11827a58/tests/fixtures/shared-node-overlap.json) 是 3172 B，SHA-256 `32ed0a3c03a28d2d20e3a42193a262800211a12fb5f1a6b1cd5b5463c91a0e16`。它完整定义三节点、两连接、绘制顺序和一个 layer，第二条边与第一条共享 A。描述记载共享端点外的走廊冲突；[fixture test](https://github.com/ayl/openchart/blob/41d710613e1dee1c04501eae270e142d11827a58/tests/fixtures.test.cjs#L114) 的 expected 是 `diagCrossings()` 空集合。文件描述仍有 phase1 remaining 的历史措辞，当前测试已不 skip，不能只据描述说当前缺陷仍存在。完整 routing-capacity fixture 也读取了；它们是作者提交的构造回归输入，不是本轮自然用户失败。

这个 fixture **没有文字标签**，所以不拿它充当 label-overlap 修复的完整 before/after 输入。仅凭 qualityChecks 有某规则，不等于这份 fixture 覆盖它；本轮不执行测试、不截图，也未从 README 的现有基线图推断修复有效。

**反例与成本。** reset automatic label 不保证新 label 不再冲突；移动两对象可能让原连线穿越其他节点，或使原来清楚的关系变差。pair 身份保留有用，但 Archify 的 JSON subject/evidence 与 Diagnostic locations 已可承接，不需要编辑器、选择集、undo transaction、Tidy preview、cache fingerprint 等整套状态。OpenChart 固定 source 的许可也不充分，不能把它的代码/fixture直接搬进 Apache-2.0 产品实验。

## 4. BPMN lint：显示宿主与真实错误对象分开

[Linting.js L145–193](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/lib/Linting.js#L145-L193) 先把按 rule 分组的报告展平。若 `elementRegistry.get(report.id)` 找不到对象，把原 ID 放入 `actualElementId`，设置 `isChildIssue`；有 participant 的 processRef 指向它时挂在 participant，否则挂 root。随后才按显示宿主 ID 分组。[L400–429](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/lib/Linting.js#L400-L429) 给子对象问题单独一组；[L469–486](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/lib/Linting.js#L469-L486) 显示实际对象 ID。不是“把错算到父节点”，也没有证明它自动展开到不可见对象。

**完整可重放输入。** [no-bpmndi-and-root-error.bpmn](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/test/spec/no-bpmndi-and-root-error.bpmn) 为 713 B，SHA-256 `4db69ca3886933e0132ff5c3f9efd8bce9d615752af4bf304982bf688977b214`。XML 是一个 executable `Process_1`、一个命名 StartEvent，以及无 shape 的 BPMNPlane；没有截取或删字段。测试环境读取的 [.bpmnlintrc](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/test/spec/.bpmnlintrc) 117 B / SHA-256 `0628e18894658f89ef05270a0c40d0f6430974b35d99c44b462fe969fd31dbdd`，extends recommended，改 start-event-required 为 warn，并配置 fake-join info；这是上游测试配置，不是 Archify 规则集。

[LintingSpec.js L634–660](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/test/spec/LintingSpec.js#L634-L660) 完整 case 的操作是 importXML → toggleLinting，expected 为 Process_1 上有一个 current issue、三个 child issues、三个 ID hints。相邻 [no-bpmndi.bpmn](https://github.com/bpmn-io/bpmn-js-bpmnlint/blob/facd541707a340d884a44fd7754d8dde604cb2e0/test/spec/no-bpmndi.bpmn) 完整 1111 B、SHA-256 `12d2f03acb2603a9e99fd6e8895719084c1c1698eb9659ff69a076c23e7b343c` 的 case 期望零 current issue、三个 child issues。这说明“没有当前对象问题”和“没有子对象问题”不同；不是本轮实际 render 结果。另读完整 diagram-with-child-issues 1665 B，未把不同 fixture 的节点身份拼接成一张图。

**Archify 能借的要求。** 若以后真的显示折叠 group 或失败几何，diagnostic 的 authored identity 与可点的显示宿主必须分开。当前失败可能发生于生成 HTML 之前，旧 verified preview 对应另一输入；不能在旧 SVG 上给新错误 ID 直接挂 badge，再声称定位准确。需要当前输入/显示版本绑定和映射缺失时的文本 fallback，已有 subject 投影更简单。本轮没有这类实际 Archify consumer，不提新 overlay 系统。

## 5. ZDraft：手动布局是第二份身份合同

[DiagnosticsStrip](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/src/components/DiagnosticsStrip.tsx#L34) 支持 goto、release-pins、separate-nodes；stale 时只显示 canvas behind source 与 Re-render。错误存在时列表先显示 errors，不能把没有呈现 warnings 说成警告已消失。`separate-nodes` 调用 [separateNodes](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/src/core/overlap/index.ts#L51)，再把返回位置 `pinAt` 并 select；这与只读诊断定位不同，确实修改手动布局。

`findOverlaps` 按矩形两两检测、面积至少4；`overlapDiagnostics` 把所有 pair 的涉及节点合成一条 finding。`separateNodes` 在有限24轮中沿较小重叠轴分开，只移动选中 ID，允许与未选中节点比较。静态源码足以说明它**不是经完整连线、文本与容器约束认证的修复**；不会因为名字含 fix 就声称完整图已无碰撞。比如三个互相重叠对象会合并成一条 finding，pair 原因不在该 diagnostic 中逐项保留；这与 OpenChart pair-preserving 合同不同。

**两份完整独立 fixture，不能伪称一对。**

- [flowchart-lr.mmd](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/tests/fixtures/mermaid/flowchart-lr.mmd) 401 B / `d18e973965b11cc9f578872d756151dda3d20be44ced08a0501b7cd0095ac523`，8节点8边、两个 subgraph，API→decision→db/cache，另有 publish/consume 关系；完整 [flowchart-lr.svg](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/tests/fixtures/mermaid/flowchart-lr.svg) 27151 B / `61b290801d4606f960f57ec9b32f7d72b1a5b5a3447c3fd8cdeddfde4b3d7857`，fixture [VERSION](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/tests/fixtures/mermaid/VERSION) 标 11.17.2。已读源和 SVG 字节，未执行 Mermaid、打开图或声称视觉检查。
- [full.zlayout.toml](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/tests/fixtures/sidecar/full.zlayout.toml) 428 B / `f3e357406eb0143369e34d104d7e0b1c429e567175a1c4912c9b2a4846901985`，有 api/cache pins、gateway→api waypoints/label_offset、anchor api 的注释、sequence order/gap 与 theme。[read.test.ts](https://github.com/TheHolyOneZ/ZDraft/blob/b514f26606298490ce12f64697aacb1e50d625ee/src/core/sidecar/read.test.ts#L9) 期望 api 保留 fingerprint/auto；cache 缺省为 null。该 reader测试不证明身份重关联正确；sidecar另含 browser lifeline，不能说它是上面flowchart完整配套布局。

**收益与维护判断。** 让 Mermaid 原文保留 GitHub 可渲染性是 ZDraft 的明确 consumer，值得作为独立产品动机。Archify 原生 JSON 本就含布局/语义身份，没有证据需要另一份 sidecar。引入时将新增源+layout一致性、节点重命名/删除、边多重身份、导出恢复与版本管理责任；只为“能拖节点”不值得。HyLiMo 的 element→range 请求也不能凭自身 UI action 推出范围存在；它的 undefined 回复恰好说明定位可能缺失。

## 6. 当前 open PR / issue 重叠

本轮 GET dev ref、搜索 open diagnostic/authoring/layout 与 diagnostic+overlay 线索，再读取下列具体对象。GitHub search 是有界发现，不据空/宽结果证明无人负责；未评论或改变状态。

| 工作 | 本轮状态 | 与本轮的关系 |
| --- | --- | --- |
| [#960 partial layout](https://github.com/tt-a1i/archify/pull/960) | OPEN；head `95cc8ec7383cf20b82c569983c6c4f50f444565b`，完整 body 已读 | 已覆盖失败时 node frames、已路由 geometry、rejected candidates 与 finalize receipt。作者五项目比较自报修复轮数改善 **0**，且说明 wall-clock 是顺序/学习效应；本轮未复验其数据。它是“更多可视诊断不自动减少 rework”的直接负面证据，不另提失败图预览。 |
| [#308 verified via](https://github.com/tt-a1i/archify/pull/308) | OPEN；head `b3043b4a5207a9ad08400d7dd9bf75aa507e1254`，完整 body 已读 | 已有具体已诊断边的经障碍检查 elbow 建议；范围明确不包括 edge-edge crossing。不能借 ZDraft/OpenChart 再提通用 fix-all。 |
| [#838 member-preserving placement](https://github.com/tt-a1i/archify/pull/838) | OPEN；head `8e45f6f366e41f6d6be1e9dbfd2fc57ed0bc3a6f` | 本轮核状态/title，未审实现；group局部移动已有相邻工作，不能声称无人负责。 |
| [#891 typed sequence failures](https://github.com/tt-a1i/archify/pull/891)、[#923 whole ordered adjustment](https://github.com/tt-a1i/archify/pull/923) | OPEN；heads `02d9b494704f950bb14c1242afe1887d8f058ee3` / `3c9e111820dfda567e06cc52b777d0d4f93d12f6` | 本轮核状态/title，未审实现；sequence canvas诊断与note相关整体修复不另起。 |
| [#1135 Explainer preview](https://github.com/tt-a1i/archify/issues/1135) | OPEN；完整 body 已读 | 已要求 draft+显式依赖追踪、稳定候选、last-good与可行动诊断；不把 Dicegram四面同步或 ZDraft stale 重新当新需求。 |

## 7. 保留什么，何时才值得新实验

保留两条可核查要求：诊断显示在父对象时仍保留实际对象身份；提供局部修复时说明修改了哪些对象并在完整约束下重新校验。它们是从已读实现得到的设计条件，不是经过用户实验的效率结论，也不是本轮新增产品约定。

后续实验需要：可比较的具体作者问题、完整输入，以及当前 dev/已交付实验与候选之间可观测的操作或输出差异。输入可以来自完整公开 fixture，也可以是明确标为构造的复现；不要求先有真实用户失败记录。例如检验 diagnostic subject能否区分两个平行关系，或折叠后是否仍能定位已提供的 source；先核相邻PR是否已覆盖，再只选一个切口。构造复现可以检验具体任务，但不能被称为自然失败，也不能仅凭新增按钮或修好特意构造的坏图就推断普遍收益。本轮基于已核到的重叠与维护成本，仍推荐0项。

本轮实际完成：六项目固定head与来源筛选；OpenChart、BPMN lint、ZDraft 的实现/完整fixture深读；Dicegram归一化、gDiagram启发式、HyLiMo定位协议反例；dev及相关open工作刷新。未完成也未声称：上游执行、实际浏览器交互、图片查看、Archify新分支、用户节时或最终集成。

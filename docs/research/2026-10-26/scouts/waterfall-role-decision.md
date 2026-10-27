# Batch 14 Waterfall：先保留语义缺陷结论，暂缓源码实验

日期：2026-10-28。此次只读源码、已有输入/输出及测试/实验文档；没有 checkout、实现、运行测试、render、browser、安装、push 或 PR。唯一新文件是本报告。技能依据为已读的 archify-review / archify-tuning / test-value；此处不把已有证据当成本轮运行结果。

## 决策

**本轮暂缓 Waterfall 源码实验，确认缺陷，不追加 service grouping framework。**

最小合理修正是让每个节点的角色成为本地化 Span，保留现有 service/context/status。但这会把现有 Lens 的多个技术色桶收敛为一个 Span 组；它不是无代价的一行 Timeline 复制。给 Lens 新增真实 service 维度可以避免这种收敛，却引入了共享匹配、标签、复制链接、颜色投影与旧 hash 的新合同。当前已有 Outline + Finder 能按现成 service/context 阅读，没有观察到用户无法完成这项任务的实证，因此不为保存错误的 Frontend/Backend 色桶直接扩成多维筛选。

**需要权衡的行为边界：是否接受 Waterfall Lens 收敛为一个 Span 组，把服务阅读保留在既有 Outline / Finder，并明确旧技术色 `lens=` hash 在重新生成的新页面上不自动扩大成全部 Span？**

- 若选择这一边界：可以进入下面的 bounded role-only 实验，并单独保持 Radar 的原有绘图色；这是优先的低成本方向。
- 若必须让 Lens 继续逐 service 选取：先明确这是新的 Waterfall 专属 service projection 合同，再评估限定的分组实现。不要把这一需求解释成原来已有且必须保留的精确服务筛选，也不应新增所有图通用的 facet framework。
- 若要求旧 tone hash 在重新生成后的页面中仍选中完全相同节点：需保留旧 tone 分区作为额外兼容维度；这明显超过 role-only 修正。不能宣称用一个 static alias map 已兼容。

这是价值与兼容成本的取舍，不是权限阻塞；已有持续研究授权足以推进选定的有界实验。

## 固定源码与去重

本轮后续所有产品结论都固定在 `origin/dev = d5d979493bba650b3995836afd379cd249f2d0dd`，不是 hub 产品源码。root refresh 后也确认 dev 未变。

相关 remote heads 已读取：

| ref | SHA | 相关范围 |
| --- | --- | --- |
| `origin/codex/lab-timeline-kinds` | `e5bc4cf09129a4f2f49fb799318d18111d9331b0` | Timeline 已独立完成；不拿来冒充 Waterfall 修复 |
| `origin/codex/lab-trace-waterfall` | `8e65f150b8db6947c98f9b12e37d970014e0ea7e` | 已有 Chrome X 完整区间 importer；读取其 README；未改 Waterfall renderer / Viewer / Story |
| `origin/codex/lab-waterfall-status` | `68311bb8461ddd4086af6f2e41ce60e9e6f7f5d4` | 读取与 dev 的 renderer diff 和实验 README；给显式 error/cancelled 加行内文案，未分离 kind/paint |
| `origin/feat/692-execution-waterfall` | `bf63fe48e43c808e06d7b0d40e41aa24bcf3b06a` | 原始 Waterfall 功能来源 |
| `origin/codex/research-lab-20261025` | `60342aa9e40618aeb7c33bdb8d65889fea3a588e` | 读取 traces-timelines、round22-graph-reading-interactions、graph-inspection；已有 trace importer 和 node-kind Lens 调研，不重复提案 |
| `origin/codex/research-lab-20261026` | `7fdff56b01836bf122745fa8e9bbe2b396f79597` | 已有 Batch13 Timeline/Waterfall kind 审计及后续边界 |

root 本轮去重提供仍 open 的 PR #824（nested service attribution）、#1028（numeric timing tolerance）、#1030（incomplete legend only open bars）。我进一步读取 #824 的固定 commit `f5fcf4cc8cc5488d8346eb78adece5f79d47e2bc`：只新增 21 行测试，保护父 service 继承、子显式覆盖、error paint 不改变 service，以及 unowned root；其中仍断言 kind=security/external。因此不重复其 fixture family，也不把其现有断言当成产品应继续将错误叫 Security 的根据。#1028/#1030 不在此判断的实现范围。

检索范围是相关 refs、已有研究、全 refs 的 waterfall/service/kind 相关 commit 标题；不宣称穷举所有 313 remote heads 的每个文件。

## 已有真实 shipped evidence，不是本轮构造运行

基线中 `archify/examples/checkout-request.waterfall.json` 的 evidence 是 **illustrative**：6 spans、4 service。对应已提交 `archify/examples/waterfall-checkout-request-rendered.html` 的 SVG 属性：

| 节点 | authored service | shipped `data-node-kind` | shipped context |
| --- | --- | --- | --- |
| request | checkout-api | frontend | checkout-api |
| auth | identity | backend | identity › POST /checkout |
| inventory | inventory | database | inventory › POST /checkout |
| payment | payments | cloud | payments › POST /checkout |
| discount / save | checkout-api | frontend | checkout-api › POST /checkout |

`archify/examples/example-rebuild.waterfall.json` 则标为 **measured**，README 说明来自一次本地重建和检查八个内置示例的 25-span / 3-worker run。对应已提交 `archify/examples/waterfall-example-rebuild-rendered.html` 中：

- 无 service 的 batch 根节点写成 external。
- worker 1 的 9 spans 写成 frontend；worker 2 的 6 spans 写成 backend；worker 3 的 9 spans 写成 database。
- 每个 worker 的真实字符串都已留在 `data-waterfall-service` 和 `data-node-context`，并没有因为错误 kind 而丢失。

上述是本轮直接读取固定 SHA 的 JSON 与 shipped HTML 属性，不是新运行测量。不能推断用户已被误导或宣称实际浏览器体验已验证。不过“worker 3 是 Database”的类别并非 schema 或作者提供，语义错误本身已由输入/输出对照证明。

两个 shipped JSON 都没有显式 error/cancelled/incomplete。本轮对错误状态与 >5 service 的分组后果来自源码和已有 constructed tests，不能冒充自然事故频率或新的 measured 结果。

## 类型、颜色、服务、状态本来是不同事实

固定 dev 的路径/行号：

- `archify/schemas/waterfall.schema.json:93-140`：span 要求 id/name/start；service 是可选非空任意字符串；status 可选 ok/error/cancelled/incomplete。没有作者提供的 frontend/backend/database 类型，也没有通用 kind 字段。
- `archify/renderers/waterfall/render-waterfall.mjs:147-157`：有效 service 来自显式值或父 service；按 depth-first rows 的首次 service 出现顺序给 frontend/backend/database/cloud/messagebus；五色循环。无 service 用 external。error 强制 security，cancelled 强制 external；incomplete 不单独替换 service tone。
- 同文件 `:219-235`：图例按绘图 tone 合并超过五色的 services，条目显示 `gateway · inventory`，不声称该颜色只归一项。
- 同文件 `:316-327`：Passport kind=row.tone；context 为 effective service › parent name；另有精确 `data-waterfall-service` 和 `data-waterfall-status`。

具体用户问题是：点击某次工作时，Passport/Finder 的类别、Lens 的命名和分组、Story 的 kind 让服务的绘图调色和错误状态冒充节点角色。服务顺序变化可换 kind；同一服务 error 与 ok 可落入不同 kind；不同服务在第六项后可落入同一 kind。后两项是源码推导，不是本轮自然运行观察。

这比 Timeline 多一个真实取舍：Timeline 的五种类别直接来自已枚举的 authored kind，替换 token 后仍有同一套五组；Waterfall 没有一对一 authored role enum，service 和 status 是相互独立维度，不能靠一张五值别名表恢复。

## 现有 service 阅读路径，以及图例没有做的事

**Waterfall 的现有图例不能提供 exact service selection。**

- renderer serviceLegendEntries 与 status legend 均 `interactive:false`。
- `archify/renderers/shared/legend.mjs:207-220` 只有 interactive 条目发布 `data-legend-kind` 和 root `data-legend-bridge`。
- `viewer/semantic-lens.js:18,116-122,188-196` 只找该 bridge，再按 node kind 相等匹配；没有对 `data-legend-semantic-kind="service:..."` 的独立 service picker。
- `test/semantic-legend-gateway.test.mjs` 的 CASES 只有 architecture/workflow/sequence/dataflow/lifecycle；它保护“精确 node-kind 含义才发 bridge”，不是 Waterfall 服务选择。
- >5 services 图例本就合并相同 paint，所以即使把这些现有条目直接变 interactive 也不是逐服务选择。不能为了新功能破坏其正确的共享颜色图例语义。

**service 信息仍可通过既有路径阅读，不必先新增 facet：**

- `viewer/focus.js:456-462` Passport 读 kind、detail、context；effective service 在 context 中可见。
- `viewer/node-finder.js:57-80` 索引 context（不是直接读取 `data-waterfall-service`）；service 因 renderer 的 context 投影已经可以搜索。`:165-166` 正常行 metadata 不显示 context，但 title tooltip 包含它；不要称正常结果行始终显式显示 service。
- Finder `:113-132` 按稳定 node ID 委托 focus/reveal，和 service/kind 分组无关。
- `viewer/node-outline.js:42-65` 按 context 的首段分组，Waterfall 现有两个示例因此保留 worker/service 分组；`:30-39` 点击仍走 Finder/focus。它不是服务全量过滤器，且 context 仍是显示字符串，不应升级为新的 canonical service ID。
- `archify/story/tool.mjs:51-59` 导出 kind/context，timing 单独含 status，未独立导出 service。作者 service 现在只有 context 投影，不能声称已有 structured service 字段。

因此 role-only 不会删除 service、service 搜索、Outline service 组和 click-to-Passport；但确实会删除 Lens 原先在这两个示例中碰巧与 service 对应的多个色桶。不能用“图例仍能选服务”掩盖这个差别。

## 三种最小选项与一个有边界的扩展

| 方案 | 忠实表达什么 | 保留/失去什么 | 代价与判断 |
| --- | --- | --- | --- |
| 统一 `waterfall-span` 角色 | 每个输入对象都是 Span；Passport / Finder / Story 不再发明技术身份 | 保留 timing/service/context/status、绘图色及 Outline/Finder 服务阅读；Lens 只有一个 Span 组 | 最小优先候选，但需接受 Lens 收敛和 hash 改变，不能声称服务 Lens 功能不变 |
| 把 service 身份直接塞进 kind | effective service 分组可以准确，且不受状态/五色循环影响 | unowned 需单独类别；Passport 和 Story 的角色字段变成服务名，服务又重复在 context；输入无 service 时不能编造 | 不推荐作为“语义修正”，因为把另一维身份继续塞入 role。任意字符串需要稳定 token、文案和 URL 规则，不是五项 locale 表 |
| 把 status 直接作为 kind | ok/error/cancelled/incomplete 为合法状态 | 所有服务按状态合并；大部分 shipped spans 都是缺省 ok；缺省和明确成功状态不应被过度解读 | 不推荐；status 已有独立属性及 Story timing.status，已有 status-text 实验处理行内读字，不能替代 service/role |
| 固定 Span 角色 + Waterfall 专属 service Lens projection | role、effective service、status 各自有据 | Lens 可以精确逐服务；需要独立未分配服务桶，不能把色桶当服务桶 | 若未来有明确读图需求，可以限定 Waterfall SVG 使用现有服务属性做投影；不能现在直接建设全模式 facet framework |

最后一项不是一行修改：Lens `collectKinds`、preview/match、selection 标记、count/status 标签、URL 读写都依赖 data-node-kind（`viewer/semantic-lens.js:37-47,188-196,374-391,431-443,464-475,522-550`）。共享调用者和公开 kinds()/select()/active() 的含义要说清。service 的 swatch 应跟服务 palette（不跟某个 error span 的红色）走；同色多个 service 仍是不同组。parent guide 是作者声明的 parent 结构，不是请求流量或 causal dependency；无论选哪方案，Lens 默认说明都不应将它称真实 traffic。

## compatibility 成本不可被省略

1. 新 raw kind 会影响 Story facts、Finder type 搜索、外部读取 SVG 的消费者；只承诺当前已识别消费者，不能承诺任意 API 无变化。已有 old HTML 自带 old Viewer，不会自动被改写；风险在重新生成后的同一文档/URL 与旧 hash 配对。
2. Timeline 的旧技术kind能一对一映射五类事件。Waterfall 的 `#lens=frontend` 可能是一项服务，也可能是同色两项服务；`security` 是跨服务所有 error，`external` 可能同时包含 unowned 和 cancelled。映射到单个 Span 会静默扩大集合，映射到某个 service 会选错；都不是 faithful compatibility。
3. 若接受 role-only，新链接只发新角色，旧 tone hash 在新页面应明确不自动迁移；如果必须保持精确旧选择，需要额外保留 tone group，这个成本不能藏在简单修正里。
4. legacy `viewer.kind.frontend/backend/...` 翻译现在可能用于不同服务，不能像 Timeline 一样挑一项自动作为全部 Span 标签；新 `viewer.kind.waterfall.span` 应优先，既有服务原文/context 不自动本地化或改名。
5. **Radar 是额外实际消费者**：`viewer/semantic-radar.js:70` 将 data-node-kind 作为缩略矩形 data-kind，CSS 按技术kind着色。只改 kind 会让所有水瀑缩略矩形走同一 fallback 色；即使主 SVG 保持颜色，也不能声称整个 Viewer 配色完全不变。若选择 role-only，应对 Waterfall 单独保留 tone 的视觉投影（可复用 Outline 已从 c-* 类取 tone 的证据），不把 tone 重新写回语义 kind。这个小修正不等于新增 service facet。

## 若选择 role-only，可执行的 bounded experiment

未来候选可，目标限定为“修正节点角色，保留现有服务读取路径”，而非“增添服务筛选功能”：

- Waterfall raw kind 固定 waterfall-span，本地化 Span；保留 effective service、parent、context、status、timing 与 geometry。保持原 SVG palette 和用户 CSS 变量；Radar 单独按实际 tone 保色，Outline 现有 tone 路径不动。
- Lens 允许只呈现一个 Span 组，Waterfall scoped 文案说 spans / authored parent links，不说真实流量。公开报告这是分组收敛，不造第二套 service picker。
- 旧 tone hash 不猜映射；需在实验定义中明确公开这一行为边界。服务名包含标点、中文等不必新增 service ID 编码系统，因为这个候选不建 service hash。
- Story kind 改为 Span，context 保留 service；不在这一候选偷偷新增 Story schema/structured service 合同，也不把现有 timing.status 改作 kind。
- 比较两个固定 shipped JSON + README 的最小未归属例。原版先在实际 Passport/Lens/Finder/Story 对照中失败；候选必须显示正确角色、保留 Outline service 组、Finder service 搜索和按 ID 点击定位。拍出 measured worker 示例，不能只给玩具 fixture 或断言绿灯。
- 复用 PR824 的 service 继承/child override/error ownership 边界作为相关证据；如需补 palette-cycle 与 hash 交互，只扩充一个已有 constructed case，不建新 matrix。此处不运行或修改其测试。
- 检查实际 RGB、主 SVG geometry/timing、Radar 色和复制链接；若无法保住现有服务读图任务，停止并重新决定 scope，不自动扩为多维框架。

现阶段缺的不是更多同类实现，而是是否接受上述 role-only 行为边界。故本轮输出是可决策的 defer，不是已实现候选、浏览器验收或对收益/频次的泛化结论。


## Root 本轮结论

本目标已有隔离实验授权，不新增审批要求。上述“范围决定”是实现价值与兼容成本的取舍，不是权限阻塞。root选择先保存[固定基线的实际页面复现](../audit/round14-waterfall-native/README.md)：Finder服务搜索有效、Passport角色错误、Lens仍为技术色桶。新增服务Lens尚无足以抵偿维护成本的任务证据，单一Span会改变既有选择集合；本轮暂不实施这两种方案。未来可在原授权内选定有明确边界的实验，不以缺少再次确认作为停工理由。

# Round 13：语义类型来源审计

基线：`origin/dev` d5d97949，从 `git archive` 取只读源码；未使用 hub 旧产品代码。覆盖 Tree 之外 9 个 diagram renderer（不含独立 explainer）。结论：**Timeline 和 Waterfall 存在两个真实且独立的默认语义错误**；Lifecycle 的类型来自明确的领域状态，不是同类错误。未修改 checkout。

## 去重

检查了本地/remote semantic、tree、research 分支和全分支相关提交，及 `origin/codex/research-lab-20261025` 内 semantic lens 文档；后者 `docs/research/2026-10-25/scouts/round22-graph-reading-interactions.md:17`、`2026-10-26/scouts/graph-inspection.md:15` 只确认 lens 按 node kind，未定位本问题。`6769a2a0` 的 hierarchy-role-reading 和 `a15fbd6e` 的 Tree 修复针对结构角色；`5a4a1794` 是 Waterfall 显示 status 文本，非该字段修复。`origin/codex/semantic-stage-fidelity` 的独有提交针对 architecture 布局；未找到 Timeline/Waterfall passport 修复。此为针对相关分支及日志的检索，不宣称所有历史分支的完全穷举。

## 直接复现与消费者

共享 `renderers/shared/cli.mjs:490` 将 passport.kind 写为 `data-node-kind`。`assets/template.html:9106` Passport 用 `viewerKindLabel` 显示它；`:5834-5842` 查询翻译；`:14459-14471` Semantic Lens 按其计数和命名，`:14622` 按它选节点，`story/tool.mjs:53` 也导出该字段。`locales/en.json:49-55` 将 `external`、`frontend` 等展示为 External、Frontend 等。运行原生 renderer 对 README 示例生成 HTML 并直接检验属性；没有浏览器交互验证，Passport 和 Lens 的文字是源码推论。

### Timeline

`renderers/timeline/README.md:14-21` 提供合法单事件输入：Deploy v2.4 无 kind。`schemas/timeline.schema.json:117-121,141-148` 中 kind 可选，合法值为 default/change/alert/action/recovery。`renderers/timeline/render-timeline.mjs:380-381` 映射 default→external、change→frontend、alert→security、action→messagebus、recovery→backend；`:465-469` 将色调写入 passport.kind，而不是事件 kind。实际运行输出 `/tmp/semantic-timeline.html` 的 Deploy 节点为 `data-node-kind="external"`；据共享消费者显示 External，而事件没有外部系统含义。已提交的 `examples/timeline-payment-incident-rendered.html:5547-5583` 进一步显示 Change/Action/Recovery 被编码为 frontend/messagebus/backend。这不仅是默认值：显式类型也被改成技术色名。Lens 分组和 Passport 解释因此误导。

### Waterfall

`renderers/waterfall/README.md:14-30` 示例的 request/auth 无 service 或 status，合法且含所需 timing；`schemas/waterfall.schema.json:93-96,111-132` 同样允许省略。`:53-58` 定义色彩表达 service，色板允许复用。`renderers/waterfall/render-waterfall.mjs:147-157` 无服务用 external，按服务顺序用 frontend/backend/database/cloud/messagebus，error 又用 security；`:218,320-327` 把计算出的 tone 作为 kind。实际运行 `/tmp/semantic-waterfall.html` 的两个 span 均 `data-node-kind="external"`，虽然它们是请求和认证工作，不声明外部。服务顺序、服务数超过五、错误状态也会影响或混淆领域分类；色彩相同不代表 service 相同。影响 Passport、Lens 和 story 消费；其身份应如何表达（统一 span、service、status 或多维字段）是产品选择，不应直接假设色名就是类别。

## 其他 7 个 renderer

- Lifecycle：`schemas/lifecycle.schema.json:98-119` 要求 state.type，描述明确 start/active/waiting/decision/success/failure/neutral/external 的状态语义；`renderers/lifecycle/README.md:33,60` 色彩跟随 type；`renderers/lifecycle/render-lifecycle.mjs:1024` 直接传 state.type，属于正确方向，非默认色调冒充状态。
- Architecture：`renderers/architecture/render-architecture.mjs:1083` 传 component.type；Workflow：`renderers/workflow/workflow-compiler.mjs:5426` 传 node.type；Dataflow：`renderers/dataflow/dataflow-compiler.mjs:1454` 传 node.type；Sequence：`renderers/sequence/render-sequence.mjs:943` 传 participant.type。这些是各自作者提供的技术分类，部分用于抽象业务动作，但不等于 renderer 自动把色值改写成另一语义。
- Class：`renderers/class/render-class.mjs:947` 传 type.kind，class/interface 等是领域结构分类。
- ERD：`renderers/erd/render-erd.mjs:1411-1418` 恒传 database，同时 context 为 Entity；所有对象都是 ER entity，因此 Database 比 Entity 粗，但不是按色彩生成或默认误判成外部系统。可改进命名，但本轮证据不足以断言独立同等级错误。

修复成本和风险：Timeline 可把事件类型和绘图 tone 分离，但需要决定 default 的本地化名字并覆盖 Lens、Passport、story 及颜色；Waterfall 要先定 span/service/status 的语义维度和重复色/状态覆盖行为，涉及共享 Lens 的分组、显示与 i18n，比单行替换成本高。均不涉及对现有合法输入追加必填字段；此处未实现，也未运行全套测试或浏览器。


## 后续结论与来源边界

上文是实施前的源码侦察，不是最终候选验收。Timeline随后在独立分支实现并保存实际页面对照；Waterfall只保留源码及原生输出观察，没有浏览器验收，也未选择分类维度。源文件相对路径均位于固定Archify d5d979493bba650b3995836afd379cd249f2d0dd的archify/下，原项目Apache-2.0及署名保留；没有复制外部实现。

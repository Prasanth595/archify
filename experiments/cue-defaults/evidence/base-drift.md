# Round 29：基线漂移和 source-link 去重（只读）

固定实验基线 `d5d979493bba650b3995836afd379cd249f2d0dd`，已 fetch 的 `origin/dev=6ca6a5c84439b57ea22e0630fe306e1d91587a6e`。`6ca6a5c8` 是以 d5 为第一父节点的 PR #1138 merge，另外两个提交 `dcd4343e`、`ae76b416` 增加 review/ZIP integration 指南和工具。净变更仅 `.agents/skills/archify-review/SKILL.md`、`REVIEWING.md`、`benchmarks/real-repo-generation/report-template.md`、`scripts/integrate-pr-zip.mjs`、`test/integrate-pr-zip.test.mjs`。`git diff --name-only d5..6ca -- archify viewer test/explainer* docs/specs/explainer` 为空；没有 Explainer renderer、reader、authoring contract、template、schema 或测试代码变更，故源码路径审计未发现会改变 CUE 固定实验渲染/作者输入的上游变化。新增 review 指南可能影响未来 PR 证据表述，但不是内容运行差异；无 replay，不声称新 base 上已经实测或改变实验基线。

## `codex/lab-source-link-context@dae900182d317d76620104e619d8fdfba7229315`

该分支和所询问的 Explainer citation 是**不同元素和消费者**，不能因为名称都为来源链接即认定已覆盖或重复修复：

- 本分支 `viewer/focus.js:350-374` 通过 `Archify.sourceEvidence.node(id)` 在 Native SVG 节点 Passport 的 `#focus-evidence` 动态创建 `.semantic-passport-source`，对有 href 的来源以 `sourceName + sourceRange + localized path/revision` 设置 aria-label。其 `test/repository-evidence-browser.test.mjs` 新增用 architecture fixture、`Archify.focus.set('users')` 读取该类元素 AX 名称，验证同路径不同标签/行范围可区分；README 也明确范围为 Native Passport。源码改动不在 `archify/explainer/*`。
- d5 `archify/explainer/inline.mjs:132-137` 将 source 引用生成 `<sup class="cite"><a href="#source-${id}">${number}</a></sup>`；`archify/explainer/render.mjs:107-112` 生成对应 `li#source-${id}` 和来源标题/位置。`archify/references/explainer-authoring.md:247,254` 规定首次出现次序编号、footer 及可验证引用的 hover 预览。它不是 Passport 外部源码链接，dae90018 的新 aria-label 分支不会命中它。两者可能涉及相同的一般可访问性主题，但并无直接代码/测试覆盖。
- 当前任务记录中 root 在浏览器观察 Enter 后到 footer、再 Tab 可到正确来源；这是另一次实际交互观察，此审计未重跑。纯数字可访问名称是源码可见事实，不自动证明导航失败，也不自动等同 Passport 中两条不同源码链接具有相同 aria-label 的已修场景。是否值得改善 citation 的可访问名称需结合实际阅读任务及兼容效果判断，不能仅凭数字本身认定阻塞。

本审计没有修改产品、运行测试、浏览器、重放、创建 PR 或更换基线。

# 第21批：Explainer 键盘检查与窄屏 toolbar 去重

2026-10-28，只读。**建议复用现有 checker 候选做 Kconfig 精确输入对照；toolbar 与 source-only 激活分别已有独立工作，不新建平行修复。** Kconfig baseline 的 28/52 条 `browser-keyboard-traversal` 诊断、真实 Tab 到 footer 52/74、390px 文档 401px 是 root 给出的本批现象；本次未读原始回执或重跑，不能据上述数量断言每条诊断都是误报，或已有 PR 已修复该具体页面。

## 三个明确不同的 scope

| 问题 | 现有 owner / 精确 head | 已有覆盖及限制 | 下一步 |
| --- | --- | --- | --- |
| browser checker 对 native scroll stops / 动态 SourceCard 的遍历提前停止 | [Draft #1124](https://github.com/tt-a1i/archify/pull/1124)，`tt-a1i`，OPEN draft，head [`f9fc38cbc19f5bb2725fd54d957e182831eb1eb9`](https://github.com/tt-a1i/archify/tree/f9fc38cbc19f5bb2725fd54d957e182831eb1eb9)，base `500d4a65`；远端 `codex/lab-keyboard-traversal` 同 SHA | 只改 Explainer browser checker，不改 Reader 布局/focus 顺序；冻结初始目标、真实 Tab/方向键，按有界工作和无进展循环停止，仍对真正 trap/耗尽失败。历史 [三产物 direct API 对照](https://github.com/tt-a1i/archify/blob/de2e81fbf5a4ff81fe633c9f88c36885b6634cff/docs/research/2026-10-26/audit/keyboard-current-artifacts.md) 为 task/trace/OCI 原始 HTML，候选 40/40、27/27、29/29；非 Kconfig。PR 报 final head CI attempt 2 为19成功/2部署跳过，保留 attempt 1 的 Sequence 失败；旧浏览器证据绑定旧测试 revision，不能冒称该 Kconfig 输入已通过。 | 保留原页面与28/52诊断；若授权，固定 HTML 哈希在当前 dev 与 #1124 checker 相同入口、Chrome 和四视口/主题下独立对照，记录每个未达初始目标、termination 和真实动作。不能只因 native Tab 到 footer 就把所有报告判假阳性。不要另开相同 checker 分支。 |
| source-only 图节点 Enter/Space 激活 | [`codex/lab-source-keyboard@d81830d34fdd698992b39913eb3fa3cd55d66a32`](https://github.com/tt-a1i/archify/tree/d81830d34fdd698992b39913eb3fa3cd55d66a32/experiments/source-keyboard)，研究分支，维护者研究工作；限定检索未找到对应独立 PR | [README](https://github.com/tt-a1i/archify/blob/d81830d34fdd698992b39913eb3fa3cd55d66a32/experiments/source-keyboard/README.md)：source-only 节点原本真实 Tab 可达且有 SourceCard；修复是 button 语义、Enter/Space 打开 native 图、恢复节点焦点。只动 `reader.js` 和 focused browser test，**不改 checker 或 CSS**。其 10b base 配对页和 scoped 6 pass、实测截图都有精确身份，未宣称完整页面 browser gate 或 AT。 | 只有 Kconfig 实际具备同类 source-only 节点且出现无法 Enter/Space 时才对照其固定行为；不要将 keyboard checker 的计数问题当成这个 Reader 缺陷。 |
| 390px toolbar 导致横向超出视口 | [Draft #1076](https://github.com/tt-a1i/archify/pull/1076)，`BlueboxC`，OPEN draft，head [`cd50794b794fc9f6ec4c9914dee78df0b7fddde3`](https://github.com/BlueboxC/archify/commit/cd50794b794fc9f6ec4c9914dee78df0b7fddde3)，base `10b4dd5c`；[initiative #1068](https://github.com/tt-a1i/archify/issues/1068) P0 明确协调该 owner | PR 描述 <=760px CSS 换行/菜单锚定，保留 desktop/print；声明 en/zh × 4 styles × 320/390/1440、Style/Export 键盘和菜单测试，final-head CI 19成功/2跳过；维护者对先前 head 的 Escape 和真实 style-label 证据提出问题，作者回复并获确认。个人审阅/合并未完成。其矩阵不等于 Kconfig exact HTML 和本轮 401px 已验证。 | 不编辑贡献者分支或并行修复。可单独对 Kconfig 固定 HTML 比较 dev 与 #1076 的 390px toolbar 边界、menu 与 document scrollWidth；表格长词换行单独记录，不自动归咎 toolbar。 |

## 查询和证据边界

`/tmp/archify-round21-remote-heads.txt` 关键词 keyboard/traversal/source/reader/toolbar/overflow 返回上述两个 research heads，并有 `lab-source-question-tour@94d6a4d05bcc5c6bc86704692eef48b73fd53c25` 等不同内容例；分支名不是语义穷尽。读取当前 hub 的 `keyboard-current-artifacts.md`、`keyboard-draft-readiness.md`、round20 Kconfig 记录和两个实验 README，以及 GitHub 当前 PR 正文和 #1076 评论。

GitHub connector 分别以 `repo:tt-a1i/archify` 查询 open issues 和 open PR，`"keyboard" "traversal"` 命中 #1124 及实验 PR #1121–1123，`"source" "keyboard"` / `"browser-check" "keyboard"` 命中 #1076、#1124，`"explainer" "toolbar"` / `"explainer" "overflow"` 对应 #1068/#1076；再查 `"source-only" "keyboard"`、`"source-keyboard"`、`"preview nodes"`、`"keyboard traversal"`，未找到该研究分支的明确对应 PR。每项 top50，GitHub 搜索匹配 body 并非都相关，索引与数量均有限。原历史 Draft PR 的存在不授权新建 PR；用户要求仅远程分支。

本次未进行浏览器、测试、生成、代码修改、评论、PR 或发布；所有 pass 数为各作者已记录的历史证据，非当前重测。两种问题可以在同一内容页出现，关联不构成同一根因；应按 exact artifact 和各自 head 的证据分别判断。

归档澄清：上表 base.sha 来自本次 PR API 返回及作者历史基线，并非当前 dev HEAD。root 另行验证当前 dev 为 d5d97949，f9fc38cb 与其共同祖先是 500d4a65。

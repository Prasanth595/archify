# 两个阅读实验的恢复状态与 GitHub 排重

查询窗口：**2026-10-28T03:26:59Z–03:28:30Z**（台北 11:26–11:28）。本轮以 GitHub 分支 API、PR/issue API 和 compare API 为准；没有把本地 remote-tracking ref 当作最新事实。

结论：**本轮没有发现已合入或开放候选完整重复 Route alternative 或 Diff matches 的有界行为，也没有发现必须重做旧基线独立实验的源码变化。** 两个实验可以保留固定基线与原始证据身份，分别完成审查、真实浏览器证据和独立研究分支交付。这个判断不代表当前 dev 已获得两项能力，也不代替最终实验 head 的验证。

## 固定身份与基线变化

| 对象 | GitHub 实读身份 |
| --- | --- |
| 两实验固定基线 | [`e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/commit/e837dc4cb83042d2b6c596e039692e25ec62c2da)（10/26） |
| dev | [`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/commit/6ca6a5c84439b57ea22e0630fe306e1d91587a6e) |
| main | [`d6059331abbddb49bca380ff46dca8ce33158b04`](https://github.com/tt-a1i/archify/commit/d6059331abbddb49bca380ff46dca8ce33158b04) |

[旧基线 → 当前 dev 的 GitHub compare](https://github.com/tt-a1i/archify/compare/e837dc4cb83042d2b6c596e039692e25ec62c2da...6ca6a5c84439b57ea22e0630fe306e1d91587a6e)为 ahead 27 commits。相关净变化是：

- `viewer/route-probe.js`、`viewer/focus.js`、`viewer/template.source.html`、其他 Viewer JS 均未改变；`archify/explainer/diff.mjs`、`render.mjs`、`reader.js`、`reader.css` 也未改变。此结论来自 compare 的完整 changed-file 清单。
- Viewer 唯一 authored source 变化是 `viewer/viewer.css` 的默认关系标签颜色 token（[已合入 #1042](https://github.com/tt-a1i/archify/pull/1042)）；生成模板及示例随之更新。它没有增加另一条路径选择或 diff 文本匹配。旧截图只代表旧基线，不能被改称当前 dev 的颜色验收。
- [#1031](https://github.com/tt-a1i/archify/pull/1031)改进 `check-render-output.mjs` 的完整 SVG 扫描；[#1137](https://github.com/tt-a1i/archify/pull/1137)调整 Architecture 紧凑节点品牌标记居中；[#1138](https://github.com/tt-a1i/archify/pull/1138)更新 review readiness 与 ZIP 集成工具。它们没有实现两项实验行为。历史 check 回执仍归原 checker/基线；本轮未证明新 checker 对实验产物的结果，但没有据此认定原固定基线对照失效。

因此，若之后要求合入当前 dev，需要重新核对组合后的视觉、生成物与相关 gate；**当前独立旧基线研究分支交付不以先搬迁全部实验为前提**。

## 已查相关开放工作

以下 PR 的状态均为 OPEN；结论基于当时 head 的说明与 changed-file 清单。#1015 另检查了 reader/render patch。未运行这些候选或重建其浏览器证据。

| 对象与本轮 head | 与两实验的关系 |
| --- | --- |
| [#1027 移动 Viewer 导航与 dock](https://github.com/tt-a1i/archify/pull/1027) · `c393fc7fbc321d5b6c4685ca35cd612b75d64083` | 修 route probe 被导航遮挡等布局问题；触及 `viewer.css`、`focus.js`、chrome layout，未改 `route-probe.js`，不提供另一条等跳数路径。后续组合移动端布局时应复用该候选，不另造同一修复。 |
| [#1141 Architecture 关系源码证据](https://github.com/tt-a1i/archify/pull/1141) · `d6e5e71b79fa6cad3bb96482cc2a8b8a94071145` | 为关系增加可验证 sources，并通过 relationship inspection 展示；触及 focus/template，但不是替代路径搜索或 diff 删除/新增片段匹配。 |
| [#1119 Passport Task checklist](https://github.com/tt-a1i/archify/pull/1119) · `6979ce895ceca594ff90a9a5e7ef43b87514bfc0` | 节点任务清单的只读投影，邻接 focus/CSS/template；没有两项实验的行为。 |
| [#1015 Explainer focus/details](https://github.com/tt-a1i/archify/pull/1015) · `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8` | 有 `@source`/`@code` 的作者指定 focus 行、SourceCard 展开复制，触及同一 reader/render 文件；这不是同一 `@diff` 中 delete/add 连续片段 trim 后唯一匹配及两端跳转。将来合并时存在文件层面的组合工作，不能称功能重复。 |
| [#1049 Architecture Git-ref compare](https://github.com/tt-a1i/archify/pull/1049) · `7184b99b01768349840f93b4de83ff206d202c33` | 读两 ref 的已存在 Architecture JSON，再复用 Delta；没有文本 `@diff` 匹配，不做任意源码语义搬移判断。 |
| [#998 Code Analysis](https://github.com/tt-a1i/archify/pull/998) · `25b767c72e9463a89e9e89b696d26a52318189b3`；[#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103) · `f0be206acbc90eb7c6c6b636030e3eb28963d284` | 现有代码分析与文件/函数图、finding → Classic 源码往返。清单与 Atlas 说明未显示上述两项行为；没有把它们已占有的总览/源码导航方向重新列为空白。未作全实现正确性审计。 |
| [#1121 authored path/test associations](https://github.com/tt-a1i/archify/pull/1121) · `843c877b251baf89925f99e11594fc5630c1c165` | 仅独立 `experiments/task-flow-tests/`，作者编排路径与测试引用，不是从现有有向图发现另一条等跳数路径。 |
| [#1124 keyboard QA](https://github.com/tt-a1i/archify/pull/1124) · `3254fda4fcd61a101cc09e6b68fbdbb4d2779604` | 既有 bounded Tab traversal checker 候选，reader HTML/focus order 不变；它可供核查 checker 误报时参考，不能将历史失败回执改称已通过。 |

新议题还需保留两条语义边界：

- [#1139 connection direction](https://github.com/tt-a1i/archify/issues/1139)提出 `both` / `none` 并明确 Route/Reach 遍历语义尚待决定；已有贡献者认领调查，未表示维护者已批准字段或遍历规则。它与 Route 有邻接关系，但尚未替代当前基于既有有向边的实验。实验继续声明“图中另一条等跳数有向路径”，不解释成双向引用、真实流量、故障切换或最佳运行线路。
- [#1134 Workflow semantic compare](https://github.com/tt-a1i/archify/issues/1134)比较两份 Workflow 的稳定对象与语义变化；已有 staged investigation 认领。它不是 Diff matches 的连续文本唯一匹配，不能把文本相等宣称成 AST/语义移动检测。既有 [#816 graph-query availability](https://github.com/tt-a1i/archify/issues/816)也要求保留不可用图与零关系的区别，实验不能据缺失语义图捏造路径。

## 读取边界与交付含义

本轮查询了全部状态的最近 50 PR、最近 60 issues、最多 100 开放 PR，以及标题 route/diff 的全状态 PR 搜索和 issue 关键词搜索；对上表候选与 #1139/#1134/#816/#1026/#1068 做了额外读取。标题 diff 搜索成功返回空列表，只代表该搜索条件，没有据此声称仓库全历史不存在相同能力。

`git fetch origin dev main` 长时间无输出，主动终止，未将它记为成功；GitHub API compare 成功提供实际范围。一次 GraphQL 查询 EOF 后重试成功，失败没有算作“无重叠”。末次分支 API 在 03:28:28Z–03:28:30Z 仍返回上述 dev/main 身份。

本轮没有运行测试、PR 代码或第三方项目，没有刷新/重命名历史证据，没有评论、审批、合入、release、安装或推送。只新增本报告。两个实验的最终实现 head、功能验收、CI 和远程分支是否存在，应由各自交付回执另外证明。

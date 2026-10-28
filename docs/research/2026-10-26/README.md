# 2026-10-26 研究与实验索引

## 当前：用户明确继续，目标active

50项批次收尾后，用户明确说“继续吧”。最新[06:03 UTC GitHub核对](github-status-resumed.md)确认dev/main及重点PR heads未变。本轮深读[代码差异匹配](scouts/change-reading-resumed.md)、[图上局部结构](scouts/graph-local-structure.md)和[运行时引用图](scouts/runtime-code-reading.md)，不按星数筛选。

两个隔离实验 Diff matching blocks 和 Route alternative 已于10月28日完成独立审查、实际浏览器对照并推送，完整结果见[交付记录](../2026-10-28/README.md)。二者继续绑定10月26日 dev `e837dc4cb83042d2b6c596e039692e25ec62c2da`；最新GitHub状态另见[10月28日排重](../2026-10-28/resume-status.md)，没有将历史产物称为新dev验收。

Pympler已做独立受控生产链实测，但DOT对普通引号、反斜线及换行字符串的输出不够可靠。本批不做一个只能处理漂亮样例的DOT适配器；保存实际证据，JSON导出路线另行评估。

## 上一批：50项收尾记录

今日曾恢复持续探索，随后用户明确要求本批完成后暂停。第50项实验、研究报告和图片总览现已收齐；**停止启动新研究或实施，后续等待用户明确继续**。昨日49项暂停记录保留为历史。[历史主索引与全部50个已推实验](../2026-10-25/README.md)继续作为总账。本批完成不表示持续探索目标已完成。

本轮只读研究先给出0个已证实值得实施的新候选，图关系报告只保留一个可证伪的问题。协调者随后在现成Web App与RAG图上实际比较既有入口，才选定第50项Relation search；这是已有示例上的有界复现与实验选择，不是自然发生的用户痛点或效率收益证明。

| 本轮来源 | 结论与边界 |
| --- | --- |
| [GitHub状态](github-status.md) | dev推进至 `e837dc4cb83042d2b6c596e039692e25ec62c2da`；Atlas、移动阅读、输出介质、长描述等开放工作分别排重，不将draft或green CI当已集成 |
| [代码导航](scouts/code-navigation.md) | 同符号强调与位置历史预览的静态研究，0实施候选 |
| [图与关系检查](scouts/graph-inspection.md) | 保留“已知关系含义、不知端点”的待验证问题；静态索引缺项本身不是用户痛点 |
| [已知项目增量](scouts/named-project-refresh.md) | task-view未前进；PR Lens提交增量不自动构成新阅读功能；未执行或复制上游 |

## 第50项：Relation search

固定远端分支：[`codex/lab-relation-search`](https://github.com/tt-a1i/archify/tree/codex/lab-relation-search)，精确head `e87a858d220c25c97aee4b5920cf59ab77723b41`，基线 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。协调者报告远端精确一致且工作区clean、独立终审READY；[固定实验说明](https://github.com/tt-a1i/archify/blob/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/README.md)保留来源、测试、实际观察与失败边界。

![实际enqueue关系检索截图](https://raw.githubusercontent.com/tt-a1i/archify/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/screenshots/candidate-enqueue.png)

按关系label或ID直接查找，结果显示两端并调用已有精确pin。空查询仍浏览node，Route端点与受限入口保持node-only。root实际操作中，`enqueue`从base的0节点结果变为candidate的1关系；Enter精确pin `enqueue-job`。RAG的`ANN search`、`grounded answer`、`parsed text`分别选中既有精确关系ID；Route实际操作仍通过。base直接点线已可pin，因此这是新增查询入口，不是修复关系检查。root查看5张原始PNG，8份原始safe观察按实验记录绑定。

行为借鉴 `lambdasistemi/graph-browser` 的固定源码；该上游未见LICENSE，只借鉴行为、独立编写Archify代码，没有复制实现。

验证：Finder9、Focus/Route22、locale37、core19通过；Semantic5pass/1skip，generated与ZIP/macOS抽包smoke通过。主authored SVG与base均为29,943B，SHA-256 `902de0677920b4e320ea54061a998a7120286248c79999eeac2bd4eb49f4f8a8`，不推断运行时camera或像素相同。生成RAG HTML保留来自base模板的15条空白warning，其他源码scoped check通过，不能称full whitespace clean。无移动、真人AT、全平台或效率证据；精确head Actions runs=0、check-runs=0，不能称远端CI绿，也未合入、发布、部署或安装。

## 图片总览收尾

[50项图片总览](../2026-10-25/gallery/README.md)已生成，固定来源hub `f098176f8d642549acd9b699414df8adcf2c7b4d`，HTML SHA-256 `9056e0331cb90a21be6913f5fef8920a8fad9d095cda6c251b0d89d5d65b793b`。分组14产品交互、15离线适配、21内容示例。前49张原图及固定来源不变；旧49版浏览器证据另存，未挪用为本次观察。

静态构建、独立审查和root实际浏览器检查均已完成：四筛选、Relation search搜索、桌面完整原图/原始尺寸/Escape焦点返回、390px CSS视口深色卡片与空结果/reset。三张新截图已逐张查看；具体尺寸和观察JSON见gallery。一次只读GitHub远端核对确认50个分支head全部与manifest一致。未重跑全部实验，也未将0个远端检查称为通过。

本批已收尾，按用户要求暂停后续探索。保留当前远程分支、报告和图片供查看；不再启动后续研究或实现，等待明确继续。

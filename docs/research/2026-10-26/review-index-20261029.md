# 既有研究分支刷新 · 2026-10-29（第 60 批）

**继续只交付远程分支，不新建 PR。** 本批整理已有可审查成果，未新增方向或修改产品。三个产品候选的主要修复仍未被当前 dev 覆盖；既有图片与测试保留原来的版本和适用范围。

## 当前身份与可复现核对

[333 个远程 head](audit/round60-portfolio/remote-heads.tsv) 中，dev 为 `847146aeb93b492592adb78dc220f57e4a8b4636`。与第 59 批开始前的快照相比，只有研究总账分支推进至 ab4176d68；没有新增或删除远程分支。与第 27 批审查入口相比，七个选定实验中仅 task-flow-tests 的 head 改变。

[身份清单](audit/round60-portfolio/inventory.json) 记录七个分支的完整 head、共同祖先与提交差集，以及三个产品候选的手写源码／测试 blob、SHA-256。从仓库根运行：

```sh
python3 docs/research/2026-10-26/audit/round60-portfolio/reproduce.py
```

脚本读取固定 Git 对象，并对每个产品候选在独立临时 Git index 中执行 `git read-tree DEV` 和 `git apply --cached --check`。**三项静态补丁检查均 exit 0**；没有实际应用补丁、修改工作区或创建合并提交。检查排除生成 HTML、ZIP、gallery 和实验产物，因此不证明完整分支能无冲突合并或运行正确。

## 产品候选的审查顺序

| 顺序／远程分支 | 当前判断与实际检查 | 保留的边界 |
| --- | --- | --- |
| 1 · [源码链接名称](https://github.com/tt-a1i/archify/tree/dae900182d317d76620104e619d8fdfba7229315/experiments/source-link-context) · `codex/lab-source-link-context` | 修复同文件不同源码范围具有相同 AX 链接名称的问题。当前 dev 的 focus.js 和相关浏览器测试与第 27 批基线 d5 字节相同；仍只用 path＋revision 构造 aria-label。候选仅改该函数及对应浏览器测试。 | 旧英／中 UI、AX 与测试证据仍对应 dae90018；没有本批浏览器运行或当前 dev 集成验证。 |
| 2 · [键盘检查器](https://github.com/tt-a1i/archify/tree/3254fda4fcd61a101cc09e6b68fbdbb4d2779604/experiments/keyboard-traversal) · `codex/lab-keyboard-traversal` | 修复原生滚动停靠和动态链接使旧 Tab 预算提前结束的问题。当前 browser-check.mjs 及对应浏览器测试与 d5 字节相同；候选补丁仍可静态应用。 | 已有 Draft #1124 属于同一分支和同一 head，不创建平行 PR。d5 单模块对照不能改称 dev847 的完整集成运行。 |
| 3 · [Tree 结构角色](https://github.com/tt-a1i/archify/tree/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles) · `codex/lab-tree-roles` | 修复目录叶子因颜色被叫作 external system。当前 Tree 仍以 tone 填 Passport.kind。18 个手写源码／测试／locale 路径中只有 viewer.css 相比 d5 改变；该变化将 classic 网格隐藏规则限定到 SVG 的 data-preset。候选这 18 个路径的补丁仍可静态应用。 | raw kind、搜索和 Story 元数据的兼容面较大。六份 examples/locales 是手写行为输入，已纳入检查。旧图片和 80 项聚焦测试不代表当前 CSS、生成模板和 ZIP 的组合验证。 |

这仍是三个候选之间的审查顺序，依据为已复现问题、改动范围与维护成本；没有新增用户收益或真人验收结论。源码链接与 Tree 分支均落后 dev 82 个 ancestry 提交，键盘分支落后 88 个；数量不是行为变更数量，具体对象差异以清单为准。

## 相邻工作与重复范围

[GitHub 派生快照](audit/round60-portfolio/github-snapshot.json) 保留查询、返回总数、标题／状态、四个 PR 的 head／base、相关文件与选定补丁。检索不是全库穷举：宽泛的 source link PR 查询有 389 条，仅返回前 20 条；其余 aria-label issue、keyboard traversal PR、tree roles PR 查询分别返回 5、7、5 条。

- [#1141](https://github.com/tt-a1i/archify/pull/1141) @ a70337e84d2b43ae98fd53e79cb9d80d1133bf08 扩展同一个 renderSourceEvidence 函数，让关系也能显示源码。其 focus.js 补丁改变来源选择和关系调用，没有补入链接名／行范围。它和源码链接候选并非同一修复，但共享消费者与测试文件；若日后组合，应覆盖 node 和 relationship 两条路径。这是补丁阅读结论，本批未运行或完整审查该 PR。
- [#1147](https://github.com/tt-a1i/archify/pull/1147) @ 28d3612d7ae9f4e2acb0bd3e03d9fc7b00af1d23 修改 GitHub Markdown 行链接目标，与 AX 名称不同。
- [#1142](https://github.com/tt-a1i/archify/pull/1142) @ bd782b46c4f4f8d5c947e7f5638d30d34fe4989f 增加作者声明的 answer→evidence 关联，与链接可访问名称、键盘遍历和 Tree 结构角色不同。
- [#1124](https://github.com/tt-a1i/archify/pull/1124) 返回状态仍为 Draft，head 与键盘实验相同；目标分支名是 dev，但该 API 响应的 base SHA 为 500d4a65，与本批远程 heads 快照的 dev847 不一致。不同响应为何存在这个差异未核实。本批静态检查明确冻结 dev847，不能混用这两个 SHA，也不能把 PR API 的 base 字段当成本批最新远程 head。

以上是排重与受影响路径核对，不是对贡献者代码的接受或驳回。未评论、编辑、关闭或重新创建任何 PR。

## task-view 和其余内容实验

task-flow-tests 当前是 [7b2a7ba3c976fc132379c79fa4182dbcdb6b0671](https://github.com/tt-a1i/archify/tree/7b2a7ba3c976fc132379c79fa4182dbcdb6b0671/experiments/task-flow-tests)。相对旧入口 843c877b，增加了[第 45 批原前端对照](https://github.com/tt-a1i/archify/blob/7b2a7ba3c976fc132379c79fa4182dbcdb6b0671/experiments/task-flow-tests/upstream-frontend/README.md)。它用已归档事实和作者投影夹具比较路径作用范围，有真实截图；不是 task-view CLI、Git/schema 校验或历史测试运行。已有 projector、flows 和 final/review.html 保持原样。本批没有重跑该前端。

Kconfig、task-occurrences、source-question-tour 的远程 head 与[第 27 批入口](review-index-20261028.md)相同，继续复用该页的产物、来源许可和限制，不据此重开分支。

## 本批验证

三份手写补丁静态检查、Git blob／文件哈希、七个 head、文档链接和快照一致性已核对。没有新增产品行为，依照 CONTRIBUTING 的文档证据范围，没有重跑 renderer、浏览器、完整测试、CI 或 ZIP；没有生成新图片。既有真实图片、HTML、可复现示例与上游署名均留在各实验分支。

初次定位 task-view 补充时尝试 native-comparison/README.md，Git 明确返回不存在；随后依实际 README 使用 upstream-frontend/README.md，未把失败定位当作缺少对照证据。

## 第 63 批补充：键盘候选增加新页面证据

上文第 60 批身份与结果保持冻结。键盘分支现推进到 `5e1320b202eb7052411805590ac73a15fad741dc`，产品 checker 与 ZIP 没有变化；[SQLite 新作者产物迁移验证](scouts/sqlite-keyboard-transfer-round63.md)在固定 dev5ec 临时运行时中仅换入既有 checker，四态 43/43、零诊断，真实 Tab trap 仍失败。完整 HTML、两张键盘操作实拍与正负例结果已入原分支；仍不代表完整合并、打包或全面可访问性验收。

## 第 64 批补充：task-view 原生验证

task-flow-tests 现为 `784a8377210298707357f28ad6ae391c874fe8e1`，新增[实际 CLI 对照](scouts/task-view-native-cli-round64.md)。公开格式投影经一次保留首稿的修正后，正常引用与 diff 检查通过，越界对照失败；原生 HTML 与实拍已归档。原 Archify 产物不变，历史测试仍未执行。

## 第 65 批补充：同题阅读边界

task-flow-tests 推进到 `bb5f42f1a5df7105b1b0617ffb8e63c295f50498`，新增[独立阅读证据](scouts/task-view-reading-probe-round65.md)。两位 Agent 各读一种页面，三题均正确；原生 notes／源码已有充分证据，不能据此宣称 Archify 优势或两者等效。保留小 sidecar，未增加产品实现。原始回答、三图、操作记录和方法限制在原分支，无新 PR。

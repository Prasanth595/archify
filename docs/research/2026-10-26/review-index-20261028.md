# 七个研究分支的审查入口 · 2026-10-28

先看源码链接名称修复，再看键盘检查器和 Tree 结构角色。这是三个产品候选之间的复查顺序，依据是缺陷证据、改动范围和兼容成本，不是合并建议。其余四项属于内容实验，价值仍需具体读者任务验证。**后续只交付远程分支，不新建 PR。**

本索引覆盖选定的七个既有分支，并非全部研究成果排名。已刷新 [316 个远程 head](audit/remote-branches-round27.txt)；`dev` 为 `d5d979493bba650b3995836afd379cd249f2d0dd`，七个实验 head 均未变化。完整 SHA、共同祖先、相对改动清单、所选产物的 Git blob／SHA-256 见 [身份清单](audit/round27-branch-inventory.json)。下方是固定提交的文件链接，完整 HTML 可下载后打开。

## 三个产品候选

| 候选与固定入口 | 已证实的问题、改动及成本 | 现有证据与下一步审查重点 |
| --- | --- | --- |
| **1. 源码链接名称** · `codex/lab-source-link-context` · [dae90018](https://github.com/tt-a1i/archify/tree/dae900182d317d76620104e619d8fdfba7229315/experiments/source-link-context) | 同文件的两个范围链接拥有不同可见文字，但旧 AX 名称相同。补入已有标签和行范围。手写产品改动仅 `viewer/focus.js`，另加真实 AX 回归；大量其他文件是生成物与证据。 | d5 负例、候选 3 项与相关 7 项浏览器测试、英／中实际键盘和 AX 记录、生成物校验均有历史记录。与当前 dev 同基线；优先核名字与目标是否一致。没有真人读屏、完整套件或 hosted head CI 结论。[验证](https://github.com/tt-a1i/archify/blob/dae900182d317d76620104e619d8fdfba7229315/experiments/source-link-context/validation.json) · [完整页面](https://github.com/tt-a1i/archify/blob/dae900182d317d76620104e619d8fdfba7229315/experiments/source-link-context/artifacts/candidate-en.html) |
| **2. 键盘检查器** · `codex/lab-keyboard-traversal` · [3254fda4](https://github.com/tt-a1i/archify/tree/3254fda4fcd61a101cc09e6b68fbdbb4d2779604/experiments/keyboard-traversal) | 初始目标数＋3 的预算漏算原生滚动停靠与动态链接，导致本可到达的页尾被判失败。改动一个 Explainer checker 与对应测试；终止条件影响检查可信度，审查成本高于文字修复。 | 同一 Kconfig HTML 在 d5 报 28/52 条诊断；仅替换既有 checker 后四臂均达 42/42、55/55 目标，真正 trap 仍失败。分支缺当前 dev 的 6 个提交；该对照是 238 文件运行时中只替换一文件，不能称 Git 集成或最终包通过。[完整对照与复现](https://github.com/tt-a1i/archify/blob/3254fda4fcd61a101cc09e6b68fbdbb4d2779604/experiments/keyboard-traversal/kconfig-transfer-d5/README.md) |
| **3. Tree 结构角色** · `codex/lab-tree-roles` · [a15fbd6e](https://github.com/tt-a1i/archify/tree/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles) | 目录树叶子曾因配色自动被叫作 external system。候选以根／分支／叶子描述结构，保留图形布局。涉及 Tree、Passport、Lens、样式及双份六语言输入，兼容面明显更大。 | 固定 31 节点输入、成对 UI／AX、80 项聚焦测试、19 项 core、生成校验和 canonical ZIP 记录；与 d5 同基线。旧 Lens URL／旧文案覆盖已有专项修正，但 raw kind、搜索词和 Story 元数据有意变化，仍要逐消费者判断。[最终检查](https://github.com/tt-a1i/archify/blob/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles/evidence/final-checks.json) · [完整页面](https://github.com/tt-a1i/archify/blob/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles/candidate/repository.html) |

[独立源码审阅](audit/round27-runtime-review.md)确认三个核心改动均未被当前 dev 覆盖。源码链接与 Tree 都会刷新共享模板／ZIP，分开通过不证明组合后通过；生成物文件重叠也不自动代表语义冲突。此轮没有重跑这些测试、重建包或集成分支。

下图是源分支已有的真实浏览器产物，未在本轮重拍；源码链接的差异主要由 AX 记录证明，图片之间相机状态不同，不能作像素对照。

![源码链接候选的已有桌面产物](https://raw.githubusercontent.com/tt-a1i/archify/dae900182d317d76620104e619d8fdfba7229315/experiments/source-link-context/screenshots/candidate-en-desktop.png)

![Tree 候选的已有叶子 Passport 产物](https://raw.githubusercontent.com/tt-a1i/archify/a15fbd6e6b68df387bdf37f0c155509d3c3242ad/experiments/tree-roles/root-review/candidate-leaf-paired.png)

## 四个内容实验

这些分支均只增加各自 `experiments/` 目录内的内容、生成／核对脚本和证据。完整产物与来源许可可审查；没有共享 runtime 功能，也没有读者收益证明。不要因为页面可打开就推断适合增加自动分析器。

| 实验与固定入口 | 能回答的有界问题与原生对照 | 仍需保留的限制 |
| --- | --- | --- |
| **用户提到的 task-view** · `codex/lab-task-flow-tests` · [843c877b](https://github.com/tt-a1i/archify/tree/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests) | 哪一步显式关联了哪份测试源码？完整原 mapping ＋小 sidecar，未关联、已知但未分配均明确显示。灵感固定为 gtindo/task-view f27b8bef；MIT 与 vendored ELK EPL-2.0 分开记录，未引入其 runtime。[完整页面](https://github.com/tt-a1i/archify/blob/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests/final/review.html) | 关联由作者声明，历史测试未执行。9 项是 projector 检查；原浏览器门保留 16 条失败。后续旧 checker 候选对同一 HTML 达 40/40、零诊断，但不是当前 d5 集成验证。分支缺 dev 的 24 个提交。[专项复核](audit/round27-task-flow-review.md) |
| **Kconfig imply** · `codex/lab-kconfig-imply-reading` · [6cf0b813](https://github.com/tt-a1i/archify/tree/6cf0b8138ced63f7a991d4c2c621e3f3dd2cce2f/experiments/kconfig-imply-reading) | 同一个 implier 为什么使一个目标为 n、另一个为 y？完整 145 行 ISC fixture、26 个实测值、三个原生 formatter 输出和 config，两页都保留完整证据。[原生证据页](https://github.com/tt-a1i/archify/blob/6cf0b8138ced63f7a991d4c2c621e3f3dd2cce2f/experiments/kconfig-imply-reading/artifacts/native-baseline.html) · [解释页](https://github.com/tt-a1i/archify/blob/6cf0b8138ced63f7a991d4c2c621e3f3dd2cce2f/experiments/kconfig-imply-reading/artifacts/comparison.html) | 原门的 28/52 条失败与上表 checker 对照分别保留；窄屏工具栏／表格折行问题仍在。调用了原生 formatter，但没有交互式 menuconfig 对比。维护两份页面及完整上游证据的成本需计入。[验证](https://github.com/tt-a1i/archify/blob/6cf0b8138ced63f7a991d4c2c621e3f3dd2cce2f/experiments/kconfig-imply-reading/VALIDATION.md) |
| **Task occurrences** · `codex/lab-task-occurrences` · [caffb4aa](https://github.com/tt-a1i/archify/tree/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences) | 11 个打印位置中，哪两个父项共享同一 `:compileJava` 身份？保留完整八文件 fixture 与带 legend 的原生 expected 树，另做位置→身份映射。[解释页](https://github.com/tt-a1i/archify/blob/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences/output/explanation.html) | 没运行 Gradle；位置不等于执行次数。原生图门通过，Explainer 仍记录 16 条键盘诊断。旧图本来已有 legend，新增说明可能一句话就够；维护 mapping 的成本不应被忽略。[证据摘要](https://github.com/tt-a1i/archify/blob/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences/portable-summary.json) |
| **Source question tour** · `codex/lab-source-question-tour` · [94d6a4d0](https://github.com/tt-a1i/archify/tree/94d6a4d05bcc5c6bc86704692eef48b73fd53c25/experiments/source-question-tour) | 同样五段、72 行固定源码，按文件或按问题编排，解释 SourceCard 身份和 Escape。[文件顺序](https://github.com/tt-a1i/archify/blob/94d6a4d05bcc5c6bc86704692eef48b73fd53c25/experiments/source-question-tour/file-first.html) · [问题顺序](https://github.com/tt-a1i/archify/blob/94d6a4d05bcc5c6bc86704692eef48b73fd53c25/experiments/source-question-tour/question-first.html) | 源码固定在旧 82c7，不能当现行产品说明。静态三门有记录，浏览器 gate 未运行；有限实际 hover／Escape 观察独立保留。两臂交互编排有差异，未证明编排方式提升理解速度。适合作为文档 demo，暂不扩成 tour 功能。 |

[独立内容审阅](audit/round27-content-review.md)在其审查的三项中，先看 Kconfig 的原生实测对照，再看位置／身份，最后看源码编排；该顺序没有把尚未观察的读者收益数值化。四项各有完整 HTML、实际 PNG、输入和复现入口；这不等于最新 CI、可访问性验收或生产采用。

![Kconfig 解释页已有的实际桌面截图](https://raw.githubusercontent.com/tt-a1i/archify/6cf0b8138ced63f7a991d4c2c621e3f3dd2cce2f/experiments/kconfig-imply-reading/evidence/browser/final-comparison-desktop.png)

## 本轮新增筛选与核对

[变异测试结果阅读](scouts/mutation-reading-round27.md)没有通过新增 reader 的门槛：历史研究已经核对完整 Stryker report 与原生源码／变异／测试关联视图。新自然问题涉及报告覆盖归属与手工施加变异的测试结果冲突；需要同一源码、runner、完整运行记录等独立证据，重画同一报告不能验证 producer 是否正确。本轮不运行或安装 mutation engine，也不新增实验分支。

[开放 issue／PR 关键词快照](audit/round27-dedup.json)保留 12 个按类型修正后的查询；每类最多 10 条，Tree／mutation 命中被截断，不能称全库穷举。既有 #1124、#1121 归属仍可见；没有修改或新建 PR。最初六次未指定 issue/PR 类型的 API 请求均返回 422，也保留原因。

本轮验证只覆盖身份清单、文档固定链接、产物存在和哈希、复制一致性、独立内容复查与 `git diff --check`。没有浏览器重拍、runtime 测试、性能测量、CI 重跑、合并、发布或安装。验证结果见 [本轮记录](audit/round27-validation.json)。

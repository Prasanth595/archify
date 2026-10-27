# Stacked branches：声明的依赖与 squash 后状态

2026-10-28，只读研究。**结论：defer；拒绝通用 Git DAG 图或堆栈自动同步器。** 固定上游测试提供完整可核验的四分支例子，且 git-machete 原生 `status -l`、检测模式和 `traverse` 已经回答该例的操作问题。剩余问题是能否让接手者解释为什么相同堆栈在不同 squash 检测模式下分别显示 merged / out-of-sync，而不是宣称两个状态互相矛盾；尚无该问题的实际误读或完整自然现场证据。

## 查重

检索当前 `docs/research/2026-10-26/scouts` 和 `origin/codex/research-lab-20261025@60342aa9e40618aeb7c33bdb8d65889fea3a588e` 中 Git Machete、Git Town、stacked branch、branch dependency 等 Markdown 关键词，以及 `/tmp/archify-round15-remote-heads.txt`，无同名命中。既有 `git-graph-reading-round6` 已研究 parents、lane 与 merge；`git-history-reading` 和 `bisect-reading` 已研究 bisect 状态。此次只研究**人为声明的分支依赖、检测模式与祖先关系的区别**，不重复通用 DAG；名称搜索不能证明语义穷尽。

## 完整上游 fixture 和原生强基线

[git-machete 测试 `test_status_squashed_branch_recognized_as_merged_with_traverse`](https://github.com/VirtusLab/git-machete/blob/9578cc2a38d5dbca3c0551857802b28bfb1255ee/tests/test_status.py#L304-L465)，HEAD 固定 `9578cc2a38d5dbca3c0551857802b28bfb1255ee`；[MIT 许可](https://github.com/VirtusLab/git-machete/blob/9578cc2a38d5dbca3c0551857802b28bfb1255ee/LICENSE)。这是阅读已提交测试的断言，**未执行测试**：

1. 初始化远端后依次建立并 push `root`→`develop`→`feature`→`child`；feature 有 `feature_1`, `feature_2`，child 有 `child_1`, `child_2`。独立的 `.git/machete` layout 按这个顺序缩进声明父子。初始 `status -l` 显示各自 commit 和 `o-feature`、`o-child`。
2. 在 develop 执行 `git merge --squash feature` 后 commit `squash_feature`，切回 child。默认检测的预期 `status -l` 在 develop 下列 `squash_feature`、`(ahead of origin)`，以 `m-feature` 标 merged，仍列 `child_1`, `child_2` 和 `o-child`。同一状态以 `--squash-merge-detection=none` 输出 `feature_1`, `feature_2` 和 `x-feature`（out of sync）。因为 squash 新建提交，内容合并判定与 feature tip 是否作为祖先可达不是同一问题；layout 边也不是 commit parent 边。
3. 测试接着运行 `traverse -w -y`，预期 feature 从 layout 滑出、child 在 develop 下且保留两个 child commit；随后还测试上游 squash 和 fetch-traverse。此处仅引用断言，不把测试的自动确认视作用户应执行的操作。

官方 [status 文档](https://git-machete.readthedocs.io/en/latest/#status) 说 `simple`（默认）比较树，`exact` 比较 patch 且可能显著变慢，`none` 不检测 squash/rebase；该模式也影响 traverse 是否建议 slide-out。`status -l` 原生展示声明树、独有 commits 和状态，但单看状态符号不能自行知道检测模式；最强基线应附所用命令、配置和文档。官方 [fork-point --explain 文档](https://git-machete.readthedocs.io/en/latest/#fork-point) 明确 reflog 推断和覆盖，已可解释某些分叉点并提示推断限制；不能把它当所有历史或 PR 原因的保证。文档是滚动版本，测试断言固定 SHA。

## 自然用户困惑与边界

[Git Town issue #4222](https://github.com/git-town/git-town/issues/4222) 中提交者以本地 `feature` squash 到 main 后疑惑 `sync --all` 不删除分支；维护者解释该例依据远端 tracking branch 是否删除，而非内容是否已进入 main，提交者确认先前误以为检查内容。这是真实明确误解，有简短复现命令；它不是上方四层 fixture，也没有给出完整堆叠图和该例完整状态输出，不能合并成同一实测。Git Town [固定源码](https://github.com/git-town/git-town/tree/d0cc7951b01e74ba36ba057c0f31fd5eee6e83b8) 和 [MIT 许可](https://github.com/git-town/git-town/blob/d0cc7951b01e74ba36ba057c0f31fd5eee6e83b8/LICENSE)；issue 是 2024 年自然记录，其行为不能未经版本验证推广到当前 HEAD。Git Town 的 `branch` 展示分支层级，`status` 是悬停命令状态而非 machete 的 status；不能混同两工具。

## 后续所需证据、成本和停止条件

具体下一步是收集一次可公开的完整真实现场：layout/parent 配置、带 parents 的所有 relevant commit、远端追踪 ref 和抓取时点、squash 前后原始 `status -l`（含命令及检测配置）及用户对 `m`/`x` 首次解释。将其与原生完整状态、模式说明、`fork-point --explain` 对照；如果原生材料直接解释歧义，或问题只来自缺失的配置/远端刷新，则不制作图。任何内容相同、patch 检测或图中边不得自称原始 Git parent 或唯一因果；输出状态也不保证安全 rebase。

维护成本是保存和脱敏 refs/reflogs、source SHA 与状态配置、对不同检测模式的性能和误识别核验、逐版本更新语义，以及对照原生命令。临时合成 Git 探针只能独立验证 Git squash 不保留原提交祖先，与上游测试的检测/状态断言不同，不能证明该工具实际输出或自然困惑；本轮未执行此探针、安装工具、写用户 Git、改仓库或发布。


## 本轮后续原生验证

以上为初步只读判断。随后在不安装依赖、不接触用户仓库的条件下，运行固定git-machete源码并保留[三次分开的合成原生记录](../audit/round15-stack-native/README.md)：默认m-feature，none为x-feature，root还核对tree相同而feature不是develop祖先。没有复现上游测试的remote状态、traverse或Git Town自然问题。完整原生结果支持原有模式解释，未发现需要新增图才能回答的缺口。

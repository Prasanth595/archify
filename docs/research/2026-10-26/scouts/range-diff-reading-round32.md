# 修订复审：patch 配对不是提交身份

2026-10-29。本批完成原生 Git 对照，暂缓新增 range-diff parser、配对图或已读状态迁移。它与既有 Git parent 图、git-machete 堆栈状态和单个 diff 内的文本块匹配不同；但当前完整小例中的重排、修改及增删已由原生 range-diff 清楚呈现，尚未形成需要 Archify 专用实现的额外阅读任务。

## 原生实际观察

[完整观察包](../audit/round32-range-diff-native/README.md)使用本机 **Git 2.50.1 (Apple Git-155)**，在两个全新临时仓库分别执行同一原创脚本。每次71条命令，保留完整输入快照、提交身份、原始输出字节、退出码和时间。没有操作用户仓库、安装Git、执行fixture中的应用代码或运行上游测试。

旧系列为 retry、logging、note；新系列把 logging 移到第一项，把 retry 值从3改为4，移除 note、加入 metrics。另一个控制提交只改 retry 的 commit message，保留完全相同的源码树。

| 阅读问题 | 本轮实际证据 | 能得出的结论 |
| --- | --- | --- |
| logging 的 `2 → 1 =` 是否意味着同一提交／完整快照？ | 配对为 `fc8783c32657` → `84365c61c8cc`；祖先检查退出1。旧 logging 快照中的 retry 为3，新 logging 快照为1。 | 该配对没有保留提交身份，也不证明完整代码快照相同。两边各自的 logging patch 相同。 |
| retry 的 `!` 代表什么？ | 默认输出把 `ad6fcd172ffc` → `67fb4164d5ff` 配对，内层diff展示3→4。 | 此处确有patch修改；旧1→新2是两侧系列序号，不能当parent边。 |
| `!` 是否一定表示代码变化？ | message控制输出为 `!` 且只显示说明文字变化；两树 `git diff --exit-code` 退出0、输出为空。 | 这个标记也涵盖提交元数据变化；不能直接等同“源码已改”。 |
| 配对是否稳定不变？ | 相同两组提交，在 `--creation-factor=0` 下，retry由 `!` 配对变为一条 `<` 和一条 `>`，logging仍为 `=`。 | 参数影响解释方式；不能把配对边当永久identity。0是特意选取的边界控制，不是推荐日常参数。 |
| 普通tip diff是否足够？ | 完整tip diff显示note删除、metrics新增和retry变化，没有单列logging重排。 | tip diff与range-diff回答的问题不同；应保留两者及完整parent记录。 |

两个仓库的8个提交SHA相同，11类关键命令的stdout/stderr共22份流逐字相同。完整transcript的时间和init目录不相同，未声称全部日志字节相同。这里是构造复现，不是用户自然事故、真实rebase操作或阅读提速实验。

## 上游依据与维护成本

固定参考是 [git/git v2.50.1](https://github.com/git/git/tree/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044)。[range-diff文档](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/Documentation/git-range-diff.adoc)描述patch系列比较、匹配成本和输出稳定性限制；[实现](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/range-diff.c)先识别精确patch匹配，再进行成本分配。[上游测试](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/t/t3206-range-diff.sh#L201-L211)覆盖重排，另有message-only测试；本批只读，未运行或复制测试。Apple Git的版本字符串不证明其二进制完全对应这个上游提交。

Git项目版权与许可见固定 [COPYING](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/COPYING)（GPL v2）。本批归档的是独立编写的fixture、脚本及本机命令输出，没有把上游实现或fixture复制到Archify产品。来源文件的固定Git blob见观察包的source-identities.json。

原生命令已经提供具体阅读答案，维护一个跨Git版本的文本parser并不划算。已有Explainer可在需要交接时保留完整原文、commit SHA、base和参数，并用普通表说明差别；当前不为重复这些信息新增页面或schema。若未来有明确的跨修订复审任务，可以比较内容对照，不要求先发生生产事故，但不能自动把旧提交的勾选迁移到启发式匹配的新提交。

## 去重与交付边界

开始前检查 [329个远程head](../audit/round32-remote-heads.tsv)：相对31批只更新本研究分支，没有新增实验。两个研究hub的已检索资料未命中range-diff；已有stacked-branch、bisect、diff-matches及checklist-progress保留各自范围。

[GitHub检索记录](../audit/round32-dedup.json)中，range-diff issue查询0条，PR广义查询94条，不能称无PR命中；进一步限定title/body只返回#804，其范围是viewport文档。interdiff的issue/PR查询均0条。这是有界排重，不是全历史语义证明。没有修改其他贡献者分支、创建PR、合并、发布或安装。

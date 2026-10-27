# 合并 DAG 的 bisect 阅读：原生视图与状态边界

2026-10-28。结论：**暂缓图形实现**。可检验的问题是：在含 merge 的 bisect 中，读者能否正确区分“Git 实际标记的 good/bad/skip”“当前显示的拓扑”和“终止时可能的 first bad”，特别是不会把 skip 当 good 或 bad、也不会把所有显示节点当作被测试的候选？原生输出已提供强基线；目前没有读者试验，不能断言 Archify 有增益。

## 查重和来源

当前 [git-history-reading](git-history-reading.md) 已研究四节点线性 skip 候选与原生终止列表，并建议低优先级对照实验；此处仅补 merge DAG 和原生 visualize 的实际边界。远端 `origin/codex/research-lab-20261025` 在 `60342aa9e40618aeb7c33bdb8d65889fea3a588e`，其 [git-graph-reading-round6](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/git-graph-reading-round6.md) 已覆盖有序 parent、图形 lane 和 merge，不重复提出通用 Git 图。当前 docs/research 还包含 commit selection/reachability 等研究；本问题只涉及 bisect 观测与显示，不声称因果或导入器需求。关键词查重不能证明穷尽。

官方 Git [固定 v2.51.0 文档](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/Documentation/git-bisect.adoc) 描述 `visualize` 在图形环境使用 gitk、否则使用 git log，skip 邻近目标可造成歧义，`--first-parent` 改变 merge 搜索范围。Git 官方 [固定源码许可](https://github.com/git/git/blob/c44beea485f0f2feaf460e2ac87fdd5608d63cf0/COPYING) 为 GPL-2.0；此处不复制代码或引入依赖。下面是本机 Apple Git 2.50.1 的合成实验，不是该固定版本的执行、真实用户记录或 GUI 观察。

## 可复现小型实验

只在新建临时目录执行；无真实文件、真实测试或工作树 checkout。空树 commit 的内容刻意相同，状态由命令指定，不能证明实际引入 bug。固定身份与日期：B 和 C 的父均为 A，M 的第一/第二父为 B/C，D 的父为 M：

```sh
D=$(mktemp -d /tmp/archify-bisect.XXXXXX); cd "$D"
git init -q
export GIT_AUTHOR_NAME=Fixture GIT_AUTHOR_EMAIL=fixture@example.invalid GIT_COMMITTER_NAME=Fixture GIT_COMMITTER_EMAIL=fixture@example.invalid GIT_AUTHOR_DATE='2001-01-01T00:00:00Z' GIT_COMMITTER_DATE='2001-01-01T00:00:00Z'
T=$(git mktree </dev/null)
A=$(echo A | git commit-tree "$T")
B=$(echo B | git commit-tree "$T" -p "$A")
C=$(echo C | git commit-tree "$T" -p "$A")
M=$(echo M | git commit-tree "$T" -p "$B" -p "$C")
D1=$(echo D | git commit-tree "$T" -p "$M")
git update-ref refs/heads/main "$D1"
git symbolic-ref HEAD refs/heads/main
git log --all --graph --format='%h %s parents=%p'
git bisect start --no-checkout "$D1" "$A"
git bisect skip "$B" "$C"
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --graph --format='%h %s parents=%p'
git bisect log
git bisect bad "$M" # exits 2: expected ambiguity
git bisect log
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --graph --format='%h %s parents=%p'
git bisect reset
git bisect start --no-checkout --first-parent "$D1" "$A"
env -u DISPLAY -u SECURITYSESSIONID -u SESSIONNAME -u MSYSTEM GIT_PAGER=cat git bisect visualize --graph --format='%h %s parents=%p'
git bisect reset
```

本次 A `d0ecc67`, B `6eba258`, C `506377f`, M `759253c`, D `1c1d70f`。开始 A good / D bad，skip B 和 C 后，原生 visualize 的文本图列出 D、M、C、B；log 明示 A/D 状态及两项 skip。标 M bad 后，终止输出列 C、B、M 为可能 first bad、退出码 2；log 同样有三条 possible first bad。此处 M 已标 bad 仍是候选，B/C skipped 并不因此成为已测 bad。第二次 `--first-parent` 起始状态下，visualize 的文本图依然显示侧支 C，即使官方选项说搜索只跟随第一父；所以不可仅凭这一图的行数推断实际搜索范围。该对照未测试 gitk GUI，也未逐步执行 first-parent 至终止；不把文本表现推广到其他版本或 GUI。

## 可能的验证及成本

若以后有真实阅读需求，用同一个完整 merge fixture 的原生 `bisect log`、完整终止输出、`visualize --graph` 和 parents 作为文本基线，对照附状态图与说明的材料。让独立读者回答：哪些状态是显式观测、哪些是最终可能结果、M 是否一定根因、first-parent 改变什么；记录正确率、时间与误解。图必须证明额外价值，并显式区分状态、显示节点、候选和搜索选项。原生优势是零新依赖、真实 Git 输出、可 replay 的 log 和 gitk；成本包括采集命令/版本、两臂材料维护、真实读者样本以及防止将边界和结果静态化。当前仅有合成 fixture，未测 gitk、用户任务或阅读效果；不建议实现自动解析器、模拟器或产品功能。

### 追加：原生 first-parent 显示参数

同一 Apple Git 2.50.1、同一 fixture 的 first-parent 起始状态，再运行 `git bisect visualize --first-parent --oneline --graph`，输出为：

```text
* 1c1d70f D
* 759253c M
* 6eba258 B
```

`git rev-list --first-parent --oneline "$D1" --not "$A"` 同样按 D、M、B 顺序列出这三项，侧支 C 被隐藏。因此本例中原生 visualize 可通过显式传参呈现与该 first-parent revision 范围相同的节点；默认 visualize 的侧支显示不足以构成新增可视化需求。这只验证此合成起始状态，不推广到 skip、路径限制、其他拓扑或所有 Git 版本；列出范围也不等于这些节点均已测试或最终候选。GUI 未实测。原始脚本、stdout/stderr、身份说明和独立可复现脚本见 [原生证据归档](../audit/round12-bisect-native/README.md)。两份原始采集来自不同临时仓库，但五个完整commit ID一致；不声称同一连续会话。

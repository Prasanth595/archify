# 第31批远程覆盖刷新

在继续新方向前读取 [329 个远程 head](round31-remote-heads.tsv)，并完成 `git fetch origin`。相比第30批开头319个head，新增以下10个实验。另一个研究总账已推进到 [`3beb343b`](https://github.com/tt-a1i/archify/blob/3beb343b8fd6686201bde9b0f307f9a1c6b00246/docs/research/2026-10-28/README.md)；不能继续把它当作旧的49项覆盖。下表依据固定README的范围说明，保存查询身份；本批没有复跑这些实验或逐张审图，不能将其原有测试陈述冒称本批验收。

| 已有远程分支 | 固定提交／阅读入口 | 避免重复的范围 |
| --- | --- | --- |
| `codex/lab-route-alternative` | [d61217d8](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/README.md) | 第二条等跳数有向路线；不是枚举全部路线或故障切换。 |
| `codex/lab-diff-matches` | [a8456ef7](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/README.md) | 删除与新增文本块双向定位；不推断语义移动。 |
| `codex/lab-diff-file-navigation` | [48f076f9](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/README.md) | 完整多文件 diff 的文件目录与返回入口。 |
| `codex/lab-shared-reach` | [b160b948](https://github.com/tt-a1i/archify/blob/b160b948541f541394457fec3005e2d10b281dea/experiments/shared-reach/README.md) | 共同上下游集合与每侧路径见证；非因果或故障诊断。 |
| `codex/lab-mandatory-paths` | [f79704cb](https://github.com/tt-a1i/archify/blob/f79704cb63f1577246752c93f8d648a000ea978b/experiments/mandatory-paths/README.md) | 两端点间必经内部点及绕行见证；不等于系统单点故障。 |
| `codex/lab-cycle-region` | [d0709713](https://github.com/tt-a1i/archify/blob/d07097138c96dd34ecbfde09d19861b645b19818/experiments/cycle-region/README.md) | 单点所在循环区域与内部／跨区关系；不等于一条简单环。 |
| `codex/lab-refactoring-records` | [bec86714](https://github.com/tt-a1i/archify/blob/bec8671465ff9ce6a2c471196907fc741f52dc53/experiments/refactoring-records/README.md) | 已有重构报告的声明与位置 occurrence 投影；不运行检测器。 |
| `codex/lab-profile-contexts` | [58935179](https://github.com/tt-a1i/archify/blob/589351790b32173269f6a8e22da836130e31989a/experiments/profile-contexts/README.md) | 递归调用上下文与函数总计；不混加同函数不同上下文。 |
| `codex/lab-profile-normalization` | [b3c85c96](https://github.com/tt-a1i/archify/blob/b3c85c9656212a4ba83430844603334132f120a9/experiments/profile-normalization/README.md) | 归一化差值的完整算术来源；不宣称性能改善。 |
| `codex/lab-checklist-progress` | [7d1f2fe4](https://github.com/tt-a1i/archify/blob/7d1f2fe40c6fe7bd50e81aa1bcab6c2135c116e5/experiments/checklist-progress/README.md) | task-view 启发的 JSON 显式ID清单身份修复；个人勾选不是审批。 |

其中 route-alternative 的 README 首段保留了早期 remote pending 字样，本次 ls-remote 已独立确认表中精确 head 存在；这只证明分支交付，不证明合入或测试通过。当前 dev 已到 `847146aeb93b492592adb78dc220f57e4a8b4636`，第一父链新增 #1131（piped receipt）、#1117（SVG grid）与 #1086（Workflow routing）三个合入。既有实验继续绑定各自旧基线，不在本批隐式 rebase、重建或把旧绿灯重标为当前 dev 结果。

Soufflé / Datalog 在 Archify 的 issue 与 PR 分开查询，共4个全状态关键词查询均为0；[查询及README身份](round31-dedup.json)保留原始响应内容与SHA。最初缺少 `is:issue`/`is:pull-request` 的查询返回422，修正后才计结果。0条只覆盖这些关键词；新hub全部 research 文本的 Git grep 也未命中 Soufflé / Datalog，不等于全仓语义穷举。旧 Lean、SWISH、SQL lineage、依赖求解及来源身份研究仍是相邻边界。

本批选择补齐 [Soufflé 原生输出合同](../scouts/souffle-proof-reading-round31.md) 的来源核查。已有原生功能可以回答当前fixture问题，暂缓新增实现；不会为增加实验计数重做这10项或把同一说明换成新图。只有研究记录进入本研究分支，无新PR、合并、发布或安装。

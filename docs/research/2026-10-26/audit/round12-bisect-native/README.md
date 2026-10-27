# Git bisect 原生阅读证据

这是一个空树提交构造的合成 fixture，状态由命令声明；没有真实项目测试或真实 bug。结构：B/C 的父是 A，M 的第一/第二父是 B/C，D 的父是 M。Git 官方固定文档及 GPL-2.0 许可见 [研究笔记](../../scouts/bisect-reading.md)；此处 shell 编排由本批独立编写，未复制 Git 实现。

- [原始 fixture 脚本](fixture.sh)、[stdout](fixture-stdout.txt)、[stderr](fixture-stderr.txt)：普通搜索、skip B/C、标记 M bad、终止候选及默认 first-parent 视图。
- [原始追加探针](probe.sh)、[stdout](stdout.txt)、[stderr](stderr.txt)：在另一个同身份 fixture 仓库上比较显式 first-parent 视图和 revision 范围。原脚本有固定临时路径，作为历史记录保存，不作为可移植入口。
- [独立可复现脚本](reproduce.sh)：把两个阶段合在新建临时 SHA-1 仓库内，明确打印 Git 版本。[root 再运行 stdout](root-reproduce.stdout)、[stderr](root-reproduce.stderr)、[退出码](root-reproduce.exit)保留不变。
- [清单](manifest.json)：9份原始文件的 SHA/字节数、脚本身份、结果与范围。

在已有 Git 的环境，从仓库根目录运行：

```sh
sh docs/research/2026-10-26/audit/round12-bisect-native/reproduce.sh
```

脚本只在新建临时仓库写入和 bisect，保留该目录用于检查，结束时执行 bisect reset。空树不需要项目 checkout 或依赖安装。原始两份脚本和日志来自不同临时目录，其五个完整 commit ID 一致；不称同一连续会话。

实际 Apple Git 2.50.1 (Apple Git-155)：整体脚本 exit 0，stderr 为空；中间 `git bisect bad M` 按预期 exit 2，候选为 C/B/M；显式 first-parent 视图与 revision 查询同为 D/M/B。范围匹配不等于每个节点已被测试，也不等于最终候选；本次没有 GUI、真实读者或其他 Git 版本结论。原生文字图尾部空格按字节保留。

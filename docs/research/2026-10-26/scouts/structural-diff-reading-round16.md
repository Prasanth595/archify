# 结构化源码 diff：方法提取中的移动证据，暂缓实验

2026-10-28，只读。**结论 defer。** 具体阅读问题：在 `printOwing` 提取 `printDetails` 的同一变更里，两条打印调用出现在何处？哪些原始字节还另有变化？这能区分跨方法的文本对应与相邻真实修改，但不能由匹配证明重构行为等价。找到真实上游问题及完整代码对；已找到 GumTree 提交的同示例原生截图，它把两处相同语句可视化关联；没有同 pair 的固定版本完整 Difftastic 输出或 GumTree action golden，现不能证明 Archify 比原生工具带来额外阅读价值。

## 先排重

历史 [adjacent-discovery-round2](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/adjacent-discovery-round2.md) 已筛 Difftastic；[round18-structural-diff](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round18-structural-diff-reading.md) 已研究语法过滤、同一行多个声明和 move/rename 匹配，明确禁止把匹配动作当语义等价，且示例缺对应动作 golden。检索本轮 scouts 和 `/tmp/archify-round16-remote-heads.txt`；[diff-line-numbers](https://github.com/tt-a1i/archify/tree/codex/lab-diff-line-numbers/experiments/diff-line-numbers) 修行号折行，不做结构匹配；[static-uses](https://github.com/tt-a1i/archify/tree/codex/lab-static-uses/experiments/static-uses) 是单一 source 的静态 use-chain，并非两版本 edit mapping。检索范围不是所有未公开工作。

## 完整问题输入及其证据级别

[Difftastic issue #999](https://github.com/Wilfred/difftastic/issues/999)（2026-06-23，查询时 open）给出完整 old/new Java 类，归因样例来自 GumTree。old 的 `printOwing` 直接打印 `name` 和 `outstanding`（输出标签为 `amount:`）；new 把两条相同的 `System.out.println` 语句写入新增 `printDetails`，原处调用 `printDetails()`。同时 banner 字符串从 `---` 改为 `***`，评论标点也改变；因此不是“全部未变”。这是 issue 中完整类文本，不是本轮从 revision 抽取的文件或上游 native output。作者称 Difftastic 将两条打印显示为删除及新方法为添加，还错误匹配括号；同时对 diffsitter 输出不确定。这里转述使用者报告，不把其描述提升为本轮复跑、正确性结论或有版本标记的完整日志。此 pair 是公开最小重构示例，不声称自然生产改动。

[Wilfred/difftastic@0b92338c6042152b1fc91c30ed01cf0449070844](https://github.com/Wilfred/difftastic/tree/0b92338c6042152b1fc91c30ed01cf0449070844) 为 2026-10-26 默认分支，项目 [MIT](https://github.com/Wilfred/difftastic/blob/0b92338c6042152b1fc91c30ed01cf0449070844/LICENSE)，依赖 grammar 另核许可；它不是 issue 作者使用的可确认版本。[官方说明](https://difftastic.wilfred.me.uk/introduction.html) 说明比较语法树、标识格式换行中保留的语法、未知格式及大型输入可回退到行 diff；[tricky cases](https://difftastic.wilfred.me.uk/tricky_cases.html) 还明确 parse errors 的 fallback。它不是 AST 语义或行为证明。

[GumTree@6e9a863940d6805aa9455b97f404b43390e8079e](https://github.com/GumTreeDiff/gumtree/tree/6e9a863940d6805aa9455b97f404b43390e8079e) 为 2026-10-23 默认分支，[LGPL-3.0 许可正文](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/LICENSE)。[README](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/README.md) 描述语法对齐 edit actions、move/rename 和原生交互 diff；它是比普通文本 diff 更强的必选基线，但其固定 [README 原生截图 screenshot-2.png](https://github.com/GumTreeDiff/gumtree/blob/6e9a863940d6805aa9455b97f404b43390e8079e/doc/screenshots/screenshot-2.png)（2157×1458，SHA-256 `a0193ed003864b6e23489949654305bc6452fb9b35300de8143076a5733b2dab`）直接展示相同 AccountManager 示例文本：左侧两条 println 与右侧新方法内相应两条均为紫色；新增方法和调用为绿色，banner 改动另突出。图例未展开，不能仅据颜色断言 action 类型或匹配算法、版本/参数，也不能把截图说成本轮运行。截图提供强原生阅读基线；树中未发现同名 ExtractMethod 原始文件或同 pair 的 action golden，图中文字与 issue 对照不证明字节完全相同。

## 价值判断与可证伪下一步

若做内容页，必须先固定 issue 的完整原文两类及精确字节、工具版本、Java parser/matcher 和完整原生报告：同一 pair 并列 GumTree 原生 action/交互视图和 Difftastic 完整输出，分别定位两条语句、旧新位置、方法调用、字符串变化以及工具未匹配处。若两种输出同样支持该问题，额外图没有明确必要；若原生缺失但一份作者标注的源码对照可核这两条相同文本，它最多提供**作者确认的文本对应**，不冒充工具原始 move、函数调用轨迹、编译通过、整体行为保持或实际重构意图。比较应保留原生全部输出和局限，而不是退化成单纯 unified diff。

维护方面，一次固定引用与对照的成本有限，但把 move/rename 建成一般功能，需要负责语言 parser、节点匹配配置、重复语句歧义、跨文件/修订身份及非等价变换；当前没有证据支持这些职责。现阶段未安装、运行、截图、修改产品或提交。下一步的确切缺口是**针对同一完整 pair 的固定版本机器动作与 Difftastic 完整输出**，而非为凑新名词重复既有结构差异实验。

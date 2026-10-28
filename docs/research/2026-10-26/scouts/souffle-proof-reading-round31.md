# Soufflé：证明树中的叶子不一定是成立事实

2026-10-28。本批暂缓新增 Archify importer 或证明阅读器。Soufflé 已提供有界证明树、子证明展开、规则文本及 JSON 导出；一个完整上游小例可以直接用这些原生材料回答“哪些事实和规则支持结果”。新增图仍可作为未来内容实验，但目前未找到值得维护专用输入合同的额外阅读任务。此结论来自源码与完整 fixture 核查，**未运行 Soufflé，也未观察其原生 UI**。

## 范围与来源

- 固定引擎源码 [souffle-lang/souffle@f53dab8bf4bbf2395a26d2771f6b75395825cc46](https://github.com/souffle-lang/souffle/tree/f53dab8bf4bbf2395a26d2771f6b75395825cc46)，不是本机已安装版本。`command -v souffle` 无结果；没有安装或编译。
- [官方 Provenance 文档](https://souffle-lang.github.io/provenance)描述最小高度证明、深度限制与交互式否定解释。文档网站 master 读取为 `95fe314b75412e452863b77dbec0f89b05b49fec`，没有证明在线页面部署与该提交相同。
- [自然请求 #608](https://github.com/souffle-lang/souffle/issues/608)需要离线 JSON 输出。维护者提供 command 文件及 `format json` / `output`，请求者确认满足需要；后来另一位使用者的调用困惑也在讨论中解决。不能只看最初请求就称该能力缺失。
- [#2187](https://github.com/souffle-lang/souffle/issues/2187)与 [#2521](https://github.com/souffle-lang/souffle/issues/2521)报告 ADT 证明支持问题。前者涉及真实分析工具，后者含完整小复现与崩溃文本但未提供可辨版本号；本批没有复现，也没有把一个上游引擎缺口转换成 Archify 责任。

完整输入、命令、expected、四份源码与两份 UPL 许可保存在[来源包](../audit/round31-souffle-source/README.md)。17 个文件均与固定 Git tree 的 blob SHA 相同；来源包含 The Souffle Developers、Oracle 署名，原始版权头和许可未删减。issue 代码和讨论只链接，不复制进公共 fixture。

## 已核实的输出边界

1. `path_explain_output` 的完整三边输入及 `explain path("a", "d")` 对应一份可解析 expected JSON：3 个规则应用、3 个叶子、2 个不同规则定义。它是仓库预期文件，不是本轮运行结果；不代表枚举了所有推导，也不是执行时间线。
2. `Explain.h` 默认深度为4。`ExplainProvenanceImpl.h` 在非事实且达到深度限制时创建文字为 `subproof ...` 的 `LeafNode`；`ExplainTree.h` 对所有 `LeafNode` 都输出 `axiom` 字段。因此 JSON 字段名本身不足以判定这个叶子是输入事实，不能把折叠边界涂成“已证实”。这是固定源码的直接控制流推导，未构造运行结果冒充实测。
3. 完整 `path_explain_negation` 命令先选规则2，再给中间变量值 `"b"`。expected 同时显示 `edge("a", "b")` 成立和 `path("b", "3")` 失败。`explainNegation()` 也把这些带标记条件包装为 `LeafNode`。它解释一次规则／变量选择下的失败条件，不能被扩大为所有规则、所有绑定的完整否定证明。
4. `Explain.h` 的 JSON 输出是每次 `printTree` 写出一个独立对象。多次 explain 的输出流没有外层数组；导入器不能默认整份文件就是一个 JSON document。这里未实际执行多查询输出。
5. 当前 `SubproofGenerator.cpp` 对 head 中 `BranchInit` 仍有 TODO/assert 分支。该源码位置证明特定代码路径未实现，不证明所有 ADT 用法都必然以 #2521 的同一错误失败。建立泛化的图形适配器还需处理数据类型、错误叶子、深度／子证明身份和多查询 framing，维护成本高于画一棵树。

上述可核位置：固定 [Explain.h](https://github.com/souffle-lang/souffle/blob/f53dab8bf4bbf2395a26d2771f6b75395825cc46/src/include/souffle/provenance/Explain.h#L429-L448)、[ExplainTree.h](https://github.com/souffle-lang/souffle/blob/f53dab8bf4bbf2395a26d2771f6b75395825cc46/src/include/souffle/provenance/ExplainTree.h#L220-L224)、[ExplainProvenanceImpl.h](https://github.com/souffle-lang/souffle/blob/f53dab8bf4bbf2395a26d2771f6b75395825cc46/src/include/souffle/provenance/ExplainProvenanceImpl.h#L93-L121)、[否定条件叶子](https://github.com/souffle-lang/souffle/blob/f53dab8bf4bbf2395a26d2771f6b75395825cc46/src/include/souffle/provenance/ExplainProvenanceImpl.h#L408-L482)、[ADT 分支](https://github.com/souffle-lang/souffle/blob/f53dab8bf4bbf2395a26d2771f6b75395825cc46/src/ast2ram/provenance/SubproofGenerator.cpp#L224-L242)。

## 对 Archify 的判断

价值：面向分析规则作者，区分输入事实、规则应用、被折叠的证明与失败条件，有具体意义。现有 Explainer 的 code/table/source 已能人工并列原始输出与这种说明；没有证据要求共享 schema、引擎集成或第二套图查询系统。

成本：一个仅处理当前6节点 expected 的转图器很便宜，但它会掩盖上面的类型与完整性边界。先解决来源合同再做通用适配的成本不合理；当前小例的原生 ASCII/JSON 已足够核对，不为换版式新建分支。

影响：本批只保存研究与来源核查，无产品改动、图片、运行时测试、阅读效率结论或 PR。未来若出现明确的离线交接任务，可用完整输出和明确记录的 query/depth/选择/版本做一次内容对照；不以必须发生生产事故或先证明人类提速作为实验前提。

[本批排重记录](../audit/round31-coverage.md)还补齐另外一个研究分支新增的10项实验；尤其 task-view 清单身份、共享可达、必经点与循环区域均已有独立远程交付，后续不重复实现。

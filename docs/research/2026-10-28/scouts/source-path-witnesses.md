# 源码路径见证：提供的分析路径不等于运行路径

2026-10-28，有界只读研究。**本轮建议 0 个新实验。** SARIF 的位置序列确有阅读价值：可以回答“工具给出的说明经过哪些源码区段、顺序是什么、同一文件/行为什么出现多次”。但 source→sink 逐步阅读已有专用 reader；目前找到的完整 scanner 快照很小、单文件，另有一个保留的 CodeQL 输出缺少产生它的源码 revision。仅把 JSON 变成另一张图，不能补齐这些事实，也不足以抵消新格式、路径语义和维护成本。

本轮未执行/安装 Semgrep、CodeQL、扩展或其他上游，未做漏洞利用、漏洞真实性判定、浏览器验收、产品修改、commit/push。下载原文在内存中解析读取；持久变更只有本报告。测试源码和提交的快照是上游材料，非本轮运行通过。项目选择基于具体 producer/输出/reader，不以 stars 排序或设置门槛；ToB 的专用 reader 和 Microsoft 教程库都因机制而纳入。

## 排重和当前 Archify 边界

已逐项读取 [55 项 manifest](../../2026-10-25/gallery/manifest.json) 的 id/value，并读本批 [source-navigation-next](source-navigation-next.md)、[call-sequence-reading](call-sequence-reading.md)、[structural-changes-next](structural-changes-next.md) 及本批目录。区别如下：

| 既有实验 | 本问题的区别与重复边界 |
| --- | --- |
| Dependency map、Static uses | 已有模块依赖/静态 uses；本问题是**某一个结果明确输出的有序位置 occurrence**，不能从全图再求最短路替代。 |
| Trace waterfall | 真实采集的时间区间；分析器的 threadFlow 没有因此获得运行时间或实际执行证明。 |
| Test context/failure | 测试 context 或失败阶段与源码定位；不是分析器提供的传播说明路径。 |
| Source question/CLI tours、Line notes | 作者导览与源码往返已有能力；仅给路径步骤加源码卡不算新方向。 |
| Task/notebook occurrences、Lasso witness | 重复位置身份/形式见证已有实验；不能换成安全分析术语就重复这些内容。 |
| Segment origins | source-map 查询偏置选择来源段；这里是给定序列的位置，不推算 token 来源，也不补每字符映射。 |
| Shared reach、Mandatory paths | 在已提供完整有向图上求图论答案；threadFlow 只是一条/几条工具说明路径，不能证明必经、完整可达集或所有真实执行。 |
| Structural changes / RefactoringMiner | 是版本间实体变化；本报告不重复第 56 项，也不把某次 call/taint 路径当重构记录。 |

产品比较固定 [dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/tree/6ca6a5c84439b57ea22e0630fe306e1d91587a6e)。2026-10-28 通过 GitHub API 刷新以下 PR：均 open、未 merge。

- [#998](https://github.com/tt-a1i/archify/pull/998)，head `25b767c72e9463a89e9e89b696d26a52318189b3`，base dev：Code analysis 独立分支，不是 dev 已发布能力。
- [#1103](https://github.com/tt-a1i/archify/pull/1103)，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`，base labs/code-analysis：Atlas 是文件依赖/函数测量的概览，Classic 承接证据；PR 明说不提取函数调用图。它不是 SARIF path reader。
- [#1141](https://github.com/tt-a1i/archify/pull/1141)，head `30196a0be2aae32c6dc032e6b55e9cc0b8bab263`，base dev：关系级 sources、固定 revision 验证与 Passport 入口；不再推荐“给边附源码”。路径中出现位置与“这条架构关系成立”仍是不同声明。

补查 `repo:tt-a1i/archify SARIF in:title,body` 返回 0 项。这个窄词查询不是已证明没有重复 issue；上述已知在审范围仍计入判断。未代作者确认其自报测试或 UI 成果。

## 四个固定一手来源

许可根文本已完整读取，不只采用 API 的 SPDX 名称；本报告仅引用机制和固定链接，不复制实现、图片或完整 fixture 到产品中。

| 来源与固定 SHA | 读取内容、许可和取舍 |
| --- | --- |
| [semgrep/semgrep `087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b`](https://github.com/semgrep/semgrep/tree/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b) | [LGPL-2.1 全文](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/LICENSE)，26526B。深读 SARIF formatter 的 path 生成段、完整规则/目标/输出与测试调用。可读明确数据，不引入 scanner。 |
| [trailofbits/vscode-sarif-explorer `306ae29b3a4efa5d388ef72f4da9e2eb1167da40`](https://github.com/trailofbits/vscode-sarif-explorer/tree/306ae29b3a4efa5d388ef72f4da9e2eb1167da40) | [GPL-3.0 全文](https://github.com/trailofbits/vscode-sarif-explorer/blob/306ae29b3a4efa5d388ef72f4da9e2eb1167da40/LICENSE)，35149B。读 parser、Result、详情 Data Flow、README 和完整 CodeQL fixture；原 reader 已能跳代码区段。GPL 实现不复制到 Archify。 |
| [github/codeql `fd2bfc8a3da9c73a0c8be05d110efaf14a856445`](https://github.com/github/codeql/tree/fd2bfc8a3da9c73a0c8be05d110efaf14a856445) | [MIT 全文](https://github.com/github/codeql/blob/fd2bfc8a3da9c73a0c8be05d110efaf14a856445/LICENSE)，1074B。完整读对应 path-problem query，解释 source/sink/path 字段含义；不声称当前 query SHA 产生了历史 fixture。CodeQL CLI 的许可与此查询库分开，本轮未安装/审阅 CLI 包。 |
| [microsoft/sarif-tutorials `819b0f62f47ecde9a8f24dfc387c41926f5edabe`](https://github.com/microsoft/sarif-tutorials/tree/819b0f62f47ecde9a8f24dfc387c41926f5edabe) | [文档 CC-BY-4.0](https://github.com/microsoft/sarif-tutorials/blob/819b0f62f47ecde9a8f24dfc387c41926f5edabe/LICENSE) / [代码 MIT](https://github.com/microsoft/sarif-tutorials/blob/819b0f62f47ecde9a8f24dfc387c41926f5edabe/LICENSE-CODE) 全文。完整读 CodeFlows 与 bad-eval-with-code-flow 示例；用作格式反例，**手写教程不是 scanner 运行链**。 |

## 链一：Semgrep producer → 完整 SARIF 快照 → occurrence reader

固定 producer [Sarif_output.ml L328–405](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/src/osemgrep/reporting/Sarif_output.ml#L328-L405) 把 source、intermediate vars、sink call trace 按顺序接到 thread-flow locations；[L430–431](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/src/osemgrep/reporting/Sarif_output.ml#L430-L431) 只有启用 show_dataflow_traces 才提供 codeFlows。Python [sarif.py](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/src/semgrep/formatter/sarif.py) 是向 OCaml RPC 转交的 wrapper；不能只从 wrapper 猜具体序列。

完整输入是 [taint.yaml](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/rules/taint.yaml) 和 [taint.py](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/targets/taint/taint.py)。完整 [test_sarif_output_with_dataflow_traces L309–321](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/test_output_sarif.py#L309-L321) 明确这两份输入、SARIF、`--dataflow-traces`、登录测试上下文和 snapshot filename。其[完整 results.sarif](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/snapshots/test_output_sarif/test_sarif_output_with_dataflow_traces/results.sarif) 共 1 run、1 result、1 codeFlow、1 threadFlow、4 locations，均在 `targets/taint/taint.py`：

| occurrence，按数组位置 | 原位置，列范围 end exclusive | 原角色/内容 |
| --- | --- | --- |
| 0 | 3:9–18 | Source `source1()` |
| 1 | 3:5–6 | Propagator `a` |
| 2 | 8:9–10 | Propagator `b` |
| 3 | 9:5–13 | Taint reaches `sink1(b)` |

**独立可核 oracle：** 无需 scanner，完整九行源码可逐字核对四个 region 的内容与列范围；JSON 直接可核四个位置、原顺序、前三项 nestingLevel=0、末项=1。第 0/1 项虽然同 file/line，列范围、角色和 occurrence 不同；按行去重会丢记录。它没有两个完全相同 region 的重复 occurrence，不能声称已覆盖该场景。输入有 `if True` 与 else；快照的 line8 在 else 内，故更不能把这个静态说明路径叫作该 Python 的实际执行轨迹。这个 oracle 验位置和输出账目，不验证引擎语义或漏洞真实。

ToB [sarifFile.ts L208–225](https://github.com/trailofbits/vscode-sarif-explorer/blob/306ae29b3a4efa5d388ef72f4da9e2eb1167da40/src/webviewSrc/sarifFile/sarifFile.ts#L208-L225) 逐项 push 位置和消息，保留本快照四个 occurrence；[resultDetailsWidget.ts L318–331](https://github.com/trailofbits/vscode-sarif-explorer/blob/306ae29b3a4efa5d388ef72f4da9e2eb1167da40/src/webviewSrc/result/resultDetailsWidget.ts#L318-L331) 将其显示为 Source、中间步骤编号、Sink，点击调用 [Result.openCodeRegion](https://github.com/trailofbits/vscode-sarif-explorer/blob/306ae29b3a4efa5d388ef72f4da9e2eb1167da40/src/webviewSrc/result/result.ts#L209-L215)。这是固定代码可追的 producer→snapshot→reader 合同链；**本轮没有实际把 Semgrep 快照加载进扩展**，跨项目兼容是源码推断，不能写成运行成功。

相对于原 reader，Archify 可离线分享一个来源说明页是可能收益；SourceCard 本来就能展示固定源码范围，列表→代码跳转也已有专用工具。四个单文件步骤没有暴露需要另一种布局才能回答的问题，暂不立 adapter。

## 链二：CodeQL path-problem → 保留输出 → 同仓 reader

[IncorrectIntegerConversionQuery.ql](https://github.com/github/codeql/blob/fd2bfc8a3da9c73a0c8be05d110efaf14a856445/go/ql/src/Security/CWE-681/IncorrectIntegerConversionQuery.ql) 明确 `@kind path-problem`、id `go/incorrect-integer-conversion`、导入 `Flow::PathGraph`，以 flowPath(source,sink) 选择 sinkConverted、source、sink；这是 producer 查询角色的证据。

ToB 仓内[完整 codeql.sarif](https://github.com/trailofbits/vscode-sarif-explorer/blob/306ae29b3a4efa5d388ef72f4da9e2eb1167da40/src/test/sarif_files/codeql.sarif) 标识 producer CodeQL 2.10.0，同一 ruleId，1 result / 1 codeFlow / 1 threadFlow / 2 locations：`gjson.go` 1928:2–45 的 uint64 值，接 1929:9–16 的 type conversion。primary location 是第二项；relatedLocations id=1 又引用第一项。这两次引用不能算额外执行步骤。reader 使用上一节同一 parser/详情组件，原生按两个位置跳源码；README 的 [Browse Results](https://github.com/trailofbits/vscode-sarif-explorer/blob/306ae29b3a4efa5d388ef72f4da9e2eb1167da40/README.md#browse-results) 明确提供 dataflow 浏览。

**独立 oracle 和 provenance 缺口必须分开：** 完整 JSON 能独立核对数量、顺序、两种引用角色；reader 数组遍历能核对不去重。fixture 没有 versionControlProvenance，未提供 `gjson.go` 的固定 Git revision/完整内容。本轮当前 query SHA 也不是 fixture 声明的 CodeQL 2.10.0 发布时查询 revision。因此这条是“producer 身份/规则→保留输出→reader”的真实记录消费链，**不是固定输入重新生成的闭环，也没有源码文本 oracle**。不能把它包装成第二个可重放实测或用今天的 query 解释历史引擎所有细节。这个缺口足以否决拿它直接制作一个宣称源码已验证的 Archify 示例。

两条都没有跨文件 location：本轮未拿到满足全部条件的跨文件 scanner fixture，不构造跨文件故事补齐结论。实际跨文件时，caller、callee、source、sink 各角色也应来自记录或明确作者解释，不能凭文件夹归属推断。

## 两个反例为何没有转成新候选

**JSON 的测试名不是路径存在证据。** 完整 [test_json_output_with_dataflow_traces/results.json](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/snapshots/test_output/test_json_output_with_dataflow_traces/results.json) 只有 811B，结果内无 `dataflow_trace`，`lines` 为 `requires login`。[测试调用 L377–389](https://github.com/semgrep/semgrep/blob/087e93b3a1fdf44f97bc92b5b9c2ba221cb2488b/cli/tests/default/e2e/test_output.py#L377-L389) 虽确实传了 `--dataflow-traces`，仍不能把路径补出来。缺失原因不由本轮猜测，展示时只能记录“此输入没有提供”。

**reader 取第一条，不代表完整 SARIF 只有一条。** ToB parser 明确只用 codeFlows[0]/threadFlows[0]；官方完整 [CodeFlows.sarif](https://github.com/microsoft/sarif-tutorials/blob/819b0f62f47ecde9a8f24dfc387c41926f5edabe/samples/CodeFlows.sarif)，7470B，包含两个 threadFlows：`collections/list.h` 15→18→25 与 15→22→25。它是可手工核的格式 oracle：只展示第一个就没展示 line22 这条分支。源码推断可证明消费者的覆盖限制，尚未运行该 fixture；教程手写数据不是两次实际执行，也不能仅按数组放置顺序推断两个 thread 的全局先后关系。

这给未来 reader 一个明确的保真约束，但不足以单独启动 Archify 工作：要覆盖多 flow/thread、location index 引用、URI base、未知 region、角色与 nesting，成本已经超过一个四节点“格式转图”；而“显示全部输入路径”的结构账目可先在现有 reader 内完成，不必新建安全分析平台。

## 原始材料账目和以后重新打开的条件

以下是本轮完整下载并解析的原始文件；路径和 SHA 固定链接在上文。hash 是输入身份证明，非工具执行回执。

| 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| Semgrep taint.py | 163 | `1091fa7d40ecfcba7e4c34f3e2154d339855330d21a2859d6a5bc61f3605faba` |
| Semgrep taint.yaml | 429 | `4ccd70f7e7cde8836792a3347b850e4f065f3b33dac13608f522b4153a1ca70e` |
| Semgrep SARIF snapshot | 6614 | `e56bbc86a088bbf196979098a932ed4abe70d81ddef749bd28078c449fe366db` |
| ToB codeql.sarif | 66175 | `bb381b91733f5d44be154c172b1a5a143e6d83aa6e1fe41168f4b6bc445d4b35` |
| ToB result.ts | 9912 | `0825dc1749d730b8db0a97c097ef0deb157264cdcbd27a4f47feeffa865f6dbf` |
| ToB resultDetailsWidget.ts | 16286 | `7bb7bcf6564d62079fe5f95929a025c8f25b9aed83bc7db80381cba4cc75d054` |

零实施不是要求先提供真实用户失败。若以后找到完整公开的跨文件/重复位置路径、固定输入 revision 和独立 region 文本 oracle，可只考虑**一个离线的逐 occurrence 路径阅读比较**：消费提供的记录，不运行分析器；保留 run/result/codeFlow/threadFlow/location 索引，文件/列/消息原值，原始总账和未能展示项。未知角色、缺源码或版本、引用无法解开必须明确记账，不补推理边或自动判真假。无需设计通用 SARIF 平台，也不扩 shared schema。

重新打开前最小比较应展示：相同完整输入在原 reader 与 Archify 中如何选中第二条路径、区分同一行两个位置、返回原记录和固定源码；如果现有列表与源码卡已足够就继续 0。若实施，需保存真实浏览器图文（同输入、同选中项、桌面/窄屏和主题），核对每个 occurrence/每条路径能访问、未知项可见、无去重/跨 thread 连边；截图证明呈现和操作，阅读效率收益另测。本轮无新截图、无浏览器操作、无上游执行，也没有此类收益实测。

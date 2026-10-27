# 线性化历史：原生解释能力与未完成操作

2026-10-27。**结论：不重复新建实验；已有 operation-order 已回答同一三操作失败问题并做过文字/图对照。** 新增可核实缺口是：Knossos 同仓库有一份包含未完成操作的完整公开历史，README 给出相同文件和 `false` 结果；可作为将来验证「原始记录与未完成状态是否被忠实保留」的输入。但目前没有与之绑定的原生图输出、实际用户阅读任务或优势证据，先不复制已有实验或扩展 checker/importer。本文仅阅读来源，没有运行第三方程序、制作图、测试读者或宣称自然事故。

## 排重与现有结果

历史中心固定 `60342aa9e40618aeb7c33bdb8d65889fea3a588e` 的 concurrency、model-witness、traces、round15-behavior、graph 与 gallery/manifest 已检查：已有锁/等待、trace 区间、模型 witness 等相邻工作，但这些各有语义。[现有 scout](operation-history-reading.md) 已专门研究 Porcupine 的完整三操作反例与线性化约束；[operation-order @ bc6cb7cd](https://github.com/tt-a1i/archify/tree/bc6cb7cde3d11b2f9e3fe65035cc04829e5f2194/experiments/operation-order) 已做同内容文字与约束环对照，说明实际校验、截图和局限。它未测读者理解收益；图版多了阅读长度与文件体积，作者选择保留研究分支。不要把本调研再包装成新的三节点图候选。[交接复核](reading-handoff-followup.md) 也明确指出其短环并不证明需要新增关系导航。

## 最强原生对照：Porcupine

[Porcupine README @ 97cd067](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/README.md#visualizing-histories)，[MIT 许可](https://github.com/anishathalye/porcupine/blob/97cd067defd99df172053ba7f4ca5bbae57fe446/LICENSE.md)：上游提供按 partition 的完整历史、完整或最长部分线性化、模型不允许的候选点，以及 hover 查看选中路径下的前后模型状态和调用/返回时间，点击可固定选择；还有作者提供的[交互页面](https://anishathalye.github.io/porcupine/demo-annotations.html)。此处是文档所述能力，未实际操作页面，也未证明页面对应下方 Knossos fixture。其 verbose checker 数据是视图的输入，不是由仅有的 true/false 自动还原全部解释。它是本轮找到最完整的原生基线：做某次检查的深度调试，优先使用它；Archify 有潜力将少数来源、模型和解释纳入可分享叙事，但这只是待验证的任务假设，代价是维护内容与证据绑定，不能把静态图等同于 checker 导出。

真实先后与线性化必须分开：A 的返回早于 B 调用时必须 A < B；重叠不指定谁先。某一合法顺序或线性化点是模型下的解释，非被观察到的内部执行点或唯一因果。失败时部分路径和非法候选不自动构成最小反例，也不代表唯一原因。事件序号不等于 wall-clock 时长；测量时钟或采集不准确可能导致假冲突，上游 README 明示采样注意事项。已完成历史本身和一个最终结果不必然足以恢复 checker 的路径、状态或理由。

## 具体剩余 fixture：未完成与 false 分层

[Knossos @ 14ead19 的完整 `bad-analysis.edn`](https://github.com/jepsen-io/knossos/blob/14ead19fb3d24745429e367c8ae9779e147ff6cb/data/cas-register/bad/bad-analysis.edn) 共 16 个事件：process 6 的 read 和 process 20 的 write 各有 invoke 而无 completion，其余操作成对；文件注释称二者 pending/crashed。它不含墙钟时间，因此只能按文件事件次序表达先后，不能画有比例的真实持续时间。[同一固定 README](https://github.com/jepsen-io/knossos/blob/14ead19fb3d24745429e367c8ae9779e147ff6cb/README.md#quickly) 展示对这个文件用 nil 初态 CAS register 的命令及 `false`；这是上游文档示例，不是本次运行的结果或机器可核验的执行回执。上游作者明确说其结果需要人工核对。仓库 [project.clj 声明 EPL-1.0](https://github.com/jepsen-io/knossos/blob/14ead19fb3d24745429e367c8ae9779e147ff6cb/project.clj)，[许可正文](https://www.eclipse.org/legal/epl-v10.html)；本轮仅链接来源，没有复制文件。未找到固定 fixture 对应的完整 native 可视化与 checker 版本/运行回执，也不把其与 Porcupine 在线示例拼接。

[Knossos 语义](https://github.com/jepsen-io/knossos/blob/14ead19fb3d24745429e367c8ae9779e147ff6cb/README.md#concepts)区分 `:ok`、`:fail`、`:info`（完成但结果不明）和没有 completion 的 pending；这些与 checker 的 `true`、`false`、`:unknown` 是不同层次。未知操作不应统一改为失败或成功；checker `:unknown` 也不是检查失败的证据。一个完整文件可含未完成操作：文件完整不代表所有操作完成。将不完整操作画到记录结束只能标为观察下界，不可虚构 return、输出、耗时、取消、最终生效或线性化位置。`:info` 的处理还需服从具体 checker/model，不可自行推断必定生效或未生效。

## 将来重开的可复现合同

先固定上面的原文件、许可、模型、README 结果，保留每个原始事件和位置，单独标出两个 pending；若补充其他 fixture，绑定来源、完整输入、模型初态、checker 版本、命令、结论和对应原生输出，缺失项显式标未知。准备 A0 同源事件表与说明，A1 用现有表达附带区间/顺序解释；不安装运行上游或新增共享代码作为前提。只把上游明确提供或经独立复核推导的顺序标为依据，并分别标记已观察、模型推导、checker 结果；无路径证据时不制造合法顺序或失败 witness。检验读者能否指出哪两个操作无 completion、哪对已完成操作有实时先后、哪些重叠可换序、`false` 的限定与 `:unknown` 的区别，并和 Porcupine 的原生能力比较。若输入或阅读任务不能证明超越原表和原生工具的具体价值，继续延后。此处不把未做读者研究当作禁止小实验的条件，也不把固定示例当作用户需求证明。

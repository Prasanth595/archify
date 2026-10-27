# Round 22：Python 异常链与 ExceptionGroup 的自然阅读问题

2026-10-28，只读。**决定：不新建实验或 parser；保留“处理位置如何定位”为未解决的数据问题，而不是画图任务。** 未安装、未执行下载代码、未修改仓库；官方案例和输出是上游提供的历史记录，不是本轮实跑。自然用户问题存在，但当前证据不能证明 Archify 相对完整原生 traceback、pdb 和 Rich 提升理解。

## 先排重

[既有实验 #1120 / `daf243ae7f40f4f989894f894bb354c5ec5a5660`](https://github.com/tt-a1i/archify/tree/daf243ae7f40f4f989894f894bb354c5ec5a5660/experiments/exception-identity) 已在原创、刻意构造的 Python 3.13.16 fixture 中用对象身份和实际 stdlib traceback 区分 group 包含、explicit cause 与重复打印；五项语义测试、渲染和截图不证明真实用户效率。此轮询问的是异常处理帧与链的关系或真实嵌套验证错误，不能包装成新发现重复做 #1120。历史研究索引与 scout 搜索还查到 `ecosystem-refresh.md`；不声称能覆盖所有私有或未命名研究。

## 强自然问题：处理链的哪一帧表示处理发生的位置？

[CPython issue #126935](https://github.com/python/cpython/issues/126935) 是真实作者的具体请求：在 `show_something` 中捕获 `OriginalException`，调用 `raise_another_exception()` 后产生 `AnotherException`；完整代码、原始 traceback 与确切第 17 行均在 issue 正文。原生 traceback 的上下文连接语句区分了两异常，但没有显式标明“哪一帧是处理帧”；用户希望程序化取得该位置。这是寻找证据的问题，不是仅缺一棵异常图。issue 当前 open；维护者认为方案需先公开讨论，[原评论](https://github.com/python/cpython/issues/126935#issuecomment-2481552680)。

[关联 PR #127021](https://github.com/python/cpython/pull/127021) 给出完整的稍有不同示例及拟议 `(from context)` / `(from cause)` 输出；API 当前显示 open、未合并。PR 提议根据异常 traceback 找出并标记帧，**不能把提议输出当已发布 Python 的行为**，也不把未合并方案作为已确立的通用数据模型。若要以后比较，需固定 CPython 发布版本、同一真实异常与上下文、原始完整 traceback、完整源码和版本；比较原生 `pdb` 的 [exceptions 命令](https://github.com/python/cpython/blob/d54c2d89b7a6b75bab996eacca22b85816f56762/Doc/library/pdb.rst)（3.13 起可在链中导航）以及 stack 与代码。它支持链导航，不等于自动取得该处理帧。可能需要运行时对象/栈证据；只有格式化文本时不能静默推断处理点、重建隐藏信息或承诺跨版本推断。采集与维护成本包括异常生命周期、复杂栈、异步上下文、不同 Python/Rich 版本、隐私和验真；自然 issue 未提供图的阅读效益。图画出已标明的帧本身没有补足数据问题。

## 原生行为和真实 group 案例

固定 CPython [`d54c2d89b7a6b75bab996eacca22b85816f56762` 的完整教程](https://github.com/python/cpython/blob/d54c2d89b7a6b75bab996eacca22b85816f56762/Doc/tutorial/errors.rst) 包含可核验的代码及预期输出：implicit context 显示“处理上一个异常时产生另一个”；`raise ... from exc` 显示直接原因；`from None` 抑制自动链的显示；group 展示编号嵌套子异常，`except*` 例还展示匹配后残余子组。完整文档中各段为独立例子，不是一条合并的运行轨迹。`from None` 不证明内部 context 对象不存在；[固定 exceptions 参考](https://github.com/python/cpython/blob/d54c2d89b7a6b75bab996eacca22b85816f56762/Doc/library/exceptions.rst) 描述 cause、context 与 suppression。group 仅表示一起封装的异常，不能凭输出声称它们同时发生或并行执行。

[Rich #1859](https://github.com/Textualize/rich/issues/1859) 原帖是实际 cattrs JSON 结构转换案例，完整类定义、输入以及当时 Python 3.11 原生 ExceptionGroup traceback 皆在正文：`Outer.inner` 中 `Test.a` 的 ValueError 和 `Test.c` 的 KeyError，与 `Outer.c` 的 KeyError 分支通过 notes 区分。它的诉求是 Rich 能显示 group 和注释，并非证明 Archify 需要替代原生层级。历史问题状态仍 open，但 [Rich PR #3677](https://github.com/Textualize/rich/pull/3677) 已于 2025-03-30 合并 group 支持；[用户确认脚本中可用](https://github.com/Textualize/rich/issues/1859#issuecomment-2822637902)，[另有 IPython 环境仍不同的报告](https://github.com/Textualize/rich/issues/1859#issuecomment-3450702613)，不能据此推断所有接入路径一致。当前固定 [Rich `9d8f9a372cc5916fd4781fec207ced7ddac2f08f` traceback 源码](https://github.com/Textualize/rich/blob/9d8f9a372cc5916fd4781fec207ced7ddac2f08f/rich/traceback.py) 处理 group、notes 与 cause/context；应以运行版本及配置为准。完整的历史 Rich vs stdlib 示例和输出见 [Rich #2238](https://github.com/Textualize/rich/issues/2238)，原历史 Rich 漏 group/notes 的显示不是当前版本实测。若曾有人仅比较旧 Rich 漏掉的子异常与 Archify，会夸大价值。

[CPython #104150](https://github.com/python/cpython/issues/104150) 则是 Python 3.11 用户无法让 doctest 稳定匹配 ExceptionGroup 的具体问题，完整输入与失败输出在 issue；这属于 doctest 语义，不是图形化需求。关联 [#105292](https://github.com/python/cpython/issues/105292) 已关闭；[固定 traceback 文档](https://github.com/python/cpython/blob/d54c2d89b7a6b75bab996eacca22b85816f56762/Doc/library/traceback.rst) 记载 3.13 起 `format_exception_only(show_group=True)` 可递归显示类型与消息，这不能单独宣称 #104150 已解决。

## 公平基线与停止条件

同一原始例及版本下保留不截断的原生 traceback，类型、消息、notes、完整层级、链说明、source、`from None` 语义以及因格式限制省略的内容；对照当前 Rich 时保留实际 hook 与选项（尤其 `show_locals`）、终端宽度、输出及隐私边界。若未来独立对照发现某一可复核的处理帧或对象身份任务，先证明数据来自真实对象或明确源码位置，再让独立读者使用同事实、同访问权限、顺序平衡的原生工具和图，记录错误、时间、原答及失败。没有可重放的处理帧数据或独立阅读收益时停止；不新建自动栈解析、跨版本身份合并或运行器。

许可和完整固定来源：[CPython PSF 许可证](https://github.com/python/cpython/blob/d54c2d89b7a6b75bab996eacca22b85816f56762/LICENSE)、[Rich MIT 许可证](https://github.com/Textualize/rich/blob/9d8f9a372cc5916fd4781fec207ced7ddac2f08f/LICENSE)。本报告链接原始完整案例，不拷贝上游代码或输出；GitHub issue 内容和提议输出的状态应在后续决策前重新检查。

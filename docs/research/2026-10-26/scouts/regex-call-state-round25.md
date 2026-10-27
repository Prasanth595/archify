# Round 25：正则结构与零宽匹配的调用状态（转向）

2026-10-28，只读。**建议暂不实施图或 importer。** 原 Rust 方向与已有 [rust-ownership-reading](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/rust-ownership-reading.md) 同样使用 Aquascope `moved_0` 和其完整 snapshot，故按协调要求转查正则。新问题有真实用户，但现有完整原生 API 说明已解释关键状态；没有同输入实际执行日志、同一版本工具截图或读者比较，不能声称图优于原生。未执行代码、安装或修改仓库。

## 查重与候选边界

旧 [matching-reading-round8](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/matching-reading-round8.md) 已固定 RegExr、regex-railroad、regex-fsm、Regulex 等，区分结构可能路径、具体执行、完整输入接受、子串匹配与截断，并发现 RegExr Explain 已联动 token 和 reference；结果零实施候选。Lifecycle 的无出边终态不是 regex 接受态，Route Probe 的最短路不是带输入或 capture 的回溯。此轮仅补**跨多次 `exec` 的 `lastIndex` 状态与零宽结果**，不是另一个 regex AST 或 FSM。

## 真实问题：为什么 global exec 卡住？

[Stack Overflow 真实提问及完整原始代码](https://stackoverflow.com/questions/29550723/capturing-groups-regex-with-global-flag-in-javascript) 使用字符串 `([^-]*)`、flags `ig`、三个完整文件名，并在 `while (match = regex.exec(item))` 内读取 match。作者报告浏览器卡住，也给了两个当时 regex101 permalink。回答指出第一个 `-` 处 `*` 可以匹配空串，重复调用的 `lastIndex` 不前进，因而可能循环；代码中的 `result` 本身也从未加入 `inter`，不要把卡住后的无输出说成正常 `[]`。作者并未提供具体浏览器版本与原始逐次日志；原帖是完整输入与历史报告，不是本轮实跑，也不能据其概括任意 regex 对任意引擎安全。问题中另外提到无 quantifier 的测试，不可未经记录把它归因为同一零宽过程。

[MDN 固定完整 `lastIndex` 页面](https://github.com/mdn/content/blob/52aca3c51ce0ff04036a13d4db471c9844d07b00/files/en-us/web/javascript/reference/global_objects/regexp/lastindex/index.md) 提供原生同一表达式对象的完整例：`/(hi)?/g` 和输入 `hi`，首次返回匹配 `hi`、index 更新为 2；再次返回空匹配、捕获组 undefined、index 仍为 2。完整说明解释失败后 index 重置，以及 sticky `y` 只从指定位置匹配。[固定 `exec` 文档](https://github.com/mdn/content/blob/52aca3c51ce0ff04036a13d4db471c9844d07b00/files/en-us/web/javascript/reference/global_objects/regexp/exec/index.md) 给可运行示例与预期，警告零宽 `exec` 循环，并建议考虑 `matchAll`。它是官方文档记录，不是本次执行。若手动推进 index，必须按实际 Unicode 模式和字符边界核对，不能泛称简单 `++` 对所有字符串安全。

## 原生工具与误判风险

[RegExr 固定 `d18630d02372b38614f220576bd1888326cf8e78` Explain 源码](https://github.com/gskinner/regexr/blob/d18630d02372b38614f220576bd1888326cf8e78/dev/src/views/tools/Explain.js) 按 token 映射解释、与表达式位置联动；它能解释 `*` 允许零次，但静态解析视图不能独立证明同一 regex 对象多次 exec 的 `lastIndex` 变化。旧研究未核键盘操作，本轮也未运行网页，不声称具体截图或完整交互验收。

[regex101 FAQ](https://github.com/firasdib/Regex101/wiki/FAQ) 说明 JavaScript 模式使用当前浏览器引擎，而实现和 flavor 有差异；[官方 issue #1093](https://github.com/firasdib/Regex101/issues/1093) 记录旧版浏览器实际断言量词输入与工具预解析差异，并有维护者说明。该公开仓库是 issue tracker，不是可固定的工具实现版本；旧 issue 的结果不能推断当前部署。题主原 permalink 是历史资料，本轮未打开/执行以验证其持久性。不要从说明 AST、railroad 上某条边或静态匹配样式推断宿主引擎执行、捕获组、进位和全局状态，也不把不同 flavor 的行为混为一谈。

## 采用判断

后续若要验证，先固定 JS engine/version、完整表达式和 flags、输入字符串、调用次数、每次调用前后 `lastIndex`、match span 与捕获组、null/错误；保存原始终端和相同输入的 RegExr/regex101 本机体验，避免真正无界循环，可用有限次数的逐调用检查。比较原生完整代码与日志、MDN 示例、工具位置解释和同事实的简短表/Explainer；独立读者回答“为什么再匹配同一位置”“是否真的匹配了字符”“如何推进且何时停止”，保留答案和错误。仅把两次数值改成漂亮图、或从静态语法猜 trace，不构成新增价值；一个 JS 专用状态表也不能保证其他引擎或任意 Unicode 正确。现无阅读收益，继续研究而不维护 parser、执行器或 schema。

固定许可：[MDN content CC BY-SA 2.5](https://github.com/mdn/content/blob/52aca3c51ce0ff04036a13d4db471c9844d07b00/LICENSE)；[RegExr GPL-3.0 许可文本](https://github.com/gskinner/regexr/blob/d18630d02372b38614f220576bd1888326cf8e78/LICENSE)，其源码头注明 GPL 3 或更晚，不能直接复制到不相容产物。Stack Overflow 投稿依文章日期/修订适用 CC BY-SA，本文只链接完整原文；regex101 issue 仓库不是工具源码/可复现版本。

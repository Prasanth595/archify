# Round 22：CMake 属性来源与 File API

2026-10-28，只读。**结论：暂不做导入器或图形实验。** 官方测试给出可回答的问题和完整原生预期，但不是自然用户报告；File API 的部分来源位置并不证明能重建该测试全部兼容属性的取值过程，也没有读者收益证据。未安装或运行 CMake、上游代码或 VS Code 扩展。

## 排重

[config-origins `14867942`](https://github.com/tt-a1i/archify/tree/14867942a81542c1ce1b0d4aae38c6e7b9ddddef/experiments/config-origins) 比较 Figment provider 声明、幸存值及错误归属，已有完整来源和 Explainer；CMake 的 target usage requirement 和兼容属性不同，但“值、来源、规则”表格不是新产品机制。[recipe-stages `062dee5d`](https://github.com/tt-a1i/archify/tree/062dee5db6e10c1877427effff0d02b34699fbe1/experiments/recipe-stages) 研究 Just 前后依赖的结构而非构建运行；[task-occurrences `caffb4aa`](https://github.com/tt-a1i/archify/tree/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences) 区分 Gradle 树中打印位置和 task 身份，均不能替代 CMake 求值。范围内未找到具体同题，不保证穷尽。

## 官方完整测试：原生文本已回答的具体问题

固定 Kitware/CMake `9c097d77b4c7163420924f392dfc8b4a89f2f140`：[完整 DebugProperties.cmake](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Tests/RunCMake/CompatibleInterface/DebugProperties.cmake)、[完整 DebugProperties-stderr.txt](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Tests/RunCMake/CompatibleInterface/DebugProperties-stderr.txt)、[CMakeLists.txt](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Tests/RunCMake/CompatibleInterface/CMakeLists.txt)、[RunCMakeTest.cmake](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Tests/RunCMake/CompatibleInterface/RunCMakeTest.cmake)、[exit 预期](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Tests/RunCMake/CompatibleInterface/DebugProperties-result.txt)、[empty.cpp](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Tests/RunCMake/CompatibleInterface/empty.cpp)。预期 stderr 文件是测试的 **正则匹配模式**，含转义和 `+`，不是本轮采集的逐字节终端日志；不可宣称该测试本轮通过。

例如 `NUMBER_MIN_PROP2`：consumer `CompatibleInterface` 设置 250，依赖 `iface1` 的接口值为 200；官方 expected 明示最终 200，consumer 250，iface1 200 标为 Dominant。另一项 `NUMBER_MIN_PROP1` 的 consumer 为 50、iface1 为 100，最终 50 且 100 被标为 Ignored。BOOL_PROP6 则显示 iface1 设置 FALSE、iface2 同意。**提问：哪个来源决定了最小值，哪个只是参与或被忽略？** 完整文本已直接给值、各 target 和 Dominant/Ignored；裁成只剩最终值作对照会人为制造图的优势。这是上游测试构造，不冒称真实事故或用户需求。

[固定 buildsystem 文档](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Help/manual/cmake-buildsystem.7.rst) 的 Property Origin Debugging 解释非局部使用需求、兼容布尔/字符串的来源及数值 min/max 的极值；[固定变量文档](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Help/variable/CMAKE_DEBUG_TARGET_PROPERTIES.rst) 限定支持范围。故这种日志应为强基线，不是所有任意 target 属性都有同样来源记录。

## File API 和 VS Code 已有能力与缺口

[固定 CMake File API 文档](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Help/manual/cmake-file-api.7.rst) 描述 codemodel backtraceGraph 的 files、commands、nodes/parent；编译组 includes、defines、部分命令片段有**可选** backtrace 索引。它是来源调用位置，并不自动是 target 依赖边、运行时间线或完整数值兼容性求值解释。此官方 DebugProperties 示例没有本轮 File API 实际回复；也未证明其自定义 NUMBER_MIN_PROP2 的候选、胜者和忽略项均由 File API 直接提供。不能把缺失 backtrace 当无来源、把同一节点索引当跨对象身份，或单凭 File API 构造 Dominant/Ignored。

固定 [microsoft/vscode-cmake-tools `e0969b894e56d8ea5e6641d48a82e5ba3babcc38` File API 消费代码](https://github.com/microsoft/vscode-cmake-tools/blob/e0969b894e56d8ea5e6641d48a82e5ba3babcc38/src/drivers/cmakeFileApi.ts) 保留 target 的 backtraceGraph；[project outline](https://github.com/microsoft/vscode-cmake-tools/blob/e0969b894e56d8ea5e6641d48a82e5ba3babcc38/src/ui/projectOutline/projectOutline.ts) 列出目标、来源文件及有 backtrace 的 references，并为测试节点提供文件/行跳转；[CMake diagnostics](https://github.com/microsoft/vscode-cmake-tools/blob/e0969b894e56d8ea5e6641d48a82e5ba3babcc38/src/diagnostics/cmake.ts) 把可识别错误与 call stack 关联到源码。这里**未证明**扩展已有通用属性来源视图、把所有 debug log 变成可点击位置、或解释该兼容极值测试；也未实际运行扩展。对照时必须纳入已存在的 output、目标/source 与诊断导航，而不是假设 VS Code 只有纯文本。

## 后续门槛

先找公开、完整的真实用户请求，明确需要从某个最终编译组的 include/define 找来源的具体任务；取得同一版本、配置、完整原生 debug 文本、File API 回包、项目源文件及扩展的实际导航记录。确认可选字段真实存在，并区分直接调用栈与推导/传递路径；以原生日志加导航作独立读者的强基线，再衡量具体错误、定位时间和证据覆盖。若原生足够或图只能复述同一文本，则拒绝。采集器还需处理多配置、generator 表达式、外部/生成路径、版本和敏感本地路径，不能因一个图例预付这些维护成本。

固定许可：[CMake 完整 Copyright.txt](https://github.com/Kitware/CMake/blob/9c097d77b4c7163420924f392dfc8b4a89f2f140/Copyright.txt)，[VS Code CMake Tools 完整 LICENSE](https://github.com/microsoft/vscode-cmake-tools/blob/e0969b894e56d8ea5e6641d48a82e5ba3babcc38/LICENSE)。本报告提供完整上游文件链接，不复制其实现或将测试预期描述为实测。

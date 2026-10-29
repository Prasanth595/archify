# 第 56 批：操作顺序实验的原生 checker 与交互基线

已在原隔离分支 [codex/lab-operation-order@33f45d05e](https://github.com/tt-a1i/archify/tree/33f45d05e30bd6e6799677acbf31c3f3084ad616/experiments/operation-order/native-comparison)补齐 Porcupine 的实际执行与原生页面证据，不另建同题实验，也不创建 PR。此前实验只引用 README 的 checker 结论；这一缺口现在闭合，但读者收益仍未证明。

## 排重、来源与执行

先刷新 333 个远程 head，相对上批只见研究 hub 前进。已有 operation-order 为 bc6cb7cde，工作区干净；Porcupine 当前 head 仍为原先固定的 97cd067defd99df172053ba7f4ca5bbae57fe446。Archify linearizability issue/PR 定向查询均为零，范围不等于穷尽同义工作。[原始快照与范围](https://github.com/tt-a1i/archify/blob/33f45d05e30bd6e6799677acbf31c3f3084ad616/experiments/operation-order/native-comparison/context.json)。

本机已有 Go 1.27.2 darwin/arm64。固定包没有外部模块依赖，使用 local toolchain、本地 replace、GOPROXY/GOSUMDB off、GOWORK off 和 -mod=readonly 编译运行；没有安装依赖或工具链。11 个原始文件包含全部非测试 Go 源码、嵌入式 visualizer、README、go.mod 和 MIT 许可，逐项核对 Git blob。没有复制第三方 Jepsen 日志。

探针从原 README 直接提取类型、寄存器 Init/Step/Hash 和第二个六事件例子；仅添加可读的操作/状态名称。第二组拷贝相同事件，只将操作 ID 2 的 return 值由 0 改为 200。它是单字段对照，不是自然系统采集。

| 输入 | CheckEvents | CheckEventsVerbose | 原生顺序 ID |
| --- | --- | --- | --- |
| 原六事件 | false | Illegal | 最大部分顺序 [0, 1] |
| 最后一次读取改为 200 | true | Ok | 完整顺序 [0, 1, 2] |

[结果及全部事件记录](https://github.com/tt-a1i/archify/blob/33f45d05e30bd6e6799677acbf31c3f3084ad616/experiments/operation-order/native-comparison/results.json)来自实际 API 调用。verbose 设置 5 秒上限，未触发超时；没有验证 Unknown 或不完整历史。第二次实际运行得到相同结果和两份字节一致的 HTML；[回放核对](https://github.com/tt-a1i/archify/blob/33f45d05e30bd6e6799677acbf31c3f3084ad616/experiments/operation-order/native-comparison/replay-check.json)不作为性能基准。

## 实际页面与含义

原生页悬停最后一次读取，显示前态 register = 200、新态 invalid op；点击后移开鼠标，所选事件仍保留粗边框。对照例显示前后状态均为 200，原生错误跳转链接为 inactive。原生工具已经能解释此模型下的失败位置。

![原生非法读取](https://raw.githubusercontent.com/tt-a1i/archify/33f45d05e30bd6e6799677acbf31c3f3084ad616/experiments/operation-order/native-comparison/browser/original-invalid.png)

图上的 Call 3 / Return 4 是零起始事件索引，对应旧 Archify 表中的第 4 / 5 个事件。HTML 还含 0、100、…、500 的单调布局映射；这些都不是物理时长。线性化点是与模型相容的解释，不是采集到的内部执行时刻。局部高亮本身不能代替完整历史与 checker 结果。

第一次按 SVG 文字悬停被透明 target-rect 拦截，失败日志保留；随后使用实际 DOM 中的目标属性完成交互。五张 1291×762 PNG 均已查看。没有键盘、辅助技术或理解速度测试。[完整复现包](https://github.com/tt-a1i/archify/blob/33f45d05e30bd6e6799677acbf31c3f3084ad616/experiments/operation-order/native-comparison/README.md)保留生成器、原生 HTML、脚本、日志、来源和许可。

## 对现有候选的影响

这次更强的同输入原生基线限制了新增 reader 的理由。Archify 的固定手册仍可把原始事件、三条不同依据的约束及来源放在一起；但原生页面已经给出寄存器前态和非法下一步，没有证据支持新增 parser、求解器或共享交互。

旧两份 Archify HTML、两份源稿和图 JSON 与基线逐字节相同。既有 audit.py 通过，本批离线验证覆盖 11 个源码 blob、两组事件/结果、原生 HTML 数据、实际 DOM、5 张 PNG、回放摘要及五份旧产物。原产品 finalize/browser 结果仅沿用历史身份，没有重跑产品或上游完整测试、CI，也没有实际分布式系统验证。服务已停止、研究页清空。持续目标仍 active，只推分支。

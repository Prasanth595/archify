# Profile 阅读：选区与聚合范围的真实需求，但暂缓实验

2026-10-28，限定只读；结论 **defer**。最接近的真实用户问题是：只分析某次请求或某帧时，如何让聚合统计确实使用这个时间窗口，而不是整个 profile？它已有强原生视图及相邻研究，不足以开一个换名的 flamegraph 分支。更具体的 inclusive/self、递归折叠或 sampled/elapsed 阅读收益，也没有关联到同一份完整公开用户 profile 的证据。

## 排重

- 历史 [profile-reading-smalltools](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/profile-reading-smalltools.md) 已讨论分母、absolute/share/normalize、inclusive/self、采集窗口与 FlameScope 选区改变总体，明确拒绝通用 renderer/importer。此前没有一份可公开的真实比较数据。上轮 [traces-timelines](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/traces-timelines.md) 已区分 sampled 和 evented，不将采样栈做实测起止区间。
- 当前 [async trace scout](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/async-trace-reading.md) 与远端 ref 清单中的 trace-waterfall、trace-flow-evidence 分别处理实测区间和明确 flow 端点；它们不证明采样 CPU、等待或因果。对当前 scouts、历史 compilation、`/tmp/archify-round14-remote-heads.txt` 定向检索，不等于穷尽全历史或私人工作。

## 上游真实需求与原生最强基线

[Speedscope #512](https://github.com/jlfwong/speedscope/issues/512) 由用户描述：time-order 缩放到有趣部分后，left-heavy / sandwich 的聚合仍按全局 profile；期望按选择窗口聚合，排除 setup、idle 等无关活动。该 issue 于 2025-07-19 关闭，是作者发现与 [#39](https://github.com/jlfwong/speedscope/issues/39) 和 [PR #366](https://github.com/jlfwong/speedscope/pull/366) 重复，并非证明需求已实现；本次查询 #39 和 #366 均 open。issue 没附可供复查的完整原始 profile、窗口与预期数字，不把这个缺口填成真实复现。

固定 [Speedscope fe804e6281cf847713448c2c3e0faec3e1f62b2d](https://github.com/jlfwong/speedscope/tree/fe804e6281cf847713448c2c3e0faec3e1f62b2d)（默认分支提交 2026-05-15；非宣称 release），[MIT](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/LICENSE)。其 [README](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/README.md#views) 说明 time order、left heavy 按相同栈聚合和排序、Sandwich 自身与总量排序及调用者/被调用者 flamegraph，另提供递归折叠、搜索、缩放与离线自包含应用。比较必须包括这些完整交互，不能只给对照组一张静态火焰图。未运行此 revision，#512 是用户当时观察而非本轮交互验证；状态也可能随时间改变。

Perfetto 官方 [CPU profiling](https://perfetto.dev/docs/getting-started/cpu-profiling) 描述样本时间线、选择区域后动态 flamegraph 和可查询样本表。更强对照需要用相同可导入 trace、相同选区及权重实际验证，不能把支持区域选取推断为和 Speedscope 输入或所有 attribution 模式完全等价。此前固定 [Perfetto 6f3b7c1269c8b47927f55f8d6c6f766a55060b4d](https://github.com/google/perfetto/tree/6f3b7c1269c8b47927f55f8d6c6f766a55060b4d) 的 [LICENSE](https://github.com/google/perfetto/blob/6f3b7c1269c8b47927f55f8d6c6f766a55060b4d/LICENSE) 主体 Apache-2.0 并列有例外；滚动文档不是固定版本的实测行为。

## 完整样本与明确缺口

Speedscope 固定树提供完整公开 [Firefox 61 recursion.json](https://github.com/jlfwong/speedscope/blob/fe804e6281cf847713448c2c3e0faec3e1f62b2d/sample/profiles/Firefox/61/recursion.json)：114,358 bytes，SHA-256 `3942ad9a93a5a191bf64afb4f1c849c625de94c90dc3bb710ba01a0010a36451`。本轮读取完整 JSON，顶层 label 为 `recursion`、duration 字段约 274.298；这是上游 fixture，采集条件与单位未在本轮独立核实。它并非 #512 的 profile，也没有选定窗口或上游 expected report；不能据名字虚构递归帧的具体权重、调用次数或真实故障。亦未运行 importer 或原生 UI，故不能声称该 fixture 的 self/total/递归折叠输出。

未来若有真实公开任务，必须固定完整原始文件、来源权限、profiler/版本、sample metric/unit、线程、筛选与窗口边界、权重和原生报告；同一个样本可能含递归重复帧，self 与 total 的计算需按 producer 和工具规则核验，不能按函数名盲目累加。比较原生 time-order、left-heavy、Sandwich 与 Perfetto 区域选取的完整能力，记录读者能否找对范围、分母及调用上下文。采样是统计观测而非精确调用事件、墙钟时间或因果证据；窗口在某种单位下的权重也不自动等于 CPU 时间。没有完整相同输入与可核输出时停止。

## 价值、成本和影响

真实用户的窗口聚合诉求支持其存在，但没有证据表明静态 Archify 表或树优于已有原生交互，尤其在选区与数据相同的条件下。手工 explainer 可说明所选样本和分母，却不能替代原工具做可重选区域；维护 importer 则带来采样权重、异构单位、线程、栈身份、递归与裁剪边界的长期成本。本轮不提新 runtime、parser、共享 Viewer 或新实验。没有安装、采集、运行、浏览器验收或读者测试。

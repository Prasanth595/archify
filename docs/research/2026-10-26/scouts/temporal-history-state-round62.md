# Temporal Event History 阅读：暂缓

日期：2026-10-29。研究范围是 Temporal Workflow Event History 的阅读，尤其是任务重试和工作流整体状态的区分。结论：**暂缓作为 Archify 产品方向**。问题真实存在，但原生 UI 已有较强的阅读能力，而单份历史缺少某些排障所需的当前状态；目前没有证据表明 Archify 可以可靠且明显地改善真实用户体验。

## 用户问题与证据

- Temporal UI [#1320](https://github.com/temporalio/ui/issues/1320) 报告：Workflow Task 连续超时后，服务端会折叠部分重复事件。历史停在上一次记录的超时事件时，读者可能误认为工作流不再重试；最终成功后，Scheduled 与 Started 之间较长的时间差也可能被误读。该 issue 当前仍为 open；它描述了问题和拟议提示，并非本次复现。
- Temporal UI [#2262](https://github.com/temporalio/ui/issues/2262) 的用户报告：部署新代码后，Worker 日志显示新的失败原因，但历史仍显示之前的 `WorkflowTaskFailed` 原因，造成排障误判。该 issue 当前仍为 open；此处引用用户报告，不声称已在当前版本验证。
- [Temporal 社区对 Activity 事件的解释](https://community.temporal.io/t/when-does-temporal-write-the-activitytaskstarted-event-into-workflow-history/6162)：Activity 执行中或重试时，历史可能只有 `ActivityTaskScheduled`；待处理 Activity 信息可通过 UI 或 Describe 查看状态、尝试次数及最近失败。[另一官方社区回复](https://community.temporal.io/t/how-to-save-all-retry-attempt-failure-logs/14903) 说明历史不记录每次 Activity 重试的失败，需要 Worker 日志获取逐次失败信息。
- [官方 Tasks 文档](https://docs.temporal.io/tasks) 区分 Workflow Task 的完成、Activity Task 的一次尝试以及 Workflow Execution 的整体状态。`WorkflowTaskCompleted` 不能单独证明 Workflow Execution 已完成。

## 数据边界

Event History 是已记录事件的序列；其缺少某个 Started、失败或完成事件，并不能证明相应动作从未发生。当前 pending 信息来自 Describe 等独立状态数据，并非可从历史末尾可靠推导。历史和 Describe 如果采集时间不同，还必须分别标记时间；不能把旧状态写成当前状态。

例如，不能凭 history-only 断言 Activity 当前正在重试、显示最新失败，或拼出所有尝试。仅有历史时，应呈现有证据的事件并明确说明当前状态未知。缺失的逐次错误需要另查 Worker 日志。

## 固定来源与公开 fixture

以下官方 UI 源码固定于 [`c75f7143cb902871da2e6e14a125deb3179da9d7`](https://github.com/temporalio/ui/tree/c75f7143cb902871da2e6e14a125deb3179da9d7)，根 [LICENSE](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/LICENSE) 为 MIT；如复用源码或 fixture，保留相应许可声明。以下文件是仓库测试 fixture，不是经核实的自然事故记录。

- [completed 原始事件](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/fixtures/raw-events.ascending.completed.json)：18 个事件；Workflow Task 完成于 #4、#11、#17，Activity Task 完成于 #14，Workflow Execution 完成于 #18。Activity Started 的 attempt 为 1，不覆盖重试。
- [running 原始事件](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/fixtures/raw-events.ascending.running.json)：13 个事件，末项 #13 是 ActivityTaskScheduled；没有结束事件，也没有配套的当前 pending 状态证据。
- 两份文件均无 nextPageToken 值；这表明给定 fixture 未标出下一页，不证明其来自真实运行或覆盖所有业务场景。检查过的 [pending Activity fixture](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/fixtures/workflow.pending-activities.json) 中 attempt 均为 1，lastFailure 为 null，不能用来验证重试。
- 不应根据 fixture 文件名推断执行结果：检查过的 `raw-events.ascending.failed.json` 末事件为 `WorkflowExecutionCompleted`，`timed-out` 文件末事件为 `WorkflowExecutionTerminated`。

## 原生 UI 基线

以下是固定版本源码所定义的能力，**不是本次 UI 运行、浏览器截图或真人试用结果**：

- [导入组件](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/lib/components/import/event-history-file-import.svelte) 读取 JSON，接受事件数组或 `{events}`，并进入导入后的 feed；仓库原始 fixture 是 `{history:{events}}`，比较前需提取其 `history` 对象，不能假定整文件直接适配。
- 源码包含导入历史的 feed、compact、JSON 路由，以及 [历史图形](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/lib/components/lines-and-dots/history-graph/history-graph.svelte)。[图例](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/lib/components/lines-and-dots/event-history-legend.svelte) 包括 Completed with retries、Pending、Retry。
- [Pending Workflow Task 组件](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/lib/components/lines-and-dots/workflow-pending-task.svelte) 展示 state、attempt 和时间；[Activity attempt badge](https://github.com/temporalio/ui/blob/c75f7143cb902871da2e6e14a125deb3179da9d7/src/lib/components/workflow/pending-attempt-badge/pending-attempt-badge.svelte) 定义了尝试次数、上限和下次重试的显示。不能据此断言每种导入或运行场景都会展示这些数据。

## 排重与后续门槛

在指定 10 月 26 日 scouts、历史 ref `3beb343b8fd6686201bde9b0f307f9a1c6b00246` 的 10 月 25 日 scouts 中搜索 Temporal、Activity retry、Workflow Task 和 event history，未发现 Temporal 方向；Alloy temporal trace 属于另一主题。协调者最终复查的 Temporal 关键词查询为 issue 零条、PR 一条，命中已关闭的 [#1102](https://github.com/tt-a1i/archify/pull/1102)（Integrate reviewed maintenance fixes and Viewer contracts into dev）；本轮没有完整审查该 PR，不能把搜索算作零重叠证明。早期 event history 检索包含已有时间线 [#691](https://github.com/tt-a1i/archify/issues/691)。查询时点与结果见[派生快照](../audit/round62-reading-candidates/github-snapshot.json)，检索也可能漏掉其他措辞。

完整原始文件、许可和哈希见[来源清单](../audit/round62-reading-candidates/sources.json)。Archify 远程快照为 335 个 head，dev 为 5ecbd1bfdbf83ea747072112493c940e707569cb；未安装或运行 Temporal，也没有生成截图或声称原生导入实测通过。

只有在获得**可分享的完整真实 history 与同时刻 Describe**，或明确标注为构造数据、覆盖重试及缺失状态的样本后，才值得做小规模对照：同样数据分别用原生 UI 和 Archify 阅读稿，盲测读者能否区分单次任务完成、整体完成与当前 Activity 状态，记录正确率、定位时间和错误归因。每个判断应能回到 event ID 或具采集时间的 Describe 字段；history-only 不得宣称当前重试或最新失败。

成本包括事件与实体关联、Temporal 版本及语义维护、历史和状态双数据源采样及脱敏。公开 fixture 尚未提供重试验证，自然任务和独立用户收益均未验证；若无法取得可用证据或对照没有显示明显价值，应停止，不先建通用 Temporal 导入器。

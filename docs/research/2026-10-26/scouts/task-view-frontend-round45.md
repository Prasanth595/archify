# 第 45 批：task-view 前端夹具的真实交互

已推进原实验分支 [codex/lab-task-flow-tests@7b2a7ba3c](https://github.com/tt-a1i/archify/tree/7b2a7ba3c976fc132379c79fa4182dbcdb6b0671/experiments/task-flow-tests/upstream-frontend)，没有新建 PR。它补的是第 44 批之后的真实前端观察，**不是 task-view CLI、Git/schema 校验或自然读者验收**。

## 本批增量

重新检查 333 个远程 head，开工时只有汇总分支从 82b850122 前移到 2a599e222。task-view main 仍为 a3fa217，已有 #1121 涉及本方向；不新开同义实验。原先图例检查已在 bc6cb7cde 补齐，没有重复执行。

本机四个精确版本 Go 模块的解压目录及 zip 缓存都不存在，未尝试安装或拉取依赖。改用固定上游 JS/CSS/模板和 vendor 资源，手工将原 mapping、flows 投影为内部 viewData。三个页面始终标注“研究夹具·未校验”，不把历史 reference-matches 升格为本轮 verified。

真实操作 Flows → 选择路径 → Graph，九次记录公开 DOM 与图片。图中测试节点数：

| 编码 | missing | delivered | omitted-link |
| --- | ---: | ---: | ---: |
| 共用节点、全局 tests 边 | 1 | 1 | 1 |
| 只有旧 flow.tests | 0 | 0 | 0 |
| 路径独立步骤节点 | 1 | 0 | 0 |

第三行改变节点身份并省略原替换节点/边，不是原输入的无损导入。路径文字声明也放在 Agent notes，因此这不证明 task-view 不能表达这些事实；它只显示图关系与文本路径声明属于不同范围。

Inspector 的 guard 三行 DOM 文本与归档片段逐字相同，Tests 1 显示原 regression。11 张最终 1440×900 实拍均已目视检查；源码长行仍需横向滚动，工具条右侧有裁出视野，不宣称完整响应式或辅助技术验收。

## 维护成本与判断

首稿的空 findings 显示“与 diff 一致”，带 ref 的节点标 agent 又显示“没有引用”，excerpt.note 则替代代码表。均为手写夹具未遵守内部 viewData 语义，已修正并保留失败稿，不能计为上游缺陷。最终 unresolved、issues 和 warning 均由夹具作者标为未确认，而非上游校验结果。

这说明内部数据投影并不便宜：即使 JS/CSS 完全不改，引用状态、文案、片段、节点身份仍需协调。本包约 7.4 MB，包含 10 份固定上游文件、11 张有效图与 12 张早期图。当前不足以支持维护通用转换器；继续保留原始的小型 sidecar 实验和这份对照证据。

[完整复现、原始日志、失败记录与许可](https://github.com/tt-a1i/archify/blob/7b2a7ba3c976fc132379c79fa4182dbcdb6b0671/experiments/task-flow-tests/upstream-frontend/README.md)包含确定性构建、100 文件清单、原产物字节不变证明及来源 Git blob/长度/SHA。MIT 与 EPL-2.0 原文和署名分别保留，没有引入产品依赖、安装、合并或发布。全量空白检查只报告原始日志与 vendor 空白，作者文件检查通过；未用重复产品 suite 冒充这组前端验收。

完整上游流水线是否接受相应 review 输入、自然读者是否更快，仍没有证据。本轮不改变该边界。

![共用节点的 delivered 范围](https://raw.githubusercontent.com/tt-a1i/archify/7b2a7ba3c976fc132379c79fa4182dbcdb6b0671/experiments/task-flow-tests/upstream-frontend/images/shared-delivered.png)

![路径独立节点的 delivered 范围](https://raw.githubusercontent.com/tt-a1i/archify/7b2a7ba3c976fc132379c79fa4182dbcdb6b0671/experiments/task-flow-tests/upstream-frontend/images/occurrences-delivered.png)

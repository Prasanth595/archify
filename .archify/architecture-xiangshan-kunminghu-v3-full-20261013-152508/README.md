# 昆明湖 V3 全核微架构图集

[打开图集](index.html)：214 张独立 Architecture 图，包含全核 1 张、前端 44 张、后端 90 张、访存与缓存 79 张。目录支持中文／技术名称搜索、分区与配置筛选，以及全核 → 分区 → 模块 → 微模块的导航。原有前端图集保留，本目录为新的完整图集。

## 阅读顺序

1. [全核总览](overview/core/read.html)：预测、取指、译码、重命名、派发、执行、访存、写回、提交与恢复。
2. [前端总览](frontend/frontend/read.html)：BPU、FTQ、IFU、IBuffer、ICache 和 InstrUncache；继续进入预测表、历史、训练／恢复队列、指令边界、压紧、预对齐、校验及缓存子页。
3. [后端总览](backend/backend/read.html)：控制与退休、整数／浮点／向量调度、数据通路、寄存器和功能单元；复杂运算沿父子链接进入固定 YunSuan 实现。
4. [访存与缓存总览](memory/memory/read.html)：Load／Store／Store-data、LSQ、非对齐／原子／向量访问、DCache、MMU、预取器、CoupledL2 和 OpenLLC。

模块页面顶部提供面包屑、父级、独立 HTML 和 JSON；下方提供子模块。独立图使用 Archify Classic，保留深浅主题、节点搜索、聚焦、源码查看与导出。长图使用纵向滚动，较密总览可用放大和节点聚焦阅读标签。脱离目录时，单独的 HTML 仍可打开；源码链接指向 GitHub 固定提交。

## 冻结版本与配置

执行开始复核官方 `kunminghu-v3`，随后冻结，不在生成期间跟随分支更新。采用单核 `top.DefaultConfig(1)`，无运行时配置覆盖，默认 LLC 为 OpenLLC。

| 来源 | 固定提交 | 用途 |
| --- | --- | --- |
| [XiangShan](https://github.com/OpenXiangShan/XiangShan/tree/d48cd2dd79726c2d7a1264b3c7a50679c77461e2) | `d48cd2dd79726c2d7a1264b3c7a50679c77461e2` | 核心、前端、后端、LSU、MMU 与配置 |
| [XSCache](https://github.com/OpenXiangShan/XSCache/tree/300515bc7b2f65ca988041a984204489d80ec2fb) | `300515bc7b2f65ca988041a984204489d80ec2fb` | CoupledL2 与 OpenLLC |
| [YunSuan](https://github.com/OpenXiangShan/YunSuan/tree/267ff736e7acd8e0fe8d13710581e4902a8a8a6c) | `267ff736e7acd8e0fe8d13710581e4902a8a8a6c` | 浮点／向量复杂算术内部 |

子模块提交取自主仓的 Gitlink。其他依赖、Archify 版本及生成基线见 [versions.json](versions.json)。统一配置、参数来源和 26 个执行单元及其功能列表见 [configuration.json](configuration.json)。

| 默认参数 | 值 |
| --- | --- |
| Decode／Rename | 8／8 |
| ROB／RAB／VTypeBuffer | 144／352／64 |
| INT／FP／VEC／V0／VL 物理寄存器 | 224／256／128／22／32 |
| Virtual LQ／Replay／RAR／RAW | 120／120／96／56 |
| 物理 StoreQueue／StoreQueueMultiple／SBuffer | 64／2／16 |
| Load／Store-address／Store-data 流水实例 | 3／2／2 |
| ICache | 64 KiB、4 路、64 B 缓存行 |
| DCache | 64 KiB、4 路、2 个 L1–L2 通道 |
| CoupledL2 | 2 MiB、8 路、4 bank、inclusive |
| OpenLLC | 32 MiB、16 路、4 bank |

配置先组合 `DefaultConfig` 的缓存等覆盖，再采用未覆盖的 `XSCoreParameters` 字段；不能把基础参数类的缓存默认值直接当最终实例。参考图片用于分区和主路径，旧预测器、6 路译码、旧 ROB／寄存器／缓存容量不混入当前配置。

NewLoadUnit／NewStoreUnit 为选定版本的实现；Hybrid／旧 Load／Store 名称作为历史配置差异解释，未作为额外启用实例。Berti 在 RTL 中存在，但默认 `modeStrideBerti=01` 不运行，相关子页标为配置变体。L2 Temporal Prefetch 默认 `tp=false`；旧 PermFsm 标为变体。标量及向量 FMA 展示当前乘法到加法的级联实现，不套用旧 FloatFMA 实例。

## 源码与图中语义

[catalog.json](catalog.json) 记录每个设计页的分区、父级、配置状态、所属仓库、源码文件与 JSON 哈希；[coverage.json](coverage.json) 将 15 组需求映射到全部 214 页。来源由该页所属仓库的固定提交解析，跨仓实例关系通过父级页和目录关联。

节点区分硬件实例、内部状态、接口上下文和逻辑步骤。逻辑步骤是对真实组合逻辑／寄存器操作的分组；结构角色连线表示组成关系。数据和控制连线保留依赖、反馈及恢复语义，不表示周期精确时序，也不把所有操作解释为每次都串行经过的固定流水级。输入输出、反压、异常／冲刷与恢复条件在对应节点、说明卡和源码中共同描述。未核实的延迟不填数值。

同设计多实例复用页面，由父级和配置表给出实例数量及角色；类型定义、简单接线、普通寄存器和通用组合原语归入所属功能模块。

## 验收记录

[validation.json](validation.json) 是从原生收据提取的便携摘要，包含每页最终 JSON／HTML 哈希、四项 gate、artifact 9/9、错误／警告计数、来源校验、Edge 视口与主题结果、双主题全页预览哈希和视觉复核范围。[navigation-validation.json](navigation-validation.json) 记录目录链接、搜索／筛选／重置、面包屑及独立图嵌入检查。

机器验收为每页 `showcase finalize`：`validate → deliver → check → browser-check`。Edge Chromium 实测 1440×900、1600×1000、1920×1080、2048×1320，主题记录包含 light 和 dark；长图允许可读的页面纵向滚动。目录另查 390×844。

[visual-review.json](visual-review.json) 与机器结果分别记录：全部 428 张双主题全页截图组成 27 组联系表，复核布局、箭头、交叉、卡片、图例及下方区域；另对主要总览与复杂页面查看原尺寸截图。联系表复核不等于逐字审读每个标签；文本容纳与尺寸由原生浏览器测量补充。通过的跳线仍可存在，计数保留在摘要中。

每页 `preview.png` 和 `preview-dark.png` 是完整页面截图，包含长图下方节点与说明。原生验收记录、浏览器数据和本机来源路径保存在被忽略的 `evidence/`、`captures/`、`local-runtime.json` 中；便携摘要没有重新标记原生收据的视觉状态。这次验证针对图集及导航，未执行 RTL 编译／仿真或无关 Archify 全套回归。

## 再生成

本目录的 `*-designs.mjs` 为受跟踪的设计来源，`build-atlas.mjs` 生成 typed JSON。需要 Node.js、当前仓库的 Archify，以及上述固定提交的本地源码检出；无需更改 live Skill 安装。

在本目录创建被忽略的 `local-runtime.json`，按本机绝对路径设置三个键：

```json
{
  "xiangshan": "/absolute/path/to/frozen/XiangShan",
  "xscache": "/absolute/path/to/frozen/XSCache",
  "yunsuan": "/absolute/path/to/frozen/YunSuan"
}
```

确认各检出的 HEAD 与 `versions.json` 一致。按顺序运行：

```sh
node audit-sources.mjs
node build-atlas.mjs
node build-configuration.mjs
node build-navigation.mjs
node verify-atlas.mjs
node capture-atlas.mjs
node check-navigation.mjs
```

验证／截图脚本采用本次机器的 Edge 安装路径；在其他机器运行时，将其替换为可用 Chromium 路径。`verify-atlas.mjs` 仅在现有 JSON 和 HTML 哈希同时匹配通过的原生收据时复用；改动使用新的证据子目录，不覆盖旧收据。截图变化后应重新实际复核，并更新视觉记录，最后运行 `node summarize-validation.mjs`。该脚本断言版本、覆盖、四项 gate、9/9、零错误／警告、预览和视觉记录哈希全部一致，缺项直接失败。

独立图的最小复核命令（从仓库根目录运行）：

```sh
node archify/bin/archify.mjs finalize architecture <candidate.json> <diagram.html> --repo-root <its-frozen-source-checkout> --quality showcase --out-dir <new-evidence-directory> --json
```

## 归属

处理器设计与源码归 OpenXiangShan 及各贡献者，所引 XiangShan、XSCache 和 YunSuan 使用木兰宽松许可证第 2 版；XSCache 还保留 [SiFive 许可说明](https://github.com/OpenXiangShan/XSCache/blob/300515bc7b2f65ca988041a984204489d80ec2fb/LICENSE.SiFive)。图集为根据公开 RTL 创作的中文设计说明与可视化，没有打包上游原始 Scala 源码。Archify 运行时归其作者，采用本仓库 MIT 许可。生成环境：Codex 桌面端，Archify 3.0.1，Node 24.19，Windows／Edge Chromium。

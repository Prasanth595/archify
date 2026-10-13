# 昆明湖 V3 全核与逐模块微架构图集实施方案

确认日期：2026-10-13。授权：完成图集、验证、创建本地 commit 并同步 GitHub。

## 目标与冻结版本

采用官方 kunminghu-v3 最新固定快照、单核 top.DefaultConfig(1)、默认 OpenLLC。执行开始复核：d48cd2dd79726c2d7a1264b3c7a50679c77461e2，之后不随分支漂移。XSCache、YunSuan 等使用主仓记录的子模块版本。

图集按全核总览 → 前端/后端/访存总览 → 模块微架构 → 复杂微模块展开。参考图片指导模块分区与主数据流；容量、宽度、实例数及启用条件以固定 RTL 和配置覆盖顺序为准。

## 覆盖范围

- 全核：贯通预测、取指、译码、重命名、派发、执行、访存、写回、提交及恢复。
- 前端：BPU、FTQ、IFU、IBuffer、ICache、InstrUncache，以及预测器、历史、队列、边界/压紧/校验、RVC、预取/缺失/回填细节。
- 后端控制：Decode/Fusion、向量拆分、Rename/Table/FreeList/BusyTable/Snapshot/Move Elimination、Dispatch、ROB/RAB/Compression、异常/重定向、VType。
- 后端数据执行：整数/浮点/向量执行区、IssueQueue/仲裁/唤醒/取消、寄存器/RegCache/读写仲裁/旁路、功能单元与实际使用的 YunSuan 复杂算术。
- 访存：Load/Store/Hybrid/Store-data、原子、非对齐、向量访存、LSQ/VirtualLoadQueue/RAR/RAW/Replay/Uncache/Exception、StoreQueue/SBuffer、依赖/转发/违例/重放。
- 缓存/MMU：DCache 管线/数组/miss/probe/writeback/替换、TLB/Repeater/L2TLB/PageTableCache/PTW/嵌套翻译/PMP/PMA、L1/L2 预取、CoupledL2/OpenLLC 的目录/数据/MSHR/仲裁/一致性/协议。

主要模块独立页；具独立队列、仲裁、流水、算法数据通路或恢复状态的微模块继续独立页。同设计多实例复用并标数量。类型定义、简单接线、普通寄存器和通用门级原语纳入所属模块；未启用实现标配置变体。以功能覆盖决定页数，不用张数上限删内容。

## 作者与导航契约

中文、Classic、独立 HTML 和 typed JSON；保留主题/搜索/聚焦/源码/导出。每页讲清输入、输出、内部状态、流水/仲裁、反压/异常/恢复条件。区分实际实例、逻辑步骤和上下文接口，不宣称周期精确时序。

新目录保存图集、预览、来源、版本锁、覆盖清单和便携验证记录。入口有分区/模块搜索、面包屑、父/子页及阅读顺序。每页用所属仓库固定源码，跨仓由父级实例化和覆盖清单关联。不改 Archify schema/Viewer，不操作 live Skill 安装。

## 验收及交付

每页 showcase finalize 四门全 pass、artifact 9/9、零错误/警告；Edge Chromium 实测规定视口/主题，长图正常页面纵向滚动。检查深浅截图与长图下方内容，分记机器和视觉结果。覆盖完整、链接有效、SHA 对应最终字节；失败项明确保留而不宣称完成。

执行顺序：冻结/清单 → 全核/分区 → 前端 → 后端 → 访存/缓存 → 跨图一致性/验收 → codex/processor-architecture 新 commit 和 push。按本方案连续执行，不再逐页/逐阶段询问确认。

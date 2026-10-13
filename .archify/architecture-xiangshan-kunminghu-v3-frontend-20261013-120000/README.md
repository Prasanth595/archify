# 香山昆明湖 V3 前端架构

从 [阅读入口](index.html) 打开本地 HTML。每张图均由本仓库的 Archify renderer 生成，支持深浅主题、节点搜索、源码证据、关系聚焦和 SVG/PNG 导出。

| 图 | 内容 | JSON |
| --- | --- | --- |
| [前端总览](xiangshan-kunminghu-v3-frontend.html) | BPU、FTQ、ICache、IFU、IBuffer，以及 Decode、ITLB/PTW、非缓存取指、后端控制 | [candidate.json](candidate.json) |
| [BPU 细节](kunminghu-v3-bpu.html) | S1/S2/S3、uBTB/aBTB/uTAGE、mBTB/Victim、TAGE、SC、ITTAGE/RAS、历史和输出仲裁 | [bpu.json](bpu.json) |
| [ICache / FDIP 细节](kunminghu-v3-icache.html) | PrefetchPipe、WayLookup、MainPipe、Meta/DataArray、MSHR、L2、Replacer、CtrlUnit | [icache.json](icache.json) |
| [IFU / IBuffer 细节](kunminghu-v3-ifu.html) | S0 指令边界、S1 压紧/预对齐、S2 RVC 展开/预测检查、反压、跨块半条和非缓存序列化 | [ifu.json](ifu.json) |

## 固定版本与参数

源码为官方 [OpenXiangShan/XiangShan](https://github.com/OpenXiangShan/XiangShan/tree/d48cd2dd79726c2d7a1264b3c7a50679c77461e2) 的 `kunminghu-v3` 快照
`d48cd2dd79726c2d7a1264b3c7a50679c77461e2`，获取日期为 2026-10-13。每个节点都带有经过 Archify 验证的源码行范围，点击“来源”可查看固定版本。

| 项目 | 此快照的默认值 | 依据 |
| --- | --- | --- |
| Fetch block / Fetch ports | 64B / 2 | [FrontendParameters.scala](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/FrontendParameters.scala#L27-L36) |
| FTQ / ResolveQueue / CommitQueue | 64 / 16 / 64 项 | [FtqParameters.scala](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/ftq/FtqParameters.scala#L23-L29) |
| uBTB / aBTB | 32 项 / 1024 项、4 路 | [uBTB 参数](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/bpu/ubtb/Parameters.scala#L21-L29)、[aBTB 参数](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/bpu/abtb/Parameters.scala#L23-L32) |
| mBTB / Victim BTB | 8192 项、4 路 / 32 项 | [mBTB 参数](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/bpu/mbtb/Parameters.scala#L21-L37) |
| ICache / cache line | 256 sets × 4 ways × 64B = 64KiB / 64B | [ICache 参数](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/icache/Parameters.scala#L29-L41) |
| Fetch / prefetch MSHR | 4 / 10 | 同上 |
| WayLookup / 预取距离 | 32 项 | [WayLookup](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/icache/ICacheWayLookup.scala#L50-L69) |
| IBuffer / write / read banks | 48 项 / 4 / 8 | [IBuffer 参数](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/ibuffer/Parameters.scala#L23-L27) |
| IFU 展开位置 | 32 个半字位置 + 4 写 bank = 36 | [入队宽度](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/FrontendParameters.scala#L81-L87)、[展开器实例](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/frontend/ifu/Ifu.scala#L87-L92) |
| DecodeWidth | 8 | [Parameters.scala](https://github.com/OpenXiangShan/XiangShan/blob/d48cd2dd79726c2d7a1264b3c7a50679c77461e2/src/main/scala/xiangshan/Parameters.scala#L80-L84) |

这些是参数类默认配置，可以被实际 SoC 配置覆盖；36 个展开位置也不代表每周期输出 36 条有效指令。本图以当前固定 RTL 为准。官方较早 V3 演示中的 12K mBTB、6-way Decode，以及 V2R2 文档中的 F0–F3、16 路展开，不作为此快照参数。

## 关键路径

- FTQ 直接请求 ICache 的预取和取指通路；ICache 返回 IFU，IFU 入队 IBuffer，IBuffer 向 Decode 供给 CtrlFlow。
- 双 fetch 要求两块同页、第二块通过 point of no return、无待处理后端标记，且总长度不超过 64B；预取还有缓存端口冲突条件。
- BPU 输出优先级为 S3 覆盖 > S2 覆盖 > S1；S2 比较方向、位置和属性，S3 引入最终方向及目标纠正。
- ResolveQueue 提供预测训练，CommitQueue 提供已提交 call/ret 的 RAS 信息；IFU 校验和后端重定向经 FTQ 恢复前端。
- PMP-MMIO 或 PBMT-IO 需等待之前的 IBuffer/后端指令排空（首条指令例外）；PBMT-NC 不要求此等待。

各图是模块层次与逻辑数据/控制关系，未逐根展示接口握手、时钟/复位、性能计数或 MBIST，也不作为周期精确时序图。SC/ITTAGE/RAS 展开到角色层次，内部预测表参数由点击后的固定源码提供。

## 验证与复现

[validation.json](validation.json) 记录每张图的 JSON/HTML SHA-256、节点/关系数、九项 artifact 检查、八组浏览器视口/主题结果和检查范围。四张图均通过 `showcase` 下的 `validate → deliver → check → browser-check`；本机使用 Microsoft Edge Chromium。

截图检查实际查看了四张图各一张 1440×900 深色和 2048×1320 浅色截图，共 8 张。主路径、标签与分支可辨识。复杂反馈仍有以 mask 处理的自动交叉，位置审阅后保留较少交叉的版本；长图通过正常页面纵向滚动阅读。截图检查与机器门禁分开记录。

在仓库根目录运行，`<RTL-root>` 是固定在上述提交的官方源码 checkout：

```powershell
$env:ARCHIFY_CHROME = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
node archify/bin/archify.mjs finalize architecture .archify/architecture-xiangshan-kunminghu-v3-frontend-20261013-120000/candidate.json .archify/architecture-xiangshan-kunminghu-v3-frontend-20261013-120000/xiangshan-kunminghu-v3-frontend.html --repo-root <RTL-root> --quality showcase --out-dir .archify/architecture-xiangshan-kunminghu-v3-frontend-20261013-120000/reproduction --json
```

细节图按上表替换 JSON 和 HTML。如已产生浏览器证据且修改候选，应使用新的 evidence 输出目录。原始本机收据与截图保留在忽略目录中；仓库提交独立 HTML、typed JSON、总览预览及便携验证摘要。

原始 RTL 版权及许可证为香山团队的 Mulan PSL v2；图中的代码链接保留原作者归属。本图重新绘制，没有复制官方图片或分发原始源码。

# 构建调度读图：长路径、浮动时间与真实等待的证据边界

2026-10-28，只读研究。**本轮推荐 0 个 Archify 实验。** 广搜 5 个一手项目，深读仅 Fuchsia ninjago 与 n2。找到了完整自然构建资料，但“由观测耗时加依赖图计算的无限资源长路径”仍不等于“本次执行究竟被谁阻塞”。现有上游已能显示 critical path、float、drag 与路径连线；缺乏新的读者任务和真实调度状态，另建适配器的维护成本目前不成立。

按 research Skill 在后台进行来源研究；没有安装、执行上游构建器、parser、converter、测试或网页，没有开浏览器，没有上传日志。本轮只通过 GitHub/Gitiles HTTP 读取原始资料；Python 仅用于读取、gzip 解压、字节/hash 与目录核对，未执行上游分析算法。以下 upstream test 是已提交的测试合同，不是本轮测试结果。仅写本文件，不改索引/实现、不 commit/push，不触碰他人修改。

## 先排重

先读既有 [build-infra-smalltools](../../2026-10-25/scouts/build-infra-smalltools.md)、[rebuild-evidence-smalltools](../../2026-10-25/scouts/rebuild-evidence-smalltools.md)、[build-reading-round10](../../2026-10-25/scouts/build-reading-round10.md)、[round15-build-explanation](../../2026-10-25/scouts/round15-build-explanation.md)，并核 [59 项 gallery manifest](../../2026-10-25/gallery/manifest.json)。这些已覆盖 Ninja DOT 的语义损失、缓存与重建原因、Gradle 打印位置与身份、Just 阶段、Bazel profile/queue、Buck2 和 Nx。

不重做 task-occurrences、recipe-stages、CI conditions、trace-waterfall、mandatory-paths 或 shared-reach。尤其 Trace waterfall 已明确不从 X 时间区间推出关键路径；Task occurrences 已解释“两个打印位置不是两次执行”。Manifest 的 deferred relation-return 还记录：既有 Incoming 已能一步回来源，额外按钮未证明价值。因此本轮不能仅把上游时间线换成 Archify 图就称新读图任务。

## 广搜结果：5 个项目，2 条深读

Star 是本次 GitHub 元数据快照，仅作规模背景，不据此推断质量或维护活跃度。固定 SHA 是实际读取对象，不声称最新发行版。

| 一手项目 / 固定提交 | 许可与规模 | 读图机制和筛选 |
| --- | --- | --- |
| [Fuchsia ninjago](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/) `8023e94b8b78df24e8b55b0d6cf48fdbbea5cada` | [根 LICENSE](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/LICENSE) 为 BSD 风格二条款；大仓库中的窄工具，不包装为小型独立项目 | 深读。完整实建日志+DOT+compdb；输出 join、float、drag、单条 critical path，明确无限并行假设；原生 trace 已有高亮和连线。 |
| [evmar/n2](https://github.com/evmar/n2/tree/b1fead52ccda0c497d816696f23f4099c3e8ec1f) `b1fead52ccda0c497d816696f23f4099c3e8ec1f` | [Apache-2.0](https://github.com/evmar/n2/blob/b1fead52ccda0c497d816696f23f4099c3e8ec1f/LICENSE)，468 stars | 深读。Ready 是可检查 freshness，Queued 才是已判 dirty、等池/执行容量；当前终端把多状态压到同一条进度。没有已取得的完整自然状态事件记录。 |
| [qingyiz/ninja-log-analyzer](https://github.com/qingyiz/ninja-log-analyzer/tree/7c28db71562376540c63751f440a28cbfad2b584) `7c28db71562376540c63751f440a28cbfad2b584` | 0 stars；完整 tree 未见 LICENSE，GitHub license=null；不能视为可再分发素材 | 浅核 [README](https://github.com/qingyiz/ninja-log-analyzer/blob/7c28db71562376540c63751f440a28cbfad2b584/README.md) 与 [BuildAnalyzer](https://github.com/qingyiz/ninja-log-analyzer/blob/7c28db71562376540c63751f440a28cbfad2b584/src/core/BuildAnalyzer.cpp#L64-L81)：并行少只列候选，明确不能证明 CPU 利用率；加载机器现况不是构建时负载。已有完整 HTML 报告和泳道；不复制源码或 demo。 |
| [sluongng/go-bazel-profile-analyzer](https://github.com/sluongng/go-bazel-profile-analyzer/tree/ab3f2ca31e747bad57da6ddaad238546f3a5857c) `ab3f2ca31e747bad57da6ddaad238546f3a5857c` | 0 stars；完整 tree 只有 6 文件，无 LICENSE，GitHub license=null | 浅核 [analyzer.go](https://github.com/sluongng/go-bazel-profile-analyzer/blob/ab3f2ca31e747bad57da6ddaad238546f3a5857c/analyzer.go#L221-L225)：提取 producer 已标 `critical path component` 的 complete event；普通 complete event 仍 TODO。不是从裸时间线重新求 CP，也不能据名称称支持完整 DAG 求解。不复制 fixture。 |
| [chagui/ninjavis](https://github.com/chagui/ninjavis/tree/0c14c1aae4ac4ca1edf55159323a7d899933e0a2) `0c14c1aae4ac4ca1edf55159323a7d899933e0a2` | [MIT](https://github.com/chagui/ninjavis/blob/0c14c1aae4ac4ca1edf55159323a7d899933e0a2/LICENSE)，51 stars | 浅读 [README](https://github.com/chagui/ninjavis/blob/0c14c1aae4ac4ca1edf55159323a7d899933e0a2/README.md)：从 target/start/end 做 vis.js timeline，要求先 recompact；tree 有示例 PNG，但没有配套完整原始 ninja log。与既有 trace-waterfall 重叠，不以截图补造输入。 |

## 深读 1：ninjago 的 critical path 是什么

### 输入和解析拥有者

官方 [test_data/README.md](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/test_data/README.md) 明确资料来自 Fuchsia `c365fdad3a1fec2877d95d13715ed423da73c55f` 的 Zircon 构建，给出 `fx set core.x64`、`fx clean-build`，复制 `.ninja_log`，以及 `ninja -t compdb`、`ninja -t graph gn` 的命令。**这是完整提交的自然 fixture 三件组，不是本轮实建，不是整个 Fuchsia 工作区，也不是任意 target 的完整动态依赖真相。** 本轮完整取得并解压三原件做字节/hash；未逐项人工审查 40MB compdb 的全部命令。

[ninjalog 包](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjalog/) 负责日志读取/去重/时间分配；[ninjagraph.go](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjagraph/ninjagraph.go#381) 的 `PopulateEdges` 用所有输出路径 join 去重后的 step 和 DOT build edge，拒绝重复输出或同一 edge 对上不同 cmdhash。多输出命令不是把每一输出当一次独立执行。`WithStepsOnly` 保留有 step 的非 phony edge 与全部 phony edge，把未执行/未匹配的非 phony edge 移除；后续结果必须标明是在该投影上求值，不把缺失步骤自动当成耗时 0。

[readTestGraph](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjagraph/ninjagraph_test.go#541) 读取整个三件组、去重、join compdb、解析 DOT 并 PopulateEdges；`TestPopulateEdgesWithRealBuild` 核 phony 与 Step=nil 对应。[criticalpath_test.go](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjagraph/criticalpath_test.go) 比较两算法返回的路径，并通过把一个 edge duration 改为 0 重算，检查模型收益等于 drag。后者是模型内反事实检验，不是删掉该构建动作后重跑机器得到的提速证据。

### 算法拥有者和证据层次

所有求解位于 [criticalpath.go](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjagraph/criticalpath.go)：

- `buildTimeOf` / `CriticalPath`（L21/L68）：对入依赖递归取最大耗时，加本 edge 的 `End-Start`。纯输入与 phony 不承担执行时长。它以实际记录的 duration 作权重，沿声明/导出 DAG 求和，**并未把相邻动作实际时间戳间的空隙当成依赖等待**。
- `addSink`（L115）把全部纯输出接到零耗时人工终点。`earliestStart` / `earliestFinish`（L162/L194）取上游最大完成值；`latestStart` / `latestFinish`（L210/L226）从下游倒推；`totalFloat`（L149）为 latestStart-earliestStart。这里 ES/LS 是计算量，不能直接改名为本次实际 ready/start 时间。
- `CriticalPathV2`（L261）沿零 float 输入回溯，遇多个选择用 latestFinish 选下一项以免漏掉中间动作。`PopulatedSteps`（L419）的 TODO 明确：并行关键动作当前只把其中一条纳入 `OnCriticalPath`。所以“画出的这条线”不等于“全部零 float 动作集合”。
- `drag`（L384）明确假设 **unconstrained parallelism**，动作在输入满足时立刻开始，不等待 CPU、RAM 或 I/O。其 duration/parallel-edge-float 算式讨论模型中的潜在改进，不是实际机器能省多少秒的承诺。

因此，这组完整自然资料足以支持“此版本生产者怎样把观测时长与 DAG 合成 CP/float/drag”的阅读题；不支持恢复本次逐动作 Ready/Queued 时间、pool 占用、CPU 空闲原因或某个动作的实际阻塞拥有者。声明依赖、观测区间、模型派生值应是三列账目，不能混成一条动画。

### 原工具已怎样帮助读者

[ninjatrace/cmd/ninjatrace.go](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjatrace/cmd/ninjatrace.go#53) 先 PopulateEdges/WithStepsOnly/PopulatedSteps，再转 trace。[ninjalog/trace.go](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/ninjalog/trace.go#59) 已把 total float 放 args、给选中 CP 加 `critical_path` 类别和 drag；`ToTraces` 把含关键步骤的轨道提到顶部，按开始时间排列选中步骤，并用 flow events 连起来。轨道是为展示组织的，不能称原 worker identity。源码还提醒全文搜索 critical_path 可能误中命令/文件名。

[buildstats/main.go](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/buildstats/main.go) 同时输出 CriticalPath、Slowests、Actions、TotalFloat 与 Drag。只做高亮/排序/详情，在上游已有能力之上没有足够差异。本轮没有运行该 UI，所以这是源码确认的能力，不是观察到的交互效果。

## 深读 2：n2 的 Ready 不等于可以立即运行

[n2 design_notes.md](https://github.com/evmar/n2/blob/b1fead52ccda0c497d816696f23f4099c3e8ec1f/doc/design_notes.md#L8) 用明确标为 hypothetical 的图解释状态：Unknown → Want → Ready；Ready 只表示上游已处理、可以检查本步骤是否 up to date。fresh 可直接 Done；dirty 才进 Queued；有 pool 深度和全局执行容量才进 Running；失败还有 Failed。不能把这些设计图说成 Clang 构建实测快照。

实现由 [src/work.rs](https://github.com/evmar/n2/blob/b1fead52ccda0c497d816696f23f4099c3e8ec1f/src/work.rs#L20) 拥有：`BuildState` 保存状态，`enqueue`（L303）入 pool，`pop_queued`（L319）只从有空深度的 pool 取，主循环（L706）另受 runner.can_start_more 限制。`ready_dependents`（L517）在完成之后检查下游。**仅见 Queued 仍不足以断言是某个具体任务阻塞它**：池容量和全局容量都可能相关，必须有该时刻池内 running 集合和调度证据。

显示拥有者 [src/progress_fancy.rs](https://github.com/evmar/n2/blob/b1fead52ccda0c497d816696f23f4099c3e8ec1f/src/progress_fancy.rs#L223) 的 running 分母为 Queued+Running+Ready，progress_bar 同样把三态合成 `-`；上方总览与最多 8 个 running 任务细节的确是有损投影。这是可借鉴的读图机制边界，但没有证据说明用户已因它错误诊断。

完整 [tests/manual/prints](https://github.com/evmar/n2/tree/b1fead52ccda0c497d816696f23f4099c3e8ec1f/tests/manual/prints) 五文件是并发 stdout 交错的**人工测试输入**，不含运行记录，也没有 pool 等待归属。`tests/snapshot/README.md` 说明大型 LLVM CMake/GN 输出不在仓库，只指向 Drive zip；本轮未取该不固定 zip，且那仍是构建文件，不是状态事件序列。没有用三条 sleep 命令或五张 hypothetical 图片拼一个所谓真实调度案例。

Live GitHub 有界查询还发现 [#34 stream progress as JSON](https://github.com/evmar/n2/pull/34) 仍 open，head `3f4bb6a3bf86ce446cb9e0cb543017b084a2c524`，merged_at=null，不能假定已存在稳定事件接口；[#100 console pool](https://github.com/evmar/n2/issues/100) 仍 open，作者说明目前仅实现深度=1 部分；[#106 Give priority to slow actions](https://github.com/evmar/n2/issues/106) 仍 open，历史时长/手工优先级是调度策略输入，不是本次 critical path 的验收结果。Issue 中他人声称的提速百分比未在本轮复现，不纳入收益证据。

## 完整输入字节账目

Fuchsia 路径全部位于固定 `tools/build/ninjago/test_data/`。Gitiles 大文件读取等待过长，完整 gzip 字节从同 commit 的 artem/fuchsia-mirror 读取；**逐件计算 Git blob 并与 canonical Gitiles tree 核对相同**：ninja_log `dd44b1309a5534e8467b4aad61e715cb1e08619a`，graph `e5117d7ecd54cc09c35f8f665577df9b846a9770`，compdb `45111346f6af832f065d0e59c334f651aeeb5b67`。因此下面是整件原字节而非选段或重新编码件。未把这 3 件大型文件写入仓库。

| 原始完整 fixture 路径（相对上述目录） | 原 gzip bytes / SHA-256 | 解压 bytes / SHA-256 |
| --- | --- | --- |
| [ninja_log.gz](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/test_data/ninja_log.gz) | 253823 / `eed0407f61efa99e9c97eddadd72a54d7061f4e453ced0dc8bbc09f43af725ce` | 1213189 / `daa8db678eadadb646a57455c1a8ec95a6c9c836a19b2234f50d2eed543d9317` |
| [graph.dot.gz](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/test_data/graph.dot.gz) | 448763 / `218f4bd46be0dac5c52ae7213995a6b16dd08953c0ecd6c882ecbf2fe26bdbc7` | 4276681 / `567d43e8cb6375d2236ac1e9c6edec1a0b33414a94198ad5d2d21363ef2b9879` |
| [compdb.json.gz](https://fuchsia.googlesource.com/fuchsia/+/8023e94b8b78df24e8b55b0d6cf48fdbbea5cada/tools/build/ninjago/test_data/compdb.json.gz) | 716694 / `d194b4f3ca7c2de810e4916715224b89484442d4d84060781b59c5f77b0e9b09` | 40615365 / `224a4cbba886d6c62197007ae82d4f6921ed9953fbf225998d041216eaa603bd` |

解压日志 9465 行、DOT 77250 行只是原件行数，不是任务/执行/依赖数。README 399 bytes / `01b44d6b03e91db0af160e95e7968ec10c575932cf2ccf524df1456386373778`；Fuchsia LICENSE 1275 bytes / `83c1763356e822adde0a2cae748d938a73fdc263849ccff6b27776dff213bd32`。许可证是该树根条款；没有对 compdb 中引用的外部库源码另作再分发结论。

n2 的完整 prints 目录五原文件（同固定 SHA；Apache-2.0）为：

| 路径（相对 tests/manual/prints/） | bytes | SHA-256 |
| --- | ---: | --- |
| README.md | 96 | `63543dcf8faffc67837b2c240330349d6057e289e3a0147d5e39a75761a26088` |
| build.ninja | 156 | `3097d2e5f9dee2027fbbb1cf87f3c8663582992a83bc45cd6ec9e8f25b56b34b` |
| prints.sh | 133 | `3a503e5010b293a17c0e4c3541f04753813245073de616377d6bdea52543b2a0` |
| build-win.ninja | 155 | `022ae231ec28a285c8e8a8261f0d8862db94c404eb5f8c6e740b0d6c096e78b5` |
| prints.bat | 127 | `0f5378aaf4980cee63a8fcc98e4eb3a930abe21d77db956ad11da4afe4974d7d` |

实现原文件支持账目：Fuchsia criticalpath.go 13100 bytes / `03b0cba4fd097bfcfb178407736c8c0e675d4f4d7249f27e0f26f42c449f3d05`；criticalpath_test.go 18614 / `39b89d741476870a02257f67e714636dc9ed4a071f78ce7594f2f741e9a3f916`；ninjagraph.go 15143 / `25b8f67aaac7b476d1836ed6eb030e0700dd334aaeb390567839ca8246936871`；ninjalog/trace.go 7843 / `d64b7acca10b1bd08007e10824e48cd3255dd70f684e39c1d43a8c024739f0f1`。n2 work.rs 30642 / `8888eef49818ad9c610fe8af929b8f63fe40106ace0a172914a195fc3a59a3dd`；progress_fancy.rs 12595 / `5a38f5d6e112a11228ab54ca3e0fd9656e1ea900996b6274aa135590ab8f46ee`；LICENSE 11358 / `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`。

## 现有 issue/PR 与 0 候选决定

2026-10-28 用 GitHub search/issues 每项最多 10 结果、限定 repo，分别查询 Archify `critical path`、`scheduler`、`slack`，以及 n2 `queue`、`progress`。Archify 的 CP 查询得到 [#692](https://github.com/tt-a1i/archify/issues/692)、[#693](https://github.com/tt-a1i/archify/pull/693)、[#986](https://github.com/tt-a1i/archify/pull/986)，均 closed。#692 原文要求等待/因果依赖有明确证据，critical path 等依赖模型明确后再说。本轮未从有限检索找到专门的 ninjago/调度阻塞归属实现；不把关键词查询的未命中称全仓不存在。

**不立新实验的价值/成本判断：**

1. 用户如果要找本次模型的关键动作、看 float/drag，ninjago 现有 trace 已具高亮、详情和 flow；Archify 换版式没有新增可完成的任务。
2. 用户如果要回答“这个 action 为什么 ready 后仍没运行、由谁占着资源”，完整 Zircon 三件组缺 ready/queue/pool 事件。重建一条最早开始路径只回答模型题，不能补足实际阻塞证据。
3. 若从零移植 Ninja DOT、去重、compdb join、phony/partial-build 投影、CP/float/drag 和 tie 处理，维护面明显大于静态说明；源文件超过 40MB、DOT 7.7 万行也不能通过裁成几个动作来掩盖完整输入成本。
4. n2 的状态差异可以用现有文本与状态图解释，但自然完整事件资料未到手，另造 sleep fixture 将把研究目标换成合成演示；当前不提该实验。

未来只有拿到**完整、固定、许可明确的自然状态事件序列**，能同时核对 dependency satisfied、queue、pool、running owner，并用同一完整输入比较上游 UI 与 Archify，让读者正确回答一个原来答不了的具体等待归属问题，才值得重新评估。这里是证据准入条件，不是已授权实施计划。本轮保留 0 候选，没有新 importer、schema、调度器、播放器或内容实验。

# 第13批 ASan 缺口：只读诊断

结论：旧运行未取得报告的直接阻塞是 Apple clang 17 所用 ASan 初始化路径；不是示例没有触发 UAF，也没有证据指向 symbolizer。可用的具体补证路径已经存在：本机另外安装了 Apple clang 21 与独立 ASan runtime、Xcode SDK，可做一次受限的新工具链可用性检查；本任务未编译、未运行旧二进制、未安装、未改产品、未产图。

## 来源、去重、终止状态

- 已读 scout `docs/research/2026-10-26/scouts/asan-provenance-reading.md`，及分支 `6f604170574b5ba854026a7ec8f01fb5ba0dd67a` 的 README、`diagnostic-selected.json` 和三个文件列表；沿用已有 ASan / diagnostic-locations / Helgrind / SARIF / exception / maybe-initialized 去重边界，不重复图形实验。
- 本地原始材料仍在 `/tmp/archify-asan-provenance/run/`、`/tmp/archify-asan-diagnosis/shim-run/`。本轮重新确认后者 results.json SHA256 `8b73e8e619eae248f370b9228ff2e2f674ebbea774dca779c29223f75cca3d92`、sample SHA256 `f4343f147d37876b65097550f95015ac986be3ed9d4909146e9a792d37ddbce2`，与远端摘要一致。
- 独立 empty-asan 的 PID 29240 有完整生命周期证据：probe.py 先 Popen、到期 terminate、wait，results.json 返回 -15；不是由 timeout 一词推定终止。本轮 `ps -p 29240` 无该 PID。它已结束。
- 初始 example 第一轮 `run.exit` 是原始 shell 143 记录；第二轮 `unsymbolized.exit` 仅作者写的「terminated after 10 seconds; shell status 143」，无原始 PID、wait receipt 或可恢复 exec handle。不能把第二轮的作者记录升级为可独立审计的终止证据。本轮进程清单未见 example/empty-asan 或相关旧探针，但名称搜索不补足历史 PID 证据；第二轮应标记「记录称终止，历史生命周期证据不全，目前无观察到的匹配进程」。当前分派上下文未提供旧 exec session handle，未尝试恢复或重跑。

## 能确定的运行缺口

普通 empty-control 0.538s 自然退出；同源 ASan empty-asan 5s 无输出，被所拥有 runner SIGTERM 且回收。1s sample 的 92 条主线程采样均位于 dyld/libSystem 初始化，经过 `__asan::InitializeShadowMemory → MemoryMappingLayout::Next → get_dyld_hdr → dyld_shared_cache_iterate_text_swift → _Block_copy → malloc → __asan::AsanInitFromRtl → StaticSpinMutex::LockSlow`，无 main 或 fixture allocator/read/free 帧。支持「ASan 初始化重入/自旋等待路径」这一观测，不足以确认具体 Apple/LLVM bug、完整死锁根因或修复。

早期直接调用 CLT driver 的 `library System not found` 是另一项链接配置失败；随后 `/usr/bin/clang` 成功链接，不能把两者混作运行根因。`symbolize=0` 旧尝试仍无输出；dsymutil 或改符号设置没有理由解决发生在 main 前的阻塞。

## 已有工具链与自然样例

- 当前 xcode-select 为 `/Library/Developer/CommandLineTools`；`/usr/bin/clang --version` 仍是 17.0.0 (clang-1700.6.3.2)，CLT 默认 SDK 为 MacOSX26.2.sdk，旧阻塞组合未变。
- 已安装但未用于该探针的 `/Applications/Xcode.app/Contents/Developer/Toolchains/XcodeDefault.xctoolchain/usr/bin/clang` 为 21.0.0 (clang-2100.3.34.2)。其 runtime 是 `usr/lib/clang/21/lib/darwin/libclang_rt.asan_osx_dynamic.dylib`；Xcode 有 MacOSX27 SDK。它是实存的替代组合，不需要安装或切换全局 xcode-select；但没有执行证据证明它可用。
- 自然报告候选仍是 scout 已审阅的 LLVM #192351：完整源程序及三段报告、重复 f(bool)，适合角色辨别与区域/存活区分；它缺应用源行，不能满足原协议的「三段各自精确源行」要求，也不能将作者困惑等同已证明的读栈错误。#36356 明确只提供大部分报告，不能充作完整基线；官方短例/原创 fixture 是教学/受控材料，不能升级为自然事故。
- 本轮未重新联网核查 issue，也未找到本地冻结的 issue 全文快照。上述自然样例判断来自已存 scout，引用前需固定来源全文、访问日期与许可。不得凭 scout 重建原始日志。

## 一个有界下一步（本轮未执行）

若允许编译与新进程，选现有 Xcode21，使用每条命令局部 `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer` 配合 `xcrun --sdk macosx clang`，新建独立 tmp 目录并显式记录 compiler/resource-dir/SDK/runtime hash；不改 xcode-select、不改旧文件、不尝试 speculative ASAN_OPTIONS。

只先编译/运行 29-byte empty 对照，各次 5s 上限、保留 stdout/stderr/PID/returncode；runner 只 terminate/kill 自己 Popen 的子进程并 wait。若 ASan empty 不自然退出，立即 defer，不运行 UAF、不继续环境修复。仅通过后，在新目录复制同哈希原创 fixture，运行一次并保留完整三段 ASan stderr、源码、符号与退出证据；确认 access/free/allocated 标签、边界、源行均真实存在才进入阅读投影。即使成功，这也只产生受控报告，尚不证明自然任务收益。

当前只读授权下停止在这里；无须再跑旧进程或重复空程序旧组合。


## Root 后续状态

以上为只读侦察时状态，不是最终执行结果。随后已授权有界验证，但子代理执行请求被自动安全检查拦截，提示可能涉及网络安全风险。本轮没有新探针运行结果，不绕过或重试该拦截。已准备的源码和runner只保存在本地临时证据目录，没有把它们提交到公共实验；已有ASan分支只增加状态README与JSON。当前进程清单未见匹配runner，仍不能补齐历史第二轮PID/wait证据。自然issue判断沿用旧侦察，没有重新联网固定全文，不能称作本轮新验证。

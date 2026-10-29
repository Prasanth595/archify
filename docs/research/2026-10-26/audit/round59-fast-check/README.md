# fast-check：实际配置、重放提示与收缩计数

2026-10-29，第 59 批。已有 counterexample / natural-reading-gap 研究提出的配置问题，本次取得一次固定浏览器构建的实际执行及复跑。没有安装 npm 包、修改 live Archify 或执行他人的测试项目。这个无外部状态的合成 property 也不是原讨论中 fast-check 3.15.1 的重演。

## 固定输入与结果

[probe.mjs](runtime/probe.mjs)真实调用 fc.check 和 defaultReportMessage：integer 范围 0–20，跳过 0，其余要求 n < 5；seed 42，numRuns 20，VeryVerbose。每组先 resetConfigureGlobal，最后也重置；只改变全局 endOnFailure 与局部覆盖。

| 组 | 实际 endOnFailure | 最终反例 / path | numShrinks | 实际摘要节点 |
| --- | --- | --- | --- | --- |
| default | false | 5 / 0:1:0 | 2 | 失败 20；其下跳过 0、失败 10；10 下失败 5；5 下成功 3、4，共六项 |
| global-stop | true | 20 / 0 | 0 | 只有失败 20 |
| local-override | false，全局 true 被局部 false 覆盖 | 5 / 0:1:0 | 2 | 与 default 相同 |

三份原生报告的重放参数都写 endOnFailure: true，不能把这段提示当成当次实际配置。原始报告分别在 [default](reports/default.txt)、[global-stop](reports/global-stop.txt)、[local-override](reports/local-override.txt)，包含原生 ANSI 颜色码。默认组里 0 的跳过发生在首次失败之后，numSkips 仍为 0；numShrinks=2 对应失败链 20→10→5 的后续两层，不等于六次尝试。numRuns=1 是报告的到首次失败为止（包含该次失败）的运行计数，不包括这些收缩尝试。没有声称这是通用的全局最小反例保证。

[results.json](results.json)保存三个 RunDetails、传入的局部参数、读取的全局参数及完整原生报告。函数只序列化为名称标记，Error 保存 name/message/stack；这不是能直接重新执行的无损 JS 对象。复现须用脚本与固定库，而非把 JSON 强行当作配置。

## 实际浏览器证据

[首稿实拍](browser/01-native-reports.png)把 ANSI 控制序列直接显示成了噪声。保留 [首稿 HTML](first-rendered/index.html)、[首稿脚本](first-rendered/probe.mjs)与 [run1](browser/run1.json)。只修正文展示：去掉原生报告中的 ESC[0m/31m/32m/33m 颜色控制码，保留所有字符、状态符、缩进和原始数据。

[末稿实拍](browser/02-native-reports-plain.png)可一屏比较三份报告。页面明确标为研究驱动器，不是 fast-check 自带 GUI，也不是 Archify 新阅读器。[run2](browser/run2.json)、[run3](browser/run3.json)是两次重新打开页面后的执行；这是三组从头复跑，未单独执行报告提示的 seed/path 重放。完整序列化结果字节一致，三个实际加载资源均来自本机。两张 1279×784 PNG 均实际查看；Ego 浏览器自报 Chrome 156.0.0.0。没有窄屏、键盘、辅助技术或人类阅读收益验收。

## 构建、来源与许可

浏览器资源是 esm.sh 提供的固定 fast-check@4.10.2 bundle、对应 source map，以及 buffer 浏览器模块，原字节保存在 [runtime](runtime/)。没有包管理器、构建、安装或 live Skill 操作。这里的 source map 包含 fast-check 的发布 JS、rolldown 输出辅助文件和七个 pure-rand 源文件；buffer 模块还保留 MIT/BSD 组件署名。模块通过本机 HTTP 加载，运行时未从 CDN 加载资源。

库自报 4.10.2 / c77afa8277a67250d798c52e61343b8ed5fd268b，与早期研究固定的 0207dd29 不同。保留对应 c77 的 [Runner](source/fast-check/Runner.ts)、[RunExecution](source/fast-check/RunExecution.ts)、[formatter](source/fast-check/RunDetailsFormatter.ts)及 [MIT](source/fast-check/LICENSE)。Runner 合并全局后再覆盖局部，并在 endOnFailure 时停用 shrink；RunExecution 只在首次失败前累计 numSkips；formatter 写入重放用 endOnFailure:true。这里核对了源码含义，没有审计 CDN 可复现构建，也不把自报 commit 当成独立构建证明。

另保留 [pure-rand MIT](source/pure-rand/LICENSE)、[unenv MIT](source/unenv/LICENSE)、[buffer MIT/Node 许可](source/buffer/LICENSE)、[ieee754 BSD-3-Clause](source/ieee754/LICENSE)，保留 Nicolas Dubien、Feross Aboukhadijeh 等原作者署名。八份来源按 [Git blob](source-blobs.json)核对。后四份许可的固定 commit 是许可归档来源，不用于宣称 bundle 中对应组件的精确版本；组件版本未完全识别，执行身份由冻结资源 SHA 确定。[context.json](context.json)保存 URL 与此边界。

## 离线复现与检查

已有 Python 和浏览器即可运行，不需要安装 fast-check：

```sh
python3 docs/research/2026-10-26/audit/round59-fast-check/verify.py
python3 -m http.server 8879 --bind 127.0.0.1 --directory docs/research/2026-10-26/audit/round59-fast-check/runtime
```

打开 /index.html，每次加载执行三组；展开“完整记录”查看本次真实数据。更换端口/环境可能改变 Error stack 中的地址，不能要求跨环境所有 JSON 字节相同。浏览器脚本绑定本次空间 3，不要直接在别人的同号空间重放。已停止服务、p1 回到 about:blank。

[verify.py](verify.py)核对本次保存的配置、失败链、跳过/成功状态、计数、原始报告与纯文本显示、复跑、来源字节及截图尺寸；[verification.json](verification.json)保存结果，[manifest.json](manifest.json)绑定全部文件且排除自身。未运行 Archify 或上游完整测试，也没有 CI 结论。

## 筛选结论

本批开工刷新 333 条远程 head，只有上一批 research hub 前进。引用 fast-check 的查询命中 2 个 issue、6 个 PR，标题涉及 Archify 检查、依赖、打包与 Explainer 等；保留命中，不宣称穷尽式无重复。既有两份 scout 已覆盖该方向，本批只补证。

**暂不加树图或 importer。** 原生 VeryVerbose 已展示六项尝试；真正需要保留的是实际全局/局部配置与完整报告的不同范围，单靠错误文本或执行树不能反推有效设置。该固定 API 已提供 runConfiguration，但任意值序列化、配置来源和隐私仍有维护成本。没有人类比较证明新增图值得维护。只更新研究分支，Codex 完成脚本、执行、来源与实拍；未声称人类验收，无新 PR、合并、发布或安装。

服务器另记录可选 favicon.ico 的 404；后续模块复用有 304，故不是无缓存启动测试。它们不改本次 property 结果。全量 diff-check 的三条 EOF 空行提示均来自原始浏览器日志，[范围检查](whitespace-check.json)排除原始日志后通过；没有改写日志来获得零提示。

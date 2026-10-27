# 第28批：补查真实原样例，避免重复实现

2026-10-28。上一批 `ca81e9e3` 已推送，属于有效进展。本批先刷新 [316 个远程 head](../audit/remote-branches-round28.txt)，dev 仍为 `d5d979493bba650b3995836afd379cd249f2d0dd`。本批没有新方向通过实施筛选；新增证据主要来自 LLVM 自然问题的实际原生页面，而不是继续罗列工具。只提交研究记录，不新建 PR、并行修复或安装。

## 原样例当前已经显示具体原因

[LLVM #158499](https://github.com/llvm/llvm-project/issues/158499) 的原帖讨论为何优化备注只说循环未向量化，没有解释原因。本批此前的网页读取没能取到两个 CE 短链接，随后浏览器成功打开原帖的 [41Yxvcsn9](https://godbolt.org/z/41Yxvcsn9)。**当前保存的 Opt Viewer 状态已启用 Missed、Passed、Analysis，并直接在源码旁显示浮点运算不能安全重排的原因。** 这改变了下一步判断：对于当前这份输入和原生视图，不需要再建一个解释页来补同一句原因。

这是当下观察，不是对 2025 年报告的复现或否定。原 permalink 使用可变 `clang_trunk`；本次随后对页面实际使用过的版本查询端点做 GET，返回 clang 24.0.0git、LLVM `817f121cfed0f95442f1da8d72a8b49ee220a0ee`、2026-10-26 部署路径。该 GET **不是捕获的原始 compile response**；CE 部署源码 SHA 未知。完整 YAML 和首次编译响应没有获取，不能把此次显示的原因强行标成已观察到的原始 `!AnalysisFPCommute` 记录。

源码编辑器与 Opt Viewer 的模型均为 468 bytes、19 行，SHA-256 `82efdbb7af2e3c9a1975256b368b976f80e219fa74e222f6aff1c4e8c1a1bf78`。编译选项是 `-Wall -Wextra -O3 -std=c++20 -march=znver3 `（末尾空格保留在 JSON）。没有改源码、选项或 compiler，也没有执行编译所得程序。

## 同一页面的真实过滤对照

使用实际 Filters 菜单操作，1440×900，先关 Analysis 再恢复。以下最终对照来自本地原始 `09-settled-filter-control.mjs` 与对应 JSON／PNG；没有改 DOM 文本、注入注释或调用私有渲染器。

| 状态 | 通用 Missed 仍可见 | 浮点重排原因可见 | Resource Timing 中 compile 请求数 |
| --- | --- | --- | --- |
| 原保存状态 | 是 | 是 | 1 |
| 关闭 Analysis | 是 | 否 | 1 |
| 恢复 Analysis | 是 | 是 | 1 |

三态全部 Monaco 模型哈希相同，包含源码和汇编模型；这个计数观察支持“过滤切换未新增可见的 compile 请求”，不是服务端完整网络审计。Missed／Passed 仍保持启用，最后恢复了 Analysis。源码旁不同类别的信息能直接解释为什么只看 Missed 会漏掉分析原因；它没有证明真实运行更快、一定可向量化、该原因在旧 compiler 中存在，或历史 CE 过滤从未出错。

实际 DOM 的 `aria-pressed` 与选中状态存在不一致：Analysis 的 checkbox／active 为 true 时，`aria-pressed` 仍为 false。本记录以 checkbox 状态、真实显隐和截图相互核对，没有拿该属性当实际筛选状态，也没有做真人读屏测试或另开 CE 修复范围。

完整的[状态与身份摘要](../audit/round28-native-summary.json)记录 flags、源码／汇编哈希、版本查询边界、截图哈希和操作失败。原稿有两处需保留：05 的 subtree snapshot 错用 CSS root，API 要求 snapshot ref，导致该次采样报错；此前取值和菜单打开已成功，06 先检查状态再继续。07 在布局尚未稳定时得到空 remarks 数组，稍后的图仍显示 Missed／Passed，故不将空数组当最终显示结果；09 改为同时等 Missed 出现、具体原因消失，再完成恢复。前稿未覆盖。

## 来源、许可与复现

[固定 CE 源码审阅](../audit/round28-ce-source-review.md)另行说明：`1fbdacb205156f4f5f19686cbd688c093e887751` 的 parser 会把符合位置／文件条件且不以 Missed／Passed 开头的 tag 归入 Analysis；新面板模板默认关闭 Analysis，保存状态可覆盖它。本次打开的 permalink 恰好已启用 Analysis，不能用模板默认值替代现场状态。源码审阅和当前部署的观察相互独立；上游测试没有专门验证这个 subtype，本批没有运行它们。

CE 项目是 [BSD-2-Clause](https://github.com/compiler-explorer/compiler-explorer/blob/1fbdacb205156f4f5f19686cbd688c093e887751/LICENSE)，LLVM 项目是 [Apache-2.0 WITH LLVM-exception](https://github.com/llvm/llvm-project/blob/e8bf01108589be73f4057fe285cd7e04b4143f4a/llvm/LICENSE.TXT)。这些许可不自动覆盖原帖链接中的用户代码。该片段的独立许可未确认，因此完整模型、五张实际 PNG、未剪裁日志和脚本仅保留在本地证据包；Git 中只保存来源、派生状态、哈希和[本地包清单](../audit/round28-local-evidence-manifest.json)，没有把片段改标为 CE BSD 源码。清单中的文件是本地文件，不是已提交附件；浏览器库存日志还包含其他用户空间信息，亦未公开。

复现入口及会随时间变化的条件见[操作说明](../audit/round28-native-reproduction.md)。评论中的 [bKq3fY8hM](https://godbolt.org/z/bKq3fY8hM) 与 [x7TjW67PT](https://godbolt.org/z/x7TjW67PT) 没有在本轮打开；它们不能和原帖页面拼成同次执行。未来只有新的固定输入、完整 producer 输出与原生视图仍留有具体阅读障碍，才重开此方向；不为此次已经可见的原因维护编译器备注解析器。

## 另外三个候选的去重结果

| 候选 | 核对与决定 |
| --- | --- |
| Explainer 窄屏工具栏 | 既有 Kconfig 的 390px 实际图与记录显示工具栏右沿约 401px，完整页面 CSS 与 d5 相同。但[当前归属快照](../audit/round28-owner-snapshot.json)确认 BlueboxC 的 Draft [#1076](https://github.com/tt-a1i/archify/pull/1076) 正是此范围，head `cd50794b794fc9f6ec4c9914dee78df0b7fddde3`，改动为 reader CSS、原测试文件和 ZIP。#1027 则是 Native Viewer 范围。没有重复实现、改贡献者分支、重建其包或将 PR 自述 CI 当本轮验证；Kconfig 精确输入的候选对照仍未做。 |
| Sequence participant kind | 既有 [跨 renderer 审阅](timeline-waterfall-kind-audit.md) 已确认类型来自作者。本次核 schema、renderer、两个完整示例：`participant.type` 必填并原样传至 Passport／Finder／Lens；消息是关系，箭头颜色不会生成领域 kind。与 Tree 的自动配色分类问题不同，不新增修复。 |
| profile self／total 与递归上下文 | [既有 profile-window-reading](profile-window-reading.md) 已核对原生视图的文档能力与完整递归 fixture，但未运行 importer 或原生 UI。未找到能与同一完整 profile、线程／metric／选区及原生结果绑定的新用户问题。维持不实施，不新建 decoder。 |

本批没有 Archify 产品测试／构建／CI 重跑，原生浏览器观察单独记账。对 CE 的真实操作和截图补全了当前原样例的阅读证据；它们没有变成一个已经证明用户收益的 Archify 实验。

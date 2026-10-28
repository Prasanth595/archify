# Round 30：Lean Web 原生观察独立审阅

结论：三条记录支持**对应光标位置**显示的状态；特别是第一分支后的 `No goals` 不能直接写成“整个证明此时所有目标已完成”。`constructor` 位置列出 left `⊢ q` 和 right `⊢ p`，第一与第二个 `exact` 的位置分别各显示 `No goals`；这些是三个定位快照，不是全局时间线，也不能推定 #616 已修复。未复跑 Lean、浏览器或 UI；以下为已存证据的源码和记录审阅。

完整原创 [`conjunction.lean`](round30-lean-native/conjunction.lean) 为六行加末尾 LF，SHA-256 `79bea7652842be1bb52b896355024ff70481754f6cf7ef621fdb0f873d490b73`。它分别以 `h.right` 与 `h.left` 完成两条带 `·` 的分支，不含 #616 issue 或教材投稿代码。保存的 09 脚本对每条编辑器 DOM source line 做 NBSP→普通空格，再以完整换行内容与原文件比较，三个位置均 `inputMatches: true`。这验证可见文本，不能替代编辑器内部源文件或服务器版本哈希。

| 位置及原始记录 | 保存的 Infoview | 允许的结论 |
| --- | --- | --- |
| [4:13 constructor](round30-lean-native/constructor.json) | 2 goals；left `p q : Prop, h : p ∧ q ⊢ q`；right 相同上下文、`⊢ p` | 该位置展示两个待处理目标。 |
| [5:17 first exact](round30-lean-native/first-branch.json) | `No goals` | 该位置的 tactic state 无目标；不能据此宣称另一分支此前已被完成。 |
| [6:16 last exact](round30-lean-native/last-branch.json) | `No goals` | 该位置的 tactic state 无目标；单独这条 UI 文本不是完整 kernel 审计报告。 |

三个 JSON 均显示 `All Messages` 而无计数，并非检查已展开的逐条诊断，也没有单独 CLI 或 kernel 输出。三张截图是对应时间的 UI 记录，09 等待 `Loading` 文本消失，但没有等待 `Updating` 图标 opacity 为零，故不能保证各原始截图都没有更新淡出。11 日志对 constructor 位置另记录 `Updating ...` 元素 opacity `0`；只能证明该次检查的视觉状态，不能替其他位置补证。协调人正在另行做同输入的等待与 pin 对照，结果未纳入本审阅。

失败操作保留：07 的 `insertText` 使缩进逐行增加，不是原始六行；08 粘贴后可见 source 已纠正，但立刻抓到的 Infoview 仍是之前位置的 1 goal / 1 message，不能把它作为纠正后输出。09 对各位置再次定位、等待与对比输入后才产生上表；这体现异步读取边界，不归咎 Lean 证明错误。

来源：[Lean 4 Web 固定 `5254e2893858adbf0a0dfc1c50927541fe791555` README](https://github.com/leanprover/lean4web/blob/5254e2893858adbf0a0dfc1c50927541fe791555/README.md) 明确称 `live.lean-lang.org` 为官方 playground，Lean server 在服务端运行而不是浏览器内。[仓库 Apache-2.0 许可](https://github.com/leanprover/lean4web/blob/5254e2893858adbf0a0dfc1c50927541fe791555/LICENSE)；截图中还可能包含第三方组件、字体或商标，仓库许可不自动证明每项素材的单独许可。发布时应注明官方站点、访问日期、UI 与作者输入的来源、代码及相关许可，不要复制未经确认授权的 issue 内容。

UI dropdown 字面为 `Stable Release (v4.35.0 with mathlib, cslib)`，URL 选 `mathlib-stable`。它是观察时的标签，**不是**已验证的 Lean server binary hash、mathlib/cslib revision、Web frontend commit 或扩展版本；固定仓库 HEAD 只是 source reference，不能认作网页当时部署了该 commit。稳定通道可变化，日后链接不保证重现。仓库说明自托管还涉及更新工具链和依赖，故不要把截图或这三个输出作为自动跟随 Lean 更新的能力。

原生 UI 已在一个位置显示所有目标并可移动光标、pin 与暂停；可见记录仍可能需要跨位置比较。若考虑 Archify，仅能作者提供完整来源、位置和带版本限制的快照，标明每个分支内的 `No goals` 观察，不能声称实时 proof checker 或普遍解决 stale pin。当前没有完整 pin 对照或独立读者价值证据，不能将候选升级为实现结论。

## 后续补充：稳定状态与原生 pin 对照

审阅新增的 `12-settled-and-pin.mjs`、日志与三份 JSON：独立将每份 `sourceLines` 的 NBSP 替换为空格并以换行拼接，均与原始 `conjunction.lean` 完全一致，版本标签均为 `Stable Release (v4.35.0 with mathlib, cslib)`。脚本等待目标位置出现在 Infoview 且所有当前 `.codicon-loading` 的 computed opacity 为 0；三个记录实际数组分别为 `[0]`、`[0, 0]`、`[0, 0]`。

- [constructor-settled](round30-lean-native/constructor-settled.json)：4:13 的两个目标与前述一致。
- [pinned-first-branch](round30-lean-native/pinned-first-branch.json)：固定 4:13 的两个目标仍显示，同时 5:17 显示 `No goals`。
- [pinned-last-branch](round30-lean-native/pinned-last-branch.json)：固定 4:13 的两个目标仍显示，同时 6:16 显示 `No goals`。

这次实际观察确认原生 UI 已能在同一输入下并排比较固定位置与当前光标状态，是未来比较所需的完整原生基线的一部分。脚本只 pin 并移动光标，没有修改输入、pause、refresh 或复现 #616；不证明固定状态跨编辑更新正确，也不证明整个证明的执行时间线或独立读者收益。前文“尚无完整 pin 对照”仅为补充前状态，以此记录更新。

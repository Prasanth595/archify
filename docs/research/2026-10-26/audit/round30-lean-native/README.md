# Lean Infoview：位置状态与固定对照的原生观察

2026-10-28。**暂缓新增 Archify 实现。** 在 [官方 Lean Web](https://live.lean-lang.org/) 实际输入原创 [conjunction.lean](conjunction.lean)，选择页面标示的 Stable Release v4.35.0，检查三个精确光标位置，再固定其中一个位置。原生 UI 已能并列展示这些状态；尚无证据表明另加静态图或证明状态适配层能改善这个阅读任务。

输入为 171 bytes，SHA-256 `79bea7652842be1bb52b896355024ff70481754f6cf7ef621fdb0f873d490b73`。它不是历史 issue #616 的输入，也不是教材源码复制。完整输入没有 `sorry`，本次没有执行本地 Lean CLI、安装 Lean 或修改 Archify 产品代码。

## 实际状态

| 页面显示的位置 | 稳定的原生显示 | 证据 |
| --- | --- | --- |
| `4:13`，constructor 后 | 两个目标：case left 为 q，case right 为 p；均带 p/q 与 h 假设上下文 | [状态](constructor-settled.json) · [图](constructor-settled.png) |
| 固定 `4:13`，当前 `5:17` | 上方保留两个目标；当前第一个 exact 后显示 No goals | [状态](pinned-first-branch.json) · [图](pinned-first-branch.png) |
| 固定 `4:13`，当前 `6:16` | 固定位置仍为两个目标；当前第二个 exact 后显示 No goals | [状态](pinned-last-branch.json) · [图](pinned-last-branch.png) |

这些是同一完整文件的源码位置状态，不是运行时消息流，也不是按截图顺序执行的轨迹。首次访问顺序实际为 6、5、4 行；固定后再看 5、6 行。第一个分支处的 No goals 只说明该位置所展示的局部状态，不能单凭它断言全证明完成、没有其他分支或 kernel 独立重验成功。最终观察中 All Messages 未显示计数；未据此作独立证明审计。

三份稳定记录等待指定位置出现且所有 `Updating ...` 图标的 computed opacity 为 0。Monaco 可见完整行中的 NBSP 转为空格，再以 LF 连接，逐字节等于输入；没有其他文本规范化。该转换及每份结果见 [observation.json](observation.json)，独立复核见 [审阅及后续补充](../round30-lean-native-review.md)。七张真实截图都已查看；没有生成或重绘原生界面。

## 可复现步骤与保留的失败

1. 打开官方站点，核对版本选择器。`mathlib-stable` 是可变服务标签；若未来不是 v4.35.0，应另存新观察，不覆盖本包。
2. 粘贴完整 fixture，核对缩进、七个可见行（含末尾空行）和全部文本；等待该文件处理完成。
3. 将光标分别放在上述 tactic 末尾，用 Infoview 的位置标题核对实际坐标。等待 Updating 图标消失再读取状态。
4. 在 constructor 位置点击 **Pin state to top**，再移到两个 exact 末尾，对照 pinned 与当前位置。没有编辑 proof、pause、refresh 或测试编辑后 pinned 状态更新。

归档的 `.mjs`/`.log` 是依赖当时任务空间及页面状态的历史动作，不应整套重放；手动步骤适用于新会话。`05-input.log` 保留版本切换重载期间 editor 尚未出现的 focus 超时。第一次 `insertText` 触发自动缩进，实际输入不同，页面出现一个消息和红色下划线；[失败输入](inserttext-attempt.json)及[图](inserttext-attempt.png)保留。这不是原 fixture 的语义结果，也不作为 Lean 缺陷。

随后 native paste 保留了正确输入；[paste-attempt.json](paste-attempt.json) 捕获的 Infoview 仍是之前状态，不能用作新输入的结论。`09-cursor-states` 的初次图片有 Updating 淡出过程，仅保留为初次捕获。`12-settled-and-pin` 增加可见 opacity 等待并重新核对输入，才是这里采用的稳定状态。没有通过清理日志或改输入抹去失败。

## 来源、许可和边界

[源码调查](../../scouts/lean-reading-round30.md)记录了自然问题、官方教材与强原生基线。[Lean Web 源码](https://github.com/leanprover/lean4web/tree/5254e2893858adbf0a0dfc1c50927541fe791555)的[许可为 Apache-2.0](https://github.com/leanprover/lean4web/blob/5254e2893858adbf0a0dfc1c50927541fe791555/LICENSE)；Lean 核心、VS Code Infoview 的固定来源和许可分别列在调查/审阅中。截图归属原生界面及其上游作者，本仓库新增 fixture 与记录遵循仓库许可。未复制网站 bundle、字体或其他依赖。

页面版本标签不是已部署前端 commit、服务端二进制或 mathlib/cslib revision 的证明；这些身份未独立取得。原生 pin 对照已经观察，但 2025 年的 pinned-state 更新问题 #616 未复现或验证修复。本包不提供人类阅读收益、性能、移动端或完整辅助技术验收。

浏览器库存含无关用户空间，因此 `01-inventory` 输出和库存 JSON 只保存在本机调研档案，没有复制到仓库。归档动作中的任务空间 ID、局部路径和 fixture URL 仅为执行元数据；没有操作其他空间或网站保存/分享入口。

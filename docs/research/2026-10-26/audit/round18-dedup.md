# 第18批去重：Lens 裁切与 task-view 更新

2026-10-28，只读。**选择建议：不并行实现 Lens 修复。** #1027 已由贡献者负责 dock/Lens 范围并包含相邻的 Lens 可达性修复；用户给出的 1440×900 底部越界和 single-span Waterfall 顶部裁切是不同具体触发，尚未在 #1027 head 对照验证，不能宣称已修复，也不能假设完全独立。先把两种 fixture 和精确几何在 dev 与 #1027 head 做只读对照，再决定是否为已有审阅范围提供证据。移动端工作仍由维护者在 PR 中暂缓，不能把此调查当 scope approval。task-view 上游已变更，已有 Archify task-flow 实验和上游新 graph focus 功能重叠，不重复建立类似功能。

## 查询范围与结果

`/tmp/archify-round18-remote-heads.txt` 按 `lens|dock|panel|viewport|clip|overflow|task.?flow|task.?view|chrome|camera` 搜索仅命中 `codex/lab-task-flow-tests@843c877b251baf89925f99e11594fc5630c1c165` 和两个 clipboard 分支；分支名不包含所有实现，故不能据此排除其他分支。

GitHub connector 对 `repo:tt-a1i/archify` issue 搜索 `"lens" "clip"` 得 #1026；`"lens" "viewport"` 得 #1026/#111；`"lens" "panel"` 得 #1026/#666/#925/#912/#200/#99；`"dock"` 得 #1026/#1000/#111/#898/#99/#245/#582/#193/#232/#152/#277；`"short" "lens"` 仅 #499。关键词匹配 bodies 并非都涉及此问题；每次最多50，时间为本次查询，结果可能变化。PR 搜索 lens/dock/viewport/clip/overflow 等，重要关联为 #1027、#1001；匹配跨整个 body，非穷尽或语义证明。

## 具体 ownership 和边界

- [#1027](https://github.com/tt-a1i/archify/pull/1027) OPEN、非 draft，作者 `jahfaliabdulrahman-dev`，查询时 head `c393fc7fbc321d5b6c4685ca35cd612b75d64083`，base `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`。PR 描述 Lens 消费 dock 测量值，重心为 360×760 等移动布局，且明确未重新声明 Lens Clear/Copy 视觉截图。其 [review finding](https://github.com/tt-a1i/archify/pull/1027#discussion_r4330079127) 指出 24px 根字体下 panel `overflow:hidden` 导致底部操作不可达；[作者回复](https://github.com/tt-a1i/archify/pull/1027#discussion_r4333037075) 称 `a139f6e0` 改 flex 布局/滚动 kinds 并加真实浏览器回归；这是贡献者的证据陈述，不是本轮测试。桌面短图两触发不等同该复现。 [maintainer comment](https://github.com/tt-a1i/archify/pull/1027#issuecomment-6407503514) 暂缓合并并询问实际需求及个人审阅；[作者后续](https://github.com/tt-a1i/archify/pull/1027#issuecomment-6416017115) 表示手机真实使用、个人代码审阅未完成并愿缩小范围。
- [#1026](https://github.com/tt-a1i/archify/issues/1026) 是移动 nav、route probe 与 presentation 起点裁切的原报告；[owner triage](https://github.com/tt-a1i/archify/issues/1026#issuecomment-6304881355) 特别指出 Lens Clear/Copy 功能可达性要与装饰性 stepper 分开。不能将它们都归成一个视觉问题。
- [#1001](https://github.com/tt-a1i/archify/pull/1001) OPEN draft，作者 `leonkoellerwirth-arch`，head `4ca84e4af9ef16810b0823fe6e3320b58cb733a5`。它处理高度受限窄 SVG 在 175–300% 缩放和平移时的 camera clip（#1000），不证明固定 Lens 面板在短容器中的位置。#111 已 closed，讨论 dock 与图语义重叠，非面板本身裁切。没有本轮 browser、CI、PR head 测试或源码修复。

## task-view 新 HEAD 对照

GitHub connector 查询 `gtindo/task-view` HEAD = [`a3fa21767bfaeb3077fdda08bddb7249366caa93`](https://github.com/gtindo/task-view/commit/a3fa21767bfaeb3077fdda08bddb7249366caa93)。[compare](https://github.com/gtindo/task-view/compare/f27b8bef63ec336b8e3487e90ccd484a2fa7a235...a3fa21767bfaeb3077fdda08bddb7249366caa93) 对旧 `f27b8bef63ec336b8e3487e90ccd484a2fa7a235` 为 ahead 2、behind 0：`45eb908` 加 review progress、分支 flow 布局/校验；`a3fa217` 按 Flows 中选中的节点、边或整条 flow 限定 graph，展示相关 tests，邻居 +N / − 展开与收起，URL 存 focus；无 flows 时保留整个 graph。直接阅读了 commit 的 `internal/render/assets/app.js`、README/guide patch，非实际运行。其 repo 顶层 MIT；vendor 依赖另有许可，见既有实验 NOTICE。

Archify `lab-task-flow-tests@843c877` 的 README 已将声明的 path 与测试关联投影到固定输入，明确测试未运行、关系不是覆盖或真实轨迹；其最终 visual-check 因键盘遍历诊断失败，不能说已通过。新 task-view 上游将 tests 从 Flow 图移到 graph，并以 focus 和邻居展开支持大图导航；与 Archify 的静态 test association 有相邻目标，但不是相同实现，也不意味着此前实验被上游验证。若继续，唯一有价值的问法是已固定的缺产物路径中读者如何找到被声明测试及未关联步骤；先用更新后 task-view 的实际显示作完整基线，保留未运行/声明边界，勿再造一个通用 graph focus 或重复 tests 列表。

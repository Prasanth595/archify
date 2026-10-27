# Lens 浮层可见边界：定位、尺寸和交互分开处理

2026-10-28，只读。**建议采用现有 Dock 的局部修正思路，不安装定位库或切换原生 popover。** Batch17 提供的现象是长图在 900px 高视口中面板底部不可见、短单 span 图顶部被容器裁切；这里将这些视为协调者报告，未自行浏览器复现。先确定可见区域和面板最小可用空间，再选能放下的纵向位置/大小；没有可用空间时需要可达的备选呈现，不能只左右切换。

## 排重和现有 Dock

本地 `docs/research/2026-10-26/scouts` 定向搜 floating-ui、popover、anchor positioning、clipping、dock、lens；Lens 研究主要讨论角色/分组及兼容性（例如 [waterfall-role-decision](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/waterfall-role-decision.md)），没有发现本次短图/长图浮层可见边界实验。`/tmp/archify-round18-remote-heads.txt` 在查询时尚不可用或无对应命中；不能宣称完整远端排重。

本工作区 [semantic-lens.js](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/viewer/semantic-lens.js) 的 `dockPanel` 依据面板当前 top/bottom，评估容器内左右两个候选与选中节点、legend、nav 的重叠分数，选择侧边；它本身没有纵向可见范围计算。[viewer.css](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/viewer/viewer.css) 将面板绝对定位于图容器并设 bottom；上述只描述被读源码，不替代其他 agent 的根因诊断，亦不称所有容器/样式条件一致。

## 一手合同与边界

固定 [Floating UI@93ea014e0344ec0169e9a03db8aee70e90fd5a09](https://github.com/floating-ui/floating-ui/tree/93ea014e0344ec0169e9a03db8aee70e90fd5a09)（2026-10-27 默认分支，不冒称 release），[MIT LICENSE](https://github.com/floating-ui/floating-ui/blob/93ea014e0344ec0169e9a03db8aee70e90fd5a09/LICENSE)。定位逻辑可核 [detectOverflow](https://github.com/floating-ui/floating-ui/blob/93ea014e0344ec0169e9a03db8aee70e90fd5a09/packages/core/src/detectOverflow.ts)、[shift](https://github.com/floating-ui/floating-ui/blob/93ea014e0344ec0169e9a03db8aee70e90fd5a09/packages/core/src/middleware/shift.ts)、[size](https://github.com/floating-ui/floating-ui/blob/93ea014e0344ec0169e9a03db8aee70e90fd5a09/packages/core/src/middleware/size.ts)、[autoUpdate](https://github.com/floating-ui/floating-ui/blob/93ea014e0344ec0169e9a03db8aee70e90fd5a09/packages/dom/src/autoUpdate.ts)。以下官方文档是滚动版解释，不冒称其页面与该 SHA 同步的运行结果。

- [detectOverflow](https://floating-ui.com/docs/detectoverflow) 在 clipping ancestors 与 root boundary 中计算各侧溢出；根边界默认为 visual viewport，且可指定其他边界。要先明确**面板实际受哪些容器裁切**及当前可见 viewport，不能只用整页或只用图容器的矩形。一个可见交集为空、图容器太矮或面板本身比空间大时，坐标平移本身不能使它完全可见。
- [shift](https://floating-ui.com/docs/shift) 沿对齐轴平移保持原 side；另一轴默认关闭，开启可能覆盖 anchor。它不自动决定避开选中节点、legend、nav 的语义优先级，亦不把过大的面板变小。[size](https://floating-ui.com/docs/size) 根据可用宽高限制尺寸，文档强调可用值可能为负，需要下限、border-box 和可滚动内容；仅设置 `max-height` 若没有合理的 `overflow` 与可达内容，也不能保证关闭按钮可用。保留当前选中区域/legend 避让规则，不将屏幕可见误称“完全不遮图”。
- [autoUpdate](https://floating-ui.com/docs/autoupdate) 明确在需要时针对滚动、resize、元素尺寸/布局变化更新，关闭后清理；并非一个最初 `getBoundingClientRect()` 可以覆盖之后的页面变化。只监听当前确实影响该面板的事件，避免在隐藏状态维持无必要监听，也避免强制无限循环测量。
- [HTML popover](https://html.spec.whatwg.org/multipage/popover.html) 展示时进入 top layer，auto/hint 有 light-dismiss 等语义；[CSS anchor fallback](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks) 可尝试不同位置，但没有合适位置时回到默认，而非保证内容完全可见。top layer 可改变裁切与叠放，也改变关闭、焦点和现有 Viewer 与其他覆盖层协作；原生 fallback 的浏览器版本支持须按本项目支持范围确认。它们不自动保留当前 dock 避让逻辑，不构成此 bug 的低成本直接替换。

## 面向当前问题的最小原则

1. 统一选用 viewport 坐标测量：计算真实 clipping 区域和可视 viewport 的交集及留白，避免将容器坐标与 `getBoundingClientRect` 坐标直接相加；再转换为面板定位的实际 containing block 坐标。保留左右选点时明确可见性优先于节点重叠分数，必要时重新测量最终尺寸。
2. 可用空间足够时将面板移动至可见区域；不够时限制高度并让内容滚动，保证标题/关闭与选项均可键盘到达。短容器如果自身裁切高度小于面板最低可用尺寸，须调整承载/裁切或提供其他可达放置方式；仅做容器内部 clamp 不能解决不可能约束。容器完全离开视口时不能强行声称可见，需明确滚动/隐藏/重定位策略，避免意外干扰阅读。
3. 选择集、trigger、状态、关闭与 Escape/focus return 保持一致；移动面板或采用 top layer 需检查阅读顺序、tab、焦点环、与 diagram-nav/其他弹层以及已有手机布局。位置与大小随面板内容、视口、容器滚动变化而重新评估；更新时避免抖动和遮住焦点。上面是设计建议，非这份报告中的实现或测试结果。

验证对照应重用 Batch17 同一长图和短单 span 页面，记录打开前后真实面板与可见边界、所有控件可点击及 Tab/Escape 可达；加一个面板内容超过可用高度的场景与滚动后位置变化。不能仅测固定样式或只检查 panel 的 DOM 存在。未浏览器测试、安装、运行上游、改产品或远程写入；具体源码原因和最终修补由负责 agent 判断。

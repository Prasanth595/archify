# 源码证据弹层：优先核真实键盘路径，不增加新组件

2026-10-28 source-only。**建议优先排查既有 SourceCard 的实际焦点与关闭行为**，不创建另一份静态 demo 或接入浮层依赖。Quarto 当前上游提供相关源码和完整 keyboard regression fixture；Code Hike 的例子证明注解可贴近 token，但其依赖外部组件行为，不能仅由示例代码保证所有键盘/窄屏行为。

## 去重

历史 [round18-local-reading](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round18-local-reading-smalltools.md) 已研究行注释与源行双向返回；[round22-graph-reading](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round22-graph-reading-interactions.md) 说明 source-keyboard 为已有动作补 Enter/Space，keyboard-traversal 为 QA；[reading-handoff-followup](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/reading-handoff-followup.md) 指出 SourceCard 已有 hover/focus、源码摘录、链接以及 Tab/Escape 处理。此前 notebook 等实验的视觉检查有遍历诊断，不等于每个真实交互都失败，也不能因 checker 数量推断用户无法到达。历史 hub 与当前 scouts 定向检索不等于所有远端语义穷尽。

## Quarto：实际本地代码与强 regression 样例

固定 [quarto-cli@eb1c5db2c12bc8e07cb00e97455b503782d3458b](https://github.com/quarto-dev/quarto-cli/tree/eb1c5db2c12bc8e07cb00e97455b503782d3458b)，2026-10-27 默认分支，项目 [MIT](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/COPYING.md)；bundled Tippy/Popper 为独立依赖，应逐一核许可，不把项目许可覆盖所有代码。官方 [code annotations](https://quarto.org/docs/authoring/code-annotation.html) 有 below、hover、select 等模式：说明文字与行标记关联，hover/select 触发小窗。普通引用和锚点仍是文档语义，不将所有弹层强行认作同一种 ARIA 模式。

固定 [after-body 模板](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/src/resources/formats/html/templates/quarto-html-after-body.ejs#L294-L350) 定义 Escape 和 focusout 插件：Escape 清理延迟并关闭；焦点在弹层时暂禁 trigger、回焦点再关闭以避免重开；焦点从 trigger 或 popup 去二者之外时关闭；监听随 show/hide/destroy 注册清理。相同文件的 [annotation 配置](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/src/resources/formats/html/templates/quarto-html-after-body.ejs#L689-L750) 使用交互内容、标记关联的行高亮、最多 300px、placement fallback；`preventOverflow` 的 mainAxis/altAxis 均为 false，因此**不能由存在 Popper 推断所有窄屏内容必定完整可见**。引用调用通用 `tippyHover`，支持根据原有文献条目生成内容。实际语义还受 Tippy 和生成模板配置影响；未运行本代码。

完整上游测试材料：

- [hover-popups-dismiss.qmd](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/tests/docs/playwright/html/hover-popups-dismiss.qmd)：完整 617B，Git blob `9a080a51e92a8ef6926c101fa9ab3ae619072f48`，含 footnote、citation、xref、带内部链接的 target、code annotation 与下一链接。
- [hover-popups-dismiss-select.qmd](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/tests/docs/playwright/html/hover-popups-dismiss-select.qmd)：完整 200B，blob `c339d3d99d2706f5f5c167a806efe7ca745705d9`，提供 select/Enter/下一链接。
- [完整 Playwright regression](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/tests/integration/playwright/tests/html-hover-popups-dismiss.spec.ts)，blob `0b41541a3c87acd55836ef6c8990c3fc55c1abd7`，SHA-256 `aa33e6090e626b67127e904bb61ab7f9724c0398508bdf0b596b0d64aa2d1e47`。测试代码要求 Tab 进入 trigger 打开 hover、Escape 关闭且焦点留/返回；有内部链接的 xref 可 Tab 进入、Shift-Tab 返回 trigger 保持打开；移到下一链接关闭；select 模式 Enter、焦点离开和 pending 50ms show 的取消。390×800 测的是 focus 离开时 popup 不遮下一链接，**没有证明窄屏每个 popup 的边界几何**。这些是 upstream assertions，非本轮运行或该站生产验收。

## Code Hike：关联 token，但不是可直接移植的键盘合同

固定 [code-hike/codehike@cd81d8af1c503b699cbf0458d504e4578bcb9c74](https://github.com/code-hike/codehike/tree/cd81d8af1c503b699cbf0458d504e4578bcb9c74)，2026-03-17 默认分支，[MIT](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/license)。完整 [tooltip demo content.mdx](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/apps/web/demos/tooltip/content.mdx) 将 `lorem`/`consectetur` 显式连到 MDX 注释；[page.tsx](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/apps/web/demos/tooltip/page.tsx) 匹配 annotation query/title 并以 Radix TooltipTrigger 包住 token，官方 [说明](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/apps/web/content/docs/code/tooltip.mdx) 写 hover 或 focus。它的 [wrapper](https://github.com/code-hike/codehike/blob/cd81d8af1c503b699cbf0458d504e4578bcb9c74/apps/web/components/ui/tooltip.tsx) 转发 Radix primitive；本次没有核对依赖具体构建、Escape、Tab 次序、长/互动内容或小视口，不把其宣称为离线完整证据面板，也不建议引入 React/Radix。

## 对现有问题的取舍

先用真实 SourceCard 页面检验：从引用/节点实际 Tab 进入、trigger 的焦点和展开状态、内容内部链接可达、前后 Tab 是否按页面意图继续、Escape 从 trigger 与卡内各自关闭/恢复、延迟触发后快速离开不重开、窄视口超长摘录/链接不遮焦点且可滚动。把结果与 checker 的起点、Tab 预算和真实实际顺序分别记录；算法遍历诊断不等于实际可访问性结论。若某卡本来只承载非交互摘要，按实际功能决定合适语义；若包含可操作链接，应验证可进入和离开，不预设 tooltip/dialog 一种角色适用于所有卡。

Quarto 的事件生命周期与其 native 完整测试可作为启发，不复制插件或扩大产品依赖。最小修复应该落在已验证的现有责任：必要时处理 focus containment、Escape 与延迟、已有定位尺寸，而不是为每个来源另建一个 focus framework；同时避免影响现有 hover、pointer 和具体焦点恢复。未安装、浏览器、运行上游/测试或更改产品，以上是源码和测试断言，不是可访问性验收。

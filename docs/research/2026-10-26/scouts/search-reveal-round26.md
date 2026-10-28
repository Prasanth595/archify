# Round 26：跨视图搜索结果的显现与状态边界

2026-10-28，只读。**判断：保留一个具体交互检查，不启动 importer 或通用折叠状态工程。** LikeC4 有真实用户反馈和原生代码/测试，可说明“跳到另一视图”与“定位所选元素”要分开核验；但当前找到的完整测试不是端到端过滤/折叠实验，不能声称它自动解除隐藏条件或 Archify 存在同样缺陷。本轮不运行、安装、打开浏览器或改仓库。

## 查重

旧 [graph-reading-round5](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/graph-reading-round5.md) 已研究树的独立折叠状态和 reveal；[round22-graph-reading-interactions](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round22-graph-reading-interactions.md) 深读 d3-graph-viz 的多父节点、BFS reveal 与递归折叠清除后代状态。LikeC4 的模型多视图也在旧 task-view 研究。新 remote 查得 [finder-context](https://github.com/tt-a1i/archify/tree/e219bc5ba4fdf90f653c2fae7eadcc1ceeeda942/experiments/finder-context) 是结果行已有元数据的可访问描述，[finder-highlights](https://github.com/tt-a1i/archify/tree/ed04916f33cca4cc6475eada7b4397694426f3f8/experiments/finder-highlights) 处理输入时当前画布的命中高亮并保留原选择行为；不是新建一个同名搜索列表。当前 Archify 真实行为由协调人的独立审计确定，不能从旧记录预设支持任意图折叠或需要修复。

## 自然问题与完整固定测试

[LikeC4 issue #1711](https://github.com/likec4/likec4/issues/1711) 的真实用户描述：搜索到其他大视图中的元素，打开该视图后结果未被突出，难以再次找到；另一用户指出也要区分元素与其关系。该 issue 记录 release 1.46.0 关闭；不是本轮浏览器观察。[合并 PR #2428](https://github.com/likec4/likec4/pull/2428) 固定 `b7a69c46e2bf67b9ee1f5b691004cd629a85245a`。

完整 [machine.state.navigating.spec.ts](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/likec4diagram/state/machine.state.navigating.spec.ts) 含全部合成输入与断言：空节点/无 `modelFqn`/null/不同 FQN 返回 null；`cloud.api` 与 `node2` 命中；两个同 FQN 返回第一个；还检查导航事件和 context 对象携带目标 FQN。完整 [focused.spec.ts](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/likec4diagram/state/machine.state.ready.focused.spec.ts) 主要断言事件对象及标志形状。**这些是 helper/type 的期望，非跨视图 UI、过滤或折叠的端到端结果；未执行，不夸大为通过或完整复现 #1711。**

## 代码中到底改变什么

固定 [ElementsColumn.tsx](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/search/components/ElementsColumn.tsx) 在搜索模型中按标题/ID/摘要、kind 或 tag 过滤，结果树数据变化后先 `collapseAllNodes()` 再展开拥有 children 的结果树节点；这说的是**搜索结果树**，不是画布层级的通用解除折叠。无关联视图时选择直接返回；一个视图时先发送关闭搜索，相同视图请求聚焦，不同视图将目标 FQN 随导航传递；多个视图进入选视图流程，[PickView.tsx](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/search/components/PickView.tsx) 把目标随候选 view 传递。

[searchActor.ts](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/search/searchActor.ts) 的 close 返回 inactive、清理 `pickViewFor`，没有在该动作重置 `searchValue`；下次打开未携带新文本时沿用 context 现有值。不能将“搜索对话框关闭”泛化为查询或所有图过滤器被清空。[navigating.ts](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/likec4diagram/state/machine.state.navigating.ts) 在新 view 的 xynodes 中按 FQN 找第一个；找到则延迟发 focus，找不到则 fit diagram；代码没有在该步骤证明被筛掉的元素会自动恢复、切换到其他视图或显示无结果提示。它显式关闭 compare-with-latest；历史导航分支可恢复先前焦点、walkthrough 或 viewport，不能把所有导航都简化为统一重置。

[focused.ts](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/likec4diagram/state/machine.state.ready.focused.ts) 入态聚焦关联 nodes/edges 并调整 viewport，退出时 undim、恢复先前 viewport 并清除 focusedNode；Escape 和画布点击可退出。[actions.ts](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/packages/diagram/src/likec4diagram/state/machine.actions.ts) 将 `AUTO_UNFOCUS_DELAY` 固定为 0，因此此 revision 虽传 `autoUnfocus: true`，不会启动定时自动退出；PR 描述中的自动退焦不可替代实际固定源码。这里是静态代码阅读，未声称其他当前版本或浏览器时序相同。

## 可落实的轻量阅读教训

如果某现有阅读器确有搜索到范围外结果的交互，单个端到端检查应先固定完整原图、两个视图、目标稳定身份及初始过滤/折叠/相机状态：选择结果后分别验证目标确实在目标视图且可见、选中/焦点与滚动，确认保留或清理的状态与 UI 提示一致；目标不在可见节点集合时明确说明而不是静默声称命中。再验证 Escape/返回及重复 ID 的既定语义。只有实际产品存在对应能力且用户问题可重现，才考虑局部修复；无需推导隐藏的祖先、跨图身份或新增 state framework。若所有结果只来自当前可见节点，不能虚构跨范围问题。

Structurizr [filtered view 讨论 #117](https://github.com/structurizr/ui/discussions/117) 是用户要重新布局隐藏元素后的图，维护者解释过滤视图共享原布局并建议独立视图；它是另一真实需求，不是搜索 reveal 的测试，也不证明搜索会移除过滤。

上游 LikeC4 完整 [MIT 许可](https://github.com/likec4/likec4/blob/b7a69c46e2bf67b9ee1f5b691004cd629a85245a/LICENSE)，所有完整固定源码/测试以上链接，不复制产物。远程 refs 与 issue 搜索仅限本轮关键词，非全量语义穷举。

## 第 38 批后续

[原生页面补证与源码版本差异](search-reveal-native-round38.md)保留实际成功到图、未跳转和观察器错误。当前 main 自动退焦配置已变为 3000ms；本报告关于 0ms 的结论仅针对当时固定 revision。原生跨图定位仍未获得稳定验收，不据此新增 Archify 功能。

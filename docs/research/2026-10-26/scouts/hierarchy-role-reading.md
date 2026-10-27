# 层级角色与领域类型：D3 与 Cytoscape.js 对照

2026-10-27。仅阅读文档、固定源码和已有研究；没有运行第三方程序、做视觉实验或导入依赖。触发问题是 PubGrub package 的原生 Tree 在 Passport 中显示“外部系统”。并行源码审计确认：Tree schema 不支持作者指定 `type`，要求 containment，renderer 明确由 `tone` 设置 semantic kind；因此这不是 viewer 对缺失类型的回退。本轮使用现有、已文档化的 Architecture 领域命名适配 PubGrub，不修改通用 Tree。**上游参考原则：结构角色、作者领域数据和视觉样式需要分别理解；它们不能直接覆盖 Archify Tree 已有合同。**

## 一手证据和范围

| 项目与固定源码 | 实际行为 | 对本问题的边界 |
| --- | --- | --- |
| [d3-hierarchy v3.1.2，commit `7bea49efdc1093b28a8d60d2f8717d8a17803564`](https://github.com/d3/d3-hierarchy/tree/7bea49efdc1093b28a8d60d2f8717d8a17803564)，[ISC 许可](https://github.com/d3/d3-hierarchy/blob/7bea49efdc1093b28a8d60d2f8717d8a17803564/LICENSE) | [构造源码](https://github.com/d3/d3-hierarchy/blob/7bea49efdc1093b28a8d60d2f8717d8a17803564/src/hierarchy/index.js) 将每份输入放在 `node.data`，另建 `parent/depth/height`；仅非空 children 建 `node.children`。官方[层级 API](https://d3js.org/d3-hierarchy/hierarchy) 明确 root 的 parent 为 null，leaf 的 children 为 undefined、height 为 0；[tree layout](https://d3js.org/d3-hierarchy/tree) 给节点计算 x/y。 | 原始数据与派生结构、布局分开，但这是开发者可以访问的模型，不保证应用不会自行将样式误解为类型。没有 children 只代表此输入层级中无子节点，不证明依赖全集或包的属性。单节点可同时是 root 和 leaf，不能用互斥枚举掩盖这一点。 |
| [Cytoscape.js v3.33.1，commit `72af5edb6cd988851f42dc25f9e1092fd2d9e7cf`](https://github.com/cytoscape/cytoscape.js/tree/72af5edb6cd988851f42dc25f9e1092fd2d9e7cf)，[MIT 许可](https://github.com/cytoscape/cytoscape.js/blob/72af5edb6cd988851f42dc25f9e1092fd2d9e7cf/LICENSE) | [官方选择器和样式文档](https://js.cytoscape.org/#selectors) 区分数据属性选择和 `:parent`、`:childless`、`:orphan`；[固定源码](https://github.com/cytoscape/cytoscape.js/blob/72af5edb6cd988851f42dc25f9e1092fd2d9e7cf/src/selector/state.mjs) 将这些选择器分别委托 `isParent()`、`isChildless()`、`isOrphan()`，由样式表选择视觉属性。 | 这些状态指 **compound containment**，不是普通有向边的入度/出度；orphan 也不是普遍意义的图根。样式与数据分开不阻止作者写一个错误标签。不能把该 selector 直接套到 Archify 的 parent tree 或证明它有同样模型。 |

D3 的孩子 accessor 默认读 `d.children`，也可由调用者提供；它不根据包名或叶角色赋予业务类型。Cytoscape 的 `data.parent` 有专门的复合节点语义，其余数据字段和 CSS 风格规则由作者指定。两者共同启发只是**分离结构判断、作者数据和呈现**；不需要引入 D3/Cytoscape runtime 或复制实现来表达该边界。

## 可检验的边界（不是 Tree 新合同）

| 输入情况 | 可陈述的信息 | 不应推断 |
| --- | --- | --- |
| 无显式领域类型的 root / branch / leaf | 在当前给定树中是否有父节点、子节点；必要时用中性节点文案或省略类型文案 | 外部系统、服务、包来源、依赖已完整或具体领域类型 |
| 支持显式领域类型的其他模式 | 根据该模式合同保留作者类型；如同时提供层级角色，两者独立理解 | 根据 branch/leaf 改写作者类型或用它推断不同类型 |
| 单节点 | 无父且无子，两项均成立 | 只能是 root 或 leaf 的其中之一 |
| 折叠 branch | 原始树中仍有子节点；当前可见后代可能为零 | 由于隐藏而把 branch 重判为 leaf |

上述是跨模型阅读边界，不是对 Tree 输入的新增要求：Tree 不接受作者 `type`；containment 是已有合同，tone-to-kind 是本轮确认的实现行为。不能将无类型输入当作 schema 遗漏，也不能因此认定 tone-to-kind 的语义呈现合理。本轮不提出通用 Tree 修改或显式类型 Tree fixture。对于本次 Architecture 适配，验证其领域命名与原始 PubGrub 事实一致，保留完整原生报告及范围，不把节点终点解释成 registry 全量或依赖终点。模式支持显式类型时，才按该模式合同另行检验类型呈现。静态源码和测试通过都不足以证明读者收益；如需证明收益，按既有研究用完整同源材料和独立读者比较。

## 与既有研究去重

历史基线 `60342aa9e40618aeb7c33bdb8d65889fea3a588e` 的 [component identity](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/component-identity-smalltools.md) 已论证名称、引用和出现位置不同以及缺失 children 不能自动证明依赖为空；[graph exchange](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/graph-exchange-smalltools.md) 已研究 Cytoscape GraphML 插件导入导出的数据与样式限制；[graph reading round 5](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/graph-reading-round5.md) 已讨论 compound folding 和现有 Tree 折叠；[type reading](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/type-reading-round8.md) 讨论代码类型和推导，而非 UI 业务类型。当前 [dependency conflict](dependency-conflict-reading.md) 已固定 PubGrub 合成 fixture、两份完整原生报告和阅读实验边界。本次只补充“结构角色不能充当领域类型”的具体缺陷参照，不重复引入这些方向。

风险与成本：领域命名必须符合选用模式的合同，且不能将图形角色转述为上游未提供的事实；仅静态源码和文档不足以断言实际效果、渲染截图或读者表现。上游项目和许可仅作研究来源，本次未复制其代码。

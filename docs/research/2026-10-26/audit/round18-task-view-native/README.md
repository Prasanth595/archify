# Task-view：新版原生 Flow → Graph → Tests 实际检查

本轮直接操作 [官方示例](https://gtindo.github.io/task-view/)，不是 Archify 新实现。来源固定到 [a3fa21767bfaeb3077fdda08bddb7249366caa93](https://github.com/gtindo/task-view/tree/a3fa21767bfaeb3077fdda08bddb7249366caa93)；该源码比此前研究版本多两个提交。实际页面页脚显示 `main-a3fa217`，示例评审的代码版本是 `1219994`，这两个版本不能混用。[完整源码分析](../round18-task-view-delta.md)区分固定源码、在线部署和既有 Archify 实验。

## 实际操作和观察

使用同一 Ego 空间 24、Chrome 156.0.8078.48，先在 Flows 点击 `builder.excerpt`，再切换 Graph。原生页面带入 `TestOpenWritesPage → builder.excerpt` 的 tests 关系，节点明确标为 `agent says: passed`。点击 `+1` 后增加 `excerpt (page data)`，再点击 `−` 回到两节点；切到 Tests 1 也显示该声明关联。重新加载含 focus 的 URL 后，两节点和所选 builder 恢复，Inspector 回到 Code；没有声称 Tests 子标签也被保留。

| 状态 | 实际图片 | 记录 |
| --- | --- | --- |
| 原始 Flow | [概览](flow-overview.png) | 水平滚动区域包含完整 flow，截图仅显示当时视野 |
| 选择 builder 后的 Graph | [两节点](graph-two-nodes.png) | [状态](graph-two-nodes.state.json) |
| 展开邻居后等待稳定 | [三节点](graph-expanded-settled.png) | [状态](graph-expanded-settled.state.json) |
| 收起邻居 | [两节点](graph-collapsed.png) | [状态](graph-collapsed.state.json) |
| Tests 1 | [关联测试](test-association.png) | [状态](test-association.state.json) |
| URL 重新加载 | [恢复](url-restored.png) | [状态](url-restored.state.json) |

左侧 Agent notes 同时说明该测试只检查页面写出和嵌入数据，**没有覆盖 app.js tabs**。本轮没有运行这个历史测试；页面的 verified 引用徽标也不等于行为测试已通过。这里证明原生工具已经提供声明测试、范围选择及邻居展开入口，不证明读者更快，也没有完整键盘或辅助技术验收。

初次展开图片 [graph-expanded.png](graph-expanded.png) 捕获了布局尚未稳定的状态，保留但不作为最终布局结论。前三张探索图是 1440×900；后续调用恢复到实际 1291×762，状态记录如实保存。稳定展开、收起、Tests、重新加载使用后者；不做跨尺寸像素比较，也不把右侧部分裁出视野称为响应式验收。等待稳定只核对公开 DOM 标签几何，未调用或修改应用内部图状态。

## 来源、输入和复现边界

[原始示例输入](change-show-code-after.json)复制自上述固定源码的 `demo/change-show-code-after.json`，SHA-256 为 `32096a6cd5ff27bce5fe3eeea8a318750608722e038b1a001dca9710cbd3aec5`，12 节点、8 边、1 flow。它与 Archify 历史 task-flow-tests 的缺产物路径不是同输入，因此不能据此宣布原实验失败或已被替代；进一步比较必须先统一事实和问题。本轮不新增同义 graph focus/测试列表实现。

调研阶段读取的在线 HTML 为 2,567,514 bytes，SHA-256 `bdec374b0046ee88eed895556518f47e4fd03e3308148bd667b9c5a73ba50af1`。本档案未复制其内嵌依赖，浏览阶段核对的是页脚版本与实际交互，不是逐字节重建证明。在线 URL 会变化；复现时先核对版本，再按上述步骤操作。冻结源码、输入和记录可用于重建对照，本轮没有安装或自行构建 task-view。

Task-view 与示例版权为 Yvan Guekeng Tindo，保留 [MIT 原文](TASK-VIEW-LICENSE)。上游内嵌 Cytoscape、cytoscape-elk 的 MIT 及 ELK 的 EPL-2.0 单列于 [原许可文本](VENDOR-LICENSES.txt)，不以主仓库 MIT 概括全部依赖。截图归属上游界面，本轮生成的是检查截图，未重绘或裁剪。

URL 恢复时的版本选择器误匹配了 script 文本，原始调试 JSON 留在本机；公开副本只保留可见 Generated 页脚，变换和原始/公开哈希见 [derivation](derivation.json)。这不是隐藏或改写交互结果。

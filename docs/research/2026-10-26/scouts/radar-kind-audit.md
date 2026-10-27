# Round 15：Tree / Timeline Radar 色彩源码核对

对照 d5d97949 与已交付 a15fbd6e、e5bc4cf0；未运行测试、浏览器或改文件。**未发现这些 kind 替换造成 Radar 配色回归。** 以下为源码 CSS 计算推论，不是本轮实际 GUI 颜色观察。

两个分支的 `viewer/semantic-radar.js:70` 均把节点 `data-node-kind` 原样写入 Radar 矩形 `data-kind`。默认 `.overview-map-node` fill/stroke 为 `var(--backend-stroke)`（两个分支 `viewer/viewer.css:1139-1142`，生成模板 `archify/assets/template.html:1308-1311`）；因此缺少专门选择器不一定是缺色。

- Tree：`archify/renderers/tree/render-tree.mjs:440-443` root/branch/leaf 原 tone 分别 frontend/backend/external，passport 改为 tree-root/tree-branch/tree-leaf；`viewer/viewer.css:1148-1162` 和生成模板 `:1317-1330` 分别将 tree-root、tree-leaf 显式映射原 frontend、external。tree-branch 没有专属 Radar selector，但其原 backend 与默认 backend 相同，fill/stroke 保持相同；不是漏色回归。
- Timeline：`archify/renderers/timeline/render-timeline.mjs:31,485-488` default/change/alert/action/recovery 原 tone 分别 external/frontend/security/messagebus/backend，passport 改为 `timeline-*`。`viewer/viewer.css:1148-1163` 和生成模板 `:1317-1332` 显式映射 default、change、alert、action 回各原色；timeline-recovery 无专属 Radar selector，但默认 backend 与原值一致。无 demonstrated missing selector 改变原颜色。
- Outline 与 Radar 不同：两个分支 `viewer/node-outline.js:19-22,78` 从 SVG 子元素 `c-*` class 取 tone 并设置 `--outline-tone`，不是从 `data-node-kind` 取色；两个 renderer 的 patch 保留 tone 和绘图 class，因此以上 kind 改动本身不改变该来源。

`test/semantic-radar.test.mjs:157-179` 包含 Radar 创建、节点与交互的源码断言，后续含位置浏览器测试；未找到针对 Tree/Timeline 新 kind 的 computed fill/stroke 比较。现有测试通过记录不应单独表述为验证两类 Radar 配色；本次结论来自 exact commit 的 source 与生成模板对照。

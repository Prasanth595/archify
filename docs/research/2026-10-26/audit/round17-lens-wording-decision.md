# Batch 17：共享 Semantic Lens 说明文案决策

固定产品基线 `origin/dev=d5d979493bba650b3995836afd379cd249f2d0dd`，只读，无实现、测试或新浏览器运行。结论：**建议小范围修正文案，有具体准确性价值**。不是新分类或功能：Batch 14 已保存的 Waterfall 实际页面在父子嵌套上显示 real traffic，而这些边仅表达作者声明的 parent 关系，不能由此认定流量。该事实证明文案与已呈现关系的语义不一致，不证明用户实际误解或量化阅读收益。

## 代码证据

- `viewer/semantic-lens.js:29-47` 按 node ID 去重并按 `data-node-kind` 统计节点；`:50-59` 读取 `[data-edge-from][data-edge-to]`，按 edge key（无 key 时 from/to/label）合并成员。`:394-409` 一种类型匹配任一端，触及边计数每组一次；两种只匹配两类间的直接边并按两个方向计数。`:419-425` 单类同时保留相邻节点；没有查询、测量或推断真实请求流量。`:270-287` 可以绘制视觉 flow overlay，也不改变其证据来源。
- `archify/renderers/waterfall/render-waterfall.mjs:299-310` 明确把 parent/child 结构作为带 focusEdgeAttrs 的 guide；Batch14 的 `docs/research/2026-10-26/audit/round14-waterfall-native/README.md` 保存该固定基线页面的 Finder、Passport、Lens 观察。对有零条关系的图，Lens 依然可显示所选节点，因此文字应说“显示节点及其相连关系”，不要承诺必然有边。
- `archify/locales/en.json:355,357` 的标题 `Compare system roles` 和说明 `One reveals its real traffic` 对结构/事件图都偏窄；`viewer/viewer.css:1217-1219` 也重复 real traffic，但它是维护注释而非可见 UI。`viewer/template.source.html:593` 使用 i18n token；编译模板/HTML 自带文案，已导出的旧 HTML 不自动更新。

建议英文标题 `Compare semantic kinds`；说明 `Choose up to two semantic kinds. One shows its nodes and connected relationships; two show only direct relationships between the two kinds.` 简体可用“最多选择两种语义类型。选择一种可查看该类型的节点及其相连关系；选择两种只显示两类之间的直接关系。”关系指图中编制的边，不是观测 traffic；若要更明确，可将英文 connected relationships 改为 `connected diagram relationships`，中文改为“图中相连关系”。按源码所示选择顺序，两种显示两个方向，且没有同类边。单次选择节点按 ID 计数，关系按 edge group 计数，不暗示请求量。

## 范围、兼容与成本

- `archify/locales/manifest.json` 注册 en、zh-CN、zh-TW、es、ko、ar 六个 bundled catalog，全部当前有该键；`archify/examples/locales/{de,fr,it,ja,pt,ru}.json` 六份示例 locale 覆盖同一键，不能只改英文声称全部语言修正。俄文已有“真实关系”而非 traffic，仍应避免暗示已实测关系。翻译需自然且保留单类/双类差异。
- `archify/renderers/shared/i18n.mjs:12-16,151-159` 的有效文档 `meta.translations` 优先于 bundled，英文为最终 fallback；不得覆盖用户明确文案，也不能保证作者显式旧文案被改写。Timeline 实验分支 `e5bc4cf` 的 `render-timeline.mjs:40-46` 已自行使用现有中性文案且保留作者覆盖；Tree `a15fbd6e` 的 `render-tree.mjs:38-44` 使用 tree 专属文案映射。此提案固定 d5，不声称这些分支已合并，未来合并时避免覆盖其专属约定。
- 原文和内嵌 i18n 复制在已有 example/gallery HTML；遵循仓库生成流程更新规定产物/包，避免声称已存在外部 HTML 会自动更新。成本主要是 12 份翻译及生成物和验证；无需改 kind、边、hash、选择逻辑、URL、画布、测量或引入框架。标题同步可解决结构图被叫系统角色，但若担心 scope，至少修正文案中的 real traffic。

## 去重与最小验证

检查 `/tmp/archify-round17-remote-heads.txt` 的 lens/wording/copy/traffic/semantic 名称和本地全 refs 相关提交标题，未见同项；名称检索不是 313 refs 的全文穷举。GitHub issue/PR 查询 `"semantic lens" traffic` 和 `"semantic lens" wording` 返回空；相关 open #83 请求多类型比较与 hover 一致性，不是这一措辞修复。Tree/Timeline 实验已有针对各自模式的中性文案，不能算共享各 renderer 的修复。

适合的最小验证：校验所有 bundled 和示例 locale 键可加载且占位符契约不变、无覆盖改变；用已有 Waterfall 固定输入检查一种/两种选择及节点/边数量与旧版相同，并在页面检查英文/中文可见说明、零关系情形及面板文字换行；必要时检验用户显式覆盖优先和英文 fallback。按仓库生成物流程确认模板及相应示例一致。这里不需要全新性能实验或扩张 taxonomy；不将预期验证当已执行。

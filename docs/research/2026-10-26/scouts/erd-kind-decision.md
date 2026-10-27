# Batch 15：ERD database kind 是粗分类，当前不值得另做 raw-token 修正实验

日期：2026-10-28。固定产品基线：`origin/dev d5d979493bba650b3995836afd379cd249f2d0dd`（root refresh 后未变）。本轮只读固定 SHA 源码、shipped JSON/HTML、已有测试/研究和 GitHub 原始讨论；没有运行测试、render、browser、checkout、源码编辑、安装、push 或 PR。本文件是唯一新产物。

## 决策

**拒绝本轮 ERD kind 改名实验：现有证据支持“Database 是粗的技术家族标签”，不足以将它判成与 Tree/Timeline/Waterfall 同等级的具体错误身份；新增 Entity 标签的边际信息很少。**

Entity / table 是更精确的图内对象名称，但当前 renderer 已在每个节点的本地化 context 写入 Entity，并以表名、字段定义、键和 crow's-foot 关系表达对象。没有找到输出声称每个 entity 是独立数据库实例、把字段定义当已存在 record、改变 entity 选择集合或编造部署事实的消费者。这个判断不需要先做人类研究：输入/输出及实际消费路径已经能区分“更精确文案”和“缺乏来源的分类事实”。

不声称 Database 是最理想术语，也不将所有未来 ERD kind 改进否决；本轮不把可选命名精度升级为新的 raw-token/API 迁移工作。

## entity、record、database 分别表达什么

| 用词 | 对当前 ERD 对象的准确度 | 当前证据 |
| --- | --- | --- |
| Entity / entity type / table | Entity 是本产品的正式输入集合名；在当前表格 renderer 中，更完整的理解是实体类型/表结构定义 | README: entity.label 是 table name，attributes 是字段；schema 是 entities/attributes/relationships；每个属性有 name/type/key/references，没有个别业务对象的实例值 |
| Record | 若指一行已存在的数据，会比 Database 更容易制造错误：customer 盒子不是某位客户的实际记录 | JSON 展示列名、列类型和键，不包含该条 customer 的 id/email 等实例值；某些作者说明将 reference tables 宽泛称 reference rows，不等于 renderer 已取得记录数据 |
| Database | 作为数据库/持久化领域家族较粗；若读作部署数据库实例则不精确，但当前通用 kind badge 没有规定它一定是实例粒度 | 所有节点在 ERD 中同属 data-model 图，context 已标 Entity；Lens 文案是 `{count} {label} nodes`，不是“{count} database instances” |

因此“Database 节点 + Entity context”是两层粒度不一致的 taxonomy，但没有由现有消费者推出六个数据库实例的必然命题。不能只因局部单词更喜欢 Entity，就声称系统已经作了那条更强的错误事实断言。

## 固定源码与 shipped 对照

- `archify/schemas/erd.schema.json:145-234`：entities items 只有 id/label 必填；sublabel/tag/row/col/pos/width/attributes 等，attributes 有 name/type/key/references。没有 authored kind，也没有 entity-instance/record 值模型。
- `archify/renderers/erd/README.md:36-46`：明确实体承载 table name、attributes 和 placement，键允许 pk/fk/uk 组合，FK 引用已声明实体字段。
- `archify/renderers/erd/render-erd.mjs:1411-1428`：kind 恒为 database；context 为 `node.context.erd`；主 SVG 仍使用 c-database 与 database sigil，tag 控制 domain hue，不根据顺序、状态或任意 palette 改写 kind。
- `archify/locales/en.json:51,440`：分别是 `viewer.kind.database = Database` 与 `node.context.erd = Entity`，所以 Entity 并非当前系统完全没有的概念。

本轮读取 `archify/examples/orders.erd.json` 与已提交 `archify/examples/erd-orders-rendered.html`：

| entity ID / label | authored domain tag | shipped kind | shipped context |
| --- | --- | --- | --- |
| customer | accounts | database | Entity |
| order | checkout | database | Entity |
| order_item | line items | database | Entity |
| product | catalog | database | Entity |
| inventory | catalog | database | Entity |
| payment | checkout | database | Entity |

原始 JSON 有 6 张表，分别声明 4/7/6/7/6/6 个属性，标题是 Order management schema；不是六个部署节点或六条客户实例。另读取 `subscription-billing.erd.json`：11 张表、accounts/catalog/billing/payments 四个领域，仍是 schema reading。它们是 shipped author examples，不是本轮取得的真实数据库或用户采用记录。

这些观察证明粗标签存在并且上下文已经明确对象，并不证明每名读者都能正确理解，也不冒充本轮浏览器验收。

## 已有消费者与改动是否增值

1. **Passport / Finder。** `viewer/focus.js:456-462` 并排读 kind、detail、context、tag；Entity context 已被显示。`viewer/node-finder.js:57-80,165-166` 索引 kind/context/tag 等，结果行显示 kind，title tooltip 保留 context。改为 Entity 会让可见 metadata 更精确，但不会增加原来缺失的搜索事实；Entity 已在索引 context。ID 点击/reveal 不依赖 kind。
2. **Lens。** `viewer/semantic-lens.js:37-47,374-391,431-443` 按 kind 分组、选择与计数。ERD 恒为 database，本就一个组；改为 entity 仍然一个组，集合及数量不变。它既不会新增 transactional/reference/junction 分类，也不会修复某种错误服务/结构分组。`archify/locales/en.json:367-373` 使用“Database nodes”，没有代码将这个数量输出为“独立数据库实例数”。
3. **Legend / gateway。** `render-erd.mjs:432-437` 的图例是 pk/fk/uk/one/many/optional，明确 interactive:false（指 counted node bridge）；README:172-179 解释这些是 column keys / relationship ends，另用 SVG hover/focus 高亮字段/glyph。`LEGEND_HOVER_RULES:1477-1483` 依赖 er-row、er-badge、er-ends 和 marker ID，不依赖 node kind。不能因 kind 改名声称获得更准确的 PK/FK/cardinality 选择。shared semantic-legend-gateway 也没有把这些字段/关系图例当 database node kind。
4. **Story。** `archify/story/tool.mjs:49-59,77-79` 导出 kind/context，但依据 data-erd-ui 或 er ends 独立识别 structure=erd，defaultAction=relation；它不是靠 database kind 把 ERD 当部署图或请求 trace。`story.js:241-250,339` 会用 kind 尝试找 node-kind legend；ERD legend 没有 data-legend-kind，故当前没有一个 Database 说明卡被错误重用为列/基数图例。本轮没有发现自动生成“六个数据库”叙事的路径。
5. **Radar 与 visual token。** `viewer/semantic-radar.js:70` 将 node kind 投影为 map rect data-kind；`viewer/viewer.css:1150-1151,1317-1318` 给 database 的 Radar/Lens 用数据库色。`viewer/focus.js:779-794` 还将 database endpoint 的 relationship token 归类 data；直接改 entity 会落入 call fallback（除非关系类先命中其他规则）。这些都是真实依赖，不能把 raw kind 改名叫“纯文案、零视觉影响”。图例 glyph 关系依旧是 ER 关系，不能因 token 重命名改变该事实。

Lens 默认 system roles / real traffic 的通用文案对结构图是否合适是另一个有价值问题；把 database 改为 entity 并不能修复这段默认说明。本轮不顺手扩大为所有结构图的 Lens 文案改造。

## 一对一 compatibility 可做，但不等于收益足够

与 Waterfall 不同，ERD 旧 database 始终是所有实体，因而 **在 ERD 范围内** `#lens=database → entity` 能保持选择集合；不存在多服务循环或 error override 的非可逆问题。其他图的 database 仍须保留原义，不能全局改名。

若未来明确要改 raw kind，最小成本也至少包含：

- 一个 canonical `viewer.kind.entity`（或明确选择 erdEntity/erd-entity）的所有 catalog 及 fallback，renderer token，已有 `viewer.kind.database` 显式 override 的范围与优先级。
- ERD 专属旧 hash alias、新复制链接，以及 Finder type 搜索与已有外部 SVG/Story raw kind 的有意变化说明。不能承诺任意外部 API 无变化。
- 保留 Lens / Radar 的数据库 palette、用户 CSS 配置，并保留关系 token 的 data 行为，避免因词汇精度反而造成新视觉含义。
- shared Viewer template 重建、相关消费者与 locale 的聚焦验证，以及最终产物/包同步。没有必要新建 schema kind 或可推断的 transactional/reference/junction 分类。

这些都是可控成本，不是技术障碍；但得到的主要结果仍只是现有 Entity context 旁边另一个 Entity 标签。本轮没有一个因粗 taxonomy 而失败的具体读图任务或数据损坏边界，收益不足以单独承担这一轮迁移。

## 更便宜的现有能力

如果某张图需要把 kind badge 明确写为 Entity，现有 `meta.locale` + `meta.translations['viewer.kind.database'] = 'Entity'` 已能在该文档内覆盖 Viewer 标签，同时保留 raw kind、旧 hash、Radar 和 data-token；shared cli:33-36、i18n:157-172、viewerKindLabel:709-713 的代码直接支持这一组合。该键当前就是合法 canonical key，不需发明新 runtime。这里是源码可推出的能力，**没有本轮执行其 render 或 browser 验证**。

这个 display-only 方案仍会让 Passport context 和 badge 都说 Entity，且 Story raw kind 仍是数据库技术家族，因此它不是完整语义迁移；但恰能说明单张图的文案精度需求已有便宜控制，不必先扩公共 token。

## remote 去重与产品决策

- GitHub live issue 搜索：`repo:tt-a1i/archify "ERD" "kind"`、`"Entity" "Passport"`；PR 搜索 `"erd" "semantic"`，各自上限 20。结果涉及 ERD 原提案 #115、Viewer extraction #666、task checklist #1114/#1119 以及跨 Viewer release/fix，未发现搜索结果中专门要求 database→Entity kind 改名的 issue/PR。搜索范围有限，不声称没有任何同义提案。
- **重要原始合同**：[Issue #115 maintainer comment](https://github.com/tt-a1i/archify/issues/115#issuecomment-6162488004) 明确实现来自 #399、已进入 v3.1.0，最终合同是 entities / key attributes / FK references / 两端 cardinality / shared Viewer；early kind/attribute-cap sketches 在 review 中修订。最初提案的 transactional/reference/event/junction/external enum 以及作者后续评论都是历史提案，不能当成当前缺失功能的获批要求。
- 相关 remote branch `origin/codex/lab-dbml-erd = 358c77e05eb54a3f10ad3bcbb8f196eb8f277ccd`：读取其 README，并检查相对 fixed dev 的 ERD renderer / Viewer / Story diff 为空。该实验是受限 DBML→原生 schema 的映射及 primary-key spelling 接受，不是 passport identity 修正，也不重复提出新 importer。
- 保留 Batch13 `docs/research/2026-10-26/scouts/timeline-waterfall-kind-audit.md` 的原判断：ERD 恒定 database 比 Entity 粗，但不是随机 palette 冒充领域类型。Timeline 已独立做的 `e5bc4cf09129a4f2f49fb799318d18111d9331b0` 不构成 ERD 也必须改的理由。

## 何时重新打开

只需一个具体可核的触发即可重新评估，不必先组织人类研究：例如某个维护中的消费者把每个 database kind 当成部署数据库实例并产出错误结论；明确产品决定 node kind 在所有图中必须严格表示图内对象角色且现成 context/override 不足；或者 ERD 新增作者明确声明、确实需要区别选择的实体类别。届时针对那个边界决定 display-only 还是 raw token，不用统一命名整齐来代替用户价值。

本轮结论是 **confirmed coarse taxonomy / no demonstrated harmful consumer claim / reject low-value churn**，不是对现行词汇的完美背书，也不是一项待审批实现。

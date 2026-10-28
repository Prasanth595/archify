# PRLens data-model 刷新：列变更、键迁移与声明边界

2026-10-28，约16:05（Asia/Taipei）查询。**结论：能力更新真实，但本轮建议0个Archify实施项。** 新增的有用任务是审阅一次schema变更中“计费归属从User移到Organization，旧键为何消失、新键指向哪里、哪一列类型变了”，而非只看一张当前ERD。PRLens已经把列级状态、原类型、列端点关系与三步讲解放在同一个受控样例里；在没有另一个尚未被上游UI或普通before/after ERD＋列清单解决的具体任务前，再包装一页同数据，不足以抵销新投影合同和维护成本。

本次是primary-source只读研究。没有运行PRLens、模型/provider、迁移、数据库、上游测试或Archify；没有安装、渲染、打开浏览器、修改索引/实验、commit或push。只写本报告。下文的UI判断来自当前公开renderer、已提交SVG golden和格式/交互协议，不是对线上canvas的实际点击验收。hub当前本地HEAD为`2c83780d646be256d668ae0433f561b13253158f`；其他agent新增的scout文件保持原样。

## 1. 28 commits包含什么，哪些已研究过

用户上次固定版本为`39750d165efd824d1203df7793ecbfed35b6361e`，本次固定`457987102b40b7d64a221924d420a0632f0395f7`。GitHub官方compare API返回`ahead_by=28,total_commits=28`，其中包含data-model schema/renderer/CLI/skill、新fixture、路由和长表修订，也包含发布、依赖、README及provider请求拒绝redirect的修复；不能写成“28项都是新数据模型能力”。[固定compare](https://github.com/coldteadotai/pr-lens/compare/39750d165efd824d1203df7793ecbfed35b6361e...457987102b40b7d64a221924d420a0632f0395f7)

本hub的[reading-state](reading-state.md)已经在`918ffe82cb1dd71d20ce70b27917aeb80a7a4b49`报告data-model lens和长表省略。官方commit列表中，918ffe之后到本次457987只有两项同主题provider redirect修复。因此本轮增量是**把完整billing-org、列/关系语义和Archify适配边界核清**，不是把已报告的lens再算一个新方向。

## 2. 固定文件、字节与许可证

全部按本次完整SHA从GitHub官方contents API读取，base64解码后计算UTF-8原bytes的SHA-256；不是网页排版字符数。原始raw请求曾在一个后续文件发生IncompleteRead，最终下表均以完整contents API重取为准。本报告没有复制上游实现或把下载不完整的内容当依据。

| 固定路径 | bytes | SHA-256 |
| --- | ---: | --- |
| [packages/schema/examples/billing-org.graph.json](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/examples/billing-org.graph.json) | 15282 | `84ae148098c54a485bd5119bbf598b9f726e079f456429ecf5ebba759d317934` |
| [packages/schema/src/graph.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/graph.ts) | 23732 | `e462316ac33098bb0e194a1abac3857f13d6d6ad193166d7d29bd46ce263e10d` |
| [packages/schema/src/integrity.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/integrity.ts) | 15109 | `64316f652adbe6d1d22d102b60e39accd57976c81ca6fe6efecdc4548ff013ce` |
| [packages/renderer/src/svg/datamodel.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/svg/datamodel.ts) | 11932 | `e6ed9eeb2bd6d8da6be4007471cb3829c0621f016cd54631592cb3112862b704` |
| [packages/renderer/src/layout/datamodel.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/layout/datamodel.ts) | 21056 | `1f8657fd8f56e65f3b46e83de4c4b40e8245a569226015e74d5fdafa917e7240` |
| [packages/renderer/src/svg/styles.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/svg/styles.ts) | 4697 | `13899d12b0651e79b17cabb0a8f34a36a32654694943e366a40a2c2e18514581` |
| [packages/schema/src/primitives.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/primitives.ts) | 10685 | `a956a2389a5e2453f8e81a8a8e49ddd299f32cd92dac09dfb3166a38b817b062` |
| [packages/cli/src/prompt.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/cli/src/prompt.ts) | 8429 | `eacbee7a6ff1e23170e463b6b78208d46f7d5bc9fd2fee620a4ee3d149fbdba0` |
| [packages/schema/src/examples/billing-org.ts](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/examples/billing-org.ts) | 10409 | `27436ebd0569a7ecd94b751c6b35101a1be88837a18c5067d8b087105c83fd00` |
| [根LICENSE](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/LICENSE) | 1067 | `f95e90af396c71c9a94648bd58e4f5bb2dcab4f6ac3ab7d3d2ca3f4e4f4a1ae7` |

根、[schema包LICENSE](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/LICENSE)与[renderer包LICENSE](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/LICENSE)完整读取，三份均为1067B同hash的MIT，署名`Copyright (c) 2026 Coldtea AI`。官方受控fixture可以作为明确标识的参考材料；后续若分发其原件或实质复制实现，应保留完整MIT及上游署名。许可允许复用不等于数据来自生产或迁移已执行。

## 3. 完整billing-org样例的实际语义

这是官方`pr-lens-examples`生成的reference document：声明`acme/billing`、示例base/head与PR412，以及11 files/+212/−64等literal。它是完整受控fixture，不是本轮从该PR取回的原始diff，也没有附可独立核验的数据库执行结果。官方TS注释明确称其为reference document与renderer golden输入。不能把里面的`migrations/0042_billing_by_org.sql`路径或provenance字符串当成本轮已读取那个迁移文件的证据。[样例定义](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/examples/billing-org.ts#L4-L30)

完整输入除了dataModel，还含API lane、2个服务节点、1条新增调用关系、0条flow、2个view、3个walkthrough步骤。完整dataModel是3个Postgres store（Identity/Workspace/Billing）、6表、32列、8条关系；**“完整fixture”不等于完整生产数据库**，本lens合同本来就是一次变更触及的表及其所需未变上下文。

以下列名全部保留；`=`未变、`+`新增、`−`移除、`~`修改：

| 表 / store | 表状态 | 完整列声明 |
| --- | --- | --- |
| user / identity | modified | =id(uuid,PK)，=email(citext)，=name(text)，−stripe_customer_id(text)，=created_at(timestamptz) |
| session / identity | unchanged | =id(uuid,PK)，=user_id(uuid,FK)，=expires_at(timestamptz) |
| organization / workspace | added | +id(uuid,PK)，+slug(citext)，+name(text)，+owner_id(uuid,FK)，+plan(plan)，+stripe_customer_id(text)，+created_at(timestamptz) |
| membership / workspace | added | +id(uuid,PK)，+org_id(uuid,FK)，+user_id(uuid,FK)，+role(member_role)，+accepted_at(timestamptz) |
| subscription / billing | modified | =id(uuid,PK)，−user_id(uuid,FK)，+org_id(uuid,FK)，=stripe_subscription_id(text)，=status(sub_status)，=current_period_end(timestamptz) |
| invoice / billing | modified | =id(uuid,PK)，+org_id(uuid,FK)，=subscription_id(uuid,FK)，~amount_cents(int→bigint)，=status(invoice_status)，=issued_at(timestamptz) |

列状态计数为14 added / 2 removed / 1 modified / 15 unchanged；表为2 added / 3 modified / 1 unchanged。改的是**订阅/发票的归属与列类型**；没有“旧Stripe客户数据已搬迁完成”的记录，也不能据两列相同名称推导具体数据回填、部署先后或兼容窗口。

8条关系均从持键列指向被引用列：

| ID | 完整端点 | 状态 |
| --- | --- | --- |
| session-user | session.user_id → user.id | unchanged |
| org-owner | organization.owner_id → user.id | added |
| membership-user | membership.user_id → user.id | added |
| membership-org | membership.org_id → organization.id | added |
| subscription-org | subscription.org_id → organization.id | added |
| subscription-user | subscription.user_id → user.id | removed；标签说明原来向user计费 |
| invoice-org | invoice.org_id → organization.id | added |
| invoice-subscription | invoice.subscription_id → subscription.id | unchanged |

关系为5 added / 1 removed / 2 unchanged，**没有modified关系**；8条`enforced`全为true，没有false实例。官方TS注释概括“every column and relation state”，实际枚举不能据此扩成覆盖所有关系状态。样例也没有index列、nullable或唯一约束声明。[完整JSON](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/examples/billing-org.graph.json)

## 4. 新字段保证什么，不保证什么

`graph.ts:251–335`定义列key为primary/foreign/index、列delta、可选previousType、store、表与精确列端点关系；relation.enforced默认true。store可以是database、schema或namespace，table还可指collection/key family。`integrity.ts:116–159`核重复ID、store存在、表内列名唯一、关系两端表/列存在、data-model lens声明；它没有读取SQL、比较真实before/after catalog、校验回填完成或证明外键已在数据库建立。[格式定义](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/graph.ts#L251-L335) · [引用完整性](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/integrity.ts#L116-L159)

**跨store与enforced不能自动互推。** fixture里5条跨lane关系（org-owner、membership-user、subscription-org、subscription-user、invoice-org）仍显式true，三个store都是Postgres分组。prompt要求按schema/domain拆lane，同时建议跨store或未被约束的引用false；schema本身并无“跨store必false”校验。这是作者需要明确的语义，不能把lane边界当不同数据库引擎边界，或宣布这份完整fixture违反已执行数据库规则。[Store语义](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/schema/src/graph.ts#L267-L280) · [提取prompt](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/cli/src/prompt.ts#L35)

渲染没有忽略enforced：`datamodel.ts`调用`relationAttributes`；后者把false画成`2 4`点线，和removed的`5 4`删除虚线分开。这个机制由源码确认，但**billing-org全true不能充当false样例或其运行验收**。[paintRelation](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/svg/datamodel.ts#L237-L263) · [relationAttributes](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/svg/styles.ts#L107-L112)

差分事实分三层：

- **可直接核的fixture事实**：JSON某处确写removed、previousType=int、8条端点与enforced=true；完整文档能复算上述计数。这是已提交声明的事实。
- **Agent/作者解释**：列为何removed/added、计费归属如何变化、是否逻辑引用、summary和walkthrough故事。正常CLI以diff提示模型产生这些字段；prompt要求provenance及原始diff统计由仓库侧填充，不能反过来证明模型选出的schema语义正确。[prompt输入与元数据边界](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/cli/src/prompt.ts#L55-L76)
- **本轮未建立的事实**：实际SQL迁移确与声明一致、真实FK/唯一性/nullability、数据回填、生产运行和新旧版本兼容。类型名安全格式与ID完整性校验也不补成这些证据。

## 5. 上游已有UI与普通ERD对照

| 阅读任务 | 上游本版已经提供 | 普通before/after ERD＋列清单 | 对Archify的新增价值判断 |
| --- | --- | --- | --- |
| 哪些列到达/离开，类型原来是什么 | 表内逐列颜色/删除线；previousType原名删除线接新类型；PK/FK/IX chip | 两侧列及变更列表也能回答，但需匹配 | 不能以“Archify也能画列”为新收益 |
| 旧订阅键为何消失、新键指向谁 | 8条精确列端点，旧关系语义标签；3步walkthrough聚焦相关tables，cite可名table/column/file | 原关系与新关系加注释即可解释 | 当前fixture的故事上游已经讲出，不宜重复一个换皮说明页 |
| 哪些关系只是应用引用 | 格式有enforced，SVG支持点线 | 普通列清单可显式列enforced/unknown | 这个fixture全true，没有真实新增false阅读任务可验 |
| 长表是否省略 | 带真实总列数的表副标题及静态省略行；优先key/changed/relation ends，再受行数上限约束 | 完整列列表本来保留全部 | billing-org每表最多7列，不触发长表省略，不借其他fixture替它背书 |

这些是公开实现/已提交golden支持的能力，不是本轮线上canvas实际操作。SVG painter明确画旧类型和列状态；layout按列中心路由；view scope只保留所选table及两端仍在的关系；data-model渲染返回`animated:false`。walkthrough格式允许表/列cite，renderer atlas给出table boxes；不能由此声称已亲测线上列级点击、键盘、焦点恢复或动态展开。[列绘制](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/svg/datamodel.ts#L61-L174) · [layout](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/src/layout/datamodel.ts#L72-L103) · [已有light SVG golden](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/renderer/test/__goldens__/billing-org.data-model.light.svg) · [交互协议](https://github.com/coldteadotai/pr-lens/blob/457987102b40b7d64a221924d420a0632f0395f7/packages/agent-skill/references/graph-document.md#L330-L351)

真实上行空间是把schema变更的意图、旧/新键和受影响数据域紧靠在一起，使评审者不用先在两张大ERD里手找对应列。这个价值并不要求发生生产事故。但上游此样例本来已经这样做；本轮没有证据表明再做Archify版本能减少错误或时间，也没有把“未测提速”本身当否定理由。

## 6. Archify现状与live有界去重

Archify当前hub HEAD的[ERD schema](https://github.com/tt-a1i/archify/blob/2c83780d646be256d668ae0433f561b13253158f/archify/schemas/erd.schema.json)已有entity attributes、PK/FK/UK组合、`entity.attribute` references校验，以及显式最大基数/optional/identifying。它没有列级delta/previousType、store lane或enforced字段；关系仍连entity，不是字段行。**identifying:false不是enforced:false**，不可为得到虚线而偷换语义。PRLens样例未声明完整cardinality、nullable、unique，不能在投影时补成已知ERD事实。[ERD现合同](https://github.com/tt-a1i/archify/blob/2c83780d646be256d668ae0433f561b13253158f/archify/renderers/erd/README.md)

已有[DBML实验固定358c77e0](https://github.com/tt-a1i/archify/tree/358c77e0/experiments/dbml-erd)解决受限DBML→原生ERD、键/方向/可空性与拒绝未知约束，基于原创订单fixture和完整官方PK例；它不是schema migration delta，不能说本lens已被DBML完全覆盖。反过来，把PRLens的32列直接转为该DBML子集会遇到type、nullable、schema/domain及声明缺失，不宜扩成通用importer。

已有[Delta values固定a0a9ba77](https://github.com/tt-a1i/archify/tree/a0a9ba77/experiments/delta-values)读的是既有Architecture receipt里的确切old/new值；当前[architecture-delta.mjs](https://github.com/tt-a1i/archify/blob/2c83780d646be256d668ae0433f561b13253158f/archify/delta/architecture-delta.mjs#L108-L115)明确要求Architecture输入，不支持ERD。它能证明两个声明JSON之间的机械差别，仍不证明作者快照与真实代码相符。不能把PRLens模型填写的delta直接改名为Archify“已算出的差分”。

live搜索在上述时间通过GitHub官方CLI：`gh issue list --state open --limit 500`得到132项、`gh pr list --state open --limit 500`得到127项，筛标题`ERD|DBML|data model|data-model|schema|column|migration|database|delta|compare|diff`，并读取以下指定正文：

- [issue #407](https://github.com/tt-a1i/archify/issues/407)是Mermaid erDiagram导入/风格请求，含键和关系示例；不是列级migration状态合同。
- [PR #1049](https://github.com/tt-a1i/archify/pull/1049)，head `7184b99b01768349840f93b4de83ff206d202c33`，从Git refs读**既有Architecture JSON快照**，不从SQL/代码生成schema或推断rename；对应[#1044](https://github.com/tt-a1i/archify/issues/1044)。
- [PR #1143](https://github.com/tt-a1i/archify/pull/1143)，head `649550292e9d9df7e3a3e140d9c1a5ea3bcbf678`，Workflow语义JSON差分；不是ERD字段变更。
- [PR #1142](https://github.com/tt-a1i/archify/pull/1142)，head `7155281fc1e22154f0c88bd8349df3a1b0680f79`，作者声明claim到已有block/source的导航，明确不证明结论成立。不能另造一个“来源关联=证明”的data-model实验来重复它。

没有在这次开放标题列表里找到直接同范围的列delta/data-model专项。此结论只覆盖有界open列表和上述正文，不声称搜全closed/history或所有正文，也不把相邻PR当已合入当前基线。

## 7. 本轮实施建议：0项

不新增实验、不扩产品schema、也不接AI/provider。理由是**当前可明确演示的任务上游已有完整解法，新增的忠实投影成本却真实存在**：需要稳定的table+column身份、四种列状态/previousType、精确列端点、与identifying分离的enforcement含义、未知cardinality/nullability处理、全量原件与来源说明，再维护受限格式版本和关系/长表可读性。把它压成通用Architecture框或只列颜色，反而会丢掉这次新lens最有用的列语义。

现有native renderer足以写一份有完整来源和未知字段说明的静态讲解，但这不足以成为另一个独立实施项；普通before/after ERD＋完整列清单同样能回答样例问题。若未来有具体评审输入显示“旧/新键同时存在但读者误认执行时序、enforcement与关系身份无法区分”等尚未解决的任务，应先取该输入和上游已有UI对照，再决定小缺口；当前不以这种可能性代替真实需求或提前设计完整schema适配层。

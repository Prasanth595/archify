# Folded edge membership：实施可行性深化与拒绝立项

2026-10-28。结论：**技术上可用既有 Architecture + Explainer 做完整静态解释；本轮拒绝作为第59项独立实验实施。** 不是因为缺少生产事故、性能证据或通用folding engine。具体原因是：固定官方fixture只有两文件、唯一有向文件pair，无法区分“精确关系成员回查”与“来源节点全部outgoing贡献回查”；后者的图→全部记录→原文→精确图返回链已由profile-contexts实际交付。dependency-map也已经保留平行记录、原始账目和显示范围外原因。为了在此fixture上造出独立新交互而新增关系成员面板，会重复已有能力；为了强行增加区分度而添加关系数据，则违反本轮使用完整官方fixture的重点。可把投影语义作为未来具体文档中的例子保留，不另做实验、UI或产品能力。

本报告只读深化，**没有实施、运行浏览器、安装、commit/push**，旧报告不改。本文件定位为折叠边成员候选的可行性深化与拒绝立项记录，不新增实验。共享代码库中其他工作者文件未改。

## 冻结对象与读过的源码

- 产品目标dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`。不是把hub HEAD当产品HEAD。
- 当前hub `3ddd3f93911036395158c93f789f677a23e2c5da`，本地readback一致；gallery manifest实读58项；本次持久化核对的确切ID为`cycle-region`与`profile-contexts`，不是cycle-atlas。
- 最新main按任务提供为d605…，未用其未完整提供的short SHA做固定来源链接，也未宣称重新核了main；产品合同判断全部固定dev。
- 复用上一轮完整上游fixture/原LICENSE，仍固定CodeCharta `bd1fe9b40f987cfdc34cf169b7fb220e5ea69466`。没有重新解释为运行数据。
- 产品dev的inline.mjs、reader.js、diagrams.mjs、Architecture/Explainer schema本次从GitHub固定SHA raw再次下载全文供本地只读核查，随后读关键实现。本报告不依赖hub工作树中产品文件是否与dev相同。

## 配套有界搜索记录

[after58-candidate-search.json](../after58-candidate-search.json)是协调者提供的搜索记录原字节副本，459,433 bytes，SHA-256 `bbae4ce6779db253d633e5ebf82df535332315bb06b34216d0eb5b65c8e514ac`；观测时间 `2026-10-28T06:41:25.393494+00:00`。`pprof`为0项，`"normalization"`总计52项但仅返回50项，`"coverage" in:title`为5项，`"folding" in:title`为0项。**这是bounded搜索，未读取的2项不能算作已检查；`incomplete_results=false`不表示分页已取完，也不能证明全历史没有重叠。** 查询原文、结果及当时refs保留在JSON中；本报告整理没有重新查询远端，不把搜索条目或PR作者自报当作评审/CI/运行通过。

## 精确回答：原生产品能做什么，不能冒称什么

### 1. 节点→完整成员内容→原文→精确节点，已有

[Explainer reader.js L638–650](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L638-L650)只把 `nodeSources` / `nodeBlocks` 绑定到 `[data-node-id]`；hover/focus显示source card，`nodeBlocks`使节点可键盘激活。[L607–625](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L607-L625)能提供“阅读这段”block跳转及固定source URL。由此可以把收起图的src节点绑定到完整3条记录的prose/list/facts贡献说明，再链接完整原件；说明中的 `node:expanded.file-a` 或 `node:collapsed.src` 返回具体图节点。

注意nodeBlocks不是任意比较表行或任意DOM元素映射；profile-contexts已记录comparison-row目标被拒绝，之后改用受支持内容块。不能在报告里把“给每行一个id”直接推断成所有行都能作为nodeBlocks。

### 2. 文字→指定边高亮，已有，但不等同于关系Passport精确pin

[Explainer schema steps.target.edges](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/schemas/explainer.schema.json#L410-L449)可以指向指定diagram的edge IDs；[diagrams.mjs resolveDiagramTarget](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/diagrams.mjs#L591-L625)会验证实际semantic edge存在。

[reader.js L311–344](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L311-L344)打开native Viewer时从step `data-diagram-edges`取目标，选中两端节点并仅给匹配edge加 `data-focus-match`。它没有为该edge写 `#relation=` 或调用Focus关系pin。因此可称“指定边高亮/检查原生图”，不可冒称“打开了该关系Passport”。[inline.mjs L15–30](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/inline.mjs#L15-L30)支持node/route/source/block链接，**没有relation: inline destination**；[reader validHash](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L300-L308)也只接受focus/route。

原生Architecture单独页面现有关系检查可用 `#relation=<authored-id>`；relation-reference/search实验正围绕既有精确pin做复制/搜索入口。若为了本fixture新增Explainer relation-inline格式或edgeBlocks来提供图边→内容，会超出纯内容实验，且明显落在已有关系入口/来源工作附近。

### 3. 图上的summary edge→原成员说明，dev没有edgeBlocks seam

[dev Architecture connections schema](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/schemas/architecture.schema.json#L123-L149)有id/from/to/label及绘制属性，没有任意memberEdgeIds或edgeBlocks。可把成员写成图下cards/解释内容，再由文字step高亮这条边；这已经是dependency-map的平行记录模式。给FileA nodeBlocks接同一成员说明在本fixture上也成立，但那证明的是节点贡献导航，不能声称已经实现“从任意summary edge精确打开它独有的成员”。

### 4. 静态双视图可承载解释，不应伪装成通用折叠

两张native Architecture spec可以明确命名为“文件层投影”与“src组摘要投影”；原件和ledger不可修改，切换是block/节点导航，不是改变同一图topology的折叠按钮。收起图只有一个src组件，**connections为空**。src的label/source card说明“组内3声明对；1文件pair；显示跨box边0”，并直接接完整成员内容。这能从“没有显示边”的图回查原件，完全不需新引擎。

若要画过滤前后的不同边权重，不能只把一张图旁的文字3改成2却仍给出同一native spec。可用两组静态双视图（四个明确diagram IDs），或只画过滤后的双视图并把未过滤结果标为文本基线。前者在此仅两文件fixture上产生四幅重复小图；后者不能声称同时实测了过滤前后的图交互。无论哪种都没有新增有状态filter能力，也不需要人为制造一个“边被删除”的错误界面来对照。

## 完整fixture：实际身份、方向、单位与守恒

原件：[`multi-class-same-file.dc.json`](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/analysis/analysers/importers/DependaChartaImporter/src/test/resources/multi-class-same-file.dc.json)，1286 bytes，SHA256 `20785946e8acf60775cf7e22bbede66d9a65e5883b768e75a5690968b5da4424`。上一报告完整转载了原件及BSD全文，此次不写另一份派生fixture。

三个原记录是：

| 实验显示名（派生，不冒称上游ID） | 原JSON pointer | 方向 | 物理文件pair |
| --- | --- | --- | --- |
| R1 | `/leaves/a.ClassA/dependencies/b.ClassB` | a.ClassA→b.ClassB | FileA.ts→FileB.ts |
| R2 | `/leaves/a.ClassA/dependencies/b.ClassC` | a.ClassA→b.ClassC | FileA.ts→FileB.ts |
| R3 | `/leaves/a.FuncD/dependencies/b.ClassB` | a.FuncD→b.ClassB | FileA.ts→FileB.ts |

稳定原身份应来自输入SHA＋JSON pointer，或固定输入namespace＋source leaf/target leaf组合；R1/R2/R3只是阅读短名。file-pair ID来自有向两个canonical endpoint `/root/src/FileA.ts`、`/root/src/FileB.ts`；该ID与R1/R2/R3不在同一命名空间。显示bundle ID应另命名为某个projection状态的有向显示端点pair，成员数组保存原身份。**所有投影都不改变R1/R2/R3本身**。

[DcJsonParser.kt](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/analysis/analysers/importers/DependaChartaImporter/src/main/kotlin/de/maibornwolff/codecharta/analysers/importers/dependacharta/DcJsonParser.kt)按leaf dependency key计数，不按运行调用次数，也不是把dependency.weight相加。原始3声明对产生1 file pair，dependencies=3。Importer没有保留独立edge ID成员列表，所以“回查三条名字”必须同时消费原dc输入，不能从孤立cc file edge还原。

| 派生状态 | 原始记录 | 参与 | 过滤排除 | 内部文件pair | 显示依赖边 | 应从何处回查 |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| 文件层，全部 | 3 | 3 | 0 | 0 | 1，权重3声明对 | FileA贡献说明或图下summary step→R1/R2/R3；该步可高亮指定file edge |
| src组关闭，全部 | 3 | 3 | 0 | 1，含3声明对 | 0 | src节点source card→完整3条贡献内容→各pointer原文；“0”只能叫显示边数 |
| 文件层，过滤R3 | 3 | 2 | 1 | 0 | 1，权重2声明对 | FileA贡献说明列R1/R2参与、R3排除；原始3条仍可查看 |
| src组关闭，过滤R3 | 3 | 2 | 1 | 1，含2参与声明对 | 0 | src贡献说明列组内R1/R2和过滤R3分开；总原记录3=组内参与2+过滤排除1 |

过滤R3是**本地阅读实验显式设置**，不是上游fixture已过滤，也不是原producer的filter功能已执行。排除不改变JSON；R3不可从来源表删除。四状态都只有A→B，不能生成B→A，更不能从0条显示边推出“没有依赖”。展开/收起后按原身份集合比较，而不是按当前画布edge数量比较。原始重复relation若未来另有独立身份则逐条保留；本fixture没有同一声明pair重复键，也没有B→A，不能据此声称多重边/双向实现已经验证。

### 可形成的用户任务，以及为什么仍不足以新立项

任务：“在一张src摘要图没有线的情况下，查清FileA是否依赖FileB，列出全部声明对；确认过滤后哪个不参与，但没有被删掉。”这是真实可理解的阅读问题，不是性能指标。

原生路径可以是：src图节点→source card→“阅读这段”→3条记录→各source pointer原文→明确返回src/文件图节点；从说明里的指定edge step可以打开file图并高亮唯一file pair。技术上信息完整、方向守恒。它不需通用折叠引擎。

但在此输入中，`成员(file edge A→B)`恰好等于`FileA所有outgoing`，也是`src内部全部关系`。因此任一节点贡献表都能得到完全相同的3条。没有第二个file pair，无法证伪“这只是从来源节点查全表，而不是从summary edge回查准确子集”。过滤R3只改变同一集合的状态列，仍不创造另一个可混淆的edge。需要新增另一个真实不同端点组才能测试summary边独有成员；本轮不擅自扩充官方fixture、拼入synthetic后又把结果当全官方输入。

## 与58项及在审PR的具体重叠

- [dependency-map @2be2ab55](https://github.com/tt-a1i/archify/blob/2be2ab55cc9134876158e557e5287ec1912ca718/experiments/dependency-map/README.md)：平行原dependency记录共享一个有向连接，但逐条写入cards/receipt；视图外/未解析/不跟随另记。这里的3→1与2+1账目不构成新机制。
- [relation-reference @d5691a02](https://github.com/tt-a1i/archify/blob/d5691a02f2dd77acd38b827e254249981bc142ee/experiments/relation-reference/README.md)：复制pinned authored relation的原始方向、标签与明确身份。此候选不需要又一个“复制summary”按钮，也不可把summary显示ID冒称原记录ID。
- [relation-search @e87a858d](https://github.com/tt-a1i/archify/blob/e87a858d220c25c97aee4b5920cf59ab77723b41/experiments/relation-search/README.md)：已有按关系ID/标签找到精确pin的实验，不能再用搜索成员入口当新增点。Route仍为节点路径，与成员账目不同。
- [profile-contexts @58935179](https://github.com/tt-a1i/archify/blob/589351790b32173269f6a8e22da836130e31989a/experiments/profile-contexts/README.md)：完整prefix节点→所有贡献记录（含同文不同身份）→原文→固定返回入口，及精确native node链接。这个关系候选拟做的节点来源链基本同构。区别在聚合语义（声明→文件→可见代表），不是新回查交互。profile已有实图交付，不应把本候选的尚未运行说明比成更强行为。
- [Atlas #1103 @f0be206a](https://github.com/tt-a1i/archify/blob/f0be206acbc90eb7c6c6b636030e3eb28963d284/archify/modules/code-analysis/overlay/atlas.mjs)：module/file resolved依赖overview已占位。新增折叠overview、bundled map或code-atlas不能作为此内容实验附带扩大范围。
- [#1141 @30196a0b](https://github.com/tt-a1i/archify/pull/1141)本次readback head仍相同，已读其Architecture schema：connections新增sources，负责关系的repository evidence。它不是任意member-record ledger或Explainer edgeBlocks；也不能假设已合入dev。为本fixture新增关系sources/provenance字段会重复在审owner的接口；未来可消费其最终合同，但本轮不移植。

## 若日后有真正区别任务，最小实验必须改变什么

需要一份保留完整官方原件、至少有两个不同有向file pair且一个summary bundle有明确成员子集的输入。读者必须从图中不同summary分别得到不同成员集合；再折入同组使部分edge不画，仍能从group内容找回原集合；过滤状态再区别组内隐藏与排除。这样才能检验“投影身份回查”的独立问题，而不是同一节点全表的另一个入口。该条件是让错误可被观察到的对照要求，不是要求生产事故。

仍应先尝试静态双视图＋既有nodeBlocks/steps.edge高亮，不默认新folding engine。若实际任务必须直接点击任意summary edge进入成员表，才能有意义，应单独评估一个小的关系内容入口合同，并与#1141/现有Focus集成；不能为一个两文件例子默默加通用状态、schema或跨视图恢复。

## 真实原件与许可的保留方案（未实施）

若将来有批准的解释任务，保留 `fixtures/multi-class-same-file.dc.json`原1286B、完整CodeCharta BSD-3-Clause `LICENSE.md`原1471B（SHA256 `05bbe53a31e9f27ca4b5c9b6773ac1ef880cefe7850b56a0b86ad8aa4f4d13ee`）、上游repo/SHA/path/raw URL及各bytes/hash manifest。derived ledger、projection states、原生spec与解释文案分别标派生；JSON pointer与source line不混用。单独固定URL只能称URL来源，不能冒称Archify已验证Git excerpt。若需要verified源码摘录，必须通过该source commit的实际repo evidence合同核验，不能让Archify项目当前HEAD代替CodeCharta commit。

来源声明既包括fixture，也包括解释投影规则的DcJsonParser.kt、NodeId.kt与edgeProjection.ts固定链接；页面说明仅按源码规则重建，不说已运行CodeCharta。独立小的投影脚本可自行写，不复制ECharts、Cytoscape或Sourcetrail实现；此例根本不需要这些依赖。完整BSD通知随转载fixture分发，不能只写一个SPDX名称；不复制GPL Sourcetrail实现，也不把机制灵感混作移植代码。

## 本轮停止点

拒绝的是把同构导航＋新数据另计成独立实验，不拒绝该语义作为解释内容。旧研究的“可留候选”经此次当前产品源码、58项现状与具体fixture的可证伪性检查，收敛为 **REJECT FOR NEW EXPERIMENT**。没有运行结果、截图、代码分支或实施承诺。root可以继续其他研究方向，不需在此候选上等待用户确认。

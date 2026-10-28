# 大图阅读、分组折叠与汇总边身份：有界研究

2026-10-28。结论：保留 **1 个独立离线内容实验候选**「折叠后这条边代表谁」，暂不提议通用 Architecture 折叠引擎。它要检验的阅读价值是：读者能否从汇总图准确回查“哪些原始记录形成这条显示边、哪些记录只是收进组内、哪些因过滤而不参与”，而不是把大图变成另一套 Atlas。没有生产事故或速度测量并不妨碍这个探索，但不足以声称性能或理解效率改善。

本次仅写本报告。没有安装依赖、执行上游、启动浏览器、提交、推送、修改产品、hub或gallery。读取 `research/SKILL.md`；本工作本身为父会话委派的后台调研，不再递归派发。来源都是官方仓库固定 SHA；下面的源码行为为静态核读。唯一运行是 Python 对已下载 JSON 的独立计数，不是上游 parser/renderer 的运行结果。

## 先排除已有方向与当前在审工作

已读 [hub](../../2026-10-25/README.md)、[manifest](../../2026-10-25/gallery/manifest.json) 的全部 **56** 项及旧 [graph-reading-round5](../../2026-10-25/scouts/graph-reading-round5.md)。`dependency-map` 已把 dependency-cruiser 报告变为局部图并保留视图外账目；`relation-reference`、`relation-search` 已做精确关系身份/定位；Finder、Reach/Route、source handoff与导出卡也已覆盖。新候选不重复做依赖导入器、关系搜索、overview、可达性或一套源码检查面板。旧 scouts 已研究过 Sourcetrail、Graphology、Cytoscape expand-collapse；本次是重新深读其 **聚合身份合同**，不将这些名字重复算作新发现。CodeCharta同 SHA 已见于 task-view 的宽搜，但其 importer→fold projection→tooltip 本次另作实读；graphlib 与旧 graphlib-dot 是相关但不同仓库。小工具 depxray 是本次额外有界来源，未按星数筛选。

当前 GitHub dev 本次实查为 [`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/tree/6ca6a5c84439b57ea22e0630fe306e1d91587a6e)。[Tree 合同](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/renderers/tree/README.md#L69-L91)已经是完整布局固定位置、独立折叠状态、隐藏后代与树链接、Finder/Outline/共享链接先揭示祖先、完整导出不受折叠影响。[tree-branches.js](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/tree-branches.js)和 [semantic-lens.js](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/semantic-lens.js)也已读取；本轮不把隐藏、Focus或Lens改名当新能力。Architecture 的现有 boundary 是作者定义的归属/控制边界，不能自动等同于可折叠 compound node，也不能把边界跨越推断成运行时调用。

本次 `gh pr list --state open` 与父会话有界25条快照共同排重，**不是全仓无重叠证明**：[#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103) 当前 head `f0be206acbc90eb7c6c6b636030e3eb28963d284` 的 [buildAtlas](https://github.com/tt-a1i/archify/blob/f0be206acbc90eb7c6c6b636030e3eb28963d284/archify/modules/code-analysis/overlay/atlas.mjs#L63-L145)已用 module/file 层级和 raw facts 生成 resolved file-pair 曲线；`pairs` 是去重集合，`resolved` 另累加，不应混称相同计数。因而不另提 bundled dependency overview、层级圆弧或Classic交接。#1141 relationship source evidence、#1142 attribution、#1143 Workflow semantic comparison、#1144 dependency-aware Explainer preview 也已识别，不另造证据字段或预览状态系统。这里只作排重，没有评审这些 PR，也没有合入判断。

## 六个来源，固定源码与完整许可文件

“完整许可”指下载了完整原文件、记录字节与 SHA-256并链接原文；没有以 GitHub SPDX 摘要代替许可证。只有下面附录的 CodeCharta fixture被本文完整转载，因此连同其完整 BSD-3-Clause 通知一起保留。其他来源只作机制研究，不复制实现；若后续复制源文件、样例或分发衍生物，仍需按该源文件及第三方通知另行核对，不能用本表代替。

| 来源 / SHA | 本次读到的机制与取舍 | 完整 LICENSE |
| --- | --- | --- |
| [CodeCharta](https://github.com/MaibornWolff/codecharta/tree/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466) `bd1fe9b40f987cfdc34cf169b7fb220e5ea69466` | declaration dependencies→file pair权重→visible representative projection→tooltip；最贴合“同一数字不同粒度”。不引入ECharts和整套levelized layout。 | [BSD-3-Clause, LICENSE.md](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/LICENSE.md)，1471 B，`05bbe53a31e9f27ca4b5c9b6773ac1ef880cefe7850b56a0b86ad8aa4f4d13ee` |
| [Sourcetrail](https://github.com/CoatiSoftware/Sourcetrail/tree/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3) `4b1b0e4fd19c4af235fef12b0564c05348f5f6d3` | 原edge ID集合与bundle ID分离；混合方向显式处理；拆包恢复具体节点。已归档的桌面索引IDE，不作为新依赖。 | [GPL v3全文, LICENSE.txt](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/LICENSE.txt)，35149 B，`3972dc9744f6499f0f9b2dbf76696f2ae7ad8af9b23dde66d6af86c9dfb36986`；不从GPL文件正文推断所有文件均可任选later版 |
| [Graphology](https://github.com/graphology/graphology/tree/65e278f0075de97bee3fce12d10e423752ed395a) `65e278f0075de97bee3fce12d10e423752ed395a` | [to-simple.js](https://github.com/graphology/graphology/blob/65e278f0075de97bee3fce12d10e423752ed395a/src/operators/to-simple.js)默认只保留同端点的一条属性；只有显式mergeEdge才聚合。不是折叠UI，更不是天然保留provenance的转换。 | [MIT, LICENSE.txt](https://github.com/graphology/graphology/blob/65e278f0075de97bee3fce12d10e423752ed395a/LICENSE.txt)，1104 B，`9d396b4882c329077f32861c0d6822dcee48f2d0ff6196d8459af70844196275` |
| [graphlib](https://github.com/dagrejs/graphlib/tree/0438a8f5c33d5d5ba1a9028832a0a4313cc7e3e9) `0438a8f5c33d5d5ba1a9028832a0a4313cc7e3e9` | 小型图数据结构的 [JSON writer/reader](https://github.com/dagrejs/graphlib/blob/0438a8f5c33d5d5ba1a9028832a0a4313cc7e3e9/lib/json.ts#L31-L114)保留 directed/multigraph/compound、node.parent与edge.name。序列化身份不同于屏幕聚合，也不同于graphlib-dot的DOT回读。无需引入该库才保留一个member ID数组。 | [MIT, LICENSE](https://github.com/dagrejs/graphlib/blob/0438a8f5c33d5d5ba1a9028832a0a4313cc7e3e9/LICENSE)，1062 B，`6a349742a6cb219d5a2fc8d0844f6d89a6efc62e20c664450d884fc7ff2d6015` |
| [Cytoscape expand-collapse](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse/tree/e01588bec1f31c76046faa6fb681eee37b78334e) `e01588bec1f31c76046faa6fb681eee37b78334e` | [collapseGivenEdges](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse/blob/e01588bec1f31c76046faa6fb681eee37b78334e/src/expandCollapseUtilities.js#L683-L762)以type分组、记录unidirection/bidirection、保存collapsedEdges；显示ID含随机数，不能拿来当跨会话原关系ID。已有旧研究，本次只刷新身份核读。 | [MIT, LICENSE.md](https://github.com/iVis-at-Bilkent/cytoscape.js-expand-collapse/blob/e01588bec1f31c76046faa6fb681eee37b78334e/LICENSE.md)，1081 B，`7653ed3cdf53bc1b49f15666b964de4b24eae3bbffcb1fba6fe4817bc9be9926` |
| [depxray](https://github.com/Pannawish/depxray/tree/48eae9241d36d1f9ccf09a88d15e5e2f8971740a) `48eae9241d36d1f9ccf09a88d15e5e2f8971740a` | 小项目的 [folder scope](https://github.com/Pannawish/depxray/blob/48eae9241d36d1f9ccf09a88d15e5e2f8971740a/packages/web-ui/src/graphScope.ts#L423-L584)保留memberEdgeIds、组内internalEdgeCount，同时另造membership显示边；这恰好暴露“图上的线不全是依赖记录”。不移植其React/force布局/预算裁剪。 | [MIT, LICENSE](https://github.com/Pannawish/depxray/blob/48eae9241d36d1f9ccf09a88d15e5e2f8971740a/LICENSE)，1077 B，`47a8da5be7362ffd422dd6f0b346f2962bec77fb19926fc839eb5a8d938220b2`；另读core/LICENSE全文，同字节 |

## 深读一：CodeCharta 从声明关系到屏幕边，计数经过两次投影

Producer是 [DcJsonParser.kt](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/analysis/analysers/importers/DependaChartaImporter/src/main/kotlin/de/maibornwolff/codecharta/analysers/importers/dependacharta/DcJsonParser.kt)。`parseEdges`遍历每个leaf的dependency **keys**，解析physicalPath，跳过找不到目标、空路径和同文件关系，按有向文件端点pair `eachCount()`。端点经 [NodeId.endpointFromSegments](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/analysis/model/src/main/kotlin/de/maibornwolff/codecharta/model/NodeId.kt)补成`/root/...`路径；不能把物理路径label与最终序列化node ID混用。这里核的是Importer的逻辑Edge对象，未进一步声称完整cc.json序列化已运行。这条Importer链的计数单位是**声明对记录**，不读取每条dependency对象里的weight作为相加值；也不是调用次数、import语句数或运行频率。`parseFileNodes`再把文件边的dependencies权重累加成incoming/outgoing属性。

UI层 [edgeProjection.ts](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/visualization/app/codeCharta/renderer/dependencyGraph/util/edgeProjection.ts#L8-L241)把所有被折叠的后代路径映射到visible representative。`mergeInto`按 **有向显示端点** `fromPath|toPath`聚合，weight相加、cycle/upward flags作OR、保留declarationEdges；两端落在同一个box或包含关系内的边不画。它不反向改写原始依赖，也不把隐藏组内关系说成不存在。metric不匹配、无正值或端点未进入代表表的记录也不画，和折叠是不同原因。[已提交projection tests](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/visualization/app/codeCharta/renderer/dependencyGraph/util/edgeProjection.spec.ts#L99-L148)明确有两条file-pair记录weight=2与1折成一条weight=3、任一cyclic让显示边cyclic，以及组内/不在图端点不画的例子。这里OR只表示“存在一个组成项带标记”，不是所有底层关系都cyclic。

最终 [dependencyGraphTooltip.ts](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/visualization/app/codeCharta/renderer/dependencyGraph/util/dependencyGraphTooltip.ts#L69-L90)在没有declarationEdges时显示weight；多个declarationEdges时显示其数组长度并提示click list；只有一条时可同时给出原声明端点和“drawn as”显示端点。[dependencyGraphEdges.ts](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/visualization/app/codeCharta/renderer/dependencyGraph/util/dependencyGraphEdges.ts#L49-L80)最后按route画线/箭头，双向布局用不同弯曲。可见，这是producer语义、折叠投影、UI说明三个独立步骤。

限制：Importer的文件聚合本身没有把原声明pair列表塞入每条file edge，不能从一个孤立的cc file edge `dependencies:3`反推出三条声明的名字。下面fixture能列出名字，是因为同时保留了原始dc输入。当前CodeCharta还有原生dependency parser等其他producer，不能把这一Importer的规则泛化到全部CodeCharta输入。

## 深读二：Sourcetrail 的bundle不是另一条真实代码关系

Producer/storage链 [PersistentStorage.cpp](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/src/lib/data/storage/PersistentStorage.cpp#L2971-L3073)从活动节点后代取得incoming/outgoing storage edges，保留每条edgeId和相对于active node的forward布尔；把外部端点映射到最后可见父节点，跳过与active node同可见父的组内项，再创建 `EDGE_BUNDLED_EDGES`。bundle ID在一个原ID上加高位，和原ID集合分开存放，不是源数据库又发现一条关系。

[TokenComponentBundledEdges.cpp](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/src/lib/data/graph/token_component/TokenComponentBundledEdges.cpp)用map保存id→direction，count来自原ID集合；只要组成项方向不同就返回DIRECTION_NONE，而不是任取一个source/target画成单向事实。另一层 [GraphController.cpp](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/src/lib/component/controller/GraphController.cpp#L1243-L1360)为了屏幕阅读创建Dummy bundle，收走可见非active节点，累加dummy edge的weight并更新方向。这两类bundle要分开：storage的真实edge-ID成员集合，与视图临时node bundle不是同一层对象。

Consumer/UI链 [QtGraphView::createBundledEdgesEdge](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/src/lib_gui/qt/view/QtGraphView.cpp#L1206-L1234)在原成员edge全已可见时不再画bundle，避免把summary和原edge同时当额外事实；否则传给createEdge。node bundle的 [QtGraphNodeBundle.cpp](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/src/lib_gui/qt/graphics/graph/QtGraphNodeBundle.cpp)显示的是nodeCount圆点，点击派发BundleSplit；[controller split](https://github.com/CoatiSoftware/Sourcetrail/blob/4b1b0e4fd19c4af235fef12b0564c05348f5f6d3/src/lib/component/controller/GraphController.cpp#L363-L438)恢复bundledNodes或subNodes、相应hidden edges并重排。**nodeCount不是依赖数量**；拆包恢复也不等于新索引或新执行。这套桌面栈不能低成本移植到Archify，借鉴点只在“显示对象明确引用原成员”和“类型不同的计数有不同单位”。本轮没构建Sourcetrail、没打开其UI，也没作其完整导出合同保证。

## 第三个补充：depxray 的过滤、边界和合成线

[graphScope.ts](https://github.com/Pannawish/depxray/blob/48eae9241d36d1f9ccf09a88d15e5e2f8971740a/packages/web-ui/src/graphScope.ts#L423-L584)先filterDependencyEdges，再按inside/outside区分internal/incoming/outgoing。folder的直接子folder充当bucket；source==target的记录进入internalEdgeCount，不画自环；其余按role+有向端点聚合，保留排序的memberEdgeIds。随后额外加 `scope:membership` 线，它的memberEdgeIds是空数组，aggregateCount却取memberCount，因此把它和依赖bundle一起求和会混合“文件数”和“原edge数”。这不是指控其UI有bug，而是提醒消费方不可忽略scopeRole。

它最后还调用limitGraphToBudget，源码另保留hiddenNodeCount；所以画布边/节点数不能作为完整系统数量。[useGraphData.ts](https://github.com/Pannawish/depxray/blob/48eae9241d36d1f9ccf09a88d15e5e2f8971740a/packages/web-ui/src/hooks/useGraphData.ts)能从window嵌入数据、HTTP、live更新读合同，失败会回落sampleGraphSet且保留error/source。本文没有把fallback样例冒称扫描用户仓库的结果。这里只深读消费者的scope投影，未把其scanner正确性算作已核验。

## 完整可核对fixture与答案

来源：[multi-class-same-file.dc.json](https://github.com/MaibornWolff/codecharta/blob/bd1fe9b40f987cfdc34cf169b7fb220e5ea69466/analysis/analysers/importers/DependaChartaImporter/src/test/resources/multi-class-same-file.dc.json)，完整 **1286 bytes**，SHA-256 `20785946e8acf60775cf7e22bbede66d9a65e5883b768e75a5690968b5da4424`。下块为完整JSON内容；代码块不承诺Markdown换行编码与上游字节同一，字节核对以上游raw为准。

```json
{
  "projectTreeRoots": [],
  "leaves": {
    "a.ClassA": {
      "id": "a.ClassA",
      "name": "ClassA",
      "physicalPath": "src/FileA.ts",
      "nodeType": "CLASS",
      "language": "TypeScript",
      "dependencies": {
        "b.ClassB": {
          "isCyclic": false,
          "weight": 1,
          "type": "usage",
          "isPointingUpwards": false
        },
        "b.ClassC": {
          "isCyclic": false,
          "weight": 1,
          "type": "usage",
          "isPointingUpwards": false
        }
      }
    },
    "a.FuncD": {
      "id": "a.FuncD",
      "name": "FuncD",
      "physicalPath": "src/FileA.ts",
      "nodeType": "FUNCTION",
      "language": "TypeScript",
      "dependencies": {
        "b.ClassB": {
          "isCyclic": false,
          "weight": 1,
          "type": "usage",
          "isPointingUpwards": false
        }
      }
    },
    "b.ClassB": {
      "id": "b.ClassB",
      "name": "ClassB",
      "physicalPath": "src/FileB.ts",
      "nodeType": "CLASS",
      "language": "TypeScript",
      "dependencies": {}
    },
    "b.ClassC": {
      "id": "b.ClassC",
      "name": "ClassC",
      "physicalPath": "src/FileB.ts",
      "nodeType": "CLASS",
      "language": "TypeScript",
      "dependencies": {}
    }
  }
}
```

答案及单位（静态规则推导＋本次Python独立算术核对，不声称上游运行通过）：

| 问题 | 可核答案 |
| --- | --- |
| 原始leaf节点与声明关系有哪些？ | 4个leaf；3个有向声明对：`a.ClassA→b.ClassB`、`a.ClassA→b.ClassC`、`a.FuncD→b.ClassB`。没有反向记录，不能推断运行时调用或完整项目只有这些。 |
| Importer产生几个文件及文件边？ | 2个文件，1个有向文件pair：`/root/src/FileA.ts→/root/src/FileB.ts`（显示label可省略`/root/`），`dependencies=3`；FileA outgoing=3/incoming=0，FileB incoming=3/outgoing=0。3不是三条file edge。 |
| 把两文件所在src整体收成一box时？ | 同box内的文件pair不画：显示依赖边0；组内仍有3条原始声明对、1条file pair。这里是按已读projection规则得到的**派生阅读状态**，上游dc fixture未自带expandedPaths，也不是本轮截图。 |
| 展开src到文件层时？ | 可画1条file pair、权重3。仅凭这个cc edge无法恢复声明名；须回看本dc输入。再折回src不能删掉输入记录。 |
| 若阅读实验过滤掉 `a.FuncD→b.ClassB`？ | 这是**本实验另设的过滤条件**，不是上游fixture事实：原输入3、被过滤1、参与投影2，file pair仍1且权重2。折叠内部项与filtered项必须不同栏记账，不能都叫“缺失”。 |

另一个重要反例来自 [Graphology已提交测试](https://github.com/graphology/graphology/blob/65e278f0075de97bee3fce12d10e423752ed395a/src/operators/test.js#L270-L308)：3条`one→two`多重边会转成1条simple edge；显式weight merge例是2+3+1=6。**边数3、权重6、显示边1三个数都可能正确，单位必须完整**。该例是上游测试源码，不是本轮测试通过。

## 一个可做成实图的有界候选

**「折叠后这条边代表谁」：离线解释页，先做内容实验。** 输入限定为上述完整dc fixture＋两个手工声明的投影状态：展开到file与src关闭。可再加一个明确“实验设置”的过滤状态，不扫描仓库、不建通用parser、不引Graphology/Cytoscape、不修改Archify schema或canonical exports。

阅读任务是回答：为什么关闭src后边数从1变0但原记录没消失；打开后权重3对应哪三条声明对；隐藏组内与filter排除各是什么；这是否表示调用三次（答案否）。baseline为原始JSON加两个原生静态Architecture图（file view / group summary）及同一张原关系表；candidate只新增显示边旁的可展开“组成记录”说明与明确单位，所有状态来自预先算好的projection表。所谓bundle ID使用实验命名空间、显示端点＋成员ID列表派生；原成员ID采用明确标注的`(source leaf,target leaf)`组合，因为dc输入没有独立relation id，不能伪造上游edge ID。

交互合同：选中summary只改变阅读说明；“展开/折叠”切换既定图页或面板、原始记录表保持不变；过滤必须显示原输入/参与/排除账目；双向记录若另加必须明确为原创扩展fixture、分别列向；同端点多重关系若有独立ID则不可因端点相同去重；membership线不能加入dependencies数量。canonical原生图导出仍按Archify现有完整图合同，不把当前摘要页冒称全图导出；解释页截图要标注所选状态。若切换图页无法保持所选原记录，先只做并列图＋同步表，不另起跨视图状态框架。

可证伪验收：逐条核3个原pair；展开图只1条file edge/权重3；收起图0条依赖边但账目显示组内3；过滤示例明确2参与+1排除；返回展开后关系身份/成员集合不变；逆向查询不出现B→A；所有数字旁有单位；SVG/PNG与页面声明的导出范围一致。随后用同一组问题比较baseline与candidate，记录错误答案及所需操作，而不只问“哪个更漂亮”。若baseline原关系表已经同样直接、candidate不能减少找组成项的动作/错误，或新增说明遮挡主要图，就停止产品化；不为证明收益扩大fixture。

预计维护面是一个fixture、projection JSON/短脚本、解释页及数据结果检查；这是成本推断，尚无工时测量。未来如果真实需求是任意Architecture分组折叠，就必须另定义嵌套分组、原边与显示边身份、方向/类型分组、隐藏/过滤/视图外账目、Finder揭示、Focus失效、分享和导出。那是另一项有状态图投影工程，本轮不把上述内容实验升级成它。源码证据表明这些合同有实际复杂度，但没有证据证明Archify当前大图性能有问题，也没有证据证明新的bundle UI已有用户收益。

## 有界检索与失败账

- 两组web搜索：Cytoscape meta-edge / CodeCharta dependencies；small code dependency folder readers。采用官方仓库与官方docs，搜索结果中的第三方榜单、Reddit与宣传性性能数字不作结论依据。
- GitHub commit+recursive tree固定六仓库，随后仅下载相关producer、projection、UI、测试与完整LICENSE到 `/tmp/archify-graph-scout`；未clone整个仓库、未装依赖。错误猜测`EntropicDev/dep-tree`得到404后记录并停止，后来搜索找到gabotechs/dep-tree，但未再深读或列为已核来源。
- Cytoscape错误路径`src/expand-collapse.js`、`src/edge-collapse.js`各404；按实际tree改读`src/expandCollapseUtilities.js`。Sourcetrail猜测DummyEdge路径404，未以该缺文件作证据。API tree、raw源码均已按固定SHA读取；没有证明六项目所有功能或全部license依赖闭包。
- 本次只运行fixture JSON独立算术，未运行上游tests、parser、浏览器或benchmark。未来独立实验分支的实图和验收需要另行实际生成，本报告没有图片，也没有发布/人类接受状态。

## 附：转载fixture对应的完整许可通知

以下保留CodeCharta该SHA的完整LICENSE.md（原文件1471 bytes）；fixture保留其原内容，不改写成原创输入。

```text
Copyright (c) 2024, MaibornWolff GmbH
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright
  notice, this list of conditions and the following disclaimer in the
  documentation and/or other materials provided with the distribution.
- Neither the name of nor the names of its contributors may be used to
  endorse or promote products derived from this software without specific
  prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
```

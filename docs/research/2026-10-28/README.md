# 2026-10-28 阅读实验交付

用户明确继续后，持续探索目标保持 active。首批完成两个独立实验分支，后续再完成一个多文件Diff导航分支；未创建PR、合入、发布或安装。[最新GitHub排重](resume-status.md)记录dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`、main `d6059331abbddb49bca380ff46dca8ce33158b04`；两实验仍绑定原基线 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。

| 实验 | 远程提交与图片 | 结果 |
| --- | --- | --- |
| Route alternative | [说明](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/README.md) · [原图](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/screenshots/candidate-alternative-blueprint.png) | 查看另一条等跳数有向路线；可切回默认、保留hash与焦点。10/10 Route、388/388 focused、generated/package通过；五张人工查看原图。 |
| Diff matching blocks | [说明](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/README.md) · [原图](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/evidence/20261026/candidate-matched-helper-light.png) | 连续文本唯一匹配后双向跳转；完整Archify历史补丁114行对应已实际操作。63 focused、9 browser及同例扩展1通过，四张人工查看原图。 |

独立终审均READY。Route对照使用完整部署示例；Diff使用second-look完整测试literal与完整9666B真实历史patch，原始输入、许可、生成回执、失败尝试、测试和截图均在各分支持久保存。未把自动测试、实际浏览器动作与视觉查看合并成一个不明来源的“通过”。

Route不推断真实流量、故障切换或最佳路线。Diff不证明语义移动/复制/等价；四位行号拆行及390px页面约10px横向溢出在旧基线已存在，保留为限制。本轮没有实体触摸、AT、全平台或阅读效率证据。

[远端核对](remote-heads.json)仅覆盖这两个新提交：GitHub head与本地相同。Actions/check-runs为0不代表远端CI通过。未来合入当前dev仍需组合后的检查；独立实验交付不冒称集成完成。

调研来源继续保留于[差异阅读](../2026-10-26/scouts/change-reading-resumed.md)、[图局部结构](../2026-10-26/scouts/graph-local-structure.md)、[运行时引用图](../2026-10-26/scouts/runtime-code-reading.md)。Pympler的真实受控probe发现DOT输出限制，当前未新增只适合漂亮样例的适配器。

[52项主索引](../2026-10-25/README.md)已加入新两行；[图片画廊](../2026-10-25/gallery/README.md)已完成52项增量与实际浏览器检查：四分组、新两项原图展开/原尺寸/Escape焦点、390px深色卡片及空结果/reset。原50项卡片和PNG字节不变，旧浏览器证据保持各自身份。目标保持active，后续继续按具体价值与维护成本筛选。

## 后续批次：多文件 Diff 阅读

本轮并行报告：[patch 文件导航](scouts/patch-navigation.md)、[图上的局部问题](scouts/graph-answers.md)、[代码阅读状态](scouts/reading-state.md)。来源按具体行为筛选，没有按星数排名；task-view 与 PR Lens 的新提交也已复核。

选定一个实施候选：普通多文件 `@diff` 的文件目录及段落跳转。复用现有解析边界和原生链接，保留每一次文件段出现，不按路径去重。完整输入包括diff2html的736B上游测试literal和Archify真实历史commit的8309B两文件patch。它与上一批文本匹配跳转不同；已推送独立分支 `codex/lab-diff-file-navigation`，固定head `48f076f9c87fc87d36af20ddd24464e71d798fea`，比较基线为 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`，现计入已交付53项。

图问题与阅读状态报告本轮未建议新实施。它们保留共同依赖、环集合、已审状态失效与静态表行省略等具体语义边界，不把项目已有按钮或新提交数量当作Archify必须新增功能的理由。

[多文件Diff说明](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/README.md)与[实际原图](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/browser-evidence/current/final-history-file-list-light.png)已随分支持久保存。27项解析/渲染、39项parser/CLI/package、一项扩展Chrome交互及generated/ZIP检查通过；四张对照HTML只经render、静态inspect和独立浏览器观察，没有执行这四页的finalize或CLI browser-check。完整历史patch的153行原文与baseline一致，第二文件原本在首屏下约4800px处，现在可直接跳转并用键盘返回。

独立审查和root实际浏览器检查发现并修正了生成ID冲突与窄屏返回链接带偏横向滚动两个问题。最终桌面/390px深色下返回入口可见、Tab/Enter往返scrollLeft为0；保留基线行号换行和390px页面约10px溢出，不宣称跨浏览器、AT或阅读效率验收。9张原PNG和5份JSON分为当前及修前证据，未经改写。共享源码/测试diff摘要仍为 `941c679caa28835d01b7fbe3ef07cdc44501ba4b8d74073e2179347b47cb4840`。

[第53项远端核对](diff-file-navigation-remote.json)确认GitHub精确head一致；Actions/check-runs为0，不算CI通过。[53项画廊](../2026-10-25/gallery/README.md)已按固定来源hub `63541c0adac1a47609e20c4854a202b15afacb89` 增量生成并完成本批浏览器检查：新卡片搜索、原图摘要、原始尺寸、Escape返回焦点、390px暗色卡片及空结果/reset；前52项卡片与PNG原字节保持不变。

## 新一轮筛查：源码定位、调用序列与图形作者辅助

三个后台研究成员分别完成以下一手源码调研，共19个项目条目，包含重复来源的复核；没有按星数筛选。各报告固定来源SHA、许可、完整fixture、实际consumer和未执行边界。

| 方向 | 本轮覆盖 | 结论与保留价值 |
| --- | --- | --- |
| [源码定位](scouts/source-navigation-next.md) | 7项目入口；Telescope、cscope_maps、Codezoom三条生产/消费链深入，另核Lspsaga测试 | 查询文字不等于搜索范围，结果不证明查询完整；Codezoom层级下钻不自动提供精确符号/调用范围。现有SourceCards、Atlas及关系证据工作已覆盖主要展示切口。本轮不增加索引服务或重复来源卡。 |
| [调用与返回](scouts/call-sequence-reading.md) | 6项目；seqdiag、stacksprout、AppMap三项深读 | AppMap完整18-event fixture中同一models参与者的自调用来自跨类聚合，非递归；stacksprout的同步进出逻辑步数不等于异步因果。自调用几何已有#571；本轮不重复绘制或引入完整trace配对合同。 |
| [图形作者辅助](scouts/graph-authoring-next.md) | 6项目；OpenChart、BPMN lint、ZDraft三项深读 | 不可见对象的诊断需分清实际对象与显示宿主；局部修复需说明改了哪些对象并重新校验。Archify已有诊断定位、last-good与相关PR；本轮不增加新的编辑器/overlay状态系统。 |

[本轮GitHub排重快照](navigation-research-overlap.json)记录04:13 UTC的#571、#1141、#1103、#1015精确head和未合入状态。dev初始重查仍为 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`。这里核的是范围重叠，不是PR正确性、CI或合并就绪。图形作者报告另记录#960/#308/#838/#891/#923/#1135的有界核查。

本轮完成三份调研，未选出需要实施的新方向；已交付实验及图片画廊保持53项，未为新增调研改写旧实验或图片，也没有运行无关renderer测试。研究不是功能交付，不计第54项。持续探索目标保持active，下一轮仍可用完整公开输入或明确标明的构造复现比较具体阅读任务，不要求先出现生产事故或证明阅读效率。


## 第54项：共同可达查询

[Shared reach revisited](scouts/shared-reach-revisited.md)重新审视两个节点的交集问题，核对GID、BitBom及npmgraph的真实集合语义。完整公开输入足以支持探索，不要求先有真实用户失败；不复制外部实现，也不沿用common-cause作为故障结论。

新独立分支 [codex/lab-shared-reach](https://github.com/tt-a1i/archify/tree/codex/lab-shared-reach/experiments/shared-reach) 已推送，精确head `b160b948541f541394457fec3005e2d10b281dea`，固定dev基线 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`。这是离线查询CLI，不改共享Viewer、schema或安装包。完整生产部署示例12节点/12边，api_a/api_b共同下游精确为events、worker、audit、observability；单侧分别为redis及postgres/replica。共同上游为clients、edge、gateway，路径保持原箭头。原输入与原生HTML保留；展示副本只给缺失edge id添加稳定标识以兼容既有exact targets，映射公开可核对。

[实际主图](https://github.com/tt-a1i/archify/blob/b160b948541f541394457fec3005e2d10b281dea/experiments/shared-reach/browser-evidence/downstream-overview-light.png)为原始1440×1250 PNG，158360B，SHA-256 `ea70a5c260938652c1cccbd7b7121875c3aa6263aac3d34b84142939eb967cd1`。完整[README及证据](https://github.com/tt-a1i/archify/blob/b160b948541f541394457fec3005e2d10b281dea/experiments/shared-reach/README.md)包含13张原PNG、输入/答案、三次公共finalize、真实失败及路径替换派生记录；含本机路径的原始记录留checkout外。

Node22集中7/7通过；独立审查以传递闭包核对512张三节点有向图的6144次查询，验证共同集合及见证箭头/身份，未冒称穷举最短跳数或平行边tie。上下游和空答案三页finalize的validate/deliver/check通过，自动browser-check未运行。root实际点击两侧到Observability路径、上游clients→B，核对Escape回焦及Tab/Enter打开；成功空集和390px深色视图均有原图。390px仍有400px页面宽度、scope/hash截断及iframe横向探索限制，没有移动端/AT/效率接受结论。

[精确远端核对](shared-reach-remote.json)确认GitHub head一致，Actions/check-runs为0，不表示CI通过。最新dev仍6ca6、main仍d605；未创建PR、合入、发布或安装。主索引与图片画廊均已更新54项（17产品/16离线/21内容），固定来源hub `d265744ea580ca0dd36590ff32d05c8e6a0dc68d`。原53卡片及PNG原字节不变，旧浏览器记录保留原身份；root已完成新卡搜索、原图SHA/原始1440×1250尺寸/Escape回焦、390px暗色与空结果/reset。首次图像未解码截图保留，最终完成图另存，不把早期空预览算通过。Ego TaskSpace9已finish且无保留页面。持续探索目标保持active。


## 本批收尾：必经点、循环区域与结构变更

Root已读完本批三份报告。下表区分研究建议与当前实施状态；报告正文保留各自调研时点，不将后续验证状态回写成研究阶段已经完成的交付。

| 报告 | 具体问题与边界 | 当前状态 |
| --- | --- | --- |
| [Mandatory paths](scouts/mandatory-paths.md) | 给定两个不同端点，判断哪些内部点出现在每条有向路径上，并为非必经点保留避开它的精确路径；不是无向割点、运行依赖或系统单点故障。 | 本批唯一已实施方向，独立验证与root真实浏览器观察完成；已推送第55项实验分支，精确身份见下节。画廊增量另行记录。 |
| [Cycle regions](scouts/cycle-regions.md) | 区分所选点所在循环区域、区域内部关系与通向其他区域的单向边；一条环见证不等于整个区域。 | 保留为候选，本批不实施；没有把报告的静态拓扑答案称为已运行的Viewer功能。 |
| [Structural changes next](scouts/structural-changes-next.md) | 保留结构变更报告的每条记录、两侧位置与多源同目标关系；上游expected与动作序列化不证明当前检测准确率或语义移动。 | 保留离线声明投影候选，本批不实施；不新增AST服务、跨版本源码合同或第二个adapter。 |

[Mandatory paths有界排重原始记录](mandatory-path-search.json)保留三个关键词0条结果及“all paths”102条中前30条；首次malformed查询未计入absence。它只记录当次搜索范围，不证明全历史没有重叠。

已发布基准仍为54项（17产品/16离线/21内容），hub `2a36207e431d6b05911d6ceefbdeda767e66d3df`。本次仅补研究入口及保存画廊golden，未改54项实验表、卡片、原图或浏览器证据，没有构建55版。本批不启动另外两项候选；Mandatory paths验证结果、原图与精确远端提交另行补齐后，才决定后续增量身份。


## 第55项：两端点间的必经内部点

[Mandatory paths固定README](https://github.com/tt-a1i/archify/blob/f79704cb63f1577246752c93f8d648a000ea978b/experiments/mandatory-paths/README.md)及[实际主图](https://github.com/tt-a1i/archify/blob/f79704cb63f1577246752c93f8d648a000ea978b/experiments/mandatory-paths/browser-evidence/reachable-overview-light-final.png)已随 `codex/lab-mandatory-paths` 推送，精确head `f79704cb63f1577246752c93f8d648a000ea978b` 经root的远端ls-remote核对。独立实验保留6ca6基线和完整12节点12边输入，SHA-256 `610a5614667e8f108bdcf1769c9d7af5c3ce0fb62be3ea50550b10eb752e4bda`；离线查询不修改共享Viewer或schema。

`clients → audit`的必经内部点为edge、gateway、events、worker；api_a/api_b各有使用另一API的可点绕行见证，Redis等其他点仍在完整图中。反向 `audit → clients` 明确返回不可达，不将其误列为所有点必经。九项focused tests通过，独立审查的49154次查询与61448条绕行见证通过；validate/deliver/check通过，CLI browser-check未运行。这些结果不代表故障、因果、运行依赖、性能或阅读效率结论。

root已实际查看浅深色overview、指针双路、键盘/Enter/Escape与不可达结果，原图与派生观察在实验分支持久保存。主图1440×1250、147115B，SHA-256 `50d3a154b91c1b0204fee94122804556a482099a271deaaec02227f532bb666e`。早期生成中overview与iframe未paint的空键盘截图保留原身份，不算最终成功图。390px桌面CSS视口仍有client375/scroll400的toolbar溢出，不称移动端、触摸或AT通过。

实验总账已为55项，画廊原54版golden已保存，55版静态增量及本批gallery新卡片UI待分别记录，不复用实验截图或旧54版交互冒充本批gallery检查。未创建PR、合入、发布或安装；本批不再增加第二个实现。用户最新“继续吧”恢复持续目标，本批收尾后目标继续，不将交付一个实验写成目标结束。


## 后续只读筛查：源码路径见证（0新增实验）

Root已完整阅读 [Source path witnesses](scouts/source-path-witnesses.md)，采纳本轮**0个新实验**的建议。完整Semgrep SARIF快照中同一文件第3行的两个位置列范围不同（3:9–18与3:5–6），角色及occurrence也不同，不能按文件/行去重。工具提供的threadFlow只是分析说明路径，不等于程序实际执行、因果或已验证漏洞；报告未执行上游、加载扩展或操作浏览器。

报告保留ToB reader只取第一条codeFlow/threadFlow的限制：完整教程输入含两条threadFlows，取第一条会遗漏另一分支。该结论来自固定源码与输入的静态核对，尚非运行兼容证据；它是以后可重新筛选的方向，本轮不启动SARIF adapter或第57项实验。报告是该scout停止后的唯一产物。

先前结构变更报告对应第56项Refactoring records，当前远端交付身份见下节；这与本轮源码路径报告分开记账。已发布画廊仍为55项，第56项source hub与gallery增量另行固定，不把研究报告计入实验数量。


## 第56项：离线重构记录声明投影

独立分支 `codex/lab-refactoring-records` 已推送，root读回远端精确head `bec8671465ff9ce6a2c471196907fc741f52dc53`，工作区clean。[固定README](https://github.com/tt-a1i/archify/blob/bec8671465ff9ce6a2c471196907fc741f52dc53/experiments/refactoring-records/README.md)及[known-base原生主图](https://github.com/tt-a1i/archify/blob/bec8671465ff9ce6a2c471196907fc741f52dc53/experiments/refactoring-records/browser-evidence/overview-light-final.png)绑定完整RefactoringMiner历史@Disabled expected JSON：3180B，SHA-256 `abb1a93274946a7db8bd81de10feb925a3fc5a8107788390e44766028e3a381d`。未运行检测器，不把报告声明称为语义移动、重构准确率或行为等价。

完整账目保留4记录、8位置occurrences、4 before端点、2 after端点和4独立边。R0/R1指向同一个Dog method，R2/R3指向另一个Dog field；相同codeElement不会合并不同文件/范围。known-base来自独立固定parent，unknown-base明确版本未知且不生成before链接；toy源码只保留URL，不复制Java，也不称verified excerpts。实现仅在独立实验中离线投影，未扩共享schema/Reader。

作者6项focused tests通过，最终legend仅metadata变更后复用逻辑相同的测试结果；两份最终原生页面重新经过validate/deliver/check且零诊断。独立审查在最终projector上重做变体、真实CLI与finalize；不同目录重建的原HTML摘要不同，仅独立比较时归一化prepared来源字段，不冒称raw HTML相同。CLI browser-check未运行。

root已查看9张原PNG，实际R0键盘Enter、R1指针共享目标及Escape回原record，核对4条known-base记录各两citations、unknown-base仅after链接。iframe nativeFocus runtime IDs未提取；旧legend图保留历史身份，名为source-card的截图不展示瞬时卡片，卡片URL由之前snapshot和DOM观察单独支持。390px暗色页client/scroll375/375，但record局部317/321；inline图cannot-fit-readable，不能称触摸/AT/跨浏览器或效率验收。

主图1440×1400、173243B，SHA-256 `b4d06c353e16f0299b5f9737bc8674dc8b1a2d3b31a438da8fd24bbf7010b6ea`；packaging index SHA-256 `7e7b61c68bf6dce90c09b0c870662cae4d584bdac33ab32392b65f6ab75643f5`，root核49总文件/48清单条目。实验分支交付不等于合入、发布或安装；56版画廊将按固定source hub生成，旧55项golden与历史浏览器身份保留，本批gallery新卡片操作尚待root单独记录。源码路径报告维持0新实验；持续目标继续。

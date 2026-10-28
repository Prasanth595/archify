# 运行时对象图：把捕获集合、环成员与裁剪结果分开

2026-10-26，只读研究。**推荐至多一项独立实验：Pympler 引用图的“环与关联对象”离线 adapter。** 价值是消费实际工具输出，回答某个对象是否属于已提供图中的有向环、只是与环相连，还是已经被上游裁剪；不再做一个对象别名解释页。准入条件是先取得固定生产者的真实导出，若只能手填 fixture 或遗漏信息使分类不可核查则停止。当前没有 adapter、图片或执行成功结论。

## 去重与当前流程

已读50项主表，检索2026-10-25/26 scouts标题与正文，再复读 adjacent-discovery-round3、debugging-reading-round7、visual-explanation-smalltools、graph-exchange-smalltools。Birdseye的表达式/嵌套迭代保留、VizTracer X区间、Hunter补齐栈、snoop/PySnooper异常行日志、space-tracer逐行迭代值均已有深读。memory_graph已产生 Copy identity，不能换成新的别名候选；Retained size解释静态Wasm大小/支配树；Lasso witness解释形式化无限状态后缀；Task occurrences区分打印位置与任务身份。本轮不重做这些问题。

本轮只深读两个未覆盖来源。当前Archify dev固定 [`e837dc4cb83042d2b6c596e039692e25ec62c2da`](https://github.com/tt-a1i/archify/tree/e837dc4cb83042d2b6c596e039692e25ec62c2da)：[focus.js](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/viewer/focus.js)已有邻域/上下游reach、关系预览与固定，适合阅读已提供图；[reader.js](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/archify/explainer/reader.js#L599-L668)已有固定源码卡。它们不从Pympler导出恢复对象身份或计算环成员。当前流程需要作者手工转录对象与引用，然后自己区分原始集合、裁剪规则与拓扑事实；adapter的剩余价值是消除这次转录并保留可核对的集合差异，不是新增画图或hover。

## 一、objgraph：查找一条引用证据路径，暂不适配

固定 [`mgedmin/objgraph@be0dfb37f20b85ee4cc76a198acae3d3cdaa089d`](https://github.com/mgedmin/objgraph/tree/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d)，[完整MIT LICENSE](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/LICENSE)。

实际触发来自完整 [docs/chain.txt](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/docs/chain.txt)：一个嵌套dict/list中藏着`__getstate__`抛错的对象，作者要找从入口到该对象的引用链。完整小输入与doctest期望在同一26行文件；期望输出四个节点。不是本轮执行，也不是一份已提交结构化heap快照。

生产/消费链完整核对：[find_ref_chain/find_backref_chain](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/objgraph.py#L580-L629)分别使用GC referents/referrers；[_find_chain](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/objgraph.py#L869-L905)先collect，再按深度进行广度搜索，按object id去重并构造parent链，受max_depth和extra_ignore限制，找不到返回`[obj]`；[show_chain](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/objgraph.py#L798-L844)把给定链交给图输出。因此“一项结果”不能被适配器默认标成“没有引用/没有根”，搜索边界必须随报告保留。

上游也有明确版本反例：[uncollectable.txt](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/docs/uncollectable.txt)写的是Python3.4前带finalizer的循环；[test suite](https://github.com/mgedmin/objgraph/blob/be0dfb37f20b85ee4cc76a198acae3d3cdaa089d/tests.py#L640-L654)在新Python跳过该文件，不能拿旧PNG讲现代Python的不可回收性。

**取舍：** 目标对象→选定predicate的一条引用路径有实际代码理解价值，但上游已经输出该路径；Archify已有局部图/reach/来源卡，仅换样式没有新的可回答问题。未建议通用heap遍历器或另一种DOT importer；不作为本轮候选。

## 二、Pympler：捕获对象不全是环成员，裁剪图也不自动等于SCC

固定 [`pympler/pympler@6d595e0ac72d0a6ed2fb4aa77ae5f89189667721`](https://github.com/pympler/pympler/tree/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721)，[完整Apache-2.0 LICENSE](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/LICENSE)与[NOTICE](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/NOTICE)已读。NOTICE另列asizeof的BSD来源及Bottle/Flot等MIT组件；不复制这些实现或web资产。

真实输入/consumer：

- [GarbageGraph.__init__](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/pympler/garbagegraph.py#L32-L47)在collectable模式设置DEBUG_SAVEALL并collect，再把`gc.garbage`交给ReferenceGraph。故“在这份图里”不是“在正常GC配置下泄漏/不可回收”的证明。
- [ReferenceGraph](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/pympler/refgraph.py#L74-L165)只给传入对象集合内的referent连边，保留`id`、引用label。集合外对象不在该图中；图内无环不能证明整个heap无环。
- [writer](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/pympler/refgraph.py#L278-L306)实际输出`digraph G`：节点`X<id>`的label为截短repr与type，边保留引用label；[write_graph](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/pympler/refgraph.py#L344-L350)是公开文件出口。DOT不带gc模式、Python版本、完整repr、count/total_size，adapter不能从它凭空补这些信息。

完整小fixture取自 [test/gui/test_garbage.py](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/test/gui/test_garbage.py)，已完整读取而非只读README。它的[setUp/tearDown](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/test/gui/test_garbage.py#L40-L47)明确开DEBUG_SAVEALL并清理；[test_prune](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/test/gui/test_garbage.py#L133-L157)完整构造一个引用自身且引用Bar对象的list，删变量后对比完整/裁剪图，断言两个count相同、裁剪结果只剩一个环对象、Bar只在完整metadata。上游没有随仓保存本case的DOT；这些是已提交测试/期望，不是本轮运行的heap观察。

另一个完整小case [test_split](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/test/gui/test_garbage.py#L90-L131)断言两组：Foo/Bar及各自`__dict__`形成4节点4边，独立自引用list形成1节点1边。它给adapter提供比“一个自环”更有意义的独立分组与边label oracle；真实执行仍需后续固定Python环境核对，不能保证所有Python版本的实例字典表现相同。

**重要静态发现：** [_eliminate_leafs/_reduce_to_cycles](https://github.com/pympler/pympler/blob/6d595e0ac72d0a6ed2fb4aa77ae5f89189667721/pympler/refgraph.py#L92-L119)只反复删除没有集合内出边的对象。因此对任意ReferenceGraph，“A→B，B↔C”中的A也会保留；这个是源码推导的图论反例，未冒充上游fixture或自然事故。它保留的是能到达环的节点，不总等于严格环成员。GarbageGraph的特定捕获集合可能另有约束，不能由此宣布其所有输出错误。候选应在输入图上独立算SCC，避免把上游`num_in_cycles`或reduced标志直接改名为精确环成员。

## 唯一候选：Pympler writer输出的离线环阅读adapter

**不同问题。** 当前Pympler报告让人看对象/引用、可另输出裁剪图；候选让读者对任意选中对象直接回答：“它在本次提供图的有向环中吗？它与哪一组环关联？在裁剪图消失的是哪些身份？为何所有捕获对象不等于环成员？”这服务于运行对象关系分析；不宣称找出分配位置、内存泄漏根因、真实heap全覆盖或可回收字节。与Copy identity的共享/复制、Retained size的支配计数、Lasso的状态无限运行都不同。

**实际输入合同。** 首刀只接固定版本`ReferenceGraph.write_graph()`产生的原DOT路径；可选再给同一批对象的reduced DOT作比较。原件及hash完整保留，节点身份只在同一捕获/同一次导出集合内沿用`X<id>`，不跨运行按id或repr合并。捕获模式/版本/是否裁剪须由调用者提供生产命令记录；未提供就显示未知。DOT保有type/截短repr/label，不能称保存原对象或完整值。无需新heap采集器、活动进程attach或Pympler代码移植。

**最小独立实验。** 用独立实验目录里的窄adapter读取上游writer子集，把每个输入节点/边映射为原生Architecture；计算输入图SCC，以多节点SCC或自环识别环成员，显示原集合/环成员/非环关联对象三类数量及各身份。不引入共享schema、通用DOT产品入口或新的Viewer状态机；复用Finder、Focus及Explainer表。两个DOT可比较身份集合，但不能把相同id跨不同进程自动视为同对象。

**必须先做的复现与有意义验证。**

1. 先在固定Pympler+记录Python版本的环境运行最小上游test_prune/test_split对应生产链，保存完整真实DOT、原环境/模式、生产输入与LICENSE/NOTICE；不得手写DOT后叫上游导出。此研究任务禁止运行上游，所以这步尚未执行，是后续实验入口而非本轮完成项。
2. 验证原DOT→原生图逐身份/逐边一致；test_prune的非环Bar仍可在完整图找到，环计数由输入SCC计算；test_split两组4/1节点及__dict__/next/prev边按实际输出核对。若版本差异导致上游expected不成立，保留差异，不固定宣传数字。
3. 独立的明确标“构造算法回归”的A→B、B↔C，确保A不是环成员；保留上游leaf-core与SCC差别。它验证分类而不伪装真实heap。
4. 实际浏览器验收选择一个尾部对象和一个环对象，原文/图/计数能相互定位；查看完整与裁剪集合时原始身份可查。截图绑定最终HTML/hash。只验证可回答性、事实保真与操作，不声称人类理解率或效率收益。

**维护成本与停止条件。** 主要成本是固定writer子集的解析、SCC与身份保真检查、版本字段/原件留存；不是只维护一页说明。repr和label有转义/截短边界，应在真实导出验证时明确该子集，遇到不能保真的输出就报不支持而非猜节点；不要为理论DOT全集或任意heap构造兼容框架。若真实fixture不能形成稳定可分享输入、解析成本接近通用DOT平台、或结果只剩换皮原图而没有可定位分类，则取消。也可后退为Pympler导出脚本直接产原生JSON，但那是改变输入合同，需重新比较维护成本，不能本报告自动授权。

## 证据状态

只写本报告，未运行objgraph/Pympler、用户程序、GC实验、Graphviz或测试，未浏览器、开分支、提交或更改产品。两来源均已固定源码、许可与完整fixture；没有复制实现。推荐的是一个可证伪的adapter研究实验，尚未成立为完成集成或真实用户效果。相较继续追加单fixture解释页，它有明确外部输入与不同的阅读问题；若后续真实导出不支持这点，应停止。


## 后续可行性实测（2026-10-26）

在上述只读研究之后，按新增授权于checkout外隔离子进程真实运行已审查的固定Pympler生产链。此节更新当前处置：**本批暂不实现DOT方案，也不改做自有JSON平台；未来JSON exporter须另行评估。** 前面的候选及“尚未运行”描述保留为当时研究状态，以本节实测结果为准。

完整原创控制输入`input.py`构造4个list身份：`root→left`、`left→right`、`right→left`、`left→tail`，调用真实`ReferenceGraph.write_graph()`及`reduce_to_cycles()`，没有手填DOT。固定Pympler commit仍为`6d595e0ac72d0a6ed2fb4aa77ae5f89189667721`，包版本1.1；CPython3.14.8以`-I -S`运行，不执行安装hooks或全库测试。真实退出码0、stderr为空；完整原图**4节点4边**，裁剪图**3节点3边**：非环成员root仍保留，tail消失，验证了leaf-pruning与严格环成员的差异。未运行Graphviz、GarbageGraph或主动GC收集实验；输入未调用`gc.collect()`、未设置DEBUG_SAVEALL，GC debug/enabled状态前后均为0/true。不据此判断真实heap、泄漏或不可回收性。

同次原创控制probe将普通dict key交给同一writer：QUOTE key内双引号未转义，例如原key为`quote"key`，输出包含`label="quote"key"`；BACKSLASH key尾部反斜线与closing quote产生转义歧义；NEWLINE key使边label跨物理行。节点repr则先截短/替换引号，不能无损恢复原值。这是原输出字节与已知输入的对照，**没有宣称Graphviz运行报错**。故writer可处理这次纯list小图，但不是任意普通对象都可独立可靠导入的合同；不以猜测修补坏DOT，也不为第51项做狭窄DOT-only页面。

完整输入、未改动的DOT、stdout/stderr/退出码、Python/来源身份及完整LICENSE/NOTICE已保留在独立临时证据包；本报告只列相对原件名称和SHA-256，不公开机器个人路径。证据未收入仓库，也未声称持久发布；对象id属于这一次进程，再运行的DOT字节摘要会改变。

| 原件 | bytes | SHA-256 |
| --- | ---: | --- |
| `input.py`（完整原创输入） | 2985 | `c149b05ccf0b90b310d1a0b086c8a36a220bae4090851ca01a84663808feee57` |
| `feasibility.md`（完整收据） | 6567 | `162032ba8f7af1aa37e14b35597bd894b8804442dfaaa0527911be8fefddeef9` |
| `reference-full.dot` | 450 | `6dbe76399c73fd8930567f4439bee6c0b519b9dbe75de1fdccc9a4c4deae32f5` |
| `reference-reduced.dot` | 364 | `710530a105390d3593ef9c2208fb47096870ffabbbef99e38be43d6bddcb27b9` |
| `probe-quote.dot` | 224 | `a2cb4f6d72c38d98101faa34ec185d97a8849088a8f85229ff4a3a4435026265` |
| `probe-backslash.dot` | 217 | `0782b5f6912f79c5b045308e123ce4b1db4984d20708681fdaa0b31af82ca0a2` |
| `probe-newline.dot` | 223 | `78f226932c262a59acf32d8826f5f53b38c0d6afc5f81267224864f30f27b8f5` |
| `source-manifest.json`（固定URL/完整许可与源码指纹） | 2410 | `86b7332abcc9be2b57e88aca43453b43d7635cb3c97ebaa6e3976982e7dc6ef0` |
| `sha256.json`（其余原件完整摘要清单） | 2782 | `50d3778b40b339e852aec9971b7bcd911cc46a0571cdcfe604374e04f7f67df4` |

本次追加只记录可行性结果；没有adapter、图片页、产品分支、提交或上游修补。语义阅读问题成立，但当前DOT输入合同未达到本批集成所需可靠性，实施在此停止。

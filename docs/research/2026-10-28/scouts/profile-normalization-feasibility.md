# P2 pprof 归一化差分：独立可行性审查

2026-10-28。结论：**reject“P1 Tree换fixture+彩色正负表”；有条件保留一个范围不同的实验：归一化的全局分母依赖与报告分母分支。**前者只重复上下文定位，后者可以回答“为什么其他5条栈也参与S1归一化、为什么count与delay用不同factor、为什么base/diff_base显示不同百分比”。必须将这些依赖画成原生Dataflow并可追回完整原件；如果最后只剩静态表和泛化步骤，不建议实现。

Root随后已选择Dataflow算式路径作为内容实验，并另派实施者在独立worktree实施；本报告只记录可行性研究及该选择决定。本次从固定上游源码重新阅读并独立计算，没有依赖旧报告叙述作证。研究阶段只写本报告，无产品/旧报告/hub更改，无浏览器、安装、上游执行、commit/push。可选渲染probe未启动，本报告阶段没有启动Archify渲染，也没有实施P2；后续实施状态另行记录。

## 1. 基线、去重与真正新增的阅读问题

Archify dev固定`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`；hub固定`3ddd3f93911036395158c93f789f677a23e2c5da`。通过`git show <hub>:docs/research/2026-10-25/gallery/manifest.json`重新读取58项id/value。

- `profile-contexts` 已保留递归prefix、Frame总计、全部occurrence、贡献与回链。P2若再做同样的Tree来源浏览，只是换fixture，应拒绝。
- `benchmark-reading` 的median/CI/p/n是统计比较；本实验没有显著性判断，也不证明性能收益。`delta-values`是已有JSON receipt的exact row详情，不能直接承担normalize算法语义。
- `retained-size`、`plan-row-counts`已解释局部数字如何求和；本实验必须增加“全局总量决定每条栈的ratio”和“同一差值的两种百分比分母”两项具体关系，不能只再写一条算式。
- `trace-waterfall`、`cycle-region`、`shared-reach`、`mandatory-paths`均不定义采样normalize。这里不是时间线、运行调用边或故障传播图。

重新查询当前open issue/PR（limit500，标题过滤`normaliz|profil|pprof|compar|差分|采样`），并读取[#1143](https://github.com/tt-a1i/archify/pull/1143)完整body/files：当前head `649550292e9d9df7e3a3e140d9c1a5ea3bcbf678`，是Workflow稳定node/edge身份的语义JSON比较，忽略布局变化，不生成图。它与本实验的数值scale/round/subtract、分母和profile stack身份无重叠。相邻[#1049](https://github.com/tt-a1i/archify/pull/1049)/[#1044](https://github.com/tt-a1i/archify/issues/1044)是Architecture Git-ref compare；[#1134](https://github.com/tt-a1i/archify/issues/1134)是Workflow compare来源；[#83](https://github.com/tt-a1i/archify/issues/83)为泛comparison/hover。#906是DSH配置profile，排除。此为有界open标题搜索与指定PR正文，不宣称搜全历史/所有正文。

**增量假设（尚未用户测量）**：相比完整原表，Dataflow能让读者选S1结果，沿依赖看见全部S1…S6都汇入sourceTotal，再看见baseTotal/sourceTotal输入factor，并把另一条B1减法关系与全局factor关系分开；在报告分母图上能区分“比较结果”与“百分比分母”。表仍负责完整数值，不以图替代表。验证任务必须要求指出具体上游行与算式，不能只问红蓝符号含义。

## 2. 固定上游与原件完整性

上游`google/pprof`固定SHA `dbd0ed30aa888a30e21ba83b9831ac0e80d41022`。四个原件本轮重新完整读取，并通过GitHub contents API按固定SHA重取，比对本地archive bytes完全相同：

| 文件 | bytes | SHA-256 |
| --- | ---: | --- |
| `internal/driver/testdata/cppbench.contention` |1551|`e0f3035db93cd3bb384590b224ca2b26d79aca41e71042a32c351a6d3e34d2d4`|
| `internal/driver/testdata/cppbench.small.contention` |821|`0d1f47b05eb6664827672b360eb122f13daec15765eb76eed1d77ed9e788516f`|
| `profile/testdata/cppbench.contention.string` |2025|`a552baca08d20d75945171f9d1ff08f5f9df12a0d7099ce88c9b894358015552`|
| `LICENSE` Apache-2.0全文 |11358|`cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`|

附录完整内嵌以上四文件，不截选。后续实现应保存原bytes而非从Markdown重排恢复。source有6条完整stack、base有1条完整stack，各自12条memory map（source原行13…24，base原行8…19）全部保留；golden的40个location与12个mapping全部保留。历史采集现场/负载/时间顺序未知；不能把source和small base说成已知新旧版本或同进程连续累计快照。`cppbench_server_main`是mapping文件名，**不是已符号化的函数名**。

## 3. Producer：unsample、单位、地址与截断

实读[legacy_profile.go:680-838](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/legacy_profile.go#L680)：

1. `parseContention`建立PeriodType=`contentions/count`，sample types顺序为`contentions/count`、`delay/nanoseconds`，Period初始1后读取100。`ms since reset=16502830`变为DurationNanos=16502830000000；这是header累计时长字段，不等于delay之和，也不作为normalize分母。
2. 原始每行第一列v1、第二列v2；在period>0且cpuHz>0时`cpuGHz=float64(cpuHz)/1e9`，`v1=int64(float64(v1)*float64(period)/cpuGHz)`；count=`v2*period`，输出顺序`[count,delayNs]`。这里cpuHz=3201000000、cpuGHz=3.201，factor不是把原样本count当调用数。
3. Go float64转int64在这些正值上**向零截断**，不是round。source第一条19490304cycles→608881724ns；base100cycles→3124ns。源码注释“Contentions are scaled to cycles”不应机械照抄成count单位变cycles：实际SampleType仍count，代码对v2只乘period。必须以字段与运算共同界定语义。
4. 每个输入地址都减1，源注释解释raw stack返回地址指向调用后下一指令，减1落到调用指令内。raw0xbccc97→Location.Address0xbccc96；保留两列，不用corrected地址覆盖原行。
5. `parseAdditionalSections`→`ParseMemoryMapFromScanner`读取完整maps，重编号Locations/Mappings、按区间关联地址（同文件内ID不保证跨profile同身份）。原stack顺序leaf→caller；不要因图画左→右就声称时间先后。无符号信息时仅显示S1和地址，不补函数名、源码行或业务角色。

本轮独立Python标准库直接解析两个原件，复核source6行值与golden6行完全一致，并逐个核对**79个source地址位置**：`raw-1 == goldenSample.locationID→goldenLocation.address`，40个unique locations均参与核对。base13地址与S1完全相等；总原始地址位置92（source79+base13）。没有运行pprof。

## 4. Normalize、round、subtract与profile身份

实读[merge.go:91-123](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/merge.go#L91)、[profile.go:793-826](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/profile.go#L793)、[fetch.go:60-79](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/fetch.go#L60)：

- Normalize检查兼容类型，**每个metric分别**求source总量与base总量，ratio=`baseTotal/sourceTotal`；source总量为0则该ratio=0。只对这个完整fixture声明实现支持，不为理论零分母扩展通用平台。
- ScaleN用`int64(math.Round(float64(v)*ratio))`，Go math.Round是half-away-from-zero。当前source正值可用floor(x+0.5)独立复核；不能泛化成Python默认banker's round或JS Math.round对负半值的语义。这里unsample的截断与normalize的round是两道不同运算。
- ScaleN仅丢弃所有metric均为0的样本。S2、S5归一化后delay=0但count=29，因此保留；不能在ns视图静默删除这两条记录。
- fetch顺序是：若diff_base，先在base样本设`pprof::base=true`；若normalize，source.Normalize(base)；然后base.Scale(-1)；最后combineProfiles/Merge。**先scale再减，不是先减再scale。**
- [merge.go:155-237](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/merge.go#L155)的sampleKey包括完整Location序列以及labels/numlabels；不是仅按首地址或显示名合并。两个文件maps相同、S1/B1全序列相等，因而本fixture可精确匹配；S2…S6在base不存在，比较该完整记录的贡献为0，不等于采集现实中绝不执行这些代码。

数据模型必须保留三层：`inputSamples`为6source+1base原始记录；`baseMergedSamples`为6个无标签signed完整stack；`diffBaseMergedSamples`是6source与1个带base标签的负样本共7条，不能谎称diff_base的protobuf内部也已经合并成6差值。展示用`comparisonRows`可按忽略base角色标签后的完整stack对应为6行，但必须标为算术projection，保留输入角色及标签ledger。

## 5. 完整算术oracle（本轮独立重算）

source总量`[3500 count,690508213 ns]`；base总量`[1000 count,3124 ns]`。normalize factors分别`1000/3500=2/7`和`3124/690508213`，**绝不共用一个比例**。以下行按原件source原行6…11；B1对应base原行6，只与S1同完整stack。

| source | raw cycles,count | unsampled count,ns | scaled+rounded count,ns | unnormalized source−base count,ns | normalized source−base count,ns |
|---|---|---|---|---|---|
|S1|19490304,27|2700,608881724|771,2755|1700,608878600|-229,-369|
|S2|768,1|100,23992|29,0|100,23992|29,0|
|S3|5760,2|200,179943|57,1|200,179943|57,1|
|S4|569088,1|100,17778444|29,80|100,17778444|29,80|
|S5|2432,1|100,75976|29,0|100,75976|29,0|
|S6|2034816,3|300,63568134|86,288|300,63568134|86,288|

B1 raw=`100cycles,10count`→unsampled`[1000,3124]`；base不被normalize，只在合并前取负。scaled source sums `[1001,3124]`，normalized signed net sums `[1,0]`；count的1来自逐样本round，不是丢了一条stack。S1符号翻转表示比较问题改变，不能写“性能改善”“显著”“优化了229次调用”。

上游[fetch_test.go:327-416](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/fetch_test.go#L327)两个完整case列出上述6行unnormalized/normalized expected。本轮源码静态核对及Python重算吻合，但没有运行该Go测试。

## 6. `base` 与 `diff_base` 的百分比分母：重要补证

不能只按doc概述或“净差”口算。实读[report.go:1319-1352](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/report/report.go#L1319)：computeTotal对每个merged sample的所选metric取abs求和；若带`pprof::base=true`的abs总和>0，则改用该标记子集的总和。meanDiv还会另算均值，本实验固定非mean模式，不能把mean比例带进来。

再读[driver.go:79-109](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/driver.go#L79)：report.New计算total在aggregate之前；默认relative_percentages=false时，也在applyFocus之前。这里限定**无focus/ignore/mean、无额外divide_by**的原始全样本模式。别将后续按地址聚合得到的net当分母。

| 比较设置 | count denominator | delay denominator(ns) | 实际取值集合 |
|---|---:|---:|---|
|不normalize + base|2500|690505089|6条完整signed样本的abs和；这组差值都正，恰等于sourceTotal−baseTotal|
|不normalize + diff_base|1000|3124|负base样本的abs和；标签使B1与S1不先抵消|
|normalize + base|459|738|`229+29+57+29+29+86`；`369+0+1+80+0+288`|
|normalize + diff_base|1000|3124|仍为带base标签样本的abs和|

例：S1 normalized count的百分比可分别写作`-229/459`（base）与`-229/1000`（diff_base）；delay为`-369/738`与`-369/3124`。这些是**算术展示行**的比率，不冒充已跑出的pprof格式化UI。净差1/0不是分母，不能画除以0再发明兜底。

doc的“累计profile用sourceTotal−baseTotal”有特定同程序累计条件；本历史pair未证明该条件。doc关于一般情况“absolute … aggregated at address level”不应替代此处固定源码：computeTotal在aggregate前按merged完整sample求abs，当前源码答案明确为459/738。后续实现应命名`reportTotalAbsSamples`并保留本范围。

额外反例：所有6source+1base栈的leaf都为corrected `0xbccc96`。若用graph flat地址合并后展示，normalized signed count会抵消为1、delay为0；S1的负值会被别栈正值抵消。**地址热点图不能替代完整stack差值图**；同一地址≠同一stack，原始已无符号时更不能称为“函数改善”。

## 7. 可行的图：全局依赖与分母分支，而非彩色表

建议一个实验，两个metric固定视图（count/ns）+一个报告分母分支图；复用同一完整ledger与生成器。不要做运行时metric切换或新共享状态，也不实现通用pprof importer。

### A. 原生Dataflow：S1算式见证，完整7输入

每个metric的图明确命名“全部source决定S1的归一化算式”，不是全量调用树。保留7个输入节点S1…S6+B1，每个节点指向各自完整stack/原行。后续节点：sourceTotal（6项fan-in）、baseTotal（B1）、factor（分子baseTotal/分母sourceTotal）、roundedS1（factor及S1双输入）、absoluteDiffS1（S1与B1）、normalizedDiffS1（roundedS1与B1），共13nodes/15flows。

- 两张图都使用5个现有stage：完整输入→总量→factor→round→两种diff。原生stage最多5，不能偷偷加6/7stage。scalar输入可跨stage连接，数值与单位在sublabel，算式与全部依赖在block详情。
- 只选择S1作为**解释输出**是为了回答符号翻转；输入6+1完整保留，完整六行scaled/diffs表在同页，S2/S5的0ns/29count另有steps和block。不可只保留S1/B1后把3500与690508213写成无出处常数。此见证图的coverage账目明确“全部7输入；解释S1单行运算；完整6输出在邻表”，不自称图内计算了全部6条独立输出。
- 若root要求图上展示全部6条各自round/diff，则生成同结构的明确row witness或展开6条输出，不得删原始输入来过可读性gate；需用真实图验证额外维护/阅读成本，否则维持清楚声明的S1 witness范围。
- 关系是**值依赖/计算依赖**，不是进程调用、因果影响、执行时间或上游真实trace。静态生成算术结果，Viewer不做profile求值。图例必须说清；运行时Live动画不能被描述为测得执行顺序。

### B. 原生Dataflow：report denominator分支

输入两个完整signed-vector节点：unnormalized six rows与normalized six rows；两条设置分支：base的merged-label-free样本→逐样本abs/sum，diff_base的source6+tagged负B1→仅tagged base abs/sum；每个分支block列明count/ns的完整集合与结果。净和1/0单列“不是百分比分母”的解释，不连接为除法输入。

可用一张5stage内的小Dataflow（完整signed样本→配置/标签→求abs集合→总量→S1 ratio），或两张metric图；不能用Workflow compare模拟，因为此处不是作者diagram semantic delta。只要源码与公式可独立重算，无需新增产品schema或共享页面状态。

### 既有schema/互动约束（已实读6ca6兼容源码）

[dataflow.schema.json](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/schemas/dataflow.schema.json)要求stages 2…5，节点id/type/label/stage/row，flows from/to/label；允许sublabel、explanation与稳定flow id。不是数学引擎，不接受自造metric/result字段。由离线model驱动规范spec，数字保持在已支持的标签/说明与旁表，别把metric schema偷偷扩成通用数值图。

[explainer.schema.json](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/schemas/explainer.schema.json)支持inline native spec与nodeBlocks/nodeSources；用canonical JSON authored page生成，不给Markdown `@diagram source=...`臆造nodeBlocks行语法。steps可引用node或明确edge IDs，hover/focus/Walk照亮现有target；node:打开精确native Viewer，block:跳到既有来源段。

固定阅读链：factor preview focus→nodeBlocks来源卡→“阅读这段”→sourceTotal贡献列表S1…S6→某个完整source row/stack/map→**明确返回factor入口**；S1 normalized diff→round值→factor来源→减去B1匹配说明→报告分母分支。每个(row,entry)详情返回其稳定的真实prose block入口（其中含对应node:链接），不依赖动态来路；不要假设block:能指向任意steps item而不先通过既有target校验。来源卡正文只显示纯文本，链接在真实block中才可操作；native Viewer关闭会恢复打开它的链接focus，**不会将Viewer里任意新选点反向同步父页**。本实验不用新增局部桥接、不把普通block anchor称为完整DOM返回栈。

外部固定SHA的源码/原件用URL-only @source；literal原文由原bytes生成并带hash ledger。若没有真正从Git验证excerpt，不能声称verified snippet。完整memory maps作为full-source块和按原行定位的map详情均可查，含未被stack地址引用的条目，不应为了画得小只保留主程序+pthread两行。

## 8. 可复现输入/输出合同与接受门

推荐纯离线脚本（标准库即可），仅支持上述两个固定legacy文件；先hash原件，再独立生成inputRows/maps/correctedLocations、两个metric总量、normalizedValues、两种merged samples与comparisonRows、四种denominator。解释标题可authored，所有数字、集合、回链都来自ledger。保存完整Apache全文和upstream attribution；不复制上游实现，若有摘录保留原copyright/license header并注明derived文件。

可证伪检查：

1. 1551/821/2025/11358原bytes hash；6source+1base，source24行/base19行，maps各12；原始stack长度13/4/15/16/16/15及base13；source40unique location，所有79+13地址位置保留raw/corrected。
2. 完整golden六行数值和所有location对应关系逐字段一致，不仅S1；maps全部存在。原始和修正地址不得串作稳定跨版本函数身份。
3. 上表六行raw/unsampled/scaled/two diffs全部核对独立常量oracle；两个metric独立ratio；逐行round后count1001、ns3124。加入Go round正负半值的局部运算语义检查，不能用JS Math.round负半值伪等价；该检查只验证算术合同，不拓展负原始fixture支持。
4. baseMerged6行、diffBaseMerged7行及label ledger准确；S2/S5整条记录不因ns0而消失；全部base缺失stack有明确0贡献与“此输入缺失”范围。
5. report denominator四组精确为`[2500,690505089] [1000,3124] [459,738] [1000,3124]`；算术净差1/0不作为分母。fixed nonmean、no focus/no extra divide_by写入scope，不冒充覆盖所有pprof设置。
6. 图A两metric各完整7input/6source→total入边，factor的分子分母有明确方向；round同时依赖selected S1和factor，减法两输入方向明确；所有node/flow/step/block target存在。完整结果表不是图coverage替身，图coverage也不虚报全6运算可选。
7. 必须后续真图/真实键盘和指针核对：S1结果→factor→全部6source→S2原行及maps→返回同factor入口；source2ns0/count29可读；normalized base与diff_base分母分别可点到绝对值集合与标签B1；看不到这些依赖/标签差异就失败。正常静态gate通过不抵消读图任务失败。
8. 与“完整原件+全数值表+公式文字”基线并排检查三任务：读者能否指出S2虽不同stack仍贡献S1的normalize denominator、S2为何delay0而count29、S1相同差值为何不同百分比。未做读者计时/正确率测量前，只报计算与阅读链已验证，不报效率收益。

## 9. 维护成本与停做条件

边界成本：固定legacy解析、float64截断/round的两阶段语义、完整stack/标签identity和4分母oracle，以及Dataflow见证生成与稳定入口/回链。没有通用profiler采集、符号服务器、二进制解析、产品schema、全局选择状态或动态UI计算。

可接受是一次小而完整的“全局分母依赖”试验；P1原有来源block/回链模式复用可以减少维护，但不是新的价值本身。以下任何一种应拒绝/停止扩建：最终产物仍只有Tree+红蓝表；sourceTotal只是无来源常数；未保留source6+base1全部stack/maps；Graph为了fit删S2/S5或其他来源；base与diff_base仅换标题不展示真实标签/abs集合；把历史pair包装成版本优化证据。拒绝原因是任务增量没成立，不是没发生生产事故或还没证明速度收益。

## 10. 本轮真实完成范围

重新完整读producer/Normalize/ScaleN/fetch/Merge sampleKey/report.computeTotal/driver顺序、原件3份和完整Apache正文；fixtures、LICENSE、report.go、driver.go按固定SHA用GitHub API重取比对一致。Python标准库解析完整输入、核六行golden值与79地址位置、base13地址、两套differences与四组denominator。未运行Go/pprof或tests，未创建/打开浏览器，未做Archify渲染/视觉/用户效率验收，未实施P2。可选probe的启动前workdir错误没有任何产物，未把它算作验证证据。

## 附录：完整上游原件（未裁剪）

### internal/driver/testdata/cppbench.contention

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/testdata/cppbench.contention) · 1551 bytes · SHA-256 `e0f3035db93cd3bb384590b224ca2b26d79aca41e71042a32c351a6d3e34d2d4`

```text
--- contentionz 1 ---
cycles/second = 3201000000
sampling period = 100
ms since reset = 16502830
discarded samples = 0
  19490304       27 @ 0xbccc97 0xc61202 0x42ed5f 0x42edc1 0x42e15a 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
       768        1 @ 0xbccc97 0xa42dc7 0xa456e4 0x7fcdc2ff214e
      5760        2 @ 0xbccc97 0xb82b73 0xb82bcb 0xb87eab 0xb8814c 0x4e969d 0x4faa17 0x4fc5f6 0x4fd028 0x4fd230 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
    569088        1 @ 0xbccc97 0xb82b73 0xb82bcb 0xb87f08 0xb8814c 0x42ed5f 0x42edc1 0x42e15a 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
      2432        1 @ 0xbccc97 0xb82b73 0xb82bcb 0xb87eab 0xb8814c 0x7aa74c 0x7ab844 0x7ab914 0x79e9e9 0x79e326 0x4d299e 0x4d4b7b 0x4b7be8 0x4b7ff1 0x4d2dae 0x79e80a
   2034816        3 @ 0xbccc97 0xb82f0f 0xb83003 0xb87d50 0xc635f0 0x42ecc3 0x42e14c 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
--- Memory map: ---
  00400000-00fcb000: cppbench_server_main
  7fcdc231e000-7fcdc2321000: /libnss_cache-2.15.so
  7fcdc2522000-7fcdc252e000: /libnss_files-2.15.so
  7fcdc272f000-7fcdc28dd000: /libc-2.15.so
  7fcdc2ae7000-7fcdc2be2000: /libm-2.15.so
  7fcdc2de3000-7fcdc2dea000: /librt-2.15.so
  7fcdc2feb000-7fcdc3003000: /libpthread-2.15.so
  7fcdc3208000-7fcdc320a000: /libdl-2.15.so
  7fcdc340c000-7fcdc3415000: /libcrypt-2.15.so
  7fcdc3645000-7fcdc3669000: /ld-2.15.so
  7fff86bff000-7fff86c00000: [vdso]
  ffffffffff600000-ffffffffff601000: [vsyscall]
```

### internal/driver/testdata/cppbench.small.contention

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/internal/driver/testdata/cppbench.small.contention) · 821 bytes · SHA-256 `0d1f47b05eb6664827672b360eb122f13daec15765eb76eed1d77ed9e788516f`

```text
--- contentionz 1 ---
cycles/second = 3201000000
sampling period = 100
ms since reset = 16502830
discarded samples = 0
       100     10 @ 0xbccc97 0xc61202 0x42ed5f 0x42edc1 0x42e15a 0x5261af 0x526edf 0x5280ab 0x79e80a 0x7a251b 0x7a296d 0xa456e4 0x7fcdc2ff214e
--- Memory map: ---
  00400000-00fcb000: cppbench_server_main
  7fcdc231e000-7fcdc2321000: /libnss_cache-2.15.so
  7fcdc2522000-7fcdc252e000: /libnss_files-2.15.so
  7fcdc272f000-7fcdc28dd000: /libc-2.15.so
  7fcdc2ae7000-7fcdc2be2000: /libm-2.15.so
  7fcdc2de3000-7fcdc2dea000: /librt-2.15.so
  7fcdc2feb000-7fcdc3003000: /libpthread-2.15.so
  7fcdc3208000-7fcdc320a000: /libdl-2.15.so
  7fcdc340c000-7fcdc3415000: /libcrypt-2.15.so
  7fcdc3645000-7fcdc3669000: /ld-2.15.so
  7fff86bff000-7fff86c00000: [vdso]
  ffffffffff600000-ffffffffff601000: [vsyscall]
```

### profile/testdata/cppbench.contention.string

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/profile/testdata/cppbench.contention.string) · 2025 bytes · SHA-256 `a552baca08d20d75945171f9d1ff08f5f9df12a0d7099ce88c9b894358015552`

```text
PeriodType: contentions count
Period: 100
Duration: 4h35
Samples:
contentions/count delay/nanoseconds
       2700  608881724: 1 2 3 4 5 6 7 8 9 10 11 12 13 
        100      23992: 1 14 12 13 
        200     179943: 1 15 16 17 18 19 20 21 22 23 9 10 11 12 13 
        100   17778444: 1 15 16 24 18 3 4 5 6 7 8 9 10 11 12 13 
        100      75976: 1 15 16 17 18 25 26 27 28 29 30 31 32 33 34 9 
        300   63568134: 1 35 36 37 38 39 40 6 7 8 9 10 11 12 13 
Locations
     1: 0xbccc96 M=1 
     2: 0xc61201 M=1 
     3: 0x42ed5e M=1 
     4: 0x42edc0 M=1 
     5: 0x42e159 M=1 
     6: 0x5261ae M=1 
     7: 0x526ede M=1 
     8: 0x5280aa M=1 
     9: 0x79e809 M=1 
    10: 0x7a251a M=1 
    11: 0x7a296c M=1 
    12: 0xa456e3 M=1 
    13: 0x7fcdc2ff214d M=7 
    14: 0xa42dc6 M=1 
    15: 0xb82b72 M=1 
    16: 0xb82bca M=1 
    17: 0xb87eaa M=1 
    18: 0xb8814b M=1 
    19: 0x4e969c M=1 
    20: 0x4faa16 M=1 
    21: 0x4fc5f5 M=1 
    22: 0x4fd027 M=1 
    23: 0x4fd22f M=1 
    24: 0xb87f07 M=1 
    25: 0x7aa74b M=1 
    26: 0x7ab843 M=1 
    27: 0x7ab913 M=1 
    28: 0x79e9e8 M=1 
    29: 0x79e325 M=1 
    30: 0x4d299d M=1 
    31: 0x4d4b7a M=1 
    32: 0x4b7be7 M=1 
    33: 0x4b7ff0 M=1 
    34: 0x4d2dad M=1 
    35: 0xb82f0e M=1 
    36: 0xb83002 M=1 
    37: 0xb87d4f M=1 
    38: 0xc635ef M=1 
    39: 0x42ecc2 M=1 
    40: 0x42e14b M=1 
Mappings
1: 0x400000/0xfcb000/0x0 cppbench_server_main  
2: 0x7fcdc231e000/0x7fcdc2321000/0x0 /libnss_cache-2.15.so  
3: 0x7fcdc2522000/0x7fcdc252e000/0x0 /libnss_files-2.15.so  
4: 0x7fcdc272f000/0x7fcdc28dd000/0x0 /libc-2.15.so  
5: 0x7fcdc2ae7000/0x7fcdc2be2000/0x0 /libm-2.15.so  
6: 0x7fcdc2de3000/0x7fcdc2dea000/0x0 /librt-2.15.so  
7: 0x7fcdc2feb000/0x7fcdc3003000/0x0 /libpthread-2.15.so  
8: 0x7fcdc3208000/0x7fcdc320a000/0x0 /libdl-2.15.so  
9: 0x7fcdc340c000/0x7fcdc3415000/0x0 /libcrypt-2.15.so  
10: 0x7fcdc3645000/0x7fcdc3669000/0x0 /ld-2.15.so  
11: 0x7fff86bff000/0x7fff86c00000/0x0 [vdso]  
12: 0xffffffffff600000/0xffffffffff601000/0x0 [vsyscall]  
```

### LICENSE

[固定原件](https://github.com/google/pprof/blob/dbd0ed30aa888a30e21ba83b9831ac0e80d41022/LICENSE) · 11358 bytes · SHA-256 `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30`

```text

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright [yyyy] [name of copyright owner]

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```

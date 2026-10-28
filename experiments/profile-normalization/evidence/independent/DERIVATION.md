# P2 独立正确性依据（候选审查前）

2026-10-28。当前结论仅建立审查oracle，尚未审查候选或执行浏览器/上游。范围：完整固定pprof原件，nonmean、无focus/ignore、无额外divide_by，先按完整merged samples计算report total，再聚合地址。没有使用实现产物生成golden。只在本/tmp目录写入，未改实验/hub，未commit/push/install。

固定上游 `google/pprof@dbd0ed30aa888a30e21ba83b9831ac0e80d41022`，本机archive `$UPSTREAM_ARCHIVE`。源码已独立阅读：

- `profile/legacy_profile.go:683–838`：header与单位、两列重排、unsample、地址减1。
- `profile/merge.go:94–123,155–245,284–414`：每metric Normalize及完整映射location序列+标签身份。
- `profile/profile.go:774–826`：base标签、ScaleN的math.Round及保留非全零sample。
- `internal/driver/fetch.go:60–79`：tag→normalize source→negative base→merge顺序。
- `internal/driver/driver.go:79–109`、`internal/report/report.go:1291–1352`：New捕获total先于aggregate；computeTotal逐sample取abs，若base标签子集abs>0改用该子集。
- `internal/report/report.go:268–271`、`internal/graph/graph.go:341–398,570–611`：建图时移除base标签；按地址/objfile的节点投影可使不同完整stack值抵消。

独立Python脚本 `derive.py` 读取完整原bytes，输出 `derivation.json`。source1551B、base821B、golden2025B、Apache11358B及hash均与固定原件相同。source6行、base1行、各12条full memory map；全部79+13个地址位置保留raw/corrected。source全部六行值、40个location及12个mapping与完整上游`.string` golden一致。初始oracle完成后才与root独立exact-rational receipt比较，六行两metric全部一致；两者都没有运行Go上游。

## 可以直接判错的数值和身份

producer将原列cycles,count变为`[count*100, trunc(float64(cycles)*100/3.201)]`，输出单位`[count,nanoseconds]`。truncate在此正数上向零；normalize的下一阶段才用Go half-away-from-zero round。原地址`0xbccc97`变为parsed `0xbccc96`，原文不能覆盖；stack是leaf→caller，不是时间顺序。

| 输入 | unsampled count/ns | normalized rounded count/ns | 未归一化差 count/ns | 归一化差 count/ns |
| --- | --- | --- | --- | --- |
| S1 | 2700 / 608881724 | 771 / 2755 | 1700 / 608878600 | -229 / -369 |
| S2 | 100 / 23992 | 29 / 0 | 100 / 23992 | 29 / 0 |
| S3 | 200 / 179943 | 57 / 1 | 200 / 179943 | 57 / 1 |
| S4 | 100 / 17778444 | 29 / 80 | 100 / 17778444 | 29 / 80 |
| S5 | 100 / 75976 | 29 / 0 | 100 / 75976 | 29 / 0 |
| S6 | 300 / 63568134 | 86 / 288 | 300 / 63568134 | 86 / 288 |
| B1 | 1000 / 3124 | base不normalize | 与S1完整stack匹配 | 在source缩放后减去 |

sourceTotal=`[3500,690508213]`，baseTotal=`[1000,3124]`。两个factor分别`1000/3500`、`3124/690508213`。S2…S6参与sourceTotal，因此参与S1的全局比例，即使它们与S1不是同一stack。缩放后source totals=`[1001,3124]`；signed net=`[1,0]`，count余1来自逐sample rounding。S2/S5虽然ns=0，count=29，不能整条丢弃。

Merge sample身份包含完整映射后的location向量以及labels/NumLabels；本pair maps相同，B1仅与S1匹配。无base标签时合并为6条signed samples；diff_base标签使S1和B1分开，内部保留7条。图上展示六行比较表可用忽略角色标签后的算术projection，但不能说内部7条已经变6条。base缺失S2…S6表示这份输入没有匹配stack，不证明现实中从未执行。

| 设置 | report denominator count/ns | 不能混同的量 |
| --- | --- | --- |
| absolute + base | 2500 / 690505089 | 此pair差值皆正，abs和恰等于net |
| absolute + diff_base | 1000 / 3124 | 标记base子集的abs和 |
| normalized + base | 459 / 738 | 六条完整signed samples逐项abs和 |
| normalized + diff_base | 1000 / 3124 | 标签base子集的abs和 |

normalized S1的算术百分比为count `-229/459` 或 `-229/1000`，ns `-369/738` 或 `-369/3124`。这些是固定设置的算术展示，不是已运行pprof UI。净差`[1,0]`不是百分比分母。

所有7输入都以同一corrected leaf `0xbccc96`开头，图按leaf地址聚合flat后是`[1,0]`，会掩盖S1负值。不能把地址热点值当完整stack差值，更不能把mapping文件名当函数名。

## 最小接受条件

候选冻结后只核本实验责任边界：

1. 完整6+1原行、40个source locations、全部24条原map以及golden/Apache均可回查，数值和位置对上。无虚构采集故事、调用数、精确执行时长或性能改善。
2. 两metric的原生Dataflow都保留7个真实输入；全部6source→sourceTotal、base→baseTotal、两个total→factor，S1及factor→round、round与B1→normalized diff。箭头标为数值依赖，不能暗示runtime调用或测得顺序；若是S1 witness需明确只有一个解释输出，完整六行输出旁表仍在。
3. report分支保留6/7样本及base标签语义；459/738与1000/3124可追到实际abs集合，净差1/0不能作为除法输入。
4. 每个可选择节点/步骤target存在。factor→全部source→S2完整原行/map→明确返回同factor入口的静态链路能在公开HTML解析；不声称Viewer反向选点同步或任意DOM动态返回。
5. 最小有价值测试针对真实误算：trunc与round分开、Go负半值round语义、两metric独立ratio、S2/S5零ns保留、完整sample+label身份、报告abs分母。无需复制全仓套件或冻结自动布局坐标；实际可读性与键盘/指针由root真实Ego核验。

等待implement冻结后再审查候选和最小CLI证据；当前不形成候选ready结论。

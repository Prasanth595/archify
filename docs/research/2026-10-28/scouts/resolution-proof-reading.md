# 版本冲突证明阅读：区间重叠不等于存在可用版本

2026-10-28，只读研究。**最终推荐0项实施。最有区别的机制是 Mixology 官方完整 `test_no_version_that_matches_combined_constraints`，但原生图/Explainer相比普通表格的独立增益不足。** 用户要回答的是“foo/bar 的 shared 范围明明重叠，为什么仍然无解？”新阅读任务是把**声明约束的交集**与**provider 实际提供的离散版本集合**分开，再读官方无解推导。不是新的 dependency importer，也不是修复 Archify 产品缺陷。官方expected首句已经明示缺失区间；将两条约束与两个可用版本并排即可回答。没有证据证明增加Archify图或单独页面更清楚，因此不为已有内容再换fixture。受控foo/bar命名本身不是拒绝原因。

研究使用 research 技能：后台只读代理筛查 Mixology/Elm，作者独立核固定源码、完整fixture和消费者；无浏览器、安装、上游运行、resolver执行、commit或push。只新增本文件。GitHub API/raw 为一手来源。一次匿名 API 限流改用已认证 `gh api`；不把请求失败当内容不存在。未采用历史 memory 结论。

## 范围与去重

本地 Archify checkout `2c83780d646be256d668ae0433f561b13253158f`；先完整读取 [round16-resolution-identity](../../2026-10-25/scouts/round16-resolution-identity.md)，再检索 2026-10-25/26/28 scouts 的 `pubgrub|mixology|resolvelib|solver|unsatisf|derivation|版本冲突`，读取 gallery manifest 全部59项 id/value。重点比对 dependency-map、edge-extras、config-origins、witness-groups，并读取固定 [witness-groups README](https://github.com/tt-a1i/archify/blob/861ec02283bcd32c8315aa7b5f8b5ef9678dda27/experiments/witness-groups/README.md)。不是只检索标题后宣布完全无重叠。

GitHub live 检索 `tt-a1i/archify/issues?state=open&per_page=100` 全部分页，得到 **259个 issue+PR 标题**；按 `resolv|conflict|depend|proof|witness|attribut|logical` 筛选，再读取 #1133、#1135 正文。没有搜全部 closed issue、全部 PR diff 或全部分支，因此下面仅是本次有界范围的重叠判断。

| 已有工作/开放事项 | 已覆盖 | 本候选的差别/边界 |
| --- | --- | --- |
| dependency-map | producer依赖报告的局部图，保留未解析/视图外账目 | 依赖边本身不足以回答交集内为何没有可选版本；此例须显示完整离散目录，不做另一张裸依赖图 |
| edge-extras / round16 | incoming extras/模式改变可见后继，身份与激活上下文分开 | 本例无extras/条件边，不重做求值器；输入是版本目录而非installed inventory |
| config-origins | 声明值、幸存值、错误归属不同 | 无provider合并/字段覆盖；新增的是范围相容与版本可用性两种事实 |
| witness-groups | 一个正结果的多组替代见证，组内共同/组间替代 | 本例是有限目录上的**不存在可行选择**；关键不是多组共同/替代组合，而是同一非空数值区间里没有目录成员 |
| [#1133](https://github.com/tt-a1i/archify/issues/1133), PR [#1142](https://github.com/tt-a1i/archify/pull/1142) | 通用claim→evidence attribution | 本内容使用已有来源引用，不扩schema或自动宣称proof checker；如该PR后续交付可复用但不是前置 |
| [#1135](https://github.com/tt-a1i/archify/issues/1135), PR [#1144](https://github.com/tt-a1i/archify/pull/1144) | Explainer draft dependency-aware preview | 与包版本依赖语义不同；不需要watcher |
| [#312](https://github.com/tt-a1i/archify/issues/312) | Workflow逻辑操作符 | 不借此引入AND/OR schema；只用现有表格/代码/固定文字 |

## 广筛：六个source-owned项目，不按stars设门槛

SHA 为调查时 GitHub 默认分支 latest commit；源码链接固定 SHA。完整证据链只深入 A/B 两条，其他仅筛查，不假装完成上游复现。

| 来源与固定revision | 本次实际读取/筛选 | 处理 |
| --- | --- | --- |
| [sdispater/mixology](https://github.com/sdispater/mixology/tree/067c5aef14d7caeb733adff2b34e9489797f5113) `067c5aef14d7caeb733adff2b34e9489797f5113` | `tests/test_unsolvable.py`, test source/helpers, solver/failure, MIT全文 | 深读A，小型独立库；目录空洞语义不同，但普通表格已足够，最终不推荐启动。live API archived=false；最后commit为2019，避免把它包装成当前Poetry实现 |
| [pubgrub-rs/pubgrub](https://github.com/pubgrub-rs/pubgrub/tree/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796) `2b32d6a1b0b7b6021d2658a274d6fb7b613c5796` | 完整branching example、report.rs、tests/examples.rs、README、MPL-2.0全文 | 深读B；proof树机制清楚，但单独新开branching页收益较弱 |
| [sarugaku/resolvelib](https://github.com/sarugaku/resolvelib/tree/a0cb7c50b78028f840b238d8e1c391e0546f2325) `a0cb7c50b78028f840b238d8e1c391e0546f2325` | README、`examples/visualization/reporter.py`；Python conflict-with-dependency case及CocoaPods three_way_conflict case/index | 已有Graphviz演化报告，包含backtrack/active requirement bookkeeping；case里的 `six<1.12` / virtualenv 16.7.9 是自然命名输入，但本轮未读完整PyPI index/consumer，不作为完整候选。避免把静态最终解当搜索轨迹 |
| [astral-sh/uv](https://github.com/astral-sh/uv/tree/e4c55567ada966de4911513b5c526070e6cddd3f) `e4c55567ada966de4911513b5c526070e6cddd3f` | 完整 [`test/scenarios/fork/conflict-in-fork.toml`](https://github.com/astral-sh/uv/blob/e4c55567ada966de4911513b5c526070e6cddd3f/test/scenarios/fork/conflict-in-fork.toml) | 528B完整受控case，os1/os2分叉后b/c要求d==1/2；新维度是universal fork作用域，但与条件上下文已有研究靠近，且大系统解释维护更高，不深挖 |
| [dart-lang/pub](https://github.com/dart-lang/pub/tree/1df594373b77e68ca4edee7211ef2105ae6908c4) `1df594373b77e68ca4edee7211ef2105ae6908c4` | `lib/src/solver/failure.dart`，proof线号/重用与合并机制 | 是Rust/Python例子的算法来源，作为原理旁证；不拿历史文档输出冒充本轮Rust输出 |
| [elm/compiler](https://github.com/elm/compiler/tree/1c278bf5ecf4136f122ce1cba436783c7f561dac) `1c278bf5ecf4136f122ce1cba436783c7f561dac` | [`builder/src/Deps/Solver.hs`](https://github.com/elm/compiler/blob/1c278bf5ecf4136f122ce1cba436783c7f561dac/builder/src/Deps/Solver.hs#L79-L105) Result和冲突backtrack | `NoSolution`不携带推导证据，未找到适合这次proof阅读的完整紧凑官方输出，停在筛查；不宣称整个Elm生态没有解释工具 |

## A. 最接近候选、最终不启动：数学交集非空，但目录交集为空

固定 [official fixture L19–34](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/tests/test_unsolvable.py#L19-L34) 是上游作者的受控测试，不是生产依赖快照。下面保留**完整函数**，而非从庞大项目里挑两条边。对应完整源文件及许可账目见后表。

```python
def test_no_version_that_matches_combined_constraints(source):
    source.root_dep("foo", "1.0.0")
    source.root_dep("bar", "1.0.0")

    source.add("foo", "1.0.0", deps={"shared": ">=2.0.0 <3.0.0"})
    source.add("bar", "1.0.0", deps={"shared": ">=2.9.0 <4.0.0"})
    source.add("shared", "2.5.0")
    source.add("shared", "3.5.0")

    error = """\
Because foo (1.0.0) depends on shared (>=2.0.0 <3.0.0)
 and no versions of shared match >=2.9.0,<3.0.0, foo (1.0.0) requires shared (>=2.0.0,<2.9.0).
And because bar (1.0.0) depends on shared (>=2.9.0 <4.0.0), bar (1.0.0) is incompatible with foo (1.0.0).
So, because root depends on both foo (1.0.0) and bar (1.0.0), version solving failed."""

    check_solver_result(source, error=error)
```

全输入范围：两个root要求，foo/bar各一个版本、shared两个版本；shared两次add省略deps，test provider默认空字典，故其依赖完整为空。不是“只提供两个共享版本的示意截取”。[tests/conftest.py](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/tests/conftest.py) 为每个fixture返回新 `PackageSource()`；[tests/package_source.py](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/tests/package_source.py#L28-L83) 初始化空目录、root版本0.0.0，add记录完整目录，`_versions_for`只枚举该目录并倒序，不访问外部registry。`semver`负责约束解析；本报告没有执行它。

官方文本中的第一句不是说foo源声明变成了 `<2.9`，而是把“交叠区没有可用版本”作为额外前提，推导当前目录内foo可用版本的等价限制。内容页必须将**原声明**与**在此目录得出的推论**分开；不能反向改写METADATA或说上游约束文字错误。

可直接复核的候选表（作者按固定输入的数值比较；不是resolver运行记录）：

| provider内shared版本 | 满足foo `[2.0,3.0)` | 满足bar `[2.9,4.0)` | 同时满足 |
| --- | --- | --- | --- |
| 2.5.0 | 是 | 否 | 否 |
| 3.5.0 | 否 | 是 | 否 |

两范围在数值域的交集 `[2.9.0,3.0.0)` 非空；该provider目录与交集的交集为空。不能补一个未发布2.9.0当第三个候选，也不能把缺版本等同网络故障、yanked、Python版本不兼容或版本尚未发行。结论只对这一固定目录成立。

消费者闭环：[helpers.py L6–18](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/tests/helpers.py#L6-L18) 创建 `VersionSolver(source)`、调用solve、捕获 `SolverFailure`，逐字断言str(e)==error。它不是本轮实跑receipt；还须注意helper若solve未抛错且返回空非root集合，末尾的 `result == packages`（result默认None）也会失败，不能把expected当无验证的注释。

机制闭环：[version_solver.py L271–318](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/mixology/version_solver.py#L271-L318) 合并当前不相容与赋值原因，保留 `ConflictCause` 双亲，最终抛SolverFailure；[failure.py L9–28](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/mixology/failure.py#L9-L28) 用writer呈现，随后按因果双亲/已复用行号折叠文字。因此图上依赖关系和证明关系是不同种边；候选只用原生Architecture承载声明，如果没有必要就不画proof树，避免混成运行顺序。

### 普通基线已足够，拒绝增加内容页

读者具体任务是“两个范围有没有交集，交集里有没有provider成员，失败是范围互斥还是目录缺项”。官方完整expected第一句已经直接回答缺项；普通基线只需保留两条约束、两个可用版本列表和上面两行表，无需读者追踪图路径。

曾考虑一个既有Explainer内容页：结论“相容的范围仍可能没有可用版本”→上面两行候选表→完整原始声明及官方expected→来源/范围说明。可有一张4package原生图帮助找foo/bar/shared，但它不是核心价值；若图比表更费读，删图。不得新增版本parser、网络registry查询、solver、输入交互计算、schema或CLI命令。即便只维护固定7个小原件、一个目录表和源码引用，也新增独立页面与审计成本。固定版本身份回链可以帮助核查，但这是已交付来源引用能力，不是此实验的新操作。因此本轮拒绝实施。

未来重开条件不是“再画漂亮一点”，而是出现完整、较长、多个阶段的真实官方错误报告：读者需从某条推导返回精确原始约束和当时目录，且普通约束表/版本列表确实丢失其阶段与身份。再用同一报告对照验证。阅读对照可问三个能判对错的问题：两范围有没有交集？交集内有几个provider版本？为什么“把foo改成bar范围”不是上游要求的唯一修复？对照官方完整expected与Explainer，保留回答及定位差异；未测前不声称效率提高。任何后续页面都不能推荐未经实际求解的版本升级/降级方案。若最终仅复制expected并画依赖边，没有清楚地区分约束交集/目录成员，就取消实施；那会退化为dependency-map换fixture。

## B. Rust branching proof：机制真实，单独不推荐

完整 [branching_error_reporting.rs](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/examples/branching_error_reporting.rs) 有九条完整version记录：

| package version | 全部依赖 |
| --- | --- |
| root 1.0.0 | foo `[1,2)` |
| foo 1.0.0 | a `[1,2)`；b `[1,2)` |
| foo 1.1.0 | x `[1,2)`；y `[1,2)` |
| a 1.0.0 | b `[2,3)` |
| b 1.0.0 | 无 |
| b 2.0.0 | 无 |
| x 1.0.0 | y `[2,3)` |
| y 1.0.0 | 无 |
| y 2.0.0 | 无 |

表中整数端点是对应原件的三段SemVer简写，非上游整数版本。root固定1.0.0；目录除表内版本外无其他记录。foo1.0的a/b冲突只否定1.0分支；foo1.1的x/y冲突只否定1.1分支；结合完整foo目录才可说无解。两个冲突不是两个运行时故障，也不是“任选一个原因都能否定全部foo”。输入是官方OfflineDependencyProvider受控例，不是生产包集。

[`src/report.rs L29–65`](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/src/report.rs#L29-L65) 把 `External` 与双亲 `Derived` 分开；External含NotRoot、NoVersions、FromDependencyOf和Custom；Derived的shared_id允许同推论只解释一次再回引。这比裸依赖图更接近可检查的证明材料。边不能统一称package depends-on。

尤其 [`collapse_no_versions` L94–102](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/src/report.rs#L94-L102) 明示仅当provider不是缺全目录的某种offline模式时才适合折叠“无版本”前提。例子实际调用该方法，再用DefaultStringReporter打印并exit1。本轮不运行，也没有该例本次stdout；不能把Dart历史文档字符串当其精确输出。`tests/examples.rs`另有no-version-hole报告的逐字断言，但不冒充branching例的golden。

**不再推荐第二页**：它的主要阅读增量是“若干替代分支各自排除、合并覆盖”，与witness-groups已教的组合保留有结构上的接近；纯proof树很容易变成AND/OR分组换名。真正不同的是版本目录的封闭性，A已经用更小表格直接解释。今后若有真实长错误报告的共享推论回引难题，再以完整DerivationTree及官方report双输入重开；不先造通用proof viewer。

## 完整原件字节账目与许可

均为固定raw URL下载的完整文件，SHA256对原字节计算；本文只内嵌A的完整测试函数并保留MIT许可。未下载仓库、依赖或二进制。B不内嵌MPL源码，完整原件/许可链接可复查；语义表为本文原创转述。

Mixology统一revision `067c5aef14d7caeb733adff2b34e9489797f5113`，文件前缀 [固定source root](https://github.com/sdispater/mixology/tree/067c5aef14d7caeb733adff2b34e9489797f5113)：

| path | bytes | SHA256 |
| --- | ---: | --- |
| tests/test_unsolvable.py | 2798 | `fd5497d40af9d645d60dbe157b4a7645bc3fcc77a6eb83310eb19ea1dc2f9508` |
| tests/conftest.py | 118 | `fad98850c61fc4f8a18b6a026f70dabd8133dcf93a6c44be3d6a1dbec325419b` |
| tests/package_source.py | 3303 | `ca6fc2cb5952fc100059ca63011ab22cc1d64b00853fee539b9cd2aa3d742b76` |
| tests/helpers.py | 790 | `01f8c7fb17240f1fffd6f9dd985cffe35089c93c4d21b21ad937ecc53ab93f75` |
| mixology/version_solver.py | 15839 | `af1a8dc112826ce852877bd866e49a442ad80bdb3c41a786f665a9076eb66de2` |
| mixology/failure.py | 9877 | `4b3e991812432128e548307cc333d7d52ccdd029f0423fb044aa535608ce19e7` |
| LICENSE | 1062 | `f2f9b460ba719da6626add264d3782f275a4ff7aab677beda08b330911e23adb` |

Pubgrub统一revision `2b32d6a1b0b7b6021d2658a274d6fb7b613c5796`，文件前缀 [固定source root](https://github.com/pubgrub-rs/pubgrub/tree/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796)：

| path | bytes | SHA256 |
| --- | ---: | --- |
| examples/branching_error_reporting.rs | 2373 | `14029bf5d40e237fdbb1b4a630bbc97ca70b07d9e43a02ec44ee17e3f9608b43` |
| src/report.rs | 25047 | `a5a7f6f57791468aa09710736c531e23882fbd71fae289ae79ffd5e567641cc1` |
| tests/examples.rs | 9352 | `e01a286a207ad2f3b663db9281f5302ccd576b40857ba054541037ddcb2a47f0` |
| LICENSE (MPL-2.0) | 16725 | `1f256ecad192880510e84ad60474eab7589218784b9a50bc7ceee34c2b91f1d5` |

其他筛查原件仅记录一个完整uv文件：`test/scenarios/fork/conflict-in-fork.toml` 528B / `b4a43bb1998ece728fe76d134f1ec1a6fca6fb341e334ed248a1eb353ed63c66`；未纳入实施内容，无复制其源码。witness-groups README原件6700B / `86ceb14f9e466574e66bbb1a049c3f4feb57a530b918dbf826941e923664a7c4`，与manifest账目相符。

### 内嵌Mixology测试的MIT通知（完整）

以下原文来自 [固定LICENSE](https://github.com/sdispater/mixology/blob/067c5aef14d7caeb733adff2b34e9489797f5113/LICENSE)，适用于上面复制的上游测试内容；原创研究文字不冒充上游说明。

```text
Copyright (c) 2018 Sébastien Eustace

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```

研究只核文本、原件摘要和既有范围，不跑renderer/full suite。最终为0项推荐，root可据新任务独立重开；新fixture/内容来源不等于上游算法本轮通过、Archify正式接受或已发布。

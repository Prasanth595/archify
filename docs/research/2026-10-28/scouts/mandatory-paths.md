# Mandatory paths：两端点之间哪些点真正必经

日期：2026-10-28。**推荐 1 个隔离实验：完整有向图 + 两个端点 → 必经内部点及可避开其他点的路径 → 普通原生 Explainer。** 只验证内容答案，不新增 Viewer 控件、共享选择状态或路径枚举功能。本轮只研究和写此报告；没有产品实现、安装、执行上游代码、提交、推送或外发。

## 问题与现有覆盖

给定可达的 `s,t`，内部节点 `v` 是否出现在**每条有向 s→t 路径**上？这等价于 `v` 支配以 `s` 为根的 `t`；可用独立 oracle 检查：在原图临时忽略 `v` 后，`s` 还能否到 `t`。这是相对端点的拓扑问题，不是无向割点，也不能推导运行系统单点故障。若 `t` 不可达，输出“没有 s→t 路径”，不利用空集上的全称命题把所有点称为必经。端点单独列出；实际实验要求 `s,t` 不同，`s=t` 明确返回 query error。数学上的零长路径约定不作为 CLI 输出，也不据此回答闭环。

已读当前 [54 卡 manifest](../../2026-10-25/gallery/manifest.json) 每项标题/价值与 [graph-answers](graph-answers.md)。直接排重：Route alternative 只切换一条等跳数路径；Shared reach 是两个起点的可达集合交集；Retained size 是 Twiggy 对其 WASM 引用图的支配/保留体积解释。这里查询的是用户明确选定的 `s,t`，不计算 retained size、不重做关系查找。旧报告“必须先有真实用户失败”的门槛已由本轮授权替代：完整公开 fixture 与明确标记构造图足够启动探索，真实收益仍未测量。

Archify 基线按协调者实时核对的 `dev=6ca6a5c84439b57ea22e0630fe306e1d91587a6e`；Shared reach 已有 `b160b948541f541394457fec3005e2d10b281dea`。本轮不更改 #1139 尚未确定的方向语义，不引入 both/none，只接受现成的显式 `from→to` 边。 协调者的 authenticated 有界 GitHub 搜索记录位于 [mandatory-path-search.json](../mandatory-path-search.json)：dominator、`"mandatory path"`、articulation 各0条；`"all paths"` 102条噪声只取前30条。这只是搜索线索，不能证明全部历史不存在重叠；初次 malformed 查询没有计入 absence。

## 六个来源：一个实际分析工具，五个算法/接口对照

优先使用本轮新来源；没有 stars 门槛。以下 SHA 已通过只读 Git/GitHub 获取并固定；许可文件均读取**完整正文**，不是只看 SPDX/API。没有复制实现。NetworkX/petgraph 的固定版本由 background research agent 逐文件读取，其余本 agent 读取。

| 来源 / 固定 SHA | 一手证据与能借的东西 | 取舍 |
| --- | --- | --- |
| [Slither](https://github.com/crytic/slither/tree/10cfd5ad507b8ec45e4298f25cc48d45c2078960) `10cfd5ad507b8ec45e4298f25cc48d45c2078960` | Solidity CFG→dominators→SSA；另有真正的 dominator DOT printer，见下面完整调用链 | 实际分析工具的阅读出口；只借“把分析结果独立导出”，不引入 Solidity/SSA 分析栈 |
| [NetworkX 3.4.2](https://github.com/networkx/networkx/tree/2acf1590f82757c01a57b81b8c5dfb79e60aa416) `2acf1590f82757c01a57b81b8c5dfb79e60aa416` | [immediate_dominators](https://github.com/networkx/networkx/blob/2acf1590f82757c01a57b81b8c5dfb79e60aa416/networkx/algorithms/dominance.py#L57-L84)：reachable-only idom map，本版本含 `s:s` | 小而清楚的参照，不增加 Python 依赖 |
| [petgraph 0.6.5](https://github.com/petgraph/petgraph/tree/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c) `c32a86b1b8c5c198079efc9149ea2fcf956b8f6c` | [simple_fast / dominators(t)](https://github.com/petgraph/petgraph/blob/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c/src/algo/dominators.rs#L40-L115)：直接提供 t→root 的完整链；unreachable 为 None | 返回契约最清楚；仍不需要引入 Rust |
| [rustworkx](https://github.com/Qiskit/rustworkx/tree/6565c2d1d6573198f067a6a015d1c097011e13bf) `6565c2d1d6573198f067a6a015d1c097011e13bf` | [Python wrapper](https://github.com/Qiskit/rustworkx/blob/6565c2d1d6573198f067a6a015d1c097011e13bf/src/dominance.rs#L39-L61) 调 petgraph，补上 root:self；[tests](https://github.com/Qiskit/rustworkx/blob/6565c2d1d6573198f067a6a015d1c097011e13bf/tests/digraph/test_dominance.py#L127-L150) 有完整图和逆向 expected | 好的跨语言契约证据，但和 petgraph 不是独立算法 oracle |
| [dominators](https://github.com/julianjensen/dominators/tree/5b131e04f21eef699b3757b5e01e183d2ee3398e) `5b131e04f21eef699b3757b5e01e183d2ee3398e` | [fast-iterative](https://github.com/julianjensen/dominators/blob/5b131e04f21eef699b3757b5e01e183d2ee3398e/src/fast-iterative.js#L24-L104)→[make_dom / walkUp](https://github.com/julianjensen/dominators/blob/5b131e04f21eef699b3757b5e01e183d2ee3398e/src/dom-tree.js#L96-L127)→[dominators](https://github.com/julianjensen/dominators/blob/5b131e04f21eef699b3757b5e01e183d2ee3398e/src/dom-tree.js#L338-L359) | 不直接采用：`while(index)` 静态上会在 index=0 停止，端点完整链契约有风险；未执行上游，不称实测缺陷。文件亦声明参考 WebKit，根许可不能替代全部来源审计 |
| [igraph](https://github.com/igraph/igraph/tree/6eb4f37a1f525a06b07916470d754626ad7dbcfb) `6eb4f37a1f525a06b07916470d754626ad7dbcfb` | [官方文档](https://r.igraph.org/reference/dominator_tree.html) 明确 dom/tree/leftout；[完整 C fixture](https://github.com/igraph/igraph/blob/6eb4f37a1f525a06b07916470d754626ad7dbcfb/tests/unit/igraph_dominator_tree.c#L22-L131) 包含环和不可达分量 | 只作输出完整性对照；未追到当前算法实现文件，不能宣称读透实现 |

许可正文核对：Slither [LICENSE](https://github.com/crytic/slither/blob/10cfd5ad507b8ec45e4298f25cc48d45c2078960/LICENSE) 是 AGPLv3 全文（34523B，SHA256 `0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0`）；NetworkX [LICENSE.txt](https://github.com/networkx/networkx/blob/2acf1590f82757c01a57b81b8c5dfb79e60aa416/LICENSE.txt) 37行 BSD-3-Clause；petgraph [MIT](https://github.com/petgraph/petgraph/blob/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c/LICENSE-MIT) 25行和 [Apache](https://github.com/petgraph/petgraph/blob/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c/LICENSE-APACHE) 201行，Cargo 声明 `MIT OR Apache-2.0`；rustworkx [LICENSE](https://github.com/Qiskit/rustworkx/blob/6565c2d1d6573198f067a6a015d1c097011e13bf/LICENSE) Apache-2.0 正文（10143B）；dominators [LICENSE](https://github.com/julianjensen/dominators/blob/5b131e04f21eef699b3757b5e01e183d2ee3398e/LICENSE) MIT（1128B）；igraph [COPYING](https://github.com/igraph/igraph/blob/6eb4f37a1f525a06b07916470d754626ad7dbcfb/COPYING) GPLv2 正文（18006B），单元测试头允许 v2 或后续版本。这里仅记录实际文件，不把它升级成引入代码的许可结论。

## 两条真实 producer→consumer 链

**Slither 的分析与独立出口。** [FunctionContract.generate_slithir_ssa](https://github.com/crytic/slither/blob/10cfd5ad507b8ec45e4298f25cc48d45c2078960/slither/core/declarations/function_contract.py#L126-L139) 先对 `self.nodes` 调 `compute_dominators`、`compute_dominance_frontier`，再转换 SSA。计算者 [utils.py:9–85](https://github.com/crytic/slither/blob/10cfd5ad507b8ec45e4298f25cc48d45c2078960/slither/core/dominators/utils.py#L9-L85) 交集可达 predecessor 的集合，迭代稳定后设置 immediate_dominator；[ssa.py:559–571](https://github.com/crytic/slither/blob/10cfd5ad507b8ec45e4298f25cc48d45c2078960/slither/slithir/utils/ssa.py#L559-L571) 实际消费 dominance_frontier 和 dominator_successors 传播 phi origin。另一阅读出口 [Dominator printer:20–34](https://github.com/crytic/slither/blob/10cfd5ad507b8ec45e4298f25cc48d45c2078960/slither/printers/functions/dominator.py#L20-L34) 对每个 function/modifier 调 [dominator_tree_to_dot](https://github.com/crytic/slither/blob/10cfd5ad507b8ec45e4298f25cc48d45c2078960/slither/core/declarations/function.py#L1403-L1424)，逐原节点写标签/ID，把 idom→node 写成 DOT。这里的树边是派生分析关系，不能画成原 CFG 边；这正支持 Archify 以独立解释结果为出口的方案。

**petgraph→rustworkx 的跨语言消费者。** [DfsPostOrder](https://github.com/petgraph/petgraph/blob/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c/src/visit/traversal.rs#L198-L219) 产生 reachable postorder；[simple_fast_post_order](https://github.com/petgraph/petgraph/blob/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c/src/algo/dominators.rs#L277-L300) 只建立可达 predecessor；[simple_fast](https://github.com/petgraph/petgraph/blob/c32a86b1b8c5c198079efc9149ea2fcf956b8f6c/src/algo/dominators.rs#L161-L239) 迭代 idom 链交点。rustworkx [wrapper](https://github.com/Qiskit/rustworkx/blob/6565c2d1d6573198f067a6a015d1c097011e13bf/src/dominance.rs#L39-L61) 消费该结果，对所有原 node index 调 immediate_dominator，过滤 unreachable 并补 `root:root`；[官方测试](https://github.com/Qiskit/rustworkx/blob/6565c2d1d6573198f067a6a015d1c097011e13bf/tests/digraph/test_dominance.py#L127-L150) 构造图→调用 Python API→核固定字典。两项目版本并未证明相互锁定到这里两个 SHA；这里只分别固定所读实现与实际调用契约，不声称二者是一套已运行 binary。

## 完整 fixture 与实际原创 oracle

本轮执行的是内存中的原创 Python BFS 逐点忽略和小图完整简单路径枚举；没有运行以上项目。枚举只用于这几个很小的 oracle，不推荐产品做通用枚举。

**官方公开 fixture**（rustworkx 测试完整 8N/9E，源自 Boost 示例）：

```json
{"nodes":[0,1,2,3,4,5,6,7],"edges":[[0,1],[1,2],[1,3],[2,7],[3,4],[4,5],[4,6],[5,7],[6,4]],"s":0,"t":7}
```

实际原创 oracle 找到两条简单路径 `[0,1,2,7]`、`[0,1,3,4,5,7]`；内部必经仅 `[1]`。官方 expected idom 的 `7:1,1:0,0:0` 与此一致。环中 `6` 可从0到达、也能最终到7，却不在任何简单0→7路径上，因为必须重复4。

**完整原生 authored fixture**：[production-deployment.architecture.json](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/examples/production-deployment.architecture.json)，原始文件 SHA256 为 `610a5614667e8f108bdcf1769c9d7af5c3ce0fb62be3ea50550b10eb752e4bda`；12个节点和12条关系全部保留；不是运行部署证据。完整拓扑为：

```json
{"nodes":["clients","edge","gateway","api_a","api_b","redis","postgres","events","worker","replica","audit","observability"],"edges":[["clients","edge"],["edge","gateway"],["gateway","api_a"],["gateway","api_b"],["api_a","redis"],["api_b","postgres"],["api_a","events"],["api_b","events"],["events","worker"],["postgres","replica"],["worker","audit"],["worker","observability"]],"s":"clients","t":"audit"}
```

实际原创 oracle 的内部必经集合是 `edge,gateway,events,worker`。完整简单路线恰有两条：

- `clients→edge→gateway→api_a→events→worker→audit`。
- `clients→edge→gateway→api_b→events→worker→audit`。

忽略 api_a 后仍有第二条；忽略 api_b 后仍有第一条。忽略四个必经内部点中的任意一个都不可达。redis/postgres/replica/observability 的回答只是“非必经”；不能暗示它们位于另一条到 audit 的路径。原连接数组下标作为不变边 key，A路线 `[0,1,2,6,8,10]`、B路线 `[0,1,3,7,8,10]`，不新造拓扑身份。

必须保留的反例：

| 完整图 / 查询 | 正确结果；否证什么 |
| --- | --- |
| N=`s,a,b,t,q`；E=`s→a,a→t,s→b,b→t,q→a`；s→t | 无内部必经点；无向 a 是隔开 q 的割点，却不支配 t |
| N=`s,a,x,t`；E=`s→a,a→x,x→a,a→t,s→t`；s→t | 无内部必经点；x 属于 reach(s)∩canReach(t)，但只在有重复点的 walk 中，不能称“某条简单路径上的点” |
| N=`s,a,b,t`；E=`s→a,a→t,s→b,b→a`；s→t | a 必经；只考察最短路径的替代数不能证明所有有向路径 |
| N=`s,t`；E=空；s→t | unreachable，不输出 mandatory=[] 伪装成“存在路线但没有内部必经” |
| N=`s`；E=`s→s`；s→s | 实际 CLI 返回 query error，要求两端点不同；不把零长路径或空集合称为闭环 |

平行边只改变关系身份，不改变节点必经判定；绕行见证仍必须保留具体边 key。图中明确的箭头方向是全部依据，不按 HTTP、publish 等标签推断额外可达边。

## 一个可实施实验与接受/停止条件

实验输入是完整 schema-v1 Architecture JSON 加显式且不同的 s/t；一次离线命令写出分析 receipt，再由已有原生 Explainer 机制展示原图与文字结果。保留完整原图的节点/边/标签/几何；旁列“端点”“必经内部点”“非必经点”，对非必经点最多附一条避开它的精确路径。没有路径则单独呈现状态。不要把 idom tree 的派生边冒充原图边，也不要为了显示答案删掉 Redis 等不经过终点的支路。

小规模首版可原创实现逐点忽略+BFS，成本 `O(V(V+E))`，无需依赖、复杂 dominator engine 或新共享 Viewer 状态；图规模上限先由固定输入实测决定，本轮没有性能数据。不要求一般简单路径成员分类，不枚举所有路线，不计算所有割点或故障风险。若后续已证实大图性能不够，再考虑 idom 算法；当前证据不支持先做框架。

接受 oracle：完整12N/12E账目无删改；精确返回四个必经内部点；api_a/api_b 各有对方的绕行见证和原边 key；公开8N/9E图返回内部 `[1]`；上述不可达、循环、无向割点反例全部区分，`s=t` 返回明确 query error；Explainer 显示可核对，不把这些分析称运行依赖或可靠性保证。停止/否证：只能换颜色但仍需手工推断、输出依赖“所有简单路径”的未证明分类、需要共享 Viewer 选择协议才能成立、或相对一页文字清单没有改善结果可核对性，则不进入产品实现。

这是一项有 oracle 的探索建议，尚无用户耗时/错误率改善测量。没有把完整 fixture 的成功分析当作产品接纳、上游代码执行或真实故障结论。

# SQL 列血缘阅读：保留原生视图，暂不立项

2026-10-27，只读研究。结论 **defer**：SQLGlot 已提供表达式、可悬停的查询上下文和来源分支；“值来源与筛选影响分开”已在前一轮提出。尚无真实读者误解、完整原生图对照或独立收益，不能据此增加解析器、schema 合同或 Viewer。可把下面的合成题留作未来比较的候选，只有完整原生视图确实不能回答而现有 Archify 内容能可靠回答时才值得继续。没有运行、安装上游代码、SQL、数据库或浏览器；上游测试是源码断言，不是本轮通过结果。

## 基线与实际语义

SQLGlot [固定 main `feb0e08aba28a29590596bb3f5761fbaeb0e98b9`](https://github.com/tobymao/sqlglot/tree/feb0e08aba28a29590596bb3f5761fbaeb0e98b9)，[MIT 许可证](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/LICENSE)，版权 Toby Mao。`lineage(column, sql, schema, sources, dialect)` 先限定/整理 SQL，追选中表达式的列；[实现](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/sqlglot/lineage.py#L83-L180)不证明查询执行、实际数据或完整 schema。

公平基线是完整 [Node.to_html 和 GraphHTML](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/sqlglot/lineage.py#L47-L78)：每个节点展示表达式，悬停 title 包含重新序列化的 source SQL 并加粗表达式；层级图的箭头从目标向来源，默认禁拖节点、禁选择、无物理模拟。默认 HTML 使用远程 vis 资源。它不是简单的表名打印；WHERE 可能已在 source tooltip 中出现，只是源码的列遍历以选中表达式为中心，不能把图中缺少单独 WHERE 边断言为完整上下文缺失。SQL 重写结果不是原始字节或文件位置。工具 HTML 测试只断言 HTML 长度和 edge 字段，不是可读性验收。

[同一上游测试](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/tests/test_lineage.py#L268-L282)给 `SELECT ax AS x FROM a UNION SELECT bx FROM b UNION SELECT cx FROM c` 和 schema，断言 x 有三个 downstream；实现按输出位置递归 set-operation 分支，不能把不同分支理解为每行同时使用三列。[多次引用 UNION CTE 的测试](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/tests/test_lineage.py#L484-L523)检查无自环，不证明所有别名遮蔽都正确。[带 schema 的星号测试](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/tests/test_lineage.py#L128-L147)展示展开；[未展开星号测试](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/tests/test_lineage.py#L149-L191)保留来源节点而不是枚举每列。[UNPIVOT 测试](https://github.com/tobymao/sqlglot/blob/feb0e08aba28a29590596bb3f5761fbaeb0e98b9/tests/test_lineage.py#L853-L861)明确缺 schema 时位置重命名不可知。缺 schema 不等于零依赖；叶节点有时使用 Placeholder，但单一来源也有推定分支，不能把所有叶都称为已验证物理列。

## 最小候选与未验证边界

原创合成 SQL，供将来的固定输入对照；不是上游测试或本轮执行结果：

```sql
WITH s AS (
  SELECT amount * rate AS value, active FROM orders
  UNION ALL
  SELECT amount AS value, active FROM refunds
)
SELECT value AS amount FROM s WHERE active = TRUE;
```

已声明的阅读预期：`orders.amount` 和 `orders.rate` 参与第一分支 value 表达式，`refunds.amount` 是第二分支的 value；`active` 条件影响哪些行被保留，不能当作直接数值输入。最终输出别名 `amount` 与底层 `amount` 同名但跨 scope；不能把名字相同视为同一列。UNION ALL 保留各分支产生的行，不能把两支作为同一行共同输入；没有数据不能推断输出行数、值、执行路径或因果。要实际比较，需提供确定 dialect 和两表完整 schema，并分别记录 SQLGlot 整个 native HTML、hover 内容、错误及 Archify 页面；本题的具体 graph 和 SQLGlot 对遮蔽的结果目前未知，不承诺 parser 会输出上述全部角色。

星号扩展另用现有上游 fixture 做成对照，保持 SQL、dialect、目标列不变，仅改变 schema；保留不展开/缺信息/报错，不把任一缺失显示为“没有来源”。测试者应回答：第一分支的计算输入是什么？过滤作用是什么？同名输出与底层列是否同一身份？哪些分支可能产生输出？有无 schema 时哪些事实尚不确定？原生图与 tooltip、原始 SQL 一起能答对同样问题，或者 Archify 页面需要人工猜未知内容，均是**否决继续**的结果。结果若仅能在构造例成立，也不能外推到人类效率或自然任务。

## 排重与成本

[2026-10-26 审计](../audit/prior-experiments-20261027.json)固定历史 hub `60342aa9e40618aeb7c33bdb8d65889fea3a588e`：DBML ERD 关注结构/键，不证明查询血缘；plan-row-counts 是计划算子计数而非列来源；static-uses 是局部静态代码使用关系；segment-origins 是 source-map 选择策略，不是 SQL scope。历史 [lineage-evidence](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/lineage-evidence-smalltools.md) 已引用 SQLGlot 原生 HTML、直接/间接、未知来源和同一示意题；[round23](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round23-lineage-reading.md)进一步明确 LineageX 重复且区分 tuple 见证。此报告补上完整 native 视图和分支、scope、schema 对照要求，不是新的独立产品机会。

本轮 GitHub CLI 搜索 open issues/PR 的标题和正文中 `sql|lineage|data.flow`，返回 issue #917、#790、#452、#344、#251 和 PR #208，未发现标题指向相同 SQL 列血缘；全文可能有宽泛匹配，搜索不覆盖评论、关闭议题或所有同义词。未声称项目已批准方向。若未来有真实任务，再以受限内容页和已明确的事实表验证；SQL dialect、目录状态、scope、星号及部分错误的长期维护成本使通用转换器缺乏当前价值。未改产品、依赖、历史 hub，也未提交或推送。

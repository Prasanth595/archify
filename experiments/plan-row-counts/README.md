# Plan row counts：每次3行，累计约1056次输出

这是手工编写的固定原生Tree＋Explainer，解释 PEV2 已提交样例中同一 Index Scan 的 `Plan Rows=3`、`Actual Rows=3`、`Actual Loops=352`。**3 × 352 ≈ 1056次累计行输出**，不能拿累计值与每次估计比较，称它出现352倍估计偏差；也不表示1056条唯一记录。

![实际解释页](screenshots/explainer.png)

![实际原生计划片段](screenshots/plan-row-counts.png)

协调 Codex agent 实际打开两份 HTML 截图并逐图查看，绑定见 [capture.json](screenshots/capture.json)。这不代表人类验收、诊断效率或用户性能收益。两个产物共用同一份 [Tree JSON](plan-row-counts.tree.json)，Explainer 直接引用该文件，没有第二套shorthand模型。

## 固定来源与字节身份

来源 [dalibo/pev2 @ e41d4e8b3006c479f9364d68a5d538d81cb7d110](https://github.com/dalibo/pev2/tree/e41d4e8b3006c479f9364d68a5d538d81cb7d110)，本实验保留完整原始 [samples.ts](upstream/samples.ts) 和 [LICENSE](upstream/LICENSE)。采用上游 PostgreSQL license，原版权 `Copyright (c) 2019, Dalibo`，不将上游样例冒称本实验原创。

- 完整原 `samples.ts`：339763 bytes，SHA256 `04d0fb91aa351457fcd7a4fe71bdfe325668803cdc45338d094d68e35a24e2c2`。
- 完整抽取 [plan_many_ctes.json](upstream/plan_many_ctes.json)：67418 bytes，SHA256 `a1c79b5782086474c73bd5ad2f7dd3265d73663f9030f5769638a4c2633cf6b4`。
- 来源链接、原文件与许可hash、抽取字节区间/行区间见 [upstream/manifest.json](upstream/manifest.json)。原TS文件和抽取文件均保留字节，不加末尾换行或重排JSON。
- 抽取仅取唯一 `const plan_many_ctes =` 声明后两反引号之间的原UTF-8字节。已核该body没有反斜杠或TypeScript插值，且能直接作为JSON解析；没有eval、执行TS或SQL。

这是 **upstream committed sample**，不是本次上游运行、生产实测或手写synthetic。数据库版本、采集时间、SQL、参数、原数据内容及ANALYZE/TIMING配置未核实，均写未知；存在于同一源文件的其它常量也不自动绑定为本样例SQL。

## 所选范围与字段规则

只画一个 Nested Loop 和它的两个直接输入：Outer Hash Join 与 Inner Index Scan。视图外祖先、输入内部子树及其余计划未展示；不称不存在或已处理。Tree父→输入连线表达计划结构，不是行流方向、调用关系或执行先后。

| 所选节点 | 原JSON pointer | Plan Rows | Actual Rows平均值 | Actual Loops |
| --- | --- | --- | --- | --- |
| Nested Loop | `/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0` | 528 | 1056 | 1 |
| Hash Join / Outer | `/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0/Plans/0` | 176 | 352 | 1 |
| Index Scan / Inner | `/0/Plan/Plans/1/Plans/0/Plans/0/Plans/0/Plans/1` | 3 | 3 | 352 |

这些source fields与显示节点ID逐项列在 [evidence.json](evidence.json)。完整报告digest＋occurrence pointer定位本报告内出现位置；节点名、表名、索引名不作为跨计划稳定身份。父节点原始 `Parent Relationship=Outer` 是相对于视图外父节点，解释页明确保留。

首屏推导只用目标Index Scan的原均值与循环数。平均值可能经过报告舍入，输出也可重复，因此写“约1056次行输出”。父/outer的528vs1056、176vs352也完整保留，目标节点局部均值相同不证明全计划估计准确。没有时间、exclusive/self-time、关键路径、并行聚合或调优推断。

PostgreSQL18发布源码 [explain.c @ 3d6a828938a5fa0444275d3d2f67b64ec3199eb7](https://github.com/postgres/postgres/blob/3d6a828938a5fa0444275d3d2f67b64ec3199eb7/src/backend/commands/explain.c#L1827-L1857) 仅用于核对 `Actual Rows` 按nloops输出平均值、loops另列的字段规则；见 [field-rules.json](field-rules.json)。**它不是此样例的生成版本证明**。本实验没有启动数据库、读取数据库文件、执行SQL、安装上游viewer或建立通用parser/adapter。

## 渲染命令与实际证据

分支 `codex/lab-plan-row-counts`，基线 `82c7e0f089a02a4d514714adf37dc2061682da5f`；Node `v22.23.3`。只新增本实验目录，不修改shared runtime、公共合同或live Skill。

从仓库根、Node22与archify依赖可用时运行：

```sh
node archify/bin/archify.mjs render tree experiments/plan-row-counts/plan-row-counts.tree.json experiments/plan-row-counts/output/plan-row-counts.html
node archify/bin/archify.mjs render explainer experiments/plan-row-counts/plan-row-counts.archify.md experiments/plan-row-counts/output/explainer.html
node archify/bin/archify.mjs finalize tree experiments/plan-row-counts/plan-row-counts.tree.json experiments/plan-row-counts/output/plan-row-counts.html --out-dir /tmp/plan-row-counts-tree-receipts --json
node archify/bin/archify.mjs finalize explainer experiments/plan-row-counts/plan-row-counts.archify.md experiments/plan-row-counts/output/explainer.html --out-dir /tmp/plan-row-counts-explainer-receipts --json
```

命令会重生目标文件，需要保留原产物时在副本中运行。相邻delivery receipt和finalize原始receipts可能含本机路径，本实验将它们留在checkout外；[portable-summary.json](portable-summary.json) 是明确标记的派生摘要，含原stdout hash、相对产物路径、实际阶段和文件SHA，不冒充原始receipt。

两份public render exit0，两份finalize的validate/deliver/check均pass。Tree默认showcase finalize实际browser-check pass，Explainer browser-check为not-run。Explainer保留一条 `explainer/writing-qualification` 写作建议，匹配“树线不代表执行顺序”的边界说明；这句对读图有用，不为清除建议删掉。协调agent实际截图与自动browser gate分开记录。

独立复核建议让独立Tree也直接显示父/outer的estimate与actual，已仅补强两个sublabel；原图数值没有错误。前版2HTML、2截图与capture原字节留在 [before-estimate-labels](screenshots/before-estimate-labels/)，最终两份产物仍复用单一spec。

这是固定内容样例，没有通用执行逻辑；没有新增泛化reader测试或运行全仓suite。实际静态核对包括：完整原source/license字节hash、精确substring、三节点source pointer和原字段、3×352算式、完整embedded spec与独立JSON一致、prepared sourceText逐字匹配草稿、公开本机路径扫描、所有产物和截图hash绑定。生成HTML保留renderer原始字节，没有后处理；其既有尾随空白会使全目录whitespace检查失败，作者输入/来源文件排除生成HTML后的检查另行记录。

AI协助：Codex核对来源、编写固定图和解释页、运行public CLI；协调agent实际截图并查看，另一agent只读复核来源/字段/模型/证据。此处不声明上游实际执行、远端CI或人类验收。

## 2026-10-29 原生对照补充

[PEV2 v1.25.0 原生对照](native-comparison/README.md) 已用同一字节输入完成：PEV2 本身显示累计行数、loops 和平均值近似提示。本实验因此只保留三节点定向讲解与来源说明的价值，不扩展通用计划解析器。补充包含真实页面图片、发布资产校验、复现步骤和验证边界；既有作者输入、模型和两份 HTML 未改，未创建 PR。

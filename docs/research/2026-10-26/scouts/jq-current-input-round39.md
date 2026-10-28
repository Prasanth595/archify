# 第 39 批：jq 当前输入与变量绑定

已交付独立远程分支 `codex/lab-jq-current-input`，提交 `fbdaaa46c47aa91ff65242dd0286c371e3fd35d0`。只推分支，没有 PR、合并、发布或安装。

[完整实验与复现说明](https://github.com/tt-a1i/archify/tree/fbdaaa46c47aa91ff65242dd0286c371e3fd35d0/experiments/jq-current-input) · [固定图稿](https://github.com/tt-a1i/archify/blob/fbdaaa46c47aa91ff65242dd0286c371e3fd35d0/experiments/jq-current-input/candidate.explainer.json)

## 先去重，再筛选

本批开始刷新 332 个远程 head，与上一批相比只移动研究汇总分支。两个研究分支内的 jq/jnv/jqp 搜索无既有报告；远程名称也没有这一方向。`jq` issue 检索命中已关闭 #48，但只是复现命令用了 `gh --jq`，实际问题是打包遗漏，不能当作上下文阅读重复项。对应 PR 查询无命中。一次漏写 `is:issue` 的查询被接口以 422 拒绝，失败与修正结果均保留。这些都是有范围的词语检索，不是语义穷尽性证明。

task-view 当前 main 仍为 `a3fa21767bfaeb3077fdda08bddb7249366caa93`，不重复已有研究。

| 项目 | 固定版本 | 与阅读有关的能力 | 本批证据边界 |
| --- | --- | --- | --- |
| [jnv](https://github.com/ynqa/jnv/tree/9871ba34b611e3c1c559fdcb8d0bc227397c280e) | 9871ba34b611e3c1c559fdcb8d0bc227397c280e | JSON 浏览、编辑查询、有限补全；内部使用 jaq | README、Cargo 与许可核对，未运行 TUI |
| [jqp](https://github.com/noahgorstein/jqp/tree/c0c3a857231679bb6e8fb7dc7d57f8283d93d41a) | c0c3a857231679bb6e8fb7dc7d57f8283d93d41a | 输入／输出预览与查询历史；内部使用 gojq | README、Go manifest 与许可核对，未运行 TUI |
| [jq 1.7.1](https://github.com/jqlang/jq/tree/71c2ab509a8628dbbad4bc7b3f98a64aa90d3297) | 71c2ab509a8628dbbad4bc7b3f98a64aa90d3297 | 管道、绑定与显式 debug 观测 | 固定手册和 builtin；原生执行器另记为本机 jq-1.7.1-apple |

不能把本机 jq 结果说成 jaq、gojq、jnv 或 jqp 行为，也不能把 Apple 二进制说成上游 tag 的相同构建。记录了本机二进制 SHA-256。

## 具体读者问题与较低成本基线

[jq #1326](https://github.com/jqlang/jq/issues/1326)从 2017 年开始讨论读者难以判断 `.` 的含义，仍为 open，但最后更新时间也是 2017 年。它只提供历史动机，不证明当下频率，也不作为语言规范。固定 1.7 手册已经明确说明：绑定表达式每产生一个值，后续表达式仍接收绑定前的输入，并能使用该变量。

因此，基线是手册加原生查询；并非 jq 缺少这条解释。可尝试的增量是让读者同时看见当前输入、绑定值、源码和结果。两个查询的最终输出完全相同，却在构造结果前使用不同当前值；另一个查询返回 null 但退出成功。这使“看最终输出”不足以检查中间上下文。

## 四组原生对照

输入将 `owners` 映射与两个 `jobs` 放在同一根对象。它改编自 jq 手册的文章／作者例子，更换领域、名字与值，并添加三个对照和观测点；不称为独立原创案例。

| 查询 | 关键观测 | owner 结果 | 退出码 |
| --- | --- | --- | --- |
| A：绑定 owners 后遍历 jobs | 绑定后 current 仍为 root；遍历后为 job，变量可用 | Mina、Bo | 0 |
| B：管道直接进入 owners | current 只含 u1、u2；没有 jobs | 无输出 | 5 |
| C：逐项绑定 job | 每次 current 都为 root，job 在变量中 | Mina、Bo | 0 |
| D：进入 job 后又查 .owners | current 为 job，没有 owners 字段 | null、null | 0 |

初筛四条查询的输入／输出另存 screen-pilot。随后在两个新目录中各执行 9 条命令：一次版本查询，加四组 plain/marked 对照。每轮 18 个手工观测值。plain 与 marked 的 stdout、退出码一致；只移除新增 DEBUG 行后，stderr 也一致。两轮的 18 对输出流仅替换明确的运行根目录后相同。原始输出没有被归一化覆盖。

这是插入式标记，不是自动追踪全部 VM 指令；相同 JSON 值也不证明相同对象身份或复制行为。

## 通过筛选的范围

仅接受基于既有 Explainer 的固定教学产物：四个固定提交的代码摘录、六节点对照图、六步高亮和结果表。公共运行时代码改动为零。

首稿三个静态 gate 通过，但默认 workflow 图例把观测节点写成“Agent 逻辑”。一次修订使用既有的图例覆盖能力改成“输入与结果”，移除装饰图标，并把两行标成查询 A/B；没有改共享默认值。首版 Markdown、HTML、回执和截图保留，最终权威源为 JSON。首稿两项文字警告已消除。

通用解析器、逐步求值器、编辑器或引擎适配器仍不通过筛选：需要维护语言语义、引擎与版本差异，四个案例不足以证明这些成本值得承担。

## 验证与限制

- 最终 validate/deliver/check 通过，零诊断；Explainer 自动 browser-check 明确为 not-run。
- 另用 Ego 在真实生成页检查六步高亮，对应 root、kept、jobs、names、replaced、fail；结束导览，打开完整原生图，核对图例。
- 实际检查固定提交的输入源码卡、四条完整查询、四行结果与主题切换。保留六份操作脚本和日志、13 张实拍，均已目视查看。
- 1440×900 下图、源码和表格可读；第六步说明低于初始折叠线，需要滚动。390×844 下页面无横向溢出，但缩略图较小、544px 表格需横向滚动，未验收完整移动交互。
- 九个完整来源文件经过 Git blob、字节长度和 SHA-256 核对；135 个文件列入内容清单并核验。32 处原始／生成字节的空白诊断保留；作者编辑范围检查通过，没有为消除提示改写上游字节。
- 未测人类理解率、阅读时间或自然任务迁移收益。原生观察、页面质量和用户收益仍是三类不同证据。

来源许可：jnv 为 MIT（2024 jnv authors），jqp 为 MIT（2022 Noah Gorstein）；jq 代码为 MIT（Stephen Dolan），文档为 CC BY 3.0。完整许可、固定链接与改编署名都在实验包。无上游背书声明。

![实际页面的原生图与修正图例](https://raw.githubusercontent.com/tt-a1i/archify/fbdaaa46c47aa91ff65242dd0286c371e3fd35d0/experiments/jq-current-input/evidence/native-modal.png)

下一次针对本方向的推进，应找自然查询任务对照手册／原生工具与图解，不继续添加同构例子；在有读者证据之前不扩成通用产品能力。

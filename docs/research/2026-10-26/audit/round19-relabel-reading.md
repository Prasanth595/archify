# Relabel 规则阅读：原生调试已覆盖逐步问题，暂不做新实验

2026-10-28，只读。**建议 defer / 不新建 graph。** 实际问题是规则序列中哪个规则改变或删除了哪些 label，或令整个 target/metric 被丢弃。Prometheus 官方已把这个需求做成逐步图；VictoriaMetrics 原生调试页面也有规则、输入和输出列及 label 高亮。完整相同输入与 native 结果没有显示尚需 Archify 解决的阅读缺口。

## 排重

历史 [config-origins](https://github.com/tt-a1i/archify/tree/codex/lab-config-origins) 解释多个 provider 的值来源/覆盖和错误归属；当前 [rule-matching-reading](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/rule-matching-reading.md) 研究 ESLint global ignore 判定。这里是**有序输入 label set 被 relabel 规则变换或丢弃**，机制不同，但现有表和来源解释已能表达；机制不同不自动证明需要新图。定向检索历史及当前 scouts 未发现 relabel 同名研究，不能视为语义穷尽。

## 具体公开需求与最强原生基线

[Prometheus 官方 3.8.0 说明](https://prometheus.io/blog/2025/12/02/visualizing-target-relabeling-rules-in-the-prometheus-ui/) 明确指出服务发现提供的 label 和规则不匹配可能造成错误标签或丢弃 target；其 UI 在 Service Discovery 选指定 target，展示初始 labels、每条规则与参数、每步新增/改变/删除高亮、最终保留/丢弃和输出 labels。该文是明确官方调试任务，不是本轮观测的生产事故。固定 [prometheus/prometheus@3861d587c7070dff79ae7862d4735e35cfc82f6e](https://github.com/prometheus/prometheus/tree/3861d587c7070dff79ae7862d4735e35cfc82f6e)，2026-10-27 默认分支、[Apache-2.0](https://github.com/prometheus/prometheus/blob/3861d587c7070dff79ae7862d4735e35cfc82f6e/LICENSE)；[HTTP API 文档](https://prometheus.io/docs/prometheus/latest/querying/api/#relabel-steps) 标明 `relabel_steps` 作为 UI 内部实验接口，格式/存在可变，不能将其当稳定通用导入合同。它针对 target relabel，不等同 metric/remote-write 全阶段。

固定 [VictoriaMetrics@61916650cafcb6037b5f6947774302ece0fb32e2](https://github.com/VictoriaMetrics/VictoriaMetrics/tree/61916650cafcb6037b5f6947774302ece0fb32e2)，2026-10-27 默认分支、[Apache-2.0](https://github.com/VictoriaMetrics/VictoriaMetrics/blob/61916650cafcb6037b5f6947774302ece0fb32e2/LICENSE)。其 [debug 模板](https://github.com/VictoriaMetrics/VictoriaMetrics/blob/61916650cafcb6037b5f6947774302ece0fb32e2/lib/promrelabel/debug.qtpl#L146-L190) 按 step 展示 Rule、Input Labels、Output Labels，输入侧高亮删除/更新，输出侧高亮新增/更新；[debug.go](https://github.com/VictoriaMetrics/VictoriaMetrics/blob/61916650cafcb6037b5f6947774302ece0fb32e2/lib/promrelabel/debug.go#L56-L110) 在规则运行之外还记录 target 默认 instance 与内部 `__` 标签清理等步骤。它的完整原生 HTML 应是对照，不应只拿 YAML 文本做弱基线。源码与文档显示的功能没有本轮浏览器验证，不能声称实际截图、可访问性或所有部署版本一致。

## 固定可核小样例

VictoriaMetrics 完整 [relabel_test.go](https://github.com/VictoriaMetrics/VictoriaMetrics/blob/61916650cafcb6037b5f6947774302ece0fb32e2/lib/promrelabel/relabel_test.go#L91-L164)，SHA-256 `019d7a420723db58c06711c2af4c57c0e66ca96491d95d3635aa4facbf1638b0`，`TestParsedRelabelConfigsApplyDebug` 比较完整 `[]DebugStep`。其中 “Multiple steps” 的固定输入、两个规则与预期：

| 阶段 | 规则 | 输入 / 上游断言输出 |
| --- | --- | --- |
| 1 | `action: labeldrop`, `regex: foo.*` | `m{a="b",foo="x",foobc="123"}` → `m{a="b"}` |
| 2 | `target_label: foobar`, `replacement: abc` | `m{a="b"}` → `m{a="b",foobar="abc"}` |

这里第一步删两个**标签**，第二步新添一个标签；并未删除整个 metric。对照同一测试 “drop metric” 输入 `foo{abc="def",bar="baz"}`、`action: drop` / source `bar` / regex `baz`，expected 输出 `{}`。同文件另有 replacement 为空先得到 `foo{bar=""}`，随后 `remove empty labels` 才得 `foo`；不可把中间和最终状态混成一步。都是上游提交断言，非本轮运行；测试直接调用 `ApplyDebug`，不是完整 UI 或实时服务 scrape。完整测试、全部规则和输入需保留，不将派生摘录冒充 native response。

Prometheus [配置合同](https://prometheus.io/docs/prometheus/latest/configuration/configuration/#relabel_config) 区分 `labeldrop` 删除匹配的 label 名、`drop` 删除匹配的 target/样本；`source_labels` 缺失取空串、以 separator 拼接，regex 默认两端锚定。应用阶段和产品实现必须随记录一起给出；不能把服务发现 target 的 `__` 清理硬套所有 metric/debug 环境，也不从本样本推断真实运行结果或事故根因。

## 价值和成本

静态解释页若要有增量，须携带完整、明确可公开的同一规则/输入和原生逐步报告，回答一个 native UI 未清楚回答的交接问题；当前没有此证据。现有 native UI 已将规则与前后 label 集逐行并列，额外画路径图可能复制其内容。自建求值器会承担 regex、缺失/空值、目标 vs 样本、顺序、内部清理、版本与 VM 扩展语义，成本不相称；不建议 importer、通用 runtime 或新图。没有安装、执行上游或浏览器测试，也没有外部写入。

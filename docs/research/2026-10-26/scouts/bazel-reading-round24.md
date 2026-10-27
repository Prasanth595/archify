# Bazel action/configured target 阅读：已有原生比较，暂缓新实验

2026-10-28，只读；**建议 defer**。具体问题是：改规则后，产出同一组文件的 action 的命令或输入是否改变？`aquery_differ` 已直接回答这一受限比较；若把输出集合配对当作永久 action 身份，或把 analysis graph 当实际执行记录，则会误读。当前没有同一完整自然 build 的两个报告和原生输出证明 Archify 额外价值；已有计划/任务身份实验也覆盖相邻交接。

## 排重

历史 [build-infra-smalltools](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/build-infra-smalltools.md) 与 [rebuild-evidence](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/rebuild-evidence-smalltools.md) 已筛 Bazel/构建声明及失效解释；[plan-actions](https://github.com/tt-a1i/archify/tree/729d3a0374189234e1bdfe5d6fc7f7190c894e0e/experiments/plan-actions) 是声明计划而非运行；[task-occurrences](https://github.com/tt-a1i/archify/tree/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences) 区分重复打印与任务身份；[dependency-map](https://github.com/tt-a1i/archify/tree/2be2ab55cc9134876158e557e5287ec1912ca718/experiments/dependency-map) 是 import 关系；[Ninja 后续](https://github.com/tt-a1i/archify/blob/codex/research-lab-20261026/docs/research/2026-10-26/scouts/build-dependency-reading-round16.md) 核 order-only 与实际 dirty 解释。Bazel configured target 和 action 有不同语义，但换工具/画依赖 DAG 不自动产生新价值。关键词检索不是全历史穷尽。

## 官方合同与完整测试

固定 [bazelbuild/bazel@88888ad0a7fd238bd6dd06a54d30d58c5021dd6d](https://github.com/bazelbuild/bazel/tree/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d)，2026-10-27 默认分支，[Apache-2.0](https://github.com/bazelbuild/bazel/blob/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d/LICENSE)。[完整 aquery_differ_test.py](https://github.com/bazelbuild/bazel/blob/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d/scripts/aquery_differ/aquery_differ_test.py)，11,408 bytes，SHA-256 `232cb15f5f1310cac6db5517bbbb9161c7a836b6fb3f57f57742cf6419c08fad`；包含构造完整 `ActionGraphContainer`、path fragments/artifacts/action 的 helper 及所有测试，不是实测 build。

[完整 `test_different_command_lines`](https://github.com/bazelbuild/bazel/blob/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d/scripts/aquery_differ/aquery_differ_test.py#L180-L248)：before 的同一 action 输出 `root/foo` 与 `root/bar`，参数 `[-a,-d]`；after 输出相同，参数 `[-a,-b]`；另一个 action 输出 `root/baz`，参数从 `[-c]` 到 `[-c,-d]`。断言原生结果包含以输出集合为标题的两段 unified diff，分别 `--d`/`+-b` 与新增 `+-d`。测试对两段用 `assertIn`，**不是断言完整 stdout 次序或内容**；paths 用 `os.path.join`，不声称某平台之外的分隔符。本轮没有执行该 fixture 或 Bazel，所列为上游预期片段。邻近的 [input 测试](https://github.com/bazelbuild/bazel/blob/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d/scripts/aquery_differ/aquery_differ_test.py#L250-L313) 测试直接和传递重复输入去重后 `root/bar` 消失；它不是同一自然构建实验。

固定 [differ 源](https://github.com/bazelbuild/bazel/blob/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d/scripts/aquery_differ/aquery_differ.py#L140-L155) 将 output paths 排序并组合为 key；[比较](https://github.com/bazelbuild/bazel/blob/88888ad0a7fd238bd6dd06a54d30d58c5021dd6d/scripts/aquery_differ/aquery_differ.py#L215-L301) 报缺失输出集合，并按选择的 `cmdline`/`inputs` 对相同 key 差分。这里 output key 是该工具比较策略，不是跨版本永久身份，也不保证比较未选择的 environment、工具内容、输入文件字节或所有 action 属性。源码在比较时要求 after 值 truthy，空列表场景未在所读测试中核实，不能把本次两个非空测试推广为完整差分正确性；没有执行，不声称存在已复现缺陷。

## 强原生基线及价值边界

官方 [aquery](https://bazel.build/query/aquery) 查询 post-analysis configured target graph 的 actions、artifacts 和关系，支持按 inputs/outputs/mnemonic 过滤、多种输出；它描述分析出的 action，不证明实际执行、cache hit/miss 或时间。官方 [cquery](https://bazel.build/query/cquery) 在配置后查询 configured targets：同一 label 可有多个配置，`config`/universe 与 transitions 决定解释；不要按 label 合并后把工具配置和目标配置当同一实例。[原生 aquery differ 文档](https://bazel.build/versions/5.4.1/aquery.html#comparing-aquery-outputs) 示例展示按 outputs 配对、cmdline/inputs 差异；该滚动/版本化文档路径或参数可能随版本变化，fixed source 为本次准据。

官方 [issue #18643](https://github.com/bazelbuild/bazel/issues/18643) 提出了自然问题：如何事后解释两次构建为何未复用 cache；作者区分 aquery 的计划和 execution log/BEP 实际结果，指出事后日志成本。该 issue 不是上述合成 test 的运行记录，不能由命令差异直接推出 cache miss 原因。

若以后有完整同源两个配置的公开 aquery、对应 cquery 与原生 differ 输出，可用现有 Explainer source/table 标出配置身份、输出集合匹配、未匹配 action、输入/命令变化及未知执行状态；比较完整 native text/filter/graph 和 differ，不能只拿普通 BUILD 文本作基线。若原生已清楚回答，不增页面；缺真实报告前不建立通用 importer、匹配器、cache 因果图或运行时。未安装、运行上游、浏览器、写仓库或外部消息。

# Round 24：Cargo resolver 2 的 feature 与构建上下文

2026-10-28，只读。**决定：暂缓新图或 importer。** 官方同例 native tree 已把两个同名同版本上下文显示出来；真实用户问题还涉及实际 build unit，不能用 Cargo.lock、普通 metadata 或一张聚合依赖图伪装成构建事实。未安装、运行 Cargo/下载代码、修改仓库或创建 PR；上游测试预期不是本次运行结果。

## 自然问题：为什么 dev feature 出现在普通依赖下？

[Cargo #11261 完整 issue](https://github.com/rust-lang/cargo/issues/11261) 给出 `tt` 的完整 manifest：同一 `te` 同时作为普通依赖与启用 `mockall` 的 dev 依赖；`te` manifest 声明可选 mockall。作者提供 Cargo 1.66.0-nightly 的完整 `cargo tree` 输出：普通分支显示 mockall、dev 分支显示 `(*)`。这些是作者当时环境的记录，issue 中缺完整锁文件与项目源文件，不当作完全可复现的当前输入。

[维护者解释](https://github.com/rust-lang/cargo/issues/11261#issuecomment-1285596401)：默认包含 normal、build、dev，近似 test 的统一结果；`cargo tree -e normal,build` 更接近 build。另一参与者确认 [dev 与 normal 在 test 下合并](https://github.com/rust-lang/cargo/issues/11261#issuecomment-1285823124)。提问者后续真正需要“具体 build 实际包含什么”；维护者区分 [nightly `--unit-graph` 与近似 tree、metadata 和 lockfile](https://github.com/rust-lang/cargo/issues/11261#issuecomment-1285980772)，[提问者确认 unit graph 满足其需要](https://github.com/rust-lang/cargo/issues/11261#issuecomment-1286265043)。#11261 已关闭，关联 [#11282](https://github.com/rust-lang/cargo/pull/11282) 是补充 tree 文档，非宣称所有命令产生同一构建图。依赖于 nightly/具体版本的 unit graph 不应称 stable API 或本轮执行。

## 官方完整同例：不同上下文与原生输出

固定 Cargo `31d3246e0e8d3a80d4a90b54aa48ff180adb408b`；[tests/testsuite/cargo_tree/deps.rs 完整文件](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/tests/testsuite/cargo_tree/deps.rs)，定位 `host_dep_feature`。完整 test 内声明临时 registry 包 `optdep`、带可选 optdep 的 `bar`，fixture 的 `foo` 同时依赖普通 `bar` 和启用 optdep 的 build `bar`，还有完整 Cargo.toml、空 lib 和 build.rs。官方 test helper [features2.rs](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/tests/testsuite/features2.rs) 中 `switch_to_resolver_2` 切换；相关 test 原文中的 `.with_stdout_data` 是完整预期而不是本次 stdout。

旧 resolver 的 `cargo tree` 在普通 bar 下显示 optdep，build bar 标 `(*)`；切到 resolver 2 后，普通 bar 下无 optdep，build bar 下有 optdep。`tree -p bar` 直接显示两次同版本 bar，只有第二棵有 optdep；`tree -i optdep` 只连到 build 依赖的 foo；`tree -d` 输出两棵同版本 bar 的不同上下文。**此例原生输出已经可回答两个上下文的差别和 optdep 来源。** 不应把两个 bar 合并成同一特征集，或把分开两次打印叫成两种版本，也不应将树输出当构建过程事件。

同一完整文件的 `dev_dep_feature` 给出 resolver 2 下默认 `tree` 与 `tree -e normal` 预期：默认保留 dev 触发的 optdep，normal 单独筛选则不显示。它对应 #11261 的概念，但不是该用户的原始输入。`no_dedupe` 与 `make_simple_proj` 在同一文件包含完整不同示例及 expected；`--no-dedupe` 展开重复位置而非创造新 package identity。单独 [cargo_tree/features.rs](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/tests/testsuite/cargo_tree/features.rs) 含完整 feature 边、反向查询及 expected，不能把它误认成 host_dep_feature 同次运行。

## 公平原生基线及边界

[固定 cargo-tree 文档](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/doc/book/src/commands/cargo-tree.md) 给出 `-e features`、`-i`、`--no-dedupe`、`-d`、`--target` 和默认 edge kinds；`(*)` 表示展示去重，并非运行次数。`-i` 在 workspace 默认按当前成员，跨 workspace 需 `--workspace`；`--target all` 是显示所有目标而非声称当前构建都执行。[固定 features 参考](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/doc/book/src/reference/features.md) 说明 resolver 2 下 host build/proc macro、inactive target 和 dev 的条件性分离，实际 dev 是否合并取决于正在构建的目标。反向 feature 图说明为何启用；tree 是近似而不是本身的 build log。不要将三种边类别都一概独立，也不要将所有 same name/version 都固定为不同编译 unit；具体 target、配置、command 和 feature 决定。

完整对照应保存同一 manifest、lock、Cargo/rustc 版本、host/target、具体命令及完整 default tree、`tree -e normal,build`、`tree -e features -i <package>`、`tree -p`、`tree -d` 与必要时 `--no-dedupe`；同时保留可用时相同命令的 `--unit-graph`、其 nightly 边界与原始输出，而非仅与默认树比较。unit graph 是计划，不是已完成编译时间线；非同一命令的 test/build/target 结果不可混称。

## 排重与评估

[edge-extras `1db953a7`](https://github.com/tt-a1i/archify/tree/1db953a726b79f135187ee3cd2e12723717c7555/experiments/edge-extras) 已比较 pipdeptree 同包不同入边 extra 与显示策略，强调声明、显示与安装不同；Cargo 语义不同，但复刻同包多位置图并非新价值。[task-occurrences `caffb4aa`](https://github.com/tt-a1i/archify/tree/caffb4aabb13b04a77bb9475866ad65465d79b20/experiments/task-occurrences) 分离打印位置和任务身份；[dependency-map `2be2ab55`](https://github.com/tt-a1i/archify/tree/2be2ab55cc9134876158e557e5287ec1912ca718/experiments/dependency-map) 已做来源报告局部图和未显示账目。它们都不求解 Cargo features 或提供真实 unit 数据。查阅本地研究与当前 remote heads 的 cargo/feature 词汇；不保证发现所有未命名工作。

如果未来有固定完整真实项目及离线可公开的 unit graph，再使用相同版本、同命令与原生树加 unit graph 的完整信息，测读者能否回答 feature 的启用路径、同包上下文、预期 build 单元与未知项。仅多画颜色或将 stdout 隐去的图不构成收益；确认缺失、去重、跨 target/host 与 proc macro、同包不同 unit、版本漂移和 nightly 输出的维护成本后再决定。现无独立读者对照、无本轮实际运行，故先停。

Cargo 固定上游许可为 [MIT](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/LICENSE-MIT) 或 [Apache-2.0](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/LICENSE-APACHE)；完整测试与 expected 均通过上述固定文件链接保留，没有复制或执行。

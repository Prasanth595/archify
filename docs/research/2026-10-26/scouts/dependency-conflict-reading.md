# Dependency solver conflict explanation：PubGrub 有限试制

调查 2026-10-27；只读源码、文档和现有研究，没有运行第三方代码、解析真实 registry、安装或修改外部环境。结论：**以 PubGrub 的完整离线 fixture 做有限试制**，对照输入声明范围、冲突解释范围和归约省掉的事实。uv 暂只保留研究。阅读收益尚未证实，须与完整原生报告公平比较。初查仅找到简单文档例，补查后找到下述完整测试与双份原生报告，因此调整筛选结论。

## 查重与任务

查阅本地远端研究汇编 `origin/codex/research-lab-20261025@60342aa9e40618aeb7c33bdb8d65889fea3a588e` 的 build-infra、build-reading、rule、model-witness、graph 系列及 gallery manifest；也检索当前 scouts。gallery 的 [dependency-map](https://github.com/tt-a1i/archify/tree/2be2ab55cc9134876158e557e5287ec1912ca718/experiments/dependency-map) 消费 dependency-cruiser 的 import 报告，保留未解析和视图外账目；并非求解版本约束。现有 model witness、规则匹配、图阅读分别涉及证据链、规则和图交互，不能直接当作版本求解失败报告。检索未发现同题并不保证其他未命名工作不存在。

具体阅读任务：给定一次失败的冻结报告，回答“哪些要求共同导致无解，各自支持证据是什么，以及结论适用哪些环境/版本范围？”这不是画安装后的真实依赖树：无解时没有成功选定的安装树；`A depends on B` 的版本区间是声明/推导，不能画成已安装版本或运行时调用。来源为缺失版本、依赖条件或派生冲突时须分别标明，也不能把一个求解器报告的归约解释称作唯一最小冲突集。

## 上游原生输出已经做了什么

固定 [uv `f8bec5eac866c5dd3794b4420e21e5dbd44045c6`](https://github.com/astral-sh/uv/tree/f8bec5eac866c5dd3794b4420e21e5dbd44045c6)，[Cargo.toml](https://github.com/astral-sh/uv/blob/f8bec5eac866c5dd3794b4420e21e5dbd44045c6/Cargo.toml) 声明 MIT OR Apache-2.0，使用 astral-pubgrub。官方 [resolution 文档的完整输入与完整错误](https://github.com/astral-sh/uv/blob/f8bec5eac866c5dd3794b4420e21e5dbd44045c6/docs/concepts/resolution.md#L612-L636) 已把两个 extra 的 numpy 精确版本、双方不兼容和根项目需要双方的推导连接起来；其后还给出声明 conflict 的不同语义，以及同时安装两 extra 的失败。错误本身已能回答这个小例子的主要问题，不能删掉后半段把弱化文本当 baseline。

[PubGrub 库说明](https://github.com/pubgrub-rs/pubgrub/blob/main/src/lib.rs) 区分 external incompatibility 和 derived incompatibility，并说明 no-solution derivation tree 与报告可归约；该页面未固定版本，只作概念参考，不作为复现输入。它提示版本缺失可能来自受限缓存，因此任何“没有版本”只能归属于该输入及求解环境，不等同于公网 registry 的客观现状。uv 文档示例是上游文档示例而非本轮运行；也不证明其 numpy 当前索引状态。

## 若未来补充证据，怎样公平对照

使用下述固定 PubGrub 完整离线 fixture 及其两份原生报告，记录 ref 和文件散列。uv 样本只作研究：其完整历史索引元数据未冻结，不能声称可重复求解。读取保存快照即可，不访问网络也不重跑第三方程序。保持上游错误原样为 A；B 在同一原始事实旁提供可展开的推导节点、版本集合和原文定位，未知信息原样标 unknown。固定问题与阅读时间，独立读者分别回答冲突双方、证据、环境适用范围；比较正确率、完成时间和错误归因，保留初稿、失败、屏幕截图。还应测试不支持/截断报告时拒收或标明不完整。

**证伪**：原生报告本身已同样快且正确；B 不能对复杂共享推导稳定映射原文、丢失范围边界/环境条件，或把推导边误当安装依赖边；若只依赖人工重写，不能验证原文对齐，也不支持通用 importer。排除仅凭更美观或合成 fixture 的收益声明。成本包括自然语言错误格式不稳定、PEP 440 版本集合/marker、解释归约与来源覆盖，以及多语言/上游版本变动的维护；不应为单一简单示例建设完整求解器或声称支持全部 uv 错误。

## 有界补查：完整原生快照与折叠原因

补查后修正上面“尚无复杂完整快照”的表述：找到了可作为**固定阅读输入**的完整上游断言，但没有证明视觉方案更优。以下两例均为上游保存的预期结果，而非本轮实测运行。

1. **PubGrub 折叠丢失原因**。[`tests/examples.rs::confusing_with_lots_of_holes`](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/examples.rs#L229-L268)，固定 commit `2b32d6a1b0b7b6021d2658a274d6fb7b613c5796`，其 [Cargo.toml](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/Cargo.toml) 为 MPL-2.0。OfflineDependencyProvider 的完整合成输入在同一测试中：root 1 依赖任意 foo 和 baz；foo 1–5 各依赖任意 bar；baz 1 无依赖；没有提供 bar。完整默认报告的两句列明没有可用 bar、foo 1–5 被禁止、foo 版本集合中的空洞、root 被禁止；调用 `collapse_no_versions()` 后，完整默认报告缩为“foo 依赖 bar、root 依赖 foo、root 被禁止”，不再显示 bar 无可用版本；测试同时断言 baz 不在报告关联包集合内。前者的信息充足但版本集合符号难读；后者易读但原因信息被有意省略。这里有可审查的阅读问题：能否并排对应归约前后，指出被省略的版本可用性，而不误把 baz 从冲突解释中省略当作它不在输入里。**两种完整原生输出均须保留，不能只拿较弱的折叠文本作基线。** 该 fixture 使用整数版本集合，不是 PEP 440、uv 的报告或真实 registry。

2. **uv 两组版本范围与不同失败原因**。[`pip_compile.rs` 的 open3d 快照](https://github.com/astral-sh/uv/blob/f8bec5eac866c5dd3794b4420e21e5dbd44045c6/crates/uv/tests/pip_compile/pip_compile.rs#L16743-L16771) 完整保留失败状态、原因和两个 hints：旧版本范围缺匹配 Python ABI 的 wheel，新版本范围缺匹配平台的 wheel；报告还给出候选 ABI 和平台。测试输入 `open3d`、Python 3.10、目标 `x86_64-manylinux_2_17` 可见，但来源中的完整历史索引元数据未随该片段固定，不能重演或推断当前索引。原生文字已经把范围和两条原因解释清楚；视觉上可审查的潜在收益是帮助对齐版本范围与 ABI/平台证据，仍须保留所有 hints，并禁止将“不兼容 wheel”改写为“版本不存在”。

最小可行对照因此改为：使用 PubGrub 的完整冻结 fixture 作为阅读材料，显示官方输入和来源，同屏提供归约前与归约后两份原文。候选图只做对原文可定位的静态标注，不创建 importer 或交互框架。提问包括“什么事实使 bar 无法满足”和“baz 是否存在于输入”。若参与者看完整原文的准确率和时间已相当，或候选误说完整依赖树、真实索引或隐藏 bar 缺失，则停止。样本一虽有完整输入和双报告，仍是合成案例；样本二有上游完整原文，但缺完整索引 fixture。PubGrub 例子足以支持范围有限的同源静态试制；其合成性质和缺少独立阅读结果意味着价值尚待验证。uv 仅保留研究，不纳入此次试制。


## 2026-10-29 后续：本地 wheel 的 uv 实测

[第 57 批](uv-native-locations-round57.md)补充已安装 uv 的原创 metadata-only wheel 对照：缺 bar 退出 1，仅补 bar 1 后退出 0，成功解包含 baz。两次末轮复跑及原始输出审阅页已有证据。它没有执行原 PubGrub Rust fixture，也没有补齐 open3d 历史索引；原生报告已明确包位置范围，暂不新增图或 importer。早期“只读源码”的叙述仍属于当时阶段。

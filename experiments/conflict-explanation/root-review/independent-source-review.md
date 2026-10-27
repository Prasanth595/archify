# PubGrub 固定报告阅读实验：独立来源语义审查

结论：当前方向可做，完整输入、两份原报告与声明图的组合有潜在阅读价值。审查基于一手 GitHub connector 读取固定提交；未运行求解器、第三方 Rust、或任何测试。对当前 a/b.archify.md 的源码审读显示函数与报告符合上游。当前需要的是术语与署名的小修订，不需要扩大成 parser、通用推理模型或 solver 集成。

## 已核来源与范围

固定提交：`pubgrub-rs/pubgrub@2b32d6a1b0b7b6021d2658a274d6fb7b613c5796`。

- [tests/examples.rs L229–268](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/examples.rs#L229-L268)：完整测试函数、归约前二行字符串、归约后一行字符串及 packages 断言；三者均是源码中的预期断言，不是本次执行结果。
- [src/provider.rs L21–74、L104–110](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/src/provider.rs#L21-L74)：空 provider、注册规则、版本查询及 choose_version。
- [src/report.rs L67–164](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/src/report.rs#L67-L164)：packages、collapse_no_versions、merge_no_versions 的 owning implementation。
- [tests/proptest.rs L369–409](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/tests/proptest.rs#L369-L409)：保留解释依赖后的错误性质测试源码，表达的是保留相关依赖仍失败的性质，仍不构成最小性或唯一性承诺。本次没有运行它。
- [LICENSE](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/LICENSE)、[Cargo.toml](https://github.com/pubgrub-rs/pubgrub/blob/2b32d6a1b0b7b6021d2658a274d6fb7b613c5796/Cargo.toml)：MPL-2.0；examples.rs 自身亦有 SPDX 声明。

使用本仓库 archify-review Skill 与 REVIEWING.md 的价值/成本/影响框架，未作 GitHub review 或发布操作。记忆快速检索无相关命中，结论不依赖历史记忆。

## 会影响当前稿的事实与小修订

1. **bar 没有可用版本的边界是这个 provider 输入。** new() 建空 map；add_dependencies 只为调用的 package/version 登记该版本及其依赖，不会替依赖名称登记版本。该函数只登记 root 1、foo 1/2/3/4/5、baz 1，没有登记 bar。choose_version 在 package 不在 map 中时返回 None。因此准确表述为“这个固定输入没有提供任何 bar 版本”；不能推到真实仓库、网络、缓存或全世界没有 bar，也不能把它归因于某个已知 bar 版本范围不匹配。图中的 bar 应是被引用的包名，带“未提供版本/本输入可用版本为空”，不是 bar 的一个具体版本或已安装节点。

2. **root 对 foo 和 baz 的约束都是 Ranges::full()。** root→foo{1..5} 只能是图中候选聚合表达，不能解释成 root 声明只允许 1–5。已登记候选 foo 是五个离散 u32 版本 {1,2,3,4,5}；不是 semver 的 1.x 系列，也不是连续实数区间。每个候选均依赖 bar 的 full 范围。当前稿正文已经说“范围都是任意版本”，正确；建议图旁明确“五个已登记版本合并显示，未选择具体版本”，并用 {1,2,3,4,5} 降低破折号范围歧义。

3. **packages() 不返回最小冲突或唯一原因。** 它递归收集树的 terms keys 与 external/cause 中出现的包名。测试在 collapse_no_versions 调用后断言集合恰是 root/foo/bar；baz 不在这份解释里。当前“冲突包集合”建议改为“归约后解释树引用的包集合”，并在第一次提及时写“不主张最小性或唯一性”。不用引入新的最小性算法或要求运行 solver。

4. **collapse_no_versions 是报告树简化，不是求解输入简化。** 它递归合并 NoVersions incompatibility 与另一 cause；FromDependencyOf 的相关版本集合用 union 扩大，且 Derived 分支仍有 TODO。文档明确提醒：如果 provider 可能因为 offline 模式缺少真实存在的版本，应谨慎使用这一简化。该例的归约后一行确实省掉了“bar 没有可用版本”的显式语句，也把 foo 五候选与其他不存在版本的细节隐藏了。可说“归约报告在本例更短，需结合固定输入及未归约报告阅读”；不可说成“无损的通用完整证明”，或以这句一般依赖链本身推导所有情境都无解。

5. **许可识别需随阅读稿保留。** source/examples.rs 保留原 SPDX 且 source/LICENSE 存在，这是正确起点。可见 a/b 文稿应加同一条短说明：“测试代码摘自 PubGrub 固定提交，按 MPL-2.0 提供”，链接固定来源及 source/LICENSE；HTML 单独分享也应能找到相同许可来源。不要把第三方摘录默认为 Archify Apache 内容。最小成本是两稿相同署名/许可行和归档 LICENSE，无需改全仓许可证或设计许可系统。

## 允许的准确措辞

> 本页阅读上游测试中的固定输入和预期报告，未在本次运行求解器。root 1 依赖任意版本的 foo 与 baz。输入登记的 foo 候选只有 {1,2,3,4,5}，每个都依赖任意版本的 bar；输入没有登记任何 bar 版本，所以这组输入无法满足 root 1 的依赖。baz 1 在输入中且无依赖，但不在这份归约后解释树引用的包集合中。图把相同声明的五个 foo 候选合并显示；连线表达依赖声明与解释范围，不表达已安装结果、求解顺序或完整内部证明。

原报告必须保持原文，不要把逐条无版本区间的冗长文本“修正”为另一个数学字符串。允许正文解释、candidate 添加图；baseline 与 candidate 应共享完整函数、报告、注释、许可及语义边界，避免把内容补全差异误作图的收益。

## 验收与成本边界

源码静态对照足够验证这个固定阅读任务的语义；不需要为制作页面运行整个 solver。最终仍需主任务做本地生成、原文一致性校验和浏览器阅读 QA；这些与第三方算法运行是不同证据。现有四个包家族节点、三条依赖边、一个范围表足够，不引入自动抽取、通用 parser、proof graph、版本选择轨迹或最小冲突计算。

本报告只读检查生成中的源稿，未评判截图可读性、图导出细节或实际读者收益；需由主任务保留其独立状态。未改 worker 文件，唯一输出为本报告。

## 后续复核 — 2026-10-27，最终重新生成的两臂

**静态语义通过，无阻塞项。** 复用此前 GitHub connector 固定源身份，没有再次抓上游、运行测试、求解器或浏览器。读取最终 a/b.archify.md 与 HTML，使用 HTMLParser 和内嵌 JSON 检查实际文本、代码块及图模型；这只是静态内容复核，不是浏览器视觉 QA。

最终 HTML SHA-256：

- a.html：`d9f6488f8ba79cf0c8596a888ad8189c48d56972bd58d4e905b91b3d68bfaed9`
- b.html：`23fcc185c7d14ed3884eb3e2e0d9ef2281a960b063e97eeeea2970252dbcc796`

复核结果：

- b.archify.md 完整保留 a.archify.md 的共同内容前缀，之后只增加“声明范围与冲突解释范围”面板。内嵌 document 的 meta、answer、sources 完全相同，a 的四个 panels 与 b 的前四个 panels 深度等同；每份 HTML 内嵌 sourceText 与各自当前 Markdown 完全相同。
- 两份 Markdown 的完整 Rust 函数逐字符等同固定源 L229–268；两份 HTML 的 code 元素解码后也分别包含完全相同的函数、归约前完整二行报告及归约后完整一行报告。没有修改上游原文、移除 packages 断言或省略 baz 输入。
- HTML 正文实际包含五个整数版本 {1,2,3,4,5}、本输入未提供 bar 版本、归约后解释树引用集合且不主张最小性或唯一性、未在本次运行求解器、MPL-2.0 代码摘录声明与固定上游许可来源。许可建议已落实。
- b 的实际 preparedDiagrams.declared.spec 是 native tree：四节点 root/ foo/ bar/ baz；parent 关系为 root→foo、foo→bar、root→baz，恰三边。标签分别为 root 1、foo {1,2,3,4,5}、bar：未提供版本、baz 1；页面“图的结构”文本也列出完全相同的三边。
- b 图旁明确“约束均为任意版本”“五个已登记候选合并显示，未选择具体版本”“bar 是被引用但没有登记版本的包名”，并说明图不表示安装结果、求解顺序或完整内部证明。范围表将 bar 可用版本写为空，并保留 baz 为输入中有版本但该解释树未引用。该图没有把候选聚合误表为五版本同时选定，也没有把 root 的 full 约束误表为 1–5 限制。

这些修订解决上一轮的术语与可见来源问题。**静态语义通过不表示阅读速度提升或读者理解改善**；两者仍需比较性读者证据。实际图可读性、窄屏、浏览器 CLI 等由 root 另外验证，本次不冒充完成。固定源重跑不属于该阅读实验的必需条件。

包装复核备注：上面的价值措辞已限定为潜在收益；来源事实复核与读取效果验证是两件事。此改动未改变来源语义检查结论。

# 第 62 批：Twoslash 类型信息与代码阅读

2026-10-29，source-only。**结论：不建议新增 token 类型 hover 功能。** Twoslash 能把编译器类型信息放在代码位置附近，但本轮尚无真实交接任务或读者阻塞证据支持 Archify 重做这一交互；现有 Explainer 内容可以组织已核实的少量类型与诊断。不要把缺少 token hover 本身视为缺陷。

## 排重与当前基线

本轮远程快照包含 335 个 head，Archify `dev` 固定为 [`5ecbd1bfdbf83ea747072112493c940e707569cb`](https://github.com/tt-a1i/archify/tree/5ecbd1bfdbf83ea747072112493c940e707569cb)。[SourceCard](https://github.com/tt-a1i/archify/blob/5ecbd1bfdbf83ea747072112493c940e707569cb/archify/explainer/reader.js) 由引用或图节点触发，展示固定来源、最多 14 行预览和来源链接；它不是代码 token 的类型查询。Explainer 可用正文、表和源码摘录并列放置作者核对过的证据。

既有 `source-question-tour` 已用问题串起固定来源；[source-navigation](https://github.com/tt-a1i/archify/blob/3beb343b8fd6686201bde9b0f307f9a1c6b00246/docs/research/2026-10-25/scouts/source-navigation-smalltools.md) 已区分 Twoslash 的编译器证据与作者注释。[type-mismatch round 25](type-mismatch-round25.md) 对嵌套 TS2322 保留完整原生诊断并暂缓额外类型图；[AST round 51](ts-ast-selection-round51.md) 已讨论节点命中与坐标边界。这里不重复这些实验。

[Draft PR #1015](https://github.com/tt-a1i/archify/pull/1015) 查询时仍 open、未合并，head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`，范围包括源码 focus、SourceCard 展开和复制；它并非 token 类型查询，也不能当成 dev 已交付的能力。协调者分别按 issue/PR、twoslash/shiki 做四次关键词复查，均返回零条；[派生快照](../audit/round62-reading-candidates/github-snapshot.json)保留结果，仅是有界检索，不证明没有其他措辞的相关工作。

## 一个示例及原生阅读基线

可提出的阅读问题是：在 `Readonly<Todo>` 的初始化和随后赋值处，`title` 的类型查询与只读诊断分别说明什么？这是上游构造的测试示例，**并非已核实的自然用户困惑**。

固定 [Shiki `f7d0167873fd676fe4e190bc9b53832fba9ee01d`](https://github.com/shikijs/shiki/tree/f7d0167873fd676fe4e190bc9b53832fba9ee01d)，[MIT 许可](https://github.com/shikijs/shiki/blob/f7d0167873fd676fe4e190bc9b53832fba9ee01d/LICENSE)。其 [rich 测试](https://github.com/shikijs/shiki/blob/f7d0167873fd676fe4e190bc9b53832fba9ee01d/packages/twoslash/test/rich.test.ts#L197-L233) 在初始化处放置查询标记，并指定 `queryRendering: 'line'`；提交的 [HTML 快照](https://github.com/shikijs/shiki/blob/f7d0167873fd676fe4e190bc9b53832fba9ee01d/packages/twoslash/test/out/rich/line-query.html) 在代码后显示 `title: string` 和 JSDoc，后续赋值处显示只读属性诊断。该类型和诊断是静态编译信息，不说明运行时值或执行行为。

[rich renderer 源码](https://github.com/shikijs/shiki/blob/f7d0167873fd676fe4e190bc9b53832fba9ee01d/packages/twoslash/src/renderer-rich.ts) 支持类型 hover、查询 popup 或独立行，以及诊断行或 hover；[官方文档](https://github.com/shikijs/shiki/blob/f7d0167873fd676fe4e190bc9b53832fba9ee01d/docs/packages/twoslash.md) 将其描述为 Shiki transformer，样式需另外提供。提交的快照和代码可证明输出结构，**本轮未执行工具或操作浏览器**，不能据此声称视觉、键盘、触屏或无障碍交互通过。

固定 [Twoslash `e88c8708deb8d63349f48d840b1cd74cb807a7ce`](https://github.com/twoslashes/twoslash/tree/e88c8708deb8d63349f48d840b1cd74cb807a7ce)，[MIT 许可](https://github.com/twoslashes/twoslash/blob/e88c8708deb8d63349f48d840b1cd74cb807a7ce/LICENSE)。其 [节点协议](https://github.com/twoslashes/twoslash/blob/e88c8708deb8d63349f48d840b1cd74cb807a7ce/packages/twoslash-protocol/src/types/nodes.ts) 区分 hover、query、error 等，含 0-based 文件 offset、长度及 0-based 行列。虚拟样例的坐标不能直接当成固定仓库原文件坐标，查询结果也不等于作者注释。

## 后续条件

完整固定源码、提交的 HTML 快照与两份许可证已归档，见[来源清单](../audit/round62-reading-candidates/sources.json)。HTML 是上游提交的输出，不是本次运行生成或实际浏览器截图；本批不运行 TypeScript、Shiki 或 Twoslash。

只有出现具体真实交接问题，且同输入的原生阅读仍有可观察障碍，才值得做一页低成本对照：保留完整输入、源码 revision、编译器版本与选项、原始查询和完整诊断，使用现有 Explainer 表、正文和来源引用解释，并与同输入的完整 Twoslash 输出比较读者能否找到并理解答案；分别验证键盘与触屏。若原生工具已足够，或现有内容没有可观察增益，就停止。此方案不要求 TypeScript/VFS 依赖、解析器、公共 schema 或 token 弹层。本轮没有对照实验，不能声称阅读效率或正确率提升。

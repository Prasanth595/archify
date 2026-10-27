# 嵌套 TS2322：完整诊断先于额外结构图

2026-10-28 source-only；**建议 defer**。要回答的具体问题是：四层 callback 类型赋值失败时，失配最终落在什么返回类型？固定上游的完整 TypeScript 5.9.3 baseline 已逐层展开并给出 `number` 不可赋给 `string`；当前没有同输入的完整 translator 输出或真实阅读阻塞证明额外图有独立价值。

## 排重

历史 [diagnostic-locations](https://github.com/tt-a1i/archify/tree/67328d7de5cdf7bd894bfb526682cff9fdc2d10b) 将已有诊断 subject、行列和路径投影到 CLI 文本；[test-failure-map](https://github.com/tt-a1i/archify/tree/bb5e7bdb2995e977eeaf12dd8d6187a3ca676db9/experiments/test-failure-map) 区分测试阶段与位置，不解释类型 assignability；[source-navigation](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/source-navigation-smalltools.md) 已区分 Twoslash 编译器证据与作者注释。当前和历史 scouts 搜 TS2322/type mismatch 等，未见同一例子，但不证明所有语义相邻工作均排除。

## 上游完整原件和原生基线

固定 [microsoft/TypeScript v5.9.3@c63de15a992d37f0d6cec03ac7631872838602cb](https://github.com/microsoft/TypeScript/tree/c63de15a992d37f0d6cec03ac7631872838602cb)，[Apache-2.0](https://github.com/microsoft/TypeScript/blob/c63de15a992d37f0d6cec03ac7631872838602cb/LICENSE.txt)。完整 [nestedCallbackErrorNotFlattened.ts](https://github.com/microsoft/TypeScript/blob/c63de15a992d37f0d6cec03ac7631872838602cb/tests/cases/compiler/nestedCallbackErrorNotFlattened.ts) 384 bytes、Git blob `76a1fabdf6ed391e7cb0382f521ec28c95b131c0`，含 `@strict: true`、完整 Cb 定义、四层 `Cb<number>` 与 `Cb<string>`、`y = x`。完整 [expected errors](https://github.com/microsoft/TypeScript/blob/c63de15a992d37f0d6cec03ac7631872838602cb/tests/baselines/reference/nestedCallbackErrorNotFlattened.errors.txt) 1501 bytes、blob `4daa8b176ed8c6ef3c455f7b04b6e5bfeb960b77`：TS2322 在 source line 6 的 `y` 处，外层四个 `() =>` 不兼容，依次列三层 call signature return types，叶为 `number` 不可赋给 `string`。上游 baseline 是测试预期，含完整源码和诊断，不是本轮 `tsc` 执行。它本身已把路径显示出来；不能用去掉嵌套原因的顶层一行当 native 基线。

[TypeScript noErrorTruncation](https://www.typescriptlang.org/tsconfig/noErrorTruncation.html) 说明可关闭错误中类型文字截断；[pretty](https://www.typescriptlang.org/tsconfig/pretty.html) 控制格式。公平试验应保留完整 `tsc --pretty --noErrorTruncation` 的实际 stdout/stderr、退出码、版本、完整输入及配置，不能把官方测试 baseline 冒充这两个 CLI 参数的实测输出。不同编译器版本的措辞会变：当前 [native TypeScript 测试 baseline](https://github.com/microsoft/TypeScript/blob/df33c6a9de84fcbf53541b43f945e943006d83d9/tsc/testdata/baselines/reference/compiler/nestedCallbackErrorNotFlattened.errors.txt) 对同类 fixture 也有完整四层，但中间改用 `Type ... is not assignable ...`；不混称 5.9 的输出或推断工具缺陷。

[TypeScript issue #55666](https://github.com/microsoft/TypeScript/issues/55666) 提出实际用户对 type 声明顺序影响推断与 `Footer[] | undefined` 对 `FooterTransformer | undefined` 报错的困惑；其更复杂完整示例不是上面测试 fixture，不能把两个案例拼为同一次事故或声称该诊断一定能指出所有推断根因。

## Translator 是另一完整对照，不是证明

固定 [mattpocock/ts-error-translator@efecb9b234408eacd30020c1f275708577cdd12a](https://github.com/mattpocock/ts-error-translator/tree/efecb9b234408eacd30020c1f275708577cdd12a)，2024-06-10 HEAD；[2322 模板](https://github.com/mattpocock/ts-error-translator/blob/efecb9b234408eacd30020c1f275708577cdd12a/packages/engine/errors/2322.md) 把顶层 source/expected 类型重写为通俗语句，[引擎测试](https://github.com/mattpocock/ts-error-translator/blob/efecb9b234408eacd30020c1f275708577cdd12a/packages/engine/src/__tests__/engine.test.ts) 含多条 property incompatibility 解析但非上述完整 callback pair 的翻译 golden。其 [VS Code 子目录 LICENSE](https://github.com/mattpocock/ts-error-translator/blob/efecb9b234408eacd30020c1f275708577cdd12a/apps/vscode/LICENSE) 为 MIT；固定仓库树仅发现此许可文件，未确认 `packages/engine` 的整体许可，故只作链接研究、不复制 engine。没有执行 translator，不能将顶层模板推断为完整嵌套诊断的最终显示或误称它丢失信息。

## 取舍

可能的固定 authored 页面可并列四层返回类型、leaf mismatch、源码和原始完整诊断，但 native baseline 已按相同层次列出；没有已核对的 translator/native 完整结果或具体阅读缺口，另画层级只是重复。若未来接到真实交接，保留整个诊断和版本/flags、查询变量位置、明确是结构 assignability 而非运行行为，并实际对比同输入完整 native 与 translator，必要时再用现有表/SourceCard 把差异定位到证据，不写编译器、诊断解析器或类型求解器。本轮没有安装、执行、浏览器或仓库写入。

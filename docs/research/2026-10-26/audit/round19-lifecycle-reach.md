# #244 生命周期装饰 rail 与 Reach：当前源码审计

2026-10-28，只读；基线 `origin/dev@d5d979493bba650b3995836afd379cd249f2d0dd`。**结论：旧版装饰 rail 在当前 lifecycle v3 生成器里已不存在，不能据旧 issue 宣称当前仍有该行为缺陷；Reach 结合 focus 的覆盖仍缺直接浏览器证据。** 不建议为旧 rail 新建实现或为此重复渲染。已合并 #253 修复旧 renderer 三类交互，#244 后续验收另要求 Reach；历史行为不可仅凭当前静态源码反推。

- [#244](https://github.com/tt-a1i/archify/issues/244) 的 schema-v1 六状态 fixture 中只有一条显式 `reviewing → blocked` transition；旧版背景 rail 会在 hover、relationship preview、focus 时穿过变暗节点，看似不存在的直接边。验收追加 #243 两状态 focus/reach，要求不把装饰当关系、恢复 READ 和保留 export。 [#253](https://github.com/tt-a1i/archify/pull/253) merged，提交 `c5acbc6d238733cdd6d33d77e2e290d52adf9f56` 是当前 dev 祖先；其记录包含三种交互的浏览器测试、截图与 1440×900 light/dark，不含显式 Reach 验收。旧证据不能冒称新 dev 测试。
- 当前 [lifecycle renderer](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/archify/renderers/lifecycle/render-lifecycle.mjs#L1109-L1125) 为 `main-path-v3`，输出 frame、声明 transitions、junction 和 states，没有输出 `data-lifecycle-rail`；全仓当前非 HTML 源代码中无该 marker 的 renderer，只有 viewer CSS 的旧兼容选择器；已检索全部 tracked HTML 的 `<path ... data-lifecycle-rail=`，无命中。不能据此断言用户保存的历史 HTML 不存在 rail。
- 当前 [focus.js](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/viewer/focus.js#L186-L202) 进入 Reach 要求一个 activeId 并设置 `data-reach-active`，不会清除 focus；单节点 focus 设置 `data-focus-active`，clear 才移除。CSS 的 `[data-focus-active] [data-lifecycle-rail]` 隐藏标记 rail；没有单独 `[data-reach-active] [data-lifecycle-rail]` 规则。源码因此支持“正常 Reach 仍保有 focus 时旧 marker 被隐藏”的推论，而不是实际 Chrome 证明；对于未标记的旧自定义 SVG 不作结论。
- 当前 [authored-reachability.test.mjs](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/test/authored-reachability.test.mjs) 用包括 lifecycle 的五例检查功能存在、纯 BFS、导出清理源码；不检查 lifecycle rail 的实际 computed opacity。旧 `test/lifecycle-rail-browser.test.mjs` 在当前 dev 不存在。未执行测试。

## 最小只读交互核对建议

现成 [gallery artifact](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/docs/gallery/artifacts/agent-run.lifecycle.html) 与 [输入](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/archify/examples/agent-run.lifecycle.json) 是 v3（不是原 #244 v1 fixture）。打开已有 HTML，选择 `reviewing`，点击 Passport Downstream：按显式图从 reviewing 可达 completed、blocked，blocked 返回 reviewing 并指向 expired；实际完整 reachable 集应以该 JSON transitions 和原生计算为准。检查 SVG 的 `data-focus-active`、`data-reach-active=downstream`，命中节点/真实声明边的高亮，及没有横跨多状态的未标记装饰 rail；清 Reach 与关闭 focus 后普通视图恢复。此检查仅限已存在 artifact 的对应版本，不证明旧 #244 fixture 或所有自定义 SVG。若需对旧历史工件验证，先取得 #253 exact-head 既有工件且确认其 provenance，再针对被标记的 rail 比较 computed opacity 与状态，不把 v3 无 rail 当旧版实测。

本轮未 render、运行测试、浏览器或改产品。`/tmp/archify-round19-needs.md` 已更正 #648/#611 的误引用来自 root 分派，而非用户直接表述；实际长描述 issue 是 #1112。

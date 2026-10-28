# CUE defaults：从原生观察到阅读顺序候选

2026-10-28。初始 source-only 调研因缺同输入原生结果而 defer；随后完成 Playground 观察与隔离内容实验，故该初始判断已被后续证据更新。已推送 [`codex/lab-cue-defaults@a1ad749d`](https://github.com/tt-a1i/archify/tree/a1ad749dd11a1c650211f86e3c3dc8ea0c2c9c59/experiments/cue-defaults)，通过 `ls-remote` 核对固定 head `a1ad749dd11a1c650211f86e3c3dc8ea0c2c9c59`。实验基于冻结的 Archify `d5d979493bba650b3995836afd379cd249f2d0dd`，不冒称后续 dev 已整合。

真实 [CUE #1449](https://github.com/cue-lang/cue/issues/1449) 询问默认值经引用与另一默认值组合后为何仍为 disjunction，维护者解释对称组合及分离约束/默认的办法。协调人另在 Playground 对完整原始 issue 输入做了 eval 观察；该上游投稿的完整源码与截图保留在本机，不复制到此报告。它是历史自然问题的观察，不等于当前生产系统或 CLI 复现。

随后使用独立原创 365 字节教学输入，实际在 Playground 以 CUE 输入/输出分别观察 `def`、`eval`、`export`，保存完整 DOM 文本、截图与哈希。`eval` 中直接引用的两个不同偏好未形成唯一默认，但 string 值域仍存在；显式 `audit` 可用，交换 operands 同样未选定；该例的插值为具体 `detail`。`export` 显示两个 incomplete-value 诊断。该现象不能推广成插值总是可用或右侧覆盖左侧。完整原始包、独立语义和字节复核在候选的 `native/` 与 `evidence/`。

Playground UI 显示 v0.17.0；站点 issue 链接提供 [site `957f004`](https://github.com/cue-lang/cuelang.org/tree/957f004c34a71982b5773e86126d9df2a5c6d48f)，语义另核 [CUE spec `0fc639b`](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md)。可见标签不证明 WASM 字节或精确部署 commit；Playground 用 Go API/WASM，不是 CLI，无 CLI 退出码。两仓库均 Apache-2.0；[site 许可](https://github.com/cue-lang/cuelang.org/blob/957f004c34a71982b5773e86126d9df2a5c6d48f/LICENSE)、[CUE 许可](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/LICENSE)。[issue #3751](https://github.com/cue-lang/cue/issues/3751) 是可能的未来默认值设计讨论，不代表现有行为已改变。

候选有两份相同事实的 Archify Explainer：证据先行与问题先行，差别限于面板顺序，不是原生 Playground UI 复制品。初稿与修订稿均保留；两版 finalize 的 validate/deliver/check 通过，browser gate 未运行，保存写作提示。独立语义/内容复核未发现范围内阻塞；后续实际浏览器截图和动作只能证明被观察的呈现，不能证明阅读收益。重放 HTML 字节不同，见候选 evidence 的差异账目；不可称 byte reproducible。未有独立读者试验或人类验收，不宣称速度或理解提升，也未增加 CUE evaluator、parser 或共享运行时。

# Round 29：来源与状态审计

2026-10-28。研究中心启动时远端 head 清单为 316 条；本批后续 dev 移至 `6ca6a5c8`，CUE 实验固定产品基线仍为 `d5d979493bba650b3995836afd379cd249f2d0dd`。远端清单只是当时快照，不证明覆盖所有同义工作。候选 `codex/lab-cue-defaults` 已由协调人推送并核对 head `a1ad749dd11a1c650211f86e3c3dc8ea0c2c9c59`；本审计不将其称为已合并或当前 dev 行为。

- [DeviceTree 调查](../scouts/devicetree-reading-round29.md)：真实 issue 与官方合成测试是两份不同输入；官方 `test_duplicate_nodes` 的完整期望是 dtlib 的字符串断言，不是本轮执行或 Zephyr 整体构建。日志、最终 DTS、bindings、驱动配置及实际硬件是不同证据层。Zephyr 特定父子 status 合同有固定来源，不扩称其他 consumer。
- [CUE 调查与候选](../scouts/cue-defaults-round29.md)：原 issue 输入的 Playground eval 曾被实际观察；公开实验只分发原创 365 字节教学输入与完整三个模式输出，未复制未经确认许可的 issue 代码。Playground 标识 v0.17.0 不提供 WASM 字节证明；没有 CLI 出错码。初始 defer 为当时缺证据的结论，不能抹去后续实际观察与两版候选，也不能把候选理解收益写成已证明。
- CUE 的 `native-packet-review` 逐项核对输入与输出 DOM 行、哈希和截图；`semantic-review` 将 string 有效域、默认偏好、插值区分，后者没有验证“插值遇到 audit”负例。`final-content-review` 检查两版相同事实和不同顺序；builder 检查原始输入/输出字节后才创建新目录。重放的 HTML hash 与已存版本不同，候选 `replay-byte-differences.json` 为差异证据，不声称逐字节复现。
- 独立 Tree 表达审计发现当前 schema 只能以 parent 表示包含，缺任意属性或 cross-reference 边；sublabel 是作者文字，不能当已解析状态或 phandle。现有 unmerged tree-role 工作与 per-document 标签替换不能冒充新 dev 的语义修复，因此暂不从 DeviceTree 输入推导新模型。
- 对 Explainer 主题/样式/菜单的源码审计未找到所拟 selected/effective 状态与 ARIA 同义字段不一致：样式恢复经同一 setter；System 为选中策略而 light/dark 是有效色；菜单 hidden 与 aria-expanded 一起设置。这是对冻结源码的静态核查，不是完整键盘、辅助技术或真实用户验收，不由外部工具缺陷推定 Archify 缺陷。

此文件与两份 scout 是对既有输入的整理；没有新执行、安装、浏览器操作或产品变更。CUE 最终产物可视观察、构建和后续 Git 状态以候选分支及协调人最终记录为准。

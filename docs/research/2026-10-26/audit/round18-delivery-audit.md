# Batch 18 独立交付只读审计

**保存证据范围内无阻塞项。** 未重跑浏览器、测试、安装或生成，未修改仓库；结果为核对时快照，不代替视觉或产品验收。

- Panel 清单 66 项、Task-view 清单 26 项的文件、字节和 SHA-256 全匹配，无未列文件。Panel 两个 raw/public 清单分别 39、9 条，原始及公开哈希和声明的脱敏转换一致。
- 四份 finalize 与 delivery 的输入和 HTML hash 均匹配，validate/deliver/check/browser-check 四 gate 均 pass 且 browser-check requested/ran；两组主 SVG 逐字节相同。固定 dev 与 PR head 的 Git 左右差异独立查询为 38/16，未合并。
- Panel 20 条 observation、10 PNG，图片尺寸与对应 viewport 相符。controlled comparison 的 panel、可见边界、scroll 和控件 centerHit 均与原 observation 一致；scroll 0 和 320 的纵向值、短图裁切和 6 条 Escape 返回 launcher 均符合 README，横向停靠不同已披露。初始不等 scroll 不作公平配对。未亲自复验截图画面。
- Task-view 7 PNG：前 3 张 1440×900、稳定展开及其后 4 张 1291×762。稳定 state 记录 3 节点，收起 2，Tests 选中后 reload 2 节点且 Code 选中。初次展开保留为瞬态，不作为稳定布局证据。fixture 与指定本机原文件 SHA-256 相同；两个许可的 SHA-256 和 Git blob 与 provenance 一致。本次并未独立联网校验上游 Git 对象。
- reload 原始和公开 state 的 SHA-256、字节数匹配 derivation；逐字段检查除 `versionText` 从 3 项缩减到 1 个 Generated 页脚外，其原始字段均保留，公开副本新增解释 note。未将 2.2 MB script 匹配内容纳入交付。README 正确说明这是选择器误匹配，不把上游历史测试、匹配输入下的收益或视觉/AT 结论冒充本轮验证。
- 指定两个 README 和同目录 round18 scout 的相对 Markdown 链接均存在。证据位于本机临时 raw 路径的部分不保证永久可用。

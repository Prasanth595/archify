# Round 14 只读交付审计

检查范围为 `audit/round14-waterfall-native`、`audit/round14-dedup.json` 和三个指定 scout；未重跑测试、浏览器、渲染或研究，未修改仓库。

- `manifest.json` 所列 23 个文件均存在，SHA-256 和字节数一致；3 张 PNG 的签名及 1440×900 尺寸一致。`input.json` 与 d5d97949 的 `archify/examples/example-rebuild.waterfall.json` Git blob 字节完全一致。delivery receipt 的 input 和 HTML SHA-256 均匹配实际文件。
- 对输入 25 个 span 按父节点继承 service 独立计算：worker 1 / 2 / 3 分别 9 / 6 / 9，未归属 1；与 25 个 UI observation、HTML 节点 ID、kind、service、context 一致。Finder 所记录的 9 个 ID 与源输入 effective worker 1 的 ID 集合完全一致。Lens 记录 database 9、frontend 9、backend 6、external 1，与节点统计一致；记录的 bridge 数为 0。核对了保存的脚本和 JSON，未重新观察 GUI。
- 指定 Markdown 中所有相对链接均存在。native README 清楚称重渲染已保存数据而非新性能测量，称无候选修复；Radar/Outline 明确为仅源码审计，Finder/Passport/Lens 才是已保存的 UI 观察。独立 Browser.getVersion 失败明确写为元数据查询不支持，没有被算为产品测试失败。
- Waterfall scout 初始段落和历史正文使用“授权实验”“一旦范围决定才运行”等表达，但末尾 Root 本轮结论明确已有隔离实验授权、无需再次审批。两处可同时理解为历史 scout 与 root 取舍，但正文仍可能让读者误以为须重新请求权限；建议将正文未来条件表述为设计范围决策并维持 Root 结论。未发现 Profile / reverse-debugger 文档声称本轮实现修复或新性能测量。

上述结论反映审计时快照；root 并行编辑后需要重新核对受修改文件。


Root处理：正文权限措辞已统一改为价值/兼容决策条件，已有研究授权保持有效，不要求用户再次确认。原生输入、HTML、23项manifest及3张截图未改。

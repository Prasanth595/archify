# Batch 19 原生证据只读审计

**一处待补证或收窄的观察声明：** README 称 restored-neutral 的 `data-intent-trace-active=reviewing`。保存的 `lifecycle/restored-neutral.state.json` 及对应采集脚本未读取此属性，仅有 focus/reach/hover/selected、activeElement 和节点 group opacity；目录及 harness 文本中也未找到该属性的独立观测记录。节点键盘焦点确实仍在 `node-reviewing`，因此不能仅凭 group opacity 或 focus/reach 清除断言全部预览结束；但目前保存的证据不足以确认所述属性值。若另有原始观察应补入并绑定，否则将其表述为未确认，而非已记录属性。最终 `restored-unfocused.state.json` 确实记录 BODY 焦点、SVG 无 focus/reach/intent active 属性。

其余核验：

- `round19-native/manifest.json` 62 项的路径、SHA-256、字节均匹配，10 PNG 均为 1440×900，目录无未列文件。`round19-copy-map.json` 67 项来源和公开文件全部存在、字节及 SHA 匹配，均为原字节；15 个 JSON 可解析，README 及 round19 审计文档相对链接存在。
- VM 三个 observation 分别包含固定案例各步的输入和输出，按本例无空格标签值忽略空白后与 `cases.json` 预期一致；不是对任意标签值的通用比较。首例稳定轮询最后三次输出相同、loading 数组为空，前两次保留前一个案例及 spinner；过渡截图未作为稳定结果。UI 记录版本 `v1.155.0-enterprise-cluster`，README 明确部署 commit 未知，未把线上部署等同固定源码。
- Lifecycle HTML 和 JSON 与 d5 Git blob 原字节相同；downstream observation 有 reviewing/completed/blocked/expired 四节点及四组不同有向边（每组有重复 SVG 成员），reach-cleared 后 reach 为空。最终标题操作后状态记录 BODY，无 active 属性；不从 group opacity 推断完整图元可见。
- 本次未运行页面、工具或测试，未重新检查截图；保留的 10 张图的视觉检查属于 root。当前结果不证明自然用户收益、移动/AT、旧版 rail 全范围或线上 commit。

## 后续处理复核

root 已修改 native README：删除未存证的具体 intent 属性值，明确 neutral 采集没有保存 intent 属性，不能从 focus/reach/hover 和 group opacity 推断整图恢复；保留截图中节点键盘预览的观察。更新后的 README SHA-256 和字节数与 manifest 一致。原始发现保留于上文；此项已按收窄声明处理。本次仅复核该段与 README manifest 项，未重跑浏览器、测试或完整审计。

# LikeC4 原生搜索观察包

[结论、版本边界与完整失败账目](../../scouts/search-reveal-native-round38.md)。这是未完成稳定导航验收的研究记录，不是通过的浏览器测试包或 Archify 实现。

- `sources/`：24 个完整源码、模型和许可文件，含上游 Git blob/长度/SHA-256 核对记录。当前代码、旧修复和模板分目录保存。
- `heads.json`、`issue.json`、`dedup.json`：有界远程查重、来源身份与真实问题。
- `browser/`：19 个实际脚本及日志，11 张 PNG；保留 stale ref、早期淡入截图、等待谓词错误和未导航结果。
- `browser/17-observation.json`：第 16 次指针对照的变更去重 DOM 观察；8 秒窗口中只有一个不同的图状态。
- `browser/19-timeline.json`：Enter 激活后的原始 DOM 样本；仅观察 DOM 和位置，没有读取图 actor 内部状态或模拟目标页面。

人工复查步骤：

1. 打开官方 README 的 https://template.likec4.dev/view/index ，等待 System Landscape。
2. 用搜索入口输入 Checkout Service；选择 Elements 中同名元素，检查它显示的视图数量。
3. 在 Select view 中选择 Online Boutique System；分别记录新 URL、目标节点是否在视口、临时高亮和随后状态。
4. 若未跳转，保存现状和版本，不把搜索关闭视为导航成功。使用页面当下的真实控件；不要盲目重放旧 ref。
5. 只有确认聚焦已经发生，才能验证 Escape 是否退出该状态；要判断自动退焦，需要连续时序证据。

截图为 1440×900、同一 Ego 研究空间；只读查询曾返回工具默认的 1291×762，中间动作尺寸不能一概当作固定。官方站点可能更新；脚本 URL 不等于部署 SHA，源码中的 3000ms 不等于本次实测时长。没有安装依赖、重建模型、测试 mobile/无障碍或比较读者速度。PNG/哈希检查只验证归档，不把交互失败变为通过。

# 检查过程中的失误

首次 Finder 点击实际进入 focus.js，但等待了不存在的 #semantic-passport，10秒后超时；没有把它记作产品失败。读回DOM确认正确卡片元数据在 #focus-passport-meta，随后据实际 #focus-id 与 #focus-kind 等待并截图。

首次 Story 命令错用 inspect，CLI返回 story/invalid-input；根据诊断改为公开 story scan，成功读取结构角色。两次机器输出均保留。

第一组 leaf 截图的 baseline 使用点击、candidate 使用 Enter，且候选相机尚未完全稳定，不能比较几何位移或焦点边框。后续 paired 图片两臂都从新页面经 Finder 输入 + Enter，再等待目标屏幕矩形连续8帧稳定；保留两组，只有 paired 用于匹配状态比较。

首轮 paired 脚本还在运行时，root 误启动另一段同页导航，前者以 Inspected target navigated or closed 结束。保留 interrupted-* 两张早期图片，排除其验收身份；第二段独立状态检查正常结束。确认两个句柄均终止后，重新串行执行两臂匹配采集，不把导航冲突当产品故障。

早期旧Lens链接截图的PNG实际为646×381，与设定1440×900不符；保留为early-legacy-lens-dark.png并排除验收。后续单独串行重拍实际1440×900，DOM证实旧hash选择tree-leaf；链接恢复后面板默认收起，画面只证明选中高亮，不宣称面板文案可见。

canonical test:focus wrapper拒绝不在其inventory中的semantic-lens.test.mjs，整条命令未运行所选测试；保留拒绝日志，改用同一Node22的node --test执行明确文件，不修改runner。

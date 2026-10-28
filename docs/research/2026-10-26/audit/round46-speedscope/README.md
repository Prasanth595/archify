# 第 46 批：Speedscope 原生窗口、分母与递归证据

2026-10-29（Asia/Shanghai）。本包补充 [原 scout](../../scouts/profile-window-reading.md) 未运行的原生基线；没有新增 Archify importer 或产品实现。详细取舍见 [报告](../../scouts/speedscope-native-round46.md)。

## 固定输入与来源

- Speedscope / Jamie Wong，固定提交 `fe804e6281cf847713448c2c3e0faec3e1f62b2d`，[MIT](source/LICENSE)。12 份原始来源的 Git blob、字节数、SHA-256 见 [sources.json](sources.json)；未修改源文件内容。
- 输入 [Firefox 61 recursion.json](source/sample/profiles/Firefox/61/recursion.json) 是上游公开历史 fixture，114,358 bytes，SHA-256 `3942ad9a93a5a191bf64afb4f1c849c625de94c90dc3bb710ba01a0010a36451`。其中路径是公开样本的原始字段，不代表本机执行。单线程 GeckoMain、15 条采样记录。
- 实际操作 [speedscope.app](https://www.speedscope.app/)；原生导出自报 `speedscope@1.25.0`。部署提交未知，不能与固定源码 SHA 画等号。
- [remote-state.json](remote-state.json) 保存本批窄范围排重及上游 #39 / #366 状态，333 个 Archify 远程 heads 在 [remote-heads.tsv](remote-heads.tsv)。这是当时快照，不是持续状态或穷尽搜索。

## 手工复现

1. 打开上述网站，Import 选择本包原始 Firefox JSON。观察 Time Order 全范围，再切到 Sandwich 记录五个函数的 Total / Self。
2. 回到 Time Order，双击左侧短的 main 栈块使其适合视口，再按两次 `+`。本次 1440×900 画面轴刻度为约 2.00–4.60ms；这不是导出的精确窗口边界。
3. 切回 Sandwich 比较五行。此操作只缩放画面，未执行裁剪。
4. 切 Left Heavy，按 `0` 重置视口，按 `r` 折叠递归。比较形状，再切 Sandwich 比较五行。
5. Export；本次在折叠前后下载两份文件，字节一致。恢复 `r`，在 Sandwich 点 alpha，查看 Callers / Callees。

[browser/](browser/) 保留 12 份实际 Ego 脚本及完整日志。脚本写死本机绝对路径及当时拥有的 space 3 / p1，是操作记录；跨环境复用须改为自己拥有的页面、路径并重新观察 DOM，不能照抄去控制其他人的页面。真正成功缩放的是 08 / 09，折叠是 11；10 是执行前语法错误，修正另存而未覆盖失败记录。

## 本地重算与完整性检查

在包目录运行（仅 Python 标准库，无安装）：

```sh
python3 analyse.py
python3 verify.py
```

`analyse.py` 只分析这份已导出的单 profile，逐区间计算 self、同一区间去重后的 frame total，以及错误地累加递归出现层数的反例；不是通用 importer。两次运行结果字节一致并与 [analysis.json](analysis.json) 一致。它同时核对两份导出相同、三个 Sandwich DOM 表相同；视口是否缩小必须看实拍，不能只靠 DOM 相等证明。

[image-audit.json](image-audit.json) 明确 9 张有效且已人工查看的截图，以及 6 张早期无效缩放尝试的留档。04 / 06 / 07 的拖动或原始鼠标双击未得到缩小画面；07 的文件名含 verified、main-fit、narrow 也不构成成功证据。05 仅检查前次状态。固定 minimap 源码说明视口内部拖动用于平移；全范围平移不能产生裁剪。没有诊断原始鼠标双击为何未成功。

未重新运行样本程序、采集 profiler、运行上游单测、执行 PR #366、复现 #512 原始输入或测试读者收益。源测试快照是参考资料，不是本机测试成绩。未证明空栈时间等于 CPU idle，也未证明重建的事件就是实测调用入口/退出。未做网络传输审计。

[checks.json](checks.json)记录链接和空白检查：自写报告与分析脚本的 scoped check 通过；全量检查报告原始日志 EOF 空行及上游 README 尾随空白，按原字节保留，没有宣称全量空白检查通过。

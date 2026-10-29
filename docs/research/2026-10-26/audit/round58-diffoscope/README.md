# diffoscope 历史 HTML：清单、成员内容与省略范围

2026-10-29，第 58 批。补查既有 artifact-diff 候选，没有实现新图或 importer。输入是 [官网链接的 HTTPS Everywhere 5.0.6 / 5.0.7 报告](https://diffoscope.org/examples/https-everywhere-5.0.6_vs_5.0.7.html)的原字节保存 [native.html](native.html)：1117354 bytes，SHA-256 `f3ee8fc0561a2082901e4fbcf6136e5ac1a30712150f0afeae4e16154c511c30`。没有重跑 diffoscope、取得原始 XPI，或执行/安装扩展。

## 本次确认的阅读边界

| 观察位置 | 保存报告中的事实 | 不能推出的结论 |
| --- | --- | --- |
| zipinfo 第 5 行 | about.xul 两边打印的清单行完全相同，3421 bytes，行样式 diffunmodified | 不能推出整个成员内容相同，也不代表所有 ZIP 元数据都相同 |
| about.xul 第 41 行 | 单独的成员文本差异为 label 中的 5.0.6 → 5.0.7 | 是报告展示的内容差异，不是本轮重新比较原始 XPI 的结果 |
| SQLite 转换层 | 四对 lines removed 标记：15462/15387、386/390、31967/32027、9300/9314 | 这些是报告省略的差异行计数，不能当作四次文件删除，也不能从标记展开被省略文本 |

原生报告有 8 个 diffheader，其中包含外层比较、清单、成员与 SQLite dump 子层。所有 marker 行没有链接、按钮、input 或 details；整页无 script、button。没有声称这些数字是唯一变化量、删除条目数、受影响用户数或构建原因。

## 实际页面检查

使用 Ego 空间 3 / p1 打开字节未改的本机副本，当前视口为 1279×784，页面高 17609px；不要沿用前批的视口尺寸。

- [清单实拍](browser/01-listing.png)与[初始 DOM](browser/initial-dom.json)：观察 3421 bytes 的未修改清单行和报告层级。
- [成员实拍](browser/02-member-content.png)与[成员 DOM](browser/member-dom.json)：实际 hover 显示 ¶，点击后 hash 为 `#chrome/content/about.xul`，正文显示第 41 行版本差异。标题位于视口顶边，未做窄屏或完整视觉验收。
- [省略行实拍](browser/03-omitted-lines.png)与[SQLite DOM](browser/sql-dom.json)：SQLite 子层 ¶ 点击成功，hash 包含完整成员及转换命令路径；第一对省略标记位于视口内。后续按 marker hover 发生稳定性超时，保留 [失败日志](browser/03-sql.log)。[失败后观察](browser/04-observe-failure.log)确认 hash 已正确、标记已在视口内，因此下一步只记录 DOM 和截图，没有盲目重复操作。

三张 PNG 均实际查看。选择器自动滚到目标只是测试操作，不算原生报告拥有目录、搜索或“一步发现问题”的功能；实际验证的是已有锚点可定位到成员/转换层。没有阅读时间、正确率、键盘或辅助技术测试。服务已停止，p1 回到 about:blank。

## 来源与版本身份

官网当时列出最新发布 335，但这个报告页脚写的是 **diffoscope 28**；不将旧报告能力推广到当前版本。[镜像 tag 28](https://github.com/aparcar/diffoscope/tree/fce0e78ebb40bebd40ca1c346d32abaad6202572)固定为 fce0e78e，源码目录和页脚仍使用 debbindiff，尽管 VERSION 为 28。名称不一致意味着**不能仅凭版本文字证明这个 HTML 由该 commit 生成**。

保留的 [difference.py](source/debbindiff/difference.py) L35、L88–123 显示相邻同方向差异块达到 50 行后进入 skip_block，以计数标记代替后续行；[html.py](source/debbindiff/presenters/html.py) L320、L348–357 避免把双侧相同计数的省略标记归为未修改，并推进两侧行号。它们解释了该历史标记格式，属于固定源码证据，没有运行此 parser，更没有证明网站报告的精确构建来源。完整保存 HTML 与完整、未省略的原始差异不是同一件事。

源代码为 GPL-3.0-or-later，保留原头部和 [COPYING](source/COPYING)。报告中 HTTPS Everywhere 内容归 EFF、Mike Perry、Peter Eckersley 等原作者；其 [5.0.7 标签](https://github.com/EFForg/https-everywhere/tree/e78fe5d803208bf6c877dc675cdb4f1b719e7519)的 [原 LICENSE.txt](source/https-everywhere-LICENSE.txt)列明整体 GPL v3+ 及组件许可，原样保存，不用 Archify 许可覆盖它。五份来源均核对 [Git blob](source/blobs.json)。最初 LICENSE / diffoscope 目录查询失败后按 tree 找到实际路径，见 [context.json](context.json)。源码复制时一次末尾空行归一化造成 __init__.py blob 不符，已从原响应恢复；最终五份全部逐字一致。

## 复现和验证

无需安装 diffoscope。已有 Python 可验证离线材料并提供本地页面：

```sh
python3 docs/research/2026-10-26/audit/round58-diffoscope/verify.py
python3 -m http.server 8878 --bind 127.0.0.1 --directory docs/research/2026-10-26/audit/round58-diffoscope
```

打开 /native.html，或加上原生成员片段 /native.html#chrome/content/about.xul。源码及 HTML 不被执行为 Python，也不会安装扩展。浏览器脚本是当时空间 3 的历史操作记录，不应在他人的同号空间直接重放。[verification.json](verification.json)检查来源字节、HTML 身份、清单/正文记录、四对省略数、PNG 尺寸与本地链接；[manifest.json](manifest.json)登记文件摘要，排除自身。为核对阅读记录，verify 只在比较副本中移除 U+200B 并把空格显示符号 · 还原为空格；没有改动原始 HTML。不是上游或产品测试，也没有 hosted CI 结论。

## 对候选的影响

开工刷新 [333 条远程 head](remote-heads.tsv)，与上批相比只有上批交付的 conflict-explanation 和 research hub 前进；按 diffoscope 查询 Archify issue / PR 均为零，有界查询不覆盖全部同义问题。既有 artifact-diff 和 OCI 研究已对照，没有把它们当新项目。

**继续暂缓额外表格/图与 importer。** 原生成员/转换层锚点和内容差异已经存在；仅根据 listing 行或灰色样式制作文件级“未改”摘要会误导，当前 HTML 未提供展开省略行的控件。下一项有效证据应是固定完整输入、明确截断状态并实际生成的原生报告，再评估同事实阅读任务。本批没有补齐旧 test1.tar/test2.tar 的原生运行，也没有证明额外摘要值得维护。

只修改研究记录与归档，未改共享 renderer/schema/Skill/runtime。Codex 完成来源核对、页面操作和检查，未声称人类验收。只推研究分支，无新 PR、合并、发布或安装。

[空白检查](whitespace-check.json)保留全量 diff-check 的九条提示，来自原始 HTML、原始浏览器日志及上游 __init__.py 的空行/空格。排除这些冻结原件后的 authored 范围通过；没有改写源文件来消除提示。

# 第 36 批：文件大小与静态 VM 范围

2026-10-29。开始前和推送前分别核对 331 条远程 heads；相较第 35 批前快照，只新增 schema-annotations 并更新研究总账。遵循最新要求，只推远程分支，不创建 PR。

## 从初步线索到具体阅读问题

上批 Bloaty 只完成初读。本轮重新核对 [google/bloaty@f1a83e63f36beb628dcf022e1201a2eb391a22a6](https://github.com/google/bloaty/tree/f1a83e63f36beb628dcf022e1201a2eb391a22a6)，HEAD 未变，Apache 2.0。读取完整工作原理、README、Mach-O 与 RangeMap 源码和许可；五份文件均经 Git blob / 长度 / SHA-256 核对。源码 Copyright 2016 Google Inc. All Rights Reserved.，保留 Bloaty 作者归属。

关键机制是 [Mach-O ParseSegment](https://github.com/google/bloaty/blob/f1a83e63f36beb628dcf022e1201a2eb391a22a6/src/macho.cc#L305-L361)：maxprot 为 NONE 的段只记录文件范围，零填充节的文件长度为 0。Bloaty 的文件 / VM 两种数字已经原生区分，不需要再包一层通用表格导入器。

本机已有 Apple 工具给出了更具体的阅读问题：原创 `zero-1m` 可执行文件仅 16,888 B，但 `size -m` 的 total 为 4,296,048,640 B，其中包含 maxprot=0、initprot=0、filesize=0 的 4 GiB `__PAGEZERO`。排除这一项后，三个段的 vmsize 合计 1,081,344 B；它仍是静态元数据，不是 RSS。

这个差异区别于旧 retained-size 的支配关系，也区别于 byte-views 对同一 bit 的重读。保留为固定内容实验：帮助读者先识别数字口径，再看四例对照和完整段表。没有新公共 Viewer、schema、二进制 parser 或内存采样器。

## 原生证据

四份原创三行 C 输入，长度 4,096 / 1,048,576，首个初值 0 / 1。Apple clang 17.0.0，macOS 26.7.2 arm64；两个新建临时目录各运行 23 条记录命令，含编译及 size / otool / nm / file。没有执行产出的程序，也没有安装、编译或运行 Bloaty。

| 输入 | 文件长度 B | __DATA vmsize B | __DATA filesize B |
| --- | ---: | ---: | ---: |
| zero-4k | 16,888 | 16,384 | 0 |
| zero-1m | 16,888 | 1,048,576 | 0 |
| data-4k | 33,400 | 16,384 | 16,384 |
| data-1m | 1,073,656 | 1,048,576 | 1,048,576 |

两轮四个二进制哈希一致，46 对 stdout / stderr 逐字一致。零初始化实际节名为 `__common`、类型为 `S_ZEROFILL`；类型常量另与已安装 Apple SDK header 核对。没有把 Bloaty 源码推导伪称为其运行输出，也没有从静态尺寸推断实际驻留内存或删除收益。

## 已交付与维护边界

- 独立分支 [`codex/lab-binary-size-domains`](https://github.com/tt-a1i/archify/tree/codex/lab-binary-size-domains)，本地 / 远程 readback 均为 `e005965d931c850c5eb2e027970ff95604e7da1f`，工作区干净；基线 `dev@847146aeb93b492592adb78dc220f57e4a8b4636`。
- [固定版本说明、输入、复现脚本与全部证据](https://github.com/tt-a1i/archify/tree/e005965d931c850c5eb2e027970ff95604e7da1f/experiments/binary-size-domains)。171 个 manifest 条目哈希复核通过。
- [真实原生图](https://github.com/tt-a1i/archify/blob/e005965d931c850c5eb2e027970ff95604e7da1f/experiments/binary-size-domains/evidence/final-native-modal.png)、[四例和完整段表](https://github.com/tt-a1i/archify/blob/e005965d931c850c5eb2e027970ff95604e7da1f/experiments/binary-size-domains/evidence/final-tables-dark.png)等 13 张 PNG 已逐张查看。原文包装与解释页使用同一主结论和完整四例，不把包装称为 Bloaty UI。
- 最终 Explainer 三项静态检查通过，browser-check 未运行；保留一条必要限定语的写作建议。独立原生图四项检查通过，含 Chrome browser-check。Ego 实际操作验证五步、结束、原生入口、主题、面板导航、checkbox、原文导航与完整命令展开。
- 1440×900 桌面无页面级横向溢出；390×844 正文宽度为 390，两张表局部滚动。窄屏图预览文字小、原生图右侧裁切，记录为限制，不算完整移动端验收。
- 首稿长标签压成一行；最终把数值与说明分行并缩短纵向间距，六节点、五关系及端点不变。首稿输入 / HTML / 图片完整保留。第二次原生检查因旧 artifact 回执归属冲突失败；归档旧回执后同一修订第三次全通过，没有降低校验。
- 100 条原始上游 / HTML / 原生及浏览器日志 whitespace 提示完整存档；作者 Python、JSON 和说明的 scoped 检查通过。依赖锁文件相同，临时链接提交前移除；没有安装。

Bloaty issue / PR 有界关键词查询各 0，不能据此断言全库没有概念重叠。未运行完整产品库存、跨平台 / 全浏览器 CI、RSS 采样、视频导出或人类阅读试验；零共享运行时代码，不重建未改的 ZIP / 图库。不创建 PR，不合并、发布、部署或安装。

本批从初读推进为有原生反例和真实产物的桌面内容候选。下一步应寻找真实阅读需求再考虑复用，不因为有一份解释页就开发通用 Bloaty 集成。持续目标保持进行中。

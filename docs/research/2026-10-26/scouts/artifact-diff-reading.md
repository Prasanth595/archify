# 构建产物差异阅读：暂缓实验，先取得完整原生报告

2026-10-28 只读研究。唯一待验证的问题：**同一个归档的不同成员中，哪些变化仅出现在归档列出的元数据，哪些还有成员内容或链接目标的变化？** 这是对一份固定比较结果的阅读问题，不是推断构建原因，也不等于断言整个产物语义相同。当前建议**暂缓制作实验**：已有固定上游输入与逐项测试断言，但没有运行该版本 diffoscope 或取得该输入的完整原生 HTML；因此无法判断 Archify 相比完整报告有无额外价值。

## 去重和边界

历史 `origin/codex/research-lab-20261025` scouts 检索 diffoscope、reproducible build、artifact diff 和 metadata-only，未找到同名问题；检索不保证覆盖所有同义描述。[构建失效研究](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/rebuild-evidence-smalltools.md) 研究检查、执行与 stamp 传播，不是产物字节比较；[origin mapping](https://github.com/tt-a1i/archify/blob/60342aa9e40618aeb7c33bdb8d65889fea3a588e/docs/research/2026-10-25/scouts/round25-origin-mapping-reading.md) 是生成位置到来源的 segment 选择，不是两份归档比较。当前 [OCI whiteout](layer-and-closure-reading.md) 解释下层可见性和同层标记范围；这里的问题是两个固定产物的比较细节，不解释层合并。差异不同并不自动构成值得做的实验。

## 固定来源与已有对照

- [diffoscope 官方说明](https://diffoscope.org/)：递归拆解多种归档及转换格式，提供 text、HTML、重命名模糊匹配及 hexdump fallback；许可 GPL-3.0-or-later。不能把省略 HTML 细节的摘要当原生基线。
- 固定源码样例使用 [aparcar/diffoscope 镜像 b79afa9e56110010f9bf6f7578b379e71400ebc3](https://github.com/aparcar/diffoscope/tree/b79afa9e56110010f9bf6f7578b379e71400ebc3)，提交时间 2026-07-19，**只是固定镜像快照，不是宣称当前官方 release**；[测试文件头](https://github.com/aparcar/diffoscope/blob/b79afa9e56110010f9bf6f7578b379e71400ebc3/tests/comparators/test_tar.py) 标明 GPL-3.0-or-later。完整输入为 [test1.tar](https://github.com/aparcar/diffoscope/blob/b79afa9e56110010f9bf6f7578b379e71400ebc3/tests/data/test1.tar) 与 [test2.tar](https://github.com/aparcar/diffoscope/blob/b79afa9e56110010f9bf6f7578b379e71400ebc3/tests/data/test2.tar)。测试断言 `details[0]` 对应完整 [tar listing expected diff](https://github.com/aparcar/diffoscope/blob/b79afa9e56110010f9bf6f7578b379e71400ebc3/tests/data/tar_listing_expected_diff)，`details[1]` 是 `dir/text` 的 [内容 diff](https://github.com/aparcar/diffoscope/blob/b79afa9e56110010f9bf6f7578b379e71400ebc3/tests/data/text_ascii_expected_diff)，`details[2]` 是 `dir/link` 的 [symlink diff](https://github.com/aparcar/diffoscope/blob/b79afa9e56110010f9bf6f7578b379e71400ebc3/tests/data/symlink_expected_diff)。清单中四项时间均变化；text 长度从 446 到 671，link 目标从 `broken` 到 `really-broken`。这是上游测试预期，非本轮执行结果；不能仅凭 listing 变化宣称所有成员内容均相同。
- 真实嵌套情境参考 [diffoci 固定 README](https://github.com/reproducible-containers/diffoci/blob/ae4facc95c11c701819e42e1038a19768c00a230/README.md) 和 [Apache-2.0 许可](https://github.com/reproducible-containers/diffoci/blob/ae4facc95c11c701819e42e1038a19768c00a230/LICENSE)：其示例中 layer 内 `lib/apk/db/scripts.tar` 的 hash 不同，再用 diffoscope 展示成员时间差；`--semantic` 不理解嵌套文件格式。README 输出是作者记录，不是本轮运行，也未提供本轮可固定复跑的两份完整输入。它说明阅读需求可能存在，不构成完整 fixture 或独立收益证明。

## 若继续，先做的可证伪比较

1. 固定一个可运行的官方 diffoscope 版本、依赖与上面完整输入；保留两份 tar hash、环境、退出码、完整 HTML 和文本/JSON 原生输出，检查是否截断、工具缺失或 fallback。上游三个断言是最低预期，不等同完整报告；避免将它们拼成伪造的 native HTML。
2. 在完整 HTML 可直接查阅的前提下，再写一张引用到原始差异的成员表：listing 变化、具体成员内容或链接变化、未知/未报告。保留原生报告所有条目和回跳；不把“只观察到 listing”标成已证明 payload 相同。若只用上述一层 tar，**没有测试嵌套容器阅读**；要声称嵌套价值，须另取得带完整 expected 报告的固定嵌套样例。
3. 用相同输入和问题对照原生完整 HTML 与表格，检查正确答案、遗漏、定位步骤及阅读者反馈；如果 HTML 已清楚回答或表格只能重复它，就停止。不存在实测阅读时间、自然用户需求、重现性修复或真实 build 根因结论。

**价值/成本/影响：** 可能帮助读者区分 listing 中的时间变化与另一个 detail 的内容变化；但 native HTML 已能承载层级细节，新增价值尚未证明。制作静态页面成本较小，维护跨格式分类、fallback、截断及不完整数据的正确性成本很高，因此不提 importer、运行时、通用 schema 或产品改动。本轮无安装、运行 diffoscope、截图、实现或用户验收。


## 第 58 批后续：官方历史报告的实际页面

[保存报告检查](diffoscope-saved-report-round58.md)补充 HTTPS Everywhere 原生 HTML 的三张实拍：相同 zipinfo 清单行仍可对应成员正文变化；SQLite 差异包含不可展开的省略标记。它不是上述固定 tar 对的运行，页脚版本也不能直接绑定精确源码 commit。原生分层锚点已有，仍先取得完整输入及明确省略状态的执行报告，暂不追加图或 importer。

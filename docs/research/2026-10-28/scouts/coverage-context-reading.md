# 覆盖上下文与分支证据的阅读可行性复核

研究日期：2026-10-28。结论：**本轮建议 0 个新实验**。本轮取得完整官方 coverage.py 小 fixture、源码和数据，补上旧报告合成片段的证据缺口；但没有发现优于现有原生报告、且值得给 Archify 再维护一个 reader 的独立用户任务。不是因为项目大小或没有性能数据而拒绝；是因为最直接的 context 展开已存在，而“逐测试走了哪条分支”需要当前导出不存在的数据。

范围：只读 GitHub 官方源码、现有研究和 PR 正文；仅写本报告。未安装、运行、import 上游工具，未生成/打开页面、未浏览器检查、未运行测试、未 commit/push。Python 标准库只抓取完整原 bytes、计算 hash、用 AST 读取字面量、解析 gold HTML 和计数；这些不是上游采集结果的重新执行。遵循 research 与 archify-review 的一手来源、价值/成本/影响要求。

## 排重与证据身份

Hub 本轮读到 HEAD `3ddd3f93911036395158c93f789f677a23e2c5da`；委派基线 dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e` 仅作为本轮给定对照身份，没有据此声称当前远端 dev。读取 gallery manifest 58 项。先按 coverage/testmon/pycobertura/diff-cover/slipcover/lcov/gcov 搜已有 scouts、manifest 和集成材料，再复读 [test-code-evidence](../../2026-10-25/scouts/test-code-evidence-smalltools.md)、[git-architecture](../../2026-10-25/scouts/git-architecture.md)、[round26-coverage-reading](../../2026-10-25/scouts/round26-coverage-reading.md)。coverage.py、testmon、diff_cover 是明确复核，不能当新发现项目计数；SlipCover 补生产器边界。没有使用 stars 排序。

- 旧 `test-code-evidence` 实验 B 已提出 line→test/phase 矩阵，但只有明确标 synthetic 的片段；本报告补真实官方完整样本和不可回答项，不重提同一候选。
- `task-flow-tests` 把人工声明的行为路径与测试源关联；本轮动态记录的 line context 不是人工关联，也不证明 test assertion 有效。
- `lineage`、`sourcepaths`、relationship sources 解决出处/引用，不解决采集上下文；不能只替换标签就新增一项。
- Round26 已有分母/branch 过滤阅读，不再做另一个 LCOV 百分比解释器。

GitHub 当轮读回：[#1103 Atlas](https://github.com/tt-a1i/archify/pull/1103) OPEN `f0be206acbc90eb7c6c6b636030e3eb28963d284`，是静态 file/module dependencies、function complexity 与 Classic handoff，没有 coverage context；[#998 analysis](https://github.com/tt-a1i/archify/pull/998) OPEN `25b767c72e9463a89e9e89b696d26a52318189b3`，正文仅 roadmap 链接，不能当已实现覆盖率分析；[#1121 taskflow](https://github.com/tt-a1i/archify/pull/1121) OPEN `843c877b251baf89925f99e11594fc5630c1c165`，正文明确 authored test association 和未执行历史测试；[#1141 sources](https://github.com/tt-a1i/archify/pull/1141) OPEN `30196a0be2aae32c6dc032e6b55e9cc0b8bab263`，是 relationship-level revision-pinned source evidence，不带 coverage 采集器。未重新审这些 PR 的完整 diff/CI。

另以 `coverage in:title` 查 all issues/PR：#251 open、#237 closed 是 semantic repository coverage；#950/#883 merged 是 CI/checker scope；#239 closed。标题窄查不是全站无重复证明。

## 四个项目的实际接口

所有 SHA 由本轮 GitHub 默认分支 API 固定；以下许可原文完整下载过，路径/hash/bytes 见末表。`denimgroup/pycobertura` API 返回 404，未当作第五个已核项目，也未将 404 解释成项目停更。

- **nedbat/coveragepy**，`44d8622409538fb6fc261aeb01829fe746219e53`；完整许可 [LICENSE.txt](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/LICENSE.txt)。 Apache-2.0。[coverage/context.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/context.py) 产生动态名称；[coverage/jsonreport.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/jsonreport.py) 导出 line contexts 及文件级 branch arcs；[coverage/html.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/html.py) 生成逐行 annotation，原生 HTML 可点开 context。没有新增 UI 价值证据。
- **tarpas/pytest-testmon**，`94150742345d0bc3fb00a10c19c0ae26a0064c4e`；完整许可 [LICENSE](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/LICENSE)。 MIT。[testmon/testmon_core.py](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/testmon/testmon_core.py) 采集并按源码指纹求 stable/affected；[testmon/db.py](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/testmon/db.py) 有 environment、test_execution、file_fp 和关联表，保存 duration/failed/forced、method_checksums/fsha；这不是逐 testcase arcs 导出。只读 reader 若接内部缓存会承担环境、指纹/schema 适配成本，本轮不接活动 DB、不 import DB 类。
- **Bachmann1234/diff_cover**，`55556afc0247c121328a012b237b1a24348611e5`；完整许可 [LICENSE](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/LICENSE)。 Apache-2.0。[diff_cover/diff_reporter.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/diff_reporter.py) 从 Git diff 获取改动行；[diff_cover/report_generator.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/report_generator.py) 合并 measured/diff/violations；[diff_cover/templates/html_coverage_report.html](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/templates/html_coverage_report.html) 已按文件和 snippet 展示未覆盖变化。它解决 changed-line gate，不能回答 testcase 身份。
- **plasma-umass/slipcover**，`6a7a972021ec393a8f9d487cc486a28e679ce98b`；完整许可 [LICENSE](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/LICENSE)。 Apache-2.0。[src/slipcover/slipcover.py](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/src/slipcover/slipcover.py) `get_coverage` 将已观察集合与 code_lines/code_branches 相减，输出 executed/missing；`_make_meta` 明确 `show_contexts=False`。[README.md](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/README.md) 提供 JSON/XML/LCOV/text 接口。相似 JSON shape 不等于支持 coverage.py contexts；不将 LCOV 的可配置 test-name 标签误当自动逐测试采集。

## 深读 A：coverage.py 的 producer → records → 原生 context UI

1. [tests/test_html.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/test_html.py) 的完整 22 行 `SOURCE`，由 `test_dynamic_contexts` 用 `dynamic_context=test_function`、`html:show_contexts=True` 采集并 `compare_html` 到 gold。下面保留完整源码与完整 gold 原件，未跑该测试。
2. [coverage/html.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/html.py) 从 `contexts_by_lineno` 取得每行字符串集合；空字符串显示 `(empty)`；`category2=run2` 让多行语句延续行有视觉高亮，但不会凭空多出 statement/context。ctx 标签计数是上下文种类数，不是执行次数。
3. [coverage/htmlfiles/coverage_html.js](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/htmlfiles/coverage_html.js) 消费紧凑 context key 和 `.ctxs` 文本，展开具体 context 名；[doc/contexts.rst](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/doc/contexts.rst) 另说明报告的 contexts regex 筛选及空 context。该筛选是上游报告参数，不声称 gold 页面具有一个本轮实测的任意 context 全局过滤控件。
4. [tests/gold/html/contexts/two_tests_py.html](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/gold/html/contexts/two_tests_py.html) 本身携带 22 行完整源展示和全套行状态。它的版本页脚为历史 `7.11.4a0.dev1`，不是本轮重新生成；固定仓库 SHA 与页脚版本同时保存，不伪装当前运行产物。

### 完整 fixture 的独立 oracle

- 源码 22 行；3 条空白行是 3、7、18。17 statements；执行 statement 16，missing statement 12；excluded=0；页面按整数显示 94%，精确行比率 `16/17*100=94.117647…`。
- source lines 16、17 是多行 `helper` 调用的延续，gold 标 `run run2`，不计两条额外 statements。把所有带 `run` class 的 `<p>` 简单相加会得到错误分母。
- contexts 三种：空字符串、`two_tests.test_one`、`two_tests.test_two`。空 context 行集合 8 项；test_one 3 项；test_two 7 项；关联总数 18，去重执行行 16。line 2 同时属于三种 context，不是三次执行的计数承诺。
- 12 为明确 missing；3/7/18 是普通空白；16/17 是视觉 continuation；不存在于输入的另一个文件仍 unknown。四者不能统一成“没有测试覆盖”。
- line 2 的完整 context 答案是空 context + one + two；line 5 只有 one；line 11 只有 two；line 12 无命中；这些问题原生展开就可回答。没有测试结果报告，不能给 assertion adequacy 或测试通过率打分。
- 这份 gold 未启用 branch 测量，**arcs=not-collected，不能写 0**。没有逐调用顺序/时间数据；context 行集合不能画 execution sequence 或直接调用边。

完整 context oracle（由官方 expected sets 及完整 gold 交叉核对，排序是本轮投影，非官方 JSON bytes）：

```json
{
  "": [
    1,
    2,
    4,
    8,
    19,
    20,
    21,
    22
  ],
  "two_tests.test_one": [
    2,
    5,
    6
  ],
  "two_tests.test_two": [
    2,
    9,
    10,
    11,
    13,
    14,
    15
  ]
}
```

源码完整字面量从 `tests/test_html.py` 用 AST 读取并 dedent，得到的派生 UTF-8 为 255 bytes / SHA-256 `7062b4b15623ecf3ee9f8e4c4a912513d5ee1ddabe4757705ae4ef2ed6e0ccd0`。它不是仓库里独立存在的 `two_tests.py` blob；原始承载文件原 bytes 身份见附录。**不能换成 `tests/test_context.py` 同名 SOURCE**：后者是 20 行且单行 helper 调用，外围行号 17–20；拿它解释本 gold 的 19–22 会误配来源。

```python
def helper(lineno):
    x = 2

def test_one():
    a = 5
    helper(6)

def test_two():
    a = 9
    b = 10
    if a > 11:
        b = 12
    assert a == (13-4)
    assert b == (14-4)
    helper(
        16
    )

test_one()
x = 20
helper(21)
test_two()
```

### 分支负例：有全量 arcs，不等于有逐 context arcs

[tests/test_json.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/test_json.py) `test_line_and_branch_coverage` 的完整源码是下列 9 行；其官方 expected arrays 为 executed lines `[1,2,4,5,8]`、missing `[3,7,9]`、excluded `[]`；executed branch arcs `[[2,4],[4,5],[8,-1]]`、missing branch arcs `[[2,3],[4,7],[8,9]]`。这是源码中的完整测试预期，本轮没有运行并生成一份新的 JSON。

```python
a = {'b': 1}
if a.get('a'):
    b = 3
elif a.get('b'):
    b = 5
else:
    b = 7
if not a:
    b = 9
```

独立算术：8 statements，5 covered / 3 missing；6 分支出口，3 covered / 3 missing；综合 `(5+3)/(8+6)=57.142857…%`，不是行比率 `5/8=62.5%`。`[8,-1]` 是退出 sentinel，不能当不存在的第 -1 行链接。此例上下文输出关闭；不能移植上一个 fixture 的 context 名。

[coverage/jsonreport.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/jsonreport.py) 结构性的限制：`files[path].contexts` 是 `contexts_by_lineno`，`executed_branches/missing_branches` 则来自本次被选报告范围的 analysis；JSON 没有 `arc→contexts`。即使 branch 两端都带同一个 context，也不足以证明同一个 context 经过该 arc。若要回答逐 test arc，需上游明确导出/query 同 context arcs；将全文件 arcs 与 line labels 做笛卡尔拼接是造数据。

## 深读 B：diff_cover 的分母与既有阅读页

[diff_cover/diff_reporter.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/diff_reporter.py) 产生每文件去重 changed line 集合；[diff_cover/violationsreporters/violations_reporter.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/violationsreporters/violations_reporter.py) 读取 XML/LCOV measured lines 与 violations；[diff_cover/report_generator.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/report_generator.py) 的 `DiffViolations` 求 `measured ∩ changed`，违规为 violations 在 diff 范围内的交集。百分比分母是具有 coverage 信息的 changed lines，不是整个 diff 文件所有新行；无 measured 分母时上游返回 100，分享阅读必须同时给分母，不能宣称测到了全部改动。

同一 reporter 的 JSON 输出与 [diff_cover/templates/html_coverage_report.html](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/templates/html_coverage_report.html) 消费的 report dict 同源：per-file covered/violation lines、percent 和 snippets；已有 HTML 点击/跳转到文件段。`--branch-coverage` 下 Cobertura 部分覆盖行可被记 violation，这仍是行 gate，不是给每个 branch 分别计分。源码 loader 的 snippet 读入失败会留下空片段，不证明源代码为空。以上是静态源码读出，未浏览器运行。

完整官方 fixture 集：[tests/fixtures/git_diff_add.txt](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/git_diff_add.txt)、[tests/fixtures/test_src.txt](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/test_src.txt)、[tests/fixtures/coverage.xml](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/coverage.xml)、[tests/fixtures/add_json_report.json](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/add_json_report.json)。`test_src.txt` 是上游有意构造的 10 行测试文本，**不是 Python/业务源代码**，不冒充真实项目 workload。report 的 oracle：changed=10，measured changed=10，covered odd lines 1/3/5/7/9，violations even 2/4/6/8/10，50%；没有 contexts，没有 testcase identity，没有 commit hash。`diff_name` 的 `origin/main...HEAD, staged and unstaged changes` 只是字符串标签，不能当 verified source/base identity。后续复用必须另附来源 revision/采集配置；不重新发明 diff parser 或源码 reader。

## 为什么本轮没有 worthwhile candidate

| 被检验的阅读任务 | 原输入与 baseline | 候选交互和完整 oracle | 取舍及最小支持面/成本 |
| --- | --- | --- | --- |
| 看 line 2 由哪些 test 触及，找 missing line 12 | 上述完整 gold + 22 行源码；原生已有 ctx 展开/missing | 双向 context×line 矩阵；完整答案是本报告三集合 | 与旧实验 B 重复；没有新的阅读行为证据。用现有 Explainer 表格足以分享本小例，专用矩阵/选择状态和 format adapter 的中等维护成本未成立，0 新实验。 |
| 看 line 8 执行过但为什么仍缺 branch | 完整 9 行源码和全量六 arcs；上游原生 branch annotation | 点一条条件突出 `[8,-1]` 与 `[8,9]`；oracle 已给出 3/6 | 现有 Workflow + Explainer 足以呈现两出口，Round26 已解释分母，不新增 reviewer/CFG/coverage importer。仅解释既有格式成本低，但没有新增能力。 |
| 某 test 到底经过哪个 arc | 两份官方样本没有同次运行的 per-context branch export | 表面上“点 test 高亮 arc”无法有完整 oracle | 输入不可回答；拒绝实现。最小前提是完整同源源码+同 run、同 exclusions 的逐 context arcs，不能用本轮不同 fixtures 拼出输入。 |
| 某改动 50% 是不是表示一半全部改动已测 | diff_cover 完整 add fixture | 已有 HTML/JSON 的 changed/measured/violation 对照即可 | 原生报告已支持；额外页面若仅换样式没有可验证增量。不推广成大型 coverage 平台。 |

这不是永久否定覆盖阅读。若未来得到一个自然交接案例，含完整、同 revision 的源码、逐 context arcs 与未覆盖/排除/未采集账目，而且现有报告确实迫使用户跨文件人工求交，可重新评估“选 context 后分支出口见证”这一具体任务。当前证据没有满足该前提，不以 synthetic 补齐。

## 完整输入、许可与原 bytes 附录

下表所有文件均完整 HTTP 读取到内存后 hash，不是只截正文若干行。只有下方明确 fenced 的完整小 fixture 被随报告保存，其余原件以固定 SHA 链接保留；未复制上游实现到产品或加入依赖。许可全文可由对应固定链接查看，未凭 GitHub license badge 猜测。

| 项目/原始路径（完整固定链接） | bytes | SHA-256 |
| --- | ---: | --- |
| coveragepy / [LICENSE.txt](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/LICENSE.txt) | 10174 | `0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594` |
| coveragepy / [tests/test_html.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/test_html.py) | 61738 | `44882f22cd3eddc14d784a2c0c2b0badb5bab1f5b7cdb6276191e67a2aee06ce` |
| coveragepy / [tests/test_context.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/test_context.py) | 12096 | `86dfb760c9b96c8f16e0ed76d07f1d0313053edd9d017d090f5572c0ded2e3bb` |
| coveragepy / [tests/test_json.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/test_json.py) | 17887 | `081de57f6a01c80878f7f4ee96218e1283d997a29993377b27002a8c16b99fa4` |
| coveragepy / [tests/gold/html/contexts/two_tests_py.html](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/tests/gold/html/contexts/two_tests_py.html) | 10758 | `ae400ac142cbd3bfb4224d5e7a471c67301349c6a1f53560906484f29e853f29` |
| coveragepy / [coverage/context.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/context.py) | 2813 | `2049e7efc15081db9e51adb4a2cdecd03bd3b806ab1090dd6dd4cb7fd9fd9223` |
| coveragepy / [coverage/jsonreport.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/jsonreport.py) | 7534 | `f774c2168669ccf7ebaadd45ae9b9e7cd3ddfc6ce44b2a7e1e5c2b15293e3a3d` |
| coveragepy / [coverage/html.py](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/html.py) | 31941 | `a3e2ce3d47ea22e36e0c7b8da62b64788c8b21fd24854f58b431ecdf018c0dd7` |
| coveragepy / [coverage/htmlfiles/coverage_html.js](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/coverage/htmlfiles/coverage_html.js) | 27188 | `420dceb04f21b928d771cf8aa731001cf8cfaea889cefc92ceab1c427f30f2cf` |
| coveragepy / [doc/contexts.rst](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/doc/contexts.rst) | 4966 | `3aad6822b869a1556f6d07673d53697cf4ccda1872d38a6e13a10ca7f3d12945` |
| pytest-testmon / [LICENSE](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/LICENSE) | 1077 | `f8b8265d821c97583ade7bf68b6bd378b03d8e5892a36d44c6e856dbd92dec29` |
| pytest-testmon / [testmon/testmon_core.py](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/testmon/testmon_core.py) | 22643 | `aa4e564955d89494234d6f224821d3232da3b93b8aa5ea48c3c2da3c1dda3e33` |
| pytest-testmon / [testmon/db.py](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/testmon/db.py) | 25843 | `0bd0d407582b6e5c63df6a4ed6b3315484ee66b634cf2a2950f0fb03c0b4c2c4` |
| pytest-testmon / [testmon/pytest_testmon.py](https://github.com/tarpas/pytest-testmon/blob/94150742345d0bc3fb00a10c19c0ae26a0064c4e/testmon/pytest_testmon.py) | 21004 | `4283eec63ca171190cc235cc98d8de4ccd2f8c1e08e9ed99430f252b0e525ae6` |
| diff_cover / [LICENSE](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/LICENSE) | 10174 | `0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594` |
| diff_cover / [diff_cover/diff_reporter.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/diff_reporter.py) | 17810 | `443314e281b1f931388f613a662cf443c27cd9edd80a9009dbf175e5edc22ae2` |
| diff_cover / [diff_cover/report_generator.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/report_generator.py) | 16614 | `f627f2c282e7a713ce37c592c0472d4d4f90b2a186e734dc676c705abc76cbe1` |
| diff_cover / [diff_cover/violationsreporters/violations_reporter.py](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/violationsreporters/violations_reporter.py) | 36985 | `8cfa05d99ea49ed9d46bfc66dbc0aa96c84c214625b69e80a8299a4de42f67b1` |
| diff_cover / [diff_cover/templates/html_coverage_report.html](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/diff_cover/templates/html_coverage_report.html) | 1632 | `db88a7c4389250d6d5ba5d3c7d196be891c92a405c19a01db64d21d4409b14a8` |
| diff_cover / [tests/fixtures/add_json_report.json](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/add_json_report.json) | 1065 | `03714bd3abbbebdc23b2e622d799562252dbec3b8f282014b8c1d0d403c9b07a` |
| diff_cover / [tests/fixtures/git_diff_add.txt](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/git_diff_add.txt) | 216 | `eebb01ff40564f6726f97562ca85627fb1928cdaf6bf6da33b8a3f5ad97d0e47` |
| diff_cover / [tests/fixtures/test_src.txt](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/test_src.txt) | 71 | `42cd22cbe64b02de0c17e79b2df45c44ef3a9cf00cedafe13308df574872b55e` |
| diff_cover / [tests/fixtures/coverage.xml](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/coverage.xml) | 855 | `8d8c2cac31c036e05d70deb180b7b5a210626cd540a75bb69d71e5a496a21569` |
| slipcover / [LICENSE](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/LICENSE) | 11358 | `cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30` |
| slipcover / [README.md](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/README.md) | 13325 | `5105528fb6f10be0b0fc90683d2d737bd4e42fc22c37bbf8ee7a8542855fdc87` |
| slipcover / [src/slipcover/slipcover.py](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/src/slipcover/slipcover.py) | 42879 | `9147e128c532eecf9077c08072f7584227e54c3446826498a2300d27260186a3` |
| slipcover / [src/slipcover/branch.py](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/src/slipcover/branch.py) | 7847 | `9c3421294aa7da81ee37dab45222de8c0fa2fa27319f4515d34b1b4eac3847b8` |
| slipcover / [src/slipcover/__main__.py](https://github.com/plasma-umass/slipcover/blob/6a7a972021ec393a8f9d487cc486a28e679ce98b/src/slipcover/__main__.py) | 18963 | `0236d2950f3b80e23e82ae966aa70ed032174e7fed911d3f64d3532c8848733c` |

### 完整官方 gold 数据原件

下面 fence 中是官方 HTML 的完整 UTF-8 文本，未删除 header、footer、源码行或 compact contexts 数据；可将 fence 内容原样还原为原件（含结尾 LF）。这里只作为文本保存，未执行 HTML/JS；不是一个本轮生成的 Archify artifact。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Coverage for two_tests.py: 94%</title>
    <link rel="icon" sizes="32x32" href="favicon_32_cb_58284776.png">
    <link rel="stylesheet" href="style_cb_baf449ae.css" type="text/css">
    <script type="text/javascript">
        contexts = {
  "a": "(empty)",
  "b": "two_tests.test_two",
  "c": "two_tests.test_one"
}
    </script>
    <script src="coverage_html_cb_7aca8e62.js" defer></script>
</head>
<body class="pyfile">
<header>
    <div class="content">
        <h1>
            <span class="text">Coverage for </span><b>two_tests.py</b>:
            <span class="pc_cov">94%</span>
        </h1>
        <aside id="help_panel_wrapper">
            <input id="help_panel_state" type="checkbox">
            <label for="help_panel_state">
                <img id="keyboard_icon" src="keybd_closed_cb_ce680311.png" alt="Show/hide keyboard shortcuts">
            </label>
            <div id="help_panel">
                <p class="legend">Shortcuts on this page</p>
                <div class="keyhelp">
                    <p>
                        <kbd>r</kbd>
                        <kbd>m</kbd>
                        <kbd>x</kbd>
                        &nbsp; toggle line displays
                    </p>
                    <p>
                        <kbd>j</kbd>
                        <kbd>k</kbd>
                        &nbsp; next/prev highlighted chunk
                    </p>
                    <p>
                        <kbd>0</kbd> &nbsp; (zero) top of page
                    </p>
                    <p>
                        <kbd>1</kbd> &nbsp; (one) first highlighted chunk
                    </p>
                    <p>
                        <kbd>[</kbd>
                        <kbd>]</kbd>
                        &nbsp; prev/next file
                    </p>
                    <p>
                        <kbd>u</kbd> &nbsp; up to the index
                    </p>
                    <p>
                        <kbd>?</kbd> &nbsp; show/hide this help
                    </p>
                </div>
            </div>
        </aside>
        <h2>
            <span class="text">17 statements &nbsp;</span>
            <button type="button" class="run button_toggle_run" value="run" data-shortcut="r" title="Toggle lines run">16<span class="text"> run</span></button>
            <button type="button" class="mis show_mis button_toggle_mis" value="mis" data-shortcut="m" title="Toggle lines missing">1<span class="text"> missing</span></button>
            <button type="button" class="exc show_exc button_toggle_exc" value="exc" data-shortcut="x" title="Toggle lines excluded">0<span class="text"> excluded</span></button>
        </h2>
        <p class="text">
            <a id="prevFileLink" class="nav" href="index.html">&#xab; prev</a> &nbsp; &nbsp;
            <a id="indexLink" class="nav" href="index.html">&Hat; index</a> &nbsp; &nbsp;
            <a id="nextFileLink" class="nav" href="index.html">&#xbb; next</a>
            &nbsp; &nbsp; &nbsp;
            <a class="nav" href="https://coverage.readthedocs.io/en/7.11.4a0.dev1">coverage.py v7.11.4a0.dev1</a>,
            created at 2025-11-15 23:12 +0900
        </p>
        <aside class="hidden">
            <button type="button" class="button_next_chunk" data-shortcut="j"></button>
            <button type="button" class="button_prev_chunk" data-shortcut="k"></button>
            <button type="button" class="button_top_of_page" data-shortcut="0"></button>
            <button type="button" class="button_first_chunk" data-shortcut="1"></button>
            <button type="button" class="button_prev_file" data-shortcut="["></button>
            <button type="button" class="button_next_file" data-shortcut="]"></button>
            <button type="button" class="button_to_index" data-shortcut="u"></button>
            <button type="button" class="button_show_hide_help" data-shortcut="?"></button>
        </aside>
    </div>
</header>
<main id="source">
    <p class="run"><span class="n"><a id="t1" href="#t1">1</a></span><span class="t"><span class="key">def</span> <span class="nam">helper</span><span class="op">(</span><span class="nam">lineno</span><span class="op">)</span><span class="op">:</span>&nbsp;</span><span class="r"><label for="ctxs1" class="ctx">(empty)</label></span></p>
    <p class="run"><span class="n"><a id="t2" href="#t2">2</a></span><span class="t">    <span class="nam">x</span> <span class="op">=</span> <span class="num">2</span>&nbsp;</span><input type="checkbox" id="ctxs2"><span class="r"><label for="ctxs2" class="ctx">3 ctx</label></span><span class="ctxs">1acb</span></p>
    <p class="pln"><span class="n"><a id="t3" href="#t3">3</a></span><span class="t">&nbsp;</span><span class="r"></span></p>
    <p class="run"><span class="n"><a id="t4" href="#t4">4</a></span><span class="t"><span class="key">def</span> <span class="nam">test_one</span><span class="op">(</span><span class="op">)</span><span class="op">:</span>&nbsp;</span><span class="r"><label for="ctxs4" class="ctx">(empty)</label></span></p>
    <p class="run"><span class="n"><a id="t5" href="#t5">5</a></span><span class="t">    <span class="nam">a</span> <span class="op">=</span> <span class="num">5</span>&nbsp;</span><input type="checkbox" id="ctxs5"><span class="r"><label for="ctxs5" class="ctx">1 ctx</label></span><span class="ctxs">1c</span></p>
    <p class="run"><span class="n"><a id="t6" href="#t6">6</a></span><span class="t">    <span class="nam">helper</span><span class="op">(</span><span class="num">6</span><span class="op">)</span>&nbsp;</span><input type="checkbox" id="ctxs6"><span class="r"><label for="ctxs6" class="ctx">1 ctx</label></span><span class="ctxs">1c</span></p>
    <p class="pln"><span class="n"><a id="t7" href="#t7">7</a></span><span class="t">&nbsp;</span><span class="r"></span></p>
    <p class="run"><span class="n"><a id="t8" href="#t8">8</a></span><span class="t"><span class="key">def</span> <span class="nam">test_two</span><span class="op">(</span><span class="op">)</span><span class="op">:</span>&nbsp;</span><span class="r"><label for="ctxs8" class="ctx">(empty)</label></span></p>
    <p class="run"><span class="n"><a id="t9" href="#t9">9</a></span><span class="t">    <span class="nam">a</span> <span class="op">=</span> <span class="num">9</span>&nbsp;</span><input type="checkbox" id="ctxs9"><span class="r"><label for="ctxs9" class="ctx">1 ctx</label></span><span class="ctxs">1b</span></p>
    <p class="run"><span class="n"><a id="t10" href="#t10">10</a></span><span class="t">    <span class="nam">b</span> <span class="op">=</span> <span class="num">10</span>&nbsp;</span><input type="checkbox" id="ctxs10"><span class="r"><label for="ctxs10" class="ctx">1 ctx</label></span><span class="ctxs">1b</span></p>
    <p class="run"><span class="n"><a id="t11" href="#t11">11</a></span><span class="t">    <span class="key">if</span> <span class="nam">a</span> <span class="op">&gt;</span> <span class="num">11</span><span class="op">:</span>&nbsp;</span><input type="checkbox" id="ctxs11"><span class="r"><label for="ctxs11" class="ctx">1 ctx</label></span><span class="ctxs">1b</span></p>
    <p class="mis show_mis"><span class="n"><a id="t12" href="#t12">12</a></span><span class="t">        <span class="nam">b</span> <span class="op">=</span> <span class="num">12</span>&nbsp;</span><span class="r"></span></p>
    <p class="run"><span class="n"><a id="t13" href="#t13">13</a></span><span class="t">    <span class="key">assert</span> <span class="nam">a</span> <span class="op">==</span> <span class="op">(</span><span class="num">13</span><span class="op">-</span><span class="num">4</span><span class="op">)</span>&nbsp;</span><input type="checkbox" id="ctxs13"><span class="r"><label for="ctxs13" class="ctx">1 ctx</label></span><span class="ctxs">1b</span></p>
    <p class="run"><span class="n"><a id="t14" href="#t14">14</a></span><span class="t">    <span class="key">assert</span> <span class="nam">b</span> <span class="op">==</span> <span class="op">(</span><span class="num">14</span><span class="op">-</span><span class="num">4</span><span class="op">)</span>&nbsp;</span><input type="checkbox" id="ctxs14"><span class="r"><label for="ctxs14" class="ctx">1 ctx</label></span><span class="ctxs">1b</span></p>
    <p class="run"><span class="n"><a id="t15" href="#t15">15</a></span><span class="t">    <span class="nam">helper</span><span class="op">(</span>&nbsp;</span><input type="checkbox" id="ctxs15"><span class="r"><label for="ctxs15" class="ctx">1 ctx</label></span><span class="ctxs">1b</span></p>
    <p class="run run2"><span class="n"><a id="t16" href="#t16">16</a></span><span class="t">        <span class="num">16</span>&nbsp;</span><span class="r"></span></p>
    <p class="run run2"><span class="n"><a id="t17" href="#t17">17</a></span><span class="t">    <span class="op">)</span>&nbsp;</span><span class="r"></span></p>
    <p class="pln"><span class="n"><a id="t18" href="#t18">18</a></span><span class="t">&nbsp;</span><span class="r"></span></p>
    <p class="run"><span class="n"><a id="t19" href="#t19">19</a></span><span class="t"><span class="nam">test_one</span><span class="op">(</span><span class="op">)</span>&nbsp;</span><span class="r"><label for="ctxs19" class="ctx">(empty)</label></span></p>
    <p class="run"><span class="n"><a id="t20" href="#t20">20</a></span><span class="t"><span class="nam">x</span> <span class="op">=</span> <span class="num">20</span>&nbsp;</span><span class="r"><label for="ctxs20" class="ctx">(empty)</label></span></p>
    <p class="run"><span class="n"><a id="t21" href="#t21">21</a></span><span class="t"><span class="nam">helper</span><span class="op">(</span><span class="num">21</span><span class="op">)</span>&nbsp;</span><span class="r"><label for="ctxs21" class="ctx">(empty)</label></span></p>
    <p class="run"><span class="n"><a id="t22" href="#t22">22</a></span><span class="t"><span class="nam">test_two</span><span class="op">(</span><span class="op">)</span>&nbsp;</span><span class="r"><label for="ctxs22" class="ctx">(empty)</label></span></p>
</main>
<footer>
    <div class="content">
        <p>
            <a class="nav" href="index.html">&#xab; prev</a> &nbsp; &nbsp;
            <a class="nav" href="index.html">&Hat; index</a> &nbsp; &nbsp;
            <a class="nav" href="index.html">&#xbb; next</a>
            &nbsp; &nbsp; &nbsp;
            <a class="nav" href="https://coverage.readthedocs.io/en/7.11.4a0.dev1">coverage.py v7.11.4a0.dev1</a>,
            created at 2025-11-15 23:12 +0900
        </p>
    </div>
</footer>
</body>
</html>
```

### 完整官方 diff 与 JSON 原件

[tests/fixtures/git_diff_add.txt](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/git_diff_add.txt)

```text
diff --git a/test_src.txt b/test_src.txt
new file mode 100644
index 0000000..10ae772
--- /dev/null
+++ b/test_src.txt
@@ -0,0 +1,10 @@
+test 1
+test 2
+test 3
+test 4
+test 5
+test 6
+test 7
+test 8
+test 9
+test 10
```

[tests/fixtures/test_src.txt](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/test_src.txt)

```text
test 1
test 2
test 3
test 4
test 5
test 6
test 7
test 8
test 9
test 10
```

[tests/fixtures/add_json_report.json](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/tests/fixtures/add_json_report.json)

```text
{
    "report_name": "XML",
    "diff_name": "origin/main...HEAD, staged and unstaged changes",
    "src_stats": {
        "test_src.txt": {
            "percent_covered": 50.0,
            "violation_lines": [
                2,
                4,
                6,
                8,
                10
            ],
            "covered_lines": [
                1,
                3,
                5,
                7,
                9
            ],
            "violations": [
                [
                    2,
                    null
                ],
                [
                    4,
                    null
                ],
                [
                    6,
                    null
                ],
                [
                    8,
                    null
                ],
                [
                    10,
                    null
                ]
            ]
        }
    },
    "total_num_lines": 10,
    "total_num_violations": 5,
    "total_percent_covered": 50,
    "num_changed_lines": 10
}
```

AI assistance：Codex GPT-6.1-Sol 只读调查、标准库字节核对与报告撰写；未声明人类复核、上游测试通过、截图或用户理解速度提升。

## 随转载 fixture 保留的完整许可与上游声明

本报告转载 coverage.py 官方 gold HTML、完整 SOURCE 字面量及 diff_cover 官方 fixtures，适用 Apache-2.0。以下许可全文由固定 SHA 原件直接读取；coveragepy `LICENSE.txt` 与 diff_cover `LICENSE` 两份原件 bytes/hash 完全相同，因此保留一份全文，同时明确覆盖这两个项目在本报告中的转载材料。报告未改动所转载 fixture 原文；AST dedent、排序 context oracle 与本报告分析是已标明的派生处理。

当轮完整 recursive Git tree 均返回 `truncated=false`：coveragepy 有 `NOTICE.txt`，diff_cover 有 `NOTICE`；下面完整保留两者的原始版权与 NOTICE 声明，没有将其中一份替代另一份。此补充只处理已转载材料的许可归档，未扩大研究或运行范围。

### nedbat/coveragepy / LICENSE.txt（同时覆盖 diff_cover / LICENSE）

[完整固定原件](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/LICENSE.txt)；10174 bytes；SHA-256 `0d542e0c8804e39aa7f37eb00da5a762149dc682d7829451287e11b938e94594`。

[diff_cover 同字节许可原件](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/LICENSE)。

```text

                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS
```
### nedbat/coveragepy / NOTICE.txt

[完整固定原件](https://github.com/nedbat/coveragepy/blob/44d8622409538fb6fc261aeb01829fe746219e53/NOTICE.txt)；681 bytes；SHA-256 `80e177ab397d5f332954693a52abc1b34b06c5792dd57297608b6d68a2f6af11`。

```text
Copyright 2001 Gareth Rees.  All rights reserved.
Copyright 2004-2026 Ned Batchelder.  All rights reserved.

Except where noted otherwise, this software is licensed under the Apache
License, Version 2.0 (the "License"); you may not use this work except in
compliance with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
### Bachmann1234/diff_cover / NOTICE

[完整固定原件](https://github.com/Bachmann1234/diff_cover/blob/55556afc0247c121328a012b237b1a24348611e5/NOTICE)；68 bytes；SHA-256 `e1faf4e32d44e79297032e9f5271a0a2f2310079688f09a2f2491e23c2b416df`。

```text
diff-cover

Copyright 2013-2014, edX

Copyright 2015, Matt Bachmann
```

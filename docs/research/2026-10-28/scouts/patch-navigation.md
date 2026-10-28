# 多文件 patch：只建议文件段落定位

2026-10-28，GitHub读取窗口约03:39–03:46 UTC。使用research的一手来源方法与archify-review的价值/成本/影响判断；只新增本文。未运行、安装或测试上游，未改产品、生成页面、提交或推送。本轮源码观察不等于交互实测或用户效率测量。

**建议一个有界实验：普通 `@diff` 内至少两个文件段时，提供按输入顺序的文件段落锚点。** 不增加目录树、折叠、自动分组、语法解析、补取上下文或review状态。依据是当前renderer把所有文件平铺在一个table里，文件边界虽保留为原文，却没有导航目标。此为可构造复核的阅读机会，不是假称已经遇到自然用户事故。

## 当前能力与排重

实际只读源码checkout HEAD为[`a8456ef796ab62ba490b03fa0c896ae206edb5ea`](https://github.com/tt-a1i/archify/commit/a8456ef796ab62ba490b03fa0c896ae206edb5ea)，含已完成diff-matches实验；当前dev身份与旧基线净变化沿用同日[resume-status](../resume-status.md)中GitHub确认的`6ca6a5c84439b57ea22e0630fe306e1d91587a6e`，不把实验checkout当dev。本轮没有重测dev。

- [diff.mjs](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/archify/explainer/diff.mjs)已有 `startFile()`、私有`fileIndex`和`counts.files`；识别git header及无git的成对`---/+++`文件边界；hunk里的类似header文本保持内容行。支持metadata-only rename/mode；保留raw、ending、原补丁sourceLine及old/new行号。combined与binary明确拒绝。**无需再引解析器。**
- `row.filePath`是行的旧侧/新侧路径，不是完整文件段身份：metadata-only rename没有内容行；同一路径可以重复出现多个文件段；不能用path去重、也不能用有`filePath`的行数推文件数量。
- [render.mjs](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/archify/explainer/render.mjs#L81-L106)所有parsed rows进单个table，caption只有总增删数；目前ID只加在匹配文本run的起始行，没有文件段目录。已有diff-matches的匹配两端跳转不提供所有文件边界入口。
- 已完整读取gallery `selection.json`的52项及hub表，并重读`comparison-reading-round5.md`、`source-block-reading-audit.md`及相关code-reading报告。Task review map是作者声明与固定Git改动的离线映射；line-notes是旁注；diff-line-numbers、source-keyboard和diff-matches各有独立行为。它们不使普通多文件 `@diff` 自动获得文件段定位。单独重做前述能力无价值。
- [#1015](https://github.com/tt-a1i/archify/pull/1015)实时仍OPEN、head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`：重读changed-files及render patch，提供source/code focus与details，不提供diff文件目录；未来可能触及同一render/reader文件，需要组合检查。[#1049](https://github.com/tt-a1i/archify/pull/1049)仍OPEN、head `7184b99b01768349840f93b4de83ff206d202c33`，读取Architecture JSON snapshots，不处理文本patch。
- 本轮GitHub全状态PR搜索`diff in:title`为0；`patch in:title`只返回#1089/#1090/#576/#141，前二是Explainer自身patch命令诊断/临时路径；issues同名搜索相关项是#1085。`"file navigation"`和`"file list"`为宽泛噪音，后者PR首30项未穷尽，不据此声称全历史无重复。结合上述当前owning source，没有看到相同普通diff导航能力。

## 八个候选，不按星数筛选

均先读固定revision的README或拥有该行为的源码。下表SHA来自当次GitHub API；前三者以外不作深入实现推荐。

| 项目 / 固定SHA | 输入→阅读行为与取舍 | 许可证据 |
| --- | --- | --- |
| [diff2html](https://github.com/rtfpessoa/diff2html/tree/72331ff5d13a8d4d1f11256a7b554dd0d69d7014) `72331ff5d13a8d4d1f11256a7b554dd0d69d7014` | unified patch→文件清单、每项链接文件段；最接近可复用动作。深读renderer、模板、测试及UI。 | 实读[MIT](https://github.com/rtfpessoa/diff2html/blob/72331ff5d13a8d4d1f11256a7b554dd0d69d7014/LICENSE.md) |
| [diffview.nvim](https://github.com/sindrets/diffview.nvim/tree/4516612fe98ff56ae0415a259ff6361a89419b0a) `4516612fe98ff56ae0415a259ff6361a89419b0a` | Git状态/revision→按list/tree顺序切文件；文件panel维持当前条目。只观察行为，不搬编辑器状态。 | 实读[GPL-3.0-or-later](https://github.com/sindrets/diffview.nvim/blob/4516612fe98ff56ae0415a259ff6361a89419b0a/LICENSE)，不复制代码 |
| [CodeReview](https://github.com/FabriceSalvaire/CodeReview/tree/a2ee30e4fd5cd754fd1ab11111cabf7b898268dc) `a2ee30e4fd5cd754fd1ab11111cabf7b898268dc` | 仓库或两份文件→previous/next file、当前patch序号、3/6/12行context。context从两侧文件重新计算，不能借此宣称静态patch可补出缺失行。 | owning source首部GPL-3.0-or-later，根有GPL-V3.0.txt；不复制代码 |
| [riff](https://github.com/walles/riff/tree/62ef8a7371a7823d3ea65542751c6068f591cc6b) `62ef8a7371a7823d3ea65542751c6068f591cc6b` | diff→行内标色，文件名/hunk header尽可能链接源码；依赖终端pager/本地来源，不能把离线patch路径变成可信在线源码。 | API MIT；本轮未逐字审其许可文件，不选代码复用 |
| [difftastic](https://github.com/Wilfred/difftastic/tree/0b92338c6042152b1fc91c30ed01cf0449070844) `0b92338c6042152b1fc91c30ed01cf0449070844` | 两份完整文件→syntax结构差分；不是多文件patch目录。旧round18已讨论，不再引结构解析。 | README MIT，API MIT |
| [delta](https://github.com/dandavison/delta/tree/3c2269c6b845913965575f11b0196d70ef5352f3) `3c2269c6b845913965575f11b0196d70ef5352f3` | diff→pager的n/N文件/section导航、header装饰；动作有参考性，终端键位与pager不是网页合同。 | API MIT |
| [diff-so-fancy](https://github.com/so-fancy/diff-so-fancy/tree/7dca929b2468ccb296a08c92e7e39b7754d63a8e) `7dca929b2468ccb296a08c92e7e39b7754d63a8e` | diff→可简化成单行的文件/范围header；旧round5已筛，改写patch头的展示不适合本轮保留raw行的定位目标。 | API MIT |
| [jhaynie/codereview](https://github.com/jhaynie/codereview/tree/58a6f853c3a1498a1dd56d6d188b2fecd3e5a3ae) `58a6f853c3a1498a1dd56d6d188b2fecd3e5a3ae` | 本地Git→左栏文件状态、增删数、按10行补context、按文件归类评论；其编辑/反馈/服务运行时超出本轮。README初筛，不作为代码复用来源。 | README写MIT，但tree无独立LICENSE，API没有许可；代码复用前须另核 |

## 三个深读结果

**diff2html：复用“文件段落入口”，不复用身份算法。** [file-list-renderer.ts](https://github.com/rtfpessoa/diff2html/blob/72331ff5d13a8d4d1f11256a7b554dd0d69d7014/src/file-list-renderer.ts)逐个DiffFile渲染old/new名称、增删统计；[模板](https://github.com/rtfpessoa/diff2html/blob/72331ff5d13a8d4d1f11256a7b554dd0d69d7014/src/templates/file-summary-line.mustache)是原生`a href=#fileHtmlId`。这是普通锚点动作，不需要新依赖。UI另含文件折叠、文件清单toggle、sticky header；本轮不一起带入。

[完整file-list测试](https://github.com/rtfpessoa/diff2html/blob/72331ff5d13a8d4d1f11256a7b554dd0d69d7014/src/__tests__/file-list-renderer-tests.ts)10,592B，blob `52c703b8d8ef74477c11388ecf5587a19648fda8`，包含修改、rename、新增、删除四项及快照。它也暴露不可照搬处：[getHtmlId](https://github.com/rtfpessoa/diff2html/blob/72331ff5d13a8d4d1f11256a7b554dd0d69d7014/src/render-utils.ts)对显示filename做hash并截末6位；测试中三个`my/file/name.js`项目均链接`d2h-781444`。这是源码/快照事实，未实际运行或验证生产页面冲突。Archify应按**输入段落occurrence**赋锚点，不能把名称当唯一身份。

**diffview：顺序与文件路径是两件事。** [file_panel.lua](https://github.com/sindrets/diffview.nvim/blob/4516612fe98ff56ae0415a259ff6361a89419b0a/lua/diffview/scene/views/diff/file_panel.lua#L182-L240)依据list/tree取得ordered_file_list，再prev/next当前file；tree折叠与高亮需要额外状态。Archify保留patch顺序的静态锚点已经能承接最小阅读动作；没有证据需要复制staged/conflicting分组、目录折叠或环形键盘导航。GPL只作行为观察。

**CodeReview：上下文扩展不是免费显示能力。** [DiffViewerMainWindow.py](https://github.com/FabriceSalvaire/CodeReview/blob/a2ee30e4fd5cd754fd1ab11111cabf7b898268dc/src/CodeReview/GUI/DiffViewer/DiffViewerMainWindow.py)的toolbar选择3/6/12行后refresh，把完整两侧RawTextDocument交TwoWayFileDiffFactory重算；previous/next调用parent的patch序列并更新序号。Archify输入只有现有patch字节，不能声称能够显示未携带的上下文；不引仓库连接、diff引擎或Qt程序。GPL只观察。

## 可直接取用的完整fixture

首选diff2html固定测试[diff-parser-tests.ts L703–729](https://github.com/rtfpessoa/diff2html/blob/72331ff5d13a8d4d1f11256a7b554dd0d69d7014/src/__tests__/diff-parser-tests.ts#L703-L729)中 `should parse diff with multiple files` 的**完整const diff**，不是拼凑摘要或上游独立patch文件。源文件82,255B，blob `dde2778eba624d4ab6e4a7e55dbeacac186e3186`。本轮只按L705–728字符串逐字反转义、未执行上游：736B、24行、末尾LF，SHA-256 `5d99c33fdbca5a7b97d7b68c9403f667d6e576d32f4736ec9c6b33a0798fa6c4`。两个文件是`src/core/init.js`和`src/event.js`，两个hunk；文件段起始row index为0/13，hunk起始为4/17。完整保留原代码、空格、headers及context，不扩写成真实业务执行证据。后续保存fixture时同时保存MIT通知。

不要选同源L1293的`should parse unified diff with multiple hunks and files`来代表有效Archify输入：其完整literal中hunk声明计数与实际内容不自洽；上游容忍此输入不应被拿来修改Archify既有严格诊断。本轮未跑parser，判断来自字面计数。

另可复用已完成实验的 `experiments/diff-matches/input/second-look.patch`：完整movedPatch literal，363B，SHA-256 `5766fb90a003c49f1ae6df5068c1d840b2d9bb6e043f68efb16a97ab122ba0a6`、两个文件；原始来源/许可见[manifest](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/source-manifest.json)。它可用于组合回归，不能再以同一匹配文本跳转充当本轮独立收益。其9,666B真实Archify历史patch只有一个文件，应作为**不显示导航**对照，不能伪装多文件样本。

## 唯一实验：普通多文件diff的文件段落入口

**价值与待证点。** 用上述完整736B输入，让读者从diff顶部定位`src/event.js`文件段及其`@@ -1,6 +1,5 @@`。基线保留所有字节但只有滚动/浏览器查找；候选提供第二个文件条目，点击或键盘激活到该段header并有可见落点。静态HTML说明有能力缺口；实际基线/候选动作与截图仍须在实验中完成。短fixture可能本来已经同时可见，因此不要声称节约时间或滚动距离；它先证明目标身份与操作是否正确。若需要证明长patch定位价值，应再选完整较长公开多文件patch，不靠重复/填充放大736B输入。

**最小实现。** 在已有`startFile()`路径记录文件段开始row index，结束后用已有old/new path作label；metadata-only段使用原始header作为明确label或显式段序号，不猜rename名称。只对段数≥2显示有序原生链接。目标ID由block.id与原始起始row index组成；不去重路径、不改行顺序、不截正文、不扩JSON schema、不新增parser或外部依赖。`diff.mjs`的内部返回信息、`render.mjs`和必要CSS是预计影响面；若原生锚点足够则不改reader.js。不使用额外“已阅读”状态。单文件/无headers fragment保持现状。

**最低可证伪证据。** 同一完整input固定基线/候选：两个目录项分别只指向对应文件段；激活后能看到完整header并可从键盘继续操作；每个code单元raw及所有old/new行号与基线一致；复制结果无目录文字混入。记录实际浏览器步骤、目标row、1280/390浅深图与未测范围，不能用Node断言替代可见落点。新增断言放现有diff parser/renderer suites，保留当前combined/binary拒绝及literal边界，无需另造mirror suite。

**必须保留的反例。** (1) 同名文件重复两个段仍两个不同目标；(2) metadata-only rename/mode保留原段、0hunk，不当成缺失/合并文件；(3) 合法hunk内`--- old value`/`+++ new value`仍内容，不新增目录项；(4) fragment与单文件零导航；(5) 两个diff block同名文件不产生重复ID；(6) 原有diff-match锚点与文件段锚点共存。现有`test/explainer-diff.test.mjs`已有其中metadata、header-like body及fragment解析用例，可复用而非重写parser。

**成本与退出条件。** 小型内部索引加原生链接的成本可控；新增树结构、运行期滚动跟踪、路径tokenizer或按目录重排会扩大状态与维护面，应停止扩大并重新判断。若390px长label令阅读更差、落点无法清晰辨认，或完整输入中链接没有产生可审查的文件定位能力差异，就记录未成立并结束该实验；新页面数量不构成成果。

# 源码定位下一轮：查询范围比更多预览入口更关键

2026-10-28，只读研究。**本轮零实施候选。** 七个项目入口中，一个是既有 nvim-bqf 重查，六个作新的机制核查；未按 stars 筛选。深读 Telescope live-grep-args、cscope_maps 和 Codezoom 三条生产/消费链，并读取 Lspsaga 的完整 finder 测试作反证。共同观察是：名字、源码位置、查询参数、结果集合、图中的结构层级是不同合同。Archify 已有来源卡和定位入口；本轮没有找到一个未被已有实验/在审工作覆盖的真实定位失败，不建议为展示这些区别再堆信息卡。

本报告没有执行上游代码、安装依赖、启动服务、生成图片、操作浏览器、修改产品、建分支、commit/push 或发送评论。上游测试的 expected 是提交中的断言，不是本轮执行通过。下载的完整文件暂存 checkout 外用于阅读；持久变更仅本报告。

## 比较对象与排重

先读 [53项主索引](../../2026-10-25/README.md)、[本批交付](../README.md)、source-block-reading-audit、code-navigation-round5、reading-handoff-audit、round21-symbol-reading，以及前一批 [code-navigation](../../2026-10-26/scouts/code-navigation.md) / [runtime-code-reading](../../2026-10-26/scouts/runtime-code-reading.md)。没有2026-10-27研究目录，因此“前一天”采用最近实际存在的2026-10-26报告，未补造报告。

- Copy identity、Source question tour、CLI reading tour：对象/源码身份、问题导览与固定来源已有独立实验，不再换例子重做。
- Line notes、Load filter、Segment origins：分别已有阅读标注、过滤阶段与来源区段；不把“查询范围”改名成这些内容页的新版本。
- Source keyboard activation、Finder highlights/context、relation return/search、Static uses 已覆盖激活、已编写节点检索、返回和静态关系边界。编辑器有一个按钮不等于 Archify 还缺一个按钮。
- 产品比较固定 [dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`](https://github.com/tt-a1i/archify/tree/6ca6a5c84439b57ea22e0630fe306e1d91587a6e)。实验分支和研究 hub 不称 dev。

2026-10-28 用 GitHub CLI/API 只读重查 open issue/PR，以下是当前重复边界而非合入结论：

| 项目 | 本次读取身份和排除内容 |
| --- | --- |
| [#1132](https://github.com/tt-a1i/archify/issues/1132) / [PR #1141](https://github.com/tt-a1i/archify/pull/1141) | PR仍open，head `30196a0be2aae32c6dc032e6b55e9cc0b8bab263`；已读body/files。连接级 sources、验证和关系Passport证据正在实现，不再推荐“给边加来源”。本轮不审其正确性或认可其自报验证。 |
| [PR #1015](https://github.com/tt-a1i/archify/pull/1015) | open，head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`；focus lines、源码卡展开/复制已在其范围，不重做长摘录定位。 |
| [PR #1103](https://github.com/tt-a1i/archify/pull/1103) | open，base `labs/code-analysis`，head `f0be206acbc90eb7c6c6b636030e3eb28963d284`；Atlas层级概览/源码交接不等于dev已发布，但必须计入重复范围。 |
| [#1034](https://github.com/tt-a1i/archify/issues/1034) / [#1063](https://github.com/tt-a1i/archify/pull/1063) | GHE source links已有工作；不包装为新定位能力。 |
| [#1128](https://github.com/tt-a1i/archify/issues/1128) | GitHub Markdown plain view与行锚问题已有issue；不另立同一外链修复。 |

## 七个固定来源：六个新机制，一个重复来源

根许可均读取完整原文；仅借鉴机制，未复制实现或图片。GitHub license metadata不是最终许可依据。Telescope仓license API为null，但源码有SPDX MIT，LICENSES同时含MIT/CC0；不能称整个仓无许可。Tagbar的许可是完整Vim派生文本，不把API的NOASSERTION写成MIT。

| 固定项目 / SHA / 许可 | 实际阅读材料和具体动作 | 剩余价值与取舍 |
| --- | --- | --- |
| [nvim-telescope/telescope-live-grep-args.nvim `53e9df55b3651dd7cf77e172f1e8c9a17407acca`](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/tree/53e9df55b3651dd7cf77e172f1e8c9a17407acca)；[MIT](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/blob/53e9df55b3651dd7cf77e172f1e8c9a17407acca/LICENSES/MIT.txt) / [CC0文本](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/blob/53e9df55b3651dd7cf77e172f1e8c9a17407acca/LICENSES/CC0-1.0.txt) | 完整prompt_parser、extension consumer、shortcuts、20-case parser fixture；把当前词/选区变成字面查询，再按cwd/search_dirs限定范围 | 深读。查询文字不能独自说明搜索范围；当前buffer快捷方式额外设置search_dirs。Archify不生产代码搜索结果，不加ripgrep服务。 |
| [dhananjaylatkar/cscope_maps.nvim `bf0b380015e5bf5db4ad7184b9862cda36c6c674`](https://github.com/dhananjaylatkar/cscope_maps.nvim/tree/bf0b380015e5bf5db4ad7184b9862cda36c6c674)；[MIT](https://github.com/dhananjaylatkar/cscope_maps.nvim/blob/bf0b380015e5bf5db4ad7184b9862cda36c6c674/LICENSE) | 完整db.lua / init.lua / stack_view/tree.lua；读者按操作类型查symbol，结果带文件/行/所在函数context，选择后跳到位置 | 深读。db集合、prefix和backend影响范围；结果不是唯一运行目标。未找到仓内tests/fixture目录或固定完整cscope输出oracle，不把README配置当执行证据。 |
| [apposed/codezoom `91803ebb950c74cff971443fd8d3fe90ad503472`](https://github.com/apposed/codezoom/tree/91803ebb950c74cff971443fd8d3fe90ad503472)；[Unlicense](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/UNLICENSE) | model、Python AST extractor、serializer、HTML owning functions、完整analysis tests；从模块到class/method下钻，用breadcrumb返回 | 深读。层级身份和源码范围不同：model只有声明line，没有end_line/revision/path。与Atlas/既有drilldown相邻，不建议第二套导航框架或立刻做adapter。 |
| [nvimdev/lspsaga.nvim `cf6fc9473bba1d332eda9887855ea29ed9b37701`](https://github.com/nvimdev/lspsaga.nvim/tree/cf6fc9473bba1d332eda9887855ea29ed9b37701)；[MIT](https://github.com/nvimdev/lspsaga.nvim/blob/cf6fc9473bba1d332eda9887855ea29ed9b37701/LICENSE) | owning finder方法及完整finder_spec/fake_lsp；按definition/reference等method列结果，保留client id和offset encoding | 早期报告仅初筛过，本次补到实现。查询位置不是唯一符号定义；测试只覆盖buffer进入后的清理，不能证明跨文件引用正确。 |
| [ludovicchabant/vim-gutentags `aa47c5e29c37c52176c44e61c780032dfacef3dd`](https://github.com/ludovicchabant/vim-gutentags/tree/aa47c5e29c37c52176c44e61c780032dfacef3dd)；[MIT](https://github.com/ludovicchabant/vim-gutentags/blob/aa47c5e29c37c52176c44e61c780032dfacef3dd/LICENSE) | README、完整autoload/gutentags.vim；通过root marker/custom finder确定项目，再维护各项目tag文件 | root/cached index是producer责任，不能移植成“只要文件路径相同就同一源码”。Archify固定Git证据已给出更强身份；不添后台tag生成器。 |
| [preservim/tagbar `07cb8247487208124978daff8e13624667635457`](https://github.com/preservim/tagbar/tree/07cb8247487208124978daff8e13624667635457)；[Vim派生许可](https://github.com/preservim/tagbar/blob/07cb8247487208124978daff8e13624667635457/LICENSE) | README与完整许可；当前文件ctags按scope组织outline。README明确不承担一般tags文件管理 | 只做范围核查，未读其解析器/fixture，不计深读。Scope目录不是call hierarchy；与既有Outline/Navbuddy及Atlas重复，不继续投入。 |
| [kevinhwang91/nvim-bqf `c282a62bec6c0621a1ef5132aa3f4c9fc4dcc2c7`](https://github.com/kevinhwang91/nvim-bqf/tree/c282a62bec6c0621a1ef5132aa3f4c9fc4dcc2c7)；[BSD-3-Clause](https://github.com/kevinhwang91/nvim-bqf/blob/c282a62bec6c0621a1ef5132aa3f4c9fc4dcc2c7/LICENSE) | README、完整preview handler/session；quickfix item的bufnr/lnum/col/end-range与可选LSP range驱动预览 | 已在interaction-smalltools同SHA覆盖，本次只是consumer复核，明确不计新项目。它消费结果，不负责证明查询完整；不重做SourceCard。 |

## 可复核链一：同一个prompt，搜索的不是同一个范围

完整输入与oracle为 [tests/specs/prompt_parser_spec.lua](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/blob/53e9df55b3651dd7cf77e172f1e8c9a17407acca/tests/specs/prompt_parser_spec.lua)（2846B；SHA256 `ffbe676a369d369863d9a31c6c0bff04a7e64b4c50613327f1f1eed0566bc1d7`），已从头到尾读取全部20项。每项有输入、autoquote=true和false的完整expected，runner逐项比较；没有节选半个program当完整fixture。

例子 `test1 test2` 的两个expected分别是单个含空格参数和两个参数；以引号或 `-` 开头则进入shell-like parsing。Owning [prompt_parser.lua](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/blob/53e9df55b3651dd7cf77e172f1e8c9a17407acca/lua/telescope-live-grep-args/prompt_parser.lua)仅产参数数组，不建立语义符号绑定，也不是执行shell。完整 [extension consumer](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/blob/53e9df55b3651dd7cf77e172f1e8c9a17407acca/lua/telescope/_extensions/live_grep_args.lua)把vimgrep_arguments、additional_args、parsed prompt、search_dirs拼成job参数，另传cwd/max_results。完整 [shortcuts.lua](https://github.com/nvim-telescope/telescope-live-grep-args.nvim/blob/53e9df55b3651dd7cf77e172f1e8c9a17407acca/lua/telescope-live-grep-args/shortcuts.lua)给词/选区默认附加`-F`，current-buffer版本另把search_dirs设为当前路径。

**反例与边界：** 同样显示一个词，当前文件搜索与repo目录搜索可以有不同结果；这从参数链可推出，不代表本轮实际搜过哪个repo。字面搜索也可能同时命中同名不同作用域符号。20-case fixture只验证prompt解析，完全没有验证文件枚举、ignore规则、regex结果或符号引用完整性。给结果卡加“来自源码”解决不了这个producer合同。

## 可复核链二：cscope结果携带context，但不携带查询全集证明

[init.lua L192–243](https://github.com/dhananjaylatkar/cscope_maps.nvim/blob/bf0b380015e5bf5db4ad7184b9862cda36c6c674/lua/cscope/init.lua#L192-L243)先读 [db.all_conns](https://github.com/dhananjaylatkar/cscope_maps.nvim/blob/bf0b380015e5bf5db4ad7184b9862cda36c6c674/lua/cscope/db.lua#L20-L55)。global连接存在时覆盖普通连接集合；cscope遍历连接，gtags-cscope只用primary并附加`-a`。每次命令含op、symbol、数据库文件和prefix；不存在的db或非零exit在helper中返回，成功stdout才被合并。

[parse_line/parse_output/open_picker](https://github.com/dhananjaylatkar/cscope_maps.nvim/blob/bf0b380015e5bf5db4ad7184b9862cda36c6c674/lua/cscope/init.lua#L113-L190)把输出拆成filename、ctx、lnum、text，ctx再放入显示文本；picker标题保留op和symbol，单结果可按配置直接打开。它没有给每个结果保留“哪个db产生”或把跳过db分别列成失败账目。因此不能用最终列表证明所有连接已成功查询，也不能由“no results”推断没有引用。这是源码控制流观察，未报告为真实用户事故或上游bug。

最强可能方向本来是“引用集的范围与不完整原因”，但Archify现在消费作者提供的图/证据，而不生产cscope结果。为了这一页而引入runner、db版本、多查询状态、missing/error归因与结果导入，成本先于已知收益。若只画一张条件流程表，又与Load filter/Static uses已有内容边界接近，不选新实验。

## 可复核链三：Codezoom的breadcrumb导航到结构，不自动导航到精确源码

完整 [model.py](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/src/codezoom/model.py) / [serializer](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/src/codezoom/renderer/_serialize.py)保存SymbolData的name、kind、line、calls、inherits、children、visibility、origin；line序列化为lineno。没有end_line、具体调用位置、固定Git revision或source path字段。它是语言无关结构模型，不是完整源码证据包。

[Python extractor](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/src/codezoom/extractors/python/ast_symbols.py)读取真实文件并ast.parse，在top-level函数与class直接方法记录声明node.lineno；_CallExtractor收集Name调用名或简单Attribute的attr，并转为set。函数参数遮蔽、同名方法绑定或实际运行目标没有在该收集器中解析。不能将其calls改称“已验证callee”，也不能把声明line扩成整个函数的end_line。

[template.html](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/src/codezoom/renderer/template.html#L2579-L2603)的drillInto设置currentNode并push history；goUp pop，updateUI；[updateBreadcrumb](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/src/codezoom/renderer/template.html#L2833-L2890)按访问history及模块/符号字符串关系制作增量标签。它不是仅由AST父链自动推导的词法祖先scope，也不承诺可点击的Git源码范围。当前图中隐藏/下钻的集合与源文件词法块是不同集合。

完整公开输入/expected为 [tests/test_analysis.py](https://github.com/apposed/codezoom/blob/91803ebb950c74cff971443fd8d3fe90ad503472/tests/test_analysis.py)（3801B；SHA256 `6bf5304d1d53d8c7c4301c3b3356c75ab2024082585fbd8996330c386e4f1194`）。已完整读到包级与class级cycle fixtures：包括self-loop ignored、missing target skipped、跨package class依赖不参与class cycle等；它是完整graph-analysis oracle，**不是Python extractor或breadcrumb的运行oracle**。本轮未找到已提交的完整Python源码→symbol JSON→浏览器scope定位成对fixture，不用analysis测试为导航背书。

反例（源码推导，非上游fixture/执行）：函数参数与模块内另一函数同名时，按Name收集的calls文字不足以决定绑定对象。即使图中该名字有节点，也不能据此生成精确调用位置证据。Codezoom值得继续观察，但本轮只能证明分层阅读存在，未证明Archify现有Finder+drilldown+源码范围缺一套breadcrumb。

## Lspsaga的完整测试为什么不能补齐引用证据

[finder/new](https://github.com/nvimdev/lspsaga.nvim/blob/cf6fc9473bba1d332eda9887855ea29ed9b37701/lua/lspsaga/finder/init.lua#L493-L570)按当前位置、可用method与includeDeclaration构造请求，buf_request_all收各client结果；handler保留client id，依各client offset_encoding把位置转byte，按method与文件显示结果。引用、定义与同名文本不是同一个列表。

完整 [finder_spec.lua](https://github.com/nvimdev/lspsaga.nvim/blob/cf6fc9473bba1d332eda9887855ea29ed9b37701/test/finder_spec.lua)（1544B；SHA256 `a8bdcb86f7cc65a28f9f462994880b987d18f3798685fbdb468a6f9d7aa19c08`）全部输入是创建两个finder buffer和一个other buffer；两条expected分别是进入finder buffer不清理、进入other buffer后移除autocmd并scheduled clean。这证明测试所保护的用户边界很窄，不能被称为完整引用fixture。完整 [fake_lsp.lua](https://github.com/nvimdev/lspsaga.nvim/blob/cf6fc9473bba1d332eda9887855ea29ed9b37701/test/fake_lsp.lua)是独立fake server材料，definition返回硬编码file URI；不能把它当真实仓库分析结果。本轮未运行二者。

## Archify consumer与成本判断

下列都读取固定dev源码，未借实验成果冒充合入功能：

| consumer | 当前合同与本轮剩余差异 |
| --- | --- |
| [sources.mjs L205–295](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/sources.mjs#L205-L295) | code来源必须path/range；同文档固定revision；git show读取完整文件再按行切片，保留bytes/hash。只核实位置/内容，不声称符号绑定或来源关系正确。无需引入ctags替代它。 |
| [reader.js L599–670](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/archify/explainer/reader.js#L599-L670) | 节点/正文citation共用prepared source；卡给路径/范围、14行预览、固定revision/外链；nodeBlocks可读正文。长卡focus不属于本轮新候选。 |
| [node-finder.js L62–80](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/node-finder.js#L62-L80) | 已把verified node sources的path/label/line/endLine加入节点搜索，与节点context一起匹配；它搜索已编写节点，不是repo符号查询。 |
| [template.source.html L1019–1055](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/template.source.html#L1019-L1055) / [focus.js L350–382](https://github.com/tt-a1i/archify/blob/6ca6a5c84439b57ea22e0630fe306e1d91587a6e/viewer/focus.js#L350-L382) | 共享sourceEvidence返回node sources；Passport显示verified repo、path和范围。连接级来源由#1141处理，不重复实现。 |

本轮没有证据要求共享schema增加symbol ID/query scope，没有真实“图问题→现有节点证据→源码”失败链，也没有可靠的外部导出完整输入支持新adapter。仅添加更多来源卡不会解决producer不完整或同名绑定问题，反而会让读者把展示层误认成语义验证。

若未来继续此方向，可从完整公开输入或明确标为构造复现的输入提出一个可比较的阅读问题，无需先证明生产事故或阅读效率问题。涉及外部查询时，记录固定repo/SHA、完整source文件、query/method、cwd/search_dirs或db集合、producer版本，以及已有原始输出和限制；尚未执行的查询保留为实验条件。最小比较可让读者定位文件/范围、区分同名候选和未查询范围，检查输出是否提供所需事实、操作是否更直接。以现有SourceCards为对照，若新方案具有明确且值得成本的输出或操作收益，即可做独立实验并保存同输入下的真实浏览器图片；无收益也可据此停止该方案。阅读效率或理解收益如要作结论仍需另测，截图或绿色gates只证明其实际覆盖的内容。

## 完整文件账目与限制

以下hash均为本轮下载读取的完整原文，固定SHA链接已在上文，不是运行回执：

| 完整文件 | bytes | SHA256 |
| --- | --- | --- |
| Telescope prompt_parser.lua | 3232 | `5db4beb0505c8ff6b563871e87eef9ccc8875e33b79769a4e8e3d452e5a97e54` |
| Telescope extension live_grep_args.lua | 2977 | `9c58d05ec7dfd998823cc2f6ffe137fc1932bfa441433cd8e7f9f992b32641ca` |
| Telescope shortcuts.lua | 1901 | `efaff002fb67e35cbff97422ec8ddd210a0de81c121b4edd5742e238ba61165d` |
| cscope init.lua | 14946 | `21147cdbff7400c89408004775aa4107bec6a922c009312fbd89c4c8bb5314bc` |
| cscope db.lua | 5573 | `169582e727b266c1d7c1c8c750fd494136b443514a68d49e9dfd736866d7fd56` |
| Codezoom model.py | 1754 | `4b8e58fb75893ff9657e4bf78265462106ffd3dd3415280b432b8000ba2cd1e0` |
| Codezoom _serialize.py | 1996 | `2bf9e450729c25a2155acdd55871445b06e9465a52b4d881997fa826116d6ea3` |
| Codezoom Python ast_symbols.py | 16342 | `61dd19b0eafa3e5d1a044c7debb8f42afdf01438a2659e399c885f8aaa4f29fe` |
| Codezoom template.html | 144663 | `cab2133278b1d93465b873bf2806624cc4af1dc5d968f5019b462fd0693f5906` |
| Lspsaga finder/init.lua | 17429 | `40d9174b933424429e179b95a5e103424d7776bcfac7509f17ec80698c414653` |

未重验53个实验、未复跑Archify测试、没有新截图、人类阅读实验或runtime语义证据。全文结论是本轮不实施，不是源码导航没有价值；后续探索可用完整公开输入或明确标为构造复现的输入比较具体阅读问题、输出与操作收益，不要求先有真实用户失败链。

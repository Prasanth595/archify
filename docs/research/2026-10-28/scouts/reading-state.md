# 阅读操作与阅读状态：六个新来源，以及 task-view / PR Lens 增量

2026-10-28。**本轮 0 个实施候选。** 找到六个此前 scouts 的 owner/repo 名称检索未命中的小型项目或有界子模块，深读三项的 consumer 与完整输入/测试。具体启发是从摘录到完整代码时保留当前位置、逐行解释的命中规则，以及解释失效状态的粒度。前三类都还没有足以超过既有实验/在审工作成本的独立缺口；不为凑候选再做静态解释页、编辑器、分析平台或持久审阅系统。

证据类型：官方 GitHub API 当前 HEAD/tree/compare、固定 SHA raw 文件与当前 Archify 源码静态核对。没有安装或执行任何上游程序、测试、模型、构建、服务、浏览器；没有本轮用户效果实测、效率或视觉结论。只写本报告。未以 star 排名。

## 现有能力和工作边界

当前只读工作区固定 [`a8456ef796ab62ba490b03fa0c896ae206edb5ea`](https://github.com/tt-a1i/archify/tree/a8456ef796ab62ba490b03fa0c896ae206edb5ea)，这是 diff-matches 实验 head，**不是最新 dev 或已合入状态**。

- [reader.js L490–541](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/archify/explainer/reader.js#L490-L541)已有作者 steps→图 spotlight、workflow 节点导览、sequence message 导览；L542 起已有代码复制，L547 起已有基于面板/选区的后续提问文本。
- [SourceCard L616–675](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/archify/explainer/reader.js#L616-L675)已有来源 revision、原始行号、最多前14行代码、原文链接、段落/节点关联，键盘焦点与 Escape 返回。只读 [parse.mjs](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/archify/explainer/parse.mjs) 和 [render.mjs](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/archify/explainer/render.mjs) 也确认源行范围、revision、snippet 原文渲染和步骤目标已有合同；不建议重新造这些字段或通用 tour。
- 已读取 [52项索引](../../2026-10-25/README.md)、gallery selection，以及旧 [本地阅读](../../2026-10-25/scouts/round18-local-reading-smalltools.md)、[代码导航](../../2026-10-26/scouts/code-navigation.md)、[命名项目增量](../../2026-10-26/scouts/named-project-refresh.md)。source keyboard、line-notes、author guides、task review map/occurrences、notebook/config 阅读均按已有工作计，不重命名新报。
- 同日官方 open issues API 第一页100项和指定 issue/PR正文核对：[PR #1015](https://github.com/tt-a1i/archify/pull/1015) 仍 OPEN，head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`，其 scope 已包含代码/来源 focus、SourceCard 全部展开/复制和 step locking；不是本轮代码已具备的能力，也不是可另开重复方案的空白。[#1103](https://github.com/tt-a1i/archify/pull/1103) Atlas 和 [#998](https://github.com/tt-a1i/archify/pull/998) Code Analysis仍在开放列表，按父任务要求排除。
- [#1133](https://github.com/tt-a1i/archify/issues/1133) 已明确可选 claim→既有 evidence 标识、缺失引用诊断和读者导航；[PR #1141](https://github.com/tt-a1i/archify/pull/1141) 对应 Architecture relationship source evidence。因此“说明链接到源码/证据”不是无人负责的新方向。[#1064](https://github.com/tt-a1i/archify/issues/1064) 属自愿反馈/更新告知，明确初期不做 storage，不可借题加入已读状态。[#1068](https://github.com/tt-a1i/archify/issues/1068) 为 standalone reading polish。此检索用于发现实际重叠，不宣称穷尽全部历史 issue。

## 六个新增来源

表内 SHA 为当次官方 API 解析的 HEAD；许可判断以正文/固定树为准，不能把 GitHub 的 badge 当全部文件许可。这里的“小”描述可深读的子模块，不是热度或收益证据。CodeABC 和 code-guide 已有较大产品面，仅考察指定消费者。

| 来源与固定 SHA | 许可与原始来源 | 可复用阅读动作 / 不采用原因 |
| --- | --- | --- |
| `he-yufeng/CodeABC` `671cce68ea385c1641ca5ca0ea443b86e00fb3af` | [MIT全文](https://github.com/he-yufeng/CodeABC/blob/671cce68ea385c1641ca5ca0ea443b86e00fb3af/LICENSE)，[CodeViewer](https://github.com/he-yufeng/CodeABC/blob/671cce68ea385c1641ca5ca0ea443b86e00fb3af/frontend/src/components/CodeViewer.tsx) | 在代码行上 hover/tap 读解释；整段解释重叠时取首个范围。与既有 line-notes、#1015 focus 重叠；不搬服务端 LLM/cache/编辑建议。深读见下。 |
| `seanoliver/code-guide` `441a54588d312ac4a154fc8bd4f3afea9c33c01e` | [MIT全文](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/LICENSE)，[build.py](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/skills/code-guide/build.py)、[template](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/skills/code-guide/template.html) | System→Snippets→Code三级显示保留文件/行位置；有技术价值但会引入第二套几何、row定位和相机状态，与既有 Code Analysis/Atlas重叠。深读见下。 |
| `PatAltimore/code-museum` `1ab53d6065765d4beee39830843606876b2bc279` | [MIT全文](https://github.com/PatAltimore/code-museum/blob/1ab53d6065765d4beee39830843606876b2bc279/LICENSE)，[app.js L281–354](https://github.com/PatAltimore/code-museum/blob/1ab53d6065765d4beee39830843606876b2bc279/public/js/app.js#L281-L354) | 按说明范围切源码块，在块后插解释，并生成说明索引。会先对整文件高亮再切行，以保留跨块 token；手写 ranges 不证明内容正确，重叠范围并无该循环的消歧处理。现有 line-notes/来源卡足以承接，不再做历史源码展馆内容页。 |
| `kjetilhartveit/kjetils-skills` `3c240e830b3d57d23e85bb7e0a95ca2581ab3b20` | 固定树未见 LICENSE，API license=null；[57行 walkthrough 指令](https://github.com/kjetilhartveit/kjetils-skills/blob/3c240e830b3d57d23e85bb7e0a95ca2581ab3b20/skills/explain-with-code-walkthrough/SKILL.md)、[kit.js](https://github.com/kjetilhartveit/kjetils-skills/blob/3c240e830b3d57d23e85bb7e0a95ca2581ab3b20/skills/explainer-kit/assets/kit.js) | 文字step左侧、固定代码右侧；step index决定完整状态，逆向滚动应恢复。只是新的作者指令和脚本范式，不是经过测量的逆向滚动正确性；已有 author guides/tours，不复制无许可模板或新增 scrollytelling runtime。 |
| `saphid/explain-skill` `621498580ba2f34c65b60843035454240f85e630` | [LICENSE全文L23–25](https://github.com/saphid/explain-skill/blob/621498580ba2f34c65b60843035454240f85e630/LICENSE#L23-L25) 明确 **blueprint-docs 不在其MIT授权内**，派生上游未声明许可；[skeleton](https://github.com/saphid/explain-skill/blob/621498580ba2f34c65b60843035454240f85e630/blueprint-docs/assets/skeleton.html) | primer折叠、词汇表、页面末尾不评分quiz，用来让读者发现没理解的部分。quiz交互不是理解收益证据；代码/内容页模板都不是本轮目标，且模板许可不能由根MIT一笔带过。 |
| `houshuang/ai-pr-review` `94b65f6b69ae1e9efc33ec0d626f92093ffb5960` | API license=null；完整固定tree未见 LICENSE/COPYING/NOTICE；[stale-sections](https://github.com/houshuang/ai-pr-review/blob/94b65f6b69ae1e9efc33ec0d626f92093ffb5960/src/stale-sections.js)、[完整测试](https://github.com/houshuang/ai-pr-review/blob/94b65f6b69ae1e9efc33ec0d626f92093ffb5960/test/stale-sections.test.js) | 对曾解释的PR patch增量标出过期section，忽略纯行号/上下文移动；但忽略大文件无patch、上下文变化可使解释失效。不将完整PR审阅平台接进离线Explainer。深读见下。 |

另一个发现入口 `ewraj/Annotate-Code` 官方仓库 API 返回404，未固定源码和许可，不算第七个项目，也不从第三方介绍推断现有功能。上述六个owner/repo在旧10/25 scouts名称检索无命中，只表示这次排重范围，不表示所有工具都首次被任何人发现。

## 深读一：CodeABC，解释范围命中与结构解析不是同一件事

读取完整124行 [CodeViewer.tsx](https://github.com/he-yufeng/CodeABC/blob/671cce68ea385c1641ca5ca0ea443b86e00fb3af/frontend/src/components/CodeViewer.tsx)、完整27行 [test_annotate_parsing.py](https://github.com/he-yufeng/CodeABC/blob/671cce68ea385c1641ca5ca0ea443b86e00fb3af/tests/test_annotate_parsing.py)，并追到 owning router [analyze.py L49–63、L150–188](https://github.com/he-yufeng/CodeABC/blob/671cce68ea385c1641ca5ca0ea443b86e00fb3af/backend/routers/analyze.py#L150-L188)。

实际链：获取文件内容和语言→语言+内容哈希组成 `annotate:v2` cache key→模型返回JSON→`_coerce_annotation_list` 取裸数组或对象中首个数组→viewer对DOM `.line` 索引+1→`annotations.find(start<=line<=end)`→提示。触屏 tap 同一行会关闭。这是范围驱动的提示，非编译器符号绑定，也不验证解释语义。

完整测试输入包括裸数组 `[{line_start:1,line_end:1,annotation:"a"},{line_start:2,line_end:3,annotation:"b"}]`；对象 `annotations` 包裹、中文key `批注` 包裹、None/空对象/标量。断言只约束结构归一化；未覆盖空项、越界范围、范围重叠、实际DOM行号、hover或触摸。没有运行测试。

反例：若两个范围都覆盖同一行，viewer取数组第一个，不能宣称优先最具体解释；若对象里先有别的数组，归一化取它也不证明是合法annotations。这些是从代码推导的边界，不是本轮上游实测缺陷。可借鉴的是把“结构可读”“位置有效”“解释可信”分开；Archify现有校验/固定来源和line-notes已能承担前两者，本轮不新增AI提示后台。

## 深读二：code-guide，语义缩放确实保位置，但不能只借一个按钮

读取完整254行 [build.py](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/skills/code-guide/build.py)、完整真实 [sealed-pr-11.json](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/skills/code-guide/examples/sealed-pr-11.json) 和 [reference.md](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/skills/code-guide/reference.md)。fixture为作者public side project PR#11导览配置：8个源码文件、17个highlights、13条links、8步tour；它引用本机 `~/code/address-book`，本仓未带这些源码全文，所以**不是可独立重放的完整代码fixture**，不据此推荐实施。

builder从文件读真实bytes后的字符串，substring anchor可用 `nth/after/to_nth` 消歧；多处匹配又未声明消歧会积累错误并退出。PR模式读取 `base...HEAD` diff，changed标记由hunk范围求交，不由作者手填。但作者写的call/data/http边即使两个端点都匹配，仍不是真实调用或执行证据。

阅读消费者 [template L866–911](https://github.com/seanoliver/code-guide/blob/441a54588d312ac4a154fc8bd4f3afea9c33c01e/skills/code-guide/template.html#L866-L911) 的 `locate` 记录实体id、相对u/v、最近row的源码行和dy；`fromRef` 在新层找同一实体/行；`setLevel` 调整scale和translation使该位置留在屏幕锚点。L366–379另有每层尺度与阈值，L805起要为每层重新布局。代码细节支持“尝试保留阅读位置”的判断，**不支持实际切层视觉稳定、无跳动或更快理解**；本次无浏览器。

可分离的启发是“看更多上下文时保持当前行位置”，但 #1015 已有 source focus +全部展开，52项已有源代码导航；要成为独立候选，须用同一真实长文件证明展开后当前行丢失，再比较轻量scroll-preserving expansion。不应因此移植三级相机/语义图、ELK布局或Atlas。这个输入与base/candidate缺口本轮没有取得，0候选。

## 深读三：ai-pr-review，只比较新增/删除文字会漏掉解释依赖

读取完整 [stale-sections.js](https://github.com/houshuang/ai-pr-review/blob/94b65f6b69ae1e9efc33ec0d626f92093ffb5960/src/stale-sections.js) 和完整27行 [stale-sections.test.js](https://github.com/houshuang/ai-pr-review/blob/94b65f6b69ae1e9efc33ec0d626f92093ffb5960/test/stale-sections.test.js)。额外读取完整review-storage.js/test了解generation身份，但不建议其文件锁/并发后台：那是上游完整产品责任，不是静态阅读页需要的新框架。

`changeSignature` 只收集patch中 `+/-` 行，丢弃hunk位置和上下文；`changedPatchFiles` 比旧diff和当前GitHub files；`staleSectionFiles` 从hunk文件及narrative/annotation/callout里的head citation求交，不把明确base citation算head。

完整小测试：旧 `src/a.js` 在10行加 `added`，新patch40行仍加同字；`src/b.js` 从 `kept` 变 `rewritten`；新 `src/c.js`；`src/huge.js` 当前patch=undefined。expected仅b/c变化。第二test的四section是hunk、head prose引用 `b.js:4`、base-only引用、untouched，expected只前二过期。上游测试源码能复核这个取舍，未运行。

反例：上下文把调用前提/权限改了，而PR自身新增文字没变，旧解释也可能过期；当前函数会视为未变。缺patch直接当unchanged是明确代码选择，不能写成“已确认不变”。basename fallback只取第一个匹配，也不建立文件唯一身份。可借鉴“过期提示与审阅结论分开”，但不能用该cheap signature宣称内容仍有效；Archify版本固定与完整材料比较另有合同，本轮不增加自动抓GitHub、后台重研或新的审阅状态。

## 两个用户指定线索的新增量

### task-view：2 commits，路径的已审和代码的已读不能混为一谈

当前 [`a3fa21767bfaeb3077fdda08bddb7249366caa93`](https://github.com/gtindo/task-view/tree/a3fa21767bfaeb3077fdda08bddb7249366caa93)，相对10/26报告的 `f27b8bef63ec336b8e3487e90ccd484a2fa7a235` 官方 [compare](https://github.com/gtindo/task-view/compare/f27b8bef63ec336b8e3487e90ccd484a2fa7a235...a3fa21767bfaeb3077fdda08bddb7249366caa93) 为2 commits：`45eb908` Track review progress and draw flows as branching graphs；`a3fa217` Scope the graph to what is picked in Flows。许可沿固定 [MIT](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/LICENSE)。

新增 [app.js L347–429](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L347-L429) 将localStorage key绑定repo abs路径+reviewName；node mark fingerprint包括change/ref/excerpt，hunk用其rows。hunk所有covering nodes均已读才为reviewed，没有covering node的hunk保留单独mark；避免自动把无人解释的行算已审，是具体有价值的边界。

但 **flowFingerprint只 hash `flow.path.join(" ")`（L394）**，`isFlowReviewed`仅查该fingerprint。若路径不变、节点代码变，node可回到unread，flow仍可Reviewed而折叠；这是源码逻辑推论，没有运行重现，不应直接搬成“版本变化自动重审完整流程”。flow card的steps read数与Reviewed本来就是两类状态，措辞需保留其差异。

图scope从选中step/edge/flow扩展，+N开邻居，测试边可附带但不当flow步骤：[app.js L1148–1203](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js#L1148-L1203)。读完整141行 [load_test.go](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/review/load_test.go)：branching可连、跳过unchanged service报flow_gap、tests边不连接flow、doc/config不能作步骤、未覆盖changed code报node_not_in_flow。它是完整合成fixture测试源码，非实际业务链运行证据。现有Task review map/occurrences、Route和关系focus已覆盖大量相邻问题；markport旧研究已讨论版本绑定已读。保留上述精细差异，0新候选。

### PR Lens：15 commits，数据模型视图与静态省略行

当前 [`918ffe82cb1dd71d20ce70b27917aeb80a7a4b49`](https://github.com/coldteadotai/pr-lens/tree/918ffe82cb1dd71d20ce70b27917aeb80a7a4b49)，相对10/26固定 `132ff8bd7d86a318a06965377f8511a267808a5a` 官方 [compare](https://github.com/coldteadotai/pr-lens/compare/132ff8bd7d86a318a06965377f8511a267808a5a...918ffe82cb1dd71d20ce70b27917aeb80a7a4b49) 为15 commits，新增data-model schema/layout/svg、store/table/key关系、示例和测试；不是上轮仅release/config更新。根 [MIT](https://github.com/coldteadotai/pr-lens/blob/918ffe82cb1dd71d20ce70b27917aeb80a7a4b49/LICENSE) 许可来源保留，正式复用仍按具体包/文件核对。

有界阅读动作是长表省略行：[svg/datamodel.ts L148–173](https://github.com/coldteadotai/pr-lens/blob/918ffe82cb1dd71d20ce70b27917aeb80a7a4b49/packages/renderer/src/svg/datamodel.ts#L148-L173) `paintFold` 输出虚线与 `+ N unchanged columns` / `+ N more columns` 文本，**没有在此实现点击展开**。读完整77行 [tall-tables.ts](https://github.com/coldteadotai/pr-lens/blob/918ffe82cb1dd71d20ce70b27917aeb80a7a4b49/packages/renderer/test/tall-tables.ts)：32列added table末尾FK、31列modified sessions含2新增、64列added table、users及两FK关系。fixture明确要求关键关系端点仍画出。这是完整构造输入，非生产数据库、测试运行或本轮真实fixture验收。

启发是省略必须说明省了什么，并保留关系端点；不是普通code focus，也不等于完整上下文可找回。当前任务只读Explainer reader/parser/render，不扩ERD/layout，数据模型类来源交由对应方向处理。没有证明把这类静态省略加到代码摘录比#1015展开更好，不另做长表说明页。

## 取舍与可复用验收边界

| 观察到的动作 | 价值 | 成本/影响 | 本轮决定 |
| --- | --- | --- | --- |
| 看更多源码时保持当前行 | 可减少展开后重新找行，尚未测量 | 应先在现有SourceCard expansion上验证；三级相机不是必要条件 | 与#1015交叠，缺当前真实失败/增益输入，0候选 |
| 已读、已审、解释过期分开 | 避免把历史阅读动作误当当前代码接受 | 一旦持久化，需要内容身份、更新、清理和诚实措辞 | 已有markport/Task研究，未证明新增独立状态值得 |
| 隐藏上下文要显示数量和性质 | 防止把省略当完整、把关系端点藏掉 | reader与render/shared schema影响需分开，不能直接搬datamodel | 保留验收原则，不添加功能 |

若后续出现独立缺口，完整真实fixture至少应包括固定revision的源码全文、当前已发布/实验文档原文及全部引用范围；base/candidate消费同一bytes，记录操作前后当前行、焦点、滚动位置、可复制全文、隐藏数量/端点和keyboard反例。代码/路径改变的状态测试必须分别检查node/hunk/flow而非只看一个绿色badge。以上是后续立项的最小验证设计，本轮没有生成或执行它，不计候选通过。

本报告按研究prose影响核对固定链接、来源文件和排重范围；没有运行Archify renderer suite，也没有测试、提交、推送、合入、发布或安装。结论是这些源码机制值得记住，但当前六项和两项增量均不足以提出第53个独立实验。

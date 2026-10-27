# Batch 17：独立 SVG 长描述是有价值的已批准需求，已有贡献者认领，不另开实现

日期：2026-10-28。产品基线固定 `origin/dev d5d979493bba650b3995836afd379cd249f2d0dd`。ref 去重使用 root 本轮 `/tmp/archify-round17-remote-heads.txt`，源码均按固定 SHA 读取。本轮仅阅读源码、现有测试、原始 GitHub 讨论、上游固定版本与许可证；没有 render、测试、browser、工作树、安装、源码改动、PR、评论或 push。唯一新文件是本报告。

## 决策：problem go，独立实现 defer

**这是尚未进入 dev、值得做且成本较低的窄 authoring gap；但不是本轮新发现，也不是无人负责的研究机会。** 它正是 [Archify #1112](https://github.com/tt-a1i/archify/issues/1112)，维护者已批准方向，贡献者 testikun 已认领。因此不新建一个相同实验、不修其分支、不代其提交。后续若出现贡献 PR，走只读 review；如原 owner 明确退出或维护者明确重新分工，再按同一已批准范围实现，而非另起一套描述/阅读替代框架。

本轮没有发现需要覆盖已有决定的新产品事实；Mermaid/Quarto 只为合同取舍提供一手参照，不构成重新认领需求的理由。

## ownership 与当前实现状态

- #1112 当前 API 返回 open，作者 noelmcloughlin。作者报告自己在文档里嵌入 Archify SVG，已将五段说明压缩到 369/386/390/398/399 字符，以免可见 subtitle 重复附近正文。**这些长度和使用经历是作者自报，本轮没有取得其五份图或 screen-reader 会话复现。** 不把它们当成我们的自然实测。
- [维护者方向批准](https://github.com/tt-a1i/archify/issues/1112#issuecomment-6430166515)：optional plain-text `meta.description`，最多 2,000 字符；description → subtitle → localized default；只改 shared SVG accessible-description path 与 native schemas/callers；保持 escaping 和 standalone SVG export；visible header、raster title band、node explanation、translation cap 均不扩张。并明确 implementation acceptance 仍待提交。
- [贡献者 testikun 的 scope claim](https://github.com/tt-a1i/archify/issues/1112#issuecomment-6432803594) 明确认领同一范围，并计划 current dev、presence/absence、special characters 与 exported SVG sample。
- 本轮 GitHub PR 搜索 `repo:tt-a1i/archify "1112"`、`"meta.description"`、open `author:testikun`、open `description in:title` 均无结果；不能由此宣称不存在任何未关联/私有/本地实现，也不把暂未看到 PR 当作 owner 放弃。
- refresh refs 唯一 description 命名头 `geo/description-workflow = 5fb18b054182204e1326a3be5d55552a84fcc826`，commit 是网站 description-first workflow 文档，相关 diff 不涉及 native schema/shared SVG desc；这是措辞重名，不是 #1112 实现。
- fixed dev 的 `archify/`、`viewer/`、`test/` 没有 `meta.description` 使用；native meta schemas 是闭合对象，当前没有这个可提交字段。源码证据足以确认 gap 尚在；本轮没有执行未知属性拒绝测试。

## 现有 Archify 路径：metadata 不等于全部阅读替代

| 接口 | 固定 dev 的真实行为 | 本次获批字段能改变什么 / 不代表什么 |
| --- | --- | --- |
| Native diagram JSON | 十种 native renderer 共用 svgRootAttrs/svgAccessibleText；各 native schema 定义 meta，现无 description；common.translations 单值 min1/max400、最多600条 | 加一个 authored plain-text 图级字段，不能借此扩大 translations 或 explanation 数据 |
| Native standalone HTML 的主 SVG | `archify/renderers/shared/cli.mjs:376-400` 发 `role="img"`，`aria-labelledby="archify-diagram-title archify-diagram-description"`；title 是 meta.title；desc 现在取 `meta.subtitle || translateMessage(...diagram.description.<type>)`，两者均经过 esc | 可独立写 `<desc>`，让短subtitle与长图意并存；当前 ARIA 把 title+desc 都列入 labelledby，**不能直接称为与 Mermaid 的独立 describedby 行为相同**，也不在这片需求里顺手改 ARIA 关系 |
| Subtitle 的可见 HTML | `shared/cli.mjs:234-245` 单独把 meta.subtitle 给 applyTemplate；`shared/utils.mjs:195-206` 生成 header 的 p.subtitle，空/缺省省略 | 已批准 description 不进入该槽，故无需绘制长文字或改变 header |
| PNG/JPEG/WebP figure title band | `viewer/export.js:475-525` 从 .header h1/.subtitle 读取并画出可见 title/subtitle；`:570-600` 将 serialized SVG 作为 Image 画入 canvas 后 toBlob | description 不是新的可见图题；最终 raster 是像素，canvas 路径没有宿主 HTML alt 或该图 `<desc>` 的通用可访问接口，不能宣称“PNG 也带同等长描述” |
| Standalone SVG export | `viewer/export.js:244` cloneNode(true)，清理 runtime state，`:426-430` XMLSerializer 输出整个 clone；`export-cleanup.js` 清探索状态，没有一条删除 title/desc 的规则 | 元数据在该 clone 的 source DOM 中，原样保留应可用导出样本验证；源码推论不是本轮已操作导出或 screen-reader 通过 |
| SVG / PNG 作为宿主文档 `<img>` | Archify 生成 `<desc>` 并不拥有外部 Markdown、CMS 或文档的 `<img alt>`；外层名称/描述仍取决于嵌入方式和宿主 | 不承诺给任意嵌入方式自动提供等价 text alternative，也不产生相邻 long-description 链接或正文说明 |
| Visual-check PNG / contact sheet | `archify/bin/visual-check.mjs:1880` 调 Page.captureScreenshot；`:2034-2038` evidence sheet 的 img.alt 是 theme+width+height，figcaption 是 containment/尺寸状态 | 这是检查产物的识别标签，不是 authored diagram content 的替代说明；本次字段不会自动改它 |
| Explainer contained image | `archify/schemas/explainer.schema.json:625-649` 的 image block 独立要求 alt，可另给 caption；`archify/explainer/render.mjs:87` 发 escaped img alt 和独立 figcaption | 该接口已存在，但属于独立 Explainer image；不自动从 native SVG meta 继承，更不能把它当作 #1112 已解决 |
| Node Passport explanation / source / caption | 节点级 explanation 与图级 desc 是不同粒度；图注和周边 prose 也不等于 native artifact metadata | 不新增自动全图摘要、逐边文字替代、阅读面板、音频、LLM推断，保持已批准范围 |

`archify/schemas/common.schema.json:15-19` 的 400 字符是 UI override 契约，不是任意 description 的内容限制。`archify/references/authoring-contract.md:73-98` 将 locale/translations 定义为 renderer-owned surfaces，`:145-149` 还要求 subtitle 默认省略，只有明确要求时才用短支持行。作者用长 subtitle 描述完整图意会违背这两个表面的用途；不是再写一段更精炼 UI 翻译就能一般解决。

共有十个 native SVG 调用者：Architecture、Workflow compiler、Sequence、Dataflow compiler、Lifecycle、ERD、Class、Tree、Timeline、Waterfall。独立 Explainer 不是第十一个同合同 SVG caller；不能为“所有格式一致”偷偷把它也扩到本片。

## 同一用户任务上的上游参照，固定源码与许可

任务保持一致：**作者在文档 figure 中保留短可见标题/图注，同时为复杂图提供自己写的更完整文字；文字不应被强制挤进可见副标题。** 下面只比较这一合同，不按功能数量评价工具，也不复制实现或 asset。

### Mermaid：描述是作者在图源里提供的独立文本

固定版本 `mermaid@11.12.0`：annotated tag 对象 `2fecf17bc47174f22b34650fa3e734fd8ea20b89` 解引用到 commit `0116b272b4b558f60ec292fb994148956287eaa1`。从官方 GitHub tag API 实际读取，未把可变 develop 当固定版本。

- [该 revision 的 Accessibility Options 文档](https://github.com/mermaid-js/mermaid/blob/0116b272b4b558f60ec292fb994148956287eaa1/packages/mermaid/src/docs/config/accessibility.md) 给出 accTitle、单行 accDescr 与多行 accDescr block，是作者直接写入的描述，不是自动从拓扑生成保证准确的替代叙述。
- [该 revision 的 accessibility.ts:41-59](https://github.com/mermaid-js/mermaid/blob/0116b272b4b558f60ec292fb994148956287eaa1/packages/mermaid/src/accessibility.ts#L41) 给 desc 写文本并建立 aria-describedby，title 独立建立 aria-labelledby；描述不绘制在 SVG 画布。空值可省略。它支持“视觉说明和描述分离”的设计，但不能据此推导所有 embedding/AT都可靠读取，更不能把它的 ARIA 改动附带进 Archify #1112。
- [同 revision LICENSE](https://github.com/mermaid-js/mermaid/blob/0116b272b4b558f60ec292fb994148956287eaa1/LICENSE)：MIT，版权文件可核。这里只读合同，未引入 Mermaid dependency 或复制代码。

### Quarto：caption、alternative name 与 Mermaid description 要分开理解

固定 Quarto source commit `eb1c5db2c12bc8e07cb00e97455b503782d3458b`（本轮 GET main 后冻结，commit 日期 2026-10-27；**不是声称某个发布版已包含**）。

- [mermaid handler:230-235,260-261,416-418](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/src/core/handlers/mermaid.ts#L230) 让生成图像的 fig-alt 和可见 fig-cap 分开传递；静态SVG及browser Mermaid路径分别消费显式 alt。它不是简单把 figure caption 同时塞给 desc。
- [svg.ts:126-140](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/src/core/svg.ts#L126) 明确 fig-alt 替换的是 accessible name，既不是 caption 也不是 description：显式字符串覆盖 aria-labelledby、设 role=img/aria-label；空字符串按decorative处理；非字符串不介入。浏览器路径的 [mermaid-init.js:47-59,278-279](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/src/resources/formats/html/mermaid/mermaid-init.js#L47) 也实际调用同样的处理；原先 Mermaid accDescr/aria-describedby 不在这段逻辑里被删除。**所以 Quarto fig-alt 并不等于 Archify 想要的长 `<desc>` 字段**。
- [上游 #15077](https://github.com/quarto-dev/quarto-cli/pull/15077) 的原始实现与验证说明也区分 native Mermaid accessibility 与显式 fig-alt，以及不同输出路径；这里只读其报告，没有重复其测试或认证报告。查到的 [LaTeX follow-up #15087](https://github.com/quarto-dev/quarto-cli/issues/15087) 仍描述某些格式不保留 alt，故本轮绝不从 HTML/SVG helper 推导“Quarto所有格式均已覆盖”。
- [同 revision COPYING.md](https://github.com/quarto-dev/quarto-cli/blob/eb1c5db2c12bc8e07cb00e97455b503782d3458b/COPYING.md)：MIT（Posit）。这里只读接口及许可，没有 vendor/移植代码，不能据一个root许可替第三方依赖背书。

初始搜索指向的旧 Quarto `0e28ab3aedd44be2c95433a29a6aff9250fbcc75` 的 mermaid handler 不含上述 fig-alt 传播；本轮随后核对固定 current-main 源码，避免把旧历史行为当成今天的支持状态。

上游比较带来的实际结论很窄：**分离 authored text 和 visible caption 是有现成一手依据的接口选择；export/embedding/output format 的 metadata传播仍需逐路径验收。** 它加强 #1112 已批准方向，不增加新 gap。

## value / cost / impact

**Value：明确且已获批准。** 作者可以同时保留短subtitle和长图意；不再把 per-figure authored content 当 UI translation 使用，也不用只为400字符cap删掉必要解释。这是一个可直接验证的 authoring 能力，不需要先做用户研究来证明 schema 无法表达两段独立文本。但质量仍由作者负责：长描述可能遗漏/写错关系，字段存在不是可访问性或内容正确性证书。

**Cost：低到中、范围可控，owner已承诺。** 核心是共享 fallback 的一处变化和十种 native meta schema 对 optional plain string≤2000 的接受；再同步 standalone validators及相关生成输入。没有新 runtime依赖、图布局、渲染文字测量、Viewer面板或新导出格式。作为十模式 shared/contract change，不宜只改一模式后宣称完成，也无需新建十模式×locale×specialchar的大矩阵。最终生成例子/ZIP及CI由贡献范围/集成流程处理，本轮不执行。

**Impact：主要是 authored-content metadata 与可访问树文本。** 字段缺省时描述和可见输出都必须保留；字段存在时只改变desc，字幕、SVG geometry、raster title band、cards、节点explanation以及translation400char cap保持原合同。保持HTML/XML escaping，不能把plain string当Markdown/HTML；不要扩大为自动图摘要或AT认证。新增字段将被旧版本schema拒绝，是合理的additive新版本输入能力，不等于旧安装也支持。

按 CONTRIBUTING 的 scoped agreement / related work 要求，维护者scope comment 已满足方向同意；贡献者claim应被协调而非重复占用。按 REVIEWING / archify-review，审查应落在真实fallback、caller覆盖、exports、维护成本，不能只看生成validator绿灯。

## 若贡献 PR 出现，按现有 scope 只读 review 的最小问题

- description / subtitle / localized default 先后关系；缺省输入对照无新增空subtitle行、无可见图题或geometry变化；十种caller的schema与共享函数是一致路径。
- plain string边界、2000字符上限与特殊字符/Unicode的HTML/XML escaping；不把作者的图意送入UI翻译、script或markdown解释。
- 在实际导出的standalone SVG内检查title/desc及根ARIA引用仍指向存在节点；源HTML有desc不等于export已验证。
- 对保留了短subtitle的图检查visible header/raster title band仍是短值；用existing focused i18n/export/native契约覆盖，不为所有组合建重复matrix。
- 分清DOM/SVG检查、浏览器AX观察、实际AT读出与人类阅读效果；前两者不能被写成VoiceOver/NVDA/全格式保证。不同输出格式的alt传播不能从desc字段存在自动推断。

本轮未找到贡献PR可供review，因此没有inline finding，也没有代修。最合理后续是保留这份去重与路径审计供已有owner的PR review，**不新增独立Batch17实现**。

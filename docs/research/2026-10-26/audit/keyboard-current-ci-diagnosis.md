# #1124 当前 CI：重复的 Sequence 首屏失败，只读诊断

结论：**本次与 #1121 的失败测试、断言位置和完整几何 JSON 相同；没有证据表明失败用例调用了本候选修改的 Explainer 键盘遍历。** 可以称为相同签名再次出现，不能据此称已知根因、已确认 flaky、误报或键盘修订正确性的反证。当前 hosted 失败仍有效；此报告未重跑测试、浏览器或工作流，也未修改测试/产品/依赖。

## 精确身份

- 当前 #1124 head：`f9fc38cbc19f5bb2725fd54d957e182831eb1eb9`；run `40431526745`，job `121950169322`，`browser-regression (2)`。使用父任务保存的[当前原始摘录](keyboard-current-ci-failure.log)，目标失败时间 `2026-10-27T01:19:36Z`。
- 对照 #1121 head：`843c877b251baf89925f99e11594fc5630c1c165`；run `40423164172`，job `121922351456`。[先前摘录](task-flow-ci-failure.log) 的失败时间 `2026-10-27T00:00:58Z`；[先前诊断](task-flow-ci-diagnosis.md) 包含一次 macOS exact-head 全 Reader Layout 文件通过的独立证据。此处复用其原身份，不称 #1124 本地通过。
- 当前候选已合入产品 `dev@500d4a65211ffe607fde6b3ce7505027b45bb59e`；本候选相对此 dev 的产品/测试变化只有 `archify/explainer/browser-check.mjs` 与 `test/explainer-browser.test.mjs`。相对此前产品 `e837dc4cb83042d2b6c596e039692e25ec62c2da`，另有静态输出 checker 及其测试的 dev 更新。
- 仅此报告为本轮写入范围；没有提交、push、评论、工作流 rerun 或新 worktree。其他代理正在使用浏览器，本诊断没有操作浏览器。

## 两次失败的观测逐项相同

两个 log 的 `error: '{...}'` 独立解析为 JSON 后相等，不只是测试标题相同。

| 观测 | 两次值 |
| --- | --- |
| 测试 | `compact automatic Sequence fits the initial desktop stage without shrinking source text` |
| 测试位置 / 调用 | `test/reader-layout-browser.test.mjs:657`；`fits(shortWide)` L811，内部 L705 |
| viewport | 1396×480 |
| SVG viewBox | `0 0 560 327`；width/height属性均null |
| SVG rect | top67 / bottom557.5 / left278 / right1118 |
| stage rect | top58 / bottom626.5 / left32 / right1364 |
| controls rect | top421.5 / bottom463.5 / left986.890625 / right1347 |
| SVG width / sourceWidth / minimumTextScale | 840 / 560 / 1.5 |
| legend | corner=true；bounds top504.5/bottom557.5/left47/right174.515625；originalSvg=true；count1；leftGap0/bottomGap0/navOverlap0 |

失败是 viewport containment：SVG bottom 比480高77.5px，stage bottom高146.5px，均超过断言允许的481px；controls在viewport内。源码字号没有缩小，且840正好为560×1.5。不能把本次写成“文字被缩小”“1.5倍cap失效”或“图例与导航重叠”。legend corner只是观测，本短宽分支没有对它调用 `legendPlacement` 断言。

旧诊断中的一次macOS观察为SVG width575、scale约1.0267584、SVG bottom402.75、stage bottom471.75、legend corner=false。这说明存在另一种通过的布局结果，不证明失败来自race，也不证明当前Linux运行能靠再等待恢复。

## 失败输入与执行路径

在当前精确head读取：

1. `test/reader-layout-browser.test.mjs:658–668` 从固定 `test/fixtures/reader-readability/compact-roundtrip.sequence.json` 派生输入；先把accepted消息y改236。L805–807再清空segments/cards，仅留client→worker、y160、label=`Check status`的一条消息，生成临时 `short-wide-sequence.json/html`，以1396×480导航。
2. `renderSequence()` 调用 `archify/bin/archify.mjs render sequence <temp-json> <temp-html>`；CLI `commandRender` L4273–4289只启动选定renderer。没有执行deliver、finalize或静态 `check-render-output.mjs`。该dev静态checker更新不是这条render路径的几何操作。
3. 生成后由共享 `ChromeVisualBrowser` + raw CDP导航/测量；L701–709的 `fits`先断言SVG/stage/controls containment，再判断最小文字scale与放大cap。这里的第一个断言已经失败。
4. `load()` L113–123先设置CDP viewport/media、等待load，再调用 `stable()`。L76–85已等待 `document.fonts.ready`，并两次依次等待 Reader/ViewerChrome `whenStable()`。不能说测试“完全没等字体或resize”。
5. 当前case没有导入、调用 `inspectPublicHtml`、`inspectExplainerBrowser` 或键盘检查函数；不会读取 `experiments/keyboard-traversal/**`。它确实从 `visual-check.mjs` 导入 `ChromeVisualBrowser/findChrome`，而该模块也导入Explainer checker；**被加载不等于被调用**。候选变化是函数定义与Explainer专属观察逻辑，不修改ChromeVisualBrowser或native Viewer脚本。不能由模块依赖关系声称键盘算法在这条case中实际运行。

这排除了已见源码中的直接调用链，不是“任何同机资源/进程影响都绝不可能”的证明。CI同一分片还执行其他测试文件，运行器默认test-concurrency=2；当前摘录不足以审计所有进程干扰。

## 同源证据与 CI 配置

`e837dc4c`、`843c877b`、`f9fc38cb` 三个revision以下Git blob完全相同：

| 路径 | Git blob |
| --- | --- |
| `test/reader-layout-browser.test.mjs` | `12ea1e2cba0ad3d561de57b8d72a0063d0dd5a91` |
| `test/fixtures/reader-readability/compact-roundtrip.sequence.json` | `d9328932813e7edda0baf69f7cd9866e19346a38` |
| `viewer/reader-layout.js` | `76959b83a3f1a9a24f955d63f7afb080796b923f` |
| `viewer/viewer-chrome-layout.js` | `06d15935a0f4e1d9e60adae5d1a68a309d1ba22e` |
| `viewer/template.source.html` | `c014621b85e8fe03a9fa9aa560244894387c49c8` |
| `archify/renderers/sequence/render-sequence.mjs` | `2192e3a643c1cc3f60442339a93c20a3d1db98ac` |
| `archify/bin/archify.mjs` | `dc9ae00dbfc3fbd2e769cc63cc8c277259f57a43` |
| `archify/bin/visual-check.mjs` | `e6b762a4cf5d6c7f54fd44b17f949b033f6ae1f1` |
| `.github/workflows/ci.yml` | `f2c4912415a04436a2484c3e42bccb621f09791c` |
| `scripts/run-browser-tests.mjs` | `bfbb17a911e4357a81b2d4563c06b2febfffeb52` |
| `scripts/browser-test-inventory.mjs` | `2b8cf97bced5b7f4f82fae1724737a8b2347617c` |

测试runner选项和根/archify lockfiles也相同。`.github/workflows/ci.yml:179–217`指定ubuntu-latest、Node22、setup-chrome action固定SHA、`chrome-version: stable`、`ARCHIFY_CHROME_NO_SANDBOX=1`，执行 `npm run test:browser -- --shard=2/2`。`visual-check.mjs:1528,1548`用headless-new和该环境对应的no-sandbox。脚本源/配置相同不代表实际Chrome版本、OS image、Node补丁版本或时序相同；摘录没有这些运行时版本，不补填。

本job没有设置 `ARCHIFY_READER_EVIDENCE`。测试L1006–1009的finally虽支持写 `reader-observations.json`，默认仍会删除临时HTML目录；当前失败log没有布局预算与原HTML绑定，不能事后从几何反推完整现场。

## 已有分支解释：只列推断

`viewer/reader-layout.js:316–392`计算 `readableWidth`、`fixedHeight`、`availableSvgHeight`、`desiredWidth`、`sequenceFits` 和 `readingScroll`。compact Sequence若能保持源字号放下会走首屏fit；否则width-first路径保留scroll。L270–275将SVG自动放大限制为1.5倍；L305只有 `!readingScroll` 才为overflow缩窄。

840宽、scale1.5、超出stage与“选择阅读scroll后碰到1.5倍cap”的结果相符，**尚未记录到该分支变量，不能把相符写成证明**。目前没有fixedHeight、availableSvgHeight、readingScroll或先后layout generation的数据。稳定等待只保证采样状态连续相同，不保证布局一定在viewport内；现有稳定机制也不是缺失的。

## 最小下一步诊断（建议，未执行）

不建议直接改字体阈值、放大cap、等待次数或测试预期。若另行决定继续定位，最小有判别力的一次检查是：

1. 在当前head、同一Linux/Chrome运行环境保留这个Reader Layout文件的既有执行顺序，记录真实OS/Node/Chrome版本、flags、测试并发。明确只运行这一文件；旧报告的名称filter匹配parent，实际跑了全部17nested subtests，不能沿用后声称只跑一个child。
2. 给本用例的失败现场增加有界**诊断记录**，不改变布局或断言：绑定派生JSON/生成HTML SHA，保存当前 `stage()`结果、根data-reader-*及CSS预算属性、scrollHeight/scrollY、字体状态、header/diagram/body的计算尺寸与margin/padding。在既有stable之后、fits之前记录首个状态，失败后再被动采样一小段frame序列，先保留第一次失败，不用后一次通过覆盖它。
3. 若DOM预算仍不能解释分支，只在独立诊断副本的 `measure()`处记录上述预算/sequenceFits/readingScroll值及对应generation。当前公开 `readerLayout.receipt()`只返回ratio/width，**拿不到这些私有变量**；不能假称已有receipt已包含。不要为取值额外调用 `measure()`，那会改变正在诊断的状态。

这组最小证据能区分：已稳定且选择了scroll分支、首个snapshot与后续frame变化、预算是否错误或Chrome reserve后变化。仍需出现失败现场才能解释当前hosted失败；单次本地通过、再次hosted通过或等待后通过，各自只能作为新观察，不能独自证明flakiness/root cause。

目前workflow尚未被本报告判为整体完成。Windows与WebM/aggregate gate由父任务分别跟进；没有读取这些job的原始日志，不把聚合红灯写成第二个独立产品缺陷，也不把仍在运行的gate写成通过。

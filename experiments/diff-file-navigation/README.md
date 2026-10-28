# 多文件 diff 导航实验

独立分支 `codex/lab-diff-file-navigation`，比较基线 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`。本实验供独立远程分支审阅，没有合入 diff-matches 或 task-review-map，也未合入 dev、发布版本或修改 live 安装。

问题是普通 Explainer diff 完整保留多个文件的补丁，却只有一张连续表。读者能否从局部文件目录直接到指定文件段，并返回原目录项？这是可验证的行为问题；本实验没有测量阅读效率、节省时间或用户偏好。

## 可查看的对照

- [真实历史 baseline](history-base.html) / [candidate](history-candidate.html)：完整 8309 B、153 行、2 文件补丁。1440 × 900 的初始页面第二文件位置分别为 4798 / 4893 px，均不在首屏。
- [上游完整 fixture baseline](upstream-base.html) / [candidate](upstream-candidate.html)：完整 736 B、24 行、2 文件补丁。
- [内容与浏览器观测](logs/artifact-verification.json) 对四页逐行比较原始 code 内容、确认基线无目录、候选有两项、无断链/console error/水平溢出。实际 Ego 截图及原始 JSON 已收录在 [browser-evidence](browser-evidence/binding.json)。

四页经普通 `archify render explainer INPUT OUTPUT` CLI 生成，使用相同 formal JSON 输入，未后处理 HTML。JSON 中 `text` 是完整原件，包含最终 LF；它与 Markdown `@diff` 共用 parser 和 renderer。

## 最小实现

`parseExplainerDiff.startFile()` 记录每个文件段的 rowIndex 与可识别的 old/new path。renderer 只在至少两个文件段时输出局部目录。目录链接到保留的 `explainer-` 命名空间内、以 block.id 与行位置形成的 ID；重复路径仍是不同段，两份相同 diff 互不串跳。段首 `tabindex=-1`，有返回对应目录项的链接。全部是原生 anchor，无新增 JS、history 状态、依赖或 schema。

`---/+++` 路径优先，rename/copy 元数据补充路径；`/dev/null` 使用实际另一侧路径。明确识别不了的 git-header 路径用 File N；不会猜测路径。保留现有 quoted-path 解码，Git C octal 转义不做完整解码，显示其转义表示。单文件和无文件 header 的片段不增加目录。原始 raw/ending、行号、计数与顺序不变。

读取了 MIT 项目 diff2html 的文件目录 renderer/template，独立实现了局部目录行为，没有复制 filename hash ID。完整参考原件保存在 fixtures，许可保存在 `fixtures/diff2html-LICENSE.md`。不是 diff2html 的完整 Git parser 移植。

## 来源与复现

参考仓库 `rtfpessoa/diff2html` 固定提交 `72331ff5d13a8d4d1f11256a7b554dd0d69d7014`：

- `src/file-list-renderer.ts`
- `src/templates/file-summary-line.mustache`
- `src/__tests__/diff-parser-tests.ts` 的 `should parse diff with multiple files`（L703–729）；完整测试源 82255 B，Git blob `dde2778eba624d4ab6e4a7e55dbeacac186e3186`。
- 从该测试的完整 `const diff` 字符串解码得 736 B，24 行、最终 LF，SHA256 `5d99c33fdbca5a7b97d7b68c9403f667d6e576d32f4736ec9c6b33a0798fa6c4`。没有执行上游代码。

获取原件使用 `gh api repos/rtfpessoa/diff2html/contents/PATH?ref=72331ff5d13a8d4d1f11256a7b554dd0d69d7014 --jq .content` 后 base64 解码。历史原件使用：

```sh
git show --format= --no-ext-diff --no-color bca9b0ef2ab9150aa91f3c681d1d4f9b453f995f
node experiments/diff-file-navigation/build-evidence.mjs
node experiments/diff-file-navigation/verify-evidence.mjs
```

[输入与最终产物 hashes](logs/hashes.json)，[最终 candidate CLI 命令和输出 hashes](logs/render.json)。`build-evidence.mjs` 从固定基线 `git archive` 解压独立 CLI，依赖复用当前 checkout 已安装版本；候选从工作区 CLI 生成。当前开发 runtime 是 Node 26.12.0；ZIP 与 generated 检查使用官方 Node 22.23.2 / zlib 1.3.1-e00f703。

## 验证与边界

- `npm run test:focus -- test/explainer-diff.test.mjs test/explainer-renderer.test.mjs`：[27/27](logs/focused-narrow-final.log)。覆盖 CRLF 重建、重复路径、metadata-only rename/copy、add/delete、纯 headers、歧义路径 fallback、单文件/片段无目录、两个实例与作者 ID 不冲突。
- `ARCHIFY_EXPLAINER_BROWSER_TESTS=1 npm run test:focus -- test/explainer-browser.test.mjs '--test-name-pattern=diff file links'`：[1/1](logs/browser-narrow-final.log)，实际 Chrome 两个实例的 Enter 跳转、目标焦点、可见性、返回焦点，以及 JS 禁用同一行为。新增 390 × 844 / dark 长路径验证：实际 Tab 聚焦返回项时控件在屏内、scrollLeft=0；Enter 返回后 scrollLeft=0 且目录项 top≥80。过滤后实际执行 1 项，无 skip。
- `npm run test:focus -- test/explainer-parser.test.mjs test/explainer-cli.test.mjs test/explainer-packaging.test.mjs`：[39/39](logs/integration.log)。
- `npm run test:generated`：[通过](logs/generated-narrow.log)。没有需要更新的 gallery / viewer / schema 输出。
- 官方 Node 22 下 `scripts/build-zip.sh`：[通过](logs/zip-narrow.log)，更新根目录 `archify.zip`；未安装到任何 agent。
- 源码、测试和自写文档的 whitespace 检查通过。完整 staged 检查另报告原始 patch 空白上下文行及失败日志中的行尾空白；这些原件逐字保留，没有为消除提示改写证据。

按 test-value 保留既有 byte/secret 验证，增加最便宜的分段/渲染断言及一项真实浏览器交互，不增加无关测试族。Focused simplify survey 追踪 parse → render → 原生 anchor：没有第二个分段 parser 或 JS 状态，未发现值得另做抽象的重复路径。

保留的失败尝试：`logs/focused.log` 最初将 metadata-only git 段后无独立 git 标记的 plain headers 当成新文件，实际 parser 认作同文件；修正构造输入并单独验证纯 headers。`logs/build.log` 为完整仓库 archive 内存 buffer 超限，改为仅相关 tracked 文件输出临时 tar；`logs/build-schema-failure.log` 为最初 JSON 缺必需 sources。`logs/author-id-*-fixture-failure.log` 是渲染专用旧 fixture 带 raw HTML title，不适合新加的 validator 前置检查；改成合法标题。review 发现最初生成 ID 会碰撞合法作者 ID，已改用现有保留命名空间并添加实质回归。

未测：Firefox/Safari、屏幕阅读器实际朗读、未来与 diff-matches 锚点组合、完整 Git C quoting 语义、阅读速度。没有运行全仓无关 suite 或远程 CI；本地通过不代表合并、发布、视觉偏好或用户接受。

窄屏修正：root 实际交互发现返回链接在长 header 尾部，Tab 会把代码表横向带偏；现将返回链接放到 header code 前的独立小行，并为目录链接增加顶部滚动余量。原始修前截图和观察已逐字节复制至 [归档目录](browser-evidence/archive-before-narrow-fix)，没有改写。既有长代码横滚与窄屏约 10px 的原始页面溢出不在本次修复范围。


## 真实 UI 证据与交付状态

主图：[final-history-file-list-light.png](browser-evidence/current/final-history-file-list-light.png)。[binding.json](browser-evidence/binding.json) 是派生绑定清单，记录每张原始图/JSON 的字节数、SHA256、来源及对应 HTML hash，不替代或修改原始观测。

- 当前证据：baseline 一张 PNG 与 `base-observations.json`，以及四张 `final-*.png`、`final-desktop-observations.json`、`final-narrow-observations.json`，均在 `browser-evidence/current/`。baseline 绑定 `bb6dd482…f41241c`；最终 candidate 绑定 `64aea5b3…d39ae2`。
- 修前归档：四张旧 candidate PNG 与旧 desktop/narrow JSON 在 `browser-evidence/archive-before-narrow-fix/`，明确绑定 `c5a4e6e9…25af97`。它们显示发现过程，不能作为最终 UI 通过证据。
- root 使用实际 Ego UI 查看并操作最终桌面 1440 × 1100 / light、窄屏 390 × 844 / dark。桌面目录两项可跳转；窄屏返回入口在屏内，Tab/Enter 前后 `scrollLeft=0`，返回后第二目录项 y≈120，保留目录上下文。最终 desktop JSON 的 `rawRowsEqualToBase=true`，原文仍为 153 行。
- 独立代码/证据复审 READY；root 已查看最终四张 PNG，视觉复审 READY。这些是 agent 执行与检查结果，不代表人类用户偏好接受。

已知限制：390 px CSS 视口下既有页面宽度为 400 px；约 10 px 页面溢出与窄屏行号换行未在本实验修改。长代码仍按原合同横向滚动。此次验证是 Desktop Chromium CSS 视口，不是实体触屏设备。

具体执行范围：四张 HTML 通过普通 `render explainer` CLI 生成，直接调用 `inspectPublicHtml` 的浏览器观测以及真实 Ego UI 操作验证；没有对这四页执行 `finalize`、独立 CLI `browser-check`，也没有宣称最终交付 receipt。39 项 parser/CLI/package 测试中确实执行了各自 fixture 的默认 finalize、browser-gate unavailable 等测试；这不是这四页的 finalize/browser-check 证据。没有重复测试来封装这些截图，也没有因此改变源码、HTML 或 ZIP。尚未 push、运行远程 CI、merge、发布或部署。

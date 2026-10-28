# Round 51：TS AST Viewer 遍历与源码命中对照

本包记录官方原生站点 [ts-ast-viewer.com](https://ts-ast-viewer.com) 上的操作，以及固定 [dsherret/ts-ast-viewer @ cbcacc6181b1e3ef09f3f61eb3d8056c004a5bd9](https://github.com/dsherret/ts-ast-viewer/tree/cbcacc6181b1e3ef09f3f61eb3d8056c004a5bd9) 的源码解释。本批未通过新增公共 AST reader 的价值门槛，只提交研究证据。

## 输入、版本与许可

输入为该项目自己的完整 `src/utils/LineAndColumnComputer.ts`，不是为实验改写的代码：1502 bytes，SHA-256 `6ddd8c62c70ded6b3cfc45db33a851f51c28a5bfdbdd513003c3f4aa6db38b12`。通过编辑器粘贴到虚拟 `/main.ts`。操作前后分别选择 SourceFile，从右侧公开的 getFullText() DOM 读回，均与来源完全一致，见 `fixture/` 三份副本。

这是研究者选择的真实项目文件，不是独立读者提交的自然任务。没有载入该项目的其它模块；截图中的 import 诊断不证明项目本身出错。关闭 Binding 只关闭本工具的相应绑定展示，不意味着 Monaco 所有编辑器诊断均被关闭。

原生控件显示 compiler **6.0.3**、Script target **ESNext / Latest**；Binding、Factory code、Show internals 均 false。网站部署 commit 和编译器构建 commit 未独立验证；不能把网站观察冒称固定源码的本地构建结果。15 份来源文件由 [source-tree.json](source-tree.json) 的 Git blob 身份验证，采用 [MIT LICENSE](upstream/LICENSE)，Copyright (c) 2017-2024 David Sherret。样例、来源及截图保留此署名。

## 复现步骤

1. 打开原生站点的一个自有浏览器页签，设置 1440×900、deviceScaleFactor 1。通过 Options 选择 6.0.3、forEachChild、ESNext / Latest，关闭上述三个复选项。本次使用 Ego space 3 / p1。
2. 在 `main.ts` 编辑器粘贴 [完整文件](fixture/LineAndColumnComputer.ts)，不要执行该类或补写它的依赖。
3. 选择树的 ClassDeclaration。右侧应同时记录 pos / getFullStart 150、getStart 234、包含 JSDoc 的 start 152、end 1501、getChildCount 7。forEachChild 树中的该类有 6 个直系项。
4. Options 改为 getChildren，再选同一 ClassDeclaration。直系项变为 JSDoc、SyntaxList、ClassKeyword、Identifier、OpenBraceToken、SyntaxList、CloseBraceToken，共 7 项；原字段不变。
5. 在源码第 4 行注释内部点击，本次实际落点为 **Pos 166 / Ln 4 / Col 15**。getChildren 模式选中 JSDoc，范围 [152,233)。
6. 改回 forEachChild，在相同位置点击。实际选中 ClassDeclaration，画面中的 JSDoc 和类同时高亮；完整区间 [152,1501) 由固定源码的高亮规则推导，截图没有展示全部行。保留同一光标位置，不能把位置变化当作模式差异。
7. 再选 SourceFile，读回 getFullText()，核对与步骤 2 的完整字节一致。浏览器录屏或截图只能证明所展示状态；完整源身份由读回文本另证。

上述步骤在本次网站版本可复现；未来网站改变、移除编译器版本或修改遍历逻辑时，应保留该差异，不强行改写历史观察。没有本地安装 Deno、Go、npm 依赖或上游程序，没有运行上游测试。

## 证据布局

- `browser/`：11 轮脚本 / 原始日志，以及 5 份 DOM 与环境 JSON。只读公开表单、属性文字、树标签、编辑器文本和几何，没有调用页面导出的 compiler / node 全局对象。
- `screenshots/`：6 张真实 1440×900 PNG，均已逐张查看。01 是尚未输入的编辑器定位记录；02 / 03 是两种树模式；04 / 05 是相同注释位置的不同命中；06 是配置。01 不能作为有效代码对照图。
- `fixture/`：来源原文件、初次原生读回、结束原生读回。均含原末尾 LF。
- `upstream/`：15 份源码与许可证；没有重新执行或移植其 AST 算法。
- [remote-state.json](remote-state.json)：333 个远程 heads、检索范围及 #1015 当前归属。AST 查询有 42 个 PR，仅首批 30 条元数据；精确项目名的 issue / PR 查询均为零，不声称穷尽。
- [observations.json](observations.json)：从公开原生状态和固定输入派生的摘要；不是原始浏览器日志。
- [manifest.json](manifest.json)：本包除 manifest 自身之外所有文件的 SHA-256；Git 提交绑定清单。

从仓库根离线核对，不安装依赖：

```sh
python3 docs/research/2026-10-26/audit/round51-ts-ast/verify.py
```

该核对覆盖输入身份、来源 blob、归档状态之间的关系和图片尺寸；不会重跑浏览器、编译器、项目测试或理解效果测试。脚本中的实际输出路径、space 和 page ID 属于当时执行记录，不能直接当作别人的浏览器会话重放。

## 失败与范围限制

04 使用关闭 Options 之前的旧 ref，得到 stale ref，未粘贴。05 点击 Monaco 的 IME textarea 被覆盖层拦截，未粘贴。06 读取 DOM 并查看实际截图，07 点击可见代码区域后才成功输入。失败日志原样保留，不能归为 AST Viewer 解析错误。最初尝试 master ref 和大写 README 路径未成功，随后依仓库 default branch / tree 改用 main 和 readme.md。

08 在选择刚改变时读取到空的高亮 DOM 数组；截图随后已显示高亮，09 的后续读取记录到实际高亮元素。不能将这次采样时机当作没有高亮。树计数 272 / 467 来自完整渲染的树 DOM 标签，不代表屏幕同时可见的标签数；重复的节点 kind 不是稳定身份。

输入全为 ASCII，不能用此例验证 Unicode / UTF-16 与 UTF-8 的差异。代码位置所需的字符串单位从来源实现另读；本轮不增造 Unicode 样例扩展结论。固定源码含 TypeScript 7 / tsgo 的遍历兼容分支，本轮没有运行 7.x。

网站自动把公开输入压缩到 URL fragment，符合固定 UrlSaver 的 history.replaceState 路径，完整地址留在 environment.json；没有点击分享或创建托管记录。页面最后回到 about:blank，未清理浏览器其它数据。没有实现、安装、合并、创建 PR 或发布站点。

# D 实际页面复核与模型更正

本批更正此前 B/C 的模型选择：Tree 合同只表达包含关系，不能因拓扑恰好是树就拿来表示依赖声明。此前来源与拓扑复核未发现这个合同问题；“现有 native 能承载该解释”的无条件结论不成立。B/C 文件及旧图片保持原样作为历史实验，当前候选改为 D。仅把 Tree 类型标签改成包名的方案已否决。

独立 [源码诊断](tree-source-diagnosis.md) 固定于 dev `d5d979493bba650b3995836afd379cd249f2d0dd`：Tree renderer 把布局配色 tone 写入 Passport.kind，Viewer 再按该 kind 显示“外部系统”；不是缺少 metadata 后的 Viewer fallback。合法包含树也有这项通用问题，本批未修复它。此前 C 记录中宽泛的 fallback 描述由这里纠正。

D 用已有 Architecture 有向连接，四个包名统一 backend/icon:none，再通过原生图例和文档级翻译显示“包名”。现有合同允许这种领域命名，raw IR/DOM、SVG metadata、Lens kind、Story inspect 仍为 backend；它不是原生 package 类型。没有新增 parser、schema、Viewer、依赖或产品默认值。

## 固定身份与实际变化

最终 HTML SHA-256 `09ec711ed24370ea330fe614e0541adf6a5ce621d0324cfdfa66c2676100cd96`，541872 bytes。比 C 多 1602 bytes，比 B 多 1894 bytes，比文字 A 多 388935 bytes。D 改变了图模型和几何，不是保持同输入图的速度优化，也不能复用旧 Tree 图片作为 D 验收。

[独立复核](independent-source-review.md)解析实际 embedded payload：四个共同面板、结论、两份完整报告、完整测试函数、来源描述、范围正文与表格与 C 相等；两个 node 链接仍指向 declared.baz/bar。四个包名、三条带 ANY 约束的箭头对应 root→foo、root→baz、foo→bar。foo 五个候选合并展示，因此三条分组箭头不是输入中七项逐版本依赖声明的数量；没有选定版本或构造完整证明。

首个 D（`9191f107…de129c`）图形正确，但实际 Lens 错把依赖称为“真实流量”。保留 [失败截图](first-lens-runtime-wording.png)、首个 HTML/输入及收据，唯一一次生成后修订添加两个文档级 Lens 翻译。独立复核确认 native SVG 完全相等，解压 native HTML 仅这两处文本发生变化（各含初始 UI 与 i18n 副本）。最终实际 Lens 已显示“编写的依赖声明”。

## 实际浏览器结果

使用本目标既有 Ego 空间 9、p1、Google Chrome；每次调用重新设置 CSS viewport。图片由实际 HTML 页面捕获并逐张查看，完整清单与原字节绑定见 [screenshots.json](screenshots.json)。以下是桌面与窄桌面视口检查，不是手机、触摸、AT 或读者研究。

| 检查 | 观察和边界 |
| --- | --- |
| 1440×900 声明总览 | [实际图与表格](declarations-overview-light.png)能读到全部四节点、三箭头、候选合并说明和范围表。 |
| 正文键盘入口 | 从新页面真实 Tab 第 12 次到 baz，Enter 得到 native active=baz；Escape 返回 baz 链接，下一 Tab 到 bar，Enter 得到 active=bar。记录见 [desktop-final.json](desktop-final.json)。路径次数不能换算阅读速度。 |
| 详情可读性 | [baz](baz-package-focus-light.png)与[重新从新页面进入的 bar](bar-package-focus-light.png)均显示包名/架构组件和正确源事实；目标可读，左侧卡片仍遮挡其他节点或关系。bar 新页面第 13 次 Tab 的状态单独见 [bar-fresh.json](bar-fresh.json)。 |
| Finder / Lens | [Finder](package-finder-dark.png)搜索 bar 返回正确包名及“被引用；未提供版本”；[Lens](package-lens-dark.png)显示“查看包名分组”、正确依赖说明，选中一个分组后 4 节点、3 关系。它是视觉分组，不是新 package IR。 |
| 390×844 正文 | [实际正文](declarations-narrow.png)页面 scrollWidth=390，表格宽332且无内部溢出；预览需要1103px，明确提示文字过小需打开交互图。 |
| 390×844 交互图 | 真实12次 Tab 可打开 baz，Escape 返回链接，见 [narrow-final.json](narrow-final.json)。但[图片](baz-package-narrow.png)显示原生图有横向滚动、baz 右侧被裁切、卡片遮挡其他内容。焦点成功不能算窄屏可读性通过。 |

保留两个检查过程中的状态边界：[native-overview-dark.png](native-overview-dark.png)在主题操作后已无节点焦点，所以只称总览；[bar-before-focus-ready.png](bar-before-focus-ready.png)复用父对话框旧 focus 回执过早截图，也只显示总览。随后重新导航清除旧状态，通过真实键盘进入 bar 并观察新卡片，才接受 bar-package-focus-light.png。未把检查器时序误差报成产品缺陷。

现有 [#221](https://github.com/tt-a1i/archify/issues/221)涵盖相邻关系阅读及护照遮挡方向。本批未另起共享修复，也未宣称上述裁切、遮挡或所有主题状态已解决。

## 机器证据与处置

首版和最终版各自 showcase finalize 的 validate/deliver/check 通过，均有同一条 52/50 中文句长 warning；各自独立 browser-check 当时 provenance=current、零 diagnostics、visualReview=not-requested。人工图片复核是本记录的独立层。运行环境 Node 26.12.0 / zlib 1.2.12 / Chrome，并非 canonical Node 22 CI。没有运行 solver、Rust、广泛产品测试或 CI。

两组原始与公开收据 hash 均复核，见 [author-verification.json](../author-verification.json)。脱敏副本不等于 live provenance，重现要先 fresh finalize。独立报告公开副本仅把实验 checkout 的绝对用户路径改为仓库相对路径，未更改结论。

保留 D 作为依赖声明模型的有界内容修正。阅读收益、错误率和时间尚无独立读者数据，A 的简洁优势未被推翻；暂不推荐扩大共享功能。既有通用 Tree kind 问题留作独立后续判断，不与本例模型修正混为一项。只推进原研究远程分支，不创建 PR、合并、发布、部署或安装。

最终[独立包装复核](independent-package-review.md)通过：13 图、首末身份、12 组收据映射及相对链接一致。[完整 staged diff-check](diff-check.json)返回 32 个生成 HTML 尾随空白提示；排除 HTML 的文本检查通过，未为消除提示改变已验 HTML。

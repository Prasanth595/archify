# 2026-10-28 阅读实验交付

用户明确继续后，持续探索目标保持 active。首批完成两个独立实验分支，后续再完成一个多文件Diff导航分支；未创建PR、合入、发布或安装。[最新GitHub排重](resume-status.md)记录dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`、main `d6059331abbddb49bca380ff46dca8ce33158b04`；两实验仍绑定原基线 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。

| 实验 | 远程提交与图片 | 结果 |
| --- | --- | --- |
| Route alternative | [说明](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/README.md) · [原图](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/screenshots/candidate-alternative-blueprint.png) | 查看另一条等跳数有向路线；可切回默认、保留hash与焦点。10/10 Route、388/388 focused、generated/package通过；五张人工查看原图。 |
| Diff matching blocks | [说明](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/README.md) · [原图](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/evidence/20261026/candidate-matched-helper-light.png) | 连续文本唯一匹配后双向跳转；完整Archify历史补丁114行对应已实际操作。63 focused、9 browser及同例扩展1通过，四张人工查看原图。 |

独立终审均READY。Route对照使用完整部署示例；Diff使用second-look完整测试literal与完整9666B真实历史patch，原始输入、许可、生成回执、失败尝试、测试和截图均在各分支持久保存。未把自动测试、实际浏览器动作与视觉查看合并成一个不明来源的“通过”。

Route不推断真实流量、故障切换或最佳路线。Diff不证明语义移动/复制/等价；四位行号拆行及390px页面约10px横向溢出在旧基线已存在，保留为限制。本轮没有实体触摸、AT、全平台或阅读效率证据。

[远端核对](remote-heads.json)仅覆盖这两个新提交：GitHub head与本地相同。Actions/check-runs为0不代表远端CI通过。未来合入当前dev仍需组合后的检查；独立实验交付不冒称集成完成。

调研来源继续保留于[差异阅读](../2026-10-26/scouts/change-reading-resumed.md)、[图局部结构](../2026-10-26/scouts/graph-local-structure.md)、[运行时引用图](../2026-10-26/scouts/runtime-code-reading.md)。Pympler的真实受控probe发现DOT输出限制，当前未新增只适合漂亮样例的适配器。

[52项主索引](../2026-10-25/README.md)已加入新两行；[图片画廊](../2026-10-25/gallery/README.md)已完成52项增量与实际浏览器检查：四分组、新两项原图展开/原尺寸/Escape焦点、390px深色卡片及空结果/reset。原50项卡片和PNG字节不变，旧浏览器证据保持各自身份。目标保持active，后续继续按具体价值与维护成本筛选。

## 后续批次：多文件 Diff 阅读

本轮并行报告：[patch 文件导航](scouts/patch-navigation.md)、[图上的局部问题](scouts/graph-answers.md)、[代码阅读状态](scouts/reading-state.md)。来源按具体行为筛选，没有按星数排名；task-view 与 PR Lens 的新提交也已复核。

选定一个实施候选：普通多文件 `@diff` 的文件目录及段落跳转。复用现有解析边界和原生链接，保留每一次文件段出现，不按路径去重。完整输入包括diff2html的736B上游测试literal和Archify真实历史commit的8309B两文件patch。它与上一批文本匹配跳转不同；已推送独立分支 `codex/lab-diff-file-navigation`，固定head `48f076f9c87fc87d36af20ddd24464e71d798fea`，比较基线为 `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`，现计入已交付53项。

图问题与阅读状态报告本轮未建议新实施。它们保留共同依赖、环集合、已审状态失效与静态表行省略等具体语义边界，不把项目已有按钮或新提交数量当作Archify必须新增功能的理由。

[多文件Diff说明](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/README.md)与[实际原图](https://github.com/tt-a1i/archify/blob/48f076f9c87fc87d36af20ddd24464e71d798fea/experiments/diff-file-navigation/browser-evidence/current/final-history-file-list-light.png)已随分支持久保存。27项解析/渲染、39项parser/CLI/package、一项扩展Chrome交互及generated/ZIP检查通过；四张对照HTML只经render、静态inspect和独立浏览器观察，没有执行这四页的finalize或CLI browser-check。完整历史patch的153行原文与baseline一致，第二文件原本在首屏下约4800px处，现在可直接跳转并用键盘返回。

独立审查和root实际浏览器检查发现并修正了生成ID冲突与窄屏返回链接带偏横向滚动两个问题。最终桌面/390px深色下返回入口可见、Tab/Enter往返scrollLeft为0；保留基线行号换行和390px页面约10px溢出，不宣称跨浏览器、AT或阅读效率验收。9张原PNG和5份JSON分为当前及修前证据，未经改写。共享源码/测试diff摘要仍为 `941c679caa28835d01b7fbe3ef07cdc44501ba4b8d74073e2179347b47cb4840`。

[第53项远端核对](diff-file-navigation-remote.json)确认GitHub精确head一致；Actions/check-runs为0，不算CI通过。画廊53版在此源码索引提交之后增量生成。

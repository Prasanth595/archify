# 2026-10-28 两个阅读实验交付

用户明确继续后，持续探索目标保持 active。本批完成两个独立实验分支；未创建PR、合入、发布或安装。[最新GitHub排重](resume-status.md)记录dev `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`、main `d6059331abbddb49bca380ff46dca8ce33158b04`；两实验仍绑定原基线 `e837dc4cb83042d2b6c596e039692e25ec62c2da`。

| 实验 | 远程提交与图片 | 结果 |
| --- | --- | --- |
| Route alternative | [说明](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/README.md) · [原图](https://github.com/tt-a1i/archify/blob/d61217d82fd0dd844e77aab7434620b47b792d2b/experiments/route-alternative/screenshots/candidate-alternative-blueprint.png) | 查看另一条等跳数有向路线；可切回默认、保留hash与焦点。10/10 Route、388/388 focused、generated/package通过；五张人工查看原图。 |
| Diff matching blocks | [说明](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/README.md) · [原图](https://github.com/tt-a1i/archify/blob/a8456ef796ab62ba490b03fa0c896ae206edb5ea/experiments/diff-matches/evidence/20261026/candidate-matched-helper-light.png) | 连续文本唯一匹配后双向跳转；完整Archify历史补丁114行对应已实际操作。63 focused、9 browser及同例扩展1通过，四张人工查看原图。 |

独立终审均READY。Route对照使用完整部署示例；Diff使用second-look完整测试literal与完整9666B真实历史patch，原始输入、许可、生成回执、失败尝试、测试和截图均在各分支持久保存。未把自动测试、实际浏览器动作与视觉查看合并成一个不明来源的“通过”。

Route不推断真实流量、故障切换或最佳路线。Diff不证明语义移动/复制/等价；四位行号拆行及390px页面约10px横向溢出在旧基线已存在，保留为限制。本轮没有实体触摸、AT、全平台或阅读效率证据。

[远端核对](remote-heads.json)仅覆盖这两个新提交：GitHub head与本地相同。Actions/check-runs为0不代表远端CI通过。未来合入当前dev仍需组合后的检查；独立实验交付不冒称集成完成。

调研来源继续保留于[差异阅读](../2026-10-26/scouts/change-reading-resumed.md)、[图局部结构](../2026-10-26/scouts/graph-local-structure.md)、[运行时引用图](../2026-10-26/scouts/runtime-code-reading.md)。Pympler的真实受控probe发现DOT输出限制，当前未新增只适合漂亮样例的适配器。

[52项主索引](../2026-10-25/README.md)已加入新两行；[图片画廊](../2026-10-25/gallery/README.md)正在增量构建，原50项与旧浏览器证据保持各自身份。

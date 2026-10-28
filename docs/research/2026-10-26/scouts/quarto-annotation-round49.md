# 第 49 批：Quarto 行注解与已有 Code Focus 工作

结论：**不重复实现行焦点或来源卡片。** Quarto 的原生注解提供了可观察的行定位交互，但 Archify 已有同题 Draft PR #1015。本批补充交互、定位边界和许可证据，仅推进研究分支，不创建 PR。

## 排重与已有归属

开工刷新 [333 个远程 heads](../audit/round49-quarto/remote-heads-before.tsv)，相对上一批只有研究 hub 推进。当前与历史 scouts 的定向查询没有找到 Quarto；CodeTour / Codecrumbs 的按问题阅读、source-keyboard、diff-file-navigation 均已有实验，不重做。

项目名 quarto 的 issue / PR 查询均为零；扩大到 code + highlight 后，返回 3 个 issue、125 个 PR，PR 结果仅读取首批 30 条，不能声称穷尽。相关的 [Draft PR #1015](https://github.com/tt-a1i/archify/pull/1015) 现为 open / unmerged，head `fe4f80d2195e0a7b49b7cfe6d3dba7ffd31a7ac8`。已核对其实际 schema、authoring 和 render diff：`@source` / `@code` 可声明 focus 范围，渲染焦点行，并扩展来源卡。它与本轮可能提出的“突出代码片段内关键行”直接重叠。

相邻 [PR #1142](https://github.com/tt-a1i/archify/pull/1142) 是 answer 到既有证据的作者声明关联，当前 head `bd782b46c4f4f8d5c947e7f5638d30d34fe4989f`，open / unmerged。它不是 Quarto 行注解，也不能把链接关系当作结论成立的证明。本批只核对归属，没有改贡献者分支、重建产物、运行其测试或作代码正确性审查。[状态及选取 diff](../audit/round49-quarto/remote-state.json)保留了查询范围与 head。

## 原生页面实际操作

对象为 [Quarto 官方 Code Annotation 页面](https://quarto.org/docs/authoring/code-annotation.html) 的第一份公开样例，1440×900。注解编号用于作者说明的关联，和代码行号不是同一个编号体系；没有运行其中的 R 代码。

| 操作 | 观察 |
| --- | --- |
| 点击下面说明列表的编号 2 | 对应代码块相对行 4、5、6、7；出现一条高亮带 |
| 切换编号 1 | 只保留一个当前选择，显示单行高亮 |
| 再点击编号 1 | 当前选择与高亮带清空 |
| 聚焦首个复制按钮，然后按 Tab | 下一焦点为后方 HTML styles 普通链接，略过两项注解 |
| 再选编号 2，读取 DOM 几何 | 高亮带左沿比 sourceCode 容器左沿多出 59.5px；右沿一致 |

原生 DOM 中两项说明 `dt` 的 tabIndex 均为 -1，编号锚点没有 href。上面的 Tab 路径是实际操作；没有声称全部辅助技术或所有 Quarto 格式都不能使用。说明文字仍在页面上可读。

重复测量中代码容器 x=301、width=788，高亮带 x=241.5、width=847.5；垂直方向覆盖所选行。该截图用于记录越出容器的实际表现，不能算几何验收通过。[派生状态](../audit/round49-quarto/observations.json)可独立复算，完整截图在本地证据包。

## 当前源码与网站不能混作同一版本

固定 [Quarto CLI `623cd99e`](https://github.com/quarto-dev/quarto-cli/tree/623cd99e8c66ec29c9ef1fe17e4469c11c3c14eb) 的 Lua filter 从作者标记生成 cell / annotation / lines 关联；HTML 模板按这些生成 ID 查找代码行并定位高亮。它没有因此证明来源文件版本、代码执行结果或说明正确性。

还需保留坐标区别：Quarto 此例的 4–7 是代码块内相对行；#1015 的 render diff 则用 `source.lines[0] + index` 生成文件行号。两种编号不能直接互换，否则选中正确的页面行也可能指向错误的 Git 源码位置。

当前模板使用 client rectangles 定位，并考虑容器滚动与 Reveal.js 缩放。配套 Playwright 测试覆盖格式、行号、无复制按钮和滚动容器；light contrast 用例还有 expected-failure 标记。**只读了源码与测试，没有安装 Quarto 或运行这些测试。**

上游 [#13448](https://github.com/quarto-dev/quarto-cli/issues/13448) 已关闭，记录了高亮越界和 gutter 对齐问题。实际网站 generator 是 `quarto-1.11.7`，其公开内联脚本含 offsetTop 分支、没有当前模板的 placeBand。部署 commit 未知；既不能用 issue 已关闭否定本次网站观察，也不能把网站表现当作当前 main 构建的回归。

## 价值、成本与后续门槛

同页说明直接指出具体代码行，对长片段阅读有价值。当前研究基线的 Explainer 已有固定 Git 来源、行范围、来源卡预览和完整 code block；新的关键行能力还在 #1015 的范围内。Quarto 则进一步提供编号说明到行集合的作者关系，并支持多种输出；两者不是完全等价，但现在没有可证明需要另建这套注解语法的 Archify 自然任务。

若未来确实需要多条说明共享或交错指向一个片段，应先记录真实输入和读者的问题，再比较现有焦点行是否不足。新增注解合同会涉及 parser、range 校验、render、交互键盘、滚动/缩放定位及导出表现，不能仅凭一个点击演示判断成本合理。本轮不复制注解引擎，也不重复来源卡展开或 claim attribution。

## 产物与验证范围

[证据包说明](../audit/round49-quarto/README.md)包含 5 份逐字节校验的 CLI 来源、实际状态、派生摘要、远程归属快照及本地文件清单。CLI 为 [MIT](../audit/round49-quarto/sources/COPYING.md)，copyright 2020–2024 Posit Software, PBC。quarto-web 固定到 `781af76ce83db51b4b02ddcb5a871de1b20f2cba`；其许可页描述 CLI 和各组件，没有据此确认整站文档及素材的再分发许可。因此 5 张已查看原始 PNG、5 份浏览器脚本/日志和状态备份保留本地，Git 中只保留清单、哈希与派生观察；没有将网站文档改标为 CLI MIT。

离线摘要两次输出一致；验证覆盖固定来源 Git blob / SHA-256、本地 18 个文件、5 张 1440×900 PNG 和派生状态。它不是 Quarto 上游测试、Archify 产品验收或真人理解收益证明。未改产品代码，未安装、合并、创建 PR 或发布网站。

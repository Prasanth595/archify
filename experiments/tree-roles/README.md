# Tree 结构角色实验

这是合法包含树的默认语义修正。在原有仓库图中，`focus.js` 的 Passport 与 Finder 被自动标为“外部系统”，仓库根被叫作“前端”。来源并未提供这些领域类型：Tree renderer 把配色 tone 写进了 semantic kind。候选改用已有的根、分支、叶结构角色，同时保留布局与配色。它不让 Tree 变成依赖图，也不改变上一批 PubGrub 应使用有向依赖模型的结论。

直接打开 [基线](baseline/repository.html)和[候选](candidate/repository.html)。输入来自固定 `dev@d5d979493bba650b3995836afd379cd249f2d0dd` 的 [仓库包含树](https://github.com/tt-a1i/archify/blob/d5d979493bba650b3995836afd379cd249f2d0dd/archify/examples/archify-repository.tree.json)，只设置中文 Viewer locale 与输出文件名，31节点、30条包含边均未改。这是上游已编写的选定文件结构，不是新扫描的完整仓库。当前输入中是叶子，不代表真实目录没有其他内容。

## 实现与兼容

- raw kind 为 `tree-root/tree-branch/tree-leaf`，六种内置及六份示例 locale 使用 `viewer.kind.tree.root/branch/leaf`。单节点按根优先显示，仍可同时没有孩子。
- Radar/Lens 的对应配色保留；折叠不把分支变成叶子。Story scan 和导出 SVG 也保留结构 kind，不再藏着技术角色。
- 旧 Tree `#lens=frontend/backend/external` 仍映射到对应结构组；新复制链接用结构组。其他模式不做此映射。
- 文档明确提供的旧 kind、Lens 标题/说明/指南翻译仍生效；新的 Tree 键优先。不把默认技术标签复制到新角色。
- Tree Lens 默认改为层级角色和包含关系。没有增加 schema 字段、依赖、解析器或分类框架。原始 kind 与 Finder 的 raw 搜索词发生了有意变化，未提供任意旧 API token 的兼容层。

维护成本是两个短兼容映射、三个 kind 标签与三项 Tree 文案、几个 CSS 别名，以及现有消费者的回归覆盖。共享 Viewer 模板变动会使各模式生成 HTML 和发布包更新，这部分生成成本也计入本实验。

## 实物和结果

| 项目 | 精确证据 |
| --- | --- |
| 同输入 | [JSON](inputs/repository.tree.json)，SHA-256 `7f55b52a92037649457be03993dad09817230ec0b7f9686199b8fd91086a8b0c` |
| 基线 HTML | `859346f5910a83ee3d6f5df9b2b686ee07f3a5bdca5254600078df3a898c7117`，907529 bytes |
| 候选 HTML | `5ae501c278daa4e47d653ead86028816065de5255eeb59aa0c071d253739451c`，908519 bytes，增加990 bytes |
| 图本体 | [比较记录](root-review/artifact-comparison.json)：删除唯一变化的 kind 属性后 SVG 完全相同；1根、6分支、24叶。 |
| 实际页面 | [图片清单](root-review/screenshots.json)有14张有效状态图，另保留3张排除验收的采集图。相同 Finder 输入+Enter、相机矩形稳定后，[基线](root-review/baseline-leaf-paired.png)与[候选](root-review/candidate-leaf-paired.png)目标矩形完全相同，标签从外部系统变为叶节点。 |
| 透镜与折叠 | [新透镜](root-review/candidate-lens-paired.png)显示层级角色和包含关系；[折叠分支](root-review/candidate-collapsed-branch-dark.png)仍为分支节点；[旧链接恢复](root-review/legacy-final.json)选择 tree-leaf，URL 保留旧hash，面板默认收起。 |
| 窄桌面视口 | [390×844](root-review/candidate-leaf-narrow.png)页面 scrollWidth=390，Finder 的 Enter 能揭开原先折叠的目标，卡片显示叶节点。总览文字仍小，卡片仍占据较大空间；不是手机、触摸、AT 或阅读效率验收。 |

真实 UI 使用本目标 Ego 空间9/p1、Chrome156。没有用图像生成工具制作证据。首组未匹配操作、错误DOM等待、同页并行导航、错误尺寸截图和错误 Story action 均写入 [harness-notes](root-review/harness-notes.md)，没有归为产品失败。只有 paired 图片用于匹配状态比较；其他有效图用于各自状态观察。

## 修订与验证记录

[首个实现补丁](evidence/tests/first-implementation.patch)和原始失败保留：第一轮55例中46通过，发现翻译键不能含连字符及示例locale缺键；第一次修正保留 raw role，改成点分隔翻译键。第二轮54/55，剩余为新增测试调用错误 API；修正测试后通过。没有把失败的测试路径当成功。

随后独立审查发现三项旧 Lens 显式翻译被新键忽略。修前回归失败，补上已有兼容机制并验证新键优先后，Tree渲染/实际Chrome13/13通过；德语示例措辞也改为明确父子关系。原 [独立报告](evidence/independent-review.md)保留发现，再追加关闭结论；[实现收据](evidence/tests/receipt.md)列出每条命令、运行环境、修订和证据复用边界。报告中的补丁hash对应生成物刷新前的实现差异。

[首个已生成候选](first-candidate/repository.html)与最终候选字节相同，因为这个默认输入没有旧 Lens 自定义值；它不等于兼容修正无效。基线、首个候选和最终候选各自在当时通过 showcase finalize 的 validate/deliver/check/browser-check，零 diagnostics，visualReview=not-requested。这些生成记录使用 Node26.12.0；人工页面检查独立记录。

初次完整生成物检查报告32项 stale 示例/模板失败。随后从最终源刷新15对原生示例、旧 web-app 模板、Gallery 和 ZIP，再检查通过。[15图对照](root-review/generated-svg-comparison.json)确认13个非Tree SVG原字节相同、两个Tree仅kind元数据变化，开发与打包示例一致。规范 Node22.23.2/zlib1.3.1-e00f703 两次 ZIP 构建完全相同，未包含实验或 node_modules。最终补充验证在该规范工具链上单次执行80项相关测试全通过、core 19/19通过，均无skip；生成物检查亦通过，见 [最终检查记录](evidence/final-checks.json)。未自动创建 PR、合并、发布、部署或安装。

公开记录仅对用户目录作替换，[raw/public SHA清单](evidence/hash-mapping.json)区分原始字节与公开副本；原始字节在本机临时归档保全并验hash。公开回执不是 live provenance。首个候选的独立 delivery sidecar 未单独保留，保留了其完整 finalize/browser 记录；最终与基线的 sidecar 有公开副本。原生 HTML 未作路径替换。

## 复现

在依赖和Chrome已就绪的仓库根目录，用固定基线另一个checkout和本分支分别运行同一输入。基线来源是上述d5提交，候选是本分支；不要拿已脱敏的回执重新要求live provenance。以下是候选命令，fresh finalize 会重建对应sidecar：

```sh
node archify/bin/archify.mjs finalize tree experiments/tree-roles/inputs/repository.tree.json /tmp/tree-role-candidate.html --quality showcase --json --out-dir /tmp/tree-role-candidate-records
node archify/bin/archify.mjs story scan /tmp/tree-role-candidate.html --json
node --test test/tree-rendering.test.mjs test/tree-branches-browser.test.mjs test/i18n.test.mjs test/semantic-passport.test.mjs test/semantic-lens.test.mjs test/semantic-lens-browser.test.mjs test/semantic-radar.test.mjs test/new-type-translations.test.mjs
npm run test:generated
```

浏览器测试需设置 ARCHIFY_CHROME 为已有Chrome路径。对照截图的输入和输出位于实验目录；上例输出路径不同可能改变交付记录路径，不能据此套用保存的回执。首次代码修正和这里的测试是行为实验，不是新的作者速度基准。

研究来源：[D3/Cytoscape 层级角色分析](https://github.com/tt-a1i/archify/blob/6769a2a06935c95bdfe04bbe065f6f4678159411/docs/research/2026-10-26/scouts/hierarchy-role-reading.md)与固定 Archify Tree 源码。没有复制外部库实现。新贡献按仓库 Apache-2.0，既有代码、字体和其他资源遵循根 LICENSE/NOTICE 及各自内嵌许可。

处置：有明确源码和实际页面证据的局部修正候选。消除默认假类型的价值已得到直接观察；没有读者速度、理解正确率、所有语言人工验收或 hosted CI 结论。采用与正式集成仍需独立决定。

完整 staged whitespace 检查保留了原样 HTML 和补丁上下文的告警；源码检查通过。完整输出和范围见 [diff-check](evidence/diff-check.json)，没有为消除告警改写已验收产物。临时借用的两个依赖软链接均已移除。

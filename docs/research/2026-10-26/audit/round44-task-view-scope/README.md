# task-view 关联范围：同输入函数探针

这是源码合同与表示方式对照，**不是 task-view 原生 HTML、Go 校验器或浏览器测试**。没有新产品实现，也没有本轮产物截图。旧 [第 18 批原生页面观察](../round18-task-view-native/README.md)使用不同输入，不能充当这里的 UI 验证。

## 输入和问题

[Archify 已有实验](https://github.com/tt-a1i/archify/tree/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests)固定真实历史代码：base de004edf47228b6134fd3d29ef91cd5e010c867b，head ed62bfefaf490e831259261fdc12f985267590fb。原始 mapping、flows、project.mjs 逐字复制到 input/；原实验 Apache-2.0 许可保留。mapping 的 Git 引用吻合是原记录，**本轮没有重验引用或运行历史回归测试**。

mapping 本身已有 regression → guard 的全局“声明：测试关联”。sidecar 另有三条复用 guard/report 的路径：missing 声明该测试关联；delivered 不声明；omitted-link 是有意遗漏关联的合成对照。两种声明可以同时成立。未声明不表示不存在测试，代码关联也不表示所有分支都被测试。

本轮问的是：将“路径中的步骤关联”直接压成同一节点上的 tests 边，是否还能区分三条路径？不是问 task-view 能否展示测试。

## 执行内容

[probe.mjs](probe.mjs)从固定 app.js 原文抽出索引与 scopedNodeIds 两段，在 Node VM 中运行。保留节点来源字段，按 knownTests 给 regression 标注 test，其余标 code。global-edge 情形使用 mapping 已声明的 regression → guard 关系；不将此解释为执行或覆盖事实。

限定前提：flow.path 是当前基础范围；没有手动 reveal/expand；过滤器允许全部节点。探针调用 testsOf 和 scopedNodeIds，**没有调用完整 graphNodeIds、flowCard、布局或 DOM**。输入是局部函数所需的数据形状，不是声称通过上游 schema 的 review 文件。

同时执行原实验 project.mjs，得到按路径声明的比较基准。结果如下，数字仅计每条路径 guard 步骤上的声明关联：

| 表示方式 | missing | delivered | omitted-link |
| --- | ---: | ---: | ---: |
| 原实验的路径声明 | 1 | 0 | 0 |
| 共用节点＋全局 tests 边 | 1 | 1 | 1 |
| 只有旧 flow.tests，无 tests 边 | 0 | 0 | 0 |
| 全局 tests 边＋旧 flow.tests | 1 | 1 | 1 |
| 每条路径独立步骤节点 ID | 1 | 0 | 0 |
| 每条路径单独数据文档 | 1 | 0 | 0 |

所有表示方式的 report 步骤均无关联测试。原测试只检查报告文件存在，不证明报告内容呈现正确。

后两种是**构造的替代编码**：前者复制节点身份（保留源码引用），后者改变文档范围并使用各路径的声明；两者都不是原 mapping 的透明导入。它们仅证明局部函数可以保留目标区分，不证明上游 schema/Git 校验、布局、导航或读者体验合格。

两次正式运行退出 0，9 项输出断言通过，stdout 逐字一致；初次探索运行也一致。原始 stdout/stderr、耗时和 Node 版本见 [runs.json](runs.json) 与 runs/。毫秒耗时只是该小函数探针的执行时间，不是阅读或原生应用性能。

## 源码证据

八份完整上游文件固定到 gtindo/task-view@a3fa21767bfaeb3077fdda08bddb7249366caa93，Git blob、字节长度及 SHA-256 见 [sources.json](sources.json)。

- types.go 的 Flow.Tests 注释明确是旧文件兼容字段；tests 通过边关联代码。
- load.go 的 checkFlowNodes 检查旧 tests 中节点是否存在、是否为 test；不能据此推断界面继续使用它。
- data.go 直接把 rev.Flows 放入页面数据。
- app.js 的 testsOf 只按目标节点取传入 tests 边；graphNodeIds 经 scopedNodeIds 带入这些测试。Tests tab 同样使用节点级查询。
- app.js 的 Flow 卡片按 flow.path 和非 tests 边绘制步骤；本轮没有把它误称为测试卡片随每条 flow 显示。旧 flow.tests 没有对应的前端读取。

七个逻辑来源文件加 go.mod 原文归档，不含第三方布局库。MIT 原文及 Yvan Guekeng Tindo 署名保留在 [source/LICENSE](source/LICENSE)；这些文件仅供研究，不进入 Archify runtime。完整上游应用仍包含另行许可的库，本包未复制或运行它们。

## 复现

使用已有 Node 22（本轮为 22.23.3），从仓库根目录运行：

```sh
node docs/research/2026-10-26/audit/round44-task-view-scope/probe.mjs
```

不需要 npm/Go 依赖或安装。脚本检查完整 app.js 与原 mapping 哈希，并输出结果 JSON；对照 runs/probe-1.json。输入来自上述固定实验提交，sources.json 提供每份来源的固定 URL。

本机有 Go 1.27.2，但 go.mod 中四个精确版本的已解压模块目录均不在当前 GOMODCACHE。仅检查这些目录，未清查 zip 缓存或其他版本；**不能据此称本机绝对无法构建**。没有尝试构建、拉取依赖或安装。详情见 [environment.json](environment.json)。

## 筛选与去重

本批开工快照 333 个远程 head，已有 task-flow-tests 分支仍为 843c877，hub 为 82b850122；task-view main 仍为 a3fa217。类型明确的 task-view issue 查询为 0，PR 查询为 2（既有 #1121、#994），见 [lookups.json](lookups.json)；不能据此排除所有同义问题。猜错 viewmodel.go 路径导致 404、一次未匹配 shell glob 的探查失败也有记录。

结论：保留现有实验的“路径关联由作者声明”价值假设，不因新版有 scoped graph 就宣布它被替代，也不把这次表示范围差别升级为上游缺陷。尚无同输入原生完整页面或自然读者任务收益，暂不新增适配器、公共数据模型或第二套 graph focus。

本轮仅向研究远程分支补证据，遵循用户最新要求，不新建 PR。全程无合并、发布、安装或历史应用执行。

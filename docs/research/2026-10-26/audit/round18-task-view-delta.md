# Task-view 新 HEAD：先用官方完整原生 Demo 对照

2026-10-28，只读。结论：**现已有直接可打开的官方原生 HTML，先比较实际用户任务，不新增 graph 投影。** 本轮从网页获取 HTML、核对固定源码与 demo 输入；未打开浏览器、运行上游、生成页面、执行测试或访问私人资料。

## 版本、许可和去重

[固定比较](https://github.com/gtindo/task-view/compare/f27b8bef63ec336b8e3487e90ccd484a2fa7a235...a3fa21767bfaeb3077fdda08bddb7249366caa93)：新 HEAD `a3fa21767bfaeb3077fdda08bddb7249366caa93` 较旧 `f27b8bef63ec336b8e3487e90ccd484a2fa7a235` ahead 2；`45eb908` 将 flow 画为分支、tests 移至 graph，并引入阅读进度；`a3fa217` 新增由 flow 的节点/边/全 flow 设定 graph scope、邻居增减及 focus 链接。仓库 [MIT](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/LICENSE)；页面内 Cytoscape/cytoscape-elk 与 ELK 有[独立许可](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/vendor/LICENSES.txt)，其中 ELK 为 EPL-2.0。

[Archify task-flow-tests@843c877](https://github.com/tt-a1i/archify/tree/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests) 固定旧版概念，给两个已声明路径中的 guard/report 与已知测试做 sidecar；原实验未运行历史测试，最终 visual-check 有 16 条键盘诊断。上游现在提供 flow scope 与 tests，其与固定 sidecar 不是同一输入，也不能据此称原实验的测试通过。此前 [去重记录](round18-dedup.md) 已识别重叠；这份只补原生基线与源码合同，不提新分支。

## 上游可直接打开的公开产物

[官方 live demo](https://gtindo.github.io/task-view/)：本轮 HTTP 200，完整 HTML 2,567,514 bytes，SHA-256 `bdec374b0046ee88eed895556518f47e4fd03e3308148bd667b9c5a73ba50af1`，页面嵌有 `main-a3fa217`、`Picked in Flows`、`inspector-code` 与所述 review commit。该版本标识与已读源码一致，但不等于对页面每字节的源码重建证明；此 URL 可能被上游更新，浏览时应核当前版本/hash。它是既成 standalone HTML，不需要下载依赖或运行 Go。另有上游标明故意错误的 [broken demo](https://gtindo.github.io/task-view/broken.html)，本轮未取得该页，不能报告其当前可用性或结果。

[上游 README](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/README.md#live-demo) 指向上述 live page 并说明 demo 的 review；[workflow](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/.github/workflows/demo.yml) 从 main 运行 `make demo` 发布 Pages。完整公开输入 [demo/change-show-code-after.json](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/demo/change-show-code-after.json) SHA-256 `32096a6cd5ff27bce5fe3eeea8a318750608722e038b1a001dca9710cbd3aec5`，声明 repo commit `12199940391020372c51b1f669dfa83b4f4c8bee`。共 12 nodes（其中 1 test、3 doc）、8 edges，1 flow `inspector-code` 的 path 为 `node-inspector → excerpt-box → code-mode-pref → after-rows → excerpt-struct → builder-excerpt → code-table → after-styles`，这些是 flow 成员，不意味着逐项顺序调用；形状来自相关 edges。唯一 test edge 为 `test-open-writes-page → builder-excerpt`（kind `tests`）。fixture notes 明说该 test 只检查页面写出及嵌入数据，**不覆盖 app.js tabs**；`meta.observed=passed` 是上游记录，不是本轮执行证明。

## 固定源码可核行为与手工对照步骤

[app.js](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js) 的 `select` / `setFocus`：在 Flows 点节点/边更新 focus；flow 标题设置整个 path；图中选择仅改变 inspector；切新 focus 清空 expanded/revealed 并写 `focus=` URL。`focusNodeIds` 对 edge 用两端、flow 用 path；无 flows 时 graph 按过滤器展示整个图，有 flows 且无 focus 显示提示。`graphNodeIds` 从 focus/revealed 添加可显示的 incoming `tests` 边源节点；默认有 flows 时 Tests 开、Unchanged 开、Imports 关。只有 edge 标为 `tests` 且来源 kind 为 test 才算关联；不是自动发现测试、覆盖或实际执行。

`+N` 是该节点一跳隐藏邻居中**通过当前 toggles 的去重节点数**，不是剩余全部图节点数或测试数；点击展开后变 `−`，重新计算从基础节点及仍可见 expanded 节点达到的集合，关上祖先可移除不再可达的子展开。Tests 可因选中节点的关联自动加入；若过滤掉相应 kind，计数随之变化。选择图外 finding 可以把节点/边端点加入 scoped graph，不等于改变 flow 的原 pick。上述是固定源码的静态阅读，不是本轮浏览器观察或 UI 自动化结果。

建议 root 在 live page 首先点 Flow 中 `builder.excerpt`，然后打开 Graph：观察其关联 test 是否出现、其 `+N` 是否反映其余可显示邻居；再点 `+N`、`−`，对照 flow 标题整条范围与 Tests 开关，最后检查 URL 恢复。根据 fixture 和源码，`builder-excerpt` 有 test edge 和 `excerpt-struct` edge，默认未展开的首屏理论上会包含 builder 与其 test，`excerpt-struct` 为潜在邻居；实际显示、布局和当前部署要以 root 的 UI 观察为准。使用同一原生 demo 输入时不可声称比较了 Archify 历史缺产物路径；若做公平比较，需为两者提供相同公开事实和关联，保留原页面与全部声明/未关联项，先证明其能回答所问。

## 如必须自行重建

[Makefile demo](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/Makefile#L38-L51) 的 `make demo VERSION=main-a3fa217` 会 `go build`、清理 checkout 内 `site/`、本地 clone 并 checkout fixture commit、执行 `task-view open` 输出两页；禁止对共享 checkout 直接运行其 destructive `rm -rf site`。其 [go.mod](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/go.mod) 指明 Go 1.26.3 及 Chroma、jsonschema、x/text、regexp2 等依赖；本机已有 `/opt/homebrew/bin/go` 1.27.2，但未检查模块缓存是否完整，也未构建，不能声称在禁网依赖下可复现。无需为了本轮下载、安装或构建；live HTML 已是最强可用原生 baseline。

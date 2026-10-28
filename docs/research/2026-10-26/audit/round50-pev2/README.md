# Round 50：PEV2 同字节原生对照

本包补足既有 plan-row-counts 实验缺失的原生查看器对照。结果与可执行的本地复现步骤已写回 [独立实验分支的固定提交](https://github.com/tt-a1i/archify/tree/794692251231051ff229ac983e9c674a374e653c/experiments/plan-row-counts/native-comparison)。没有新建 PR、parser 或产品功能。

## 来源与许可

PEV2 官方 v1.25.0，tag commit `e41d4e8b3006c479f9364d68a5d538d81cb7d110`，与原实验 source pin 相同。当前 master 另为 `c998bf7557b7df84b847618397857ed92ecc37a5`，本次运行、源码解释和许可校验均使用 release tag，不能混称 master 构建。13 份固定源码逐项通过 [source-tree.json](source-tree.json) 的 Git blob 验证；许可见 [upstream/LICENSE](upstream/LICENSE)，PostgreSQL License，Copyright (c) 2019, Dalibo。

[release.json](release.json) 记录官方单文件发布资产：1308080 bytes、SHA-256 `a9c992a85aa111b4442ece08b1f1abcd92f5a651cb41fc9510a74ad4b3bba99f`。下载字节与 GitHub 资产 digest 一致，原生 UI 显示 1.25.0；没有重新构建发布物。完整 HTML 保留在本地证据目录，见 [local-evidence-manifest.json](local-evidence-manifest.json)，不向研究分支复制打包后的第三方运行时。

## 文件与复现

- `fixture/`：原实验 JSON、原生输入框读回文本、原生 Raw 页读回文本；三个文件完全相同，均为 67418 bytes。仅保留上游公开样例，不是数据库实测。
- `browser/`：21 轮实际 Ego 操作脚本、日志及 5 份 DOM/环境状态。脚本保留当时绝对输出路径与 space 3 / p1，属于执行记录；跨机器重放须改为自己的路径和授权浏览器空间。通用手工步骤见上述实验分支说明。
- `screenshots/`：7 张 1440×900 的实际页面 PNG，均已逐张查看。01 为 Grid；02 为 General；03 为尚在淡入的平均值提示；04 为稳定提示；05 为 Misc；06/07 为原有 Archify HTML 重新打开。
- `upstream/`：只读源码。没有运行上游测试、安装依赖、数据库或 live Skill。
- `remote-heads.tsv` 与 [duplicate-check.json](duplicate-check.json)：开工 333 个远程 heads，以及分支 / issue / PR 元数据排重。组合检索返回 0 issue 和 2 个已关闭 PR，head 分支查询为 0；未把这些查询当作穷尽式代码审查。
- [existing-experiment.json](existing-experiment.json)：原有输入与 HTML 字节、实验基线与推送后的提交；本轮只补说明和证据。
- [manifest.json](manifest.json)：本目录除 manifest 自身外的完整文件字节清单。Git 提交绑定 manifest。

从仓库根验证已归档证据，无第三方 Python 依赖：

```sh
python3 docs/research/2026-10-26/audit/round50-pev2/verify.py
```

可加 `--asset /absolute/path/pev2.html` 检查独立下载的官方资产。本地验证已包含该资产。验证会比较文件哈希、13 个源 Git blob、三份输入、三个节点的原字段与 Grid、可见近似提示及 PNG 尺寸；它不会启动浏览器、执行 SQL，也不是产品验收。

## 需要保留的失败与边界

07 用 snapshot 的正规化 href 拼成 raw CSS，匹配不到元素；查 DOM 原 href 后 08 成功。15 的 Misc selector 未匹配；16 重新读取控件后 17 点击成功，但错误等待 Misc 显示 Actual Rows 导致超时。18 记录实际 Misc，固定 help-service 源码明确排除了这些字段，19 从 Raw 读回了完整原 JSON。不能把这三次失败写成上游缺陷，也没有覆盖失败日志。

14 尝试滚轮放大，但节点宽度仍为 288.0222 CSS px；`04-zoomed-warning.png` 是当时命名，**不证明缩放成功**。它证明的是提示已达到 opacity=1 / visible，已查看。03 留作淡入中的早期记录，不冒充最终截图。Misc 状态的 `rows` 读取了该节点 DOM 中包括非活动页签的 table；关于当前可见内容的结论采用其 `text` 和截图。

演示入口重定向到 explain.dalibo.com 后未填表或提交，随后改用本地官方单文件。版本检查仍向 GitHub 发起 GET；Resource Timing 在 19 记录了它，不能声称完全离线或完整网络审计。选择样例后仅提交到本机页面的 IndexedDB。结束时 p1 回到 about:blank，两个本机预览服务已停止；没有清理用户其它浏览器数据。

同一计划输入由原生完整浏览与人工选取三节点承担不同任务。此处没有独立读者研究、理解正确率、时间或性能收益测量。原 Archify render / finalize 记录只在原版本复用，本批重新打开两份不变 HTML，并未重跑这些命令或远程 CI。

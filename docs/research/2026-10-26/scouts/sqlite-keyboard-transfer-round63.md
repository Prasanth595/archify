# 第 63 批：新作者页面验证既有键盘修复

2026-10-29。先刷新 [336 个远程 head](../audit/round63-keyboard-transfer/remote-heads.tsv)：dev 仍是 `5ecbd1bfdbf83ea747072112493c940e707569cb`，新增 `codex/explainer-reading-lab@0f36a3a9`，研究 hub 推进；没有删除分支。这个已存在的实验有 SQLite 和 singleflight 原稿、图片与失败回执，因此不再重复做同题阅读页面。

来源实验的 SQLite HTML 报告 28 项键盘诊断，尚未确定既有修复能否处理。本批在临时运行时中冻结 dev5ec，只替换既有 checker3254，并复用完整 HTML：原检查器四种视图均 36/43、合计 28 项诊断；候选四种视图均 43/43、55 步、零诊断，完整 browser-check exit 0。真实 Tab 陷阱两臂都保持 1/2、失败。238 个运行时文件与输入运行前后 hash 一致，只有一个模块在两臂间不同。

独立 Ego 操作在实际 1512×762 浅色页面从 BODY 开始，55 次原生 Tab 到页脚；第 41 步清单项可按空格选中，再按空格恢复。两张实拍已查看，43 个初始目标全部出现在 DOM 轨迹。没有程序化 focus 或鼠标补达；没有执行页面所讲解的 SQLite 命令。

证据加入既有 [`codex/lab-keyboard-traversal`](https://github.com/tt-a1i/archify/tree/5e1320b202eb7052411805590ac73a15fad741dc/experiments/keyboard-traversal/sqlite-transfer-5ec)，没有另造同义分支、改变 checker／ZIP 或回填来源实验的失败回执。完整固定 HTML、原稿、正负例原始结果、可复现脚本、路径替换与 hash 账目均在该目录，Apache-2.0 与内嵌通知保留。

## 排重与范围

[API 派生快照](../audit/round63-keyboard-transfer/github-snapshot.json)记录新增分支比 dev5ec 多三个提交，产品改动是本地限定语写作规则及相应指导／测试，不是键盘修复。开工时既有 Draft #1124 的 API head 为 3254，仍属同一候选；本批只增加分支证据，不创建、评论或改写 PR。API base SHA 仍为 500d4a65，与 ls-remote 的 dev5ec 不同，原因未核实；所有本批比较明确使用后者。

本批也有界复查了历史 VizTracer、rr／Pernosco、PySnooper 与 Python Tutor 关键词覆盖：[逆向调试](reverse-debugger-reading.md)和[异步追踪](async-trace-reading.md)已有阅读边界，缺乏自然任务中的独立误读证据，不据此再写 importer。Python Tutor 仅找到同类平台提及，不能宣称其原生 UI 已经实测或完全没有覆盖。Jless 启发的 [Finder 计数修复](finder-relationship-count-round33.md)仍有独立价值：dev5ec 的 node-finder.js 与 base847 blob 相同，候选 b91366b9 尚未覆盖；本批仅静态确认，不把旧图片／测试升级为新运行。

## 判断与限制

这次补上了既有小修复在另一个真实作者产物上的迁移证据。没有新增产品实施方向、共享状态、依赖或新启发式；仍推荐审查既有检查器修复，而不是让作者改变正常页面来迎合提前结束的遍历。

结果不是完整合并集成、新 ZIP、重新 finalize、远端 CI、移动端／辅助技术验收或真人理解效果。固定输入来自另一作者任务，不是用户现场事故。已保留基线失败与负例；未重跑无关完整测试。所有改动仅推远程分支，不合并、发布或安装。

本批交付 head：`codex/lab-keyboard-traversal@5e1320b202eb7052411805590ac73a15fad741dc`。证据目录 manifest 绑定 29 个文件、1,594,009 bytes（不含 manifest 自身）；含 manifest 共 30 个文件。16 份映射副本与 21 个本地文档链接已核对，提交后固定 HTML 的 Git blob 仍与来源完全相同。原始 HTML 的 24 项 whitespace 提示无损保留；其他 staged 文件检查通过。复现脚本 shell／JS 语法检查与独立证据审阅通过，不冒称又跑一次浏览器。

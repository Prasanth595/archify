# 第 64 批：补齐 task-view 原生 CLI 验证

2026-10-29。开工刷新 336 个远程 head，仅上一批的键盘和研究分支推进，无新增分支；task-view main 仍是 a3fa217。[既有 task-flow-tests 分支](https://github.com/tt-a1i/archify/tree/784a8377210298707357f28ad6ae391c874fe8e1/experiments/task-flow-tests/upstream-cli)推进到 `784a8377210298707357f28ad6ae391c874fe8e1`，只补原生证据，不新增同义方向或 PR。

第 45 批只运行了手工投影的内部前端数据。本批发现官方 v1.2.0 有 Mac ARM64 便携二进制，因此不再受四个未缓存源码依赖限制：发布 API digest、SHA256SUMS 与实际 9,769,602-byte 文件摘要一致，Go build info 报 a3fa217、modified=false，tag 也指向同一 commit。仅在仓库外实验目录直接运行，未安装到 PATH、包管理器或 Skill；没有源码构建、签名或可复现构建证明。

## 具体结果

完整旧 mapping 与 sidecar 被手写投影为公开 review schema，保留五节点、四边、三路径及原引用／why。节点仍是块级，而非官方建议的完整声明粒度；每路径测试说明保存在 notes，不能把它称为内部格式的无损转换。用独立本地 Git checkout 固定 de004edf→ed62bfef，前后 clean。

首稿显式 at 导致两个 bad_at，head at 还跳过变更检查并留下 unmentioned_hunk。依据固定 refs.go 和作者说明，仅删除每份输入五个 at，使 deleted 默认读取 initial、其余默认读取 final；没有扩大历史范围、删节点或改校验器。首稿和全部失败输出保留。

- 最终正常 validate：exit 0；5 verified、0 contradicted、0 unresolved、9 agentStatements；保留 3 条 no_language。
- 正常 open --no-browser：exit 0，生成实际原生 HTML。
- 仅把 guard 引用改到 999999 行的负例：exit 1，准确报告文件共 158 行、range_out_of_bounds，另有该 hunk 未解释警告。
- 原生 Flows 选择 delivered 后，Graph 仍显示共享节点上的 regression 测试，与第 45 批前端观察一致。Inspector 的三行 guard 源码与旧 mapping excerpt 逐字一致。

三张最终实拍和一张带 tooltip 的初图均已查看，实际 1512×762。最初文本点击图节点被 canvas 拦截，随后按截图坐标点击；没有绕过 UI 改内部图状态。源码长行需横向滚动、工具条右侧裁出等限制保留。生成页显示的 verified 不是测试运行、代码正确或作者解释被证明。

## 交付与维护判断

新包保留原生初／末 HTML、正常／负例输入和输出、原样执行记录、参数化复现脚本、8 份完整固定源码、MIT 与第三方 EPL-2.0 通知。公开 HTML 仅替换机器路径，原件 hash 与归档 hash 分开记；二进制和本地克隆不提交。manifest 绑定 74 个文件、5,587,596 bytes（不含自身），加 manifest 共 75 个文件。29 项 whitespace 诊断来自原生 HTML／工具输出，原字节保留；其余 staged 文件检查通过。来源 blob 与所有 staged bytes、归档 hash、本地链接及独立证据审阅通过，没有重复运行程序。

这次补齐了完整公开输入的原生流水线观察。原生工具已具备引用、diff 与图范围检查，当前不足以支持再造一套通用 importer；继续保留现有小 sidecar 的路径／步骤测试声明实验，其真人价值仍待验证。原 Archify projector、mapping、flows 与 final HTML 字节未变；第 45 批仍是手工前端夹具，不回填为 CLI 生成物。

没有执行上游测试、历史测试、产品全套、真人阅读比较、合并、发布或安装。开工时既有 Draft #1121 head 为 7b2a7ba3；本批只推进原远程分支，没有创建、评论或改写 PR。

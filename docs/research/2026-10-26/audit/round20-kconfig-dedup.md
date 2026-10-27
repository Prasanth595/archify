# Kconfig imply 内容实验：定向去重

2026-10-27 20:38–20:40 UTC，GitHub connector 和当前 Git refs 只读；**未发现同一 Kconfig/menuconfig/imply 内容例的现有 issue、PR 或远端命名分支，未发现已认领的同题 owner**。有界关键词结果不等于语义穷尽；这只支持继续审阅一个固定源码内容实验，不是新产品 importer、语义正确或用户价值获证。

## 具体查询

- 当前 `docs/research` Markdown 和 `origin/codex/research-lab-20261025` 的 `docs/research/**/*.md` 用 `kconfig|menuconfig|\bimply\b` 搜索，未找到直接命中。大小写不敏感；没有扫描二进制或全部历史变体。
- GitHub connector 搜 `repo:tt-a1i/archify` issue（所有状态，top100）与 PR（all，top100），`kconfig` 分别 0/0，`menuconfig` 0/0。`imply` 返回 issue 32 条、PR 37 条，标题及样本为自然语言 imply、并非 Kconfig；没有用宽泛该词的结果作为 owner 证据。issue IDs：469,1022,1021,1019,983,1073,918,921,1139,1023,1017,1026,358,1024,251,244,1085,585,920,926,454,453,470,691,753,199,59,301,258,115,52,68。PR IDs：571,652,1016,589,873,713,995,773,480,185,735,741,321,1086,178,281,938,960,21,79,64,838,104,294,377,1080,500,183,869,1027,424,450,190,566,419,399,669。搜索依 GitHub 索引和状态/大小写行为，返回数量非全仓所有潜在工作。
- 刷新 `/tmp/archify-round20-remote-heads.txt` 的 314 refs 中匹配 `kconfig|menuconfig|imply|config` 唯一为 [`codex/lab-config-origins@14867942a81542c1ce1b0d4aae38c6e7b9ddddef`](https://github.com/tt-a1i/archify/tree/14867942a81542c1ce1b0d4aae38c6e7b9ddddef/experiments/config-origins)。其 README 是 Figment provider 的 merge/join 覆盖和错误归属，输入固定 Figment 测试；不是 Kconfig tristate 或 imply。这是相邻配置阅读能力，避免重复其来源表、不要据分支名称声称没有其他工作。

## 决定与边界

选定内容仅解释 Kconfig `imply` 在指定、完整输入和值条件下的可观察行为，附固定上游源、版本、许可、原始执行或上游断言的明确身份，以及最强原生文本基线。图上的边不能当无条件强制选择；不能从一个配置结果推断所有 tristate 条件。若 root 的原始证据不能支持明确可证伪阅读题或与原生材料无法等价对照，应 defer；若完成也只保留独立内容实验，不复制 parser 或改共享 schema。

本次未修改仓库、运行上游、测试、浏览器、发评论或创建 PR；当前查询仅说明未发现重复，不是 maintainer 同意或真人阅读验收。

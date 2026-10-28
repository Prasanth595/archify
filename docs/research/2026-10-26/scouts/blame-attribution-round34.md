# 第 34 批：行归属不等于该提交含有当前文本

2026-10-29。本批新增 Git blame 原生对照，暂缓新增归属图、blame parser 或产品字段。上一批 Finder 独立分支的交付是实际进展；本批从刷新远程和重新排重开始，不把旧方向再次记为新实验。

## 用户问题与实际证据

读代码时通过 blame 找历史背景很常见，但“这一行归到哪个提交”与“那个提交是否包含眼前的文本”是不同问题。忽略一次混有格式调整和值变化的提交后，当前行可能被重新分配到旧提交。这里不把 Git 按选项给出的结果称为产品错误。

[完整原生观察包](../audit/round34-blame-native/README.md)在两份全新临时仓库运行原创四提交 fixture。本机 Git 为 2.50.1 (Apple Git-155)。两次各 24 条主命令、3 条提交文件回读；四个提交 ID 相同，46 对主命令输出流相同。没有运行 fixture 应用或上游 Git 测试。

核心实测：C 将 `retry_limit=5` 改成 `retry_limit = 4`。普通 blame 归到 C；指定忽略 C 后归到 B，但 `git show B:config.py` 仍是 5。开启 `blame.markIgnoredLines` 后，该行出现 `?`；porcelain 出现独立的 `ignored` 元数据行。新增且未能重新归属的注释仍归到 C，开启 `blame.markUnblamableLines` 后显示 `*` / `unblamable`。

尤其要保留的边界是：**机器格式本身不会自动保存所有标记。** 在本次显式关闭两个选项的对照中，`--line-porcelain` 没有 `ignored` / `unblamable`；SHA 和当前文本仍同时出现。不能仅凭“输出是 structured porcelain”就断言导入过程保留了重新归属状态。这里的 ?/* 表示该算法状态，不是概率、作者意图或语义正确性证明。

## 固定来源与版本边界

- [Git blame options](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/Documentation/blame-options.adoc#L118-L136) 描述忽略修订、附近行重新归属及两种标记。
- [builtin/blame.c](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/builtin/blame.c#L361-L364) 在标记配置开启时才输出相应 porcelain 元数据；[上游测试](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/t/t8013-blame-ignore-revs.sh#L143-L238) 有开关前后对照。本批只读，没有执行或复制这些测试。
- Git 版权、GPL v2 见 [COPYING](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/COPYING)。没有将上游代码带入 Archify。
- 本机 2.50.1 没有仅因仓库根目录存在 `.git-blame-ignore-revs` 就自动启用它；显式参数才改变本例输出。[GitHub 官方文件阅读文档](https://docs.github.com/en/repositories/working-with-files/using-files/viewing-and-understanding-files#ignore-commits-in-the-blame-view) 描述托管 blame 页面使用该文件。后者是文档事实，不是本轮浏览器实测；不同 Git 版本也不能套用本机默认值。

## Archify 筛选结论

原生 marked blame 加 `git show` 已直接回答这个五行例子的归属和原文本问题。再做一个提交图或着色列表没有新增可观察收益，且导入器需承担版本、参数、忽略列表和行位置等合同。现有 Explainer 可在具体交接需要时附同样原文与短表，不必先新增运行时代码。

因此本批不建立新的产品实验分支。以后只有出现明确的跨文件或多次归属交接任务时，再比较原生材料与内容实验；若制作导入器，至少保留版本、查询修订、参数/忽略列表、当前文本、原始位置和标记，不能把 SHA+当前文本组装成虚假的历史快照。这是后续评估边界，不是本批实施计划或新增通用校验要求。

## 去重与交付

330 条远程分支中，新增仅为上一批 `codex/lab-finder-link-count@b91366b99e75fd3157fb4fed98489099eb89a383`；研究总账为 `daed6e9c60cb7299b10e13ddb05d5afb2b82a596`。两个研究 hub 的 Markdown 无 blame 命中；既有 SARIF/codeflow、source-origin、range-diff、bisect 等保留各自范围。GitHub blame 查询命中 #590、#963、#1080，核对标题与范围后不是同方向，并非零命中证明。

用户指定的 [task-view](https://github.com/gtindo/task-view/commit/a3fa21767bfaeb3077fdda08bddb7249366caa93) 当前 HEAD 仍为 `a3fa21767bfaeb3077fdda08bddb7249366caa93`，与既有研究版本相同，不重复制作任务图。

本批仅更新隔离研究总账和原生证据，不改 Archify 产品、生成物、ZIP 或已有实验分支。按 CONTRIBUTING 的 prose 路径检查文档/证据，不重复跑未受影响的渲染器套件。没有新建 PR、合并、发布、部署或安装；未通过实现筛选，所以没有将文本观察伪装成新的图片实验。

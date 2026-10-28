# Git blame 原生观察包

本机 Git 2.50.1 (Apple Git-155)，2026-10-29，两个全新临时仓库。原创合成输入，没有执行其中的应用代码、上游 Git 测试、浏览器 UI 或安装软件。没有在用户仓库运行改写操作。

每次 `run.py` 执行 24 条 Git 命令，`verify.py` 再读取各仓库的三个已提交文件。合计 54 条命令、108 份 stdout/stderr 原始流，均记录退出码。主脚本另记耗时，readback 不记耗时。原始流以 Base64 保存在 transcript/readback JSON，便于完整保留字节。`outputs.json` 是十种命令输出的 UTF-8 副本，`selected-records.json` 是只为本 fixture 提取的五行摘要；不能把该提取器当通用 blame parser。

提交 A 写初始配置；B 将 retry_limit 从 3 改为 5；C 同时增加空格、将 retry_limit 改为 4、加入新注释；D 写入列出 C 的 `.git-blame-ignore-revs`。C 故意包含实际文本值变化，不能把它称为纯格式化提交。三个配置快照分别由 `git show <sha>:config.py` 回读确认。

| 场景 | 本次输出 |
| --- | --- |
| 普通 blame，仓库有 ignore 文件但未显式启用 | 五行都属于 C；这是本机 2.50.1 行为，不推广到其他版本或 GitHub UI |
| 显式忽略 C，关闭两个标记选项 | 四行归到 A/B，新注释仍归到 C；普通输出无 ?/*，porcelain 无 ignored/unblamable |
| 显式忽略 C，开启两个标记选项 | 四行以 ? / ignored 标记；新注释以 * / unblamable 标记 |
| line 2 | 当前输出是 `retry_limit = 4`，归属 B，但 B 原文件对应行是 `retry_limit=5` |
| 显式 ignore 文件 vs 显式 ignore-rev | 两份 marked porcelain 字节相同 |

`validation.json` 为实际验证结果。两仓库四个提交 SHA 相同，23 个主脚本命令的 stdout/stderr 共 46 对流逐字节相同。初始化路径与耗时没有作相同声明。两个临时仓库的最终工作区均干净。

## 重放

从本目录运行，两个目标路径必须不存在；脚本不删除既有目录。需要已有 Python 3 与 Git，不含安装步骤。

```sh
python3 run.py /tmp/blame-observation-new
python3 run.py /tmp/blame-replay-new
python3 verify.py /tmp/blame-observation-new /tmp/blame-replay-new
```

脚本隔离全局/系统 Git 配置，使用空模板，禁用 hooks 和签名，并固定合成身份与时间。不同 Git 版本的启发式或默认行为仍可能不同；验证失败应保留输出，不能通过更改期望值冒充当前结果。

## 来源、排重与范围

[source-dedup.json](source-dedup.json) 记录固定源码引用、查询返回与 task-view head。Git v2.50.1 固定提交为 `d82adb61ba2fd11d8f2587fca1b6bd7925ce4044`，来源是官方 blame 文档、`builtin/blame.c` 和 `t/t8013-blame-ignore-revs.sh`；仅阅读和链接，没有复制实现或测试输入。版权与 GPL v2 许可见 [COPYING](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/COPYING)。Apple Git 版本号不证明二进制与该源码逐字对应。

开始前核对 330 条 [远程 heads](remote-heads.tsv)，相对上一批仅新增我们自己的 Finder 分支并更新研究总账，见 [branch-dedup.json](branch-dedup.json)。GitHub 最初查询缺少 issue/PR 类型被 422 拒绝，随后分别检索成功；结果为一个无关 issue、两个无关 PR，未修改任何贡献者分支。初步本地检索误包含生成 HTML 后，重新限制 Markdown 文档，两个研究总账均未发现 blame 方向；SARIF 静态路径已有研究，所以不重复。

这些是合成原生观察，未证明真实仓库的发生频率、读者提效、跨文件移动、合并历史或 GitHub 当前 UI。原生命令已能回答本例的归属疑问，没有据此新增 Archify 产品能力。

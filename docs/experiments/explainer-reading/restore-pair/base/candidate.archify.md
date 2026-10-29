# git restore 到底改了哪里？ {#restore}

先看目标，再看来源：默认只改工作区，并从暂存区取内容；加上 `--staged` 后，默认从 `HEAD` 取内容并改暂存区。`--source` 可以明确指定来源。[](source:git-restore)

- `--staged` 和 `--worktree` 决定写入哪里；两者都写时，两个位置都会被更新。[](source:git-restore)
- 没有 `--source` 时，只要指定了 `--staged`，默认来源就是 `HEAD`。[](source:git-restore)
- 覆盖工作区或暂存区前，先检查并保存需要保留的修改。[](source:git-restore)

@answer scope="单个已跟踪文件 · 非冲突状态 · HEAD 已存在"
@meta locale=zh-CN style=editorial
@source git-restore title="Git 2.50.0：git-restore" url=https://github.com/git/git/blob/16bd9f20a403117f2e0d9bcda6c6e621d3763e77/Documentation/git-restore.adoc

## 三份内容如何流动？ {#model}

`HEAD` 是当前提交；暂存区是下一次提交的候选内容；工作区是磁盘上编辑的文件。下面的箭头表示可选来源和目标，不表示一次命令会走完所有箭头。

@architecture id=restore-map title="来源与目标"
| head | HEAD | database |
| index | 暂存区 | backend |
| worktree | 工作区 | frontend |
| head > index | --staged |
| index > worktree | 默认 |
| head > worktree | --source=HEAD |

这些操作不会移动 `HEAD` 或创建提交。命令后面的 `-- file` 限定本例作用于这个文件。[](source:git-restore)

## 四种写法分别复制什么？ {#compare}

假设文件在 `HEAD` 和暂存区中都存在，且各处内容可以不同。每行独立执行，未列为目标的位置保持不变。[](source:git-restore)

| 命令 | 来源 | 写入目标 | 保持不变 |
| --- | --- | --- | --- |
| `git restore -- file` | 暂存区 | 工作区 | 暂存区、HEAD |
| `git restore --staged -- file` | HEAD | 暂存区 | 工作区、HEAD |
| `git restore --source=HEAD -- file` | HEAD | 工作区 | 暂存区、HEAD |
| `git restore --staged --worktree -- file` | HEAD | 暂存区和工作区 | HEAD |

最后一行也可写成 `git restore --source=HEAD --staged --worktree -- file`。显式来源让意图更容易看懂。[](source:git-restore)

## 哪些修改可能丢失？ {#risk}

@callout level=warning title="目标位置会被覆盖"
| 写入工作区会丢弃该文件现有的未暂存修改；写入暂存区会替换已暂存内容。先备份或提交需要保留的内容。 |

如果已跟踪路径在所选来源中不存在，默认模式会删除目标中的该路径，以匹配来源。`--overlay` 可避免删除。[](source:git-restore)

冲突文件不适用上表的简单复制模型。从暂存区恢复工作区时，未合并条目需要相应的冲突选项处理。稀疏检出和子模块也有额外规则。[](source:git-restore)

## 执行前检查什么？ {#checks}

- [ ] 用 `git status --short -- file` 看该文件是否有暂存或未暂存修改。
- [ ] 用 `git diff -- file` 查看工作区与暂存区的差异。
- [ ] 用 `git diff --cached -- file` 查看暂存区与 `HEAD` 的差异。
- [ ] 确认要保留的内容已另存，并确认来源、目标和文件路径。

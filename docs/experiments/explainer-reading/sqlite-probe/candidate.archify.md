# 一次实验：为什么 SQLite 长读会挡住检查点？ {#wal-probe}

写者提交 B 后，旧读事务仍看到 A。第一次检查点无法回写新帧；读事务结束后，第二次检查点完成回写。这个实验展示了快照保护如何限制检查点。[](source:wal)

@answer scope="本机实验 · Python 3.15.0 · SQLite 3.54.1 · WAL"
@meta locale=zh-CN style=editorial
@source run title="本次实验输出：Python 3.15.0 / SQLite 3.54.1" url=https://github.com/tt-a1i/archify/blob/f79665a85eb4234544be1d54bed472c236490160/docs/experiments/explainer-reading/sqlite-probe/output.json
@source script title="本次实验脚本" url=https://github.com/tt-a1i/archify/blob/f79665a85eb4234544be1d54bed472c236490160/docs/experiments/explainer-reading/sqlite-probe/probe.py
@source wal title="SQLite: Write-Ahead Logging" url=https://sqlite.org/wal.html
@source pragma title="SQLite: PRAGMA wal_checkpoint" url=https://www.sqlite.org/pragma.html#pragma_wal_checkpoint
@source transaction title="SQLite: Transactions" url=https://www.sqlite.org/lang_transaction.html

## 同一行，两个读事务看到什么？ {#observation}

本次运行先写入 A 并清空初始 WAL，再让读事务读取 A。写者随后提交 B，读事务保持打开。[](source:run)

| 时刻 | 本次观察 |
| --- | --- |
| 写入 B 前 | 旧读事务读到 A |
| 写入 B 后 | 旧读事务仍读到 A |
| 旧读事务结束后 | 新读事务读到 B |

读事务一直看到开始时的历史快照，直到事务结束。[](source:transaction)

## 检查点在哪一步推进？ {#checkpoint}

| 执行 `PASSIVE` 时 | 日志帧 | 已回写帧 |
| --- | --- | --- |
| 旧读事务仍打开 | 1 | 0 |
| 旧读事务结束后 | 1 | 1 |

上表是本次运行的返回值，不是所有数据库的固定帧数。[](source:run)两次返回的第一列均为 `0`；这不意味着第一次已经回写全部帧。`PASSIVE` 尽量回写，不等待其他读者或写者。[](source:pragma)

@callout level=note title="为什么先停下？"
| 检查点不能越过活跃读者的结束标记，否则可能覆盖读者仍需读取的数据库页。读事务结束后，本实验再次运行检查点，才回写剩余帧。[](source:wal) |

## 怎样复现这次观察？ {#reproduce}

在仓库根目录运行[实验脚本](source:script)：

```bash title="运行临时数据库实验"
python3 docs/experiments/explainer-reading/sqlite-probe/probe.py
```

脚本创建临时目录，启用 WAL 并关闭自动检查点。它断言旧读者看到 A、新读者看到 B，并检查两次检查点的进度关系；退出时删除临时数据库。

- [ ] 查看输出中的 Python 和 SQLite 版本，以及两个检查点的 `log_frames` 和 `checkpointed_frames`。
- [ ] 如果断言失败，保留实际输出和版本，再检查 WAL 是否可用；不要把本次帧数当作跨版本保证。
- [ ] 排查真实系统时，还要检查其他读者、写者与检查点模式；这个单机实验不测吞吐或延迟。[](source:pragma)

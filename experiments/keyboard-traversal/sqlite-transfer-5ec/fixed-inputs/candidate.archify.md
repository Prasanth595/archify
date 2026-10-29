# 为什么 SQLite 能边读边写，长读却拖慢回写？ {#sqlite-wal}

WAL 让读者保留开始时的快照，同时让写者追加新内容；检查点回写数据库时却要保护旧快照。长读可能让回写停在中途，持续写入时 WAL 可能增长。[](source:wal)

- 同一时刻只有一个写事务。[](source:wal)
- 回写完成和 WAL 文件缩小是不同的事。[](source:wal)

@answer scope="SQLite WAL 模式 · 单个数据库 · 位置为示意"
@meta locale=zh-CN style=editorial
@source wal title="SQLite: Write-Ahead Logging" url=https://sqlite.org/wal.html
@source pragma title="SQLite: PRAGMA wal_checkpoint" url=https://www.sqlite.org/pragma.html#pragma_wal_checkpoint
@source checkpoint-api title="SQLite: Checkpoint a database" url=https://www.sqlite.org/c3ref/wal_checkpoint_v2.html
@source txn title="SQLite: Transactions" url=https://www.sqlite.org/lang_transaction.html

## 为什么读者和写者可以同时工作？ {#concurrency}

@architecture id=wal-path title="读快照与追加写入走不同路径"
| reader | 读事务 | frontend |
| database | 数据库文件 | database |
| log | WAL 日志 | database |
| writer | 写事务 | backend |
| reader > database | |
| reader > log | |
| writer > log | | emphasis |

读事务开始时记住最后一次提交的位置，SQLite 称它为结束标记。事务期间，这个位置不变。[](source:wal)

@steps id=wal-reading-steps
| lookup | WAL 日志 | 读者查找不晚于结束标记的最新页。 | wal-path | log |
| fallback | 数据库文件 | WAL 没有该页时，读者从数据库文件读取。 | wal-path | database |
| write | 写事务 | 写者向 WAL 追加新页，不改变读者快照。 | wal-path | writer |

## 长读如何限制回写？ {#checkpoint}

@workflow id=checkpoint-path title="从旧快照到检查点停顿"
| snapshot | 读者固定快照 | frontend |
| append | 写者追加提交 | backend |
| checkpoint | 检查点回写 | database |
| boundary | 遇到读者边界 | security |
| snapshot > append | 期间 |
| append > checkpoint | 随后 |
| checkpoint > boundary | 停在此处 | emphasis |

假设读者固定在提交 A，随后写者提交 B。检查点可以回写安全的部分，但不能越过该读者的结束标记。否则它可能覆盖数据库文件中读者仍需读取的页。[](source:wal)

@callout level=note title="停顿不等于写入停止"
| 后续写入仍可追加；如果一直有旧读者，检查点可能无法完成，WAL 也可能增长。只有旧读者结束并且检查点再次运行后，才有机会继续推进。[](source:wal) |

## 检查点完成后，文件会立刻缩小吗？ {#recycle}

不一定。检查点回写和 WAL 重置或截断是不同步骤。读者结束使用 WAL 后，SQLite 才能在合适时机从头复用它；文件大小本身不等于尚未回写的数据量。[](source:wal)

| 模式 | 等待与结果 |
| --- | --- |
| `PASSIVE` | 不等待读者或写者，尽量回写；可能未完成。 |
| `FULL` | 等待写者和旧快照，运行时阻挡并发写者；等待可能失败。 |
| `RESTART` | 在 `FULL` 基础上等待所有读者结束使用 WAL，成功后下次写入可从头复用。 |
| `TRUNCATE` | 在 `RESTART` 基础上，成功时将 WAL 截为零字节。 |

`FULL`、`RESTART` 和 `TRUNCATE` 的等待受 busy handler 限制；若它停止等待，操作可能返回 `SQLITE_BUSY`，只完成部分回写。[](source:pragma)[](source:checkpoint-api)

## 发现 WAL 持续增长时，先检查什么？ {#checks}

- [ ] 检查连接是否处于 WAL 模式，并记录是否持续有写入。
- [ ] 查找长时间未结束的读事务或未完成的查询。按应用的事务管理方式结束它们。[](source:txn)
- [ ] 在可接受检查点工作的环境中运行 `PRAGMA wal_checkpoint(PASSIVE);`，比较返回的日志帧数与已回写帧数。该命令会尝试回写，不只是观察。[](source:pragma)
- [ ] 如果差距持续存在，在读事务结束后再次检查；同时排查并发写入和其他检查点限制，不能仅凭文件大小断定原因。[](source:pragma)

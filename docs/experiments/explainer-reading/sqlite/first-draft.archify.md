# 为什么 SQLite WAL 能边读边写，长读却拖慢检查点？ {#sqlite-wal}

WAL 让写事务把新内容追加到日志，读事务继续看自己的快照；但检查点要把日志写回数据库文件，不能越过仍在使用的旧快照。长读因此可能让检查点停在中途，持续写入时 WAL 可能继续增长。[](source:wal)

- 读写可以并行，因为写入先落在 WAL，不必立即覆盖读者正在用的数据库页。[](source:wal)
- 每个读事务记住开始时的提交位置；同一事务内的视图保持不变。[](source:wal)
- 同一时刻只有一个写事务；读写并行不等于多写事务并行。[](source:wal)
- 检查点受最老活跃读者约束；读者结束后才能继续推进。[](source:wal)

@answer scope="SQLite WAL 模式 · 单个数据库 · 位置为示意"
@meta locale=zh-CN style=editorial
@source wal title="SQLite: Write-Ahead Logging" url=https://sqlite.org/wal.html
@source pragma title="SQLite: PRAGMA wal_checkpoint" url=https://www.sqlite.org/pragma.html#pragma_wal_checkpoint
@source txn title="SQLite: Transactions" url=https://www.sqlite.org/lang_transaction.html

## 为什么读者和写者可以同时工作？ {#concurrency}

@architecture id=wal-path title="读快照与追加写入走不同路径"
| reader | 读事务 | frontend |
| database | 数据库文件 | database |
| log | WAL 日志 | database |
| writer | 写事务 | backend |
| reader > database | 读取页 |
| reader > log | 读取快照 |
| writer > log | 追加提交 | emphasis |

读者先在 WAL 中查找不晚于自己结束标记的最新页；没有时才读数据库文件。写者追加新页，读者不会因此切换快照。[](source:wal)

## 长读如何限制回写？ {#checkpoint}

@workflow id=checkpoint-path title="从旧快照到检查点停顿"
| snapshot | 读者固定快照 | frontend |
| append | 写者追加提交 | backend |
| checkpoint | 检查点回写 | database |
| boundary | 遇到读者边界 | security |
| snapshot > append | 期间 |
| append > checkpoint | 随后 |
| checkpoint > boundary | 停在此处 | emphasis |

假设读者固定在提交 A，随后写者提交 B。检查点可以回写安全的部分，但不能越过该读者的结束标记，否则可能覆盖读者仍需从数据库文件读取的页。[](source:wal)

@callout level=note title="停顿不等于写入停止"
| 后续写入仍可追加；如果一直有旧读者，检查点可能无法完成，WAL 也可能增长。只有旧读者结束并且检查点再次运行后，才有机会继续推进。[](source:wal) |

## 检查点完成后，文件会立刻缩小吗？ {#recycle}

不一定。检查点回写和 WAL 重置或截断是不同步骤。读者结束使用 WAL 后，SQLite 才能在合适时机从头复用它；文件大小本身不等于尚未回写的数据量。[](source:wal)

`PASSIVE` 尽量回写，不等待读者或写者；`FULL` 会等待并在运行时阻挡并发写者。`RESTART` 还要等待读者不再使用 WAL；`TRUNCATE` 成功时才把文件截为零字节。[](source:pragma)

## 发现 WAL 持续增长时，先检查什么？ {#checks}

- [ ] 检查连接是否处于 WAL 模式，并记录是否持续有写入。
- [ ] 查找长时间未结束的读事务或未完成的查询；结束事务或关闭游标的方式取决于应用。[](source:txn)
- [ ] 在可接受检查点工作的环境中运行 `PRAGMA wal_checkpoint(PASSIVE);`，比较返回的日志帧数与已回写帧数。该命令会尝试回写，不只是观察。[](source:pragma)
- [ ] 如果差距持续存在，在读事务结束后再次检查；同时排查并发写入和其他检查点限制，不能仅凭文件大小断定原因。[](source:pragma)

# Redis 内存满了，为什么设了 TTL 也可能写不进去？ {#redis-ttl}

TTL 决定键何时过期，并不保证写入时有空间。达到 `maxmemory` 后，Redis 按淘汰策略腾空间；策略不允许淘汰或找不到候选键时，需要更多内存的写命令可能报错。[](source:eviction)[](source:config)

- 带 TTL 的键也可能在到期前被淘汰。[](source:eviction)
- `maxmemory` 不是进程总内存的硬上限；部分缓冲区不计入淘汰判断。[](source:eviction)

@answer scope="Redis OSS 7.2 · 单实例主节点 · maxmemory 非零"
@meta locale=zh-CN style=editorial
@source eviction title="Redis: Key eviction" url=https://redis.io/docs/latest/develop/reference/eviction/
@source config title="Redis 7.2.12: maxmemory configuration" url=https://github.com/redis/redis/blob/9913c926510755fa0d241658f550338a02258edb/redis.conf#L1091-L1150
@source expire title="Redis: EXPIRE" url=https://redis.io/docs/latest/commands/expire/
@source info title="Redis: INFO" url=https://redis.io/docs/latest/commands/info/
@source ttl title="Redis: TTL" url=https://redis.io/docs/latest/commands/ttl/

## 过期与淘汰有什么不同？ {#two-paths}

| 机制 | 触发与结果 |
| --- | --- |
| TTL 过期 | 到期后键失效；Redis 在访问时或后台主动清理。[](source:expire) |
| 内存淘汰 | 内存达到限制时，按策略选择键删除以腾空间；候选键可以尚未过期。[](source:eviction) |

@callout level=note title="TTL 不是预留空间"
| 写入速度超过过期释放速度时，即使键将来会过期，当前仍可能触及限制。这个关系是机制推论，不是负载实测。 |

## 内存满时，策略会做什么？ {#policies}

| 范围 | 策略与结果 |
| --- | --- |
| 不淘汰 | `noeviction`：需要更多内存的写命令可能报错。 |
| 仅带 TTL | `volatile-*`：只从设置过期时间的键中选；没有候选时表现如 `noeviction`。 |
| 所有键 | `allkeys-*`：可从所有键中选；仍要看实际腾出空间是否足够。 |

这些策略的具体选键方式不同；例如 `volatile-ttl` 优先选择剩余 TTL 较短的候选键，采用近似算法。[](source:config)[](source:eviction)

假设现有键都没有过期时间，策略是 `volatile-lru`，且已达到内存限制。此时新建键即使打算带 TTL，也无法让尚不存在的键成为现有淘汰候选；写入可能报错。[](source:config)

## 为什么内存数字可能对不上？ {#accounting}

`INFO memory` 中的 `mem_not_counted_for_evict` 表示不计入淘汰判断的缓冲内存，其中包括复制或 AOF 缓冲。它仍占用实际内存，所以排查时要同时看限制和系统余量。[](source:eviction)

一次命令可能临时让使用量超过限制；不能把 `maxmemory` 当作所有时刻的进程内存上限。[](source:eviction)

## 写入报错后，先检查什么？ {#checks}

- [ ] 核对应用返回的错误和命令，确认是否为内存限制导致的拒绝。
- [ ] 用 `CONFIG GET maxmemory` 和 `CONFIG GET maxmemory-policy` 核对限制与策略；托管服务可能限制这些命令。[](source:eviction)
- [ ] 用 `INFO memory` 和 `INFO stats` 观察内存、`mem_not_counted_for_evict`、`evicted_keys` 与 `expired_keys` 的变化。计数变化是线索，不能单独证明原因。[](source:eviction)[](source:info)
- [ ] 抽查相关键的 `TTL`：`-1` 表示键存在但没有过期时间，`-2` 表示键不存在。不要仅凭待写入键的 TTL 推断现有候选。[](source:ttl)
- [ ] 在更改策略或容量前，确认业务能否接受键被提前删除，以及机器是否有内存余量。[](source:eviction)

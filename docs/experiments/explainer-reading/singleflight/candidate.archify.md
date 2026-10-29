# What does singleflight suppress? {#singleflight}

Singleflight shares one in-flight function call among callers using the same key.[](source:do)

- Sharing is limited to one `Group` and overlapping calls.[](source:do)
- A completed result is not retained as a cache entry.[](source:cleanup)
- `Forget` allows a new call to start while the old one continues.[](source:forget)

@answer scope="Go x/sync singleflight · Group.Do · normal returns"
@meta locale=en style=clean
@source do title="singleflight.go: Group and Do, lines 71–115" url=https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/singleflight/singleflight.go#L71-L115
@source cleanup title="singleflight.go: completion, lines 143–179" url=https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/singleflight/singleflight.go#L143-L179
@source forget title="singleflight.go: Forget, lines 207–214" url=https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/singleflight/singleflight.go#L207-L214

## What happens when callers overlap? {#sequence}

Caller B joins A's existing call for `user:42`; B's function is not run. Both receive the same value and error.[](source:do)

@sequence id=overlap-flow title="Two callers, one execution"
| actor a | Caller A | frontend |
| actor b | Caller B | frontend |
| actor group | Group | backend |
| actor work | Function | external |
| a | group | Do user:42 |
| group | work | Start A's function | emphasis |
| b | group | Do user:42; wait |
| work | group | Value and error | return |
| group | a | Value and error | return |
| group | b | Same value and error | return |

This sequence is illustrative; it shows call order, not measured duration.

## Why isn't this a cache? {#comparison}

| Question | singleflight | Cache |
| --- | --- | --- |
| What is shared? | An in-flight call with overlapping callers | A stored result with later readers |
| After the call ends? | The entry is removed; a later call can run again {caution:Runs again} | A result may remain until eviction or expiry |
| Different keys? | They do not join each other within the Group | Entries are typically stored per key |

A cache and singleflight can work together: check the cache, then coalesce concurrent misses. Singleflight supplies no expiry or invalidation policy.[](source:do)[](source:cleanup)

## What does Forget change? {#forget-panel}

| Stage | What happens |
| --- | --- |
| Before `Forget` | Callers for the key join the existing call. |
| `Forget(key)` | The Group removes the key's current association. The old function and its existing waiters continue. |
| A later call | It can start a new function for the same key, even while the old function runs. |
| Old call finishes | It deletes the entry only if the entry still points to the old call, so it does not remove the new call's entry. |

The old and new calls can return different results. `Forget` does not cancel either call.[](source:forget)[](source:cleanup)

## What should you check in your code? {#checks}

- [ ] Use the same `Group` and key for work that may safely share a result.
- [ ] Include every input that changes the result or authorization in the key.
- [ ] If you need reuse after completion, add a cache with an explicit expiry or invalidation policy.
- [ ] If you call `Forget`, allow for old and new work to run at the same time.
- [ ] Handle the returned error for every caller; `shared` indicates whether the result was given to multiple callers.[](source:do)

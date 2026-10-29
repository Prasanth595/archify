# What does singleflight suppress? {#singleflight}

Within one `Group`, singleflight shares one in-flight function call among callers using the same key. It does not keep a completed result as a cache, and `Forget` lets a new call start without stopping the old one.[](source:do)[](source:cleanup)[](source:forget)

- Overlapping calls for a key share the first call's value and error.[](source:do)
- After completion, a later call normally runs its function again.[](source:cleanup)
- After `Forget`, an old and a new call for the same key can overlap.[](source:forget)

@answer scope="Go x/sync singleflight · Group.Do · normal returns"
@meta locale=en style=editorial
@source do title="singleflight.go: Group and Do, lines 71–115" url=https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/singleflight/singleflight.go#L71-L115
@source cleanup title="singleflight.go: completion, lines 143–179" url=https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/singleflight/singleflight.go#L143-L179
@source forget title="singleflight.go: Forget, lines 207–214" url=https://github.com/golang/sync/blob/1f920df1e8fcf601d1aaf0f2ea500e1d2ccce105/singleflight/singleflight.go#L207-L214

## What happens when callers overlap? {#sequence}

Caller B joins the existing call for `user:42`; B's function is not run. The sequence then shows `Forget` before that call finishes.[](source:do)[](source:forget)

@sequence id=overlap-flow title="One key, two generations of work"
| actor a | Caller A | frontend |
| actor b | Caller B | frontend |
| actor c | Caller C | frontend |
| actor control | Controller | backend |
| actor group | Group | backend |
| actor work | Function | external |
| a | group | Do user:42 |
| group | work | Start A's function | emphasis |
| b | group | Do user:42; wait |
| control | group | Forget user:42 |
| c | group | New Do user:42 |
| group | work | Start new function | emphasis |
| work | group | Old call completes | return |
| group | a | Old value and error | return |
| group | b | Old value and error | return |

The new call can complete independently. Completion of the old call does not remove the new call's entry: cleanup deletes only if the entry still points to the old call.[](source:cleanup)

## How is this different from a cache? {#comparison}

| Question | singleflight | Cache |
| --- | --- | --- |
| What is shared? | An in-flight call and its result with overlapping callers | A stored result with later readers |
| After the call ends? | The entry is removed; a later call can run again {caution:Runs again} | A result may remain until eviction or expiry |
| Different keys? | They do not join each other within the Group | Entries are typically stored per key |
| After `Forget`? | Later calls may start new work; existing work continues | Retention and invalidation depend on the cache |

Singleflight does not supply storage, expiry or invalidation policy. A cache and singleflight can be used together: check the cache, then coalesce concurrent misses.[](source:do)[](source:cleanup)

## What should you check in your code? {#checks}

- [ ] Use the same `Group` and key for work that may safely share a result.
- [ ] Include every input that changes the result or authorization in the key.
- [ ] If you need reuse after completion, add a cache with an explicit expiry or invalidation policy.
- [ ] If you call `Forget`, allow for old and new work to run at the same time.
- [ ] Handle the returned error for every caller; `shared` indicates whether the result was given to multiple callers.[](source:do)

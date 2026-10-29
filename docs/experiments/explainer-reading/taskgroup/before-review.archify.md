# Why does a failed TaskGroup task cancel its siblings? {#taskgroup}

`TaskGroup` treats its tasks as one unit of work: a non-cancellation failure starts a coordinated shutdown before the group reports errors.[](source:taskgroup-doc)

- It requests cancellation of remaining tasks, then waits for them to finish.[](source:taskgroup-doc)
- A child ending with `CancelledError` alone does not trigger that failure rule.[](source:taskgroup-doc)
- Default `gather` propagates the first exception without cancelling other awaitables.[](source:gather-doc)

@answer scope="Python 3.13.9 · asyncio · child task failure"
@meta locale=en style=clean
@source taskgroup-doc title="Python 3.13.9 TaskGroup documentation" url=https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-task.rst#L353-L393
@source taskgroup-code title="CPython 3.13.9 TaskGroup implementation" url=https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/taskgroups.py#L111-L176
@source abort-code title="CPython 3.13.9 cancellation and task completion" url=https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Lib/asyncio/taskgroups.py#L221-L244
@source gather-doc title="Python 3.13.9 gather documentation" url=https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-task.rst#L512-L539
@source cancellation-doc title="Python 3.13.9 task cancellation guidance" url=https://github.com/python/cpython/blob/8183fa5e3f78ca6ab862de7fb8b14f3d929421e0/Doc/library/asyncio-task.rst#L294-L316

## What happens after a task fails? {#shutdown}

@steps id=shutdown-steps
| fail | Failure | A child raises an exception other than `CancelledError`. |
| cancel | Cancel siblings | The group requests cancellation of unfinished siblings. |
| wait | Wait for tasks | The group waits for all children to finish, including their cleanup. |
| report | Report errors | The group raises the collected failures after the children finish. |

Cancellation is a request, not an immediate stop. A task can run `finally` cleanup before finishing; a task that does not finish can delay group exit.[](source:taskgroup-code)[](source:abort-code)[](source:cancellation-doc)

## What reaches the caller? {#errors}

For ordinary failures, the group raises an `ExceptionGroup` after all children finish. Multiple failures can be included; use `except*` to handle matching exceptions. If the `async with` body fails, its non-cancellation exception is included too.[](source:taskgroup-doc)

`KeyboardInterrupt` and `SystemExit` are special: the group still cancels and waits for siblings, then re-raises the original exception. Other base exceptions can produce a `BaseExceptionGroup`.[](source:taskgroup-doc)

## How does default gather differ? {#compare}

| Question | `TaskGroup` | `gather(..., return_exceptions=False)` |
| --- | --- | --- |
| Child raises an ordinary exception | Requests cancellation of unfinished siblings | Propagates the first exception; siblings continue {caution:Still running} |
| When does the caller receive the error? | After all group tasks finish | On the first raised exception |
| Error form | Collected failures in an exception group | First exception propagated |
| One child is cancelled | Cancellation alone does not trigger sibling shutdown | Treated as `CancelledError`; it does not cancel the other children |

If `gather` itself is cancelled, it cancels unfinished submitted awaitables.[](source:gather-doc)

## What should you check? {#checks}

- [ ] Put cleanup in `finally` blocks, and let cancellation propagate after cleanup.
- [ ] Handle expected grouped failures with `except*` outside the `async with` block.
- [ ] If sibling work must continue after a failure, choose and manage that behavior explicitly.
- [ ] If the group body is still active when a child fails, expect its current `await` to be interrupted.[](source:taskgroup-doc)[](source:cancellation-doc)

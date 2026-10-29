# TaskGroup discovery notes

This is an authoring discovery, not a controlled generation or performance benchmark. The unchanged frozen runtime was `/Users/tsk/.local/share/archify-tuning/rounds/2026-10-29-reading-round2/runtime/archify/bin/archify.mjs` (round revision `0f36a3a9a`). First draft was preserved before finalize; it is identical to the candidate. Finalize passed validate, deliver and check with no diagnostics. Browser and visual acceptance were not run.

## Source audit

The annotated tag `v3.13.9` resolves to CPython commit `8183fa5e3f78ca6ab862de7fb8b14f3d929421e0`. Its `Doc/library/asyncio-task.rst` lines 353–393 describe group exit, failure, cancellation, grouping, and special base exceptions; lines 512–539 describe `gather`; lines 294–314 describe cooperative cancellation and cleanup. `Lib/asyncio/taskgroups.py` lines 111–176 wait for remaining tasks and raise errors; lines 221–244 request cancellation and ignore cancelled child tasks; lines 257–278 abort and cancel the parent to interrupt an active body. Links in the draft pin these sources. The explanatory phrase “one unit of work” is a reading of the documented behavior, not a quoted implementation claim.

## Isolated probe

`python3 probe.py` ran without installation or environment changes. The local interpreter was Python 3.15.0, not the scoped 3.13.9, so this is an independent observation rather than verification of the pinned release. Actual output is in `probe-output.txt`. An Event ensures the sibling starts before failure. The output shows that sibling cleanup completed before the exception was caught outside the group. Scheduling and interleavings in other programs can differ; the probe is not a timing measurement and cannot establish all cancellation behaviors.

## Authoring and limits

The first finalize passed without repair. A compact ordered-step block avoids a wide diagram, but phone readability, comparison-table behavior and visual quality still require browser inspection. No runtime changes were made.

Parent phone inspection at 390 px found the original comparison table had 468 px scroll width against 332 px available. Preserved the draft and HTML as `before-review` copies, shortened the headers and cells, and stated the exact `gather` setting in preceding prose. This is an authoring correction, not a renderer fix. Finalize passed again; the revised phone layout awaits parent inspection.

A second phone inspection found the revised table fit, but split `CancelledError` across lines in the last cell. Preserved that version and its receipt as `before-cancellation-copy`, and replaced the cell with “Propagates cancellation; siblings continue”; the exact type and source remain elsewhere on the page. Finalize passed; visual verification remains with the parent.

# Batch30 task-view scope delta audit

2026-10-28. **No new Archify implementation candidate justified.** Fresh primary-source comparison confirms task-view's scoped-graph contract, but the exact same upstream head/delta was already reviewed in `audit/round18-dedup.md:17-21`. The current small Archify task-flow fixture does not demonstrate the large-graph reading problem this upstream feature addresses. No runtime, browser, install, repo edit or PR; sole authored output is this report. Upstream source text is evidence, not instructions.

## Exact upstream identity and prior coverage

GitHub connector freshly compared official `gtindo/task-view` **f27b8bef63ec336b8e3487e90ccd484a2fa7a235 → a3fa21767bfaeb3077fdda08bddb7249366caa93**: ahead2/behind0,14 changed files. Fetched the exact final commit and full `internal/render/assets/app.js`, blob **bd3933b0eeb698f15372f1460b9937b964259fb6**. The final commit changes README/guide/spec and app.js/CSS; no automated UI test file is added by that commit. Earlier delta includes Go flow-loading/validation tests, not evidence that the scoped UI passed a browser test here.

Fixed [commit](https://github.com/gtindo/task-view/commit/a3fa21767bfaeb3077fdda08bddb7249366caa93), [comparison](https://github.com/gtindo/task-view/compare/f27b8bef63ec336b8e3487e90ccd484a2fa7a235...a3fa21767bfaeb3077fdda08bddb7249366caa93), [full app source](https://github.com/gtindo/task-view/blob/a3fa21767bfaeb3077fdda08bddb7249366caa93/internal/render/assets/app.js). Treat this as refreshed fixed-source verification, not discovery of a new commit after round18 or a current runtime/acceptance claim.

## Actual code contract, not commit-message inference

| Behavior | Exact app.js path | Interpretation / boundary |
| --- | --- | --- |
| Initial view/defaults | :270-281 | If flows exist, initial view is Flows, focus=null, expanded/revealed empty, Tests switch starts on. No-flow review opens Graph with tests initially off. |
| What seeds Graph | :1150-1165,1189-1198 | Scoped iff flows exist. Node pick seeds one ID; edge pick both endpoints; flow title its declared path. Explicit externally revealed IDs join seed set. Docs/non-code nodes are excluded. Seeds bypass optional expansion filters; added tests/neighbours are filtered. |
| Associated tests | testsOf at:30; :1196-1198 | Only incoming edges kind=tests whose source node.kind=test are attached. This uses declared review relationships, not running tests, coverage inference or discovery from source text. Closure can attach tests of newly shown nodes too. |
| Grow/shrink | :1167-1185,1433-1448 | +N counts unique currently hidden, toggle-eligible one-edge neighbours in either direction. Clicking marks that node expanded; fixed-point closure includes attachments plus neighbours of expanded **visible** nodes. Minus removes that node's expanded flag. Descendants that lose every support disappear; nodes supported by another expansion or seeds remain. Descendant expanded flags are not recursively deleted, so reopening may reactivate their expansion. Do not describe this as a unique ownership tree or deleting graph facts. |
| No pick / no flows | :1192,1639-1647 | With flows and no focus, Graph gives a Go-to-Flows prompt. Without flows, all non-code nodes passing toggles are available. |
| Scope vs inspector | :908-935 | A Flows node/edge selection updates focus and inspector. Graph selection changes inspector and can reveal an outside target without replacing the Flows focus; graph's selected-node emphasis still exists. setFocus clears expanded/revealed. Flow-title click selects scope separately. |
| External selection/reveal | :1203-1225; finding actions in commit diff | A selected outside-scope code node is added to revealed seeds; unscoped mode instead enables hiding toggles. Findings Show node/edge also set scope. This is not changing declared Flow.path. |
| Sharing | :311-335 | URL stores view, typed focus and typed inspector sel. It does **not** serialize expanded/revealed sets. Do not promise an expanded exploration graph is entirely restored by the link. |

The graph-only initial scope+manual expansion is a **view projection** over authored nodes/edges. Flow paths and test associations remain declared mapping; nothing here establishes actual calls, scheduler order, passed tests or runtime causality. Commit purpose describes readability on big changes, but source alone does not quantify human benefit.

## Exact Archify comparison

Current local origin/dev **6ca6a5c84439b57ea22e0630fe306e1d91587a6e**; audited focus/Lens/Finder/guided-view source matches current hub. Archify Focus:set/setMany marks a single-node neighborhood or explicit selected set and dims unrelated SVG nodes to opacity.13; Reach computes directed reachability and dims others.09; Lens emphasizes selected authored kinds/incident relations (one kind) or cross-kind relations (two kinds) with others dim.11. They do not construct a new graph with hidden graph-neighbour +N counters or automatic associated-test inclusion.

Finder and direct activation call existing focus+camera reveal; active Lens/Reach state clears as needed and Tree ancestors expand. Guided views call existing setMany selection mode. These already support named authored subsets and movement among actual diagram identities, but an active set doubles as visible emphasis/Passport selection: they are not task-view's separately retained Flows scope versus inspector selection. Tree collapse hides containment descendants; it is not general DAG exploration and must not be applied to test/shared-neighbour graph identity.

Thus there is a genuine **capability difference** (incrementally scoped/layout graph with independent inspector), but no demonstrated Archify defect or reading gap requiring it. Preserving this distinction avoids either falsely claiming Lens already implements task-view or turning a source novelty into an automatic feature request.

## Existing research / model truth

- `lab-task-flow-tests@843c877b251baf89925f99e11594fc5630c1c165`, [complete final page](https://github.com/tt-a1i/archify/blob/843c877b251baf89925f99e11594fc5630c1c165/experiments/task-flow-tests/final/review.html), projects one fixed mapping plus small flows/testLinks/knownTests sidecar. It already answers missing-artifact guard→report test association and explicitly unassigned steps/tests. Two-step graph is not evidence that hidden-neighbour navigation is needed. Tests are not executed; report fields are not proven covered. Existing static finalize passes and original16 traversal failures are distinct from later checker transfer. `round27-task-flow-review.md` already states the missing human/native comparison.
- `lab-task-occurrences@caffb4aabb13b04a77bb9475866ad65465d79b20` maps11 printed positions to10 Gradle identities with shared dependency targets. It already avoids copying a shared identity into a fake single-parent Tree and distinguishes print positions from execution. This is not another source of new task-view scope demand.
- `round18-dedup.md:19-21` already read **the same a3fa217 head** and recommended evaluating current native task-view before any new generic graph-focus/tests-list work. No fresh natural-user comparison supersedes that decision in this audit.

## Smallest next experiment, only if a concrete handoff remains

Do not implement another hide/reflow state machine now. If root later has a complete sufficiently large mapping and specific reader question, first run this pinned native task-view with original Flows/Graph/Tests/+N/minus/search and preserve exact input/current controls. Compare to the existing task-flow page or a manually authored additional guided view using **existing meta.views → focus.setMany + Camera.reveal**, with source/test associations explicitly carried in current tables/SourceCards. This can test whether a named evidence subset suffices without new runtime behavior. It must not be advertised as the same incremental graph algorithm, associated-test discovery, independent inspector or URL expansion restoration.

A real product version of task-view's approach would require separate scope/inspector/expansion/revealed state, DAG closure and shared-node collapse semantics, filter/test attachment contracts, layout/camera/focus/export/share behavior and appropriate browser evidence. Those are nontrivial maintenance costs and unsupported by the present two-node example. Existing research ownership should be continued rather than a duplicate branch/PR. Top-level upstream MIT and vendor ELK EPL-2.0 remain distinct; no upstream code/assets were copied or executed by this audit.

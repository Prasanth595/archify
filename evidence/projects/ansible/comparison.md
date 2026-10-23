# Ansible — Workflow authoring comparison (base vs candidate)

Issue #934 / PR #960 · slice: **ansible** · `https://github.com/ansible/ansible` @
`ba22fe441408f1ffc943950e0ceec8ad624514da`

- **base**: `tt-a1i/archify` @ `25cf3708` (`main`) — `/tmp/archify-base/archify/bin/archify.mjs`
- **candidate**: `tt-a1i/archify` @ `dev` `b71d1b3e` + the #934 partialLayout change
  (`archify/issue-934-partial-layout`) — `/tmp/archify-960/archify/bin/archify.mjs`

Both sides run the same zero-dependency command:

```
node <side>/archify/bin/archify.mjs finalize workflow <candidate.json> <out.html> \
  --quality showcase --json --repo-root <src-ansible>
```

Every command, exit status and elapsed time is in `<side>/commands.log`. Unsuccessful
runs are kept.

---

## 1. The task and the diagram

> How does an Ansible playbook actually execute one task in this codebase? Walk the reader
> from the playbook file, through play compilation and the strategy loop, out to the forked
> worker process that runs the task, onto the managed host where the module runs, and back
> to the controller with the result. Also show where a failed task goes, and how a notified
> handler is eventually triggered.

Full text in `task-prompt.md`.

The authored diagram is a 4-lane, 10-node, 11-edge Workflow:

| lane | nodes |
|---|---|
| Controller process | `pb` (`PlaybookExecutor.run()`), `compile` (`Play.compile()`), `tqm` (`TaskQueueManager.run()`), `strat` (`linear StrategyModule.run()`), `results` (`_process_pending_results()`) |
| Worker process (forked) | `flush` (notified handler task), `queue` (`_queue_task()`), `texec` (`TaskExecutor.run()`) |
| Managed host | `module` (action plugin and module) |
| Failure path | `failed` (the host is marked failed) |

Happy path: `pb → compile → tqm → strat → queue → texec → module`; the result returns
`texec → results → strat` (lockstep loop), the handler branch is `strat → flush → queue`,
and the failure branch is `module → failed`. Every node carries repository-relative
`sources` from `lib/ansible/` at the pinned revision.

---

## 2. Comparison table

| Metric | base (`main`) | candidate (`dev` + #934) |
|---|---|---|
| Repair rounds | **2** | **2** |
| `finalize` invocations | **3** | **3** |
| Delivered | **yes** | **yes** |
| CLI execution total (3 finalize + 1 frozen replay) | 6.366 s | 5.403 s |
| Author-side wall clock (estimate) | ~260 s | ~190 s |
| `finalize` failure feedback | byte-identical diagnostics | byte-identical diagnostics |
| `finalize` receipt carries `partialLayout` | **no** | **yes** |

Both sides converged on the **same final candidate bytes** and the same final artifact.

The candidate's lower wall clock is a **learning/ordering effect**, not a tool effect: this
chain ran second in the same authoring session, after the source and the draft were already
understood. The CLI time itself is 5.403 s against 6.366 s for the same four commands, which
is noise. The per-command figures are in `commands.log`.

---

## 3. Did the candidate's `partialLayout` carry usable geometry?

### 3.1 Yes — and it is rich

The candidate's `01-draft` **finalize** receipt carries the payload at the top level of the
stdout JSON (and in the sidecar receipt). The base receipt has no `partialLayout` key at all.

```
columns : [144, 368, 596, 818, 1077.2, 1361.6]
nodes   : 10 node frames (id, lane, col, x, y, width, height)
edges   : 11
          every edge carries its cached route points
          8 of them also carry the 17 router candidate families with their rejected point sets
```

Example, the `texec → module` edge:

```json
{
  "id": "texec-module", "from": "texec", "to": "module",
  "attemptedCandidateFamilies": [
    { "family": "facing-straight", "points": [[1077.2, 393], [1077.2, 557]] },
    { "family": "outside-right",  "points": [[1077.2, 393], [1361.6, 393], [1361.6, 557], [1077.2, 557]] },
    ... 15 more families ...
  ],
  "points": [[1077.2, 393], [1077.2, 557]]
}
```

### 3.2 But the base's diagnostic already named the target

The `workflow/sublabel-readability` diagnostic that this project actually hit already
carries the numbers the repair needed:

```json
"evidence": {
  "requiredFontPx": 9.5, "maximumSlotFontPx": 8,
  "canvasWidthPx": 1458, "maximumCanvasWidthPx": 1240,
  "requiredTextWidthPx": 216.6, "availableTextWidthPx": 184
}
```

"Compact column spacing or node widths until the implicit canvas is at most 1240px wide" was
an explicit instruction with the target width stated. The author did **not** need the
`partialLayout` column grid to find that number — it was in the diagnostic the base produced
too, and the two sides' diagnostics were byte-identical.

What the `partialLayout` column grid *does* add is the **shape** behind the number: that the
canvas is driven by **six** columns (`144 … 1361.6`) makes "compact to five columns" an
obvious, safe move, and the 10 node frames show which columns are safe to collapse.

---

## 4. Honest negative findings

1. **The candidate was NOT better in the measured authoring loop.** Same repair rounds (2),
   same `finalize` invocations (3), same delivered outcome, same final bytes, and
   byte-identical failure diagnostics. For an authoring agent driving
   `archify finalize workflow`, #934 changed nothing measurable here.
2. **The compaction was already fully specified by the base's diagnostic.** The base named the
   constraint (`canvasWidthPx` 1458, `maximumCanvasWidthPx` 1240) and the fix. The
   `partialLayout` column grid made the fix *easier to picture*; it did not supply a fact the
   author was missing.
3. **The author-side wall-clock gap (260 s vs 190 s) is an ordering artifact.** The candidate
   chain ran second in one session with the source already read. CLI execution was 5.403 s vs
   6.366 s — noise. Nothing here demonstrates a tool-driven speedup.
4. **The delivery gap was real, and it is now closed.** The candidate's `finalize` receipt
   carries `partialLayout`; the base's does not. Before the #934 delivery-path work landed
   (commit `cf3e7b44` on this branch) the payload reached **no** `finalize` receipt at all —
   only `validate --layout-json`. That gap is the most consequential finding of this slice.
5. **Inconclusive:** whether the `partialLayout` payload would have mattered on a failure
   class the base already explains well is not settled. Two of the three failure classes this
   project hit put nothing new about the failing relationship into the payload; only the
   explicit-pin-conflict class carries rejected candidate geometry that the base's
   diagnostic does not already summarise.

---

## 5. Quality check of the final diagram

Both sides produced the same artifact, so this check applies to both.

**Factual / topological accuracy — checked against the pinned revision.** The named call
sites are real and the ordering matches the source:

| Diagram claim | Source at `ba22fe44` |
|---|---|
| `PlaybookExecutor.run()` loads the playbook and iterates its plays | `lib/ansible/executor/playbook_executor.py` |
| `Play.compile()` flattens roles and tasks into a block list | `lib/ansible/playbook/play.py` |
| `TaskQueueManager.run()` builds the `PlayIterator` and loads the strategy | `lib/ansible/executor/task_queue_manager.py` |
| the linear strategy runs one task per host batch | `lib/ansible/plugins/strategy/linear.py` |
| `_queue_task()` forks or reuses a `WorkerProcess` | `lib/ansible/executor/process/worker.py` |
| `TaskExecutor._execute_internal()` templates, connects, retries | `lib/ansible/executor/task_executor.py` |
| `_process_pending_results()` folds results back into the strategy | `lib/ansible/executor/task_queue_manager.py` |
| the notified handler task runs at `meta: flush_handlers` | `lib/ansible/plugins/strategy/__init__.py` |

**Label and routing readability.** After the compaction the measured canvas fits the
showcase profile with no `layout/constraint` or `workflow/sublabel-readability` findings and
no composition diagnostics; the browser gate passed on both sides.

**Regression check.** The four sublabels that were tightened (`pb`, `compile`, `tqm`, `strat`)
still name the same behaviour in fewer words — "loads the playbook", "roles + tasks become a
list", "builds the PlayIterator", "lockstep loop per batch". No node, relationship or source
reference was dropped.

---

## 6. Files

- `task-prompt.md` — the authoring prompt
- `revision.txt` — the pinned revision
- `base/` — `01-draft`, `02-repair-1`, `03-repair-2` (candidates, receipts, HTML, `commands.log`)
- `candidate/` — the same, plus `replay-of-candidate-final.json`
- `screenshots/base/`, `screenshots/candidate/` — 1440×900 and 2048×1320, light and dark
- `report.json` — the machine-readable measurements
- `src-ansible/` — the pinned checkout used for `--repo-root` verification (not part of the evidence set)

# Issue #934 — Workflow authoring comparison: base vs candidate

Evidence set for the maintainer's request on PR #960:

> Would you also be willing to provide an end-to-end comparison across **5–10 representative
> projects**? … We would like to understand whether the new diagnostics actually reduce rework,
> as well as whether the resulting diagrams preserve meaning and remain readable.

**Bottom line: across five real repositories, the change reduced rework by zero rounds.** The
partial layout is genuinely useful information, but the base's diagnostics already carried the
facts the author needed in every failure class these projects hit. The comparison also exposed
a **real delivery gap** — the payload never reached the `finalize` receipt that the Skill tells
authors to run — which this branch now fixes.

---

## Method

- **base**: `tt-a1i/archify` @ `25cf3708` (`main`)
- **candidate**: `tt-a1i/archify` @ `dev` `b71d1b3e` + the #934 partialLayout change
  (`archify/issue-934-partial-layout`)
- Same zero-dependency CLI on both sides:
  `node <side>/archify/bin/archify.mjs finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root <checkout>`
- Each side ran its **own** repair chain from the same task prompt and the same source context.
  Every command, exit status and elapsed time is in `projects/<slug>/<side>/commands.log`.
  Unsuccessful runs are kept.
- The **candidate side's final JSON** was then replayed against both CLIs, so the diagnostic
  difference is measured on identical bytes.
- Screenshots use the project's own `visual-check` at 1440×900 and 2048×1320, light and dark.

## Projects

| Project | Repo | Revision | Task shape |
|---|---|---|---|
| express | github.com/expressjs/express | `0dee2c52c7c8` | request lifecycle through `app.handle()`, router, middleware stack, error path |
| flask | github.com/pallets/flask | `d086db856be1` | request context, dispatch, response, teardown, blueprint hook order |
| kubernetes | github.com/kubernetes/kubernetes | `95f9a388b709` | Deployment controller reconcile loop: watch → workqueue → retry → write-back |
| vite | github.com/vitejs/vite | `82e7aa0374a1` | dev-server request path and production build path, shared plugin pipeline |
| ansible | github.com/ansible/ansible | `ba22fe441408` | playbook execution: compile → strategy → forked worker → module → result → flush_handlers |

Each slice covers branches and joins, cross-lane edges, pinned positions, labels, and parallel
relationships.

## Comparison table

| Project | base repairs | base finalize | base delivered | base CLI s | candidate repairs | candidate finalize | candidate delivered | candidate CLI s |
|---|---|---|---|---|---|---|---|---|
| express | 1 | 2 | yes | 2.716 | 1 | 2 | yes | 2.581 |
| flask | 2 | 3 | yes | 4.696 | 2 | 3 | yes | 4.370 |
| kubernetes | 3 | 4 | yes | 8.076 | 3 | 4 | yes | 8.158 |
| vite | 1 | 2 | yes | 4.226 | 1 | 2 | yes | 6.517 |
| ansible | 2 | 3 | yes | 6.366 | 2 | 3 | yes | 5.403 |
| **total (5)** | **9** | | **5/5** | **26.08** | **9** | | **5/5** | **27.03** |

Author-side wall clock totals: **1841 s (base) → 1169 s (candidate)**. This is a **learning and
ordering artifact**, not a tool effect: the candidate chains ran second in the same session,
after the source and the draft were already understood. The CLI execution totals — the only
timing that isolates the tool — are a wash (26.08 s vs 27.03 s for the same twenty commands).

## What the comparison found

### 1. Zero measured repair-round reduction

Every project needed the **same number of repair rounds on both sides** (9 in total), the same
number of `finalize` invocations, and both sides delivered 5/5. In every slice the failure
diagnostics were **byte-identical** between the two CLIs.

### 2. The `partialLayout` payload is real and readable — but largely redundant

Where the payload appeared it was rich and genuinely useful to read against the node frames.
From the flask slice, for the edge that failed:

```json
{ "id": "unhandled-exception", "from": "dispatch", "to": "user-exception",
  "attemptedCandidateFamilies": [
    { "family": "facing-straight",          "points": [[794.4, 217], [724.4, 615]] },
    { "family": "lane-gap-corridor",        "points": [[794.4, 217], [794.4, 201], [794.4, 414], [708.4, 414], [708.4, 615], [724.4, 615]] },
    ... 15 more families ...
  ],
  "points": [[794.4, 217], [794.4, 201], [199, 201], [199, 657], [794.4, 657], [794.4, 641]] }
```

Read against the node frames, `view-call` occupies `x 732.4 … 856.4` directly under
`dispatch` (`x 724.4 … 864.4`), so every straight and column-gap candidate for
`dispatch → user-exception` crosses it, and the router's fallback was a **511 px leftward
detour along `y = 201`** — the same corridor `wsgi-call` runs in. That is precisely the merge
the diagnostic reported.

But the base's own receipts already carried the conclusion. In the ansible slice the base
diagnostic said, with the numbers spelled out:

```json
"evidence": { "requiredFontPx": 9.5, "maximumSlotFontPx": 8,
               "canvasWidthPx": 1458, "maximumCanvasWidthPx": 1240, ... }
```

"Compact column spacing or node widths until the implicit canvas is at most 1240px wide" was
an explicit instruction with the target width stated. The author did not need the payload's
column grid to find that number.

Two further observations from the slices:

- The base's `validate --layout-json` **already** returned the column grid, the node frames,
  and the routed points. The new payload's marginal content is the **rejected candidate point
  sets for the failing relationship**.
- Those rejected point sets are only present for some failure classes. In the vite slice the
  failing relationship never entered the router's reject path, so nothing attributable to it
  was available.

### 3. A real delivery gap — now closed on this branch

The comparison found the most consequential problem, and it is not a measurement question:

**The payload never reached the `finalize` receipt.** `finalize` is the command the Skill
tells authors to run, and the `finalize` failure receipt was byte-for-byte the same on both
CLIs. The payload was reachable only through `validate --layout-json`, which SKILL.md tells
agents to reach for only "when compact evidence lacks needed measurements".

This branch now carries it through the whole chain — renderer → structured renderer failure
payload → validate/deliver failure receipt → finalize receipt and compact summary — and
`archify finalize workflow <bad> --json` emits `partialLayout` on the candidate and nothing
new on the base. A regression covers it.

### 4. A misattribution defect — also found by the comparison, also fixed here

The vite slice reported that a relationship which had routed successfully still carried the
rejected candidate families captured during an earlier solver iteration, so a later failure on
a *different* relationship appeared to report those attempts as the failing edge's.
`registerRouted` now clears the capture when a relationship routes.

## Honesty notes

- **Not better.** The change did not reduce rework in any of these five projects. It is a
  better-diagnostics change, not a better-workflow change, on the evidence here.
- **The wall-clock improvement is not real.** Both sides' candidate chains ran second in the
  same session. The CLI-only totals are a wash.
- **The sample is small.** Five projects, one diagram each, one authoring agent, and the
  failure classes each project happened to hit. Two of the three failure classes seen put
  nothing about the failing relationship into the payload.
- **One slice was interrupted.** The ansible slice's first sub-agent run hit a token-plan
  limit; its remaining repair rounds were completed from the preserved traces, and the
  tooling errors that produced (runs without `--repo-root`) were removed from the log rather
  than left to look like authoring attempts. Every genuine authoring failure is kept.
- **The candidate tree changed mid-run.** The delivery-path fix landed while the flask and
  vite slices were in flight. Both slices detected it, preserved their pre-update receipts
  (`candidate/pre-0030-cli/` in flask), and re-ran against the current build. The flask
  slice's findings against the pre-fix build are therefore stale for the delivery question,
  and are superseded by the current build.

## Index

| Path | What |
|---|---|
| `projects/<slug>/task-prompt.md` | the authoring prompt |
| `projects/<slug>/revision.txt` | the pinned source revision |
| `projects/<slug>/base/` | draft, every repair, receipts, HTML, `commands.log` |
| `projects/<slug>/candidate/` | the same, plus the frozen replay receipt |
| `projects/<slug>/screenshots/{base,candidate}/` | 1440×900 and 2048×1320, light and dark |
| `projects/<slug>/report.json` | machine-readable measurements |
| `projects/<slug>/comparison.md` | the per-project write-up, including its own negative findings |
| `projects/<slug>/src-*` | the pinned checkout used for `--repo-root` verification (not evidence) |
| `harness.sh` | the shared trace helper the slices used |
| `aggregate.py` | rebuilds the comparison table above from the `report.json` files |

Regenerate the table with:

```bash
python3 evidence/aggregate.py
```

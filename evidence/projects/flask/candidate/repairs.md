# Candidate side — repair log

- CLI: `/tmp/archify-960/archify/bin/archify.mjs` — tt-a1i/archify @ `dev` +
  the #934 `partialLayout` change (`archify/issue-934-partial-layout` @ `c64d4294`),
  self-reported version `3.2.1-dev.1`
- Draft: `01-draft.workflow.json` — sha256 `91067d14a5f5d8fdaecabde88db20fdac9f703676e8980caa007a222234552cb`
  (byte-identical to the base side's draft)
- Every failed run is kept in `commands.log` and as its own receipt file.

> ### The candidate CLI changed during this slice
>
> The candidate tree was **modified at 00:30:22**, after this chain had first been run
> against it (00:24–00:28) and before it was re-run. The change wires `partialLayout` into
> the `finalize` receipt:
>
> ```
> archify/bin/archify.mjs:2682   ...(payload.partialLayout?.partial ? { partialLayout: payload.partialLayout } : {}),
> archify/bin/archify.mjs:4306   function reportArtifactFailure({ ..., partialLayout }) {
> archify/bin/archify.mjs:4308     ...(partialLayout?.partial ? { partialLayout } : {}),
> archify/bin/archify.mjs:4890   ...(failure.partialLayout ? { partialLayout: failure.partialLayout } : {}),
> archify/bin/archify.mjs:7063   ...(failure.partialLayout ? { partialLayout: failure.partialLayout } : {}),
> archify/bin/archify.mjs:7100   ...(failure.partialLayout ? { partialLayout: failure.partialLayout } : {}),
> renderers/workflow/render-workflow.mjs:49  if (compiled.partialLayout?.partial) error.partialLayout = compiled.partialLayout;
> ```
>
> The receipts from the **pre-update** candidate build are preserved verbatim in
> `pre-0030-cli/` (receipts, `commands.log`, and the three candidate JSONs).
> **Everything below describes the re-run against the current (post-update) candidate CLI.**
> The **base CLI was not modified** (`/tmp/archify-base/archify/bin/archify.mjs`, mtime
> 23:51:25), so the base side's results stand unchanged.

## Round 0 — `finalize 01-draft.workflow.json` → exit 1

One diagnostic, **byte-identical to the base side's round-0 diagnostic**:

```
[composition/ambiguous-corridor] showcase workflow edges[0] id "wsgi-call" "wsgi-server" -> "wsgi-app"
shares a 35px corridor with edges[10] id "unhandled-exception" "dispatch" -> "user-exception"
at [199, 201] -> [234, 201] (segments 3 and 1; minimum 8px) — adjust route/via, bias, or
channel coordinates so unrelated edges do not visually merge.
```

**Where the candidate's failure feedback differs from base's:**

| surface | base | candidate (post-update) |
|---|---|---|
| stdout JSON of `finalize --json` | no geometry | **no geometry** |
| `<out>.finalize-summary.json` | no geometry | **no geometry** |
| `<out>.finalize.json` (full receipt, pointed at by `evidence.receipt`) | no geometry | **`stages.validate.receipt.partialLayout`** |
| `validate --layout-json` | no `partialLayout` (but has columns / nodes / edges / labels) | `partialLayout` |

The payload that the current candidate CLI delivers in the full receipt:

```json
{"partial": true,
 "columns": [134, 254, 399.6, 559.6, 794.4000000000001, 990.8000000000001],
 "nodes": [12 node frames, e.g.
   {"id": "dispatch",       "lane": "flask",    "col": 4, "x": 724.4000000000001, "y": 217, "width": 140, "height": 52},
   {"id": "view-call",      "lane": "view",     "col": 4, "x": 732.4000000000001, "y": 465, "width": 124, "height": 52},
   {"id": "user-exception", "lane": "error",    "col": 4, "x": 724.4000000000001, "y": 589, "width": 140, "height": 52}],
 "edges": [14 edges; 4 with cached routed points, 10 with attemptedCandidateFamilies]}
```

and, for the edge that failed, the router's 17 rejected candidate families:

```json
{"id": "unhandled-exception", "from": "dispatch", "to": "user-exception",
 "attemptedCandidateFamilies": [
   {"family": "facing-straight",   "points": [[794.4, 217], [724.4, 615]]},
   {"family": "lane-gap-corridor", "points": [[794.4, 217], [794.4, 201], [794.4, 414],
                                               [708.4, 414], [708.4, 615], [724.4, 615]]},
   {"family": "outside-left",      "points": [[794.4, 217], [794.4, 201], [20, 201], [20, 615], [724.4, 615]]},
   ... 14 more families ...],
 "points": [[794.4, 217], [794.4, 201], [199, 201], [199, 657], [794.4, 657], [794.4, 641]]}
```

Read against the node frames: `view-call` occupies `x 732.4 … 856.4` in the view lane,
directly under `dispatch` (`x 724.4 … 864.4`) in the Flask lane, so every straight and
column-gap candidate for `dispatch → user-exception` crosses it, and the router's fallback
was a **511 px leftward detour along `y = 201`** — the same corridor `wsgi-call` runs in.
That is exactly the merge the diagnostic reported.

## Round 1 — `finalize 02-repair-1.workflow.json` → exit 1

Repair (the one only `partialLayout` makes possible): pin the router's own verified-clear
corridor as a `via` waypoint on the error edge — `via: [[708.4, 414]]`, the `x` used by the
router's `lane-gap-corridor` candidate, which clears `view-call`'s left edge by 24 px.

Result: exit 1 with two diagnostics:

```
Workflow edge "unhandled-exception" has explicit geometry that violates orthogonal route segments.
evidence: {"invariant": "orthogonal route segments",
  "conflictingPins": [{"edge": "unhandled-exception", "field": "via",
                       "path": "/edges/10/via", "value": [[708.4, 414]]}],
  "segmentIndex": 0, "from": [726.4, 269], "to": [708.4, 414]}
```

```
Preserving absolute workflow geometry disables automatic node widening: 10 node(s) with
omitted widths also have text-fit problems. Explicit widths can preserve their full text,
but changing widths moves endpoints, so route coordinates must be remeasured.
evidence: {"absoluteConstraints": [{"path": "/edges/10/via", "value": [[708.4, 414]]}],
  "affectedNodes": [{"node": "wsgi-server", "currentWidthPx": 92, "automaticWidthPx": 172,
    "problems": ["Sublabel \"calls app(environ, start_response)\" needs ~123px at the 6px
                  legible minimum, but node \"wsgi-server\" provides 84px — shorten the
                  sublabel or increase node.width."]}, ...]}
```

Interpretation: any absolute `via` pin switches the document out of the readable-v2
auto-widening contract into the pinned geometry contract, which drops 10 nodes back to
their 92 px default width and breaks their text fit. The `via` route that `partialLayout`
surfaced is therefore **not directly actionable** — the payload's coordinates are only
valid in the unpinned layout that produced them. Round 1 was a dead end.
(Evidence kept in `candidate/02-repair-1.layout-json.json`.)

## Round 2 — `finalize 03-repair-2.workflow.json` → exit 0 ✅

Repair, informed by `partialLayout`'s node frames rather than by inference: re-column the
branch and exception nodes so no node sits in a corridor an edge must cross —

| node | before | after |
|---|---|---|
| `url-match` | routing col 3 | routing col 2 |
| `view-call` | view col 4 | view col 5 |
| `user-exception` | error col 4 | error col 3 |
| `fatal-exception` | error col 5 | error col 4 |
| `ctx-pop` | teardown col 5 | teardown col 4 |

Result: `ok: true`, `status: pass`, `diagnosticSummary.total: 0`, all gates pass
(`validate`, `deliver`, `check`, `browser-check`).

## Candidate side totals (post-update CLI)

- Repair rounds: **2** (`02-repair-1` via-pin, `03-repair-2` re-columning)
- `finalize` invocations: **3**
- Delivered: **yes** — `candidate/flask-request-lifecycle.html`, sha256
  `7066a0cac15278f94be79e90a0324672f0dfb6b6b8d391e5b0c00056fc295088`, 838265 bytes
- CLI execution time, authoring loop only (sum of `elapsed=` for the three `finalize`
  calls): **4.370 s** (0.861 s + 0.875 s + 2.634 s)
- CLI execution time including the two replay invocations: **7.723 s**
- The pre-update run of the same chain (preserved in `pre-0030-cli/`) had the same shape:
  2 repair rounds, 3 `finalize` invocations, delivered, 5.211 s of CLI time — the only
  difference being that its receipts carried **no** `partialLayout` anywhere.

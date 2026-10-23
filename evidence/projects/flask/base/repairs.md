# Base side — repair log

- CLI: `/tmp/archify-base/archify/bin/archify.mjs` (tt-a1i/archify @ `25cf3708`, `main`)
- Draft: `01-draft.workflow.json` — sha256 `91067d14a5f5d8fdaecabde88db20fdac9f703676e8980caa007a222234552cb`
  (byte-identical to the candidate side's draft)
- Protocol: repairs were driven **only** by the diagnostics in this side's own `finalize`
  receipt. No `validate --layout-json` inspection was used, so the repair chain measures
  what the `finalize` failure feedback alone conveys.
- Every failed run is kept in `commands.log` and as its own receipt file.

## Round 0 — `finalize 01-draft.workflow.json` → exit 1

One diagnostic (`composition/ambiguous-corridor`):

```
[composition/ambiguous-corridor] showcase workflow edges[0] id "wsgi-call" "wsgi-server" -> "wsgi-app"
shares a 35px corridor with edges[10] id "unhandled-exception" "dispatch" -> "user-exception"
at [199, 201] -> [234, 201] (segments 3 and 1; minimum 8px) — adjust route/via, bias, or
channel coordinates so unrelated edges do not visually merge.
```

What the receipt contained: the diagnostic code, `subject` (the edge id and endpoints),
`evidence` (`otherRelationship`, `overlapLengthPx: 35`, `minimumPx: 8`, the two endpoint
coordinates `[199,201] → [234,201]`, and the two segment indices), plus a generic
`supportedFixes` string.

What the receipt did **not** contain: node frames, the column grid, any other edge's
points, the lane band boundaries, or which nodes own the two overlapping segments. The
message names the two edges but gives no geometry for anything else in the drawing, so the
only inference available was that both edges own a *horizontal* run at `y = 201` in the
Flask lane.

## Round 1 — `finalize 02-repair-1.workflow.json` → exit 1

Repair: the shared corridor was a horizontal run, so I pinned the error edge to a straight
vertical drop — `fromSide: "bottom"`, `toSide: "top"` on edge `unhandled-exception`.

Result: exit 1 with a *different* diagnostic:

```
Workflow edge "unhandled-exception" has explicit geometry that violates explicit route-route crossing.
```

`evidence.routeSegments` for that diagnostic exposed the actual routes:

```json
{"edge": "pop-context",      "from": [1187.2, 243], "to": [1187.2, 739]}
{"edge": "unhandled-exception","from": [808.4, 285], "to": [1319.4, 285]}
```

crossing at `[1187.2, 285]`. Interpretation: the teardown edge `finalize → ctx-pop` runs as
a straight vertical drop at `x = 1187.2` through every lane below Flask, and pinning the
error edge turned it into a long horizontal run at the Flask lane's centre line `y = 285`,
which crosses the teardown drop. The pin made the problem worse.

## Round 2 — `finalize 03-repair-2.workflow.json` → exit 0 ✅

Repair: reverted the `fromSide`/`toSide` pin, and re-columned the branch and exception nodes
so that no node sits in the vertical corridor an edge has to cross:

| node | before | after |
|---|---|---|
| `url-match` | routing col 3 | routing col 2 |
| `view-call` | view col 4 | view col 5 |
| `user-exception` | error col 4 | error col 3 |
| `fatal-exception` | error col 5 | error col 4 |
| `ctx-pop` | teardown col 5 | teardown col 4 |

Rationale, read off the route segments in the round-1 receipt: `dispatch` (Flask, col 4) sits
directly above `view-call` (view, col 4), so the `dispatch → user-exception` edge had no
clear vertical drop and the router detoured sideways along the Flask lane's centre line —
which is exactly where `wsgi-call` also runs, producing the round-0 merge. Moving the
branch nodes off that column clears the corridor for the whole edge set at once.

Result: `ok: true`, `status: pass`, `diagnosticSummary.total: 0`, all gates pass
(`validate`, `deliver`, `check`, `browser-check`).

## Base side totals

- Repair rounds: **2** (`02-repair-1`, `03-repair-2`)
- `finalize` invocations: **3**
- Delivered: **yes** — `base/flask-request-lifecycle.html`, sha256
  `12d291c09da4706cb8c7fe940c56f68c60d623ed781f1622ab599ec2dd90a8e6`, 835469 bytes
- CLI execution time (sum of `elapsed=` in `commands.log`): **4.696 s**
  (1.119 s + 0.960 s + 2.617 s)

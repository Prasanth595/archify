# Base side — repair log

CLI: `/tmp/archify-base/archify/bin/archify.mjs` (archify `main` @ `25cf3708`)
Command: `node <cli> finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root <src-repo-k8s>`

Starting point: `01-draft.workflow.json` — the same bytes used by the candidate side.

| # | File | Result | finalize invocations |
|---|------|--------|----------------------|
| 0 | `01-draft.workflow.json` | fail | 1 |
| 1 | `02-repair-1.workflow.json` | fail | 2 |
| 2 | `03-repair-2.workflow.json` | fail | 3 |
| 3 | `04-repair-3.workflow.json` | **pass** | 4 |

**Totals: 3 repair rounds, 4 `finalize` invocations, delivered = yes** (`base/out-04.html`).

---

## Round 1 → repair 1

**Failure (from `base/out-01.finalize.json`)**

```
code:    schema/maxLength
message: /nodes/4/sources/0/label (id/label: "queue built with the default controller rate limiter")
         must NOT have more than 48 characters
```

`failedStage: validate` — `deliver`, `check` and `browser-check` were all `not-run`.

**Repair made** (1 field): shortened the over-long `sources[].label` on node `queue`
from `"queue built with the default controller rate limiter"` (52 chars) to
`"queue uses the default controller rate limiter"` (46 chars). Nothing else touched.

**Why**: the diagnostic named the exact JSON path and the exact limit, and the only
`supportedFix` was `"provide at most 48 character(s)"`.

---

## Round 2 → repair 2

**Failure (from `base/out-02.finalize.json`)**

```
code:    composition/ambiguous-corridor
message: [composition/ambiguous-corridor] showcase workflow edges[7] "write" -> "api"
         shares a 80px corridor with edges[8] "sync" -> "retry" at [1100, 450] -> [1100, 530]
         (segments 1 and 1; minimum 8px) — adjust route/via, bias, or channel coordinates
         so unrelated edges do not visually merge.
```

`evidence` carried only: the two edges, `overlapLengthPx: 80`, `minimumPx: 8`,
the shared corridor endpoints `[1100,450] -> [1100,530]` and the two segment indices.

**Repair made** (1 field): added `"route": "return-left"` to the `write -> api` edge —
the reported edge — to move the write-back return out of the shared corridor, as the
message's "adjust route/via, bias, or channel coordinates" suggests.

**Why**: `write -> api` was the subject of the diagnostic, and `return-left` is the
schema's preset for a return edge that must travel back to the left.

---

## Round 3 → repair 3

**Failure (from `base/out-03.finalize.json`)**

```
code:    workflow/route-preset-conflict
message: Workflow edge "write->api" cannot satisfy route preset "return-left":
         candidate violates perpendicular endpoint-side direction.
```

`evidence` carried the attempted candidate points
`[[913.6,540],[20,540],[20,119],[248,119]]`, `fromSide: "left"`, `toSide: "right"`,
`requiredEndpointStubPx: 8`, `requiredInteriorSegmentPx: 16`, `requiredDirectClearancePx: 28`.
**`supportedFixes` was an empty array** — the base receipt offered no concrete next step here.

**Repair made** (2 fields):
1. Removed `"route": "return-left"` from `write -> api` (the compiler had just rejected
   that preset outright).
2. Added `"fromSide": "left"` to the `sync -> retry` edge, so the error edge no longer
   drops down the column-5 centre line `x = 1100` that it shared with the write-back edge
   in the round-2 corridor `[1100,450] -> [1100,530]`.

**Why**: the round-2 receipt told me the collision was a *vertical* segment on `x = 1100`
between `sync`'s and `write`'s bottoms. Pinning the error edge's departure to `sync`'s left
side removes it from that corridor while leaving the write-back edge on the automatic
router, which the compiler had already shown it could solve.

---

## Result

`base/04-repair-3.workflow.json` passed every gate:

```
gates: { validate: "pass", deliver: "pass", check: "pass", browser-check: "pass" }
diagnostics: []   browser-check ok: true
artifact: base/out-04.html  (830131 bytes)
```

All failed runs are kept (`out-01.*`, `out-02.*`, `out-03.*`) together with their
candidate JSON (`01-`, `02-`, `03-`).

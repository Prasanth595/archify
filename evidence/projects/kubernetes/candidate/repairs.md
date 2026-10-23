# Candidate side — repair log

CLI: `/tmp/archify-960/archify/bin/archify.mjs` (archify `dev` `b71d1b3e` + the #934 partialLayout change)
Command: `node <cli> finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root <src-repo-k8s>`

Starting point: `01-draft.workflow.json` — **byte-identical** to the base side's draft
(`sha256 4a79c5aaa31d522711d2929a5ffaa61d3741fd0fe3164784b69ce3107d02e463`).

| # | File | Result | finalize invocations |
|---|------|--------|----------------------|
| 0 | `01-draft.workflow.json` | fail | 1 |
| 1 | `02-repair-1.workflow.json` | fail | 2 |
| 2 | `03-repair-2.workflow.json` | fail | 3 |
| 3 | `04-repair-3.workflow.json` | **pass** | 4 |

**Totals: 3 repair rounds, 4 `finalize` invocations, delivered = yes** (`candidate/out-04.html`).

---

## Round 1 → repair 1

**Failure (from `candidate/out-01.finalize.json`)**

```
code:    schema/maxLength
message: /nodes/4/sources/0/label (id/label: "queue built with the default controller rate limiter")
         must NOT have more than 48 characters
```

**Repair made** (1 field): shortened the over-long `sources[].label` on node `queue` to
`"queue uses the default controller rate limiter"` (46 chars).

---

## Round 2 → repair 2

**Failure (from `candidate/out-02.finalize.json`)**

```
code:    composition/ambiguous-corridor
message: [composition/ambiguous-corridor] showcase workflow edges[7] "write" -> "api"
         shares a 80px corridor with edges[8] "sync" -> "retry" at [1100, 450] -> [1100, 530]
         (segments 1 and 1; minimum 8px) — adjust route/via, bias, or channel coordinates
         so unrelated edges do not visually merge.
```

**Repair made** (1 field): added `"route": "return-left"` to the `write -> api` edge.

---

## Round 3 → repair 3

**Failure (from `candidate/out-03.finalize.json`)**

```
code:    workflow/route-preset-conflict
message: Workflow edge "write->api" cannot satisfy route preset "return-left":
         candidate violates perpendicular endpoint-side direction.
```

`evidence` carried the attempted candidate points
`[[913.6,540],[20,540],[20,119],[248,119]]`, `fromSide: "left"`, `toSide: "right"`,
`requiredEndpointStubPx: 8`, `requiredInteriorSegmentPx: 16`, `requiredDirectClearancePx: 28`.
**`supportedFixes` was an empty array.**

**Repair made** (2 fields):
1. Removed `"route": "return-left"` from `write -> api` (the compiler had rejected that preset).
2. Added `"fromSide": "left"` to the `sync -> retry` edge so the error edge no longer drops
   down the column-5 centre line `x = 1100` shared with the write-back edge.

---

## Result

`candidate/04-repair-3.workflow.json` passed every gate:

```
gates: { validate: "pass", deliver: "pass", check: "pass", browser-check: "pass" }
diagnostics: []   browser-check ok: true
artifact: candidate/out-04.html
```

The final candidate JSON is byte-identical to the base side's final JSON
(`sha256 4262bb0cd14fd3e07b2f138b0c76714b0e2d93dc5c361461c547ce585f174e9f`).

All failed runs are kept (`out-01.*`, `out-02.*`, `out-03.*`) together with their
candidate JSON (`01-`, `02-`, `03-`).

---

## Note on `partialLayout` in this chain

**No `partialLayout` payload appeared in any of the four `finalize` receipts on the candidate
side.** `grep -c partialLayout candidate/out-0*.finalize.json` returns `0` for all four.

The reason is structural, not a property of this diagram: `partialLayout` is produced by the
workflow compiler and is surfaced **only** by `render-workflow.mjs` when `--layout-json` is
passed (`/tmp/archify-960/archify/renderers/workflow/render-workflow.mjs:37-38`). The CLI
receipt builder `/tmp/archify-960/archify/bin/archify.mjs` contains **zero** references to
`partialLayout`, so no `finalize` receipt can carry it on either side.

The payload *is* reachable with the candidate CLI through the inspection channel:

```
node /tmp/archify-960/archify/bin/archify.mjs validate workflow <input> --layout-json --repo-root <src-repo-k8s>
```

Captured evidence lives in `../layout-json/`. See `../comparison.md` for the field-level
comparison of the two CLIs on the same failing bytes.

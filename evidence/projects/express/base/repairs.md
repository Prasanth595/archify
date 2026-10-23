# Base side — authoring repairs (CLI `25cf3708`, `main`)

Shared task prompt: `../task-prompt.md`. Shared first draft: `01-draft.workflow.json`
(identical bytes to the candidate side's `01-draft.workflow.json`).
CLI: `/tmp/archify-base/archify/bin/archify.mjs finalize workflow <json> <html> --quality showcase --json --repo-root <src-express>`

## Round 0 — `01-draft.workflow.json` → FAILED

`finalize` exit=1, elapsed 0.466s. Two diagnostics, quoted verbatim:

1. `composition/ambiguous-corridor`

   > `[composition/ambiguous-corridor] showcase workflow edges[6] id "route-send" "route" -> "send" shares a 26px corridor with edges[7] id "mw-final" "mw" -> "final" at [737.6, 302] -> [737.6, 328] (segments 2 and 0; minimum 8px) — adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge.`

   evidence: `overlapLengthPx: 26`, `minimumPx: 8`, `segmentIndex: 2`, `otherSegmentIndex: 0`.
   supportedFixes: `adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge`

2. `layout/constraint`

   > `mainPath step "route" -> "send" moves backward from col 5 to 4 — use a return edge outside mainPath for loops.`

No `partialLayout` field, no column grid, no node frames, no rejected candidate points.
The only geometry in the feedback was the one shared corridor segment
(`[737.6, 302] -> [737.6, 328]`) belonging to two named edges.

## Round 1 — `02-repair-1.workflow.json` → PASSED

`finalize` exit=0, elapsed 2.250s. `gates: validate pass / deliver pass / check pass /
browser-check pass`, `diagnostics: []`.

Three targeted changes, each aimed at one named diagnostic:

1. **`layout/constraint` → move `send` from col 4 to col 5** (lane `objs` unchanged).
   The diagnostic says the mainPath step `route` -> `send` moves backward. `route` is
   fixed at col 5 (last column of the app lane), so the only forward fix is to place the
   response helper at col 5 and keep it on the main path.

2. **Move `final` from col 5 to col 4** (lane `err` unchanged).
   With `send` now at `objs`/col 5, leaving `final` at `err`/col 5 would stack the
   handler's two downward targets in the same column, so `route` -> `final` would descend
   straight through the `send` node. Splitting them over columns 5 and 4 keeps both
   reachable from the handler without one passing through the other.

3. **Re-pin edge `route-final`** from `fromSide: "bottom", toSide: "top"` to
   `fromSide: "right", toSide: "right", route: "outside-right"`.
   This is the edge the corridor diagnostic implicated together with `mw-final`; moving
   it into the outside-right corridor removes the shared vertical segment at
   x = 737.6.

Everything else (node set, lane set, labels, sources, cards, `mainPath`, phases, groups)
was left byte-identical, per the receipt's `nextAction.constraint`
("Preserve unaffected semantics and geometry").

## Totals

- repair rounds: **1**
- `finalize` invocations: **2**
- delivered: **yes** (`base/02-repair-1.html`)
- `cliExecSec` (sum of `elapsed=` in `commands.log`): **2.716s**

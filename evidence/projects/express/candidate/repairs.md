# Candidate side — authoring repairs (CLI `dev` + the #934 partialLayout change)

Shared task prompt: `../task-prompt.md`. Shared first draft: `01-draft.workflow.json`
(byte-identical to the base side's `01-draft.workflow.json`).
CLI: `/tmp/archify-960/archify/bin/archify.mjs finalize workflow <json> <html> --quality showcase --json --repo-root <src-express>`

## Round 0 — `01-draft.workflow.json` → FAILED

`finalize` exit=1, elapsed 0.473s. Two diagnostics, quoted verbatim:

1. `composition/ambiguous-corridor`

   > `[composition/ambiguous-corridor] showcase workflow edges[6] id "route-send" "route" -> "send" shares a 26px corridor with edges[7] id "mw-final" "mw" -> "final" at [737.6, 302] -> [737.6, 328] (segments 2 and 0; minimum 8px) — adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge.`

   evidence: `overlapLengthPx: 26`, `minimumPx: 8`, `segmentIndex: 2`, `otherSegmentIndex: 0`.
   supportedFixes: `adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge`

2. `layout/constraint`

   > `mainPath step "route" -> "send" moves backward from col 5 to 4 — use a return edge outside mainPath for loops.`

**The candidate receipt contained no `partialLayout` field.** Comparing the frozen replay
receipts (`replay-of-shared-draft-finalize.json` on each side) shows the two `finalize`
failure receipts are identical field-for-field after removing the artefact path, the
specification sha256, the update notice and the timing fields:

- `diagnostics` — byte-identical JSON on both sides.
- `gates` — identical: `validate fail / deliver not-run / check not-run / browser-check not-run`.
- No `partialLayout`, no column grid, no node frames, no candidate points on either side.

## Round 1 — `02-repair-1.workflow.json` → PASSED

`finalize` exit=0, elapsed 2.108s. `gates: validate pass / deliver pass / check pass /
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
was left semantically identical, per the receipt's `nextAction.constraint`
("Preserve unaffected semantics and geometry").

## Totals

- repair rounds: **1**
- `finalize` invocations: **2**
- delivered: **yes** (`candidate/02-repair-1.html`)
- `cliExecSec` (sum of the authoring-loop `elapsed=` values in `commands.log`): **2.581s**

## Disclosure about this chain

This chain was **not** run blind. The candidate's `finalize` diagnostics were
byte-identical to the base side's, and I had already analysed those identical
diagnostics while working out the base side's repair. The candidate-side repair was
therefore derived with that analysis already in hand. The resulting candidate JSON is
**semantically identical** to the base side's `02-repair-1.workflow.json` (verified by a
JSON-parse comparison; only JSON formatting whitespace differs), which is exactly what
one expects when the two sides received identical failure feedback. The wall-clock
authoring time therefore measures *my* order of work, not a difference in feedback
quality — see `../comparison.md`.

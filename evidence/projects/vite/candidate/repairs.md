# Candidate side — repair log

CLI: `/tmp/archify-960/archify/bin/archify.mjs` (tt-a1i/archify `dev` @ `b71d1b3e` +
`issue-934-partial-layout` @ `c64d4294`)
Side directory: `/tmp/archify-960/evidence/projects/vite/candidate/`
Command shape (every invocation):
`node /tmp/archify-960/archify/bin/archify.mjs finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root /tmp/archify-960/evidence/projects/vite/src-vite`

Starting point: `candidate/01-draft.workflow.json` — a byte-identical copy of
`base/01-draft.workflow.json` (sha256 `72d3e63f8b3a5f23005a6cca5457476e7e39cccdab3bdf1b11905e4a4ef7b2d7`,
9043 bytes). The candidate loop was run as its own repair chain from that same draft.

## Round 1 — `01-draft.workflow.json` → `02-repair-1.workflow.json`

**Invocation 1 (draft)**

- exit `1`, elapsed `0.469s`, failed stage `validate`, no HTML produced.
- Receipt: `candidate/out-01.finalize.json`, `candidate/out-01.finalize-summary.json`
  (both kept; `candidate/out-01.delivery-pending.json` is the CLI's own sidecar).

**Diagnostic received (verbatim from the receipt)**

```
code:      workflow/unexpected-root
severity:  error
message:   Workflow node "depsOptimizer" has no incoming edge and is not declared in semanticChecks.allowedRoots.
subject:   { diagramType: workflow, node: depsOptimizer, path: /semanticChecks/allowedRoots }
evidence:  { incomingEdges: 0, allowedRoots: ["browser", "buildEntry"] }
supportedFixes:
  - add the missing incoming edge to "depsOptimizer"
  - declare "depsOptimizer" in semanticChecks.allowedRoots if it is an intentional source
```

**Diagnostic difference vs the base side: none.** The candidate's failure text, code, severity,
subject, evidence and `supportedFixes` are character-for-character the same as the base's. This
failure is raised by the *semantic* check stage, which runs **before** the layout compiler, so
the #934 `partialLayout` payload has nothing to attach to: the receipt contains no `partialLayout`
key on either side.

**Repair made (one targeted edit, nothing else touched)**

`semanticChecks.allowedRoots` changed from `["browser","buildEntry"]` to
`["browser","buildEntry","depsOptimizer"]`.

Why that fix and not the other one: the second `supportedFix` is the truthful one for this
diagram. The dependency optimizer (`packages/vite/src/node/optimizer/index.ts`,
`discoverProjectDependencies` / `runOptimizeDeps`) is a **server-start activity** — it runs when
the dev server starts, not as a step of a module request — so it legitimately has no incoming
edge. Adding an incoming edge would have invented a call that the source does not contain.

The resulting file was verified byte-identical to the base side's repair
(`cmp base/02-repair-1.workflow.json candidate/02-repair-1.workflow.json` → identical), so both
sides carry the same candidate bytes and the replay in step 4 is a true same-bytes comparison.

**Invocation 2 (repair 1)** — `candidate/02-repair-1.workflow.json` → `candidate/out-02.html`

- exit `0`, elapsed `1.954s`.
- Gates: `validate: pass`, `deliver: pass`, `check: pass`, `browser-check: pass`.
- `validation`: `checksPassed 9 / checkCount 9`, `compositionStatus pass`, `errors 0`, `warnings 0`.
- `diagnostics: []`.
- HTML produced: `candidate/out-02.html`, 833882 bytes, sha256
  `e7171545ff7ce87e6759adda753bfa044df4ec15913f565d15c0c9ece28f5f34`.

**Loop outcome: PASSED after 1 repair round / 2 finalize invocations.** No further repairs.

## Non-authoring invocations in `candidate/commands.log`

- `replay-of-candidate-final` — the frozen final candidate JSON replayed against the **candidate**
  CLI (exit `0`, elapsed `1.635s`); receipt saved as `candidate/replay-of-candidate-final.json`.
- `visual-check` was run outside the harness (it is not a `finalize` call) and its captures are
  under `screenshots/candidate/`.

**Re-measurement after the candidate CLI tree changed (2026-10-24 00:30:22, changed by another
party, not by this worker).** The candidate tree gained uncommitted `#934` edits that forward
`partialLayout` into the CLI's `deliver`/`validate` receipts. The authoring loop was re-run
against that tree and gave the same result:

- `finalize 01-draft (CLI tree @00:30)` → exit `1`, elapsed `0.285s`, **same**
  `workflow/unexpected-root` diagnostic, identical message (receipt `candidate/out-03.finalize.json`).
- `replay2-of-candidate-final` → exit `0`, elapsed `1.809s`, pass, 0 diagnostics
  (receipt `candidate/replay2-of-candidate-final.json`).
- `probe-layout-failure-final` → exit `1`, elapsed `0.365s`, same
  `workflow/explicit-pin-conflict` (receipt `candidate/probe-layout-failure-final.json`).
  The `finalize` receipt still carries **no** `partialLayout` key; `deliver --json` now does.

`candidate/commands.log` elapsed sum (all 6 invocations) = `6.517s`.
Authoring-loop-only sum (`finalize 01` + `finalize 02`) = `2.423s`.


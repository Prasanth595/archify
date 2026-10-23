# Base side — repair log

CLI: `/tmp/archify-base/archify/bin/archify.mjs` (tt-a1i/archify `main` @ `25cf3708`)
Side directory: `/tmp/archify-960/evidence/projects/vite/base/`
Command shape (every invocation):
`node /tmp/archify-base/archify/bin/archify.mjs finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root /tmp/archify-960/evidence/projects/vite/src-vite`

Starting point: `base/01-draft.workflow.json` — byte-identical to `candidate/01-draft.workflow.json`
(sha256 `72d3e63f8b3a5f23005a6cca5457476e7e39cccdab3bdf1b11905e4a4ef7b2d7`, 9043 bytes).

## Round 1 — `01-draft.workflow.json` → `02-repair-1.workflow.json`

**Invocation 1 (draft)**

- exit `1`, elapsed `0.333s`, failed stage `validate`, no HTML produced.
- Receipt: `base/out-01.finalize.json`, `base/out-01.finalize-summary.json`
  (both kept; `base/out-01.delivery-pending.json` is the CLI's own sidecar).

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

**Repair made (one targeted edit, nothing else touched)**

`semanticChecks.allowedRoots` changed from `["browser","buildEntry"]` to
`["browser","buildEntry","depsOptimizer"]`.

Why that fix and not the other one: the second `supportedFix` is the truthful one for this
diagram. The dependency optimizer (`packages/vite/src/node/optimizer/index.ts`,
`discoverProjectDependencies` / `runOptimizeDeps`) is a **server-start activity** — it runs when
the dev server starts, not as a step of a module request — so it legitimately has no incoming
edge. Adding an incoming edge would have invented a call that the source does not contain.
`semanticChecks.allowedRoots` is the complete allow-list for zero-incoming nodes, so declaring
`depsOptimizer` there states that fact without changing any topology, geometry, label or source
reference.

**Invocation 2 (repair 1)** — `base/02-repair-1.workflow.json` → `base/out-02.html`

- exit `0`, elapsed `2.029s`.
- Gates: `validate: pass`, `deliver: pass`, `check: pass`, `browser-check: pass`.
- `validation`: `checksPassed 9 / checkCount 9`, `compositionStatus pass`, `errors 0`, `warnings 0`.
- `diagnostics: []`.
- HTML produced: `base/out-02.html`, 831086 bytes, sha256
  `1e9dcb18e58f1888649f4d1a8f9c05da9d38e49a482d80d5e2d0e721df5b9616`.

**Loop outcome: PASSED after 1 repair round / 2 finalize invocations.** No further repairs.

## Non-authoring invocations in `base/commands.log`

- `replay-of-candidate-final` — the frozen final candidate JSON replayed against the **base** CLI
  (exit `0`, elapsed `1.864s`); receipt saved as `base/replay-of-candidate-final.json`.
- `visual-check` was run outside the harness (it is not a `finalize` call) and its captures are
  under `screenshots/base/`.

`base/commands.log` elapsed sum (all three invocations) = `4.226s`.
Authoring-loop-only sum (`finalize 01` + `finalize 02`) = `2.362s`.

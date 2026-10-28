# Batch29 CUE repaired build/content review

2026-10-28. **Scoped pass: repair preserves semantic comparison and correctly checks actual bytes before creating fresh output.** No concrete code/content blocker found. This audit read source and decoded existing generated HTML; it did not invoke builder/finalize/CUE/browser/tests. Root separately owns tamper rejection and fresh-replay execution. Sole authored output is this report.

## Builder preflight

`build.mjs` now accepts exactly one output-directory argument, resolves it and rejects an existing path. It hashes raw bytes with SHA-256, checks actual fixture hash **and byte length** against the observed packet, and checks all three actual native output files against their per-mode recorded hashes. It retains the fixed expected authored-input hash and complete-capture flags. These checks happen before `mkdirSync(outputDir)` and before writing drafts or launching finalize. The display-only trimEnd occurs afterwards and does not affect what gets hashed.

Independently reading current files confirms fixture365B/hash matches observation and all def/eval/export output hashes match. No reliance on complete-capture booleans alone is needed for this snapshot. Missing/changed input/output throws before output creation; that is source-established ordering, not an executed negative test here. No need for new abstract state, parser, background watcher or speculative race handling in this scoped local builder.

The new output root contains drafts/artifacts and per-arm stdout/stderr/status; original drafts/artifacts remain intact. A failed finalize records its real nonzero result and causes overall failure. Fresh-output path's parent must exist; README's planned mktemp-parent/new-child example supplies it. The builder neither re-evaluates CUE nor independently attests native runtime identity, and makes no such claim.

## Final artifacts and exact comparison

Read actual prepared documents from:

- `final/artifacts/baseline.html`: **164,927B**, SHA-256 `5452e3c64a430a1f0c2643f73483b345b6205c5c0e714b127b660c1a486e0f27`.
- `final/artifacts/comparison.html`: **164,922B**, SHA-256 `545503023c4cd14af6fea2ba0865bd7d703a4fec6382c410712cd64f31854ebc`.

Final arms have identical meta/answer/sources and identical panel objects by ID. Panel order alone differs, preserving evidence-first versus questions-first framing. Compared initial to final documents per arm: meta, answer, sources, source fixture snippet, all three output snippets, official context and explanatory panels are unchanged. The only content delta is this added sentence in the output panel: “Displayed code omits the final newline; the raw files are authoritative.” Its content-generated prose ID changes accordingly. No substantive diagnostic/source line, value/domain/default explanation or citation changed.

Thus the prior newline-fidelity recommendation is resolved in both final pages and README. Raw authoritative files retain their identity while display omits their final LF. The core explanation remains correct: conflicting preference/default component does not empty the allowed string domain; reference and reversed operands remain unresolved; explicit audit is compatible; interpolation resolves concretely in this fixture and is not a universal override. No new empirical interpolation-negative-control or human-benefit claim was introduced.

## Documentation finalization boundary

Current README already replaces the old missing-native-packet statement with recorded native evidence/source-context status and identifies original versus repaired directories. Its sample command still names the already-existing `final` directory, so it would correctly be refused if copied at this snapshot. Root has explicitly taken the bounded change to an mktemp parent plus new child output and a manual-validation summary; no additional script change is required. This report does not claim that pending prose edit or root-owned tamper/replay/browser checks have already happened.

Scope remains authored content and local evidence builder. No product runtime/schema/renderer change, installation, PR, integration, binary identity or learner outcome is established by this pass.

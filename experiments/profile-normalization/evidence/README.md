# Portable evidence packaging · profile-normalization

This directory packages existing review/CLI/browser records. Packaging ran no renderer, test, browser, profiler or upstream implementation. It did not change the generator, outputs, tests or fixtures.

The final candidate is `035db27d3cac4cda94258f839116cc7e72db39cafa5ddb734184118e8e4c0a94`, 1,776,392 bytes. [Packaging byte guard](packaging-artifact-binding.json) records the protected files.

| Responsibility | Evidence | Boundary |
| --- | --- | --- |
| Independent oracle | [DERIVATION.md](independent/DERIVATION.md), [derive.py](independent/derive.py), [derivation.json](independent/derivation.json) | Created from complete upstream bytes before checking the author candidate; no author implementation imported. |
| Independent final review | [REVIEW.md](independent/REVIEW.md), [final-frozen-review.json](independent/final-frozen-review.json), [final-evidence-binding.json](independent/final-evidence-binding.json) | No static arithmetic/data/target blocker. Human acceptance and root Ego are separate. |
| Final static CLI | [tests](cli/tests.stdout), [finalize](cli/finalize.stdout), [strict check](cli/check.stdout) | 5/5 tests, three static gates pass, strict provenance check ok; eight writing warnings retained. This finalize did not request browser-check. |
| Final public browser gate | [all164 diagnostic summary](public-browser/final035-browser-summary.json), [finalize failed-stage summary](public-browser/final035-finalize-summary.json) | Final035 remains FAIL164 keyboard traversal. The final035 selected summary omits large successful DOM observations, never its164 failure diagnostics; the original receipt remains external with its exact fingerprint. |
| Old658 actual keyboard | [trajectory](keyboard/keyboard-traversal.json), [summary](keyboard/keyboard-summary.json), [script](keyboard/continued-tab.mjs) | Four states:241/282 at285 steps,282/282 at334. No programmatic focus. Bound to old658, not a new final035 run. |
| Legend reuse | [three metadata changes](independent/legend-spec-delta.json), [final-delta.json](independent/final-delta.json) |195 DOM IDs and354 static attributes/order unchanged; ledger and baseline bytes unchanged. Static354 is not the dynamic282 target count. |
| Earlier failures | [Dataflow314](history/dataflow-browser-summary.json), [pre-legend658164](history/pre-legend658-browser-summary.json), [historical identities](history/dataflow-artifact-identities.json) | Failure counts, representative diagnostics and original fingerprints retained; complete historical receipts and large historical HTML remain external. |
| Root Ego/PNG | [root acceptance scope](browser/final3-acceptance-summary.json), [12 image bindings](browser/image-bindings.json), [scenario records and snapshots](browser/) | Final035 hover/pointer chain, exact Viewer/Escape and denominator3-node chains observed;390px base toolbar remains clipped. No human/speed/full-keyboard-path claim. |

[Source-copy index](source-copy-index.json) lists each original fingerprint and public fingerprint, whether byte-identical, exact redaction/selection classification, and source-run labels. The original absolute-path source ledger remains outside checkout; placeholders describe local run locations without publishing personal paths. Public redacted scripts require path configuration before replay. Public redacted receipts cannot stand in for executable raw provenance, even when an original `provenance` field is retained inside the logged snapshot.

[Packaging index](packaging-index.json) inventories the current static review/CLI package and root-provided final035 browser files without rebinding historical review/CLI hashes. This index excludes itself to avoid a self-hash cycle.

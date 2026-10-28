# Validation and disposition · 2026-10-28

**Experimental content candidate for independent review.** The concrete reader question is how a displayed default differs from the remaining valid-value domain and concrete exportability. An original four-case fixture and the complete native results make the distinction inspectable. No analyzer, schema, shared runtime, package archive, or product test changed. Two layouts alone do not establish improved comprehension, speed, or a general authoring rule.

## Fixed scope and provenance

- Experiment base: `d5d979493bba650b3995836afd379cd249f2d0dd`. Pre-push `dev` moved to `6ca6a5c84439b57ea22e0630fe306e1d91587a6e`; [source audit](base-drift.md) found no Explainer, Viewer, or authoring-input change in that range. No claim of rerunning on the newer head.
- Runtime: checked-in Archify at that base; Node **22.23.3**. Official CUE Playground UI label **v0.17.0** and site-reported commit are separately recorded. No local CUE CLI, installed dependency, native binary identity, or historical 2022 CLI reproduction.
- Natural motivation: [issue 1449](https://github.com/cue-lang/cue/issues/1449), maintainer explanation and the reporter's request for examples. Its original complete input was observed separately in the current Playground. Its raw code/screenshots remain outside the public packet; the 365-byte teaching fixture here is distinct. Open [issue 3751](https://github.com/cue-lang/cue/issues/3751) keeps future defaults semantics uncertain.
- Independent [semantic](semantic-review.md), [Playground source](playground-source-review.md), [native packet](native-packet-review.md), [initial](initial-content-review.md), and [final content](final-content-review.md) reviews state their own scopes. Source review is not a second browser or runtime execution.

## Executed checks

| Check | Recorded outcome | Limit |
| --- | --- | --- |
| Native input/output identity | All three captured input editor texts equal the complete 365-byte fixture; each complete output matches its text file and recorded SHA-256. Four native PNGs inspected. | UI/DOM observation, not CLI or WASM-byte attestation. |
| Initial two finalizations | Both exit 0; validate, deliver, check pass. Each retains one 29-versus-28-unit sentence warning. | Automated browser-check not run. |
| One repaired pair | Both exit 0 with the same static gates and warning. First builder, drafts, HTML and receipts retained. | Repair adds raw-byte preflight, fresh-directory protection, licensing/current-state docs and final-LF disclosure; no semantic change. |
| Rejected inputs | Worker changed an input in a temporary copy: exit 1, no output directory. Existing-directory probe exit 1. Root separately changed `eval.txt`: exit 1 with the expected hash error, no output created. | Protects this recorded packet; no general security claim. |
| Fresh external-directory replay | Exit 0. Both HTML hashes differ; structural comparison finds exactly five metadata leaves per arm differ. All other JSON values and HTML outside JSON are equal. | Equivalent authored content/reader markup, **not byte-identical HTML**. See below. |
| Actual final-page DOM | Both pages' four code blocks equal the fixture and def/eval/export texts with only the final LF omitted. | Clipboard write/export not exercised. |
| Actual desktop reading | Both light-theme full pages inspected at 1440 CSS pixels; candidate top also inspected in dark theme. Page scroll widths are 1440. | Visual judgment for these pages, not a human reading study. |
| Actual keyboard source path | Focus Answer citation, Enter to `#source-spec`, then Tab reaches the correctly named official specification link; visible focus captured. | Programmatic starting focus; not an exhaustive keyboard or screen-reader audit. |
| Actual narrow layout | Both pages at 390 × 844 have page scroll width 401; Export reaches x=401.05. Candidate table fits its 332-pixel container, but long identifier text wraps. | Mobile acceptance is **not cleared**. |

The native packet is explained in [native/README](../native/README.md). Final browser script, log and structured observations are retained alongside real screenshots. The first mobile-emulation probe requested width 390 but reported layout width 401; the final narrow test used a fixed 390-pixel CSS viewport and recorded client/scroll widths separately. It is Chromium narrow-layout evidence, not a physical-phone test.

## Reproduction limits and retained failures

The first exact-HTML replay assertion failed. A later overly narrow expectation that only diagnostic paths changed also failed: the complete differences are prepared `baseDir`, `sourcePath`, diagnostic input, its integrity digest, and manifest diagnostic input. [Hashes and executed outcomes](build-verification.json), [exact metadata differences](replay-byte-differences.json), and the independent [source interpretation](replay-identity-review.md) preserve this result. Source/content revisions remain equal. An expensive full-string difflib analysis was interrupted and supplies no result. Relocated editing/patch-origin resolution was not verified; the differences were not normalized away and no runtime repair was added.

The initial builder trusted a declared input hash without hashing the real files. The one repair now hashes input and all three native outputs before creating a fresh output directory. Initial output is preserved rather than relabelled. The initial CLI and final CLI receipts still say browser-check `not-run`; the separate Ego observations do not replace that status.

Repository whitespace checking reports one trailing empty line in each of four original browser logs. These raw logs are retained byte-for-byte; the scoped check of non-log files is clean. No log trimming is presented as an original execution result.

## Costs and remaining limits

The candidate places the explanations and comparison before the complete input; the baseline lets a reader inspect the full input earlier. Both include the same answer, panels and sources, so this compares order rather than explanation versus no explanation. The candidate is taller in this viewport (2576 versus 2453 pixels). Those observations are tradeoffs, not evidence that one is faster or universally better.

The narrow toolbar overflow is the existing shared-template concern already tracked by [PR 1076](https://github.com/tt-a1i/archify/pull/1076); no contributor branch was edited or incorporated here. Numeric Explainer citations remain numeric. The existing `codex/lab-source-link-context` fix concerns Native Passport names and does **not** cover these anchors; the successful navigation above does not establish full accessibility acceptance or a new defect. Neither issue is silently patched into this content branch.

Maintenance is one frozen fixture, three recorded native views and a small existing-API builder. Any later CUE/runtime refresh requires a new observation and semantic review. Promotion into product guidance should wait for an independent reader comparison and appropriate narrow-screen acceptance. No PR, integration, release, deployment or installation was performed for this experiment.

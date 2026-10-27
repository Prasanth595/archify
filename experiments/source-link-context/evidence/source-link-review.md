# Independent source-link context review

Disposition: scoped code and regression are sound; no implementation blocker found. This is suitable to retain on the authorized experiment branch after the final evidence accurately reports generated-output freshness. It is not integration/release acceptance. The currently saved `test:generated` run failed with 31 stale-output checks, so it must not be reported as passed.

Reviewed read-only in `/Users/tsk/.codex/worktrees/lab-source-link-context/archify` against product base `d5d979493bba650b3995836afd379cd249f2d0dd`: changes to `viewer/focus.js`, generated `archify/assets/template.html`, and `test/repository-evidence-browser.test.mjs`. Followed the previously read REVIEWING.md/CONTRIBUTING.md and archify-review Skill, and read test-value in its scoped pre-commit review mode. No tests, renderer, installation or remote action were run. Root owns experiment artifacts and visual comparisons; this reviewer only writes this /tmp report.

## User-visible correctness

At `viewer/focus.js:345-390`, `renderSourceEvidence` creates the shared Semantic Passport source rows. Previously every link's aria-label used only the localized action, path and short revision, so different authored labels/ranges in one file collapsed to the same accessible name. The candidate at lines 365-380 derives the already-visible source name and range once and composes those with the existing translated action phrase for links. This preserves label-in-name context, location, full path and pinned revision. The same values still populate strong/code text, preventing divergence between visual and accessible context.

The patch preserves the source href, `_blank`, rel and referrer policy; it changes no geometry, styling, payload, verification policy or parser. For local-only rows it still creates DIVs with the same visible text and no new aria-label or outbound link. File-only rows retain the filename fallback and omit an empty range. English and zh-CN retain their existing localized Open/打开 phrase. Other locale action phrases remain unchanged; authored labels, file paths and existing L-range notation are correctly reused rather than translated by the patch.

`renderPassport` calls this function at line 471. It is shared by source-backed diagram modes through the common Viewer, not architecture-only. The candidate template diff is exactly the same small focus.js edit at generated lines 9011-9026; no unrelated template code changed. The implementation introduces two local values instead of a new helper/API or state. No worthwhile further simplification is needed.

## Test value and actual evidence

The new test at `test/repository-evidence-browser.test.mjs:8-71` exercises the ordinary public deliver path with a real temporary Git repository. It focuses the source-backed node in the real Chrome page, then asks `Accessibility.getPartialAXTree` for each actual source-row object. It checks computed AX names, not merely the aria-label attribute. The same-file two-row case differentiates Entry point L1 from Route body L2–3; a third file-only source protects filename fallback and no-range behavior. The names must also retain full paths, short revision and the appropriate action language. Assertions allow equivalent punctuation/composition refactors rather than freezing the entire name.

The en/zh-CN by linked/local-only matrix is bounded and relevant. Linked href assertions independently protect pinned URL and range construction. Local-only assertions protect DIV/no-href behavior and preserved authored text. The local-only cases deliberately do not assert a link AX name because they are not links. Existing tests in the same file already protect local-only/web providers, searchable paths, live source counts and canonical SVG export-label restoration. `test/repository-evidence-types-browser.test.mjs` exercises the common Passport source path across diagram families; its shared UI evidence is relevant to this small name-composition change.

Reused supplied evidence, not rerun:

- `/tmp/archify-round23-source-fix/baseline-stdout.txt`: one selected test executed and failed because the two computed names were identical (`Open verified source src/router.js at revision ...`). This independently demonstrates that the new test rejects the actual prior behavior.
- `focused-stdout.txt`: all three repository-evidence browser tests passed, zero failures/skips.
- `related-stdout.txt`: seven tests from repository-evidence-types-browser and semantic-passport passed, zero failures/skips.
- `generate-stdout.txt`: viewer generation completed and wrote the template.
- `generated-stdout.txt` / `generated-stderr.txt`: generated suite did not fully pass. The viewer source/template check proceeds successfully, but stale rendered example and packaged example checks, including web-app script blocks, lead to `31 check(s) failed`.

This regression adds justified AX protection that prior source-row text/href tests did not provide. It uses existing fixture/browser utilities and costs roughly one additional browser test (the recorded whole file is about 10 seconds). There is no reason to add a broad locale or platform matrix for this local composition change.

## Scope and remaining limits

The generated-output failure is a concrete integration-preparation gap, not evidence that the accessible-name fix is incorrect. Before claiming integration readiness, regenerate affected canonical outputs/package according to repository policy or explicitly document their intentional deferral for this branch-only experiment. Do not silently turn the saved failed run into a pass. No additional renderer or export implementation work is indicated by this review.

The source rows are HTML Passport chrome outside the canonical SVG. Existing export tests in the passed browser file check that canonical node labels and live state survive SVG export; this change does not modify export code or SVG labels. Other output formats and a full browser/compatibility suite were not established by these focused logs. Chrome AX inspection is not a VoiceOver or other assistive-technology usability session, and the test activates focus programmatically; it does not prove independent keyboard traversal or link activation. The implementation does not change those paths, so these are reporting limits rather than new acceptance blockers.

Root's saved final visual/AX comparisons and source/hash binding still need to be incorporated into the final branch report. No PR, merge, release or live installation is authorized or established by this review.

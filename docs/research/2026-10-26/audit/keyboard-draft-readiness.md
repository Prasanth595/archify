# Keyboard traversal candidate: Draft readiness review

**Ready for a scoped Draft PR on the existing `codex/lab-keyboard-traversal` branch. Not ready for integration as-is: the branch predates current dev and its ZIP must be rebuilt after a normal current-base refresh. No new implementation branch or duplicate fix is warranted.** This is a browser-QA correctness fix with observed reachable controls, not a reader-performance proposal.

Review on 2026-10-27 was read-only except this report. No branch update, push, PR, install, upstream program execution or new browser run occurred. The maintainer's ongoing research authorization supplies scope agreement; link that recorded decision and this evidence in the Draft. Do not check a human-review confirmation on the maintainer's behalf.

## Revisions and duplicate check

- Candidate: `c96e8aa74ff5e309cdab07a1b70d0242f33bed75`.
- Current target examined: `origin/dev@e837dc4cb83042d2b6c596e039692e25ec62c2da`; its live GitHub identity was recorded in [compatibility.json](keyboard-current-artifacts/compatibility.json). This review re-read those local Git objects, rather than claiming a new live-SHA lookup.
- Merge base: `10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0`.
- Live connected-GitHub searches covered all-state PR `keyboard` (53 results), `traversal`, `keyboardTraversal` (none), and `head:codex/lab-keyboard-traversal` (none), plus issue `keyboard`, `traversal`, `keyboard-traversal`, `native scrolling` and `SourceCard`. No returned work owns this exact initial-control-count traversal cutoff fix. Search is an observed snapshot, not proof about unindexed work.
- [#898](https://github.com/tt-a1i/archify/issues/898)/[#899](https://github.com/tt-a1i/archify/pull/899) concern Native toolbar directional navigation; [#1068](https://github.com/tt-a1i/archify/issues/1068) concerns phased Explainer reading/UI work, including keyboard regression expectations; [#1076](https://github.com/tt-a1i/archify/pull/1076) concerns narrow toolbar/menu containment. They do not implement this QA traversal algorithm. [#1108](https://github.com/tt-a1i/archify/pull/1108) indexes graph traversal, not keyboard focus.
- [#1121](https://github.com/tt-a1i/archify/pull/1121), [#1122](https://github.com/tt-a1i/archify/pull/1122), [#1123](https://github.com/tt-a1i/archify/pull/1123) already link the existing candidate's bounded validation; these are affected content experiments, not competing checker fixes.

## Current-base compatibility

The current dev checker still uses `for (... < controlCount+3)` at `archify/explainer/browser-check.mjs:74`. That file, `test/explainer-browser.test.mjs`, browser orchestrator `archify/bin/visual-check.mjs`, `archify/explainer/check.mjs`, and both manifests/lockfiles are byte-identical between merge base and current dev. The patch therefore remains meaningful; the two authored product/test changes have no intervening target-file edits.

Candidate since merge base: **21 files**, consisting of checker, direct regression tests, ZIP, and 18 experiment/evidence files. Current dev since merge base: **13 files**, including crossing-budget code/tests and baseline research evidence. The two changed-path sets intersect only at `archify.zip`. Read-only three-tree `git merge-tree <base> <dev> <candidate>` reports `changed in both` for the ZIP and warns it cannot merge that binary; the checker/tests require no source conflict resolution. This is not an executed merge or a final mergeability guarantee.

Direct tip-to-tip comparison also differs in `archify/bin/archify.mjs` and `archify/scripts/check-render-output.mjs`, because current dev added crossing-budget behavior. A normal merge retains those current-dev changes; replacing dev with the old candidate tree or taking its whole ZIP would lose them. Preserve new dev code and rebuild the canonical ZIP from combined source. The previous ZIP reproducibility/inventory result belongs to dev10b4 and is not current-dev packaging acceptance.

## Algorithm, test value and cost

Source references below refer to candidate SHA, not the research hub checkout:

| Source | Contract assessed |
| --- | --- |
| `archify/explainer/browser-check.mjs:56–58,67–86` | Initial visible/enabled controls receive unique QA keys; the candidate freezes actual element identity. Later hidden/removed targets stay required, and clones cannot impersonate their predecessors. |
| Same file `:95–110,148` | One remote state object, initial DOM-size budget `count + min(elements,1024) + 3`, finally release. No Reader-global state. |
| Same file `:113–147` | Real CDP Tab/radio ArrowRight actions; new target progress resets cycle detection. Success requires all initial targets reached. Exhausted work fails with reachability unconfirmed. |
| Same file `:127–137` | Repeated native button/link/summary without progress can end traversal; date/input, frame/shadow/container hosts remain under the finite bound because their activeElement can repeat while internal focus advances. |
| `test/explainer-browser.test.mjs:227–267` | Native scrollers, actual rendered SourceCard, reused popover, frame/closed-shadow host and date-subfield positive cases protect observed or previously exposed false failures. |
| Same file `:269–309` | Negative tabindex, real Tab trap, hiding/cloning, endless new stops and native radio preserve failures, bounded work, diagnostic measurements and radio reachability. |

The tests assert outcomes and failure boundaries rather than source strings or automatic coordinates. Their real browser dependency is explicit (`:10–11`); an ordinary skipped Node run is insufficient. The existing frozen-page comparisons provide integration evidence separate from these constructed fixtures.

False-pass defenses are substantive: the budget is not a pass condition; missing targets remain failure; DOM identity defeats cloned QA keys; the negative cases cover traps and mutating target sets. There is no source evidence that the fix simply suppresses keyboard diagnostics. Successful traversal is still only initial-target reachability: it does not prove activation semantics, meaningful order, assistive-technology support, internal frame/shadow control coverage or later dynamic-control completeness. The frame/shadow positive test deliberately expects only two outer targets. These are scope limits, not grounds to invent a new accessibility model.

The cycle heuristic is conservative, not a mathematical proof of unreachability for arbitrary stateful scripts; repeating a leaf may later make progress in a page with extra hidden state. Such a result remains a failure, not a false pass. No supported current artifact demonstrates a remaining defect in this heuristic, so expanding it is not a Draft prerequisite.

Cost: one initial element/target enumeration and per-action CDP calls, with at most `count + 1024 + 3` actions. Memory tracks initial targets and visited focus identities; radio observations additionally scan targets and missing-result construction uses array membership checks. This is bounded browser QA work, not a new Reader runtime dependency or rendering cost. The three new artifact runs finish after 47/33/36 actions against ceilings 394/442/467, so they do not consume the larger ceiling. No timing improvement or universal wall-clock bound is established.

## Evidence that can be reused

- Candidate's [dev10b4 refresh README](https://github.com/tt-a1i/archify/blob/c96e8aa74ff5e309cdab07a1b70d0242f33bed75/experiments/keyboard-traversal/refresh-dev-10b4/README.md) records the complete affected browser file **19 passed, zero skipped**, core smoke 19/19, original failure discrimination, package inventory and extracted-module positive/trap checks. This review read source/records; it did not rerun them.
- [Current-artifact report](keyboard-current-artifacts.md) records the exact Task/Trace/OCI HTML on old candidate: four width/theme arms each, 40/40, 27/27, 29/29, zero diagnostics, unchanged HTML bytes. Historical baseline 16/12/16 failures remain intact.
- This is direct `runBrowserCheck` API evidence. Current `visual-check.mjs:2792–2793` forwards to shared browser evidence, and `:2602` selects `inspectExplainerBrowser`. Current CLI `archify.mjs:5711–5740` additionally loads path identity, inspects delivery provenance and passes it onward. The API run did not execute that wrapper, finalization or current strict `check-render-output` path. Claims of current CLI/strict-check/package integration would overstate the result.

## Smallest remaining verification

Nothing material must be rerun merely to open an explicitly unresolved Draft with the evidence above. Keep its title/body limited to the checker bug; state that branch/base and ZIP need refresh. Before requesting integration review, use the **same existing branch**, combine current dev normally, rebuild the ZIP, and record the final SHA. Then:

1. Run the complete affected Explainer browser test file under real Chrome with the maintained runner or explicit browser opt-in; check executed/skip counts. Run core smoke for the refreshed CLI/package tree. No default full-suite requirement arises from this scoped fix.
2. Exercise the refreshed public CLI `browser-check` on one existing exact real HTML with its authentic provenance, using a fresh external output directory; compare input hashes. Existing API results for all three pages remain valid bounded evidence because browser callers/renderer and inputs are unchanged. If the wrapper or checker changes during refresh, repeat the affected comparisons instead of assuming validity. Do not invent provenance for copied HTML or rewrite historical receipts.
3. Rebuild the canonical ZIP from combined source; verify inventory retains current-dev crossing-budget files/changes and checker entry equals source. A packed native-scroller positive and true-trap negative settle the changed package behavior. Reuse the project's canonical reproducibility check when recording package acceptance; do not substitute the old ZIP.
4. Inspect relevant final-head CI selected by project ownership. Preserve unrelated red jobs as unresolved CI rather than changing product scope to remove them.

No human reader study, AT study, Windows matrix, generation benchmark or full repository suite is needed solely to support this Draft. Required branch protections and final CI remain integration conditions. The concrete integration blocker is the stale combined tree/package, not lack of evidence that the keyboard cutoff is a worthwhile bug to fix.

## Follow-up · 2026-10-27 · refreshed head e3764912

**Ready for Draft on refreshed head `e37649120430b82e3495a0e847f76b646f1eef64`. The stale-tree/ZIP blocker above is resolved.** This follow-up supersedes the earlier “as-is” integration-gap assessment; hosted final-head CI and review remain outstanding. Verification was read-only in `/Users/tsk/.codex/worktrees/keyboard-evidence-validation/archify`; no test rerun, branch mutation, push, PR or installation was performed by this reviewer.

- `git merge-base --is-ancestor` independently confirms both original candidate `c96e8aa7` and dev `e837dc4c` are ancestors of refreshed HEAD. Merge `49413625` contains combined source; the final evidence commit changes only `experiments/keyboard-traversal/refresh-dev-e837/README.md`. The checkout is clean.
- Checker and direct browser test bytes equal the original candidate. Current-dev `archify/bin/archify.mjs`, `archify/scripts/check-render-output.mjs`, crossing-budget fixture, SVG checker tests and CLI tests equal dev bytes. Historical keyboard experiment paths have no changes; only the new refresh README was added.
- Independently inspected the committed ZIP: SHA-256 `307dde31eae4c66f518dcd022dcc7843bc17b0afd0b0f469bd594963cc1cd0ea`, CRC clean, all 235 names equal dev inventory. Its only changed entry versus dev is `archify/explainer/browser-check.mjs`. That entry and both current-dev CLI/checker entries match refreshed source bytes. Both external independent build ZIPs have the same SHA-256.
- Read actual `/tmp/keyboard-refresh-e837/browser.log` and `smoke.log`: affected browser file **19 pass / 0 fail / 0 skip** (including the ten traversal subcases); core smoke **19 pass / 0 fail / 0 skip**. These are existing executed results on the refreshed source, not new reviewer executions.
- CLI stdout JSON equals the persisted `cli-output/review.browser-check.json`. It records `command=browser-check`, `status=pass`, `provenance=current`, delivery receipt `c81d0864-2647-4db0-9dc8-38aac0ed5c80`, zero diagnostics, `visualReview=not-requested`. All four 1280/1440 × light/dark arms reach **27/27**, **33/442** actions, `termination=complete`. The original trace HTML currently still hashes to `4cc2274999e58b9f75b717c053528a85964e3545b3cb0a8fe638b8cdf246dff1`. This closes the public CLI/provenance path gap for that exact artifact; it does not claim fresh delivery or rewrite old failed receipts.
- Read extracted-package runner and raw `packed.log`: imports target extracted ZIP modules; native scrollers reach **2/2**, 6/15 actions, and the true trap fails **1/2**, 2/12 actions, `focus-cycle`, Last missing. No negative assertion was relaxed.

The new [refresh README](https://github.com/tt-a1i/archify/blob/e37649120430b82e3495a0e847f76b646f1eef64/experiments/keyboard-traversal/refresh-dev-e837/README.md) records this scope and machine-local raw-log location. Raw logs are inspectable locally, not portable committed receipts; the Draft should preserve that distinction. The original Trace screenshot retains its original identity and is not presented as a new image or a visual-change comparison. Success establishes initial-target reachability, CLI receipt/provenance handling and the sampled packaged behavior, not all dynamic controls, AT, human acceptance or reader speed. No correctness/evidence blocker to opening the scoped Draft remains.

Root follow-up: final remote head `9601c9b6e4b6addc2f348677d1c198bc6bc74192` adds only README reproduction details, selected-field `evidence.json` with raw-file hashes, and the exact packed reproduction script. Root verified no product/test/ZIP diff from reviewed `e3764912`; historical files remain untouched. The selected summary discloses the initial unmatched-glob probe, missing standalone ZIP comparison log, and absent pre-run receipt hash. These are not retroactively invented as raw receipts. Existing remote `codex/lab-keyboard-traversal` advanced normally; [Draft #1124](https://github.com/tt-a1i/archify/pull/1124) was created with the original Trace image and current-base evidence. Final-head hosted CI remains separate.

## Follow-up · dev 500d · final head f9fc38cb

Independent GPT-6.1-Sol review found no blocker to updating the existing Draft at `f9fc38cbc19f5bb2725fd54d957e182831eb1eb9`. Both prior `9601c9b6` and dev `500d4a65211ffe607fde6b3ce7505027b45bb59e` are ancestors; only evidence files follow tested merge `48eaf689801a7a48ba052db87a028c47b07d794c`. Candidate browser implementation and related paths remain unchanged, and the new static checker/tests exactly match dev.

The reviewer inspected actual logs: focused render-output and Explainer checks **96/0/0**, core **19/0/0**; all raw-file size/hash entries match [the selected manifest](https://github.com/tt-a1i/archify/blob/f9fc38cbc19f5bb2725fd54d957e182831eb1eb9/experiments/keyboard-traversal/refresh-dev-500d/evidence.json). Both build ZIPs and committed ZIP have SHA `712de2a5db70e88ba6cbab82b2810978da6ac4afc74ac61eecf2471499de4cf9`, 235 members and clean CRC. Inventory equals current dev; only the keyboard checker differs. Both packed checkers equal combined source. No reviewer test rerun was needed; earlier browser results remain attributed to merge `49413625`, with no new HTML or screenshot claim.

After push, hosted attempt 1 failed on the shared short-viewport Sequence case; [diagnosis](keyboard-current-ci-diagnosis.md) records equal geometry to the earlier #1121 failure, without a root-cause claim. The aggregate failure reflected browser status while WebM succeeded. After the workflow terminated, root requested only job `121950169322` for rerun. Attempt 2 browser job `121954300681` and aggregate `121955819960` succeeded; [final head snapshot](keyboard-ci-attempt2.json) is 19 success and 2 skipped deployments. Other jobs retain their original attempt-1 execution. This is CI completion, not resolution of the initial observed failure, AT coverage or human acceptance.

The original full browser job tool log was not truncated and is retained locally as `/tmp/keyboard-ci-1124-attempt1-browser.json` (103743 bytes, SHA-256 `9806f91a9b2a2eb4188ac20d57e027bc255f7042136d3ee08d307462af2c088f`). The committed failure log is an explicitly selected excerpt, not the complete log.

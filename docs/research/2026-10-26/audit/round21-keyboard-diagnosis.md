# Kconfig keyboard diagnosis and existing candidate applicability

Conclusion: the unchanged keyboard candidate at `f9fc38cbc19f5bb2725fd54d957e182831eb1eb9` directly addresses the algorithmic cause of Kconfig's 28/52 diagnostics. Source inspection and saved traces support that conclusion, but this review did not execute that candidate on either Kconfig artifact. The old receipts remain failed; a candidate pass is predicted, not established. No new checker implementation is warranted before the bounded comparison against the existing candidate.

Read-only scope: inspected hub and experiment source, saved gzip browser receipts, keyboard.jsonl and action script, plus the existing keyboard branch diff/tests/refresh records. Hub and Kconfig checkout checker, reader and baseline browser-test files are byte-identical. No implementation, browser run, test, rendering, native observation or remote change was performed. Only this /tmp report was written.

## Exact failure and its correspondence to the trace

At current product base `d5d979493bba650b3995836afd379cd249f2d0dd`:

- `archify/explainer/browser-check.mjs:56-58`, `measurePublicHtml`, enumerates then-visible controls once and tags them with qa keys. `:67-85`, `keyboardTraversal`, records only tagged stops and performs exactly `controlCount + 3` Tab presses (`:74`). It does not establish a focus cycle or record budget exhaustion separately before labeling missing controls as not reached (`:84`).
- `archify/explainer/reader.js:601-602` creates the initially hidden source card. `show`, especially `:625`, recreates its link DOM; `:634` invokes it when a citation receives focus. The document key handler `:658-663` inserts card links after their citation, then resumes normal document order. These newly created links lack the initial qa tags, consume Tab steps and do not increase the checker's reached count.
- The saved baseline browser receipt (render02) reports 42 initial controls, 35 reached and missing keys 35 through 41 in every tested desktop theme/viewport. Thus 7 missing times 4 observations = 28 diagnostics. Its Tab budget is 45.
- The saved candidate receipt (render03) reports 55 controls, 42 reached and missing keys 42 through 54. Thus 13 times 4 = 52 diagnostics. Its budget is 58. These numbers are diagnostic totals, not 28/52 individually unreachable controls.
- `evidence/browser/keyboard.jsonl` records real Ego traversal with footer reached at 52/74 presses. There are 9/18 `Open source` stops respectively. Both traces additionally focus an unmarked native PRE at the license block (baseline step 42; candidate step 64); the artifact's PRE tags have no tabindex. Static selector coverage therefore misses both the deliberately dynamic links and this browser-native stop.
- The baseline manual trace at press 45 is the implier source-list link, immediately preceding the receipt's missing unmet-target link. Candidate manual press 58 is the values citation immediately preceding its source-card stop and the missing license-panel sequence. The observed cutoffs align with the checker's exact budgets, rather than a demonstrated focus trap.

This is stronger than merely observing that a footer is reachable: the source algorithm, added stops, budget arithmetic and missing-tail identities all agree. However, the CLI receipt has no full per-step focus trace and the Ego and CLI runs use different browser-control paths. No assertion is made that every environment reproduces precisely the same trajectory. Saved footer traversal also does not establish backward navigation, activation, assistive-technology behavior or dynamic-link coverage.

## Why the existing candidate applies without a Kconfig-specific change

At keyboard candidate `f9fc38c`, `archify/explainer/browser-check.mjs`:

- `createKeyboardTraversalState`, lines 67-88, keeps original target element identities and separate WeakMap focus identities. A new card link is observed as an extra focus stop rather than confused with an initial target or clone.
- Lines 106-110 replace `count+3` with `count + min(initial element count, 1024) + 3`; lines 124-142 finish once all original targets have been reached. The preserved Kconfig HTML contains approximately 252/336 start elements before reader initialization, giving more than sufficient scale for the observed 52/74 steps. These are static parse counts, not measured candidate DOM budgets.
- Line 121 clears cycle history when a new required target is reached. Each source-card visit follows a new required citation, so it does not create a spurious repeated-leaf cycle. Lines 127-132 restrict early cycles to repeated native leaf focus; the PRE stop is not such a leaf and stays within finite work.
- Lines 141-147 retain failed completion as failure and distinguish `focus-cycle` from `budget-exhausted`. No source-card reader changes are present in the candidate diff.

No Kconfig-specific incompatibility was found by source inspection. Actual unchanged-artifact candidate execution remains the narrow missing evidence. The selected HTML digests are baseline `dc6ee6dadbf3b6b2e13558a26ae8dd496bd1b640a32481bdfcdeaa2489d6f32e` and candidate `60b73e6a59074e12c94be141f9b49d72223950c4a6d12661462b8d8c183a97ef`; preserve these inputs and old receipts when evaluating the checker candidate.

## Coverage already present and the Kconfig delta

Current product `test/explainer-browser.test.mjs:15-23` tests a simple static passing page plus deliberate keyboard/reference/layout defects. Lines 35-85 test real paragraph-linked diagram source cards: focus text, Tab into card, Shift+Tab return, resume next document target, Escape and activation. That test calls the common inspector with `keyboard:false` at line 50, so its targeted source-card behavior checks do not exercise the automatic full traversal budget. Lines 161-166 retain missing negative-tabindex identities.

The candidate adds `test/explainer-browser.test.mjs:227-312`: four native scrollers with/without tabindex (233-239), six actual renderer SourceCard citations (240-249), reused floating links (250-254), frame/shadow/native date focus (255-268), negative tabindex (269-274), genuine Tab trap (275-281), hidden/cloned original targets (282-289), endless new stops and budget diagnostics (290-304), and native radio traversal (305-310).

Those tests already cover both mechanisms observed here, separately. Kconfig adds a preserved natural artifact combining seven full code panels, long content, nine sources, repeated citation uses, 9/18 transient links, a browser-native PRE stop, and a real missing-tail receipt. This is useful independent combined evidence, not a reason to create a duplicate algorithm or broad new test matrix. Candidate refresh-dev-e837 documents 19 passing Chrome tests and an authentic trace-flow CLI check at its original tested merge; refresh-dev-500d explicitly reuses that browser evidence. Neither is a Kconfig run or fresh final-head/browser acceptance.

## Minimum next verification and the remaining genuine-fault boundary

For this delivery, the smallest useful comparison is the existing candidate inspector against both unchanged Kconfig HTML files, with fresh output: require `termination=complete`, reached=count and no missing static target; retain steps and limit, original HTML hashes, and all other diagnostics independently. Pair it with the already defined genuine Tab trap (`:275-281`) or negative-tabindex fixture (`:269-274`): the last original target must remain missing and the checker must still fail. Reusing the candidate's existing counterexamples is sufficient; no speculative new hardening is proposed.

A smaller synthetic explanation of the old cutoff would use four actual source citations, each adding a transient link before a final required control: four extra stops exceed the old three-stop allowance. Candidate already has the stronger six-source version, so do not add a redundant four-source test merely to mirror this diagnosis.

One real coverage boundary remains unchanged: initial hidden dynamic source-card links are not required targets of the generic traversal. A product regression that removes their keyboard handoff/tabbability could allow all initial controls to be visited, so generic traversal completion alone would not prove those actions accessible. Existing targeted paragraph-card tests protect that specific card path; they do not constitute an exhaustive citation/repository-card action test. If acceptance claims extend to all card actions, minimally assert that a real citation focus opens its card, native Tab reaches its visible link, and Tab resumes the next document target; contrast a deliberately broken handoff while retaining reachable static targets. This is a defined evidence boundary, not an observed Kconfig defect and not a reason to expand this branch-only experiment now.

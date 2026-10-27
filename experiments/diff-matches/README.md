# Matching text blocks in an existing diff

This experiment adds a reciprocal reading action to normal Explainer `@diff`
output: follow a deletion to matching added text, then follow its link back.
It identifies text correspondences inside one diff block. It does not establish
moves, copies, behavior equivalence, successful compilation, or execution.
The comparison base is `e837dc4cb83042d2b6c596e039692e25ec62c2da` on branch
`codex/lab-diff-matches`, an independent experiment branch. The candidate was
recovered from snapshot `3ee923f0cccb2e26136fa57b061a4a92e1a04d33`.
The source/test diff against
the base is unchanged (SHA256
`83b6c1d914847ef653d350fbb89bc3736a5e8ac199cf972372a39332e83993c9`).

## Pages and actual inputs

- [Baseline](baseline.html) / [candidate](candidate.html): the complete 363-byte
  `movedPatch` literal from second-look's committed test, including final LF.
  The same complete diff appears twice, with distinct block IDs. The helper's
  old `app.py:11–14` links to new `util.py:3–6`; the class and neighboring helper
  remain ordinary added lines. This is an upstream test fixture, not a report of
  a naturally occurring reader failure or a complete Python program.
- [Historical patch baseline](baseline-archify.html) /
  [candidate](candidate-archify.html): the complete 9,666-byte, single-file git
  patch of Archify `e3fe0c2d3299df3846e84194f29b771771b2c0a0`, with no path
  filtering. It links old lines `3022–3135` to new lines `1176–1289` in
  `archify/renderers/workflow/workflow-compiler.mjs`. This is actual repository
  history; its commit message's behavior-preservation claim was not reverified.
- [Controls](controls.html): an original repeated-destination negative control,
  the complete upstream same-hunk reindent control, and the complete upstream
  modified patch with an unrelated neighboring helper. Constructed controls
  are not presented as naturally observed failures.

The shared first-page introduction explicitly distinguishes candidate links from
the baseline’s original table. After correcting that explanatory sentence, both
first pages were normally regenerated from the same unchanged 363-byte patch;
validate, deliver and check passed again ([candidate-copy-correction.json](evidence/20261026/candidate-copy-correction.json) and
[baseline-copy-correction.json](evidence/20261026/baseline-copy-correction.json)). Product code/tests and
the historical-patch pages were unchanged; prior runtime tests remain applicable.
Current HTML digests are in [identity.json](identity.json).

All five pages are normal CLI outputs. Validate, deliver and check passed;
CLI browser-check was not requested in those generation commands. Their original
receipts and generation logs are retained byte-for-byte in
[evidence/20261026](evidence/20261026/). The HTML was not post-processed.
[The raw evidence index](evidence/raw-evidence-manifest.json) maps original
absolute paths to these durable copies and records byte counts and SHA256.
Absolute paths inside raw receipts describe their original run and are not
current delivery dependencies. Initial first-page receipts predate the copy
correction; the two copy-correction receipts bind the current first pages.
The `*-archify-finalize-final.json` receipts bind the current historical pages.

The source reference is [KyleKing/second-look at b0f604f](https://github.com/KyleKing/second-look/tree/b0f604f4a740dc3098fca2ec9d508bd16af7b761),
particularly `internal/diff/moved.go` and the complete
[moved_test.go](inspiration/moved_test.go). The fixture's full
[MIT license](inspiration/second-look-LICENSE) and Archify's historical
[MIT grant](inspiration/archify-historical-LICENSE) are retained.
[source-manifest.json](source-manifest.json) records fixed revisions, extraction
commands, original byte counts and digests. The matcher and reader integration
were independently written; no Go, AST tooling, dependencies or upstream runtime
were added or executed.

## Deliberately narrow matching rule

1. Reuse `parseExplainerDiff()` rows. A run is adjacent removed rows or adjacent
   added rows. Context, hunk/file headers, and no-newline markers break runs.
2. Compare only each row's `text.trim()` (ECMAScript leading/trailing whitespace
   removal). Internal whitespace, punctuation, and case must still match.
   Literal `raw`, original endings/CRLF, source locations, file line numbers,
   row order, counts and canonical authored document are never rewritten.
3. A seed spans three successive qualifying rows in one run, including every
   intervening row. A qualifying row has at least four UTF-8 bytes after trim;
   this is a textual threshold, not a count of tokens or AST statements.
   Empty lines and bracket-only lines shorter than four bytes cannot establish
   a seed; four-byte punctuation such as `;;;;` can qualify. This rule performs
   no language or semantic classification.
4. Only seeds appearing once on each side qualify. Expand their continuous
   equality in both directions within the existing runs, retaining matching
   lines inside larger changed runs; discard blank-only block edges.
5. Deduplicate aligned expansions. Reject every candidate competing for any
   source or destination rows. Never select a first occurrence from repeated
   equivalent candidates. Same numbered-hunk reindent stays unlinked; different
   hunks/files can correspond. Plain fragments need no file name or invented
   line number: links name their actual diff-row positions.

This is conservative: repeated seeds, short fragments and competing overlaps can
leave text unmarked even when a person can see a correspondence. Absence of a
hint does not prove absence of correspondence. Different matching pieces around
local edits require their own qualifying seeds. No generic diff engine,
subsequence grammar, source attribution or semantic matching is claimed.

The renderer uses its validated block ID plus parsed row position for anchors;
identical text in another block has a separate namespace. Native `<a>` links own
navigation/history. Reader code focuses the destination row and emphasizes the
selected matching group only inside its owning figure; the reciprocal link
returns to the other end. No history store or global matching cache was added.
Old Line notes instead linked pinned source lines to author-written explanations
via an experiment-only sidecar/HTML post-process; it is not this product path.

## Validation and limits

| Evidence | Result | Durable raw log |
| --- | --- | --- |
| Diff / renderer / parser / validation | 63 passed, 0 skipped | [focused-final.log](evidence/20261026/focused-final.log) |
| Existing full Explainer browser suite plus first new case | 9 passed, 0 skipped | [browser-full.log](evidence/20261026/browser-full.log) |
| Final expanded browser case | 1 passed, 0 skipped | [browser-final.log](evidence/20261026/browser-final.log) |
| Same new browser case on archived base runtime | Expected failure: 0 links, expected 2 | [browser-base.log](evidence/20261026/browser-base.log) |
| Existing generated-output checks | Passed; no unrelated Viewer/golden regeneration | [generated.log](evidence/20261026/generated.log) |
| Canonical ZIP build | Passed, official Node 22.23.2 / bundled zlib | [zip.log](evidence/20261026/zip.log) |
| Extracted ZIP Explainer smoke outside checkout | Passed on macOS, without dependencies | [package.log](evidence/20261026/package.log) |

These are reused original run results, not reruns on the recovered checkout.
[The final evidence check](evidence/final-evidence-check.json) verifies the frozen
source/test diff, all 10 identity entries, all five source-manifest entries, and
the 41 byte-identical raw evidence copies. The final browser subset expands the
same matching-text case; it is not a tenth distinct browser case.
The final real-browser case uses pointer to the first destination, Tab to its
reciprocal link, Enter back, and a second identical diff instance without a
cross-instance jump. It also uses real Enter activation for the full historical
patch's `1176 ↔ 3022` endpoints. Renderer tests compare original code text and
exact old/new numbers; matcher tests cover inner fragments, CRLF, unchanged rows,
weak text, repeated destinations/sources, hunk boundaries and overlapping claims.
Those are protected outcomes; no layout-coordinate snapshot was introduced.

The full browser-suite evidence remains applicable after the final test-only
expansion; the last matcher adjustment merely avoids repeatedly marking already
conflicting groups, and all 63 focused checks ran afterward. The product code and
HTML stayed frozen for root's independent browser comparison.
[Browser evidence](browser-evidence.json) binds the four screenshots and five
original observation files to the current HTML identities. Root inspected all
four screenshots. The 2026-10-26 pointer, Tab and Enter observations used Ego
TaskSpace 13 for first-instance reciprocal navigation and second-instance
isolation. The 2026-10-28 recovered-session observations used Ego TaskSpace 7
for the historical patch's `3022 ↔ 1176` endpoints (114 matching rows on each
side) and the narrow dark viewport.
Automated browser interaction remains a separate evidence claim.

Root found the reading action functionally reviewable. The desktop historical
patch wraps four-digit line numbers onto two visual lines; the baseline has the
same 36px number cell and wrapping rule. At a desktop CSS viewport of 390×844,
the candidate's matching link stays visible and pointer/keyboard navigation
works, but the page is 400px wide; the baseline is 401px wide. These existing
layout limitations are retained, without a CSS change or rebuilt HTML. This
local readability check is not comprehensive mobile acceptance.

[Baseline screenshot](evidence/20261026/baseline-complete-fixture-light.png) ·
[Matched helper](evidence/20261026/candidate-matched-helper-light.png) ·
[Historical patch](evidence/20261028/candidate-archify-old-light.png) ·
[Narrow dark viewport](evidence/20261028/candidate-matched-helper-narrow-dark.png).

An earlier complete eight-file Finder-extraction patch (56,039 bytes) was normally
rejected by the existing diff-text 20,000-character schema limit. The [candidate rejection](evidence/20261026/candidate-archify-finalize.json),
[baseline rejection](evidence/20261026/baseline-archify-finalize.json),
and [unchanged input](evidence/20261026/rejected-oversize-real.patch) remain in
raw evidence; the limit was not widened.
The smaller complete historical commit above was selected instead. No test
failure or skip was hidden by refreshing unrelated artifacts.

Changes are confined to four Explainer runtime files, three existing tests,
this experiment, and the reproducible ZIP. `render.mjs` embeds `reader.js/css`
directly, so `generate:viewer`, Gallery, and ten diagram golden regeneration are
not needed. No schema, version or live Skill installation changed. Matching
indexes are local to one pure derivation call, and no second diff parser or
shared state owner was added; no broader simplification was warranted.

This report records local verification; remote delivery status is tracked in
the research hub. No release, deployment, Windows/cross-browser package gate,
full repository suite, assistive-technology review, or measured reading-speed
benefit is claimed. Long-image/print behavior of the new hints has not received
separate visual acceptance. AI assistance: Codex GPT-6.1-Sol implemented and
verified this candidate under the maintainer's experimental scope.

## Reproduce

From the repository root with dependencies available:

```sh
npm run test:focus -- test/explainer-diff.test.mjs test/explainer-renderer.test.mjs test/explainer-parser.test.mjs test/explainer-validation.test.mjs
ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' npm run test:focus -- test/explainer-browser.test.mjs
node archify/bin/archify.mjs finalize explainer experiments/diff-matches/input/second-look.json /tmp/diff-matches.html --out-dir /tmp/diff-matches-run --json
node archify/bin/archify.mjs finalize explainer experiments/diff-matches/input/archify.json /tmp/diff-matches-history.html --out-dir /tmp/diff-matches-history-run --json
npm run test:generated
```

For baseline discrimination, archive `archify/` at the recorded base, copy the
candidate `test/explainer-browser.test.mjs` and both input patches to the same
relative paths there, then run Node's `--test-name-pattern='matching diff text'`.
The baseline must fail on missing links, not missing imports or dependencies.
ZIP reproduction uses the canonical toolchain in CONTRIBUTING.md; package smoke
uses `scripts/package-smoke.mjs <extracted-archify-directory> --explainer-only`.

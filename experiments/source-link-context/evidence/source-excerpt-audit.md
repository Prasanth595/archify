# Round 23: source excerpts and range identity (read-only audit)

2026-10-28. Audited checkout HEAD `3c80d8349f438f70a48128680c268ff4ce9059ec`; comparison `origin/dev=d5d979493bba650b3995836afd379cd249f2d0dd`. `git diff origin/dev --` the relevant Explainer source/preparer/renderer/reader, Native focus UI, and repository evidence/link helpers returned no differences. No repository edit, render, test, browser, installation, PR, or remote mutation was performed. CONTRIBUTING.md, REVIEWING.md and `.agents/skills/archify-review/SKILL.md` applied.

## Outcome

No source-backed wrong-start-line or wrong-URI defect found in the audited supported fields. One small, concrete accessibility identity loss is worth reproducing in the existing Native evidence UI: its source-link accessible name drops the authored label and range, making multiple ranges in the same file/revision indistinguishable by link name. This is source-inspection evidence, not a browser/physical screen-reader reproduction or a natural-user failure. Do not start a new excerpt engine, LSP integration, annotation UI, or reading experiment for it.

## Field-to-reader trace

Explainer:

- Authored `sources[].path`, `lines:[start,end]`, `revision`, `title`, and optional HTTP(S) `url` are retained by `archify/explainer/sources.mjs:193-204`; ranges must be two ordered positive safe integers.
- Required `code` excerpts translate to Native verifier fields `line=lines[0]`, `end_line=lines[1]` at sources.mjs:220-222. A pinned Git blob is read, then sliced with `.slice(entry.lines[0]-1,entry.lines[1])` at :251-261. Result retains path, revision, original range, verified href, text, and whole-blob digest. This is not a current-worktree text read.
- Optional cited excerpts follow the same mapping and slice at :266-281; an unverifiable optional citation remains a plain reference, so absence of an excerpt is an intentional existing boundary.
- `archify/explainer/render.mjs:80` renders `code` with visible `path:start–end` and complete prepared excerpt; it does not add a line-number gutter. `snippet` at :79 is authored free text, with no original-source starting-line contract.
- `archify/explainer/reader.js:615-620` displays the source path/range and numbers its up-to-14-line preview with `first=source.lines?.[0]||1`, then `first+index`. Valid non-1 original starts are preserved; excess lines receive an ellipsis. There is no `startLine` field to be silently ignored in this source contract.
- Card title and pinned revision/external source action appear at :623-625; citation/node registration and mapping are at :632-650. `render.mjs:108-112` retains full revision and range in the footer source list. An authored numeric citation link is not by itself an automatically inferred call-site relation.

Native:

- `archify/schemas/common.schema.json:148-162` supports up to three `sources` references with path, optional positive `line`, `end_line`, label. It does not prohibit different ranges of the same file.
- `archify/renderers/shared/repository-evidence.mjs:283-303` preserves path/line, maps end_line to endLine and retains label; :355-372 pushes each verified reference in authored order. No same-file range deduplication removes one.
- `archify/renderers/shared/repository-location.mjs:57-66` URI-encodes each path segment and builds provider-specific pinned hrefs with original start/end fragments. GitLab Markdown uses plain view for working line anchors. No wrong URI or line conversion found.
- `viewer/focus.js:350-383` uses that evidence in the Passport. At :373-379 visible child elements show authored label (or basename), original Lstart–end, and full path. Native references are navigation evidence, not embedded code excerpts.
- `viewer/node-finder.js:66-68` includes path, label, start and end in searchable text.

## Concrete narrow gap: Native link name loses range and label

`viewer/focus.js:370` explicitly sets each web source link's `aria-label` from only `{path, revision: repository.shortRevision}`. `archify/locales/en.json:283` is `Open verified source {path} at revision {revision}`; zh-CN:283 likewise has no range or label placeholders. This custom name takes precedence over the visible child label/location text built immediately below at focus.js:373-379.

Valid supported trigger: one node references the same pinned file twice, e.g. `[{path:'src/router.js',line:1,label:'Declaration'},{path:'src/router.js',line:2,end_line:3,label:'Body'}]`. Their visible locations and hrefs differ, but their authored link names are identical. A reader choosing a specific occurrence through focus announcements/link-name navigation cannot distinguish declaration from body using those names. This is a loss of accessible destination identity, not wrong external navigation or wrong code content. The separate visible descendants may still be discoverable in some screen-reader browse modes; do not claim they are globally absent from all AT output.

Minimal existing HTML reproduction proposal, not executed:

1. Reuse `test/helpers/repository-evidence-fixture.mjs:18-48`, whose public synthetic Git repo already has a 3-line `src/router.js` and a valid architecture JSON. Replace only the first node's sources with the two references above; preserve all other fixture facts.
2. Generate through the current public deliver architecture path with that repo root and pinned revision; open its existing node Passport.
3. Capture the two source rows' text, href, aria-label, and Chromium AX names. Expected current href suffixes are `src/router.js#L1` and `src/router.js#L2-L3`; visible row labels/ranges differ; AX link names match. Retain actual screenshot and observed output before declaring reproduced.
4. A minimal candidate should make each accessible name include the same useful label/range/path/revision identity already visible. Reuse existing source rendering/localization patterns; avoid new schema or duplicated source state. Verify differing same-file ranges, single-line, file-only and local-only references; run only affected source/browser checks after selecting coverage under CONTRIBUTING.

Current `test/repository-evidence-browser.test.mjs:28-65` already checks visible paths/ranges, links, node source counts, and provider/local-only behavior, but does not inspect Passport source-link AX names. This explains an evidence gap, not a failing test result.

## Existing research and overlap

- `origin/codex/lab-source-question-tour@94d6a4d05bcc5c6bc86704692eef48b73fd53c25`: README and source-audit describe fixed Git excerpts, correct original line ranges, 14-line preview limit, and existing source-card actions. Its five sources are 72 lines in two files. This already owns the authored explanation of these mechanics; a new question-tour example would duplicate it. No shared Native focus UI changes.
- `origin/codex/lab-line-notes@079d562915a701f8c76b6479e59622432f81ee79`: experiments-only bidirectional line/comment return navigation. Complete 20-line free-text snippets and sidecar annotations; no shared schema/renderer/reader/Viewer changes. This owns exact inline return navigation, not Native link naming. Do not repackage a lack of code gutter or exact-return link as a newly found source-range bug.
- `origin/codex/lab-source-keyboard@d81830d34fdd698992b39913eb3fa3cd55d66a32`: reader.js plus scoped browser tests give source-only nodes button semantics and Enter/Space activation of existing native diagrams. Existing real Tab reachability, focus styling, SourceCard mapping and content are preserved. No Native Passport source-name fix. Any changes to reader.js require coordination with it; the narrow Native focus.js naming gap does not require touching that owner.
- Current research `docs/research/2026-10-26/audit/round21-reader-dedup.md:9-10`, `round21-source-popover-reading.md`, and `scouts/reading-handoff-followup.md` already separate shared keyboard-checker budget, source-only activation, and source-card mechanics. No same-file Native link-name finding appeared in that scoped local search. This is not an exhaustive live issue/PR ownership search; check remote work before implementation.

## Public-impact scope and value

Small local accessibility fix, shared across Native Viewer diagram types that expose verified source links (including Native children opened from an Explainer). No claim that every Explainer source citation loses its range. No visible screenshot difference is required for the source-name repair itself, but a real AX/interaction comparison is needed. Value is specific: selecting the right occurrence when one code file supplies multiple verified evidence ranges. Cost should stay limited to the existing link-name composition/localization and focused behavior regression; broader source architecture work would be disproportionate.

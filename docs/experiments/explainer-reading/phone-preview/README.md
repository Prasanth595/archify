# Phone preview experiment — round 2

Starting head: `0f36a3a9a`; upstream dev remains `5ecbd1bfdbf83ea747072112493c940e707569cb` (refreshed 2026-10-29). The maintainer explicitly requested continued exploration and remote branch submissions. This round is a fixed-source reading-surface experiment, not a fresh generation benchmark or a merge request.

## Observed problem and change

The same [singleflight draft](../singleflight/candidate.archify.md) draws a 755px-wide sequence into a 332px preview at a 390px viewport. Base shrinks the text and tells readers to open the Viewer. Candidate keeps the existing reading floor by scrolling overwide diagrams inside their frames on screens at most 760px wide. The preview becomes focusable for native arrow-key scrolling, and a bilingual hint explains the action. Desktop retains complete-fit behavior and removes the added tab stop.

[Before](singleflight-390.png) · [After](phone-preview-390.png) · [Interactive candidate](candidate.html).

Printing keeps the complete overview using the existing print rule. Image export resets the clone's diagram width; an initial export exposed extra blank space because the live scroll surface was taller. Candidate now measures the inert export clone synchronously off-screen and removes it in `finally`. The real reader stays at its current scroll position. No new persistent state, dependency or DOM event handler is introduced.

[Export before height repair](export-before-height-repair.png) · [Final PNG](export.png) · [Live-state receipt](export-state.json). Final export was performed at 390px, with the diagram scrolled to 400px; it retained all four participants and returned to the same live position. PNG size changed from 780 × 6532 to 780 × 5800 after the height repair. It is a complete overview; exporting at phone width does not make small image text large.

## Verification and evidence boundaries

- Original regression failed on base because the phone labels were below the reading floor. Actual logs are in [evidence](evidence/).
- Three focused browser cases passed: the phone scroll/resize/print path and existing desktop native fit/Viewer behavior.
- Broader browser, renderer and layout selection initially passed all 27 cases before export-height measurement was added. After adding the export assertion, 26 passed and one failed because keyboard scroll animation was still progressing during the state comparison. The assertion now sets a deterministic scroll endpoint before exporting; the repaired export/phone test passed. This is a test synchronization correction, not a hidden product failure or a retry of unchanged tests.
- The phone test exercises actual Chromium ArrowRight input, narrow/wide/narrow resizing, print containment, actual PNG encoding, dimensions, retained scroll state and cleanup of the temporary export root. The remaining 26 tests' evidence is reused because only that test's synchronization changed afterward. [Final selection output](evidence/final-focused.log), [repaired case](evidence/export-regression.log).
- Generated checks passed; schema and Viewer templates are unchanged. Actual outputs retained. Canonical ZIP is rebuilt with official Node 22.23.3 and bundled zlib 1.3.1-e00f703.
- This is Chromium evidence, not a physical-phone, Safari, Windows or human comprehension study. The formal browser command's viewport matrix remains 1280/1440; the new phone case is a focused regression, not an expansion or weakening of the public browser gate. Existing English toolbar overflow (#1076) and earlier full-page keyboard-traversal failures (#1124 symptoms) are separate and remain unresolved here.
- Screenshots with readable labels do not establish that scrolling improves comprehension for every diagram. The tradeoff is losing simultaneous overview on small screens; the full Viewer remains available.

## New source-backed practices

[Redis expiry/eviction](../redis/candidate.html) uses two columns and short Chinese row labels. At 390px, its policy table initially fit the viewport but broke `noeviction` across lines. Putting the exact identifiers in the wider explanation column fixed that awkward break without changing CSS.

[Python TaskGroup](../taskgroup/candidate.html) uses ordered steps instead of a wide sequence. Moving `return_exceptions=False` out of the column heading and shortening repeated cells brought its comparison from 468px to 332px at a 390px viewport. A later copy edit removed a broken `CancelledError` token from that narrow table; the exact type remains explained above. The English toolbar still makes the document 400px wide. [Case metrics](case-metrics.json) distinguish page overflow from table width.

Both discovery authors used a frozen runtime at `0f36a3a9a`, gpt-6.1-terra medium. Each preserved its first draft and receipts. Source revisions, live-documentation limits and the TaskGroup probe's different local Python version are in their respective notes. Parent inspected desktop and mobile screenshots, including the final corrected table captures; no human approval is claimed.

The overall exploration goal remains active. These are results of one bounded experiment, not a declaration that explainer optimization is finished.

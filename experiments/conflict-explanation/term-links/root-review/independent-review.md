# Bounded independent final review: term-links C

Disposition: retain as a research-only example of the existing authored `node:` link capability. No blocking defect for that bounded purpose. The current observations support a concrete keyboard route from two prose terms into a selected diagram node; they do not justify a default authoring policy, shared renderer changes, a general accessibility claim, or claims of faster understanding.

## Basis and boundary

Reviewed at repository HEAD `ae0acf7db3014cf4392ae5db9ff7529ec1fe8190`, with uncommitted `experiments/conflict-explanation/term-links` content. Independently read its README, `c.archify.md`, source audit, keyboard/hover JSON records, and all five requested C screenshots. Verified C HTML SHA-256 `8c02079dc91e49c8ca461e40d9ce0863cd49ae1e067522909f308718440a9c1f`, 540270 bytes. Reused the prior source/fixture/license audit and supplied structural comparison; did not repeat upstream verification. No tests, browser session, solver execution, commit, push, PR, or installation performed in this review.

## Value supported by this evidence

- The two links are attached to existing `baz 1` and `bar` words in the input-context paragraph and name exact declared-diagram nodes. The prose continues to distinguish declared input, the collapsed report, and upstream expected assertions. No new causal or solver fact is implied by the authored text.
- The recorded physical Tab sequence reaches the C `baz 1` anchor at stop 12. The desktop records show Enter opens the Viewer with baz/bar respectively active; the 390-pixel record shows the baz route. Escape closes and returns to each originating link in the reported checks. The focus outline and opened states in the screenshots are consistent with those records.
- B's automatic term only cross-highlights a preview node on hover; its observed target is outside the initial viewport and the hover does not scroll/open it. B does retain a generic diagram-open button (observed stop 27), which opens without node focus. Thus C supplies an earlier in-prose exact-node entry for these authored terms. The 12-versus-27 counts are observations of different destinations, not a speed comparison or identical-task benchmark.
- This is an existing capability demonstrated on one fixed fixture. It is worth retaining without a new human benchmark, provided the conclusion stays at this functional scope. Reader comprehension, discoverability, time saved, and assistive-technology behavior remain unmeasured.

## Cost and impact supported by this evidence

The changed input is two authored link spans. Supplied compiled comparison reports only paragraph text/automatic paragraph ID changes and exact `preparedDiagrams` equality, which bounds diagram-change claims. There is no product-code implementation cost in this candidate. Artifact size rises from 539978 to 540270 bytes (292 bytes); that observation does not establish generation or runtime performance. Link targets remain author-maintained references and add two tab stops. Existing one-run finalize/browser timings are reproducibility records, not a performance comparison.

The first private temporary-directory output is explicitly separated from the second public exact HTML. Redacted machine records are documented as copies with raw/public hash mapping, not live provenance. This is adequate for the limited review claim; do not describe the redacted copies themselves as unmodified live receipts. The initial pre-font-settle desktop page-height measurement should not be used to claim layout growth or regression.

## Material UI limits, nonblocking for research retention

1. The passport overlays the selected bar node on desktop, and selected baz is covered at 390 pixels. Desktop baz remains visible. Consequently exact selection is demonstrated, but simultaneous target/relationship readability is not reliably delivered. Existing issue #221 already owns keeping relationship nodes outside the passport; reuse that ownership and record these screenshots as examples if useful. This content-only experiment does not warrant a duplicate shared fix or a claim that the issue was resolved.
2. The passport displays the generic `外部系统` badge for baz/bar package leaves. In this fixture that is an inappropriate architectural category for a package name and could confuse readers. It is Viewer-generated metadata, not solver evidence or a fact introduced by the prose links. Treat it as a visible semantic limitation of the opened state, not an upstream fixture defect; do not infer additional solver meaning from it.
3. At 390 pixels the Viewer toolbar is cramped/clipped and the passport dominates the diagram area. This reinforces the limited mobile usability claim. The recorded narrow baz activation still works; narrow bar and broader responsive acceptance are not established here.

Recommendation: keep C on the research branch as a small existing-link example with the above limits. No recommendation to change shared behavior or adopt a general linking rule follows from this single fixture. Remote branch publication only remains the authorized delivery; this review does not request a PR.

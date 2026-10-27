# Batch 17 independent source review

**Ready within the source-review scope; worthwhile; no blocker found.** Correcting “real traffic” addresses a concrete mismatch: Lens reads authored diagram edges, including structural parent/child guides, without measuring traffic. “Highlights” also accurately describes selection, which dims other content rather than hiding it. “Node types” is a reasonable shared label across architecture, structural, timing and event diagrams. This is a copy correction, not a new interaction or classification contract.

## Scope and direct checks

Workspace `<USER_HOME>/.codex/worktrees/lab-authored-relationships/archify`, HEAD/base `d5d979493bba650b3995836afd379cd249f2d0dd`, unstaged candidate. Read decision `/tmp/archify-round17-lens-wording-decision.md` and `/tmp/archify-round17-native/source-final.patch`; followed the previously read repository review and test-value guidance. Repository stayed read-only; no tests/browser rerun, commit, push or install.

Parsed all 12 changed locale JSON catalogs and compared their mappings directly with HEAD: each changes exactly `viewer.lens.title`, `viewer.lens.instruction`, `viewer.guide.lens.hint`. No key addition/removal; all three retain their original empty placeholder sets. The six bundled and six example catalogs are represented. `viewer/viewer.css:1217–1220` changes only the explanatory comment, and the compiled template repeats that comment. No change exists in `viewer/semantic-lens.js`, `viewer/template.source.html` or `archify/renderers/shared/i18n.mjs`.

## Meaning, compatibility and maintenance

- `viewer/semantic-lens.js:390–425` marks selected-kind nodes, then matches any incident authored edge group for a single kind; with two kinds it matches only direct cross-kind edges, in either direction. Single-kind neighboring endpoints are also kept prominent. The new wording captures the main outcome and does not promise hiding, measured traffic, transitive paths or that an edge necessarily exists. Selecting one kind without edges still highlights its nodes.
- Existing `data-node-kind`, edge grouping/counting, hash/URL semantics, selection limits, animation and exports remain unchanged. New strings are consumed as text by existing translation/template paths. The i18n precedence and escaping implementation are untouched: valid explicit `meta.translations` overrides still win; bundled messages and English fallback still apply normally. Explicit authored old wording will therefore intentionally remain until its author changes it.
- The CSS instruction paragraph has normal wrapping and no fixed block height; title uses a flexible grid column. Longer translations add text height rather than entering diagram geometry or changing the data model. No source-level evidence of clipping or a behavior regression was found. This does not certify all viewport/language layouts: actual comparable Ego images and panel geometry inspection belong to the parent review.
- All 12 instructions preserve the single-kind versus two-kind distinction on inspection and avoid the previous telemetry implication. This review does not claim native-language fluency or professional linguistic review for all translations.
- Cost is proportional: 36 catalog strings and one comment plus the repository’s existing generated-output refresh. No helper, new runtime dependency, fallback layer or redundant test family was added. Existing tests are appropriate for compatibility; new exact-copy assertions would mostly freeze phrasing rather than protect a distinct behavior.

## Reused evidence and limits

Reused parent/author report: i18n + real-Chrome semantic Lens tests **46/46 passed, zero skipped**, official Node 22 / Chrome 156; core **19 passed** and generated checks passed. No reviewer test rerun is claimed. Inspected `/tmp/archify-round17-generated/test-generated.stdout`, which ends with all checks passed, and `/tmp/archify-round17-generated/svg-identity.stdout`, which records **15 byte-identical canonical SVGs**. This supports the intended separation of UI copy from drawing geometry.

The current workspace also includes generated HTML/gallery/archive changes owned by another worker; this report does not replace that worker’s package/content inventory verification. The earlier native `render-summary.json` includes a failed baseline zero-relationships attempt; that file alone is not a final acceptance receipt and this review does not relabel it as one. Parent’s later fixed-input browser and evidence records govern the final native cases.

No blocking source defect or required source change. Final disposition remains bounded by the parent’s visual acceptance and the generated-output worker’s receipt. No CI, merge, publication, live install, broad translation QA or user-comprehension improvement is claimed.

# Isolated Tree roles candidate receipt

Checkout: <USER_HOME>/.codex/worktrees/lab-tree-roles/archify
Branch: codex/lab-tree-roles
Base HEAD: d5d979493bba650b3995836afd379cd249f2d0dd
No commit/push/PR/live install. Product/tests initially frozen after repair round 2; separately authorized Lens-copy compatibility repair completed and frozen again (see addendum).
Node v26.12.0; Google Chrome 156.0.8078.48 on macOS.
Borrowed dependency symlinks created only in this checkout: node_modules and archify/node_modules -> corresponding <USER_HOME>/.codex/worktrees/pr671-validation/archify locations. Source dependencies untouched. Symlinks remain available for root rendering.

## Commands and results

1. Baseline discrimination: saved candidate renderer, replaced renderer only with `git show HEAD:archify/renderers/tree/render-tree.mjs`, ran `node --test --test-name-pattern='semantic kinds describe' test/tree-rendering.test.mjs`, then restored saved renderer. base-regression.log: 1 test, 0 pass, 1 fail at expected platform tree-root assertion, 262.396ms. Template at this point already included candidate Viewer: this is renderer-regression discrimination, not a whole-base browser comparison.
2. `node scripts/generate-viewer.mjs`: generated only archify/assets/template.html.
3. `ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node --test test/tree-rendering.test.mjs test/tree-branches-browser.test.mjs test/i18n.test.mjs test/semantic-passport.test.mjs test/semantic-lens.test.mjs`: focused-1.log, 55 tests, 46 pass / 9 fail / 0 skip, 25311.098ms. Failures: new hyphenated translation keys violated existing schema in full catalogs/custom fixture; six example catalogs lacked required new Tree keys. Retained original log/first implementation patch.
4. Repair 1: keep raw roles tree-root/tree-branch/tree-leaf; use schema-valid locale keys viewer.kind.tree.root/branch/leaf and narrow viewerKindLabel conversion; fill six existing reusable locale catalogs.
5. Same focused command: focused-2.log, 55 tests, 54 pass / 1 fail / 0 skip, 36823.864ms. Only failure was new test's incorrect Archify.nodeFinder API (actual API Archify.finder). 54 passing cases reused as final evidence: later repair changes only this failing test's fixture/API.
6. `ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node --test test/semantic-lens-browser.test.mjs test/semantic-radar.test.mjs test/new-type-translations.test.mjs`: semantic-browser.log, 24 pass / 0 fail / 0 skip, 16376.479ms.
7. Repair 2: corrected browser test API name and explicitly supplied locale en for custom translation fixture, preserving existing override preconditions. No product change.
8. `ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node --test test/tree-branches-browser.test.mjs`: tree-browser-final.log, 1 pass / 0 fail / 0 skip, 3945.520ms.
9. `node scripts/generate-viewer.mjs --check`: template-final-check.log, exit 0. `git diff --check`: diff-check.log, exit 0.

Final effective evidence: 79 distinct passing test cases by reuse of unchanged cases plus final rerun; not a single clean 79-case run, not full CI or perceptual acceptance.

## Scope and compatibility

Tree Passport.kind is structural; paint classes, coordinates, authored IDs/parents, topology, and collapse logic unchanged. Root precedence includes singleton. Story scan sees structural roles. Rendered regression protects singleton, 3 roles, paint and containment endpoints; actual Chrome test covers English/Chinese Passport/Finder/Lens labels and counts, colors in Lens/Radar, old share hash mapping, selected new hash, collapsed branch remaining a branch, focus reveals, and clean complete exports retaining roles.

Old Tree lens frontend/backend/external hashes normalize one-to-one to root/branch/leaf only for SVG with data-tree-ui. Architecture is untouched; existing semantic Lens browser tests passed. New links use roles. Explicit author old viewer.kind frontend/backend/external text is copied to role key only when corresponding new key is absent. Explicit new structural key wins. Bundled technical labels never carry across. Canonical author keys contain dots (viewer.kind.tree.root etc); raw metadata keeps existing tree-root role syntax.

Tree-specific Lens title/instruction/guide hint use existing template localization machinery. No schema field/ontology/registry. Branch Radar and leaf Lens keep their existing default paint variables; explicit new aliases needed only where raw role would change default color. All six bundled + six reusable sample locale catalogs updated.

## Boundaries and remaining gaps

- Dependency edges are still outside Tree containment contract; this generic metadata fix does not legalize dependency modeling.
- Raw kinds and Finder raw search tokens intentionally change to structural roles. Old Lens URL categories preserved; no generic old raw-kind API shim.
- No gallery, ZIP or all examples regeneration. Authoritative viewer template only. Adoption would need required generated artifact/CI scope on final integration revision.
- Actual Chrome assertions passed; root owns Ego image capture/perceptual review. No claim of visual acceptance from tests alone.
- No source-layout or topology algorithm changes; no full CI or broad release claim.

First patch SHA256: 49a1951d0d1396df5d5eab50aec05833a55c6688abce1e71fd0f045f7349902d
Final candidate patch SHA256: aaa1bd5907cbd318d44a979c82b09e38d51be02643e5b97ec8097238ce17b871


## Authorized Lens-copy compatibility addendum

Independent review found a concrete compatibility omission: Tree-specific default Lens keys stopped honoring old explicit viewer.lens.title, viewer.lens.instruction and viewer.guide.lens.hint overrides. Added a Tree-only copy of those explicit values to the corresponding viewer.tree.* key only when the new key is absent. No catalog defaults are copied and explicit new keys win. No shared Viewer/template edits were needed for this repair.

Preserved the previous final-candidate.patch as before-lens-compat.patch, SHA256 aaa1bd5907cbd318d44a979c82b09e38d51be02643e5b97ec8097238ce17b871. All previous raw logs remain unchanged.

Added a rendered-output regression covering all three old Lens text overrides and all three new-key precedence cases. Before the product repair: `node --test --test-name-pattern='explicit legacy Lens' test/tree-rendering.test.mjs` -> lens-compat-before.log, 1 test / 0 pass / 1 fail / 0 skip, 255.685ms, expected Authored Lens title but observed Compare hierarchy roles. Extended existing actual Chrome Tree test to inspect the live Lens title, instruction and guide hint for both old-only and old+new authored cases.

After repair: `ARCHIFY_CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' node --test test/tree-rendering.test.mjs test/tree-branches-browser.test.mjs` -> lens-compat-final.log, 13 tests / 13 pass / 0 fail / 0 skip, 4428.878ms (actual Chrome Tree case 4310.304ms). `node scripts/generate-viewer.mjs --check` -> lens-compat-template-check.log, exit 0; template unchanged by this repair. `git diff --check` -> lens-compat-diff-check.log, exit 0.

Also corrected the independently reviewed German example wording from ambiguous Enthaltungsbeziehungen to explicit Eltern-Kind-Beziehungen and clarified direct connections between selected roles. `node --test --test-name-pattern='checked-in de example catalog' test/i18n.test.mjs` -> lens-compat-de-catalog.log, 1 pass / 0 fail / 0 skip, 113.180ms. Other locale and shared browser evidence is reused, not rerun for this scoped compatibility change.

Updated final-candidate.patch SHA256: 44cd68933390899e0ea33f1e1a51fffc6ba1753386934cabd33df03972632fa6

No changes to experiments/tree-roles/, no commits/pushes, both borrowed dependency symlinks remain for root's rendering.

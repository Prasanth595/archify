# Independent D source/artifact review

Reviewed current files in `experiments/conflict-explanation/dependency-model` against C (`../term-links/c.archify.md`, `c.html`) and first D originals at `/tmp/archify-round10-dependency-originals/attempt1`. Read-only inspection and parsing only; no rendering, tests, browser actions, solver run, artifact editing, publication, or install. Prior source diagnosis `/tmp/archify-round10-tree-semantics.md` is preserved.

## Disposition

No blocking source/model/content defect found in final D at SHA-256 `09ec711ed24370ea330fe614e0541adf6a5ce621d0324cfdfa66c2676100cd96`. It is a bounded authoring correction to represent three declared dependencies through labeled Architecture connections. It is not a native package-type feature, a runtime performance improvement, a solver result, or demonstrated reader benefit.

One research-record correction was sent to root: current README explains the containment mismatch but does not explicitly say the earlier label-only Tree proposal was rejected. If that explicit record is required, add: “先前仅把 Tree 类型标签改成包名的方案已否决：它仍把依赖声明画成包含关系，不能作为本例的修正。” This does not require modifying generated HTML or prose source. No additional artifact correction requested by this review.

## Artifact identity and first-to-final boundary

Computed current hashes:

- `d.archify.md`: `316ef45577a968e0a0c96c48a5e62cf006b9b7bd12f9c7bc81ec6476fc0c9eb1`.
- `declared.architecture.json`: `f07341589d89dca14439b893b37d458fb78cbf1768e30668c1d5ef822bb3667a`.
- `d.html`: `09ec711ed24370ea330fe614e0541adf6a5ce621d0324cfdfa66c2676100cd96`.
- Preserved first D HTML: `9191f10724258e770f8e808df89ffaff10920a74d6234a574f76776bd3de129c`.

First→final Markdown is byte-identical. Native JSON differs only by addition of `meta.translations.viewer.lens.title` and `.viewer.lens.instruction`. Embedded prepared document, sourceText, and preparedSources are equal first→final. The entire embedded native SVG is byte-identical first→final. Decompressed embedded native HTML is exactly equal after replacing the old title and instruction strings by the two new values (each occurs twice: initial rendered text and i18n JSON); there are no other native HTML differences. The embedded native i18n message object has exactly those two changed entries:

- `比较系统角色` → `查看包名分组`.
- `最多选择两种语义类型。选择一种可显示其真实流量；选择两种只比较直接编写的关系。` → `最多选择两种类型。选择一种可查看编写的依赖声明；选择两种只比较直接编写的关系。`.

Thus this source review confirms the bounded wording correction and unchanged diagram content/geometry. It does not claim root's separate actual UI work has passed.

## C content preservation

Text diff C→D replaces only the five-line `@tree` table with `@diagram architecture id=declared source=declared.architecture.json`.

Parsed actual `archify-explainer-prepared` payload from C and final D HTML. Their answer and sources are equal. All four common panels (`context`, `full-report`, `collapsed-report`, `function`) are deeply equal, preserving complete report strings, full Rust test function, prose and block IDs. Within `scope-map`, all non-diagram blocks are deeply equal, including scope prose and four-row comparison table. Only the diagram block changes to architecture/source JSON.

Prepared source descriptors are equal, including the exact fixture commit `2b32d6a1b0b7b6021d2658a274d6fb7b613c5796`, `tests/examples.rs#L229-L268` and LICENSE URL. They are source/license references, not embedded full license assets (`preparedSources.assets` is empty in both); this review verifies preservation from C, not a new upstream network retrieval or complete license-file audit. The unchanged function itself contains root 1's two ANY declarations, five foo integer registrations each depending on bar ANY, baz 1 empty dependencies, NoSolution expectation, full/reduced reports, and reduced package-set assertion.

Exact node-reference prose remains `[baz 1](node:declared.baz)` and `[bar](node:declared.bar)`. Actual final rendered anchor markup targets diagram `declared` and `data-diagram-hash="focus=baz"` / `"focus=bar"`; preview node IDs exist for both. This establishes compiled target presence, not pointer/keyboard behavior or browser focus success.

## Actual embedded diagram, beyond input inspection

Parsed `preparedDiagrams.diagrams.declared` from final HTML, including spec, SVG, semantic index, base64 specification and gzipped native HTML.

- Embedded spec deeply equals current native JSON; embedded base64 specification bytes equal the native JSON file byte-for-byte.
- Decompressed embedded native HTML SHA-256 is `b84a2a4ef864a17b5df7ac51f34ecf6ca2993482d573727d198249e9bc64ee11`, matching its stored prepared diagram sha256.
- Actual embedded SVG has four semantic node groups: root/root 1; foo/foo {1,2,3,4,5}; bar/bar; baz/baz 1. Sublabels retain root registered version 1, foo registered candidates aggregated and not selected, bar referenced with no supplied version, baz registered with no dependencies.
- There are exactly three arrow paths with `marker-end="url(#arrowhead)"`: root→foo and root→baz labeled `声明依赖 · 任意版本`, foo→bar labeled `每个候选声明依赖 · 任意版本`. Corresponding edge-label groups repeat hooks for the same three edges; these are not extra logical edges. Prepared semantic index independently lists exactly those three edges and labels.
- SVG text includes all three dependency labels plus the `包名` legend. Nodes all have `data-node-kind="backend"`, and native i18n retains `viewer.kind.backend="包名"`. Actual node context/accessibility strings still say 架构组件, which is the chosen diagram convention, not a service/runtime claim.
- No component boundary or engineering deployment profile was authored. All four nodes consistently use backend/icon:none; no root frontend/leaf external classification remains.

The source explicitly says foo candidates are aggregated and no version selected. bar is a referenced package name with an empty supplied version set, not an external system. Diagram connections do not assert solved/installed versions, execution order, request traffic, internal proof topology, or a minimal conflict. Updated Lens instruction no longer calls the fixture “真实流量”.

## Contract judgment and remaining limits

At fixed dev d5d979493bba650b3995836afd379cd249f2d0dd, SKILL.md:63 routes libraries/CLI repos to Architecture. Architecture schema:74–105 supports id/type/label/sublabel/icon, and :127–150 supports authored directed labeled connections. SKILL.md:76 and authoring-contract.md:627–643 explicitly permit domain wording/icons while retaining semantic grouping conventions; :638–643 states icon changes do not alter type. Native componentType remains the seven-value technical enum (common.schema.json:71–72); there is no package/generic/custom component type.

D therefore fits the documented domain-presentation convention only when described candidly, as README currently does: one backend grouping uniformly called 包名, with explicit package dependency labels. It must not be called a native package ontology or typed package IR. Raw DOM/SVG metadata, Lens kind and Story inspect still use backend. Translation/legend changes wording, not that machine contract.

D supersedes C as the candidate representation of the declared dependency graph; C/B remain historical evidence and are not silently repaired. It also supersedes the earlier suggestion that changing Tree kind wording alone would correct this fixture. It does not supersede the independent generic Tree defect diagnosis: valid containment trees still inherit frontend/backend/external kind metadata. Fixing that product default is separate work.

README accurately distinguishes first/final artifacts, local raw receipts and public redacted copies, not-requested visualReview, skipped solver/broad tests/CI, and lack of reader study. Root owns physical keyboard/pointer checks and screenshot acceptance. This audit does not adopt test/browser receipt claims as fresh execution, nor establish actual reader comprehension, performance benefit, publication, or integration.

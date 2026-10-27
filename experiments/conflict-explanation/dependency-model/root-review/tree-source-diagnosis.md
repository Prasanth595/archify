# Tree type semantics: read-only audit

## Revision and evidence boundaries

Verified `origin/dev = d5d979493bba650b3995836afd379cd249f2d0dd`; hub working-tree HEAD is `7f65384bb526b9799f92418c22d9086e7d6bf63c`, so source findings below use `git show origin/dev:<path>` and line numbers at d5d9794. Experiment checkout HEAD is `d4f872ee81d3df4e4fd39a2860fccc4f2cae8a65`. Its `experiments/conflict-explanation/term-links/c.archify.md` declares only the four node IDs/labels/parents reported by root and explicitly describes edges as dependency declarations. No rendering, tests, browser actions, repository edits, push, PR, or installation performed. Existing screenshots were reported by root; this audit did not independently re-open or visually inspect them. Reviewed CONTRIBUTING.md, REVIEWING.md and archify-review Skill for value/cost/impact.

## Conclusion

The observed 外部系统 label is renderer-owned paint being presented as a domain type. It is not an author-supplied package classification, an omitted `type` default, or a viewer fallback caused by missing metadata. The current fixed dev source still has the behavior. Remote issue/PR dedup remains with the parent agent.

Tree schema `archify/schemas/tree.schema.json:104–134` permits id/label/parent/sublabel/collapsed/sources and forbids additional node properties at :109. An author cannot fix this by supplying `type: package`; that invents unsupported schema. Tree README :29–35 documents generic hierarchy and containment, including capability and repository layouts; it does not document frontend/backend/external as types for trees.

Separate modeling concern: `archify/references/authoring-contract.md:416–421` says Tree decomposes containment and forbids cross-branch dependencies; Tree README :29–31 also says links are containment only. The experiment explicitly represents dependency declarations. Its supplied four-node topology is a legal single-parent tree, but its edge meaning exceeds the containment contract. This does not explain or excuse the wrong type label: correctly authored file/capability trees receive the same labels. Do not expand this into a general dependency-model project under a chip-label fix.

## Exact source trace

1. `archify/renderers/tree/render-tree.mjs:408–420`: subtree hues borrow architecture palette names purely as paint. Comment :410 explicitly says hue is paint and structural role stays in Passport.
2. `:422–427`: `tone = node.isRoot ? 'frontend' : leaf ? 'external' : 'backend'`; separate `role` already computes `tree-root/tree-leaf/tree-branch`; context is localized root/branch/leaf; Passport nevertheless sets `kind: tone`.
3. `:454–458`: focus metadata receives that Passport; visual rectangles independently retain `c-${tone} ${role}`. Thus baz/bar get raw kind external, root gets frontend, foo gets backend. It is not a baz-only problem.
4. `archify/renderers/shared/cli.mjs:488–500` serializes kind as `data-node-kind`; :511–525 use sublabel/context/tag/brand for accessible text/native SVG title, not kind.
5. `viewer/focus.js:460` displays `viewerKindLabel(data-node-kind || 'node')`.
6. `viewer/template.source.html:709–717` resolves `viewer.kind.<kind>`, then a humanized raw-string fallback. `archify/locales/zh-CN.json:49–55` maps frontend→前端, backend→后端, external→外部系统. All locale catalogs have structural context keys `node.context.tree.root/branch/leaf` at :448–450, but these are not the kind-label keys.

## Existing customization: capability, not a complete repair

Typed native JSON accepts document-local `meta.translations` (Tree meta schema; `archify/schemas/README.md:41–47`). Canonical key overrides precede bundled catalog and English; load applies them at `archify/renderers/shared/cli.mjs:82–83`, resolution at `archify/renderers/shared/i18n.mjs:157–175`. Thus frontend/backend/external could technically be displayed as root/branch/leaf or package. This changes neither paint nor raw DOM kinds, grouping IDs, Story inspect, or Tree edge meaning. It does not make dependency arrows become containment. **Do not treat a Tree package-label override as the complete repair for this experiment.** It would only conceal one symptom while retaining the model mismatch. The precise existing alternative is discussed below.

## If fixing the generic product default is agreed

Smallest truthful product option: retain Tree's existing tone/CSS for painting and emit the already computed structural role as metadata.kind (`tree-root`, `tree-branch`, `tree-leaf`). Add only those kind labels to bundled catalogs; keep node context/sublabel/source facts. Avoid schema fields, arbitrary author taxonomies, new registries, or globally changing what external/backend/frontend mean.

This is small but not literally a one-line patch: current semantic consumers also use kind for grouping/color and links. Preserve those bounded presentation/compatibility behaviors explicitly rather than introducing a generic ontology framework. A presentation-only Tree-aware label mapping could cost less than new raw kinds, but leaves semantic Lens URLs and Story inspect still reporting architecture kinds; call that limitation out if choosing it. A generic Tree default fix is independently worthwhile for valid containment trees; it does not make this dependency experiment contract-correct.

### Direct consumers and compatibility costs

- `viewer/node-finder.js:35–39`: uses kind when present, else falls back to shape classes. Omitting kind alone still yields frontend/backend/external in Finder. :57–80 caches kind in item/search; :165–166 displays localized kind. A new structural kind changes raw search tokens; visible localized labels are not independently added to the search string.
- `viewer/semantic-lens.js:29–48` groups/counts by raw kind and localizes labels; :194, :348, :376–390 compare raw kinds. Lens selection/share behavior and kind ordering need a fixed Tree check. Retaining useful structural roles keeps filtering and counts available; do not hide all metadata.
- `viewer/semantic-radar.js:57–73` copies kind into mini-map data-kind. `viewer/viewer.css:1139–1159` defaults to backend paint with frontend/external overrides. New tree kinds would silently recolor root/leaf Radar without scoped aliases. Lens color rules at :1313–1324 likewise key on old kinds. Preserve colors with small aliases if changing raw kinds; no new palette mechanism is needed.
- `viewer/focus.js:779–794` uses raw kinds for token classification. Current Tree kinds all take the same default call path; structural kinds preserve that path. This is static trace, not runtime verification.
- `archify/story/tool.mjs:49–59` exposes raw `data-node-kind` as inspected node.kind. Changing raw Tree kinds changes inspect output, even if native SVG painting is stable.
- `archify/renderers/shared/cli.mjs:511–525`: current native title/aria omit kind and retain localized structural context; package label override does not change canonical SVG text. New raw kinds remain metadata inside exported SVG; Passport UI itself is excluded from exports per viewer-runtime.md:12. Tree README expand/collapse/export section and `test/tree-branches-browser.test.mjs:126–136` require full hierarchy in clean exports.
- This is not exclusively Tree infrastructure: architecture :1083 uses authored component.type; sequence :942–943 participant.type; lifecycle :1021–1024 state.type; class :946–947 authored type.kind; ERD :1414–1415 fixed database. Timeline `render-timeline.mjs:464–469` and Waterfall `render-waterfall.mjs:317–321` also send paint tone into Passport.kind. A global viewerKindLabel/catalog change risks changing these and legitimate architecture labels. Investigate them separately if requested; do not bundle a ten-mode redesign.
- Generated Viewer template/assets and checked-in rendered examples have authoritative sources. A Viewer/CSS change requires normal regeneration/freshness checks, not manual edits to each HTML.

## Existing coverage and meaningful evidence selection (not run)

`test/tree-rendering.test.mjs:35–150` covers rendered showcase checks, aligned/nonoverlapping topology, ancestor metadata/toggles, collapsed SVG completeness, wrapping, and invalid hierarchy. It has no explicit truthful kind assertion. `test/semantic-passport.test.mjs:18–24` covers only architecture/workflow/sequence/dataflow/lifecycle; its named all-typed/context cases at :80–105 do not exercise Tree. Finder check :218–226 is source-string coverage, not an actual Tree-label assertion. Existing green coverage cannot establish this case is fixed.

For an artifact-only Architecture convention experiment described below, compare the exact source facts/IDs/links before and after; inspect arrow meaning, package-only labels across Passport/Finder/Lens, label space, and rendering. Do not claim this resolves the independent generic Tree default defect. No product framework additions are justified for an isolated artifact.

For an agreed narrow generic-default patch:

1. Add a rendered-output regression in `test/tree-rendering.test.mjs` for a root + branch + two leaves, asserting truthful structural kinds and preserved authored IDs/context/title/topology/style classes, not source-function text or frozen automatic coordinates.
2. Extend an existing real-browser Tree test (`test/tree-branches-browser.test.mjs`) to focus root/branch/leaf and assert actual Passport kind, Finder result metadata, Lens role counts/filter/share state. Reuse its collapse/reveal and clean export behavior. Verify Radar computed colors if raw kinds change. This is needed because markup alone cannot prove Viewer labels and grouping.
3. Reuse `test/i18n.test.mjs` canonical catalog/override checks when adding kind keys; include zh-CN and English visible examples. Keep unrelated architecture frontend/backend/external unchanged with one representative comparison.
4. Relevant focused selection is tree-rendering, Tree browser, i18n, and affected semantic Lens/Radar suites where existing checks cover the preserved behaviors. Add the specific missing Tree interaction instead of running dozens of general suites as a substitute. Shared Viewer change additionally needs required real-browser/generated checks per CONTRIBUTING, using final revision CI where valid. Neither a golden refresh nor green static checks establish perceptual acceptance.

No assertion of a test pass, fresh browser validation, merged fix, or installed update is made here.

## Extension: accurate existing mode for the package declaration graph

### What exists

`archify/SKILL.md:63` includes libraries and CLI repos under Architecture; :69 limits Tree to single-parent containment; :70 limits Class to types. Architecture accepts components with id/type/label and optional sublabel/tag/explanation/icon/sources (`archify/schemas/architecture.schema.json:74–105`). Connections are authored from/to with optional id/label/variant (`:127–150`), so its topology can express all three static dependency declarations without portraying containment, data movement, a request sequence, or a selected installation.

There is **no native generic/custom/package component type**: Architecture requires `type` at :80–83; shared `componentType` at `common.schema.json:71–72` is exactly frontend/backend/database/cloud/security/messagebus/external. Supplying package, node, or neutral fails schema. Class is not a workaround: `class.schema.json:149–168` requires class/abstract/interface/enum/record nodes, and authoring-contract.md:434–440 says they are evidenced program types. Although Class has dependency arrows (:442–449), these four package-family names are not those program types. Dataflow carries payloads and lineage (SKILL :66; authoring-defaults.md:47), Workflow processes (SKILL :64), Sequence request interactions (:65); substituting one merely moves the false claim.

### The bounded documented convention available today

The contracts deliberately permit domain presentation conventions. `archify/SKILL.md:76` says to keep diagram modes and semantic types, name them for the reader with icons/legend labels. `authoring-contract.md:627–643` explicitly documents domain-specific diagrams, `icon: "none"`, and a backend node relabeled with a holiday-domain legend. :638–643 emphasizes type still controls color and semantic grouping; icon is decorative. Legend label overrides change wording only (:40–50), and authored domain wording is allowed at :121–123.

Consequently the smallest *existing-contract* representation is Architecture with all four components assigned **one explicitly declared package-name grouping convention**, using e.g. backend + icon:none consistently, `meta.legend.entries.backend.label = "包名（输入声明）"`, and `meta.translations["viewer.kind.backend"] = "包名"` for truthful Passport/Finder/Lens copy. All nodes must belong to the same category; no frontend for root, external for leaves, database for missing versions, service boundary, or runtime role. Use ordinary/default connection variant and explicit dependency labels. Keep optional engineering_profile/boundaries absent. This uses the documented domain adaptation, not an assertion that these packages are backend services. It should be described openly as that convention in the experiment receipt.

Caveat: raw typed IR, exported SVG metadata, Lens hash kinds and Story inspect will still say backend. Translation is legitimate domain presentation under this convention, but it does **not** establish a native package ontology or change backend's machine representation. If acceptance requires package identity at the raw kind/IR level with no reused technical enum, then **no accurate native package-kind representation exists under the current contracts**. Do not claim a translation solves that stricter requirement; it would require a separately agreed small contract extension, outside this read-only investigation.

### Exact fact-preserving authoring acceptance

Retain IDs root/foo/bar/baz, so node links remain rooted in the same identities (host figure identity/prefix needs separate checking when changing the enclosing mode). Suggested labels/sublabels carry only fixture facts:

- root: label `root 1`; sublabel `求解根包；登记版本 1` only if source inspection confirms that registration wording, otherwise simply `求解根包`.
- foo: label `foo {1,2,3,4,5}`; sublabel `已登记候选合并展示；未选定版本`.
- bar: label `bar`; sublabel `被依赖引用；未提供任何版本`.
- baz: label `baz 1`; sublabel `已登记；无依赖；归约解释未引用` if all three facts remain covered by original fixture references.

Exactly three arrows, from depender to dependency, with source facts on the edge:

- root → foo: `声明依赖 · 任意版本`.
- root → baz: `声明依赖 · 任意版本`.
- foo → bar: `每个候选均声明依赖 · 任意版本`.

Keep candidate aggregation explicit: foo is five known candidate versions grouped by package family, not one installed component or one selected version; bar is a referenced package name with an empty supplied version set, not an external runtime system. Retain upstream fixture/license references and existing prose distinction between full declaration input and reduced conflict explanation. Do not infer a successful resolution, installed graph, solver traversal, omitted version candidates, or internal proof structure from the arrows. Exact local focus URL preservation cannot be guaranteed from IDs alone because native mode/figure naming may participate; compare against fixed links before claiming compatibility.

Costs of this route: author-only native Architecture input and domain-wording convention, no schema/runtime code change, existing fields only. It requires new static layout/label/readability and focus-link verification because Tree geometry/collapse behavior is deliberately replaced by labeled dependency arrows. It does not authorize rewriting historical B/C outputs; preserve them as evidence and create a separately identified candidate. Existing generic Tree metadata defect remains a separate narrow product issue.

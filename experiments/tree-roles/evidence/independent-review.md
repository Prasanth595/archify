# Round 11 independent Tree-role review

Read-only review of `<USER_HOME>/.codex/worktrees/lab-tree-roles/archify`, branch codex/lab-tree-roles. HEAD and origin/dev both verified as `d5d979493bba650b3995836afd379cd249f2d0dd`; candidate is the uncommitted diff. Reviewed all product/test diffs and direct shared consumers. Did not edit source, render, run tests/browser, install, commit, push, or create a PR. Experiments remain root-owned. Prior diagnosis `/tmp/archify-round10-tree-semantics.md` remains valid and untouched.

## Disposition

Core role correction is worthwhile and proportionate: it fixes valid containment trees receiving frontend/backend/external semantic labels while retaining paint and hierarchy. One concrete P2 compatibility regression should be resolved or explicitly accepted before calling the candidate compatible: old explicit Tree Lens wording overrides are silently bypassed. Otherwise no blocking correctness defect found by source inspection. Actual image acceptance remains root's work; existing automated passes are reused author evidence, not reruns by this reviewer.

## Finding: preserve explicit legacy Lens wording or record its removal

**[P2] Tree-specific template keys bypass three previously supported explicit overrides.** `archify/renderers/tree/render-tree.mjs:578` replaces template references for viewer.lens.title, viewer.lens.instruction and viewer.guide.lens.hint with viewer.tree.* references. The document catalog migration at :32–38 covers only kind labels, not those three keys.

Concrete trigger: a valid existing Tree document with locale en and meta.translations containing:

```json
{
  "viewer.lens.title": "Ownership map",
  "viewer.lens.instruction": "Authored containment wording",
  "viewer.guide.lens.hint": "Authored guide"
}
```

Base uses those authored strings at the three existing template placeholders (viewer/template.source.html:475,589,593). Candidate keeps old values in the catalog but reads new keys, so all three visible strings silently revert to new bundled defaults. These new keys did not previously exist, so existing sources cannot already have migrated to them. The general documented per-key override contract is real; this is not hypothetical robustness.

Smallest repair: within the existing Tree-only translations handling, map those three **explicit** old keys to their Tree equivalents only when the corresponding new key is absent. Do not copy bundled default traffic wording. Keep explicit Tree keys authoritative. Alternatively record this as an intentional compatibility break and provide a migration; preserving explicit strings is the cheaper route.

Smallest useful regression: extend the existing custom Tree fixture/browser check with old Lens title/instruction/guide values; assert visible text, then assert a new Tree key wins when both supplied. This catches the actual lost-authorship boundary. No new framework or broad rerun is needed solely for this narrow repair; rerun affected Tree/browser and relevant translation checks against the final revision, reusing unchanged successful evidence where valid.

## Core implementation and shared consumer judgment

- `render-tree.mjs:434–437` derives role independently from paint, with root precedence before leaf. A one-node tree remains tree-root. Existing c-frontend/c-backend/c-external and tree-root/branch/leaf paint classes, layout calculation, IDs/parents, topology and collapse controls are unchanged.
- Existing subtree hue remains paint-only. Passport.kind becomes tree-root/tree-branch/tree-leaf; localized context/sublabel/source evidence remain. No new authored schema or package/domain ontology is invented. This fixes the generic valid-containment issue; it does not legalize PubGrub dependency edges as Tree.
- `viewer/template.source.html:709–717` translates only the three exact tree role names to schema-valid dotted canonical keys. Other modes' technical kind localization is unchanged. This avoids expanding the translation schema for hyphenated keys.
- `viewer/node-finder.js:35–80,165–166` reads emitted role first; role labels now agree with Passport and Lens. Raw search tokens intentionally change from architecture types to tree roles. Localized role labels are not newly indexed, matching the existing design; do not claim improved localized search.
- `viewer/semantic-lens.js:29–48,376–446` counts/groups and matches authored parent-child edges by role. Root/branch/leaf remain useful filterable metadata. New Tree-only title, instruction and guide hint remove false system/real-traffic wording without changing other modes' labels. Single selection includes touching containment relationships; two selections compare direct cross-role links, accurately reflected in new text.
- `semantic-lens.js:541–554` translates legacy frontend/backend/external hash values only when SVG has data-tree-ui, then applies existing available-kind, deduplication and two-kind limits. New interaction writes structural kinds. Architecture hashes remain unchanged. This is URL compatibility, not an old raw-kind API shim; receipt correctly states that boundary.
- Radar uses backend as its default fill/stroke; tree-branch therefore preserves its existing color without an extra alias. Explicit tree-root/frontend and tree-leaf/external aliases preserve the other Radar colors. Lens default is external, so leaf remains that color; explicit root/branch aliases preserve their prior colors. No new palette or registry is necessary.
- `viewer/focus.js:779–794` token classification takes the same default path for the old Tree tones and new role kinds. No newly changed security/data/event/state classification was found for Tree.
- Collapse state does not redefine a branch as a leaf because roles derive from authored children, not current visibility. Focus reveal behavior and all-tree exports remain the existing behavior. Shared focus title/aria helpers still use sublabel/context rather than kind; canonical titles and evidence are retained.
- `archify/story/tool.mjs:49–59` exposes new raw role kinds as intended. Exported SVG metadata likewise changes intentionally. The candidate is source-schema-compatible, not byte-compatible with old HTML/SVG/Story output. Receipt acknowledges this; no blanket compatibility assertion is justified.
- Kind override migration at `render-tree.mjs:32–38` copies explicit document viewer.kind.frontend/backend/external values into root/branch/leaf keys only when new keys are absent. New keys win. Bundled technical labels are not copied. Re-registration is document-local, so it does not modify shared bundled catalogs or other renderers. Omitted locale still has the prior no-override behavior; the corrected browser fixture explicitly sets en.

## Tests and retained evidence

Inspected test changes and author logs at `/tmp/archify-round11-tree-tests`; did not execute them.

Added rendered regression in tree-rendering.test.mjs protects three roles, existing paint classes, one containment edge, new Lens heading, Story scan and singleton root. Existing Tree layout/wrapping/structure tests remain. The test is useful base-discriminating evidence, but its base run swapped only the renderer while retaining candidate Viewer/template; it is not whole-base browser comparison.

Extended real-browser Tree test protects actual English/Chinese Passport/Finder/Lens text and counts, Lens/Radar computed color matches, a collapsed branch remaining a branch, clean export retaining all nodes and role metadata, old lens hash mapping, new hash emission, authored kind fallback and new-kind precedence. Existing portions protect keyboard collapse, selection-driven ancestor reveal and complete export. These are meaningful observable checks. Tests use APIs/DOM actions and are not independent human pointer/keyboard/product-perception acceptance.

Reviewed retained run accounting:

- first focused: 46/55 pass; failures disclosed (invalid hyphen i18n keys and missing locale-example keys).
- repair1 focused: 54/55 pass; remaining error is the new test calling the nonexistent Archify.nodeFinder API.
- repair2 changes test API to Archify.finder and supplies explicit locale; final Tree browser 1/1 pass.
- semantic browser/Radar/new-type translation selection: 24/24 pass.
- receipt's effective79 distinct cases is reuse of54 unchanged passes +1 final Tree browser +24, **not** a single clean79 run.
- Author reports final template check and diff check successful; logs retained. Node26/macOS/Chrome evidence is not canonical Node22 CI.

Specific remaining evidence needs: resolve the explicit Lens-override finding and exercise that repaired boundary; root's comparable valid-Tree images should cover root/branch/leaf labels, Lens actual wording and paint preservation. Before integration use required generated-output/CI gates appropriate to shared Viewer/catalog changes. Canonical generated examples were not all regenerated here; template --check alone is narrower than full generated-output acceptance. No reason to rerun unrelated process/filesystem/install suites merely to strengthen this scoped finding.

## Locale and maintenance notes

Six bundled and six reusable sample catalogs each receive the same six new schema-valid keys, avoiding missing-key failures for existing complete override catalogs. This is a bounded maintenance cost rather than a new localization subsystem. Automated catalog coverage does not verify all translated prose idiomatically.

Non-blocking wording correction: German reusable example `archify/examples/locales/de.json` calls containment `Enthaltungsbeziehungen`, which reads as abstention/restraint rather than containment. Prefer an explicit hierarchy/parent-child phrase, e.g. `Eine zeigt ihre direkten Eltern-Kind-Beziehungen; zwei vergleichen nur direkte Verbindungen zwischen den gewählten Rollen.` This is a local wording improvement, not grounds for a broad translation audit.

No speculative concurrency/security work, new taxonomy framework, or metadata removal is recommended. Apart from the explicit-override compatibility gap, scope remains appropriate for the observed valid-Tree defect.

## 定向复核追加：已授权 Lens 文案兼容修正

保留以上原始发现与修前代码指针，不追溯改写。此次仅只读核对新代码、回归代码及既有作者日志，没有运行新的测试或浏览器。

已核实 `/tmp/archify-round11-tree-tests/final-candidate.patch` 与候选当前完整 `git diff` 的 SHA-256 都为 `44cd68933390899e0ea33f1e1a51fffc6ba1753386934cabd33df03972632fa6`。前一个冻结候选仍在 before-lens-compat.patch，原始失败日志保留。

修正准确关闭上述P2：render-tree.mjs:38–43 只遍历 lens.title、lens.instruction、guide.lens.hint 三组键，从文档 translations 对象复制显式旧 viewer.* 值到 viewer.tree.*；条件是新键 undefined 而旧键存在，故新键优先，且不会复制 bundled 的真实流量/系统角色默认措辞。范围仍只在 Tree renderer，不影响 Architecture 或其他类型。现有 kind override 迁移逻辑未被改变。

新增 rendered regression 在 test/tree-rendering.test.mjs:173 起，对旧键单独提供以及旧+新键同时提供两种场景，检查三处实际生成HTML字符串。既有 Tree Chrome fixture 增加 preferredLens，并在 test/tree-branches-browser.test.mjs:204 起读取实际DOM中的Lens标题、说明和guide hint，分别验证 Authored 与 Preferred 三项。检查的是消费者可见结果，不是冻结内部实现源码。

作者保留日志与收据一致：

- lens-compat-before.log：修前新回归0/1，期望 Authored Lens title、实际 Compare hierarchy roles，直接区分原P2。
- lens-compat-final.log：修后13/13、零skip，包含完整Tree渲染与实际Chrome原有回归及新覆盖；总4428.87825ms。不是本审查者重跑。
- lens-compat-de-catalog.log：1/1，德语完整catalog检查；不等于德语人工语言验收。
- 德语instruction已改为明确 Eltern-Kind-Beziehungen，并明确两角色只比较直接连接，关闭先前非阻断措辞建议。
- 模板产品源未因本修正新增变化；template/diff空日志的exit0由作者receipt记载。本审查没有自行重复执行检查。

**更新处置：当前候选无本审查发现的剩余阻断项。** 原P2已被有界实现和可区分失败的回归证据解决。先前关于实际图片、窄屏、schema/原始kind边界、复用测试证据、最终集成generated/CI的限制仍保留；此结论不等于产品视觉、人类验收或正式集成通过。无需因已解决P2追加无关测试或扩展共享框架。

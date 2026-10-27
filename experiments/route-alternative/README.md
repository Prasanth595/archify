# Route alternative — a second same-hop witness

Local product experiment, 2026-10-26. Base: `e837dc4cb83042d2b6c596e039692e25ec62c2da`; branch: `codex/lab-route-alternative`. This is a usability candidate, not a bug fix, user-efficiency result, routing simulation or release. The recovered local snapshot is `dab817714f59471e80c0174bca8501138e5f3cfe` (parent: the fixed base above). Local review is complete; remote delivery remains pending. This record does not establish a push, PR, merge, release or live Skill installation.

The existing Route still defaults to its original directed BFS path. When another route with the same number of hops exists, **Another same-hop route** switches to one second witness; **Back to first route** returns to the original. Only these two candidates are retained, with no claim to enumerate or count all routes. With no second same-hop route, the action is hidden; a longer route is not substituted.

## Try the fixed comparison

- Open [base.html](base.html), then [candidate.html](candidate.html), using the same viewport/theme/camera conditions.
- Choose Route, then `API Gateway` (`gateway`) and `Event Bus` (`events`). The normal first route is `gateway → api_a → events`. In the candidate, activate **Another same-hop route** to read `gateway → api_b → events`, then return using the same native button.
- Both connections have two hops. The `api_b → events` label is genuinely blank in the source and remains blank. These are authored connections, not observed traffic or evidence of failover.
- The same-hop action keeps keyboard focus on the button, stops playback and resets Journey to overview. Journey, exact relationship inspection/export and ordinary Route controls continue to use the selected candidate.
- Copy/restoration preserves the selected second witness with `#route=gateway~events&routeAlternative=1`. First-route URLs stay `#route=gateway~events`; there is no navigation history. If the second witness is unavailable, restoration retains the first route.

[input.architecture.json](input.architecture.json) is the complete, byte-identical [Production Deployment Ownership input at the fixed base](https://github.com/tt-a1i/archify/blob/e837dc4cb83042d2b6c596e039692e25ec62c2da/archify/examples/production-deployment.architecture.json): 12 nodes / 12 relationships. It was not enlarged or edited to manufacture a failure. The diagram is an existing representative example, not a natural user incident. The baseline and candidate canonical SVG bytes are identical; only Viewer behavior and its compiled shell differ. [Artifact identities](evidence/identities.json) record input/HTML/archive hashes.

Normal CLI preparation, from the repository root:

```sh
node archify/bin/archify.mjs deliver architecture experiments/route-alternative/input.architecture.json experiments/route-alternative/base.html --json
# The command above was run on the clean fixed base before modifying the Viewer.
node archify/bin/archify.mjs finalize architecture experiments/route-alternative/input.architecture.json experiments/route-alternative/candidate.html --json --receipt experiments/route-alternative/evidence/finalize.json
```

[Finalize](evidence/finalize.json) passed validate, deliver, check and its automatic browser-check with zero diagnostics; the receipt records `browserCheck.requested=true` and `ran=true`. Its `visualReview=not-requested` flag applies to that automated stage. The explicit Route browser tests below and root's separate visual comparison are different evidence.

## Implementation and limits

The default BFS and eligible directed connections retain their existing DOM order and endpoint/self-loop rules. To find a second witness, the candidate tries at most one ordinary BFS per hop of the first path, omitting one first-path relationship at a time, and accepts the first equal-hop result. Any different same-length route must omit at least one relationship of the first route. Each BFS keeps the existing visited-node bound, so cycles do not trigger path enumeration. Work is `O(h(V+E))` for first-path length `h`; only the first and second result sequences are retained. No measured performance claim or speculative size threshold is added.

A stable `data-edge-key` identifies a relationship across its DOM fragments. Excluding it excludes all fragments of that relationship. Distinct parallel keys remain distinct routes even if their node sequences coincide. Keyless inputs retain the existing exact-DOM behavior; the existing export snapshot still rejects missing/conflicting identity. The new action does not add a graph model, weighting, renderer/schema field or public Route method. Its optional hash parameter exists only to preserve the choice in the existing link workflow.

Switching reuses normal `showResult`, including Journey cleanup, overlays, camera reveal and exact export snapshots. A fresh picker session or close discards the candidates. All six maintained locale catalogs include the button and alternative-status copy. [Viewer contract](../../viewer/README.md#route-probe-contract) documents the change.

## Behavior references and license boundary

- [BrainBar path utilities](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/BrainBar/Resources/Graph3D/graph3d-path-utils.mjs), [actual Compare paths consumer](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/BrainBar/Resources/Graph3D/graph3d.js#L4278-L4305), [MIT license](https://github.com/roccodaffuso/brain-bar/blob/65c6086ad0928a4982e6c207ed17e058a7d71b49/LICENSE): behavior reference for an explicit second-route choice. Its undirected/weighted/provenance graph behavior is not imported.
- [CSharpCodeAnalyst same-distance path collection](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/CSharpCodeAnalyst.CodeGraph/Exploration/CodeGraphExplorer.cs#L236-L391), [complete tests](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/Tests/UnitTests/Exploration/FindPathsBetweenTests.cs), [GPL-v3 text](https://github.com/ATrefzer/CSharpCodeAnalyst/blob/266d0536083c91b19cb91dcdf3e61c1d949d720e/LICENSE): research contrast between one shortest path and a shortest-connection subgraph. No GPL source or fixture was copied.

The implementation was written independently by extending Archify's existing directed BFS and result path. No external code, dependency or assets were added; the existing Archify licensing applies.

## Verification and failures retained

The test-value implementation workflow kept coverage on the affected Viewer behavior and its shared consumers. Existing browser fixtures already own default BFS/parallel geometry, Focus handoff, Journey and export rejection; they were extended instead of creating a duplicate fixture family. Tests distinguish exact edge identity, reset state and real native input without freezing automatic layout coordinates. No full-repository suite was run.

| Evidence | Result / boundary |
| --- | --- |
| [Route browser](evidence/route-browser-pass.log), [observations](evidence/route-browser/observations.json) | 10 passed, 0 skipped. Native production-diagram toggle, focus, Journey stop/reset, exact snapshot labels/keys, copy/cold restoration, return to first, endpoint change and close; existing fixtures cover distinct parallel keys, repeated same-key fragment, cycles, unique shortest, longer-only alternative and unreachable target. The fixture has more than two shortest witnesses; toggling returns to the first rather than claiming to show all. |
| [Focused checks](evidence/focused.log) | 388 passed, 0 skipped across `focus-browser`, `route-share-card`, `i18n`, `generate-viewer`, `core-smoke`. Real Focus browser coverage and static/public CLI checks retain their original scopes. |
| [Generated checks](evidence/generated-pass.log) | Current Viewer, brand marks, validators, release identity and checked-in golden/example freshness passed. Root and packaged examples were regenerated normally. |
| [Package](evidence/package.json), [smoke](evidence/package-smoke.log) | Official Node 22.23.2 / bundled zlib `1.3.1-e00f703`: 235-entry archive, independent rebuild byte-identical, exact compiled template and six locales equal unpacked bytes; extracted package smoke passed without dependencies. No installation was performed. |
| [First Route run](evidence/route-browser-first.log) | 8 passed / 2 failed (one failed nested case plus its parent). The new cold-hash test waited for a document load while navigating only the same document hash. The test now leaves the document before cold restoration; the final run passed without a product change. |
| [First generated run](evidence/generated-first.log) | Two freshness assertions failed because `examples/web-app.html` is outside the batch example target list and still had the old shell. It was regenerated from the existing JSON; the final run passed. |

The production input is representative. Controlled parallel/cycle/fragment cases are constructed test fixtures, not customer failures. Browser tests and generated outputs do not establish perceptual usefulness, assistive-technology acceptance, touch behavior or user efficiency. Root has now completed the browser comparison and viewed the five screenshots described below. That observation and the completed independent final review remain separate from the automated results above. If the existing diagram is already easy to read or switching adds no useful clarity, this experiment can be rejected without changing the default product direction.


## Root browser comparison and original evidence

Root used the real browser on the frozen base/candidate artifacts and visually reviewed these five PNGs. This copying agent did not inspect the screenshots. The [derived binding](browser-evidence.json) records each original file's exact bytes/SHA-256, PNG IHDR dimensions, scenario/JSON field, frozen artifact identities and `rootViewed=true`. It is an evidence index, not an original observation. The nine originals were copied without rewriting; [freeze identities](evidence/identities.json) are unchanged.

| Root-viewed screenshot | Original browser JSON / result |
| --- | --- |
| [Base default](screenshots/base-default-route-blueprint.png), 1440×1100 | [Base observations](observations/base-observations.json): Find selects `gateway` / `events`; the base shows the route through AZ-a and has no alternative action. |
| [Candidate default](screenshots/candidate-default-route-blueprint.png), 1440×1100 | [Desktop observations, first](observations/candidate-desktop-observations.json): the cold default still uses AZ-a and shows **Another same-hop route**. |
| [Candidate alternative](screenshots/candidate-alternative-blueprint.png), 1440×1100 | [Desktop observations, alternate](observations/candidate-desktop-observations.json): pointer activation switches to AZ-b, keeps the same two hops and leaves focus on **Back to first route**. |
| [Candidate hot-resize narrow/light](screenshots/candidate-alternative-narrow-light.png), 390×844 | [Recovery/narrow observations](observations/candidate-recovery-narrow-observations.json): the light/blueprint rendered page width is 375 CSS px; the new button is inside the viewport and all three route crumbs are visible. Root's visual review found the title truncated to `API Gat…`. |
| [Candidate cold-load narrow toggle/light](screenshots/candidate-narrow-cold-toggle-light.png), 390×844 | [Narrow action observations](observations/candidate-narrow-actions.json): after cold-loading the alternative, actual pointer **Back** returns AZ-a/default hash, then **Another** returns AZ-b/alternative hash; focus stays on each corresponding button. Page width remains 375 CSS px, all three crumbs are visible, the title still truncates to `API Gat…`, and only part of the diagram is visible. |

The recovery JSON additionally records desktop Enter returning to AZ-a and the default hash, then a switch back to AZ-b followed by reload preserving the alternative route/hash. These are actual root browser observations, distinct from controlled clipboard/test fixtures. The base remains one readable path; the candidate adds a direct way to inspect the other same-hop authored connection. No user-efficiency measurement was made.

Both narrow screenshots show only a local canvas portion. The earlier hot-resize observation is retained separately from the later cold-load pointer round trip. These actions were exercised in desktop Chromium with a CSS narrow viewport, not on a touch device; they do not establish complete mobile usability, physical touch input or assistive-technology acceptance. The four original JSON files and five root-viewed PNGs bind the observed scope. Independent final review is complete; see the disposition below.


## Independent final review and delivery status

The final review inspected the implementation and affected consumers at the recovered snapshot `dab817714f59471e80c0174bca8501138e5f3cfe`, against fixed base `e837dc4cb83042d2b6c596e039692e25ec62c2da`. No blocking implementation defect was found: default BFS order is preserved; each excluded relationship is removed by stable edge key; only equal-hop candidates are accepted; switching and restoration reuse normal result/Journey cleanup. The bounded extra BFS work is proportionate to this opt-in route comparison, with no new dependency or persistent graph index.

The reviewer rechecked all four frozen artifact identities, the frozen identity manifest, nine original evidence files, five PNG dimensions/observation bindings, unchanged base input and canonical SVG, current Route source in the candidate, and all seven runtime inputs in the 235-entry archive. Existing logs substantiate 10/10 Route browser and 388/388 focused checks, generated freshness and extracted-package smoke. Those recorded results were reused, not rerun or relabeled as new-head tests. [Review binding](evidence/final-review.json) records the inspected source and evidence hashes. This reviewer did not independently repeat root's browser actions or perceptual inspection.

The test-value check found no worthwhile additional test: the extended native browser fixture covers the new user action, exact relationship identity, state cleanup and hash recovery, while existing fixtures cover unaffected callers. There is no evidence of a second graph/state implementation that warrants an additional simplification pass. The measured-benefit, narrow-viewport, touch and assistive-technology limits above remain open experiment limitations, not newly reproduced defects.

Disposition: ready for the authorized local commit and remote experiment-branch delivery. Push success and any remote CI must be read back from their own results; this review does not establish them or authorize merge, release or installation.

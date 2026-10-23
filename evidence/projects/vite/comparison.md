# Vite — end-to-end Workflow authoring comparison (base vs candidate)

Slice of the Issue #934 authoring comparison. Repo: <https://github.com/vitejs/vite> pinned at
`82e7aa0374a15e1c67594557ab5893c91578f897` (`git rev-parse HEAD` of the shallow clone, also in
`revision.txt`).

| | |
|---|---|
| base CLI | `/tmp/archify-base/archify/bin/archify.mjs` — `main` @ `25cf3708` |
| candidate CLI | `/tmp/archify-960/archify/bin/archify.mjs` — `dev` @ `b71d1b3e` + `issue-934-partial-layout` @ `c64d4294` |
| command shape | `node <cli> finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root <clone>` |
| draft bytes | sha256 `72d3e63f8b3a5f23005a6cca5457476e7e39cccdab3bdf1b11905e4a4ef7b2d7`, 9043 bytes — byte-identical on both sides |

## 1. The task and the diagram

Task prompt (verbatim, also in `task-prompt.md`):

> Explain how Vite's dev server and its production build pipeline actually work in this codebase.
>
> Concretely, I want one diagram that answers:
>
> 1. **Dev request path** — what happens end to end when the browser asks the dev server for a
>    module during `vite dev`: from the HTTP request, through the Connect middleware stack, the
>    module graph, and the plugin pipeline, to the response that is sent back to the browser.
> 2. **Build path** — what happens when `vite build` produces the production bundle: from config
>    resolution through the build plugins and the bundler to the files that end up in the output
>    directory.
> 3. **Where the plugin pipeline sits in each path** — the `resolveId` / `load` / `transform` hooks,
>    the `pre` / `normal` / `post` plugin ordering, and the dependency optimizer that pre-bundles
>    dependencies for dev.
> 4. **Where the module graph, the dependency optimizer, and the emitted build output live**, so it
>    is visible that the dev path and the build path are two separate runtime paths that share one
>    plugin list.
>
> Use the real source under `packages/vite/src/node/` as the authority — in particular
> `server/index.ts`, `server/middlewares/transform.ts`, `server/transformRequest.ts`,
> `server/pluginContainer.ts`, `plugins/index.ts`, `build.ts` and `optimizer/index.ts` — and attach
> the source locations you relied on to the nodes whose claims they support.
>
> Show the two flows as separate lanes, with the shared plugin pipeline visible as its own lane.

The authored diagram is a schema-v2 `workflow` with four lanes — **Browser**, **Dev Server (Node)**,
**Plugin Pipeline**, **Production Build** — and 13 nodes / 11 edges:

- Dev path: `Browser request` →(HTTP request)→ `Connect middlewares` → `transformRequest` →
  `Module graph` →(down)→ `Plugin pipeline` →(transformed code)→ `send() response` →(200 + JS,
  up)→ `Browser evaluates`.
- `Deps optimizer` →(pre-bundled deps)→ `Plugin pipeline`.
- Build path: `vite build` → `resolvePlugins` → `rolldown build` → `write bundle` → `dist/ output`.

The shipped artifact (`base/final.html`, `candidate/final.html`, screenshots under `screenshots/`)
renders cleanly: 4 lanes, no crossings, all edge labels legible at 1440×900, `readable-v2` contract,
measured canvas `0 0 820 652`, browser gate pass with **0 diagnostics**.

## 2. Comparison table

| Metric | base (`main`) | candidate (`dev` + #934) |
|---|---|---|
| Repair rounds | **1** | **1** |
| `finalize` invocations (authoring loop) | **2** | **2** |
| Delivered? | **yes** (`out-02.html`, 831 086 B, browser-check pass, 0 diagnostics) | **yes** (`out-02.html`, 833 882 B, browser-check pass, 0 diagnostics) |
| Authoring-loop CLI time (sum of `elapsed=` for finalize 01+02) | **2.362 s** | **2.423 s** |
| Full `commands.log` `elapsed=` sum (incl. replay + re-measurement) | **4.226 s** (3 invocations) | **6.517 s** (6 invocations — see §6) |
| Wall-clock authoring window (first failed finalize → passing finalize) | **24.7 s** | **235.0 s** (see caveat §6) |
| First failure: code | `workflow/unexpected-root` | `workflow/unexpected-root` |
| First failure: message | `Workflow node "depsOptimizer" has no incoming edge and is not declared in semanticChecks.allowedRoots.` | *identical string* |
| First failure: `supportedFixes` | 2 fixes offered | *identical* |
| `partialLayout` in the failure receipt? | **no** (receipt has no such key) | **no** (receipt has no such key) |
| Replay of the final candidate JSON (identical bytes) | **pass**, 0 diagnostics | **pass**, 0 diagnostics (twice: pre- and post-CLI-mutation) |
| Final diagram SVG | sha256 `5b530f7bf678f3c4…` | sha256 `5b530f7bf678f3c4…` — **byte-identical** |
| Screenshots | 4 PNGs (1440×900 / 2048×1320, light+dark) | 4 PNGs — **byte-identical to base's** |

### The failure feedback the authoring agent actually received

Both sides received the same thing, verbatim:

```
code:      workflow/unexpected-root
severity:  error
message:   Workflow node "depsOptimizer" has no incoming edge and is not declared in semanticChecks.allowedRoots.
subject:   { diagramType: workflow, node: depsOptimizer, path: /semanticChecks/allowedRoots }
evidence:  { incomingEdges: 0, allowedRoots: ["browser", "buildEntry"] }
supportedFixes:
  - add the missing incoming edge to "depsOptimizer"
  - declare "depsOptimizer" in semanticChecks.allowedRoots if it is an intentional source
```

**Repair chosen on both sides (identical edit, byte-identical files — verified with `cmp`):**
`semanticChecks.allowedRoots` → `["browser","buildEntry","depsOptimizer"]`. The second
`supportedFix` is the truthful one: the dependency optimizer
(`packages/vite/src/node/optimizer/index.ts:463` `discoverProjectDependencies`, `:523`
`runOptimizeDeps`) is a server-start activity with no caller inside a module request, so adding an
incoming edge would have invented a call that is not in the source.

This was a **pre-layout** failure (semantic check stage), so the layout compiler never ran and
there was no geometry for `#934` to attach to. The candidate receipt therefore carries **no**
`partialLayout` key — same as base.

## 3. Did the candidate's `partialLayout` carry usable geometry?

**In the authoring loop: no — it was never produced.** Both sides failed at the semantic stage and
both passed on the first repair. The only difference the candidate could have shown is in the
*failure* payload, and the failure was not a layout failure.

To answer the question with real data rather than "n/a", I ran a **clearly-labelled supplementary
probe** (in `probe/`, outside both authoring loops) on the same project and the same final
candidate: one absolute pin was added to the frozen candidate
(`edges[2].via = [[400, 400]]` on `graph-lookup`) to force a genuine route-feasibility failure.
Both CLIs then failed with the identical diagnostic:

```
code:      workflow/explicit-pin-conflict
message:   Workflow edge "graph-lookup" has explicit geometry that violates orthogonal route segments.
subject:   { diagramType: workflow, edge: graph-lookup, from: transformReq, to: moduleGraph, path: /edges/2/via }
evidence:  { invariant: "orthogonal route segments", segmentIndex: 0,
             from: [380, 243], to: [400, 400],
             conflictingPins: [{ edge: "graph-lookup", field: "via", path: "/edges/2/via", value: [[400, 400]] }] }
supportedFixes:
  - remove via from edge "graph-lookup" so readable-v2 can replan the remaining explicit route assertions
```

`validate workflow --layout-json` receipt keys — **base:** `["contract", "diagnostics"]`;
**candidate:** `["contract", "diagnostics", "partialLayout"]`. The base layout receipt is 4 235 B;
the candidate's is **31 616 B** (≈7.5×, ≈27 KB of added JSON).

Actual `partialLayout` field values from `probe/candidate-layout-json.json`:

**Column grid — usable.**
```json
"columns": [94, 214, 334, 454, 574, 694]
```

**Node frames — usable** (13 frames, every authored node present, real solved geometry):
```json
{"id": "browser",     "lane": "client", "col": 0, "x": 48,  "y": 93,  "width": 92, "height": 52}
{"id": "browserEval", "lane": "client", "col": 5, "x": 648, "y": 93,  "width": 92, "height": 52}
{"id": "middlewares", "lane": "dev",    "col": 1, "x": 168, "y": 217, "width": 92, "height": 52}
```

**Cached route points — usable but incomplete** (8 of the 11 authored edges are present; the three
absent ones — `request`, `transformed-code`, `optimized-deps` — have no entry at all in the
payload: no route points *and* no candidate families):
```json
{"id": "graph-lookup", "from": "transformReq", "to": "moduleGraph", "points": [[380, 243], [400, 400], [408, 243]]}
{"id": "transform-url","from": "middlewares",  "to": "transformReq","points": [[260, 243], [288, 243]]}
```

**Rejected candidate points — present but misattributed.** `attemptedCandidateFamilies` is attached
to **three edges that routed successfully** (`transform-url`, `build-plugins`, `build-bundle`), each
with the same 17 candidate families and their point lists:

```json
{"family": "facing-straight", "points": [[168, 243], [334, 217]]}
{"family": "horizontal-then-vertical", "points": [[168, 243], [334, 243], [334, 217]]}
{"family": "outside-right", "points": [[168, 243], [152, 243], [764, 243], [764, 201], [334, 201], [334, 217]]}
```
families: `facing-straight, horizontal-then-vertical, vertical-then-horizontal, lane-gap-corridor,
column-gap-corridor, outside-left, outside-right, top-corridor, bottom-corridor`, then
`lane-gap-corridor`/`column-gap-corridor` repeated (the same family names recur, i.e. the list
accumulates retries).

The edge the diagnostic actually blames — `graph-lookup` — carries **zero**
`attemptedCandidateFamilies` (only its 3 routed points). So the payload's "what did the router
try and reject for the failing relationship" section was empty for the failing relationship and
populated with stale attempts for three unrelated relationships. **Verdict: the column grid and the
node frames are usable; the rejected-candidate points are not attributable to the failing edge.**

## 4. Honest negative findings

1. **For this project, `#934` produced no measurable improvement.** Both sides needed exactly one
   repair, with the same edit, and the final diagrams are byte-identical (identical SVG sha256,
   identical screenshots). The candidate was **not better, not worse — equal**.
2. **The authoring loop never reached the code path `#934` touches.** The only failure was a
   pre-layout semantic error, so the candidate's additive `partialLayout` payload had nothing to
   attach to. Any conclusion about `#934` from this slice alone would be unsupported.
3. **`finalize --json` does not forward `partialLayout` on either side — even after the candidate
   tree's later CLI-level plumbing.** This is the most consequential finding. The harness (and the
   delivery contract's authoring loop) uses `finalize … --json`, and that receipt contains **zero**
   occurrences of `partialLayout` on the candidate, both before and after the CLI-tree change
   described in §6 (`grep -c partialLayout candidate/probe-layout-failure-final.json` → `0`).
   `finalize` fails at the `validate` stage (`gates: {validate: fail, deliver: not-run, …}`) and
   never forwards the payload. I checked every surface explicitly against the **current**
   candidate tree:
   | command | candidate carries `partialLayout`? | base? |
   |---|---|---|
   | `finalize workflow … --json` | **no** | no |
   | `deliver workflow … --json` | **yes** — `partialLayout` key present, `partial: true`, `columns: [94, 214, 334, 454, 574, 694]`, 13 node frames, 8 edges | **no** (key absent) |
   | `validate workflow … --layout-json` | **yes** | **no** (receipt keys are only `contract`, `diagnostics`) |
   | `render workflow …` (no `--json`) | diagnostic text only on stderr; stdout empty | same |

   So under the exact command this comparison harness runs, **an authoring agent would see an
   identical failure receipt on base and candidate even if the layout had failed.** The payload is
   reachable only through `deliver --json` or `validate --layout-json`.
4. **The payload is noisy.** ~27 KB of extra JSON for a single failing edge, dominated by repeated
   candidate-family point lists for edges that are not the failing one. In a terminal that is a lot
   of scroll for information that the base's `evidence` block (`invariant`, `segmentIndex`,
   `from`, `to`, `conflictingPins`, plus a concrete `supportedFix`) already states precisely.
5. **Base's diagnostic was already actionable enough.** For the probe failure, base's
   `supportedFixes` literally names the edit (`remove via from edge "graph-lookup" so readable-v2
   can replan the remaining explicit route assertions`). I did not need any geometry to repair it.
6. **Inconclusive:** whether the *misattributed* `attemptedCandidateFamilies` is a #934 defect or
   an artefact of my probe's failure mode is not settled. The pin-conflict throw happens *after*
   automatic routing succeeded, so the failing edge never entered the router's reject path; the
   captured candidates that survived are leftovers from earlier solver iterations on other edges.
   A failure originating *inside* the router (e.g. `workflow/solver-budget-exhausted`) might
   attribute correctly. **This slice does not prove #934 wrong in general — it shows that its
   value did not materialise here, and that its route-candidate evidence can be misattributed.**
7. **Confound to declare:** base is `main`, candidate is `dev`+#934, and the two trees differ in
   **42 files** (viewer shell, architecture renderer, explainer, schemas). For the *workflow
   authoring path* the delta is confined to `#934`: `renderers/workflow/workflow-compiler.mjs`
   differs by 170 diff lines, all of it the additive payload capture, and
   `renderers/workflow/render-workflow.mjs` by 8 lines that attach it to the receipt;
   `bin/archify.mjs` differs by 17 lines, none of them workflow/finalize logic. That is why the
   two HTML artifacts differ in bytes (viewer bundle + embedded version `3.2.0` vs `3.2.1-dev.1`)
   while the diagram SVG is identical.

### Ordering / measurement caveats

- The **base loop ran first**, so the candidate's first diagnostic had already been read when I
  authored the candidate's repair. The candidate's original 145.1 s wall-clock window includes
  ~120 s of cross-CLI compiler-diff investigation (comparison work, not authoring). Like-for-like,
  the candidate's *authoring* window is ≈25 s — the same as base's 24.7 s. The repair itself was a
  one-line edit on both sides and was verified byte-identical (`cmp`), so the authoring-time
  numbers should not be read as evidence about diagnostic quality.
- The candidate's reported `totalElapsedSec` of 235.0 s = the original 145.1 s authoring window +
  a 95 s post-mutation re-measurement window (§5), which again included diff inspection rather
  than authoring.
- `cliExecSec` is reported as the literal sum of `elapsed=` over that side's `commands.log`, as
  specified. The base log holds 3 invocations (2 finalize + 1 replay); the candidate log holds 6
  (2 finalize + 1 replay, then the 3 re-measurement invocations). For like-for-like comparison use
  the authoring-loop-only finalize sums: **base 2.362 s vs candidate 2.423 s**.
- Shared work excluded from both per-side windows: ~17 min of source exploration
  (`server/index.ts`, `server/middlewares/transform.ts`, `server/transformRequest.ts`,
  `server/pluginContainer.ts`, `plugins/index.ts`, `build.ts`, `optimizer/index.ts`) and authoring
  the single shared draft. Because the draft is shared, it cannot bias one side.

## 5. The candidate CLI tree changed mid-experiment (important caveat)

At **2026-10-24 00:30:22** — while this slice was running — three files in the candidate tree
`/tmp/archify-960/archify` were modified **by another party, not by me**:

```
 M archify/bin/archify.mjs                      (+9/-1)
 M archify/renderers/shared/diagnostics.mjs      (binary, 8272 -> 8500 bytes)
 M archify/renderers/workflow/render-workflow.mjs (+10/-1)
```

These are further `#934` edits: they forward `partialLayout` out of the renderer and into the
CLI's `deliver` / `validate` / `render` failure receipts
(`reportArtifactFailure({…, partialLayout})`, `...(failure.partialLayout ? { partialLayout } : {})`
in `commandDeliver`, `rendererFailure` passing `payload.partialLayout` through). The base tree
`/tmp/archify-base` is **git-clean and untouched** (`git status --short` → empty).

Consequences, all re-measured rather than assumed:

| re-measurement (post-00:30 tree) | result |
|---|---|
| candidate `finalize` of the **same draft** (`candidate/out-03.finalize.json`) | exit 1, **same** `workflow/unexpected-root` diagnostic, identical message |
| candidate `finalize` of the **final candidate** (`candidate/replay2-of-candidate-final.json`) | exit 0, **pass**, 0 diagnostics — unchanged |
| candidate `finalize` of the **layout-failure probe** (`candidate/probe-layout-failure-final.json`) | exit 1, same `workflow/explicit-pin-conflict`; **still no `partialLayout` key** in the `finalize` receipt |
| candidate `deliver --json` of the probe (`probe/deliver-candidate2-stdout.json`) | **now carries `partialLayout`** (`partial: true`, `columns: [94, 214, 334, 454, 574, 694]`, 13 node frames, 8 edges); base does not |
| candidate `validate --layout-json` of the probe | carries `partialLayout` (unchanged) |

So the mutation **did not change the comparison outcome** — same first diagnostic, same repair,
same delivered artifact — but it **did** change which command surfaces the payload: `deliver --json`
now carries it, `finalize --json` still does not. The authoring loop in this slice used
`finalize --json` throughout, so the payload was never visible to the authoring agent either way.

Both the pre-mutation and post-mutation candidate runs are kept in `candidate/commands.log` with
distinct labels (`finalize 01-draft.workflow.json`, `finalize 02-repair-1.workflow.json`,
`replay-of-candidate-final`, `finalize 01-draft (CLI tree @00:30)`, `replay2-of-candidate-final`,
`probe-layout-failure-final`). The final candidate JSON and the delivered HTML are unchanged by
the mutation (same sha256).

## 6. Diagram quality check (final diagram)

**Factual / topological accuracy** — every node claim was checked against the cited source:

| Node | Claim | Source check |
|---|---|---|
| Connect middlewares | `transform · indexHtml` | `server/index.ts:1077` registers `transformMiddleware`; `:1103` registers `indexHtmlMiddleware` ✓ |
| transformRequest | `doTransform · cache` | `server/transformRequest.ts:150` `doTransform`, `:209` `getCachedTransformResult` ✓ |
| Module graph | `url to id · etag` | `transformRequest.ts:354` `_ensureEntryFromUrl`; `moduleGraph.ts:343`; etag map at `moduleGraph.ts:95,437` ✓ |
| Plugin pipeline | `resolve · load · transform` | `pluginContainer.ts:350 / 476 / 527` — the three hook loops ✓ |
| Deps optimizer | `scan · pre-bundle` | `optimizer/index.ts:463` (`discoverProjectDependencies` → `scanImports`) and `:523` (`runOptimizeDeps`) ✓ |
| send() response | `JS + inline map` | `server/send.ts:32`; `send()` injects the sourcemap reference into the body via `getCodeWithSourcemap` ✓ |
| vite build | `createBuilder` | `build.ts:574` `build()` → `:1837` `createBuilder` ✓ |
| resolvePlugins | `pre · normal · post` | `plugins/index.ts:45` `resolvePlugins`; `:185` `getSortedPluginsByHook` orders `pre`/`normal`/`post` per hook ✓ |
| rolldown build | `chunk · assets` | `build.ts:843` `buildEnvironment` → `resolveRolldownOptions` (`:599`) ✓ |
| write bundle | `manifest · reporter` | `build.ts:528` `resolveBuildPlugins` post set contains `manifestPlugin` and `buildReporterPlugin`; `:1492` wires `generateBundle`/`writeBundle` ✓ |
| dist/ output | `hashed files` | `build.ts:394` `outDir: 'dist'`; `:772-788` `[name]-[hash].${jsExt}` / `[name]-[hash].[ext]` ✓ |

**Two honest gaps in the authored diagram (identical on both sides, so the comparison is not
biased, but the diagram does not fully satisfy task item 4):**

- The `resolvePlugins` node sits in the **Production Build** lane, so the diagram does *not*
  visually demonstrate that dev and build share one plugin list — the very fact the prompt asked to
  make visible. The shared-list fact is implied by the node's name but not by its placement.
- The module graph is shown only on its **read** side (before the plugin pipeline). In reality it
  is also written after the transform (`_ensureEntryFromUrl` after a successful load/transform);
  the diagram does not show that update, and the `Browser evaluates / module graph updated`
  sublabel carries it instead.

**Label readability** — `visual-check` reports `readability.status: pass`,
`minimumProjectedNodeTextPx: 6`, `containment.status: pass` (4 viewports), `themeStates: pass`,
`viewerChrome: pass`, `captures: pass`, **0 diagnostics**. Sublabels are short (≤ 25 units); the
longest, `resolve · load · transform`, fits its node without shrinking.

**Routing readability** — no proper X crossings, no edge-overlapping corridors, no label/node
collisions. The three cross-lane edges each use a distinct port: `Module graph → Plugin pipeline`
enters from the top, `Plugin pipeline → send() response` leaves to the right and rises, and
`send() response → Browser evaluates` leaves from the top. `pre-bundled deps` spans two ranks in
the Plugin Pipeline lane and clears both neighbours. The `HTTP request` label sits in the lane
gap between Browser and Dev Server and clears both boxes.

## 7. Files produced

```
task-prompt.md                       the authoring task prompt
revision.txt                         pinned revision 82e7aa0374a15e1c67594557ab5893c91578f897
report.json                          the machine-readable result
comparison.md                        this write-up
base/01-draft.workflow.json          shared first draft (identical bytes on both sides)
base/02-repair-1.workflow.json       the single repair
base/final.workflow.json             copy of 02-repair-1.workflow.json
base/final.html                      copy of out-02.html (the delivered artifact)
base/out-02.html                     delivered artifact
base/out-01.*.json                   kept failure receipts (finalize, finalize-summary, delivery-pending)
base/repairs.md                      repair log
base/commands.log                    every invocation with exit status + elapsed
base/replay-of-candidate-final.json  frozen-candidate replay receipt (base CLI)
candidate/…                          the same set, candidate side
candidate/out-03.finalize.json       re-measurement of the draft after the CLI-tree change
candidate/replay2-of-candidate-final.json  re-replay of the final candidate after that change
candidate/probe-layout-failure-final.json  layout-failure probe run through `finalize --json`
screenshots/base/                    4 PNGs + contact sheet + visual-check receipt
screenshots/candidate/               4 PNGs (byte-identical to base's) + contact sheet + receipt
probe/                               supplementary layout-failure probe (outside both authoring loops)
```

`src-vite/` holds the pinned clone of the target repository (used as `--repo-root` for the
repository-evidence check and as the citation source for every node's `sources`).


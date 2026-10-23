# Kubernetes — Workflow authoring comparison (base vs candidate)

Slice of the #934 authoring comparison, project `kubernetes`.

| | |
|---|---|
| **Repo** | `https://github.com/kubernetes/kubernetes.git` |
| **Revision** | `95f9a388b709638838f78bba3ab1f6c8aaf7a39f` (clean worktree, `git remote get-url origin` = the URL above) |
| **base CLI** | `/tmp/archify-base/archify/bin/archify.mjs` — archify `main` @ `25cf3708` (generator `archify 3.2.0`) |
| **candidate CLI** | `/tmp/archify-960/archify/bin/archify.mjs` — archify `dev` `b71d1b3e` + `issue-934-partial-layout` @ `c64d4294` (generator `archify 3.2.1-dev.1`) |
| **Command** | `node <cli> finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root <src-repo-k8s>` |
| **Model** | MiniMax-M3 (minimax-M3) |

Kubernetes itself was used — no fallback repo. It was cloned with
`--depth 1 --filter=blob:none --sparse` and sparse-checked out for
`cmd/kube-controller-manager/app`, `pkg/controller/deployment`, `pkg/controller/controller_utils.go`,
`staging/src/k8s.io/client-go/{tools/cache,util/workqueue,informers}` and
`staging/src/k8s.io/apimachinery/pkg/util/wait` (11 MB total).

---

## 1. The task

`task-prompt.md` (full text in `report.json` → `taskPrompt`):

> Using the Kubernetes source in this repository, produce a **workflow diagram** that explains the
> Deployment controller's reconcile loop end to end.
>
> 1. **How a change reaches the controller.** … watch → local cache → event handler → workqueue.
> 2. **How work is scheduled and retried.** … the rate-limited requeue and what becomes of the key
>    once the retry budget is exhausted.
> 3. **How the reconcile writes back.** … writes the result back to the API server — closing the loop.
>
> Ground every step in real source files from this repository and cite them. Show the retry/backoff
> path as a distinct branch. Use a **workflow** diagram … lanes for ownership/runtime boundaries, a
> left-to-right happy path, and the write-back as a return edge that closes the loop.

## 2. What the diagram shows

Nine nodes in four lanes, two phases (`Observe` = cols 0–2, `Reconcile` = cols 3–5), one
left-to-right happy path and a return edge that closes the loop:

```
kube-apiserver ──list/watch──▶ Reflector ──object deltas──▶ sharedIndexInformer
      ▲                                                       │ add, update, delete
      │                                                       ▼
Update ReplicaSet / UpdateStatus          Event handler ──queue.Add(key)──▶ Rate-limiting workqueue
      │                                                       ▲                            │ queue.Get()
      └──────────── scale + status ◀── desired state applied ◀── syncDeployment ◀── syncHandler(ctx,key) ◀── worker
                                                 │
                                                 └── sync error ──▶ handleErr ──requeue with backoff──▶ Rate-limiting workqueue
```

Lanes: `01 kube-apiserver`, `02 client-go informer cache`, `03 deployment-controller`,
`EX retry & backoff` (exception variant). Nine `sources` ranges are attached to the nodes, all
verified against the pinned checkout by `--repo-root`.

## 3. Comparison table

| Metric | base | candidate |
|---|---|---|
| Repair rounds | **3** | **3** |
| `finalize` invocations | **4** | **4** |
| Delivered? | **yes** (`base/out-04.html`) | **yes** (`candidate/out-04.html`) |
| `totalElapsedSec` (authoring loop) | 243.7 | 98.5 |
| `cliExecSec` (all `commands.log` elapsed) | 8.076 | 8.158 |
| `cliExecSec` (finalize calls only) | 4.248 | 4.433 |
| Failure codes seen | `schema/maxLength` → `composition/ambiguous-corridor` → `workflow/route-preset-conflict` | *identical* |
| `finalize` diagnostics byte-identical to base? | — | **yes, all 4 runs** |
| Final JSON bytes | `4262bb0c…` | `4262bb0c…` (**identical**) |
| Diagram SVG bytes | `4211527e…` | `4211527e…` (**identical**) |
| Screenshots byte-identical | — | **yes** (all 4 PNGs) |

### What the failure feedback actually gave the authoring agent

Both sides received the **exact same three failures**. The feedback was sufficient to reach a
passing diagram on both sides, and the *same* repairs were made on both sides.

**Round 1 — `schema/maxLength`** (identical on both sides):

```
/nodes/4/sources/0/label (id/label: "queue built with the default controller rate limiter")
must NOT have more than 48 characters
evidence: { keyword: "maxLength", limit: 48 }
supportedFixes: ["provide at most 48 character(s)"]
```

Actionable and complete: the JSON path, the offending value and the limit are all named.

**Round 2 — `composition/ambiguous-corridor`** (identical on both sides):

```
[composition/ambiguous-corridor] showcase workflow edges[7] "write" -> "api" shares a 80px
corridor with edges[8] "sync" -> "retry" at [1100, 450] -> [1100, 530] (segments 1 and 1;
minimum 8px) — adjust route/via, bias, or channel coordinates so unrelated edges do not
visually merge.
evidence: { otherRelationship: {index: 8, from: "sync", to: "retry"},
            overlapLengthPx: 80, minimumPx: 8, from: [1100, 450], to: [1100, 530],
            segmentIndex: 1, otherSegmentIndex: 1 }
supportedFixes: ["adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge"]
```

This named **both** colliding edges, the shared corridor endpoints and the overlap length — enough
to identify the offending pair without any extra tooling.

**Round 3 — `workflow/route-preset-conflict`** (identical on both sides):

```
Workflow edge "write->api" cannot satisfy route preset "return-left":
candidate violates perpendicular endpoint-side direction.
evidence: { invariant: "perpendicular endpoint-side direction",
            attemptedCandidateFamily: "return-left",
            points: [[913.6,540],[20,540],[20,119],[248,119]],
            fromSide: "left", toSide: "right",
            requiredEndpointStubPx: 8, requiredInteriorSegmentPx: 16,
            requiredDirectClearancePx: 28 }
supportedFixes: []          <-- empty
```

This is the one genuinely thin diagnostic: `supportedFixes` is an **empty array**, and the message
does not say what to change. The attempted candidate points and the `fromSide`/`toSide` pair are
the only actionable content, and the fix (drop the preset, move the *other* edge off the corridor)
had to be inferred.

## 4. Did the candidate's `partialLayout` carry usable geometry?

**Not in the channel the authoring loop uses.** `partialLayout` never appeared in any of the four
candidate `finalize` receipts:

```
$ grep -c partialLayout candidate/out-0*.finalize.json
candidate/out-01.finalize.json:0
candidate/out-02.finalize.json:0
candidate/out-03.finalize.json:0
candidate/out-04.finalize.json:0
```

This is structural, not incidental. The payload is produced by the compiler and surfaced **only**
by the renderer when `--layout-json` is passed
(`/tmp/archify-960/archify/renderers/workflow/render-workflow.mjs:37-38`), and
`/tmp/archify-960/archify/bin/archify.mjs` contains **zero** references to `partialLayout`
(`grep -c partialLayout bin/archify.mjs` → `0`, versus **19** in the candidate's
`renderers/workflow/workflow-compiler.mjs` versus **0** in the base's). No `finalize` receipt on
either side can carry it.

**It is reachable through the inspection channel, and the payload is genuinely rich there.**
Running the same failing bytes through `validate workflow <input> --layout-json --repo-root …`:

| failing input | base output keys | candidate output keys |
|---|---|---|
| `01-draft` (schema error) | non-JSON schema error (pre-layout) | non-JSON schema error (pre-layout) |
| `02-repair-1` (ambiguous-corridor) | `contract, viewBox, requiredViewBox, columns, nodes, edges, labels, diagnostics` | **byte-identical** to base |
| `03-repair-2` (route-preset-conflict) | `contract, diagnostics` | `contract, diagnostics,` **`partialLayout`** |

Actual candidate payload fields (`layout-json/candidate-03-repair-2.layout.json`):

* **Column grid** — `partialLayout.columns`:
  `[148, 268, 456.4, 576.4, 811.5999999999999, 993.5999999999999]`
* **Node frames** — `partialLayout.nodes` (9 entries, `id/lane/col/x/y/width/height`), e.g.
  `{"id":"write","lane":"controller","col":5,"x":913.5999999999999,"y":514,"width":160,"height":52}`,
  `{"id":"api","lane":"apiserver","col":0,"x":48,"y":93,"width":200,"height":52}`,
  `{"id":"retry","lane":"retry","col":4,"x":741.5999999999999,"y":631,"width":140,"height":52}`
* **Cached route points** — `partialLayout.edges[].points`, e.g. the route that actually occupied
  the round-2 corridor:
  `sync -> retry` → `[[1067.6,450],[1100,450],[1100,657],[881.5999999999999,657]]`
  (`x = 1100` from `y = 450` downwards — exactly the corridor the base diagnostic reported as
  `[1100, 450] -> [1100, 530]`)
* **Rejected candidate points** — `partialLayout.edges[].attemptedCandidateFamilies`, 17 families
  per edge, e.g. for `api -> reflector`:
  `outside-right` → `[[148,93],[148,77],[1100,77],[1100,201],[268,201],[268,217]]`,
  `top-corridor` → `[[148,93],[148,36],[268,36],[268,217]]`,
  `column-gap-corridor` → `[[148,93],[148,77],[208,77],[208,201],[268,201],[268,217]]`, …
* `partialLayout.partial` = `true`

So the answer to "usable information?" is **yes, where it is reachable** — the column grid, the
node frames, the solved routes and the rejected candidate families are all present and are all
directly usable for a repair.

**But two real limits:**

1. **The failing edge is missing from the payload.** `write -> api` — the edge the diagnostic is
   about — is **absent** from `partialLayout.edges` (the array holds the other 9 edges). The
   payload shows where the *other* edges went, not where the failing edge could have gone.
2. **For the failure class this project actually hit first (ambiguous-corridor), the payload
   added nothing**: base and candidate `--layout-json` outputs are byte-identical, because a
   measured plan already exists there and is returned in full by both.

## 5. Honest negative findings

1. **For this project, the candidate's `partialLayout` reduced rework by exactly zero rounds.**
   Both sides needed 3 repair rounds and 4 `finalize` invocations, and both converged on the
   **same final JSON bytes** (`4262bb0c…`) and the **same diagram SVG bytes** (`4211527e…`).
   The partialLayout payload is not on the `finalize` channel at all, so it could not have
   shortened this loop.
2. **All three failure diagnostics were byte-identical between the two CLIs.** The #934 change is
   invisible to an agent that only reads `finalize` receipts.
3. **The candidate's `totalElapsedSec` (98.5 s vs 243.7 s) is a learning/ordering artifact, not a
   tool effect.** The base chain was the first time I read this CLI's diagnostic vocabulary; the
   candidate chain reused that understanding. The CLI time itself is a wash
   (4.248 s base vs 4.433 s candidate for the four finalize calls).
4. **The base's `workflow/route-preset-conflict` diagnostic had an empty `supportedFixes` array**
   and offered no concrete next step. The candidate's was also empty — #934 did not improve this.
5. **The base and candidate HTML artifacts are not byte-identical** (different `sha256`) even for
   identical input, because the embedded **Viewer runtime** differs (`archify 3.2.0` vs
   `archify 3.2.1-dev.1`). The **diagram SVG is byte-identical**, so this is not a diagram
   difference.
6. **Inconclusive:** one project, one diagram, three failure classes. The `partialLayout` payload
   may help materially on other failure classes (its `evidence.verifiedRepair` hint at
   `workflow-compiler.mjs:6055` never fired here), but this slice cannot show it. The base's
   `route-preset-conflict` empty `supportedFixes` is the clearest remaining gap.

## 6. Accuracy and readability of the final diagram

**Factual / topological accuracy — checked against the pinned revision, all claims hold:**

| Diagram claim | Source at `95f9a388` |
|---|---|
| kube-apiserver is the authoritative store the client lists/watches | `staging/src/k8s.io/client-go/tools/cache/listwatch.go:235-262` |
| Reflector: LIST then WATCH | `staging/src/k8s.io/client-go/tools/cache/reflector.go:470-509` |
| DeltaFIFO → local cache store; distributes add/update/delete | `…/cache/delta_fifo.go:562-575`; `…/cache/shared_informer.go:1106-1141` |
| Event handler registered on the deployment informer; `addDeployment` enqueues | `pkg/controller/deployment/deployment_controller.go:124-135`, `202-206` |
| `KeyFunc = cache.DeletionHandlingMetaNamespaceKeyFunc` → namespace/name key | `pkg/controller/controller_utils.go:109-112` |
| Rate-limiting workqueue, per-item exponential limiter | `…/deployment_controller.go:111-117`; `…/workqueue/default_rate_limiters.go:48-56` |
| "max 15 requeues" | `…/deployment_controller.go:54-59` (`maxRetries = 15`) |
| worker → `processNextWorkItem` → `syncHandler` | `…/deployment_controller.go:480-498` |
| `syncDeployment`: read from the informer cache, claim ReplicaSets | `…/deployment_controller.go:575-627`, `522-550` |
| scale + status: `Update` ReplicaSet / `UpdateStatus` Deployment | `pkg/controller/deployment/sync.go:407-434`, `479-490` |
| `handleErr` → `AddRateLimited`, then `Forget` | `…/deployment_controller.go:500-520` |
| Write-back lands in the API server and is observed again via the watch | `sync.go:423,488` + reflector watch |

Direction is right throughout, and the loop is genuinely closed: the write-back edge points *into*
kube-apiserver and the watch edge points *out* of it. Two honest caveats: the diagram does not
show the **ReplicaSet controller** (the Deployment controller's own downstream control loop) —
out of the asked scope, but a reader could over-read "scale + status" as the whole control loop;
and the "list / watch" edge compresses the initial LIST-then-WATCH into one arrow, which is
accurate but hides that the reflector does a LIST before attaching the WATCH.

**Label readability — passing but tight.** `visual-check` reports
`readability.status = pass` with `minimumProjectedNodeTextPx = 6` at 1440×900. 6px is the
documented *failure floor*; the authoring guidance aims for ≈7.5px for ordinary context text at
that viewport, so the sublabels ("authoritative Deployment/ReplicaSet store",
"exponential backoff, max 15 requeues") sit at the floor rather than comfortably above it. Node
labels are clearly legible; the smallest sublabels are the tightest.

**Routing readability — good.** No unrelated-edge merges (the `composition/ambiguous-corridor`
gate passes). The repaired `sync -> retry` error edge exits `syncDeployment`'s **left** side and
runs down the corridor immediately left of the "scale + status" box — it does not cross the
happy path. The write-back edge exits "scale + status" on the right, runs up the right margin
outside all lane content and enters kube-apiserver's right side. The `retry -> queue` edge runs
vertically up from the exception lane into the workqueue. One minor tightness: the
`queue.Add(key)` edge label sits ~10px from the Event handler's right border.

**Containment.** `overflowX: false`; `overflowY: true` is accepted as
`"readable-vertical-scroll"` with `readerFit: "width-first"`. At 1440×900 the page scrolls
vertically and the `handleErr` node sits just below the fold; the 2048×1320 capture shows the
whole diagram plus the legend. Both cards ("Retry budget", "Reads come from the cache") are
present in the HTML below the diagram.

## 7. Files written

```
task-prompt.md                     the authoring task prompt
revision.txt                      pinned revision
report.json                       measurements (schema per the brief)
comparison.md                     this file
base/01-draft.workflow.json       first draft (identical bytes on both sides)
base/02-repair-1.workflow.json    fail → schema/maxLength
base/03-repair-2.workflow.json    fail → composition/ambiguous-corridor
base/04-repair-3.workflow.json    PASS
base/out-01..04.finalize.json     raw receipts (failures kept)
base/out-01..04.finalize-summary.json
base/out-01..03.delivery-pending.json
base/out-04.browser-check.json
base/out-04.html                  delivered artifact
base/commands.log                 every command + exit + elapsed
base/repairs.md                   repair log
base/replay-of-candidate-final.json   replay receipt (candidate JSON vs base CLI)
candidate/01..04-repair-*.workflow.json
candidate/out-01..04.*            raw receipts (failures kept)
candidate/out-04.html             delivered artifact
candidate/commands.log
candidate/repairs.md
candidate/replay-of-candidate-final.json  replay receipt (candidate JSON vs candidate CLI)
screenshots/base/*.png|.json|.html   visual-check captures (1440×900 and 2048×1320, light+dark)
screenshots/candidate/*.png|.json|.html
layout-json/base-*.layout.json        validate --layout-json outputs on the failing inputs
layout-json/candidate-*.layout.json
```

Nothing under `/tmp/archify-base/`, `/tmp/archify-960/archify/` or `evidence/harness.sh` was
modified. No commit or push was made.

# express — Workflow authoring comparison: base vs candidate (#934 partialLayout)

- **Repo:** https://github.com/expressjs/express
- **Pinned revision:** `0dee2c52c7c873498f8ed7d8ee4ddd0a04d3ada8` (master, express 5.3.0)
- **base CLI:** `/tmp/archify-base/archify/bin/archify.mjs` (`main` @ `25cf3708`)
- **candidate CLI:** `/tmp/archify-960/archify/bin/archify.mjs` (`dev` + the #934 partialLayout change)
- **Model:** MiniMax-M3
- **Settings:** `--quality showcase`, `schema_version: 2`, `--json` receipts, `--repo-root` pointing at the
  pinned checkout so repository evidence is verified, `visual-check` at 1440×900 / 1600×1000 /
  1920×1080 / 2048×1320 in light and dark.

---

## 1. The task

`task-prompt.md` asks one question: **how does an HTTP request flow through this codebase?** —
from the Node HTTP server, through `app.handle()`, into the router and the middleware stack, out
to a route handler, and back out through the response helpers — plus the error path, where
`next(err)` reaches the default final handler instead of a normal response. The prompt pins the
scope to the request lifecycle, requires every claim to carry an inspected `sources` range from
`lib/`, and explicitly asks the author to say where path matching actually happens, because
**Express 5 has no `lib/router/` any more**.

That last point is a real property of the pinned revision, and it shaped the diagram:

```
$ ls src-express/lib/
application.js  express.js  request.js  response.js  utils.js  view.js
```

Path matching moved to the external npm package `router` (`package.json:57` → `"router": "^2.2.0"`,
required at `lib/application.js:26` and instantiated lazily at `lib/application.js:69-82`). The
diagram says so in a card rather than inventing a router module.

### What the diagram shows

Four lanes over six columns:

| Lane | Nodes |
|---|---|
| 01 Network Boundary | HTTP Client → Node HTTP Server (`http.createServer(app)`, `lib/application.js:598-606`) |
| 02 Express Application | `app.handle()` → Router Dispatch → Middleware Stack → Route Handler (`lib/application.js:152-178`, `69-82`, `190-244`, `471-482`) |
| 03 Request / Response Objects | Request Object (the `app.request` / `app.response` prototypes, `lib/express.js:44-52`) → `res.send() / res.json()` (`lib/response.js:126-222`) |
| EX Error Handling | `finalhandler` — the `done` callback built in `app.handle()` (`lib/application.js:152-157`) |

Nine edges. The success path is solid green and labelled; the two error paths
(`Middleware Stack → finalhandler`, `Route Handler → finalhandler`) are red dashed, so the error
path is visually distinct as the prompt required. `mainPath` is
`client → server → handle → router → mw → route → send`.

---

## 2. Comparison table

| | **base** (`25cf3708`) | **candidate** (#934 partialLayout) |
|---|---|---|
| repair rounds | 1 | 1 |
| `finalize` invocations | 2 (1 fail, 1 pass) | 2 (1 fail, 1 pass) |
| delivered? | **yes** — `base/02-repair-1.html` | **yes** — `candidate/02-repair-1.html` |
| `cliExecSec` (authoring loop only) | **2.716 s** (0.466 + 2.250) | **2.581 s** (0.473 + 2.108) |
| `totalElapsedSec` (wall clock, first finalize → delivery) | **213.0 s** | **15.1 s** ⚠ *confounded, see §5* |
| agent-side repair-loop wall clock | 201 s | 14 s ⚠ *confounded, see §5* |
| failure feedback received by the authoring agent | 2 diagnostics, **no geometry** | 2 diagnostics, **no geometry — identical to base** |

### The failure feedback, quoted verbatim

Both sides received **the same two diagnostics with byte-identical text**. From
`base/commands.log` and `candidate/commands.log`, round 0:

`composition/ambiguous-corridor`

> `[composition/ambiguous-corridor] showcase workflow edges[6] id "route-send" "route" -> "send" shares a 26px corridor with edges[7] id "mw-final" "mw" -> "final" at [737.6, 302] -> [737.6, 328] (segments 2 and 0; minimum 8px) — adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge.`

with evidence `{"overlapLengthPx":26,"minimumPx":8,"segmentIndex":2,"otherSegmentIndex":0}` and
supportedFixes `["adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge"]`.

`layout/constraint`

> `mainPath step "route" -> "send" moves backward from col 5 to 4 — use a return edge outside mainPath for loops.`

**That is the entirety of the failure feedback the authoring agent got on either side.** The
frozen replay receipts prove it:

- `base/replay-of-shared-draft-finalize.json` and `candidate/replay-of-shared-draft-finalize.json`
  have the same key set (`artifact, browserCheck, command, diagnosticSummary, diagnostics,
  durationMs, evidence, failedStage, gates, nextAction, ok, quality, schemaVersion,
  specification, status, type, update, visualReview`).
- `"partialLayout" in base_receipt` → **False**. `"partialLayout" in candidate_receipt` → **False**.
- After removing only the artefact path, specification sha256, update notice and timing fields,
  the two receipts compare **equal**.

### The repair each side applied

Both sides made the same three changes, for the same reasons:

1. `send` moved col 4 → col 5 — the `layout/constraint` diagnostic names the backward mainPath
   step; `route` is fixed at col 5, so the response helper has to move forward.
2. `final` moved col 5 → col 4 — with `send` at col 5, keeping `final` at col 5 would stack the
   handler's two downward targets in one column, so `route → final` would descend through `send`.
3. edge `route-final` re-pinned from `fromSide:"bottom"/toSide:"top"` to
   `fromSide:"right"/toSide:"right"/route:"outside-right"` — the edge the corridor diagnostic
   implicated alongside `mw-final`.

The resulting candidate JSONs are **semantically identical** (verified by JSON-parse comparison;
only JSON formatting whitespace differs), and the four `visual-check` PNG captures are
**byte-identical** on both sides (same sha256 for the 1440×900 light/dark and 2048×1320
light/dark captures).

---

## 3. Did the candidate's `partialLayout` carry usable geometry?

**In the `finalize` channel: no — it was not present at all.** The #934 change attaches
`partialLayout` to the compiler's failure object, and `renderers/workflow/render-workflow.mjs`
merges it into the payload **only on the `--layout-json` branch**:

```js
const payload = (!compiled.ok && compiled.partialLayout)
  ? { ...compiled.receipt, partialLayout: compiled.partialLayout }
  : compiled.receipt;
```

`finalize` runs the renderer *without* `--layout-json`, and `bin/finalize.mjs`'s
`compactFinalizeReceipt` rebuilds the summary from `code / severity / message / subject /
evidence / supportedFixes` only. So the geometry never reaches a `finalize` receipt — on either
side.

**In the `validate --layout-json` channel: partly yes, and it depends entirely on the failure
class.** I ran the frozen shared draft through `validate --layout-json` on both CLIs and
compared the receipts field by field.

### 3a. The failure this project actually hit — `composition/ambiguous-corridor`

`base/replay-of-shared-draft-layout-json.json` (7 003 bytes) vs
`candidate/replay-of-shared-draft-layout-json.json` (66 004 bytes).

Base receipt top-level keys: `columns, contract, diagnostics, edges, labels, nodes, ok,
requiredViewBox, viewBox`.
Candidate receipt top-level keys: the same **plus `partialLayout`**.

The candidate's `partialLayout` is:

- `partial`: `true`
- `columns`: `[94, 267.6, 387.6, 571.6, 737.6, 882.4000000000001]` — **byte-identical** to the
  base receipt's top-level `columns`.
- `nodes`: 9 frames — **byte-identical** to the base receipt's top-level `nodes`, e.g.
  `{"id":"mw","lane":"app","col":4,"x":685.6,"y":217,"width":104,"height":52}`,
  `{"id":"send","lane":"objs","col":4,"x":661.6,"y":341,"width":152,"height":52}`.
- `edges`: all 9 edges, and **every edge's chosen `points` is byte-identical** to the base
  receipt's `edges[].points`. The only new data is `attemptedCandidateFamilies`.

So for *this* failure class the candidate's payload **duplicates geometry the base already
published** and adds one new field: the routing-family menu per edge, with real candidate
polylines, e.g. for `mw-final`:

```
lane-gap-corridor   [[737.6,217],[737.6,201],[737.6,352],[820.4,352],[820.4,491],[836.4,491]]
column-gap-corridor [[737.6,217],[737.6,201],[787,201],[787,491],[836.4,491]]
outside-right       [[737.6,217],[737.6,201],[953,201],[953,491],[820.4,491],[836.4,491]]
```

That is genuinely useful — it shows the router's menu of alternatives at the failing corridor —
but it is **not** the "rejected candidate points" the PR description implies for *this* edge: both
`route-send` and `mw-final` had already routed successfully (4 points each), and the failure was
raised by a composition check *after* routing. The base receipt already contained both polylines,
so the new field is explanatory rather than decisive.

### 3b. The failure class #934 actually targets — route feasibility

I ran two supplementary probes (in `probes/`, outside the measured authoring loop) that trigger
route-feasibility failures, and here the difference is large:

| Probe | base `validate --layout-json` | candidate `validate --layout-json` |
|---|---|---|
| `probe-pin-conflict` (`workflow/route-preset-conflict`) | `["contract","diagnostics"]` — **no geometry at all** (1 066 bytes) | + `partialLayout`: columns, 9 node frames, 6 routed edges (41 864 bytes) |
| `probe-route-crossing` (`workflow/explicit-pin-conflict`) | `["contract","diagnostics"]` — **no geometry at all** | + `partialLayout`: columns, node frames, 6 edges **including the failing edge** with its 4 offending points |

So for genuine route-feasibility failures the candidate's `partialLayout` is a **real and
substantial improvement over base**: the base receipt for those failures carries *no geometry
whatsoever*, while the candidate carries the decided column grid, the placed node frames, the
cached route points of every edge that routed, and — in the explicit-pin-conflict case — the
offending polyline of the failing edge itself.

### 3c. Two gaps in the payload worth recording

- **The failing edge is not always in the payload.** In `probe-pin-conflict` the failing edge
  `route-final` is **absent** from `partialLayout.edges` (6 of 9 edges present). The
  `route-preset-conflict` path never calls `capturePartialLayoutFailedCandidates`, and the
  diagnostic filter in `buildPartialLayoutPayload` only admits
  `workflow/explicit-pin-conflict` and `workflow/solver-budget-exhausted`, so no fallback entry
  is produced for it.
- **`attemptedCandidateFamilies` is not "the rejected candidates for the failing edge".** For
  edges that routed successfully it is the router's generic family menu (17 entries for
  `mw-final` in `probe-pin-conflict`, with repeated `lane-gap-corridor` / `column-gap-corridor`
  variants at different channel offsets). Only edges that actually hit a router throw carry
  genuinely rejected candidates.

---

## 4. Honest negative findings

1. **The candidate was NOT better in the measured authoring loop.** Repair rounds (1 vs 1),
   `finalize` invocations (2 vs 2) and delivery (yes vs yes) are identical, and the
   `finalize` failure feedback is **byte-identical** between the two CLIs. For an authoring agent
   driving `archify finalize workflow`, #934 changes nothing.
2. **The candidate's `partialLayout` was not visible where the authoring agent looks.** It is
   reachable only through `archify validate workflow <file> --layout-json`, never through
   `finalize`. An agent that repairs from the `finalize` receipt — the workflow the task prompt
   describes ("passes `archify finalize workflow`") — never sees it.
3. **On the failure this project actually hit, `partialLayout` was largely redundant.** The base
   `validate --layout-json` receipt already carried the same column grid, the same node frames
   and the same routed points; the candidate duplicated them byte-for-byte and added only
   `attemptedCandidateFamilies`.
4. **Both sides converged on the same repair**, so this slice cannot discriminate between the two
   CLIs on authoring quality. It can discriminate on *diagnostic richness*, and only in the
   `--layout-json` channel.
5. **The wall-clock difference is an artefact of my method, not of the CLIs.** The base side's
   213 s / 201 s figures absorb the one-time shared cost — reading the express source, writing
   `task-prompt.md`, authoring the first draft, and working out the first repair from the
   diagnostics. The candidate side ran second, with that analysis already done, so its
   15 s / 14 s figures are not comparable. The only comparable timing is `cliExecSec`
   (2.716 s vs 2.581 s), and that difference is noise. **This slice produces no usable
   rework-rate signal**; the two CLIs gave the same agent the same information.
6. **Inconclusive:** with a single project, one draft, one failure class and one repair round, I
   cannot say how often the #934 payload would carry the missing "rejected candidate points" for
   the *failing* edge. Two of my three failure classes put nothing about the failing edge into the
   payload; only the explicit-pin-conflict class did.

---

## 5. Quality check of the final diagram

Both sides produced the same diagram, so this check applies to both.

**Factual / topological accuracy — good.** Every asserted hop is backed by an inspected range:
`app(req, res)` → `app.handle` (`lib/express.js:37-39`); `app.handle()` → router dispatch
(`lib/application.js:177`); `app.handle()` → request/response prototypes
(`lib/application.js:169-170`, `lib/express.js:44-52`); `app.use()` → middleware
(`lib/application.js:190-244`); `app.get(path, fn)` → route handler (`lib/application.js:471-482`);
`res.send()` / `res.json()` (`lib/response.js:126-222`); `finalhandler` as `done`
(`lib/application.js:152-157`); `http.createServer(app)` (`lib/application.js:599`). The claim
that matching lives in the npm `router` package is correct for this revision and is stated in a
card. Two minor imprecisions: the card says *"logerror prints the error unless NODE_ENV is test"*
— the code tests the app's `env` **setting** (`lib/application.js:617`), which merely defaults
from `NODE_ENV` (`lib/application.js:91,96`); and the `Middleware Stack → finalhandler` edge is
drawn as a direct hop, while in the source the error passes back through the router to `done`.

**Label readability — acceptable but tight.** `visual-check` reports
`minimumProjectedNodeTextPx: 6.6` and `minimumProjectedEdgeTextPx: 8`, with
`minimumProjectedNonEdgeTextPx: 6.6`. 6.6 px clears the 6 px failure floor but sits below the
7.5 px target in the authoring defaults, and the node subtitles are the first thing to shrink.
Edge labels are legible in the captures. No horizontal overflow at any of the four measured
viewports; the page uses an accepted reader vertical scroll.

**Routing readability — good.** The success path is a clean left-to-right chain. The two error
edges are unambiguous: the handler's `next(err)` leaves on the right, runs the outside-right
corridor and enters `finalhandler` from the right; the middleware's `next(err)` drops straight
down the empty column-4 corridor. The red dashed styling separates the error path from the
green success path at a glance. `visual-check` reported `diagnostics: []`, `containment: pass`
and `viewerChromeOk: true` at every viewport.

---

## 6. Files

See the handoff list in the parent report. Artefacts for this slice live under
`/tmp/archify-960/evidence/projects/express/`:

```
task-prompt.md
revision.txt
report.json
comparison.md
base/01-draft.workflow.json        base/02-repair-1.workflow.json
base/01-draft.html                  base/02-repair-1.html
base/repairs.md                     base/commands.log
base/replay-of-candidate-final.json base/replay-of-shared-draft-finalize.json
base/replay-of-shared-draft-layout-json.json
candidate/… (same set)
screenshots/base/…  screenshots/candidate/…
probes/probe-pin-conflict.workflow.json  probes/probe-route-crossing.workflow.json
probes/base/…  probes/candidate/…
timing/base-loop-start.epoch.txt  timing/candidate-loop-start.epoch.txt
```

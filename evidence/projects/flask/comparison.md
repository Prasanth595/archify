# Flask — Workflow authoring comparison (base vs candidate)

Issue #934 / PR #960 · slice: **flask** · `https://github.com/pallets/flask` @
`d086db856be187255b8ec61ef409357393020f32`

- **base**: `tt-a1i/archify` @ `25cf3708` (`main`) — **unmodified during this slice**
  (`/tmp/archify-base/archify/bin/archify.mjs`, mtime 23:51:25)
- **candidate**: `tt-a1i/archify` @ `dev` + `archify/issue-934-partial-layout` @ `c64d4294`
  (self-reported `3.2.1-dev.1`) — **modified at 00:30:22 mid-slice**; see §3a
- Both CLIs run the same zero-dependency command:
  `node <side>/archify/bin/archify.mjs finalize workflow <candidate.json> <out.html> --quality showcase --json --repo-root <src-flask>`

> **⚠️ The candidate CLI changed while this slice was running.** At 00:30:22
> `archify/bin/archify.mjs`, `archify/renderers/workflow/render-workflow.mjs` and
> `archify/renderers/shared/diagnostics.mjs` were re-wired to publish `partialLayout` into
> the `finalize` receipt. The candidate chain was first run against the **pre-update** build
> (00:24–00:28) and was then **re-run** against the current build (00:36–00:38). The
> pre-update receipts are preserved verbatim in `candidate/pre-0030-cli/`. The base CLI was
> not touched, so the base results stand unchanged. Every number below for the candidate
> side refers to the **post-update** build.

---

## 1. The task and what the diagram shows

**Task prompt** (full text in `task-prompt.md`):

> Using the Flask source in this repository, produce a **Workflow diagram** that explains how a
> single HTTP request travels through Flask.
>
> Cover, with the real method names and the file each one lives in:
> 1. The WSGI server calling the Flask application object.
> 2. How the request/app context is created and pushed, including where the URL is matched
>    and where the session is opened.
> 3. The dispatch stage: `before_request` hooks, the view function call, and how the view's
>    return value becomes a response.
> 4. The response stage: response construction, `after_request` hooks, and where the session
>    is saved.
> 5. The exception path: a registered error handler versus an unhandled error that becomes a 500.
> 6. The teardown that runs when the request context is popped, including what runs on the
>    success path as well as the error path.
>
> Also show where a blueprint's `before_request` / `after_request` hooks are invoked relative
> to the application-level hooks, because Flask runs them in a different order.
>
> State the real method names on the nodes, and attach the repository-relative source location
> for every stage you assert.

The authored diagram is a 6-lane, 12-node, 14-edge Workflow: `WSGI Server` →
`Flask Application` → `URL Routing` → `View Function` → `EX / Error Handling` (exception
lane) → `Context Teardown`. The happy path runs left to right
(`wsgi-server → wsgi-app → request-ctx → ctx-push → dispatch → view-call → finalize →
wsgi-response`); `url_adapter.match()` hangs off `ctx.push()`, the two exception handlers
hang off `full_dispatch_request`, and `ctx.pop(error)` hangs off `finalize_request`. Two
cards carry the blueprint hook order and the response/teardown ordering, because the 6-column
grid has no room for them as nodes. Every node carries repository-relative `sources`.

---

## 2. Comparison table

| | **base** (`25cf3708`) | **candidate** (`dev` + #934, post-update) |
|---|---|---|
| Repair rounds | **2** (`02-repair-1`, `03-repair-2`) | **2** (`02-repair-1`, `03-repair-2`) |
| `finalize` invocations | **3** (2 failed, 1 passed) | **3** (2 failed, 1 passed) |
| Delivered | **yes** — `ok: true`, `status: pass`, all 4 gates pass | **yes** — `ok: true`, `status: pass`, all 4 gates pass |
| CLI exec, authoring loop | **4.696 s** (1.119 + 0.960 + 2.617) | **4.370 s** (0.861 + 0.875 + 2.634) |
| CLI exec, incl. replays | 10.943 s (two replay rounds) | 7.723 s |
| Operator wall-clock (est.) | ~1100 s | ~630 s ⚠️ **confounded**, see §5.4 |
| Final artifact | 835 469 B, sha256 `12d291c0…` | 838 265 B, sha256 `7066a0ca…` |
| Final SVG geometry | 35 540 B, sha256 `832402734135f16d` | 35 540 B, sha256 `832402734135f16d` — **identical** |

### What the failure feedback gave the authoring agent on each side

**The diagnostic text is identical on both sides.** Replaying `01-draft.workflow.json`
through both CLIs (`base/replay-of-draft-01.json`, `candidate/replay-of-draft-01.json`) gives
the same `specification.sha256`
(`91067d14a5f5d8fdaecabde88db20fdac9f703676e8980caa007a222234552cb`), the same
`diagnostics[0].evidence` object byte for byte, the same `supportedFixes`, and the same
`nextAction`:

> `[composition/ambiguous-corridor] showcase workflow edges[0] id "wsgi-call" "wsgi-server" -> "wsgi-app" shares a 35px corridor with edges[10] id "unhandled-exception" "dispatch" -> "user-exception" at [199, 201] -> [234, 201] (segments 3 and 1; minimum 8px) — adjust route/via, bias, or channel coordinates so unrelated edges do not visually merge.`

```json
{"otherRelationship": {"diagramType": "workflow", "collection": "edges", "index": 10,
                       "id": "unhandled-exception", "from": "dispatch", "to": "user-exception"},
 "overlapLengthPx": 35, "minimumPx": 8, "from": [199, 201], "to": [234, 201],
 "segmentIndex": 3, "otherSegmentIndex": 1}
```

```json
{"action": "edit-in-place", "candidate": ".../01-draft.workflow.json",
 "constraint": "Preserve unaffected semantics and geometry; apply each diagnostic's supportedFixes, or the fix its message names, and do not replace the whole candidate.",
 "then": "finalize-once"}
```

**The difference is what else the failure receipt carries:**

| failure-feedback surface | base | candidate (post-update) |
|---|---|---|
| stdout JSON of `finalize --json` | diagnostic only | diagnostic only — **still no geometry** |
| `<out>.finalize-summary.json` | diagnostic only | diagnostic only — **still no geometry** |
| `<out>.finalize.json` (full receipt, referenced by `evidence.receipt`) | no geometry | **`stages.validate.receipt.partialLayout`** — column grid, 12 node frames, 14 edges, 17 candidate families on 10 of them |
| `validate --layout-json` | columns / nodes / edges / labels, **no** `partialLayout` | the same **plus** `partialLayout` |

The base side had to *infer* the geometry. The one piece of geometry the base chain ever saw
came from a different diagnostic class, raised by its round-1 `fromSide`/`toSide` pin
attempt:

> `Workflow edge "unhandled-exception" has explicit geometry that violates explicit route-route crossing.`
> `evidence.routeSegments: [{"edge": "pop-context", "from": [1187.2, 243], "to": [1187.2, 739]}, {"edge": "unhandled-exception", "from": [808.4, 285], "to": [1319.4, 285]}]`

---

## 3. Did the candidate's `partialLayout` payload carry usable geometry?

### 3a. Delivery status — it reached the receipt, but only one layer down

Against the **current** candidate CLI the payload **is** in the failure receipt, but at
`stages.validate.receipt.partialLayout` in the **full** receipt file
(`<out>.finalize.json`), not in the stdout JSON and not in `<out>.finalize-summary.json`.
An authoring agent that captures the `--json` stdout (the natural thing to do, and what the
harness logs) sees **exactly what base shows**; an agent that follows `evidence.receipt`
to the full receipt file sees the payload.

Against the **pre-update** candidate build (the state the slice started with), the payload
was in **no** receipt at all — only in `validate --layout-json`. Evidence: the preserved
`candidate/pre-0030-cli/` receipts, in which `"partialLayout" in receipt` is `False`.

### 3b. What the payload contains (actual fields, from the current candidate CLI)

**Column grid** — `partialLayout.columns`:

```json
[134, 254, 399.6, 559.6, 794.4000000000001, 990.8000000000001]
```

**Node frames** — `partialLayout.nodes`, all 12 nodes:

```json
{"id": "dispatch",         "lane": "flask",    "col": 4, "x": 724.4000000000001, "y": 217, "width": 140, "height": 52}
{"id": "view-call",        "lane": "view",     "col": 4, "x": 732.4000000000001, "y": 465, "width": 124, "height": 52}
{"id": "user-exception",   "lane": "error",    "col": 4, "x": 724.4000000000001, "y": 589, "width": 140, "height": 52}
{"id": "ctx-pop",          "lane": "teardown", "col": 5, "x": 910.8000000000001, "y": 713, "width": 160, "height": 52}
```

**Cached route points** — `partialLayout.edges[].points` for the 4 edges that routed
cleanly, e.g. `build-context` → `[[300, 243], [351.6, 243]]`.

**Rejected candidate points** — `partialLayout.edges[].attemptedCandidateFamilies`, 17
families for each of the 10 edges that went through the router's search:

```json
{"id": "unhandled-exception", "from": "dispatch", "to": "user-exception",
 "attemptedCandidateFamilies": [
   {"family": "facing-straight",          "points": [[794.4, 217], [724.4, 615]]},
   {"family": "horizontal-then-vertical", "points": [[794.4, 217], [724.4, 217], [724.4, 615]]},
   {"family": "lane-gap-corridor",        "points": [[794.4, 217], [794.4, 201], [794.4, 414],
                                                    [708.4, 414], [708.4, 615], [724.4, 615]]},
   {"family": "outside-left",             "points": [[794.4, 217], [794.4, 201], [20, 201], [20, 615], [724.4, 615]]},
   ... 13 more families ...
 ],
 "points": [[794.4, 217], [794.4, 201], [199, 201], [199, 657], [794.4, 657], [794.4, 641]]}
```

Read against the node frames this is genuinely diagnostic: `view-call` occupies
`x 732.4 … 856.4` directly under `dispatch` (`x 724.4 … 864.4`), so every straight and
column-gap candidate for `dispatch → user-exception` crosses it, and the router's fallback
was a **511 px leftward detour along `y = 201`** — the same corridor `wsgi-call` runs in.
That is precisely the merge the diagnostic reported.

**So: yes, the payload carried usable information — the column grid, the node frames, the
cached route points and the rejected candidate points are all there, and they are what made
the root cause readable.**

### 3c. But base's plan inspector already returns most of it

Running the *same* `validate --layout-json` probe on the base CLI
(`base/01-draft.layout-json.json`) and diffing against the candidate
(`candidate/01-draft.layout-json.json`):

| field | base | candidate |
|---|---|---|
| `contract` | `readable-v2` | identical |
| `viewBox` / `requiredViewBox` | `[1097, 900]` / `[1206, 900]` | identical |
| `columns` | `[134, 254, 399.6, 559.6, 794.4, 990.8]` | identical |
| `nodes` | 12 full frames | identical |
| `edges` | 14 edges, each with final routed `points` | identical |
| `labels` | 14 label boxes with `x/y/width/height` | identical |
| `diagnostics` | identical | identical |
| **`partialLayout`** | **absent** | **added** |

Every top-level field matched byte for byte; `partialLayout` was the **only** difference.
So the *marginal* content of #934 over the already-shipped author-facing plan inspector is
the **rejected candidate families** — the column grid, the node frames and the cached route
points were already available on `main`.

### 3d. The rejected candidate points were **not directly actionable**

Candidate round 1 did the one repair only `partialLayout` makes possible: pin the router's
own verified-clear corridor as a `via` waypoint — `via: [[708.4, 414]]`, the `x` used by the
router's `lane-gap-corridor` candidate, which clears `view-call`'s left edge by 24 px.

It failed:

> `Workflow edge "unhandled-exception" has explicit geometry that violates orthogonal route segments.`
> `evidence: {"invariant": "orthogonal route segments", "conflictingPins": [{"edge": "unhandled-exception", "field": "via", "path": "/edges/10/via", "value": [[708.4, 414]]}], "segmentIndex": 0, "from": [726.4, 269], "to": [708.4, 414]}`

> `Preserving absolute workflow geometry disables automatic node widening: 10 node(s) with omitted widths also have text-fit problems. Explicit widths can preserve their full text, but changing widths moves endpoints, so route coordinates must be remeasured.`
> `evidence.affectedNodes[0]: {"node": "wsgi-server", "currentWidthPx": 92, "automaticWidthPx": 172, "problems": ["Sublabel \"calls app(environ, start_response)\" needs ~123px at the 6px legible minimum, but node \"wsgi-server\" provides 84px — shorten the sublabel or increase node.width."]}`

Any absolute `via` pin switches the document out of the readable-v2 auto-widening contract
into the pinned-geometry contract, which drops 10 nodes back to their 92 px default width
and breaks their text fit. **The coordinates in `partialLayout` are only valid in the
unpinned layout that produced them** — so the payload's most distinctive content is not
directly re-usable as geometry. Evidence kept in `candidate/02-repair-1.layout-json.json`.

---

## 4. What the final diagram shows

A 6-lane, 12-node, 14-edge Workflow of one Flask request:

```
01 / WSGI Server        wsgi-server  ──WSGI call──▶  wsgi-app
02 / Flask Application wsgi-app ─environ─▶ request-ctx ─ctx.push()─▶ ctx-push
                                              ─full_dispatch_request─▶ dispatch
                                              ┌─match_request()─▶ url_adapter.match()  (03 / URL Routing)
                                              └─url_rule, view_args─┘
                                              dispatch ─ensure_sync─▶ view function   (04 / View Function)
                                              dispatch ──▶ finalize_request ──return value──┘
                                              dispatch ─unhandled exception─▶ handle_user_exception
                                                                        ─handler response─▶ finalize_request
                                                                        ─re-raise─▶ handle_exception
                                                                                       ─from_error_handler=True─▶ finalize_request
                                              finalize_request ─response + start_response─▶ wsgi-response
                                              finalize_request ─finally: ctx.pop(error)─▶ ctx.pop(error)  (06 / Context Teardown)
EX / Error Handling     handle_user_exception / handle_exception
```

The two cards carry the facts the 6-column grid could not hold as nodes: the blueprint hook
order (`before_request`: app-level first then blueprints outermost → innermost;
`after_request`: blueprints innermost → outermost then app-level) and the response/teardown
ordering (`response(environ, start_response)` before `ctx.pop(error)`;
`handle_exception` ends in `finalize_request(from_error_handler=True)`).

---

## 5. Honest negative findings

### 5.1 The candidate side was **not better**

Both sides took **2 repair rounds** and **3 `finalize` invocations**, and **both delivered**.
CLI time is marginally better on the candidate (4.370 s vs 4.696 s) — inside the noise of
three 1–3 s runs. **No rework reduction was observed.**

### 5.2 `partialLayout` is still not in the feedback an agent usually reads

Even after the mid-session re-wiring, `partialLayout` is **absent from the stdout JSON of
`finalize --json`** and from `<out>.finalize-summary.json`. It is present only in the full
receipt file `<out>.finalize.json`, one indirection away via `evidence.receipt`. A harness
or agent that captures stdout — which is what `evidence/harness.sh` does — records no
geometry at all.

### 5.3 The payload's unique content was not actionable, and cost a round

The rejected candidate families are the only thing #934 adds over `main`'s plan inspector,
and pinning them as geometry failed on round 1 (`workflow/explicit-pin-conflict` +
`workflow/absolute-geometry-sizing`) because the coordinates belong to the unpinned layout.
The payload made the root cause *legible* (which node blocks which corridor) but did not
shorten the loop.

### 5.4 The wall-clock numbers are confounded and must not be read as a feature benefit

The same operator authored both chains, so the candidate chain started with the base chain's
diagnosis already in hand. Candidate ≈630 s vs base ≈1100 s reflects that operator-memory
advantage, not the tooling. The equal repair-round counts are the meaningful number, and they
are equal.

### 5.5 Inconclusive: would a *delivered* payload reduce rework?

This slice shows (a) that the payload was not delivered to `finalize` until 00:30:22,
(b) that its unique content is the rejected candidate families, and (c) that those are not
directly re-usable as absolute geometry. It cannot show whether a payload that is delivered
in the stdout receipt, and that carries the candidates in a layout-independent form (family
names + clearances rather than absolute points), would cut rework.

### 5.6 Inconclusive: `validate --layout-json` as a repair signal was not run as a third arm

Base's plan inspector already exposes node frames and routed edge points, so a base-side
agent using it would have diagnosed the blocking node on round 0. This slice compares the two
`validate --layout-json` outputs at the field level (§3c) but did not run a third
base-side chain with plan inspection enabled, so the rework-level question for base is
open.

### 5.7 Scope caveat

One repository, one author, one prompt, one diagram. The base CLI's
`workflow/explicit-pin-conflict` diagnostic *does* expose `routeSegments`, which is how the
base chain recovered geometry at round 1; a failure class that emits no geometry at all
would leave the base chain with strictly less than the candidate chain.

---

## 6. Accuracy, label readability and routing readability of the final diagram

Checked against the pinned revision `d086db856be187255b8ec61ef409357393020f32`
(`src/flask/app.py`, `src/flask/ctx.py`, `src/flask/wrappers.py`).

**Factual / topological accuracy — every claim re-verified against the source:**

| diagram claim | source |
|---|---|
| `Flask.__call__` → `wsgi_app` | `src/flask/app.py:1618-1625` |
| `request_context` → `AppContext.from_environ` | `src/flask/app.py:1501-1515` |
| `ctx.push()` opens the session, then matches the URL | `src/flask/ctx.py:416-444`; `_get_session` → `si.open_session` at `ctx.py:381-393` |
| `url_adapter.match()` → `url_rule` + `view_args` | `src/flask/ctx.py:405-414` |
| `full_dispatch_request` → `preprocess_request` → `dispatch_request` | `src/flask/app.py:1014-1016` |
| `view_functions[endpoint](**view_args)` wrapped by `ensure_sync` | `src/flask/app.py:989-990`, `1065-1077` |
| `finalize_request` → `make_response` → `process_response` | `src/flask/app.py:1039-1041` |
| session saved in `process_response` | `src/flask/app.py:1415-1416` |
| `handle_user_exception` → `handle_http_exception` / registered handler / re-raise | `src/flask/app.py:887-893` |
| `handle_exception` → 500 → `finalize_request(from_error_handler=True)` | `src/flask/app.py:941-948` |
| `response(environ, start_response)` before `ctx.pop(error)` | `src/flask/app.py:1604`, `1616` |
| `ctx.pop` → `do_teardown_request` then `do_teardown_appcontext` | `src/flask/ctx.py:490`, `496` |
| `before_request`: app-level first, then blueprints outermost → innermost | `src/flask/app.py:1377` (`names = (None, *reversed(req.blueprints))`) |
| `after_request`: blueprints innermost → outermost, then app-level | `src/flask/app.py:1410` (`chain(ctx.request.blueprints, (None,))`) |

One nuance worth flagging: the `ctx.push()` node says "session + URL match". The source
comment at `ctx.py:437` supports it ("Open the session at the moment that the request
context is available") and `push()` calls `_get_session()` (`ctx.py:439`), which calls
`si.open_session(...)` eagerly — but `AppContext`'s own docstring (`ctx.py:296-297`) says the
session is "loaded the first time it is accessed, rather than when the context is pushed".
The node label is defensible; the surrounding docstring is in tension with it. That is a
source-level ambiguity, not an authoring error.

**Label readability.** Every edge label renders in a legible pill; node labels are bold and
sub-labels monospaced. The containment report gives `minimumProjectedNodeTextPx: 7.3` and
`minimumProjectedEdgeTextPx: 8` at 1440×900, but the top-level
`readability.minimumProjectedNodeTextPx` is **6** — exactly the policy floor ("The 6px
projected-text check is a failure floor; at 1440px, aim for ordinary context text around
7.5px or larger"). The longest sublabels are
`"HTTPException or registered handler"` (35 units) and
`"make_response → process_response"` (32 units). Readable, but at the floor; a production
diagram would shorten them.

**Routing readability.** `visual-check` reports `ok: true`, `status: pass`,
`diagnostics: []`, `overflowX: false`, `overflowDisposition: "readable-vertical-scroll"`,
`readerFit: "width-first"`, `viewBoxWidth: 1129`, `diagramWidth: 1346`, and all six lane
frames at a uniform 124 px. The right-hand channel carries three return edges
(`response + start_response`, `handler response`, `from_error_handler=True`) plus the
`finally: ctx.pop(error)` teardown run; they are parallel and distinct but visually busy on
the far right. The `unhandled exception` edge drops cleanly from `full_dispatch_request`'s
bottom straight into `handle_user_exception`'s top. The `url_rule, view_args` edge leaves
`url_adapter.match()` to the right and rises into `full_dispatch_request`'s bottom — a
readable single bend. At 1440×900 the `Context Teardown` lane falls below the fold and
needs a page scroll; at 2048×1320 the whole diagram is visible.

**Screenshots** — produced with the project's own tool
(`node /tmp/archify-960/archify/bin/archify.mjs visual-check <out.html> --json --out-dir screenshots/<side>`),
Chrome available, 1440×900 and 2048×1320, light and dark, in `screenshots/base/` and
`screenshots/candidate/`. The two sides' PNGs are byte-identical except
`1440x900.light.png` (a reader-chrome scroll/render timing difference; the SVGs are
identical, sha256 `832402734135f16d`). Nothing was fabricated.

---

## 7. Method notes

- Both sides started from the **byte-identical** first draft
  (sha256 `91067d14a5f5d8fdaecabde88db20fdac9f703676e8980caa007a222234552cb`), authored
  from the task prompt and the source, **not** pre-optimised against the validator.
- The **same operator** ran both chains. The base chain used only its own `finalize`
  receipts. The candidate chain additionally used the current candidate CLI's
  `validate --layout-json` — the surface on which #934 publishes `partialLayout` — and that
  probe is preserved as `candidate/01-draft.layout-json.json`.
- The candidate chain was **run twice**: once against the pre-update candidate build
  (preserved in `candidate/pre-0030-cli/`) and once against the post-update build. The
  reported numbers are the post-update run.
- Every failed run is retained: `base/01-draft…`, `base/02-repair-1…`,
  `candidate/01-draft…`, `candidate/02-repair-1…`, every receipt file, and every
  `commands.log` entry.
- `cliExecSec` in `report.json` is the sum of `elapsed=` for the three authoring-loop
  `finalize` calls; the replay invocations are listed separately above.
- `totalElapsedSec` is an operator estimate anchored on file mtimes (base: design from
  ≈00:03, draft 00:10:05, pass 00:21:28 ≈ 1100 s; candidate: first chain 00:21→00:28 plus
  the re-run and payload analysis 00:30→00:39 ≈ 630 s).

---

## 8. What I would tell the maintainer

1. **`partialLayout` was not in the `finalize` feedback at all when this slice started.**
   The candidate build was re-wired at 00:30:22 mid-slice to add it. Even now it is only in
   `<out>.finalize.json` at `stages.validate.receipt.partialLayout` — **not** in the stdout
   JSON of `finalize --json` and **not** in `<out>.finalize-summary.json>`. If the goal is
   for the authoring loop to see it, it should be hoisted to the top level of the receipt
   that `finalize --json` prints.
2. **Even delivered, its unique content over `main` is only the rejected candidate
   families.** The column grid, the node frames and the cached route points are already in
   base's `validate --layout-json`; the diff on identical bytes is exactly one added key.
3. **The rejected candidates are not directly actionable as geometry.** Pinning the
   router's own clear corridor (`via: [[708.4, 414]]`) failed on round 1 because an
   absolute pin disables automatic node widening and breaks 10 nodes' text fit. Reporting
   them as *family name + the obstacle that rejected it* (rather than absolute points) would
   make them usable.
4. **Measured outcome on this slice: no rework reduction.** 2 repair rounds and 3
   `finalize` invocations on both sides, both delivered. The honest read is that the
   payload made the *diagnosis* legible but did not shorten the *loop*.
5. **The most useful geometry in this whole exercise did not come from #934.** It came from
   the base CLI's existing `workflow/explicit-pin-conflict` → `evidence.routeSegments`.
   Extending that style of evidence — actual route segments for the edges involved — to
   `composition/ambiguous-corridor` would help **both** sides more than `partialLayout`
   does today.

---
name: archify
description: >
  Create validated architecture, workflow, sequence, data-flow, lifecycle/state,
  ERD, class, tree, timeline and waterfall diagrams as explorable standalone
  HTML with dark/light themes, motion and image/SVG/WebM export, from
  requirements, Mermaid or repository code. Also turn an answer into a one-page
  explainer with the conclusion first. Use when the user asks "draw the
  architecture of this repo", "diagram this API call flow", "make an ERD of
  these tables", "convert this Mermaid to a diagram", "show the states of an
  order", "show the timeline of this incident", "where did the time go in this
  request", "answer with a page", or when an [archify explainer: ...] rules
  line is in context. Not for dashboards or standalone data charts.
license: Apache-2.0
metadata:
  version: "3.2"
  author: tt-a1i
---

# Archify

Create checked standalone HTML: a native diagram, or a one-page explainer that answers a question.

## Choose the artifact

- The user asks to draw or visualize a system, flow, schema, history or timing → native diagram: follow Native diagram authoring with the Type router.
- The user supplies a frozen candidate → Existing candidate handoff.
- The user supplies Mermaid → Mermaid input, then Native diagram authoring.
- The user asks for the answer as a page (a page, one page, an explainer, something to share) → explainer: read [Explainer authoring](references/explainer-authoring.md), write the complete draft, then run `finalize explainer`. Use panel patch for local content revisions.
- A `[archify explainer: ...]` rules line in context changes when to make a page unasked: follow [Explainer modes](references/explainer-authoring.md#explainer-modes).
- Otherwise answer in text. Chat, one-line answers, raw command output and text-only requests never get a page.

## Working folder

- Run commands from your working directory. Unless the user names another location, give each new artifact request its own folder `.archify/<type>-<slug>-<YYYYMMDD-HHMMSS>/` there (local time, chosen once).
- Keep the candidate and `<slug>.html` in it and reuse it for repairs; a later request gets a new folder.
- Native diagrams use `candidate.json` with `meta.output` relative to the working directory; explainers may use `candidate.archify.md` and a portable output filename.
- Replace `bin/archify.mjs` in every command with the installed package's absolute path, or its path relative to your working directory; CLI input and output paths resolve from that directory.

## Existing candidate handoff

When the user supplies a frozen candidate, run `finalize` first as one CLI invocation. Its passing receipt completes the automated gates; follow any visual review recommendation under Delivery before claiming visual quality. For repair, follow step 5.

## Native diagram authoring

Read branch references only when their stated trigger applies. Before the first candidate, use the authoring references and relevant repository source, not Archify implementation or tests.

1. Choose `architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`, `erd`, `class`, `tree`, `timeline`, or `waterfall` from the question. When the choice is ambiguous, run `node bin/archify.mjs guide "<scenario>" --json`.
2. Read the inputs:
   - Use the exact schema and example paths in the Type router without listing their directories.
   - Read [Authoring defaults](references/authoring-defaults.md) and the mode's example in a bounded batch separate from project documents and complete schemas so neither is truncated; recover any missing section before writing.
   - For Architecture, use the matching showcase example. For every other mode, also read the mode and common schemas.
   - Read the relevant schema definition before choosing any new field, enum, or constrained text, especially boundary kinds.
   - For a real codebase, read [Repository authoring](references/repository-authoring.md) while tracing the requested behavior.
   - Query brands only for an explicitly requested mark; read [Brand marks](references/brand-marks.md) for an unknown mark with a user-provided URL.
   - Examples teach shape, not facts: use fresh IDs, wording, and layout. Go directly to the candidate without preliminary help, doctor, starter validation, temporary diagrams, or output-path listing.
3. Once the requested scope and, for a real codebase, source evidence are covered, write the complete candidate directly without planning coordinates in prose.
   - Choose Architecture abstraction and connected placement using Authoring defaults: show the main user journey and necessary branches, preserve control roles and behavior-changing conditions, and leave room for actual relationship labels. No node, relationship, source, view, card, or boundary count is a target or ceiling.
   - Use automatic routes first; add explicit routing only for necessary branch, return, supplied geometry, or measured repair.
   - Set `meta.quality_profile` to `"showcase"` unless the user requests dense `standard`.
   - For ERD, follow [ERD layout](references/authoring-defaults.md#erd-layout): table-first, every column with its keys, domains as solid grid rectangles.
4. Once the complete first candidate is written, run `finalize` directly. Its first gate is showcase validation; successful first drafts need no separate pre-validation. Keep the candidate unchanged while the command runs:

   ```bash
   node bin/archify.mjs finalize <type> <candidate.json> <output.html> --quality showcase --json
   ```

   For a repository-backed candidate, include evidence on the first draft and use the complete first command: `node bin/archify.mjs finalize <type> <candidate.json> <output.html> --repo-root <repo-root> --quality showcase --json`. Pass the `--quality` that matches `meta.quality_profile`, such as `standard` for a dense first ERD pass.

   A passing receipt proves the included `validate`, `deliver`, strict `check`, and real-browser `browser-check` gates passed. Use its compact summary; run standalone commands only for a separate request or focused failure diagnosis.

5. A non-zero exit is never success. Read compact stdout or `evidence.summaryReceipt`, then [repair the failed gate](references/delivery-contract.md#failed-finalize-and-candidate-repair), including its repair limit.
   - Preserve requested meaning and source evidence. Edit the connected neighborhood and rerun the complete `finalize` command from step 4.
   - For several tangled Architecture routes, read [Architecture layout repair](references/architecture-layout-repair.md); for measured field or geometry failures, read [Authoring contract](references/authoring-contract.md); for workflow viewport overflow, read [Workflow viewport repair](references/authoring-contract.md#workflow-viewport-repair).
   - Once a run has reached `browser-check`, the output path owns that evidence: give every later run its own `--out-dir <folder>/review-<n>`.
   - Inspect Archify implementation only if diagnostics remain unactionable after focused repairs.

## Type router

| Type | Use for | Schema | Example |
|---|---|---|---|
| `architecture` | Components, services, cloud/security boundaries, infrastructure; what something everyday is made of | `schemas/architecture.schema.json` | System descriptions, services, libraries, and CLI repos: `examples/web-app.architecture.json`; deployment repos: `examples/production-deployment.architecture.json` |
| `workflow` | Processes, approval gates, tool calls, runbooks, CI/CD; plans and step-by-step life processes | `schemas/workflow.schema.json` | `examples/agent-tool-call.workflow.json` |
| `sequence` | API call chains, request lifecycles, async traces, returns; back-and-forth between people | `schemas/sequence.schema.json` | `examples/cache-miss-request.sequence.json` |
| `dataflow` | Pipelines, ETL/ELT, lineage, governance, consumers; where money or documents go | `schemas/dataflow.schema.json` | `examples/product-analytics.dataflow.json` |
| `lifecycle` | State/status transitions, retries, waiting and terminal states; where an application or order stands | `schemas/lifecycle.schema.json` | `examples/deployment-release.lifecycle.json` |
| `erd` | Tables/entities, attributes, primary/foreign/unique keys, cardinality between them | `schemas/erd.schema.json` | `examples/orders.erd.json` |
| `tree` | Single-parent containment: repository/module trees, capability or feature breakdowns, org-style decomposition | `schemas/tree.schema.json` | `examples/payment-platform.tree.json` |
| `class` | Classes, interfaces, selected members, and dependency/association/inheritance/realization/composition between types | `schemas/class.schema.json` | `examples/payments.class.json` |
| `timeline` | When things happened: incident reviews, release histories, timestamped events on a proportional clock with source lanes | `schemas/timeline.schema.json` | `examples/payment-incident.timeline.json` |
| `waterfall` | Where the time went: span durations, overlap, and nesting of one request or agent run on a common time axis | `schemas/waterfall.schema.json` | `examples/checkout-request.waterfall.json` |

Scenario proof examples from `guide` are structural references, not facts to copy.

For an everyday subject, keep the same diagram modes and semantic types, then name them for the reader: use everyday `icon` values and `meta.legend` labels as in [Node icons](references/authoring-contract.md#node-icons). Ask for missing personal facts instead of inventing dates, amounts, or rules.

## Mermaid input

Read Mermaid for topology and meaning, then author fresh Archify JSON; do not mechanically render Mermaid styling.

- `flowchart` / `graph` → `workflow`, or `architecture` for a component map.
- `sequenceDiagram` → `sequence`; participants become semantic participants and arrows become messages.
- `stateDiagram` → `lifecycle`; states and transitions retain meaning, not Mermaid style.
- `erDiagram` → `erd`; entity and relationship names, keys, and cardinality retain meaning, not Mermaid style.
- `classDiagram` → `class`; type kinds, selected members, and relationship kinds retain meaning, not Mermaid style.

## Delivery

Use the `finalize` command above for the first candidate and after a repair. It stops at the first non-passing gate; its compact stdout and `<output-stem>.finalize-summary.json` are ordinary evidence. A passing run creates no screenshots and reports `visualReview: "not-requested"`.

- `visualReviewRecommendation.signals.resolvedCrossovers` on a passing Architecture receipt → one position-only pass, following [Architecture crossover review](references/delivery-contract.md#architecture-crossover-review).
- `layoutReviewRecommendation.action: "inspect-sequence-width"` → follow [Sequence width review](references/delivery-contract.md#sequence-width-review) before handing off a newly authored Sequence.
- Perceptual review is optional for ordinary generation, including a newly positioned Architecture. Use [Optional capture evidence](references/delivery-contract.md#optional-capture-evidence), with `--out-dir <folder>/visual-check`, when the user requests visual review, during development audits, or for a concrete route/browser concern. `visualReviewRecommendation` is advisory. Inspect captures before claiming visual quality; qualify any check claim as automated when perceptual review has not occurred.
- Read [Delivery contract](references/delivery-contract.md) for failed gates, standalone commands, provenance/recovery, repeated delivery, exports, or opening. Native diagram recovery follows `deliver` → strict provenance `check` → `browser-check`; captures require strict provenance. Explainer delivery uses validate, deliver and check as described in its authoring guide.
- When reporting verification details, distinguish artifact checks, browser evidence, captures, and actual perceptual review. For an explicitly requested immediate preview or active desktop loop, see [Optional opening](references/delivery-contract.md#optional-opening).

Live motion is enabled by default; omit `meta.animation`. Read `references/viewer-runtime.md` only when the user explicitly asks for Share Cards, Route/Reach cards, motion, deep links, presentation, search/focus, or another Viewer Runtime feature.

## Setup and fallback

No install is required inside the skill package. For setup diagnosis, run `node bin/archify.mjs doctor` and `node bin/archify.mjs demo <output-directory>`. Without shell access, follow [No-shell fallback](references/delivery-contract.md#no-shell-fallback) and never claim HTML delivery that did not run.

## Output

Reply in the user's language, as briefly as the result allows; the diagram carries the content.

- Lead with a clickable Markdown link to the HTML: a descriptive title, not the file name, and its absolute path, wrapped in `<...>` when it contains spaces.
- When the user wants to understand a system or codebase, add one or two sentences with the key takeaway that the diagram does not make obvious.
- State anything that changes how the diagram should be read: abstraction level or deliberately omitted parts, illustrative rather than measured values, missing source evidence, or requested content dropped or merged during repair.
- For several diagrams, link an existing overview or each diagram compactly, never a directory path.
- Do not recap commands, repair rounds, hashes, quality profiles, or check lists. Asked whether it was verified, answer in one line. Disclose requested visual review that could not run.

Native diagram:

```text
Created [Checkout request timing](/abs/path/checkout-timing.html). Durations are illustrative, not measured.
```

Explainer (two or three lines; mention gates only when one failed or writing warnings remain):

```text
The first HTTPS visit pays one extra round trip for the TLS handshake; TLS 1.3 removes one of the two.
[Why the first HTTPS visit is slower](/abs/path/tls-first-visit.html)
```

Verification question:

```text
Automated checks passed; not visually reviewed.
```

After an explainer made on request with no `[archify explainer: ...]` line in context, end with the one-line mode offer from [Explainer modes](references/explainer-authoring.md#explainer-modes).

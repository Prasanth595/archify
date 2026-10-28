# Batch29 CUE authored artifact review

2026-10-28. **Semantic/content comparison passes at the inspected snapshot. Two small disclosure/status edits recommended before delivery; no semantic blocker or product-code change is needed.** Read build.mjs, both drafts, actual generated HTML/prepared documents, complete source/native text, source-context.json, README and NOTICE.md. No script, finalize, test, CUE runtime or browser was run; root owns actual browser review. Sole authored output is this report.

## Prioritized disclosure fixes

1. **Be precise about source/output byte fidelity.** build.mjs `read()` calls trimEnd and fenced snippets are parsed without the terminal LF. Actual prepared snippets are input364 versus raw365 bytes; def344 versus raw345; eval207 versus raw208; export137 versus raw138. All four raw files retain their recorded SHA-256 and displayed text equals raw text minus final LF. Both arms display identical complete nontrailing content, with no missing diagnostic or substantive source line. This is not a semantic error, but copy/display content is not byte-identical to recorded raw input/output. Add a short disclosure that terminal newlines are omitted in the display and raw files/packet remain authoritative; do not claim byte-equal code copying or silently alter source hashes.
2. **Clarify current completion status.** README still says the experiment is incomplete until native evidence/source context arrives. Those files are now present and both pages built. State this as the build's prerequisite rather than an unresolved missing packet. Preserve that browser/visual and human-benefit acceptance are still unestablished at this review stage. There is no need to rewrite historical failures or add a new evidence framework.

## Actual compared artifacts

- baseline.html164,708B, SHA-256 `5c789d0e32695ef42f363f0a79607e7f1cebd7efab9d3468c705ba2b1f6971a1`.
- comparison.html164,703B, SHA-256 `3ced54787238c78f2832948d0bcc712274ba1e599ebe99f7839a5d46bc09f852`.

Read each `archify-explainer-prepared` JSON from the actual HTML. Meta, answer and sources are equal. Every panel object is equal by ID; only panel order changes:

- baseline: input → output → context → reference → interpolation → controls;
- comparison: reference → interpolation → controls → input → output → context.

Both have the same short answer summary before the panels; therefore “evidence-first baseline” describes its panel order, not a native UI replica or an explanation-free control. README accurately labels both as standalone Explainer content pages. The complete input and all def/eval/export text blocks remain in both; identical source context and four source URLs are retained. No candidate-only evidence or baseline evidence suppression was found.

## Input, output and source identity

Actual input remains365 bytes with SHA-256 `3d378446b37f35eb300218ccb695c91404a71b81beefa2e79d95ac58fb93629d`, matching observation.json. Complete native def/eval/export files independently match their recorded output hashes. Their actual rendered snippets match the corresponding raw text subject only to terminal-LF omission described above.

The output retains all relevant facts: def preserves the teaching schema/reference forms (and normalizes reversed operands' printed order); eval shows preferred detail, unresolved reference and reversed-reference string disjunctions, concrete interpolation detail, explicit audit; export shows **two incomplete-value diagnostics**, not a CLI exit or conflict eliminating every valid string. A def printer reordering text does not mean the submitted source operands were not actually reversed; full original input remains visible.

Source IDs spec/natural/redesign/playground and their titles/URLs are equal across arms and agree with native/source-context.json. Citation links refer to those sources; this is curated source interpretation, not an automatic solver trace. The official-context paragraph explicitly says “for this fixture U2…” and elsewhere separates actual Playground outputs from official explanatory context. A brief “source interpretation, not runtime trace” label would be useful precision, but no current text claims a trace graph was observed.

## Semantic judgment

The explanation correctly distinguishes conflicting **input preferences/default component** from the still-valid string value domain. It explicitly says the displayed disjunction is not surviving defaults and not a conflict removing every legal value. Audit is an observed compatible string restriction, not a three-choice enum or an overriding last writer. Both reference orientations retain the same eval result; the prose limits the observation to this example and states commutativity.

Interpolation is correctly described as a different expression requiring a concrete result, resolved using detail in this fixture. It is explicitly not a general override rule. There is no claim that it universally preserves reference semantics, safely repairs arbitrary schemas or should replace all references. No negative interpolation/audit probe is claimed observed. No current claim requires inventing one in this packet.

Root/native-source context retains the separate authored teaching identity, natural issue1449 explanation, future-design issue3751, Playground v0.17.0 **label**, unknown independent WASM byte identity, Go API/WASM wrapper and absence of CLI command/exit reproduction. No page claims a CUE analyzer, event graph, human comprehension improvement, authoring speed, production case or latest/binary-attested runtime.

## Build scope and evidence limits

build.mjs is an experiment-local content builder reading fixed files and using existing Explainer finalize, not CUE execution or a new product pipeline. Its preflight checks observation metadata and complete mode-capture flags; independently verified actual content/hash agreement above rather than treating those booleans as proof. All generated sources are URL references, with full native output carried as ordinary snippets; no pinned Git excerpt is falsely asserted for locally authored/Playground text.

Both saved finalize summaries report validate/deliver/check pass, browser-check not-run and one sentence-length writing warning in official context. These are archived build outcomes read here, not checks rerun by this auditor or browser/perceptual acceptance. Root should capture actual full-page content, citations, snippet scrolling and narrow/control behavior separately. Existing shared toolbar defects are not semantic failures of CUE's example and should remain separately recorded.

NOTICE.md preserves evidence/scope and no-learner-benefit language. The experiment adds authored prose/fixtures/observations, not CUE, Playground or third-party implementation code; official code/spec sources remain attributed by URL. Licensing and raw/public capture provenance should retain the root-owned evidence packet's source records rather than relabelling input as upstream original or claiming native WASM distribution.

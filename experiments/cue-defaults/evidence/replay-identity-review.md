# Batch29 replay identity review

2026-10-28. **The recorded replay supports equivalent authored content and reader markup, not byte-identical HTML reproduction. No reader-visible semantic defect is established by these five metadata differences.** No fix, new artifact, browser, test, replay or expensive diff was run here; only source and root's saved `evidence/replay-byte-differences.json` were read. Sole authored output is this report.

## Source mechanism

The experiment builder writes drafts into its supplied fresh output directory and invokes the repository CLI with those concrete draft/artifact paths while cwd remains the repository. Changing that directory changes the actual input-origin path even though draft text/native evidence is unchanged.

`archify/explainer/prepare.mjs:46-61` resolves inputPath, chooses baseDir from its dirname, parses with that input and carries sourcePath/baseDir plus diagnostic locations into the prepared bundle. `archify/bin/archify.mjs:4909` passes a page-directory execution binding to the renderer for prepared delivery; `archify/renderers/explainer/render-explainer.mjs:21` supplies it to renderExplainer.

`archify/explainer/render.mjs:140-157` portableBundle localizes absolute sourcePath/baseDir and diagnostic.subject.input relative to its supplied page-directory anchor, then **recomputes bundle.digest over all those fields**. At:125-126 the manifest uses the same localized diagnostics. Thus three prepared origin/location leaves change, its integrity digest changes as a consequence, and the manifest diagnostic input changes too: exactly the five recorded differences per arm.

`computeExplainerRevision` in revision.mjs separately hashes authored source/document/resource identity and explicitly excludes filesystem relocation. That stable semantic/content revision is distinct from the full prepared-bundle integrity digest and final HTML file SHA. An integrity digest change is not evidence that CUE's result or the explanatory content changed.

## What was actually compared

Root's structural comparison records, per arm:

1. prepared baseDir;
2. prepared sourcePath;
3. prepared diagnostic0.subject.input;
4. prepared digest;
5. manifest diagnostic0.subject.input.

All other JSON values and all HTML outside the JSON blocks are recorded identical. The origin paths now name the fresh temporary run instead of archived final/drafts; diagnostics still identify the same writing warning. Reader.js does not consume these five origin/digest leaves to display snippets, answers, sources, controls or panel ordering. This is strong evidence for unchanged reader content/markup, without being a screenshot or human-reading claim.

The newly localized strings are long paths climbing out toward the temporary directory rather than simply ../drafts. The report establishes location-dependent serialization; it does **not** independently reconstruct/validate every path-resolution anchor or prove relocated `patch explainer` origin resolution. Do not silently normalize them to force a byte-equality claim, or extend this content experiment into a general output-path repair without a separate supported failing use case. Provenance/patch origins are meaningful metadata even when not rendered to the reader.

## Honest delivery language

Recommended: “A fresh build outside the repository exited0. Its HTML SHA differed. Structural comparison found exactly five location/integrity metadata differences per arm; all remaining embedded values and HTML outside JSON were equal. This verifies equivalent authored content/reader markup for this replay, not identical full HTML bytes.”

Keep the actual archive/replay hashes and path differences, the failed byte-equality assertion, and the interrupted expensive difflib attempt as separate preserved history. The assertion failure disproves byte identity; it is not a failed finalize, changed CUE evaluation, hidden overwrite or new reader defect. The interrupted analysis supplies no additional comparison result. This audit does not relabel root's executed checks as its own, nor establish native WASM identity, latest runtime behavior, general hermetic reproducibility or learner benefit.

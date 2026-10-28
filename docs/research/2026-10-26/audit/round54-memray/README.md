# Memray native peak report — round 54

Retain native evidence; defer an Archify heap importer/viewer. This follows the existing [heap-retention scout](../../scouts/heap-retention-reading.md), not a new accepted product experiment.

## Fixed input and execution boundary

The pre-generated [sqlite report](https://github.com/bloomberg/memray/blob/f70db8143c7601ca55b4b219e50577a3f06e38ea/docs/_static/flamegraphs/memray-flamegraph-sqlite.html) is 1,354,914 bytes, Git blob `1fd2cf0171647ebd40461962d2efd066becfb615`, SHA256 `e1916ee0a1f40e98f1c3f8efde7a13322d0e03c67d4024f9574bb508f3e51b13`. [report-asset.json](report-asset.json) records its cache path outside Git. The selected source revision contains an older report: Stats date the recording to 2023-01-19. Its producer version is unknown; do not label this a v1.20.0-generated report.

Only the report bytes are pinned. It loads external Bootstrap, jQuery, Lodash, Plotly, D3 and other CDN assets; URLs are captured in the final state JSON files, but their response bytes were not archived or verified. This is not an offline artifact or a frozen full runtime. No raw .bin, original example.py, profiler capture, source build, package installation, Chrome heap snapshot or reader study was run.

The public deployed URL was opened first. Controlled comparisons subsequently used the verified file at http://127.0.0.1:8874/report.html. We did not hash the deployed response or establish its deployment commit. All images are real native-page screenshots, not Archify output.

## Observations

| Native state | Root tooltip | Graph frames in DOM | Result |
| --- | --- | --- | --- |
| Default, Hide Irrelevant Frames checked | 71.7 MiB total; 1,705,027 allocations | 121 | Initial peak-stack display |
| Checkbox unchecked | Same | 121 | Sampled frame records unchanged |
| Unchecked, Invert clicked | Same | 121 | Names and widths retained; vertical orientation flips |

“unfiltered” in filenames is only the script's name for the unchecked-checkbox state. It does not establish that frames were actually restored. This fixture showed no frame exclusion/restoration; it therefore cannot validate a successful filtering effect.

Stats separately show **3,602,050 total allocations**, **404 frames seen**, **71.7 MiB peak**, and pymalloc. Help explains that the graph is the snapshot at peak memory, with arbitrary horizontal ordering rather than elapsed time. The root's allocation count and whole-recording total have different scopes. Their difference is not a verified count of freed objects. The 121 graph DOM frames are not the 404 profiler frames seen. The displayed MiB number is rounded, not an exact-byte equality check.

The artifact's own Invert handler toggles vertical orientation and resets zoom; see [report-excerpts.json](report-excerpts.json). All 121 sampled names, labels and widths agree before/after; y coordinates sum to 680, while x differs by less than 0.001px. This does not demonstrate reversed call aggregation, object references, GC roots, dominators or retaining paths.

## Actual images and retained failures

- [Settled Stats](browser/04-stats-settled.png) and [Help](browser/05-help.png).
- [Default root](browser/default-root.png), [unchecked root](browser/unfiltered-root.png), [inverted root](browser/inverted-root.png).
- [Premature Stats](browser/03-stats.png) captured only its backdrop before the modal settled; it is not the Stats evidence.
- [Early graph samples](early-graph-samples/) retain a redraw sampled before labels stabilized. The final script waits for unchanged graph DOM for at least 350ms, then hovers the root.
- The first verifier used an overly strict 0.000001px x-coordinate equality and failed on approximately 0.000008px of serialized transform difference. [Original verifier and failure](verification-first-attempt/) are preserved. The final bound is 0.001px; label/width identity and vertical reflection checks remain separate.

All 10 PNGs were opened and inspected at 1291 × 762. Hovering the inverted root scrolled to y=430; default/unchecked are y=0. These are not aligned viewport crops. Browser timezone was Asia/Shanghai. DOM settling delays are synchronization evidence, not performance measurements.

## Reproduce

First run `python3 verify.py` from this packet (or invoke it by path). It validates archived source blobs, quantities, checkbox states, graph geometry, PNG dimensions and manifest entries. It also verifies the cached report/excerpts if that absolute path exists, and explicitly reports whether it did. This is offline evidence validation, not fresh browser execution.

For a new browser replay, copy the packet to a scratch directory so the archived receipts remain intact:

1. Run `python3 fetch-report.py` in the scratch copy. It downloads only the fixed HTML, verifies its byte length and Git blob, and writes a new local receipt; it installs nothing.
2. Run `python3 serve.py`, then open http://127.0.0.1:8874/report.html in a browser with CDN network access.
3. Inspect Stats and Help after their dialogs visibly settle. Close each before proceeding.
4. Reload; hover the root. Uncheck Hide Irrelevant Frames, wait for the graph to settle, and hover the root again. Click Invert, wait, then hover the root. Record the tooltip, checkbox and frame evidence separately.
5. Save fresh screenshots/receipts separately; stop the server. A fresh receipt has a different cache path, so the original archived manifest is not its manifest.

The retained Ego scripts document the exact original actions. They reference research space 3, page p1 and absolute capture paths; adapt those to an explicitly owned session/output directory for reuse. [07-settled-graphs.mjs](browser/07-settled-graphs.mjs) is the final graph capture, not the earlier transient sample.

## Disposition and ownership

Potential value is explicit statistical scope and links back to native evidence. The native report already provides graph, hover, Stats and Help. This does not close the existing same-object allocation/retention evidence gap, or justify the maintenance burden of a new heap parser. Keep the earlier deferral; no product change, dependency or separate experiment branch.

The owned server was stopped and p1 returned to about:blank. [context.json](context.json) records bounded duplicate checks: 333 refreshed remote heads, existing heap scout and retained-size experiment, plus exact “memray” issue/PR searches returning zero. These keyword checks are not an exhaustive semantic review. The alternative Difftastic/GumTree revisit lacked local runtimes; none were installed.

[NOTICE](NOTICE.md) retains attribution, [sources.json](sources.json) pins the archived documentation/license, and [manifest.json](manifest.json) hashes the packet. No product suite or CI was run for this research-only packet. No PR, merge, release, publication or installation was performed.

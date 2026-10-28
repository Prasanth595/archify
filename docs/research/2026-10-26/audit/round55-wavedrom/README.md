# WaveDrom phase, scale and authored labels — round 55

Disposition: retain native evidence; no new waveform renderer, importer or Archify experiment. This follows the source-only WaveDrom entry in the [earlier protocol scout](https://github.com/tt-a1i/archify/blob/3beb343b8fd6686201bde9b0f307f9a1c6b00246/docs/research/2026-10-25/scouts/protocol-schema-smalltools.md).

## Identity and inputs

The engine repository head observed was **5f44f7d836c550fa1f0fff2ea23cc95a5c0695e3 / 3.8.0**, but it was not executed. Actual native editor files came from **wavedrom/wavedrom.github.io@375378efff2116ab2a03cdc3575d8ca73d49a429**. Both its bundle header and editor DOM declare **3.7.0**.

[fetch-assets.py](fetch-assets.py) downloads 27 exact site files (416,215 bytes), verifies each Git blob/length, and caches them outside Git. [native-assets.json](native-assets.json) identifies every file. No npm installation, local build or package dependency was added. All fetched files were served unmodified.

This is not a complete site mirror: service-worker.js and a PWA icon requested by the page return 404, recorded in [server.log](server.log). Fonts and analytics remain external resources with unpinned response bytes; the final DOM records their URLs. The controlled renderer/editor/skin assets are pinned, not the entire browser/network environment. Public tutorial/editor pages were initially viewed; the controlled captures and exports used loopback.

[original.json5](cases/original.json5) is the exact Sharp lines WaveDrom script extracted from the fixed [tutorial](sources/tutorial.html). It is an upstream authored teaching example, not a hardware trace or our execution of the issue reporter's clock example.

[build-cases.py](build-cases.py) parses only this reviewed literal subset without executing JavaScript, then serializes equivalent strict JSON:

- [baseline](cases/baseline.json): equivalent to the original tutorial object.
- [phase-zero](cases/phase-zero.json): changes the three explicit phase values (B, the unnamed I/J lane, D) from 0.5 to 0.
- [scale-two](cases/scale-two.json): preserves baseline signals/edges; adds config.hscale = 2.

All have six lanes, four named signals and ten declared edges. The two label strings “3 ms” and “5 ms” come directly from edge declarations. No physical unit/calibration is supplied or inferred.

## Native result

| Case | g–h span | I–J span | I/J left offset from g/h | Labels |
| --- | --- | --- | --- | --- |
| Baseline | 120 | 120 | 20 | 3 ms / 5 ms |
| Phase zero | 120 | 120 | 0 | 3 ms / 5 ms |
| hscale 2 | 240 | 240 | 20 | 3 ms / 5 ms |

Values are local SVG coordinate units, measured from native path bounds. The spans double under hscale, but the phase offset does not. Phase therefore cannot be assumed to be a fixed fraction of the newly scaled period. Equal visual spans with different unit-looking labels also do not constitute measured durations: the strings are authored captions.

![Native baseline export](exports/baseline.png)

![Native scale-two export](exports/scale-two.png)

[Source render-arcs.js](sources/engine-lib__render-arcs.js) at **142dd41870bcca7450f55c970d9e3c8070deeb05** computes event x from `xs * (2 * position * period * hscale - phase) + xlabel`, with the internal phase set to twice the authored phase. It extracts edge label text directly. Source reading supports the observed distinction; we did not rebuild this source to prove the published bundle's full build provenance.

This behavior is not a newly discovered defect. [Issue #171](https://github.com/wavedrom/wavedrom/issues/171), open when checked, reports phase not scaling with hscale. Its comment points to [the maintainer's #53 explanation](https://github.com/wavedrom/wavedrom/issues/53#issuecomment-42156824), whose angle examples explicitly depend on hscale. [related-issues.json](related-issues.json) retains links and scoped summaries. The original negative-phase clock fixture and arbitrary period values were not run.

## Browser evidence and failures

Final [browser captures](browser/) wait until the public input textarea equals the requested JSON before recording the diagram. The initial script waited only for an existing label; because the native editor updates after a 750ms timer, it sometimes captured the preceding diagram. [early-captures](early-captures/) preserves all three initial DOM/SVG/PNG sets. Some later screenshots in that set had already updated while the earlier DOM read had not; none is treated as the controlled comparison.

[03-settled-cases.mjs](browser/03-settled-cases.mjs) records the corrected three states. [04-native-export.mjs](browser/04-native-export.mjs) uses the actual Export SVG and Export PNG menu actions; six downloads are retained in [exports](exports/). DOM serializations are separately named -dom.svg and are not mislabeled as native downloads.

All nine PNGs were opened and inspected: six viewport screenshots at 1291 × 762, two native exports at 340 × 180 and one at 620 × 180. The complete waveform fits; long source JSON extends beyond the editor viewport. No screenshot was redrawn or cropped. A first GitHub search lacked a required issue/PR qualifier and returned 422; corrected queries both returned zero for Archify + wavedrom.

## Reproduce and verify

1. Run `python3 verify.py` to check archived sources, exact case derivation, final input receipts, selected path measurements, native-export/DOM path agreement, PNG dimensions and manifest hashes. Existing cached assets are checked when present; the result explicitly reports their count. This is an archived evidence check, not a new browser run.
2. Run `python3 fetch-assets.py`, then `python3 serve.py`. The cache defaults to ~/.cache/archify-research/wavedrom-375378e; WAVEDROM_RESEARCH_CACHE may select another cache.
3. Open http://127.0.0.1:8875/editor.html and paste one case into the editor, or use its supported URL query input: editor.html? followed by percent-encoded JSON. Wait for the edit to render before observing/exporting.
4. Use the menu's Export SVG / Export PNG actions. Repeat for all three inputs and save new evidence separately; stop the server afterward.

The Ego capture scripts preserve exact original actions and absolute output paths/space 3 ownership. Adapt those to an owned session and separate output directory before reuse. No protocol simulator, physical measurement, reader study, Archify runtime, product suite or CI was run.

The owned server was stopped and p1 returned to about:blank. [context.json](context.json) and [remote-heads.tsv](remote-heads.tsv) record 333 remote heads, unchanged task-view, prior coverage and bounded issue/PR searches. [NOTICE](NOTICE.md) preserves attribution. No new PR, merge, release, site publication or software installation occurred.

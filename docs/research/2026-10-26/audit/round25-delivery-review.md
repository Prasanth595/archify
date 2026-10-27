# Batch25 independent delivery audit

2026-10-28. **Scoped pass for the native-observation research delivery.** No artifact-integrity or observation blocker found. One non-blocking wording refinement is recommended below. This audit read saved evidence, calculated hashes/raw comparisons, and inspected all four saved PNGs. It did not rerun TS, Ohm matching/tracing, browsers, regex code, upstream tests, builds or Archify checks; no installation, repository edit, PR or external action occurred. Sole authored output is this report.

## Wording precision: collapse is not universal

In `scouts/ohm-source-round25.md`, “uppermost failure nodes initially collapse” should ideally be qualified as the relevant eligible/labeled failures, rather than read as every failed expression. The delivered `scoped-end-explained-state.json` has failed **unlabelled** node46 (`class="pexpr failed"`, no self label), with rendered children for successful A and failed end; `scoped-end-explained.png` visibly shows A's successful `"a"` descendant next to failed end. This is an attempted but failed `A end` sequence, not an unattempted branch. Default scoped-end DOM filters that failure; Explain parse exposes it without a recorded expansion click. The scout already notes unlabeled sequence/alternative nodes, filtered/collapsed/unlabeled distinctions and unknown deployed editor commit, so this does not invalidate its source-only status or the observed narrative. Do not generalize this deployed example into an assertion about every node of the pinned source build.

## Copy and TypeScript identity

- **63/63** entries in `round25-copy-map.json` match archived byte size/SHA-256 and their retained `/tmp` raw bytes. The post-run files listed in TS observation.json match their recorded hashes/sizes.
- Independently recomputed raw Git object identities from `blob <byte-count>\0<raw-bytes>` (equivalent to hash-object without filters): fixture **384B**, `76a1fabdf6ed391e7cb0382f521ec28c95b131c0`; expected **1501B**, `4daa8b176ed8c6ef3c455f7b04b6e5bfeb960b77`. They contain respectively 6/19 CRLF delimiters and match the asserted upstream blobs. The upstream directory's `.gitattributes` `* -text` correctly protects raw identity from checkout normalization. This audit confirms archived/raw identity and declared blob equality, not a fresh remote fetch.
- The pinned fixture/baseline source is TypeScript **5.9.3 c63de15a**; actual installed compiler is **5.8.3**, under Node **22.23.3**. README section25, native README, observation.json and validation.json distinguish these. Runtime launcher/package/compiler hashes are recorded separately; no same-version suite or byte-equal CLI/baseline claim is made.
- Exact observed argv supplies `--strict --noEmit --pretty true --noErrorTruncation`. The source `// @strict: true` is a harness directive, not relied on as a CLI option. Raw source retains this extra first line; CLI reports **7:1**, while the harness baseline uses line **6**. Full ANSI stdout contains TS2322, four nested callback layers, three nested call-signature comparisons and the number/string leaf. Recorded **exit2** is a diagnostic outcome, not a successful type check. Stderr is empty; no JS emission is recorded and `--noEmit` is explicit.
- TS run.py is plainly historical: fixed `/tmp` root/tool paths and writes to that capture directory. It should not be presented as portable safe rerun automation. Section25 instead gives a direct command from the observation-package directory with an existing matching Node/tsc; fixture, flags, versions and expected exit are sufficient for manual reproduction. No rerun was performed here.

## Ohm native/UI separation and images

All three native JSON captures use input **ab** and exactly the corresponding grammar (aside from the explicitly documented final LF on stored `.ohm` files). Each complete saved trace.txt equals its JSON trace string. Original match=false reports line1 col2 expected end of input; the local X/A succeeds consuming a, then the whole-input end fails with b left. Reordered B|A and scoped `A end | B end` match=true. The scoped trace includes failed A end and successful B end. These agree with the public-example-limited prose, not a general repair for the author's undisclosed non-prefix application.

The captures explicitly construct a grammar from the editor text and invoke **g.match and g.trace separately**. Thus API trace/result evidence and the rendered native UI are appropriately distinguished, rather than inferring engine attempts from UI absence. Engine `window.ohm.version` is **17.5.0**; deployed editor commit remains unknown. Pinned source editor commit **2ff2a072** and package dependency range do not identify that deployed editor build.

Inspected the four actual **1440×900** PNGs; recorded viewport DPR is1. They show:

- original: A consuming a, failed end, expected-end error, Explain parse checked;
- reordered: B consuming ab, success context, Explain parse unchecked;
- scoped default: successful B/end and whole-input end, Explain parse unchecked;
- scoped explained: A and failed end alongside successful B/end, Explain parse checked, A source line highlighted by hover.

DOM `checks` agrees: showFailures true/false/false for original/reordered/scoped captures, true in explained state. Failed DOM nodes are present in original and explained captures and absent in the two default success captures. They are distinct UI states, not controlled pixel diffs. No physical reader, comprehension, mobile, keyboard/timeline/export acceptance follows from them.

Attempt04's preserved log has a real focus failure on a zero-sized hidden example editor. Follow-up state inspection and Add example actions are saved; the failed focus is not counted as a parse result. Cleanup script removes task-created example5, restores the exact initially captured Arithmetic grammar and selects the first original example. Actual restored-state grammar equals initial-editors grammar; five original example IDs/content remain and example0 is selected. This proves saved content restoration, not every transient UI preference.

## Scope, reproduction and license

The Ohm README gives sufficient manual reproduction: preserve original content, enter each complete grammar and ab, capture version/result/default toggle, enable Explain parse and hover A after scoped-end. It explicitly labels scripts01–12's space34/temp paths as historical. Preserving these scripts is evidence retention, not a promise of portable browser automation. The site's deployed build can change; the report says so. No arbitrary semantic-action code was introduced.

TS Apache-2.0 license and Ohm-editor MIT notice are included and attributed; small Ohm issue grammar is attributed to the issue. No translator engine, GPL regex implementation or third-party Ohm bundle is vendored. Regex remains link/source research without running the historical unbounded loop. Original code/output, modern tool scope and unknown original application remain distinct.

README section25 explicitly explains that all three scouts preserve earlier source-only screening, with subsequent actual observations in separate packages. It does not recast upstream expected TS output or source Ohm behavior as live results. Dedup retains capped queries and historical adjacent directions, without claiming exhaustive absence of related work. Deferring extra readers follows the informative native diagnostics/traces and absent demonstrated user-value gap; no latest-version, build, product-test, CI or human-benefit success is asserted.

## Finalization: wording recommendation resolved

Re-read current `scouts/ohm-source-round25.md:9`: it now explicitly limits initial collapse to **labeled non-leaf failed nodes**, describes the initial false return for unlabeled nodes/leaves, and excludes unlabeled sequence/alternative nodes and failed leaf labels. This resolves the initial audit's overbroad-collapse wording recommendation. Line11 separately attributes the actual scoped-end UI observation to root, without claiming an independent rerun or deployed editor SHA; the opening source-only scope refers to that scout's own investigation.

No native artifact, matching/tracing/browser observation or screenshot was rerun for this follow-up. The final scoped audit is **pass, with the wording recommendation resolved**; earlier findings above retain the pre-correction review history.

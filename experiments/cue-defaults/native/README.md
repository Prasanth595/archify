# Recorded Playground observation

Open <https://cuelang.org/play/>, paste the complete `../input/reader-modes.cue`, and keep input and output formats as CUE. In **Function**, choose **eval**, **def**, and **export** in turn and confirm with **OK**. Compare the complete output with the corresponding `.txt` file. Open the top-right menu to record the displayed version before interpreting a later run.

This capture displayed CUE v0.17.0. The issue-report link supplied site commit `957f004c34a71982b5773e86126d9df2a5c6d48f`; the CUE specification is pinned separately in `source-context.json`. Neither label attests the downloaded WASM bytes. A future live Playground may differ: retain a new observation separately rather than replacing this packet. The Archify pages can be rebuilt offline from this frozen packet without installing or running CUE.

`observation.json` binds the 365-byte input and each complete output by SHA-256. The three `authored-*.json` captures contain every rendered CodeMirror line from both editors, including the trailing empty line. Joining those lines with LF reproduces the input and `.txt` files exactly. The pages omit the final LF in displayed/copied code; the raw files remain authoritative. Screenshots illustrate the actual page but do not replace those full-text records; long editor lines can extend beyond the screenshot viewport.

Export produced two displayed incomplete-value diagnostics. It has no recorded CLI exit status. The official Playground uses the CUE Go API in WASM, with its own synthetic stdin/module context. No CUE CLI run, installation, binary attestation, or human comprehension test is implied.

## Capture history

`executed-06` through `executed-08` are the actual historical scripts and logs, with local paths and the goal's task-space ID retained as execution metadata. They depend on preceding page state and are **not standalone replay scripts**; use the manual steps above for a fresh observation. In script 06 the early temporary version file was written before the authored input was inserted. That temporary file is excluded. The public `visible-version.json` is the later **authored** version capture from script 08, which agrees with `version.png`.

Script 08's console version regex returned `undefined`; its saved DOM text and screenshot visibly show v0.17.0. This extraction limitation is retained rather than silently corrected. The earlier natural issue snippet and browser inventory remain outside this repository. Source context is authored interpretation, separately reviewed in `../evidence/`, not an engine execution trace.

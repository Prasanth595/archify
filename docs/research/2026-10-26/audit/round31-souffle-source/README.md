# Soufflé fixed source inspection packet

Source: [souffle-lang/souffle at f53dab8bf4bbf2395a26d2771f6b75395825cc46](https://github.com/souffle-lang/souffle/tree/f53dab8bf4bbf2395a26d2771f6b75395825cc46). Retrieved through GitHub connector on 2026-10-28. All 17 files retain their exact Git blob bytes, original notices, [root license](LICENSE) and [UPL permission notice](licenses/SOUFFLE-UPL.txt). File URLs, Git blob IDs, byte lengths and SHA-256 are in [source-map.json](source-map.json).

The two complete test directories contain original Datalog input, command input, expected output and relation CSV. `path_explain_output.out` is intentionally empty: that test redirects the proof into `provenance.txt`. No files here are results of a local Soufflé execution. No engine installation, compilation, upstream suite, Archify rendering or screenshot was performed. The four source files are archived for the narrow semantics inspection; they do not form a buildable distribution.

Run `python3 verify.py` from this directory to independently check source identity and inspect the expected JSON. It uses only Python's standard library and does not execute Datalog or C++. [verification.json](verification.json) records the actual local check. Six nodes means six occurrences in this one proof tree, not six unique relations or all alternative derivations.

To reproduce the upstream run later with an **already available matching Soufflé build**, first copy one complete test directory to a fresh disposable directory, then execute `souffle -t explain path_explain_output.dl < path_explain_output.in` there (or the corresponding `path_explain_negation` names). Preserve outputs separately and compare against these expected files. This procedure was not run in this batch; runtime dependencies and supported versions have not been established here. Do not overwrite these source fixtures or call their expected files observed runtime results.

The main [research decision](../../scouts/souffle-proof-reading-round31.md) explains why `axiom` is not a sufficient leaf classification and why no Archify adapter was implemented.

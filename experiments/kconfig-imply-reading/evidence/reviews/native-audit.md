# Kconfig native observation audit

No mismatch found in the preserved source identities or the three observed values. This is a review of one saved execution and the script, not a rerun, TUI session or independent proof of the shell environment. The coordinator reports `env -i` and Python 3.15; runtime.json and stdout identify Python 3.15.0, but the preserved run directory does not itself contain the full invocation or environment. No `.config` load or user assignment is present in the script; all 26 recorded user values are null.

## Source and fixture

All six upstream files match both size and Git blob SHA-1 in git-identities.tsv: LICENSE.txt 8b31efca291de2bd3346521fea966d22a68c142f; kconfiglib.py c67895ced6b352190c62c2984ce61b65d39dda77; menuconfig.py 7e765d36f983d80a402f3e19dbd6c55d0c099980; tests/Kimply 3ce346f626c3a142b8da46541b0004830598456d; testsuite.py fc61a163191ffce037be1e86b4bf46cd5fd6e216; README.rst b59f04ecef84c45da9ccc6ec6e98e613ec40ef49. All eight manifest entries including metadata files match size/SHA-256. These are local checks against recorded object IDs, not an independent remote fetch. Manifest attributes them to `061e71f7d78cb057762d88de088055361863deff`. The full unmodified fixture declares IMPLY_DIRECT_DEPS default y and its imply edges (lines 9–17), UNMET_DIRECT_1 depends on n (19–21), and MET_DIRECT_1 has no explicit dependency (36–37).

## Saved observation

Exit 0, stderr empty, warnings `[]`, 26 defined symbols in all-symbol-values.json. Each of the following has `user_value: null` and visibility `n`; visibility is a prompt visibility value, not the same thing as the direct-dependency value or the computed symbol value.

| Symbol | Computed | Direct dependency | Weak reverse dependency | Visibility |
| --- | --- | --- | --- | --- |
| IMPLY_DIRECT_DEPS | y | y | n | n |
| UNMET_DIRECT_1 | n | n | IMPLY_DIRECT_DEPS = y | n |
| MET_DIRECT_1 | y | y | IMPLY_DIRECT_DEPS = y | n |

The saved native formatter text for all three equals the corresponding complete stdout sections byte-for-byte modulo the section separator newline. It states source=y, unmet=n and met=y; the source info names the implied targets and their current values, while each target info lists the y-implying source. It shows an explicit direct-dependency block for the unmet case; absence of that block for the met case is not an independent displayed `depends on y` line. `generated.config` includes `CONFIG_IMPLY_DIRECT_DEPS=y` and `CONFIG_MET_DIRECT_1=y`; it omits UNMET_DIRECT_1, so the n result is supported by symbol JSON and formatter, not a present `# ... not set` line. Every recorded y/m symbol has its matching line in generated.config; no recorded n symbol is written with `CONFIG_...=`. Omissions cannot be treated as separate explicit assignments.

`observe.py` verifies source hashes, loads `tests/Kimply` with `Kconfig(...)`, invokes `menuconfig._info_str` for the three symbol nodes, serializes all symbol data and warnings, and writes config into the fresh requested external output path. It does not call `load_config`, `set_value`, or interactive menuconfig, and sets `sys.dont_write_bytecode` before imports. Its explicit writes in this saved invocation target `/tmp/archify-round20-kconfig-run01/output`, not the upstream tree; this is not a blanket restriction on arbitrary caller-selected output paths. The formatter is a native private function invoked programmatically, not evidence that a human opened, navigated or perceived the actual TUI. The audit did not rerun script, inspect UI or run tests.

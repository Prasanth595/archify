# Kconfig imply: offline reading comparison

**Reviewable prototype; automated browser gate still fails.** Open [comparison HTML](artifacts/comparison.html) or [native evidence baseline](artifacts/native-baseline.html) locally. See [validation and limitations](VALIDATION.md), [desktop capture](evidence/browser/final-comparison-desktop.png), and [narrow-view comparison](evidence/browser/final-comparison-mobile-table.png). No PR, integration, installation or measured reader advantage is claimed.

These revised drafts compare a native-evidence baseline with a two-target explanation of one Kconfiglib observation. The baseline carries the complete 145-line `Kimply`, all three native formatter outputs, the generated config and the full JSON for 26 observed symbols. The candidate carries the same material plus a comparison and explanation. Both drafts use committed, locally pinned source excerpts; no architecture graph or new parser is involved.

The fixed local evidence revision is `a2c5843748d3843baa21708f3ec0c51fb15c9985`. The upstream fixture and Kconfiglib come from [Kconfiglib](https://github.com/ulfalizer/Kconfiglib) at `061e71f7d78cb057762d88de088055361863deff`, under the [ISC license](upstream/LICENSE.txt). The observation used Python 3.15.0 without loading a user config or assigning user values. The three info files come from calling `menuconfig._info_str` programmatically, not from an interactive TUI. This is not a full upstream test suite or Zephyr build.

The run records `IMPLY_DIRECT_DEPS=y`. Both target weak reverse dependencies evaluate to `y`, but `UNMET_DIRECT_1` has direct dependency `n` and observed value `n`; `MET_DIRECT_1` has direct dependency `y` and observed value `y`. All three have visibility `n` and user value `null`. The generated config has no line for `UNMET_DIRECT_1`; its `n` is established by the JSON and native formatter, not an explicit config line.

## Draft and delivery

From the repository root, regenerate the revised drafts from the frozen packet:

```sh
node experiments/kconfig-imply-reading/build-pages.mjs
```

With the repository's normal Explainer dependencies already available, the ordinary delivery commands are:

```sh
node archify/bin/archify.mjs finalize explainer experiments/kconfig-imply-reading/drafts/native-baseline.archify.md /tmp/kconfig-native-baseline.html --repo-root "$PWD" --json --browser-check
node archify/bin/archify.mjs finalize explainer experiments/kconfig-imply-reading/drafts/comparison.archify.md /tmp/kconfig-comparison.html --repo-root "$PWD" --json --browser-check
```

The source commit must remain available in the local repository; it need not be published for `--repo-root` to resolve it. Both pages contain the same raw evidence. The original first drafts, generator and README are preserved in `evidence/first-drafts`. This revision adds offline attribution and the full ISC license, brings the native formatter evidence forward, and clarifies the comparison and its limits.

## Evaluation

Use identical questions and access to the complete source packet for both pages:

1. Why does the same implier yield two different target values in this run?
2. Where is the evidence for each value and its direct and weak reverse dependencies?
3. Why do hidden symbols or an omitted config line not establish that the value was uncalculated?

Compare actual answers, errors and time with independent readers and a balanced order; preserve raw responses. Inspect each page, embedded source cards and keyboard behavior before recruiting readers. Reject a candidate that changes facts or hides evidence, or that fails to provide a clear observable benefit over the complete native baseline. Without reader results, report only factual and presentation checks; do not claim speed or an advantage over the native UI.

Final baseline uses `evidence/render02`; final comparison uses `evidence/render03`. Validate, deliver and static check passed, but both finalizations exited 1: browser keyboard traversal reported 28 and 52 errors respectively. These failures remain part of the result. Actual Ego checks established desktop/narrow-view content and source hover/Escape behavior, offline loading and keyboard traversal to the footer in this browser; they do not override the automated gate. At 390 CSS pixels both pages extend to 401 pixels because of the shared toolbar; table labels also wrap awkwardly.

The final producer is unchanged dev `d5d979493bba650b3995836afd379cd249f2d0dd`, run with Node 22.23.2 and already available dependencies. Temporary dependency links were removed. There is no new runtime product dependency. Frozen upstream Python sources are an experiment-only reproduction packet. No human reader study, full product/upstream suite, interactive menuconfig session, real touch-device or assistive-technology test was performed.

## Reproduce the native observation

Use an existing Python with the standard `curses` module available (the recorded macOS run used Python 3.15.0). From the repository root:

```sh
kconfig_python="$(command -v python3)"
kconfig_run_dir="$(mktemp -d)"
env -i PATH=/usr/bin:/bin PYTHONDONTWRITEBYTECODE=1 PYTHONUTF8=1 "$kconfig_python" experiments/kconfig-imply-reading/observe.py "$kconfig_run_dir/output"
```

The helper verifies the pinned source manifest, refuses an existing output directory, computes all 26 values, and writes the native formatter text and configuration. Compare semantic outputs to `observation/run01/output`; runtime version and output-path strings can differ. The page generator deliberately reads the committed observation, not a newly produced run. A successful observation is not an upstream test-suite pass.

## Evidence format

See `evidence/manifest.json` for SHA-256 identities. Large browser/finalize JSON receipts are stored with deterministic gzip compression; `gzip -dc FILE.json.gz` reads the public JSON. Local checkout/home/runtime paths in diagnostic copies were replaced by named placeholders; `evidence/public-copy-map.json` records original, public and stored digests. HTML, source text and PNG pixels were not redacted or edited. `artifacts/` holds byte-identical standalone HTML copies; archived receipts describe the original render locations rather than new delivery bindings for those copies.

Browser action files ending `.mjs.txt` are archived action records with placeholder paths and the historical task-space ID, not unattended replay scripts. To repeat UI checks, open either HTML in your own browser, inspect at 1440×900 and 390×844 CSS pixels, hover/focus a source citation, press Escape, and use Tab through the page. External Open source links need the network; the pinned content and source peek are embedded.

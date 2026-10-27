# Kconfig imply: offline reading comparison

This content experiment compares a native-evidence baseline with a two-target explanation of one Kconfiglib observation. The baseline carries the complete 145-line `Kimply`, all three native formatter outputs, the generated config and the full JSON for 26 observed symbols. The candidate carries the same material plus a comparison and explanation. Both drafts use committed, locally pinned source excerpts; no architecture graph or new parser is involved.

The fixed local evidence revision is `a2c5843748d3843baa21708f3ec0c51fb15c9985`. The upstream fixture and Kconfiglib come from [Kconfiglib](https://github.com/ulfalizer/Kconfiglib) at `061e71f7d78cb057762d88de088055361863deff`, under the [ISC license](upstream/LICENSE.txt). The observation used Python 3.15.0 without loading a user config or assigning user values. The three info files come from calling `menuconfig._info_str` programmatically, not from an interactive TUI. This is not a full upstream test suite or Zephyr build.

The run records `IMPLY_DIRECT_DEPS=y`. Both target weak reverse dependencies evaluate to `y`, but `UNMET_DIRECT_1` has direct dependency `n` and observed value `n`; `MET_DIRECT_1` has direct dependency `y` and observed value `y`. All three have visibility `n` and user value `null`. The generated config has no line for `UNMET_DIRECT_1`; its `n` is established by the JSON and native formatter, not an explicit config line.

## Draft and delivery

From the repository root, regenerate the same first drafts from the frozen packet:

```sh
node experiments/kconfig-imply-reading/build-pages.mjs
```

With the repository's normal Explainer dependencies already available, the ordinary delivery commands are:

```sh
node archify/bin/archify.mjs finalize explainer experiments/kconfig-imply-reading/drafts/native-baseline.archify.md /tmp/kconfig-native-baseline.html --repo-root "$PWD" --json
node archify/bin/archify.mjs finalize explainer experiments/kconfig-imply-reading/drafts/comparison.archify.md /tmp/kconfig-comparison.html --repo-root "$PWD" --json
```

The source commit must remain available in the local repository; it need not be published for `--repo-root` to resolve it. Both pages contain the same raw evidence. The first draft is preserved for comparison; repairs and their reasons should be recorded separately if delivery rejects it.

## Evaluation

Use identical questions and access to the complete source packet for both pages:

1. Why does the same implier yield two different target values in this run?
2. Where is the evidence for each value and its direct and weak reverse dependencies?
3. Why do hidden symbols or an omitted config line not establish that the value was uncalculated?

Compare actual answers, errors and time with independent readers and a balanced order; preserve raw responses. Inspect each page, embedded source cards and keyboard behavior before recruiting readers. Reject a candidate that changes facts or hides evidence, or that fails to provide a clear observable benefit over the complete native baseline. Without reader results, report only factual and presentation checks; do not claim speed or an advantage over the native UI.

Render and browser results: pending independent execution.

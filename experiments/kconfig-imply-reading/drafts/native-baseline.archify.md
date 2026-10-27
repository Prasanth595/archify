# Inspect the native Kconfig evidence {#native-reading}

This packet contains the complete fixture and native observation for the same Kconfig run.

@answer scope="Kconfiglib Kimply · Python 3.15 · no user config"
@meta locale=en repo_url=https://github.com/tt-a1i/archify repo_revision=a2c5843748d3843baa21708f3ec0c51fb15c9985
@source implier title="Native formatter: implier" path=experiments/kconfig-imply-reading/observation/run01/output/native-info/IMPLY_DIRECT_DEPS.txt lines=1:23
@source unmet title="Native formatter: unmet target" path=experiments/kconfig-imply-reading/observation/run01/output/native-info/UNMET_DIRECT_1.txt lines=1:19
@source met title="Native formatter: met target" path=experiments/kconfig-imply-reading/observation/run01/output/native-info/MET_DIRECT_1.txt lines=1:15
@source kimply title="Complete Kimply fixture" path=experiments/kconfig-imply-reading/upstream/tests/Kimply lines=1:145
@source config title="Generated config" path=experiments/kconfig-imply-reading/observation/run01/output/generated.config lines=1:22
@source values title="All 26 observed symbols" path=experiments/kconfig-imply-reading/observation/run01/output/all-symbol-values.json lines=1:444
@source license title="Kconfiglib ISC license" path=experiments/kconfig-imply-reading/upstream/LICENSE.txt lines=1:5
@source visibility title="Kconfiglib visibility and prompts" path=experiments/kconfig-imply-reading/upstream/kconfiglib.py lines=149:158
@source upstream title="Kconfiglib upstream at 061e71f7" url=https://github.com/ulfalizer/Kconfiglib/tree/061e71f7d78cb057762d88de088055361863deff

## What does this packet cover? {#context}

Kconfiglib upstream is [pinned at commit 061e71f7d78cb057762d88de088055361863deff](source:upstream) and distributed under the ISC license.[](source:license) The formatter files use a programmatic call to `menuconfig._info_str`; this was not an interactive TUI. No user config was loaded or user values assigned; no full test suite or Zephyr build was run. The fixture has 145 lines, and the JSON records all 26 defined symbols.

## Native formatter: implier {#panel-implier}

@code source=implier language=text

## Native formatter: unmet target {#panel-unmet}

@code source=unmet language=text

## Native formatter: met target {#panel-met}

@code source=met language=text

## Complete Kimply fixture {#panel-kimply}

@code source=kimply language=text

## Generated config {#panel-config}

@code source=config language=text

## All 26 observed symbols {#panel-values}

@code source=values language=json

## Kconfiglib ISC license {#panel-license}

@code source=license language=text

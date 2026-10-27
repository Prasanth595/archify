# Why do two targets implied by the same symbol differ? {#imply-comparison}

In this run, the same implier gives both targets a weak reverse dependency of `y`. The target with an unmet direct dependency stays `n`, while the met target is `y`.[](source:values)

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

## What differs between the two targets? {#comparison}

| Observation | UNMET_DIRECT_1 | MET_DIRECT_1 |
| --- | --- | --- |
| Same implier | IMPLY_DIRECT_DEPS = y | IMPLY_DIRECT_DEPS = y |
| Weak reverse dependency | y | y |
| Direct dependency | n | y |
| Observed value | n | y |
| Visibility | n | n |
| User value | null | null |

In this observation, imply does not bypass the unmet direct dependency. The fixture explicitly gives the first target `depends on n`; the second has no direct restriction in its definition.[](source:kimply) The native formatter names the same implier for both.[](source:unmet)[](source:met)

## Why does absence from the config not mean uncalculated? {#absence}

The generated config omits the unmet target.[](source:config) Its value `n` comes from the observed JSON and the native formatter, not an explicit config line.[](source:values)[](source:unmet) All three relevant symbols have visibility `n` and no user value in this run. Visibility `n` means the symbol is not visible as a menu prompt; it does not mean its value was not calculated.[](source:visibility)[](source:values)

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

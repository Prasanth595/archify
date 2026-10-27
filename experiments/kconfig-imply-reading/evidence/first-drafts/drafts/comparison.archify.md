# Why does one imply produce two values? {#imply-comparison}

Both targets receive a weak reverse dependency of `y`, but their direct dependencies differ: the unmet target is `n` and the met target is `y`.[](source:values)

@answer scope="Kconfiglib Kimply · Python 3.15 · no user config"
@meta locale=en repo_url=https://github.com/tt-a1i/archify repo_revision=a2c5843748d3843baa21708f3ec0c51fb15c9985
@source kimply title="Complete Kimply fixture" path=experiments/kconfig-imply-reading/upstream/tests/Kimply lines=1:145
@source implier title="Native formatter: implier" path=experiments/kconfig-imply-reading/observation/run01/output/native-info/IMPLY_DIRECT_DEPS.txt lines=1:23
@source unmet title="Native formatter: unmet target" path=experiments/kconfig-imply-reading/observation/run01/output/native-info/UNMET_DIRECT_1.txt lines=1:19
@source met title="Native formatter: met target" path=experiments/kconfig-imply-reading/observation/run01/output/native-info/MET_DIRECT_1.txt lines=1:15
@source config title="Generated config" path=experiments/kconfig-imply-reading/observation/run01/output/generated.config lines=1:22
@source values title="All 26 observed symbols" path=experiments/kconfig-imply-reading/observation/run01/output/all-symbol-values.json lines=1:444

## What differs between the two targets? {#comparison}

| Observation | UNMET_DIRECT_1 | MET_DIRECT_1 |
| --- | --- | --- |
| Same implier | IMPLY_DIRECT_DEPS = y | IMPLY_DIRECT_DEPS = y |
| Weak reverse dependency | y | y |
| Direct dependency | n | y |
| Observed value | n | y |
| Visibility | n | n |
| User value | null | null |

The fixture explicitly gives the first target `depends on n`; the second has no direct restriction in its definition.[](source:kimply) The native formatter names the same implier for both.[](source:unmet)[](source:met)

## Why does absence from the config not mean uncalculated? {#absence}

The generated config omits the unmet target.[](source:config) Its value `n` comes from the observed JSON and the native formatter, not an explicit config line.[](source:values)[](source:unmet) All three relevant symbols have visibility `n` and no user value in this run.[](source:values)

## Complete Kimply fixture {#panel-kimply}

@code source=kimply language=text

## Native formatter: implier {#panel-implier}

@code source=implier language=text

## Native formatter: unmet target {#panel-unmet}

@code source=unmet language=text

## Native formatter: met target {#panel-met}

@code source=met language=text

## Generated config {#panel-config}

@code source=config language=text

## All 26 observed symbols {#panel-values}

@code source=values language=json

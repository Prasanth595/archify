# jq: what does `.` mean at this point?

Bounded reading experiment based on four queries over one small task/owner fixture. It reuses Archify's explainer and guided diagrams; no jq interpreter, parser, importer, or product runtime is added.

## Evidence and value

The two correct queries produce identical JSON, while their current inputs differ before constructing the result. A third query fails with exit 5. A fourth exits 0 but produces `owner: null` twice. An output-only preview cannot show the different intermediate inputs. A guided diagram may help a reader locate the context they accidentally replaced; reader comprehension and speed have not been measured.

`/usr/bin/jq --version` reports `jq-1.7.1-apple`. Its exact binary SHA-256 and all commands, elapsed times, exit codes, stdout and stderr are in `evidence/native-{1,2}`. This is not an assertion that the Apple binary equals the upstream tag. Each replay has one version command and eight query commands. Plain/marked output bytes and exit codes match; removing only the added DEBUG lines leaves the same stderr. Across fresh replay directories, all 18 paired output streams match after the explicitly recorded run-root replacement.

Markers were manually inserted in separate `.marked.jq` files. They expose values at those selected points, not every VM instruction or a general execution trace. Each run records 18 observations across four independent query executions. Two observations of an equal object do not prove object identity, copying, or memory allocation behavior.

## Reproduce

Requires an existing `/usr/bin/jq` with `debug(msgs)` support and Python 3; the script does not install anything. Use a fresh destination:

```sh
python3 experiments/jq-current-input/fixtures/reproduce.py /tmp/jq-context-fresh
```

Raw stdout is authoritative. `observed.json` is extracted from manually added DEBUG lines. The example uses authored public data, not a user's repository content.

## Source and attribution

- jq 1.7.1, commit `71c2ab509a8628dbbad4bc7b3f98a64aa90d3297`: Stephen Dolan and jq contributors. Code is MIT; documentation is **CC BY 3.0**, as stated in `upstream/jq/COPYING`. [Manual](https://github.com/jqlang/jq/blob/71c2ab509a8628dbbad4bc7b3f98a64aa90d3297/docs/content/manual/v1.7/manual.yml), [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The task/owner fixture and first query adapt the manual's post/author binding example, changing names and values. The contrasting queries, markers and Chinese explanation were added for this experiment. Documentation adaptations retain that attribution and CC BY 3.0 notice; there is no claim of upstream endorsement.
- [jq issue #1326](https://github.com/jqlang/jq/issues/1326) remains open, but was created in 2017 and last updated in February 2017. It establishes historical reader difficulty, not current frequency. Its proposed language changes are not adopted. The pinned 1.7 manual already explicitly explains binding input semantics.
- jnv `9871ba34b611e3c1c559fdcb8d0bc227397c280e`: MIT, copyright 2024 jnv authors. README and Cargo manifest describe an interactive JSON viewer with **jaq**. Source-only screening; jnv was not run.
- jqp `c0c3a857231679bb6e8fb7dc7d57f8283d93d41a`: MIT, copyright 2022 Noah Gorstein. README and Go manifest describe an interactive playground using **gojq**. Source-only screening; jqp was not run.

All nine upstream files are complete and byte-verified against Git blob identities and lengths, with SHA-256 in `sources.json`. Their licenses remain alongside them. Native jq evidence must not be attributed to jaq, gojq, jnv, or jqp.

## Decision and limits

Accept only a fixed teaching artifact using existing Archify capabilities. Defer a generic step evaluator, query editor, engine adapter, and automatic trace importer: each needs language semantics and engine/version compatibility beyond these four cases. The manual plus native diagnostics is the lower-cost baseline. The artifact's additional value is a visible current-input comparison, not a demonstrated improvement over that baseline.

No installation, publication, PR, or merge is part of this experiment. The authorized delivery is an isolated `codex/` remote branch.

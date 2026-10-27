# Offline derived Cargo tree observation

`run01` records an offline native reading comparison, not a build or execution of the upstream test. All 14 `cargo tree --offline` commands exited 0. The raw stdout, stderr, arguments, working directories, UTC timestamps, durations and exit codes are in `results/run01`; `summary.json` contains the complete pre/post fixture hashes and target-directory checks. `cargo -vV` and matching `rustc -vV` are recorded there. Cargo was 1.89.0 (`c24e1064277fe51ab72011e2612e556ac56addf7`), rustc 1.89.0 (`29483883eed69d5fb4db01964cdf2af4d86e9cb2`), host `aarch64-apple-darwin`. This is not the latest Cargo claim.

## Source mapping

The complete upstream `host_dep_feature` test and expected output are in [upstream/deps.rs](upstream/deps.rs), from [Cargo commit 31d3246e0e8d3a80d4a90b54aa48ff180adb408b](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/tests/testsuite/cargo_tree/deps.rs). Its test harness publishes `bar` and `optdep` to a test registry. These fixtures replace that registry with local `path` dependencies; therefore their package source identities and printed paths differ. They are a derived test, not the upstream original or its observed output.

Both arms preserve `foo` 0.1.0, `bar` 1.0.0 and `optdep` 1.0.0; `bar` has optional `optdep`; `foo` uses `bar` normally and as a build dependency with `optdep` enabled; `foo`'s library is empty and build.rs has an empty main. Both arms explicitly specify edition 2015 and resolver 1 or 2; upstream achieves the change with its test helper rather than these explicit fields. The derived `bar` and `optdep` contain empty library files so each path package has a target. They are not registry publications, compilation tests, or proof of actual compiled units.

Upstream Cargo is dual licensed [MIT](upstream/LICENSE-MIT) or [Apache-2.0](https://github.com/rust-lang/cargo/blob/31d3246e0e8d3a80d4a90b54aa48ff180adb408b/LICENSE-APACHE). Upstream expected output is preserved in its full test file; run01 outputs are independently captured from the path-derived inputs.

## Observed native output

- Resolver 1 default tree places optdep under normal bar and marks the build occurrence `(*)`. Resolver 2 shows normal bar without optdep and build bar with optdep.
- Resolver 2 `-p bar` displays two trees for the same version/path, only one with optdep. `-e features -i optdep` traces it to the build dependency; `-d` shows both contexts, not two versions.
- `-e features --no-dedupe` repeats each displayed path. Repeated positions are not proof of distinct package identities or completed build events. Resolver 1 `-d` had empty stdout and exit 0.
- All commands were tree queries. No build, installation or network access was performed; after-state recorded no target directory. Generated Cargo.lock files are in the fixtures and their hashes are in the post-inventory.

The native output is already informative for this deliberately small example. It does not establish human reading benefit, a full actual build unit graph, or a production incident. Graph creation and user study were not part of this observation.

## Reproduce without overwriting

`run.py` accepts explicit tool paths and a new results child; it refuses existing output directories and existing fixture lockfiles. To rerun, create a fresh copy of this folder's `run.py` and fixture source files without the generated `Cargo.lock` files in a new directory, retaining the same relative layout. Do not remove or overwrite run01. Then run:

```sh
mkdir results
python3 run.py \
  --cargo /absolute/path/to/cargo \
  --rustc /absolute/path/to/matching/rustc \
  --output "$PWD/results/run01"
```

Each query passes `--offline`; a private Cargo home and target path are set beneath the new results directory. The program records failures instead of retrying; it does not build or execute fixture code.

# Batch 24 independent delivery audit

2026-10-28. **Pass for the stated research-only delivery scope; no concrete correction required.** This review inspected saved files, computed byte hashes/comparisons, and read the recorded receipts and complete Cargo test. It did not rerun Cargo, rustc, Bazel, upstream tests, builds, browsers, Archify tests or CI; it did not install, modify repository files, create a PR, or verify human reading benefit. Sole authored output is this report.

## Copied bytes and fixture integrity

- Independently read every entry in `audit/round24-cargo-copy-map.json`: **70/70** archived files match recorded SHA-256 and byte size, and **70/70** equal their `/tmp/archify-round24-cargo-native/` originals. The archived package has no unlisted files.
- The original directory has exactly two additional files: `results/run01/cargo-home/.package-cache` and `.global-cache`. These exactly match the disclosed exclusions; they are Cargo bookkeeping, not omitted fixture source or tree stdout/stderr. The original `results/run01/target` remains absent.
- `results/run01/summary.json` pre-inventory has **14** fixture files, post-inventory **16**. All 14 pre-existing entries retain the same hash/size in the post-inventory; the only additions are the two `foo/Cargo.lock` files. Every post-inventory hash/size matches the actual archived fixture bytes.
- The two resolver arms have the same relative file set. The **only** differing file is `foo/Cargo.toml`; its sole textual difference is `resolver = "1"` versus `resolver = "2"`. Both explicitly declare edition 2015. All other manifests, empty source files, build.rs and generated locks match byte-for-byte across arms.
- Both 295-byte lockfiles have SHA-256 `722df078676f90f32a3ae93bc058faee8e591ce974a075b7afe254fc5724b24b`. They list foo/bar/optdep and package dependency relationships, but not the distinct normal/build feature contexts shown by tree. The README's bounded lockfile observation follows from these actual bytes.

## Upstream semantics and adaptations

Read the complete `host_dep_feature` test in archived `upstream/deps.rs` at lines 1361–1466, alongside the delivered full-file identity. It preserves the complete test setup and all old/new-resolver expected tree, package-selection, inverse and duplicate outputs, rather than just one advantageous output excerpt. The file is 54,746 bytes with SHA-256 `0e2118505b5e627829b038bb10cc6c366b1910c7859f1c4779cd3200f40b82f7`; archived MIT license is 1,024 bytes. This audit verifies the delivered copy and its original capture, not a new network fetch of the upstream commit.

The native README correctly attributes this source to Cargo `31d3246e0e8d3a80d4a90b54aa48ff180adb408b` and describes the experiment as **derived**:

- Upstream publishes optdep 1.0.0 and bar 1.0.0 to the harness registry; bar declares optional optdep. Foo 0.1.0 has ordinary bar and build bar with optdep enabled, empty lib and empty-main build.rs.
- Delivered fixtures preserve these package versions, optional dependency and dependency-role facts. They replace registry dependencies with local paths, provide empty lib targets for the path packages, and explicitly specify edition/resolver instead of the upstream test helper's resolver switch.
- Registry package identities/output paths therefore differ. The records are not execution of the original Cargo test, the issue author's project, a Cargo build, or evidence of completed compiled units.
- The pinned **source** commit above is separate from the **actual installed runtime**: version stdout records Cargo 1.89.0 commit `c24e1064277fe51ab72011e2612e556ac56addf7` and rustc 1.89.0 commit `29483883eed69d5fb4db01964cdf2af4d86e9cb2`, both host `aarch64-apple-darwin`. README and validation.json preserve this distinction and explicitly disclaim latest-Cargo verification.

## Receipts and output claims

All **16** per-command JSON receipts equal their corresponding entries in summary.json: **14 tree queries** (7 per arm) and **2 version queries**, all recorded exit 0. Every tree argv has `tree --offline`; commands cover default, normal/build edges, features, inverse optdep, package bar, duplicates and features/no-dedupe. Records preserve cwd, UTC start/end and nonnegative duration; complete stdout/stderr companions exist and are byte-bound by the copy map. The summary records `target_exists:false` and no fixture target paths; source inspection shows run.py executes tree/version queries only, without a build command.

The stdout supports the delivered conclusions:

- Resolver1 default and normal/build trees put optdep below the normal bar occurrence and mark build bar as repeated. Resolver2 normal bar has no optdep, while build bar expands optdep.
- Resolver2 package-bar stdout has two same-version/path roots, only one expanding optdep. Inverse feature stdout links optdep through bar's build-dependency context; duplicates stdout prints ordinary and build contexts of the same bar version. This is not two versions or proof of two executed units.
- No-dedupe outputs expand repeated display paths; the prose does not treat repeated print locations as new package identities or execution events.
- Resolver1 duplicates has genuinely empty stdout, exit 0 and a retained warning on stderr. Initial default-tree stderr contains Cargo's two-package lock message; these nonempty stderr streams were not discarded or misreported as failures.

## Reproduction and exclusions

`run.py:7-16` requires explicit existing cargo/rustc paths and a new immediate child of its results directory, with `exist_ok=False`. Lines 35–37 refuse pre-existing fixture locks. The README instructs a fresh copy of script and fixture sources **without generated locks**, retaining layout; it does not suggest rerunning into the archived run01. Lines 17–18 set a private Cargo home/target path and offline environment; each tree command also has `--offline`. Lines 20–25 write captured stdout, stderr, command, cwd, time and exit for each invocation; lines 38–49 capture fixture pre/post inventory and target checks, and fail the script if query/version status is nonzero. These instructions are coherent for the delivered local path fixture. This review did not execute them.

The harness inherits other environment variables, so the receipt should be understood as this installed-tool environment, not a universal hermetic reproducibility claim. The delivery already supplies version, platform, exact argv, fixture bytes, and raw outputs; no stronger universal claim is made, so no additional framework or environment-hardening work is warranted for this scope.

## Scope, chronology and dedup

README section 24 (lines 611–624), both scouts, validation.json and dedup.json remain consistent about their evidence levels. The Cargo scout is the earlier read-only/source-expected assessment; its “未运行” text is explicitly explained in section24:622 as pre-observation status, while the subsequently executed observation is separately linked. The source-test expected output is never relabelled run01 stdout. Bazel remains source/test inspection, not runtime evidence. No original-fixture/build/latest-Cargo/native-unit-graph/Archify-product/human-value conclusion is asserted.

Dedup is expressly bounded by query/quantity limits. #540 is recorded closed/unmerged rather than proof that all related work is absent; dependency-map, edge-extras, plan-actions, task-occurrences and Ninja/CMake are acknowledged as adjacent research. Deferring a new importer/graph follows the existing native baseline and lack of user-benefit evidence. No new product experiment, installation, merge or PR is implied by this research audit pass.

## Finalization addendum: capture newline correction

After the initial audit, root found and removed one capture-added trailing LF from each upstream file, in both temporary originals and archived copies. The earlier audit's 54,746-byte deps.rs / 1,024-byte license identities describe the pre-correction capture and are superseded below; the initial 70-file copy check proved agreement with those temporary captures, not independent exact upstream capture fidelity.

Rechecked only these two corrected identities against the refreshed copy map and temporary originals: `upstream/deps.rs` is **54,745 bytes**, SHA-256 `5c292f4b11741038ad83bb872ae1e5b6e0c81db3a91f111e7f7e55b1ad47af0b`; `upstream/LICENSE-MIT` is **1,023 bytes**, SHA-256 `23f18e03dc49df91622fe2a76176497404e46ced8a715d9d2b67a7446571cca3`. Both have one trailing LF; both match their map hash/size and corrected `/tmp` originals exactly. Updated validation.json explicitly records the extra-LF capture, correction, refreshed map, and complete-text comparison to retained original connector response. That connector-string equality is root's verification, not independently replayed by this auditor.

Native fixtures, run.py and command/results evidence are reported unchanged; no native command was rerun for this finalization check. The bounded delivery pass remains valid with these corrected source identities.

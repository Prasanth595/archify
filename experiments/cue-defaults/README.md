# CUE defaults: reading-order experiment

This bounded content experiment compares two standalone Archify Explainer pages using the same authored teaching fixture, full native Playground outputs and official source context. The baseline presents the complete evidence first; the candidate begins with the reader's questions and explains them before presenting the same evidence. Neither page adds an analyzer or changes CUE, Archify, or the source fixture.

The questions are whether a reference can lose a unique default without a conflicting value, why interpolation resolves in this example, whether `audit` is still valid, and whether operand order selects a winner. Claims about observed output must come from the recorded Playground packet, not a guessed execution. The native evidence and source context are recorded in `native/`, with independent reviews in `evidence/`.

The fixture is authored for teaching and is distinct from the natural case in CUE issue 1449. Playground observations use its Go API, not a local CLI execution. Issue 3751 concerns a possible future defaults redesign and does not establish current behavior. This is a content comparison, not evidence of improved human understanding or authoring speed.

## Build and current evidence

With Node 22.13 or later, run from the repository root:

```sh
cue_replay_parent="$(mktemp -d)"
node experiments/cue-defaults/build.mjs "$cue_replay_parent/run"
```

The requested output directory must be new; existing directories are rejected and input/output hashes are verified before output is written. The build uses the checked-in Explainer runtime and writes both Markdown drafts, finalize logs and standalone pages into that directory. It does not run CUE. See [native reproduction and identity limits](native/README.md).

The initial build used Node 22.23.3. Both finalize receipts report validation, delivery and artifact checks passed, with browser check not run. Each reported one sentence-length writing warning in the official context. This does not establish visual acceptance or a reading benefit. The original native packet and semantic/source reviews are in `native/` and `evidence/`.

The first drafts and receipts remain in `drafts/` and `artifacts/`; the repaired build is in `final/`. Displayed code omits the final newline; the raw files in `input/` and `native/` are authoritative.

The baseline is an evidence-first Archify layout, not a replica of the Playground UI. Both arms receive the same answer, explanation, complete evidence and source context; only panel order differs. The native UI screenshots provide the separate upstream reference. Review the [validation record](evidence/validation.md) for actual browser observations, inherited limitations and the disposition.

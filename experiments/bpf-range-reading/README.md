# eBPF range reading: paired content experiment

This is a constructed reading comparison, not a kernel execution, verifier log, measured user benefit, or product change. Both pages contain exactly the same full map definition, two complete upstream functions, source attribution, expected messages, privilege distinctions and mathematical explanation. The candidate adds an aligned comparison table; it is a static projection, not an execution or causal trace. There is no native diagram, so no role legend is implied. Compare both pages at the same viewport and theme. The complete fixed source, rather than just the selected excerpt, is available in `upstream/`.

- Baseline: `baseline.html` and `baseline.archify.md`.
- Candidate: `candidate.html` and `candidate.archify.md`.
- Fixed source: Linux commit `d135ab453a7400a34930bdda1ef4bdc8acfac80e`, [`verifier_bounds.c`](https://github.com/torvalds/linux/blob/d135ab453a7400a34930bdda1ef4bdc8acfac80e/tools/testing/selftests/bpf/progs/verifier_bounds.c), selected lines 9–76. Complete copied bytes SHA-256 `8321822a812c1bf78e771a73b678063cc17969dfb676de7f3c91a09fe3cec8ee`.
- File SPDX is `GPL-2.0`; complete original `upstream/GPL-2.0` SHA-256 `8780e78a1a737e127f25a65f6d95269bffd36158dc261114de7859b490bfc5aa` and `upstream/COPYING` SHA-256 `fb5a425bd3b3cd6071a3a9aff9909a859e7c1158d54d32e07658398cd67eb6a0` retain Linux's notices. The syscall exception in COPYING must not be assumed to apply to this fixture. This notice and the original source are not relicensed by the repository's default contribution license. Both HTML pages visibly credit source and license.
- Original `model.py` SHA-256 `ba7655dd4700272622a03106602b5bb7802824fedbd23fc7e8fbfea23ae575ba`. `evidence/model-stdout.txt` records Python 3.15.0 and all 65,536 pairs. It models unsigned 64-bit subtraction and logical shift; it does not emulate Linux verifier abstract ranges or run eBPF. No concrete map contents, null branch execution or verifier internal values were observed.

## Verification and limits

Run `python3 model.py` and `python3 audit.py` inside this folder. The audit verifies the original source hash and selected lines, checks the shared baseline content is identical, and checks both delivered HTML files contain key status, numbers and GPL attribution. It protects provenance and arm parity, not visual quality or the semantics of Linux. Source and verifier owning code were separately reviewed in the hub scout `docs/research/2026-10-26/scouts/bpf-range-reading.md`.

Both `finalize explainer` calls ran using this checkout's `archify/bin/archify.mjs` at base `500d4a65211ffe607fde6b3ce7505027b45bb59e`: validate/deliver/check passed; browser-check was not requested in those calls and did not run there. Writing warnings remain: baseline 1, candidate 2. First candidate finalization collided with the baseline's delivery lock because the two were run concurrently; `draft-1/finalize-failure.json` preserves the failure, and serial retry passed with no draft change. First audit failed solely because of extra trailing whitespace around the appended panel; `draft-1/audit-failure.txt` retains it, then the check normalized only trailing newlines and passed. `draft-1/candidate.archify.md` preserves the first draft. Records are under `evidence/` and alongside HTML; published records replace personal absolute worktree paths with `<WORKTREE>` and are redacted derived copies. `evidence/redaction-manifest.json` binds original and public hashes; unchanged originals remain locally under `/tmp/archify-bpf-private-originals/`.

HTML SHA-256: baseline `52701f3011450eea283827f2284328a28a174d34532ebdabb2c30a3f034be46b`; candidate `c9ffd60d394fbf15bfdab9b8231cc360eec58221387d06722a478c93d6fb91de`. No upstream project, kernel, or BPF test was run. Reader comparison and human acceptance remain open. Local prepublication commit identities in records are retained for traceability, not remote commit links; publication collects the sanitized experiment in one commit.

## Subsequent public browser checks

Serial public `browser-check --require-provenance` runs on the unchanged HTML passed for both arms, with current provenance and no diagnostics. Each checked 1280×900 and 1440×900 in light and dark themes; keyboard traversal reached all 21 baseline and 23 candidate controls in all four combinations. Node was v26.12.0, checkout package 3.2.1-dev.1, Chrome 156.0.8078.48. Before/after HTML hashes remain those above. `evidence/browser-check-selected.json` gives commands, exit codes, each viewport result and raw output paths and hashes. Full stdout and identical raw receipts remain in `/tmp/archify-bpf-browser-baseline/` and `/tmp/archify-bpf-browser-candidate/`, with empty stderr. Complete redacted machine receipts are also published as `evidence/browser-{baseline,candidate}-receipt.redacted.json`. This is automated browser evidence, not perceptual review; the previous finalize receipts still correctly say their own browser gate did not run.

## Actual page observation and reproduction

The separate [page review](root-review/review.md) records actual Ego navigation, themes, horizontal source scrolling, seven inspected screenshots and measured dimensions. Both 1440×900 and 390×844 desktop viewports preserve the tables without page overflow. The candidate adds 10191 bytes and 424px of desktop height (544px at 390px). This supports a readable fixed-content example, not a demonstrated comprehension improvement or a shared-feature recommendation. Open [baseline](baseline.html) and [candidate comparison](candidate.html#compare) locally to compare them; GitHub's source page is not an HTML preview.

For a fresh check, run `python3 model.py` and `python3 audit.py` in this folder. With the repository's documented development dependencies available, run these from the repository root, sequentially, using a fresh output directory:

```sh
node archify/bin/archify.mjs finalize explainer experiments/bpf-range-reading/baseline.archify.md /tmp/archify-bpf-reproduce/baseline.html --json
node archify/bin/archify.mjs finalize explainer experiments/bpf-range-reading/candidate.archify.md /tmp/archify-bpf-reproduce/candidate.html --json
node archify/bin/archify.mjs browser-check /tmp/archify-bpf-reproduce/baseline.html --json --require-provenance --out-dir /tmp/archify-bpf-reproduce/baseline-check
node archify/bin/archify.mjs browser-check /tmp/archify-bpf-reproduce/candidate.html --json --require-provenance --out-dir /tmp/archify-bpf-reproduce/candidate-check
```

Fresh finalization generates local delivery provenance; the published redacted receipts are historical evidence, not portable live provenance credentials. The example remains based on `500d4a65`; remote dev later advanced to `d5d979493bba650b3995836afd379cd249f2d0dd` (compact brand badge and edge-label contrast changes). No result here claims execution on that newer renderer or CI. No PR is created, following the user's branch-only delivery instruction.

AI assistance: Codex agents (GPT-6.1-Terra and GPT-6.1-Sol) performed research, authored the content and mathematical model, ran checks, reviewed source and artifacts, and wrote these records. This does not assert human review or acceptance.

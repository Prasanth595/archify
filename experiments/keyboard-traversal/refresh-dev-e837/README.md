# Keyboard traversal: refresh onto dev e837

The original candidate `c96e8aa74ff5e309cdab07a1b70d0242f33bed75` was normally merged with `dev@e837dc4cb83042d2b6c596e039692e25ec62c2da` in merge commit `49413625`. The only conflict was `archify.zip`; it was rebuilt from the merged tracked source. The candidate's checker and browser test files are byte-identical to the original candidate. Current dev's crossing-budget source changes remain present. Historical experiment files were not rewritten.

## Executed evidence

- Official Node 22.23.2, bundled zlib `1.3.1-e00f703`. Both repository dependency sets installed with `npm ci --ignore-scripts --no-audit --no-fund` (the second with `--prefix archify`). This did not install a live Skill.
- `ARCHIFY_EXPLAINER_BROWSER_TESTS=1 node scripts/run-tests.mjs --require-files test/explainer-browser.test.mjs`: real Google Chrome, **19 passed, 0 failed, 0 skipped**. The native-scroller success and real Tab-trap failure are among the executed cases.
- `node scripts/run-tests.mjs --require-files test/core-smoke.test.mjs`: **19 passed, 0 failed, 0 skipped**.
- Public CLI `browser-check` with `--require-provenance --out-dir <fresh external directory> --json` on the existing trace-flow `final/review.html`: exit 0, status pass, current provenance, zero diagnostics, four containment viewports. Its input SHA-256 remained `4cc2274999e58b9f75b717c053528a85964e3545b3cb0a8fe638b8cdf246dff1`, matching the supplied original identity. Authentic delivery receipt ID `c81d0864-2647-4db0-9dc8-38aac0ed5c80`; neither original input nor receipt was rewritten. This is browser QA, not visual or human acceptance.
- Two independent canonical builds and the committed archive all have SHA-256 `307dde31eae4c66f518dcd022dcc7843bc17b0afd0b0f469bd594963cc1cd0ea`. CRC check passes; all 235 entry names match current dev's archive. Only `archify/explainer/browser-check.mjs` differs in content from dev's archive, and equals merged source. Packed `archify/bin/archify.mjs` and `archify/scripts/check-render-output.mjs` also equal merged source, preserving crossing-budget changes.
- Using the extracted ZIP's `inspectPublicHtml` with Chrome and the existing regression fixture bodies, the native-scroller case reached 2/2 controls in 6 steps (limit 15); the real Tab trap correctly failed with last control missing after 2 steps (limit 12, `focus-cycle`).

Raw command logs and fresh CLI output were kept outside the checkout under `/tmp/keyboard-refresh-e837/`; that machine-local directory is not a portable artifact. The historical fixed-page comparisons and their scope are recorded in [the previous refresh](../refresh-dev-10b4/README.md) and the separate readiness review, not relabeled as new runs. No full suite, hosted CI, Windows, assistive-technology or perceptual review is claimed. Required CI on the final remote head and review remain outstanding.

## Reproduce and inspect

[Selected evidence and raw-file manifest](evidence.json) records the observed fields and SHA-256/size of the raw local files, including the 864 KB CLI receipt without committing its DOM observations. The ZIP inventory comparison and source comparisons were printed during the session but were not separately saved as raw logs. An initial zsh Node probe failed on an unmatched glob before branch creation or merge; its output was not saved. The receipt's pre-run hash was not recorded, so its unchanged bytes cannot be independently demonstrated by a before/after hash; the original receipt was read in place and was not intentionally modified. HTML identity was checked against the supplied original SHA. No other failed verification attempt is known for this refresh.

The machine's Homebrew Node 22.23.3 uses system zlib `1.2.12`, whereas the canonical ZIP script requires the official bundled `1.3.1-e00f703`. We therefore downloaded the official Darwin arm64 Node 22.23.2 distribution for this refresh. The earlier refresh's Node 22.23.2 result and other historical runs retain their original identities; none is relabeled as this run.

From this checkout on an equivalent macOS arm64 machine with Google Chrome and the original trace-flow checkout, the executed commands were:

```sh
mkdir -p /tmp/keyboard-refresh-e837
curl -fsSL https://nodejs.org/dist/v22.23.2/node-v22.23.2-darwin-arm64.tar.gz -o /tmp/keyboard-refresh-e837/node.tar.gz
tar -xzf /tmp/keyboard-refresh-e837/node.tar.gz -C /tmp/keyboard-refresh-e837
export PATH=/tmp/keyboard-refresh-e837/node-v22.23.2-darwin-arm64/bin:$PATH
node -p 'process.version + " " + process.versions.zlib'
npm ci --ignore-scripts --no-audit --no-fund
npm --prefix archify ci --ignore-scripts --no-audit --no-fund
ARCHIFY_EXPLAINER_BROWSER_TESTS=1 node scripts/run-tests.mjs --require-files test/explainer-browser.test.mjs
node scripts/run-tests.mjs --require-files test/core-smoke.test.mjs
node archify/bin/archify.mjs browser-check /Users/tsk/.codex/worktrees/lab-trace-flow-evidence/archify/experiments/trace-flow-evidence/final/review.html --require-provenance --out-dir /tmp/keyboard-refresh-e837/cli-output --json
bash scripts/build-zip.sh /tmp/keyboard-refresh-e837/first.zip
bash scripts/build-zip.sh /tmp/keyboard-refresh-e837/second.zip
shasum -a 256 archify.zip /tmp/keyboard-refresh-e837/first.zip /tmp/keyboard-refresh-e837/second.zip
git show origin/dev:archify.zip > /tmp/keyboard-refresh-e837/dev.zip
```

Use a **fresh** external output directory on a repeat; the named paths above identify this run and must not be overwritten if preserving its evidence. Compare ZIP member names and bytes against `dev.zip`, check CRC, and compare the three source entries listed in the JSON against the working tree. The saved [packed reproduction script](packed-reproduction.mjs) is the exact script used, including its temporary paths. To reproduce it with fresh paths, substitute those paths consistently; it imports the extracted archive's module and uses the current checkout's package dependencies:

```sh
mkdir -p /tmp/keyboard-refresh-e837/extracted
unzip -q /tmp/keyboard-refresh-e837/first.zip -d /tmp/keyboard-refresh-e837/extracted
ln -s "$PWD/archify/node_modules" /tmp/keyboard-refresh-e837/extracted/archify/node_modules
cp experiments/keyboard-traversal/refresh-dev-e837/packed-reproduction.mjs /tmp/keyboard-refresh-e837/packed.mjs
node /tmp/keyboard-refresh-e837/packed.mjs
```

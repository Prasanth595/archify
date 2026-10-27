# Keyboard candidate refresh onto dev 500d

Candidate `9601c9b6e4b6addc2f348677d1c198bc6bc74192` normally merged `dev@500d4a65211ffe607fde6b3ce7505027b45bb59e` in `48eaf689801a7a48ba052db87a028c47b07d794c`. The only merge conflict was `archify.zip`; the merged tracked source was used to rebuild it. The base update changes the static render-output checker and its tests, plus the archive. No candidate implementation was changed.

Official Node 22.23.2 with bundled zlib `1.3.1-e00f703` ran the following focused checks against the merge:

- `test/render-output-checks.test.mjs` and `test/explainer-check.test.mjs`: **96 passed, 0 failed, 0 skipped** in the combined maintained runner invocation.
- `test/core-smoke.test.mjs`: **19 passed, 0 failed, 0 skipped**.
- Two canonical ZIP builds and the committed ZIP match byte-for-byte: SHA-256 `712de2a5db70e88ba6cbab82b2810978da6ac4afc74ac61eecf2471499de4cf9`. All 235 member names match dev's ZIP; CRC passes; only `archify/explainer/browser-check.mjs` differs in content from dev. The packed keyboard checker and static checker each equal the combined source.

The prior [e837 evidence](../refresh-dev-e837/README.md) records Chrome 19/19 and the authentic trace-flow CLI check at tested merge `49413625`, not this merge. Three-page API results retain their original candidate identity in the readiness review. No browser, HTML, receipt or screenshot was regenerated here. The keyboard checker, browser orchestrator, CLI wrapper, renderer, lockfiles and build script were unchanged across this refresh; the changed static checker was checked here with its direct and Explainer caller tests. This reuse does not claim a fresh browser run or visual acceptance. Hosted final-head CI, Windows, AT and human acceptance remain unverified.

[Evidence JSON](evidence.json) records selected results and the sizes and SHA-256 hashes of raw logs and ZIPs retained under `/tmp/keyboard-refresh-500d/` on the executing machine. The expected merge conflict is the only failed attempt in this refresh. These local raw files are not portable artifacts.

To reproduce, use the official Node 22.23.2 binary with the required bundled zlib and existing repository dependencies, then use fresh external output paths:

```sh
export PATH=/tmp/keyboard-refresh-e837/node-v22.23.2-darwin-arm64/bin:$PATH
node -p 'process.execPath + " " + process.version + " " + process.versions.zlib'
node scripts/run-tests.mjs --require-files test/render-output-checks.test.mjs test/explainer-check.test.mjs
node scripts/run-tests.mjs --require-files test/core-smoke.test.mjs
bash scripts/build-zip.sh /tmp/keyboard-refresh-500d/first.zip
bash scripts/build-zip.sh /tmp/keyboard-refresh-500d/second.zip
shasum -a 256 archify.zip /tmp/keyboard-refresh-500d/first.zip /tmp/keyboard-refresh-500d/second.zip
git show 500d4a65211ffe607fde6b3ce7505027b45bb59e:archify.zip > /tmp/keyboard-refresh-500d/dev.zip
```

Compare ZIP member inventory and entry bytes, test CRC, and compare the two source entries as recorded in the JSON. Use fresh paths when repeating so prior raw evidence is retained.

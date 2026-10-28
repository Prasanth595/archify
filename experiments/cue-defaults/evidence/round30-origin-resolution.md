# Batch30: CUE replay origin resolution

2026-10-28. **Previous origin-resolution uncertainty is resolved: all four archived/replay source origins resolve to the correct existing draft, and both replay base directories are correct. No product bug or failing user operation was found. Stop without running patch/replay/tests.** Only read saved records, filesystem identities and source; no repository writes, installs, browser or CLI edit operation. Sole authored output is this report.

## Actual files checked

Read the CUE experiment's `evidence/build-verification.json` and `replay-byte-differences.json`. The fresh run still exists at:

`/var/folders/v1/6vx82zzx32q7y_s1w4sx84j00000gp/T/archify-round29-replay-gp3dyryq/run`

Independently checked `/var`: it is a real symlink with target `private/var`; the run's canonical path therefore begins `/private/var/…`. This alias is observed, not assumed.

For **baseline and comparison**, in both archived `final/artifacts/` and replay `run/artifacts/`, extracted the actual embedded prepared bundle and resolved sourcePath/baseDir relative to that HTML's actual parent directory. Checked lexical path normalization, realpath, existence and `samefile` against expected `drafts/<arm>.archify.md` / `drafts`.

| Arm | Draft bytes | Actual draft SHA-256 | Origin check |
| --- | --- | --- | --- |
| baseline | 4,958 | `0d9666118aaa41104275fe619ee766f75873a9094f93c0fde19afbad6313e45c` | Archived and replay stored sourcePath both resolve to their exact corresponding draft; each matches embedded source.sha256/source.bytes and full sourceText. |
| comparison | 4,958 | `90455575f5fda5aa15a45079f43ac52ef69d614355d06c225edd07dcb0906a54` | Same checks pass in archived and replay locations. |

Both stored replay diagnostic.subject.input values equal their corresponding sourcePath. Both baseDir origins exist and canonicalize to their expected draft directory. Resolution succeeds whether the actual HTML location is spelled `/var/…` or `/private/var/…`.

The HTML hashes also match the existing verification record: archived baseline `5452e3c6…`, replay `23828181…`; archived comparison `54550302…`, replay `089e0e21…`. The unchanged-draft/content conclusion does not imply full HTML byte equality.

## Exact explanation of the long relative path

For each replay arm, calculated `relpath(lexical /var/…/drafts/<arm>.archify.md, canonical /private/var/…/artifacts)` and obtained **exactly the stored long sourcePath string**. Computing the same relative relationship after canonicalizing both ends yields `../drafts/<arm>.archify.md`. The baseDir case is the same.

Thus the long spelling comes from a canonical output-directory anchor combined with the equivalent lexical input origin. Climbing to the filesystem root and returning through `/var` is unnecessarily long but points to the same file. It is not pointing into the archived experiment, escaping to another fixture, or losing the original input. This concrete alias explanation closes the last review's limited uncertainty without asserting new path normalization policy.

## Consumers and scope

- `explainer/prepare.mjs:46-61` records resolved input origin/baseDir and diagnostic source locations.
- CLI delivery passes the delivered page directory into rendering (`bin/archify.mjs`, `ARCHIFY_EXPLAINER_PAGE_DIR` path); `renderers/explainer/render-explainer.mjs:21` forwards it.
- `explainer/render.mjs:140-157` serializes origin/diagnostic paths relative to that anchor and recomputes the complete prepared-bundle digest. Manifest reuses the localized diagnostics. This accounts for the recorded five changed leaves.
- `explainer/patch.mjs:27-35` resolves stored origins against the actual artifact directory (`near`), validates embedded source/digest, and parses the retained sourceText. At:72 it resolves stored baseDir for re-preparing resources; retained dependency paths also use the same relative resolution. The exact origins in these artifacts satisfy that file-resolution prerequisite. No patch invocation was needed to invent a failure where resolution already succeeds.
- `explainer/check.mjs` validates bundle digest and reparses embedded source text with its retained origin for diagnostic context. This is separate from a promise of equal output SHA across different capture paths.
- `explainer/reader.js` does not consume sourcePath/baseDir/digest/diagnostics for displayed answer, snippets, citations or controls. Authored-content revision excludes filesystem relocation, while the full bundle digest/HTML SHA includes it.

This is a specific current-file identity resolution, not a general cross-machine relocation or every edit/resource-flow acceptance claim. No evidence calls for modifying public origins, normalizing archived HTML, changing digests, adding a state layer or expanding tests. Keep the original byte-mismatch assertion failure and expensive-diff interruption truthful; fresh replay exited0 with equivalent content, while exact bytes remain different.

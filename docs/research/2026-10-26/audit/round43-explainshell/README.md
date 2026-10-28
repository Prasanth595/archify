# explainshell native reading baseline · batch 43

This fills the native-UI gap explicitly left by the prior shell-reading-round9 report. The upstream source revision is unchanged. No shell parser, manpage database or teaching page is added to Archify.

## Reproduce the observations

1. Open https://explainshell.com/ and paste inputs.json's known string into the command explanation field. Submit it on the website; do not execute it in a terminal.
2. Hover the complete -e '-foo' span. Its help stays opaque while other known groups dim. The filename remains visible with a question mark.
3. Open the wc command's caret menu and select gnuwc(1). Observe the changed help link and explicit gnuwc.1 selector in the displayed command/address.
4. Submit unknown_option and missing_manual as separate explanation requests. Compare argument-help absence with command-manual absence; the remaining pipe/wc explanation stays present.
5. Submit known again. The captured six span texts, helprefs, classes and titles match the first request. This is a scoped semantic replay, not pixel equality or equality of entire pages.

Seven Ego scripts/logs and seven actual 1440×900 screenshots are archived. All screenshots were visually inspected. Scripts reference the existing taskspace3/p1; adapt those IDs and output paths in another session. observations.json extracts only the prefixed DOM records from the raw logs. The title attributes were read from DOM; screenshots show question marks but do not prove a native tooltip appeared.

The original known case links wc(1) to /explain/1/rust-wc. The alternative links gnuwc.1 to /explain/1/gnuwc. These are website-selected manual identities, not observations of an installed executable or the actual program that would run. The website deployment commit and manpage database version were not established.

## Integrity and scope

```sh
python3 docs/research/2026-10-26/audit/round43-explainshell/audit.py
```

This audits the saved evidence only. No submitted shell command was executed; no notes.txt file was created, no grep/wc output or exit status was collected, and no upstream matcher/parser/test suite was run. The site was used to explain public synthetic text. No install, issue/comment, PR, merge, release or site publication occurred.

Six complete upstream files are fixed to idank/explainshell 827ebe38da9822a10e89946551e377330a9de35e and verified by Git blob, byte length and SHA-256. Original GPLv3 text and attribution are preserved in upstream/LICENSE. These archived source files do not enter Archify's runtime. Displayed manual excerpts retain their own provenance and terms; the repository license is not a claim that all manual content has the same license.

An initial GitHub search omitted is:issue/is:pr and failed. sources.json preserves the failure; the two corrected explicit queries each returned zero. This is bounded indexing evidence, not proof that all related work is absent. The initial guessed local path viewer/semantic-finder.js was also absent; the actual viewer/node-finder.js showed that node text is already indexed, so no new member-search gap was claimed.

Initial staged whitespace diagnostics are retained in preflight/initial-staged-whitespace.txt. Raw upstream/browser bytes are preserved; authored prose, scripts and metadata pass the scoped whitespace check.

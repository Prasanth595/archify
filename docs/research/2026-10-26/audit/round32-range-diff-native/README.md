# Original Git range-diff observation

This is an original synthetic repository observed with **Git 2.50.1 (Apple Git-155)**. It is not an upstream fixture, a natural user incident, application execution, or a Git rebase run. The fixture has one shared base, two three-commit series and a one-commit message-only control. Eight commits in total; full authored file contents are preserved in [initial snapshots](initial/snapshots).

Read the native [default range comparison](initial/range-default.txt), [factor-zero control](initial/range-factor0.txt), [message-only control](initial/range-message.txt), [tip diff](initial/tip-diff.txt), [old series](initial/old-series.txt), [new series](initial/new-series.txt) and [actual parents](initial/parents.txt). These seven text files are unchanged stdout bytes, not manually retyped or reformatted. [copy-map.json](copy-map.json) binds their identities.

[initial/identity.json](initial/identity.json) records all commit SHAs and the observed version. Initial and replay each have 71 command records in their `transcript.jsonl`: every original stdout/stderr stream is retained losslessly in Base64 with SHA-256, argv, elapsed seconds and actual/expected exit code. This is derived archival packaging, not a claim that JSONL was Git's native output. Recorded stdout/stderr paths refer to the original run layout. Init directory paths and timing remain different between runs. No credential, user repository, remote or global Git configuration was used.

Reproduce using an already available Python 3 and Git supporting the options in [run.py](run.py):

```sh
python3 run.py /tmp/archify-range-diff-new-observation
```

The output directory must not exist. The script creates a disposable repository inside it and refuses overwrite. It disables system/global Git configuration, hooks, signing and templates, fixes the fixture identity/dates and records actual command outcomes. It does not install anything or contact a network. This was actually run twice in separate directories. All eight commit IDs and the 22 selected stdout/stderr streams match; no cross-version/platform identity guarantee is claimed. Application Python code is data only.

`python3 verify.py` checks the archived streams against their hashes, validates expected exit codes, binds all snapshot bytes to the `git show` output, and repeats the selected replay comparisons without executing Git. [verification.json](verification.json) is the result of that check, separate from the actual command transcripts.

Inspiration and semantic references: Git contributors' [v2.50.1 source](https://github.com/git/git/tree/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044), [manual](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/Documentation/git-range-diff.adoc), and [GPL-v2 COPYING](https://github.com/git/git/blob/d82adb61ba2fd11d8f2587fca1b6bd7925ce4044/COPYING). The original probe is independently authored; no upstream implementation/test has been redistributed. [source-identities.json](source-identities.json) pins the four inspected files. The Apple binary was not built from or attested against that source.

The [research decision](../../scouts/range-diff-reading-round32.md) explains the boundaries and why this batch adds no Archify runtime, importer, screenshots or new implementation branch.

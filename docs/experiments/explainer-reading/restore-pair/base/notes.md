# Author notes

- First finalize passed with one writing warning: chained “的” modifiers in the conflict caveat (receipt-1.json). Split the sentence; second finalize passed without diagnostics (receipt-2.json). No failed finalize.
- The comparison assumes one tracked, non-conflicted file, an existing HEAD, and the file present in both HEAD and index. The page calls out absent source paths, conflicts, sparse checkout, and submodules; it does not attempt a full guide to those cases.
- The diagram shows possible transfers, not a sequential operation. The four-row table gives the actual source and destinations for each invocation.
- Natural friction: the source/target distinction requires care when mapping three versions into one diagram, especially because `--staged --worktree` chooses HEAD as its default source. The first writing warning required a small sentence split.
- Browser and visual review were not run as instructed; mobile and desktop appearance and human acceptance remain unverified. No performance claim.

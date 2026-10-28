# Independent automated review

[Derived review report](review-report.derived.md), [derived receipt](receipt.derived.json), and [derived final binding](final-binding.derived.json) preserve the independent reviewer’s historical result. Local paths are placeholders; wrappers carry original hashes and byte sizes. These are not original receipts or a fresh execution.

The independent simple-path oracle checked all 4,096 directed four-node graphs × 12 distinct endpoint pairs = 49,152 queries. A self-loop/parallel/cyclic/object-property-ID case and the full production fixture add two: **49,154 queries and 61,448 matching nonmandatory witnesses**. This finite domain is not an exhaustive proof for arbitrary graph sizes. Two independent native CLI/finalize runs and all six exact witness target bindings passed; browserCheck.ran was false.

The initial strict HTML byte comparison failed because generation sourcePath/baseDir and their payload digest bind each run’s paths. The next comparison mistakenly required the independent receipt hash to equal the canonical HTML hash. Both failure logs are preserved as derived records. Corrected v3 compares each receipt to its own output and checks HTML equality outside that provenance; it passed without a source fix.

The final binding and author verification summary record the then-current README hash. Subsequent work only packages evidence and edits README; algorithm, tests and HTML bytes are unchanged. Historical receipts are not relabeled as fresh checks. No human review, upstream implementation execution, performance, shared-suite, install, commit or push is claimed.

# C++ Insights native reading evidence · batch 41

Decision: retain the transformation/reference pattern; do not add an Archify C++ parser, adapter, or another fixed teaching page on this evidence.

From the repository root:

```sh
python3 docs/research/2026-10-26/audit/round41-cppinsights/reproduce.py /tmp/capture-fresh-run
python3 docs/research/2026-10-26/audit/round41-cppinsights/audit.py
```

The output directory must not already exist. Requires an existing macOS /usr/bin/clang++; nothing is installed. Original and transformed programs are compiled with C++17 and run separately. Each prints nine authored observations. Two recorded replays are in runs/. Binary executables are deliberately excluded.

fixture/original.cpp is an authored synthetic comparison inspired by the capture-type question, not a reproduction of upstream issue 64 or a natural reader task. fixture/transformed.cpp is the complete selected output of cppinsights.io; no hand edits or whitespace normalization. Browser script 11 selects the output editor; both the DOM selection and selected textarea contain the same 2,174 bytes.

13 scripts and logs preserve the actual browser sequence, including failures. Four PNGs are actual 1440×900 screenshots, all visually inspected. The website reports cpp-insights 23.1, source 5374b54f704de8610a2c9150df748577c22eb8cc, Ubuntu Clang 23.1.5, default libstdc++ 16. This is the website's version statement, not an independent binary attestation. Local execution uses Apple clang 17; the engines are distinct.

Six unmodified upstream files are pinned and Git-blob/size/SHA-256 verified. C++ Insights is by Andreas Fertig and contributors, MIT; upstream LICENSE is preserved exactly, including its empty copyright-holder field. Tests and documentation were read, not run as an upstream suite. The transformed sample derives from our authored input; no upstream implementation enters Archify runtime.

Known failed attempts: README.md returned 404 (correct case Readme.md); browser script 06 used unsupported snapshot scope viewport after navigating to Version; script 07 then tried the absent editor on the Version page. Script 08 established the page state, script 09 captured it, and script 10 returned Home. An initial extraction assumed textarea index 0 held the selection and asserted; no file was written, so the following scratch compile failed for missing input. Correct extraction selects the unique nonempty fully selected textarea and verifies it equals the DOM selection. All formal runs succeeded. The original scratch compile and these extraction errors were tool-console observations, not archived raw subprocess files; formal replay streams are archived in full.

The result proves only the nine printed observations for this safe fixture. It does not establish general transformation correctness, compiler equivalence, ABI layout, arbitrary lifetime safety, trace completeness, or improved reader speed. No lifetime-UB example was executed. The native website performs transformation, not the recorded local executions.

Initial staged whitespace diagnostics are retained in preflight/initial-staged-whitespace.txt. They concern preserved browser logs, transformed output, and upstream files; the authored documentation, scripts, original fixture and metadata pass the scoped check.

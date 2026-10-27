# Legend correction: independent static review

Reviewed implementation `a16da80e389ab9a97e2dacfb7145905c333927e1` against `4d0d21c6db1530e274fc1b0487ce65329c4574de`, by GPT-6.1-Sol. No product code, tests, renderer or schema changed.

- Decoded the selected prepared diagram embedded in both actual outer HTML files. Its canonical SVG matches the saved old/new SVG respectively. Only legend `data-legend-label` and visible text change from `后端` to `操作`.
- Outer figcaption remains `三个顺序要求不能同时成立`; preview role and accessible name, SVG title and `aria-labelledby`, and static dialog identity/name binding are preserved.
- New native JSON equals the captured old prepared three-column Chinese input after normalizing runtime output/quality and excluding the added legend label. This comparison uses the input selected by `prepareExplainerDiagrams`, not the raw one-column shorthand compiler result.
- Common prose, source fixture and constraints are unchanged. Root reran `audit.py` and checked baseline HTML/source against `4d0d21c6`; both are byte-identical.
- Final artifact SHA-256 is `65f0b87b6b230600971af7e2895f65cc227bfe875d972cc158c350ce8a84b3b2`, 537543 bytes. Baseline remains 156572 bytes; incremental file size is 380971 bytes. No new page-height or reading-benefit measurement.

The implementation's four automatic stages passed, with three retained writing warnings. Initial one-column label-overlap failures and an intermediate missing-locale result remain in the local evidence directory. [Selected raw-file manifest](raw-file-manifest.json) records actual file hashes; it is not a substitute for raw receipts.

At the time of the static review, manual UI follow-up was pending because Ego research TaskSpace 4 was missing. The user subsequently authorized recreation. Root completed actual open/theme/Escape interaction at 1440×900 and inspected three fresh screenshots; see [manual observation and bindings](manual-review.json). Light and dark dialogs display the corrected 操作 legend. Escape closes the dialog and returns focus to the opener. Current page dimensions were 1440×1805. The artifact bytes remain those reviewed above; existing eight screenshots keep their original `4d0d21c6` identity. No browser upgrade, new mobile comparison, human acceptance or faster-reading claim.

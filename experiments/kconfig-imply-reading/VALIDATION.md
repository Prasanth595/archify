# Batch 20 validation

Decision: retain this bounded content experiment on its own remote branch. It packages a complete native observation into an offline explanation; it has not established faster or more accurate human reading, and its automated browser gate remains failed. No product files were changed.

## Source and observation

Kconfiglib is pinned at `061e71f7d78cb057762d88de088055361863deff`, ISC. Complete `tests/Kimply` has 145 lines and SHA-256 `0952741f2cf17f091d74bfb689a08fbbf8b584d6f7c31cef786fde2c88f6c9ed`. The fixture has no sourced external files or environment/shell expressions. One native Python 3.15.0 execution exited 0, recorded 26 symbols, no user assignments, empty stderr and an empty Kconfig warning list. It invoked the native information formatter programmatically; it did not run curses UI or the upstream suite. The command record is explicitly a transcription of the executed invocation, not an independent environment attestation.

The selected implier is y. Both target weak reverse dependencies evaluate to y; direct dependencies and resulting values are n/n for UNMET_DIRECT_1 and y/y for MET_DIRECT_1. Their visibility is n. The omitted UNMET config entry is not the evidence for its n: native information text and computed JSON provide that evidence. See [independent source audit](evidence/reviews/native-audit.md).

## Delivery attempts

| Attempt | Baseline | Comparison | Result |
| --- | --- | --- | --- |
| render01 | original draft | original draft | Both validate/deliver/check pass; finalize exit 1 with 12/40 keyboard traversal errors. |
| render02 | final baseline | first repair | Both non-browser stages pass; finalize exit 1 with 28/52 traversal errors. |
| render03 | unchanged, evidence reused | final wording repair | Comparison non-browser stages pass; finalize exit 1 with 52 traversal errors. |

Two bounded content repairs were made. The first added standalone attribution/license/context, placed complete native formatters ahead of the full fixture, and clarified implier/visibility terminology. The second distinguished the unmet **target's value** from its direct dependency in the answer. First drafts and the intermediate revision are preserved. No renderer, schema, checker, source-card behavior or gate was altered to obtain a pass. Final baseline/comparison HTML SHA identities and 270 unchanged producer-file hashes are recorded in the evidence.

The independent [delivery review](evidence/reviews/delivery-review.md) found that all eight repository source texts match their frozen ranges, both prepared source packets match, and the candidate preserves all seven baseline evidence panels. Its stale README-status finding was corrected here; the original review remains unchanged.

## Actual browser observations

Ego research space 24 had disappeared. Inventory confirmed it absent; space 28 was created under the user's existing authorization to rebuild the research space. Only this task's page was used.

Both pages were inspected at 1440×900 and 390×844 CSS pixels. Source hover displays the native unmet-target excerpt and pin; Escape hides it without changing the observed scroll position. Source clicks are ordinary jumps to the Sources list, not the hover action. Narrow-view comparison remains readable but breaks long labels and identifiers; the shared toolbar extends about 11px beyond the 390px viewport. Code/license lines may scroll within their code blocks. This is desktop Chromium at narrow width, not physical touch-device coverage.

Actual native Tab input reached the footer after 52 presses in the baseline and 74 in the comparison. This is a bounded observation in Ego, not proof that every control/platform passes, and it does not supersede the separate automated checker failures. Headline citation of the full JSON previews its beginning (MODULES), so the more targeted native-format citations are useful; the full JSON remains in the page.

With target-scoped network emulation offline, both HTML files loaded, fonts were ready, no HTTP resource entries were recorded, and the fixture/license text and all 26 parsed JSON values matched the frozen files. Source hover and Escape still worked. Network emulation was restored in a finally block. External source URLs were not opened under offline emulation.

The first browser capture commands redirected stdout only, while Ego sent console records to stderr. PNG files existed, but the six initial JSONL files were empty. These empty files and the earlier images remain under `capture-errors/` and `browser-before-log-recovery/`. Final content/source/keyboard/offline observations were re-collected with both streams captured; they are not retroactively attributed to the initial empty logs. The original first-draft screenshots were not regenerated. Action records and final JSONL logs are saved.

## Scope and cost

This adds two small experiment scripts and pinned evidence, not a Kconfig importer or shared runtime dependency. The native baseline includes the same complete facts as the candidate; it is a portable rendering of native formatter output, not a recreation of native TUI navigation. Human reader answers/timing, upstream full-suite results, hosted CI, full product acceptance, mobile touch and AT coverage are absent. Keep this branch as a reviewable prototype while the wider research goal continues.

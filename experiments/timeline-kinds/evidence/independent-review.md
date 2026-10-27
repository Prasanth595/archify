# Timeline event kinds — independent source review

Disposition: **worthwhile; no blocking defect found in the agreed candidate**. This addresses a directly reproducible semantic error: Timeline events were exposed to Passport/Finder/Lens/Story as architecture drawing roles. Five dedicated `timeline-*` identities preserve event meaning while retaining the existing tone palette. The bounded renderer translation adapter and hash adapter are proportionate compatibility cost.

## Identity reviewed

- Workspace: `<USER_HOME>/.codex/worktrees/lab-timeline-kinds/archify`; branch `codex/lab-timeline-kinds`; HEAD/base `d5d979493bba650b3995836afd379cd249f2d0dd`.
- Uncommitted source candidate: `/tmp/archify-round13-timeline-tests/final.patch`; independently checked SHA-256 `245ff00a1d814d715552384273b819a2ad1337a08eb64a80f5a4aa730bf188fb`.
- Reviewed 19 changed source/generated-template/test files. Concurrent untracked `experiments/timeline-kinds/` belongs to the parent reviewer and is outside this source review.
- Read AGENTS.md, CONTRIBUTING.md, REVIEWING.md, archify-review, test-value and its decision examples. No repository changes, commits, pushes, live installs, Ego actions or suite reruns performed.

## Findings

No actionable blocker or required implementation change.

- `render-timeline.mjs:28–51` resolves the already registered document locale before generating additional labels. For each category, a valid explicit new key wins, then a valid explicit legacy tone key, then the independently translated `legend.timeline.*` message. Invalid supplied values are excluded through the existing placeholder validation. `registerLocale` layers onto a document catalog, not a bundled catalog. Unsupported locales with no usable authored overrides remain English; unknown locales with valid authored overrides retain the authored locale through the existing catalog resolution.
- `render-timeline.mjs:485–488` changes semantic identity only; tone classes, card/pin/accent/legend rendering still use KIND_TONE. Omitted kind remains default/Event. The original SVG legend continues reading `legend.timeline.*`; new or legacy Passport overrides do not replace it. An authored legend translation can intentionally seed the default Viewer label, while an explicit new Viewer key still wins.
- `viewerKindLabel` is the common label path used by Passport, Finder and Lens. The prefix normalization gives canonical dotted translation keys to the new kinds. Other existing kind strings keep their prior lookup. Finder prioritizes the authored data-node-kind rather than inferring tone classes. Story facts (`archify/story/tool.mjs:51–59`) pass the raw semantic attribute through, so exported facts keep `timeline-*` without reverting to tone or localizing the raw identifier.
- `viewer/semantic-lens.js:543–553` translates legacy hash tones only when the actual SVG has `data-timeline-ui`, before available-kind filtering, deduplication and the existing two-kind limit. New canonical hashes remain accepted and copy-link emits selected canonical identifiers. Architecture links preserve the original tone meanings.
- `viewer/viewer.css:1140–1167,1314–1339` maps four radar kinds and all five Lens kinds to existing palette variables. Radar recovery correctly uses the existing backend default. No card geometry or independent legend CSS is changed. Existing palette-variable customization remains effective; selectors deliberately targeting old semantic data-node-kind values are subject to the documented identity change.

## Test value and evidence

The new assertions use the agreed event-category contract as their oracle, rather than deriving expected labels from candidate output. The preserved real-Chrome baseline failure records the concrete bad technical labels (Backend/External/Frontend/Message bus/Security), providing independent discrimination. The cheap renderer assertion protects raw semantic serialization even when the optional Chrome test is not selected.

The browser path checks actual Lens labels and colors, Passport default label, Finder absence of technical roles, Story raw kinds, five old hashes, canonical copied hashes, legacy/new translation precedence, independent legend labels, authored Lens instruction, default-only input, unsupported-locale fallback, Chinese labels and an architecture isolation case. Shared consumers use the same label function, so duplicating every category across each surface is not necessary. The browser case is conditional on ARCHIFY_CHROME, but the recorded candidate run actually executed it; it was not skipped.

Reused author evidence: `candidate-after-repair-2.json/.stdout` records the final five-file selection (Timeline renderer/DST, semantic Lens browser, Viewer generator and i18n), **379 passed, 0 failed, 0 skipped**, Node v22.23.2, about 29.8 seconds. The receipt records both intermediate repairs and retains their failed evidence. These are author-run results, not reviewer-rerun results. Source/hash identity was checked independently. The final `.patch` includes the tested repairs; no current source change beyond the parent’s experiment artifacts was observed.

## Boundaries

This supports source correctness and scoped local acceptance, not merge/release/install acceptance or a general generation-quality improvement. Parent reviewer owns comparable visual/Ego evidence. No full suite, packaged ZIP/gallery/example refresh, external CI, live installation or human product acceptance is claimed. Story scan/raw kind propagation was covered; this change does not establish new end-to-end video-export quality. No further speculative security/race work is warranted by this diff.

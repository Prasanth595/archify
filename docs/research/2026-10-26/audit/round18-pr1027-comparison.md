# Batch 18 — fixed PR #1027 source comparison and producer

**Do not start a competing Lens implementation.** PR #1027 already owns adjacent Lens/dock reachability work. Its exact head has relevant mobile improvements, but source inspection does not establish that it fixes either recorded desktop trigger. In fact its desktop Lens remains vertically bottom-anchored without a viewport/container clamp. The next authorized step is the parent’s two-fixture comparison using the frozen producers, then record evidence for the existing review scope.

## Frozen producer and identity

- Read `/tmp/archify-round18-dedup.md` before source comparison. No PR comments, approvals, branch edits, installs, rendering or tests performed.
- The fixed commit was initially unavailable locally. Ran `git fetch origin refs/pull/1027/head` in the hub; FETCH_HEAD resolved exactly to **c393fc7fbc321d5b6c4685ca35cd612b75d64083**. Fetch did not check out or edit a contributor branch/worktree. Hub working tree remained clean.
- Exported only tracked `archify/` from that exact commit with `git archive` into **`/tmp/archify-round18-pr1027/archify`**. No dependency bridge or node_modules created by this reviewer.
- **All 238 tracked source files verified**: each extracted file’s bytes equal its fixed Git blob, with Git blob SHA-1 recomputed and checked, plus SHA-256 and byte length recorded. Archive extraction used the fixed Git tree and retained executable metadata.
- Frozen manifest: **`/tmp/archify-round18-pr1027-source-inventory.json`**, SHA-256 **0af3c98877c59a43919d07592a441ba1e1bd95c0f2ea7c255d483f4f21956bbb**. It enumerates Git paths/modes/blob IDs, byte lengths and SHA-256. Keep it unchanged when parent adds an external dependency bridge. The manifest inventories tracked source, not runtime dependencies.
- Parent will separately reverify baseline `/tmp/archify-round13-base`; that baseline has not been relabelled as newly verified here.

## Relative history and attribution boundary

`merge-base(d5d979493bba650b3995836afd379cd249f2d0dd, PR-head)` is **10b4dd5c5f2264baa315ee65a9b4cc23c13ea5f0**, matching the PR base recorded in dedup. Relative to d5, the histories have **38 dev-only commits / 16 PR-only commits**. Therefore a raw d5-versus-exact-PR comparison is a whole-producer comparison across diverged history, not a clean Lens-only intervention.

The raw d5→PR diff touches 92 files including generated HTML/archive/gallery, mobile and print tests, focus/Passport, Viewer chrome/CSS, older architecture rendering and composition/edge-checker state. The removed newer edge-label variables/checker logic in that comparison must not automatically be attributed to the PR author: comparison against the merge-base shows authored runtime-source changes in **viewer/focus.js, viewer/viewer-chrome-layout.js, viewer/viewer.css**, and no authored changes in `archify/renderers`, `archify/scripts` or `archify/bin` relative to that merge-base. Generated counterparts/package and tests are also part of the PR. Report any fixture difference with exact producer identity; do not call it a causal effect of Lens changes alone.

## Two observed triggers versus exact source

### 1440×900 long Waterfall: panel footer below viewport

Baseline actual geometry: `(x49, y670.375, w320, h258.3203125)`, bottom **928.6953125**, while viewport height is 900. This is a recorded viewport cutoff, without proof of bottom clipping by an ancestor.

At exact PR head:

- `viewer/semantic-lens.js` is **byte-identical to d5**. Its dockPanel still only compares left/right candidates at the measured unchanged vertical top/bottom; it has no vertical clamp, scroll listener or height fitting.
- Desktop `.semantic-lens` remains absolute with `bottom:calc(4.15rem + var(--archify-nav-reserve))` and `overflow:hidden` (`viewer/viewer.css` around 1217–1230). Added flex column/kinds shrink does not cap the desktop panel to the viewport.
- The new measured `--archify-dock-h` is published in viewer-chrome-layout, but desktop Lens does not consume it; navigation lift still governs navigation, not Lens.

**Source prediction:** no new mechanism directly fixes this desktop cutoff. Do not label it a reproduced PR failure until the parent runs the fixed producer on the same input/viewport/scroll and records actual geometry.

### 1440×900 single-span Waterfall: Lens title/close clipped at container top

Baseline panel top **16.0703125** is inside viewport, but actual image clips paint at the diagram container top near y84; this is ancestor `overflow:hidden`, not screenshot cropping at the viewport.

At exact PR head:

- Container clipping remains. Desktop Lens top remains derived from the same bottom anchor with no container-top bound.
- Added flex column and `.semantic-lens-kinds {flex:1 1 auto;min-height:0}` improve shrinkability when a height cap exists. They do not on their own add a desktop height cap or reposition the header.
- PR mobile max-height/bottom/dock-height rules are inside the narrow media branch and therefore do not apply at 1440px width.

**Source prediction:** the short-container trigger remains outside the new direct correction mechanism. Exact output dimensions must still be checked, since CSS flex sizing and the older producer can change total heights or other geometry.

## What #1027 already covers

The contributor adds measured mobile dock height, mobile dock wrapping, related panel offsets/padding, flex Lens with shrinkable scrollable kind list, presentation start alignment, compact Passport fitting/reserve and scroll updates, and print cleanup. Existing head tests include real browser Lens header/close and Clear/Copy hit testing at large 24px root font under the mobile layout, plus 320×300 Passport/dock composition. Those are useful related reachability boundaries, not interchangeable with the two 1440×900 native Waterfall cases. This inspection does not rerun or endorse those tests and does not override the maintainer’s held mobile scope/acceptance decision.

## Minimal next evidence and disposition

Parent can now run the exact exported PR package through the existing dependency bridge against the same frozen long and single-span inputs. Record canonical SVG identity, container/panel/navigation rectangles, viewport/scroll, accessible controls and actual screenshots. Compare to d5 and retain failures. Any changed drawing/output must first be explained against the diverged producer versions. Do not patch the PR, rebase/merge it, rebuild its tracked source or open a competing PR from this investigation.

Outcome of this task: frozen producer available and blob-verified; source mechanism compared; **no implementation and no current claim that #1027 passes or fails the new fixtures**. The adjacent ownership is concrete, so coordination/review evidence is the appropriate next step.

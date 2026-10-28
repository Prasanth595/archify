# Root Ego evidence index

All 14 PNGs were viewed by the root agent. They are copied byte-for-byte; [index.json](index.json) records each raw/copy SHA-256 and byte count, while [image-bindings.json](image-bindings.json) additionally binds each PNG to its actual artifact revision and pixel dimensions. Mixed revisions are intentional. A filename beginning `final-` is **superseded 30b evidence**, not the current candidate.

The current artifact is `f05da5e4babffa3572be6443a3d7f89ddfb127d6ec8ec6dbecdbe0070e4f8aca`. See the root agent's exact bounded account in [ROOT-NARROW-ACCEPTANCE.md](ROOT-NARROW-ACCEPTANCE.md). This records real agent-operated Ego interaction and image inspection; it does not imply human acceptance, remote CI, screen-reader testing or a measured efficiency benefit.

| Current f05 image | Scope |
| --- | --- |
| [repaired-c-full-view-light.png](repaired-c-full-view-light.png) | **Primary image**, 1440×900, new cold query, scrollY0, auto-focus zoom148%. It shows the selected c region viewport; all authored graph data remain present, but not every node fits this screenshot. |
| [repaired-c-region-light.png](repaired-c-region-light.png) | Native node-index selection, Space activation and complete region details in desktop light mode. |
| [repaired-c-narrow-details-dark-top.png](repaired-c-narrow-details-dark-top.png) | 390×844, settled cold layout followed by native summary click. |
| [repaired-c-narrow-details-dark-bottom.png](repaired-c-narrow-details-dark-bottom.png) | Genuine wheel scroll reaches the final crossing record e4; DOM hit-test confirms usability. |

Current DOM records: [desktop keyboard and two Escapes](repaired-desktop-keyboard.json), [narrow opening](repaired-narrow-open.json), [last crossing record](repaired-narrow-last-row.json).

Historical groups remain available for comparison:

- Base `6ca6`: `baseline-*`; ordinary downstream b contains later regions and does not supply Cycle region.
- d2cc: `candidate-b-region-light.png` / `.json`. [stage-note.json](stage-note.json) is preserved verbatim: the previous HTML was reconstructed by reversing one URL condition and matched its recorded complete HTML hash; this was **not an original saved raw copy**.
- 30b: all `final-*` images and DOM records. In particular, [the clipped narrow details](final-c-narrow-details-dark.png) and [its DOM](final-narrow-details.json) are the real failure that invalidated the earlier readiness claim. They have not been relabeled as f05 evidence.

The small-screen base toolbar still has horizontal clipping. The current fix closes cycle-detail reachability only; it does not claim a general small-screen Viewer repair.

Raw originals remain outside the repository. Per-file entries name their original SHA/bytes and identify original-byte versus explicitly named derived-redacted copies. No copied text here required path redaction; the index still records both original and copy identities.

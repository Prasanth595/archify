# Adjust native connections

Run `node archify/bin/archify.mjs edit <type> <source.json> [output.html]`.
Use `--no-open` to print the local URL without launching a browser. Quality and
repository options are the same as native preview. Architecture, workflow,
dataflow, class and ERD diagrams expose editable route geometry.

Architecture diagrams also support new connections. In Draft, hover a node and
click a **+** on an unused side, then click the destination node's connection
point. Available destination points appear after selecting the start. Click the
selected start again or press Escape to cancel. The popup asks only for an
optional label. Direction follows the two selected points. The native router and label placer
must find room without moving existing nodes, routes or labels; otherwise the
connection is not added. This first slice uses one connection per node side and
does not infer the extra relationship fields required by Class or ERD diagrams.
Creation makes one local planning request, not a full render. The new connection
joins the same draft and Undo/Redo history. Toggle Draft off to inspect the
displayed draft with the native relationship and reachability controls. Save
writes JSON and rebuilds the native Viewer with the same relationships.

Choose **Draft** in the existing top-right control group, then select a
connection. Drag an interior segment, or drag the label itself along its
route. A straight
connection gets a movable detour. Arrow keys move a focused handle; Shift uses
a larger step. Labels keep their position along the attached segment as it moves;
retracting a detour snaps adjacent segments into alignment and merges the
redundant corners, so a connection can return to a straight route.
Undo and Redo restore the line and label together. Toggle **Draft** off to return
to reading. Undo and Redo appear
beside Draft while editing; Ctrl/Cmd+Z and Shift+Ctrl/Cmd+Z also work.
Draft selection uses the current route geometry and does not open Semantic
Passport. Handles follow their segments during dragging. Motion stops at direct
node, canvas and label-box collision boundaries; it does not jump across blocked
positions. Reaching a boundary keeps selection, handles and history available.

Draft gestures, Undo and Redo run locally without compilation, network requests
or page reloads. Native crossing and composition rules still apply at save time;
the local motion bounds do not replace those final checks. The editor keeps nodes,
structural regions and canvas geometry fixed. Other automatic routes may change
only through shared ports, nearby corridors or label-clearance constraints;
other authored routes and absolute label positions stay protected. A rejected
save keeps the draft and the previous saved files. Route adjustment cannot change
endpoints, labels or topology.

Label-only changes retain their existing absolute or relative binding mode.
An adjusted route pins its displayed label position with the route. Shared
structural trunks remain protected because they have no individual relationship
binding. The editor also preserves custom or older HTML that the selected source,
quality setting and current renderer cannot reproduce; choose a separate output
for that source rather than overwriting the existing page.

Choose **Export → Save changes** or Ctrl/Cmd+S to submit the complete draft in
one finalization, including native generation, delivery provenance and browser checks.
Only saving invokes the native generation pipeline after the initial page load.
Failures show a dismissible short explanation; full diagnostics are available under
**Technical details**. Saving never silently discards a rejected draft.
Opening or adjusting a working copy does not overwrite the original files.
Changes made to the originals outside the session block saving. Stop the local
command with Ctrl+C. Unsaved drafts live in the current browser tab; leaving it
prompts before discarding changes.

The saved HTML remains a normal native Viewer. Reopen the same source with
`edit` for another adjustment. Editing requires the source JSON and a local
renderer; displayed SVG geometry alone does not identify all authored choices.
An HTML with an attached story must remain intact; use a separate native output
for adjustment, then rebuild its story from the adjusted source.

## Workflow measurement

The first readable-v2 edit records the effective sizing policy separately from
route coordinates:

```json
"layout": {
  "contract": "readable-v2",
  "lanes": "independent",
  "sizing": "adaptive"
}
```

`lanes` is `independent` or `shared`; `sizing` is `adaptive` or `absolute`.
This preserves the current coordinate system when a new `via` or `labelAt`
would otherwise select legacy absolute sizing. Existing documents without this
declaration retain their historical interpretation. Fixed-v1 documents retain
their existing contract and do not accept a readable-v2 declaration.

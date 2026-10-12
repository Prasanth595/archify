# Hierarchy Renderer

Render `diagram_type: "hierarchy"` JSON files into the standard Archify HTML
template with progressive expand/collapse.

```bash
node archify/renderers/hierarchy/render-hierarchy.mjs input.hierarchy.json output.html
```

The renderer validates input against `archify/schemas/hierarchy.schema.json`
via the bundled standalone validator; the renderer itself checks root
existence, the exactly-one-null-parent invariant, parent dangling refs, and
cycles across the parent pointer chain.

If `output.html` is omitted, the renderer falls back to the `meta.output`
field of the JSON file.

## IR shape (schema v1)

```json
{
  "schema_version": 1,
  "diagram_type": "hierarchy",
  "meta": { "title": "Payment platform", "theme": "dark", "viewBox": [960, 640] },
  "root": "platform",
  "nodes": [
    { "id": "platform", "label": "Payment Platform", "parent": null },
    { "id": "orders", "label": "Orders", "parent": "platform" },
    { "id": "checkout", "label": "Checkout", "parent": "orders" }
  ],
  "default_expand": ["platform"]
}
```

- `nodes[].parent` is either `null` (allowed only for `meta.root`) or another
  node id. Cycles are rejected.
- `default_expand` lists node ids whose subtree is open on load; everything
  else starts collapsed. The root is always open.

## Interactivity (first slice)

- Each branch button owns its subtree via `data-node-id` and an
  `aria-controls` pointer to a `<g data-hierarchy-subtree>` wrapper.
- Clicking a chevron or pressing Enter/Space while it has focus toggles
  the subtree. Collapsing moves keyboard focus back to the parent's
  button if focus was inside the subtree.
- `meta.allow_view_all: true` (default `false`) exposes a top-right
  **Expand all / Collapse all** tool pair.
- Respects `prefers-reduced-motion` by skipping the height transition.
- No browser-only features beyond vanilla DOM; the behaviour is plain
  JavaScript shipped inline in the SVG.

## Open questions for the parent slice

- Cross-branch connectors (a non-tree edge between two descendants of the
  same ancestor) are deferred per the issue.
- Multi-parent trees are deferred. The first slice enforces a single
  `parent` per node.
- Runtime editing of the hierarchy (drag-to-reparent, etc.) is out of
  scope.
- Embedding a hierarchy inside another diagram type (e.g. an Architecture
  diagram whose components are hierarchies) is not supported yet.
- Mature interactive export (PNG/SVG of a particular expanded state)
  needs a separate spec; the renderer ships a single static frame plus
  its runtime behaviour.

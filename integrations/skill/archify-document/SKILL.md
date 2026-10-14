---
name: archify-document
description: Render Markdown using any HTML design or Archify report layout, including optional native document components. Also create or adapt a user's HTML design and its configuration interface. Use for styled Markdown reports and HTML answers, not typed diagram JSON.
---

# Archify document

Use the existing renderer and ordinary Markdown. Honor the user's chosen design.
The HTML supplies presentation and computation; its name does not classify the
Markdown's business meaning.

Use `list_document_templates`, `scan_html` and `render_markdown` when available.
With shell access, use an existing Archify CLI or checkout. Commands below use
the checkout's absolute path. This skill does not install or configure agents.

## Select and render

Choose one design source: `design_path` for local HTML, `design_url` for HTTP(S),
`template_path` for a saved directory or manifest, or `template` for a built-in
ID. IDs are decision/static, analysis/static and review/static. Unspecified requests use review/static.
Choose the presentation requested by the user, not a role inferred from prose.

Supply exactly one of `markdown` and `markdown_path`, and an `output_path`.
File-based links resolve from the Markdown file; inline links use the runtime's
working directory. Any supplied HTML can provide the design. Rendering scans
the current HTML before filling its content positions.

```json
{"tool":"render_markdown","arguments":{"markdown_path":"/path/report.md","template":"analysis/static","output_path":"/path/report.html"}}
```

The same envelope works with `node /checkout/archify/bin/document-tool.mjs request.json`.
Direct CLI examples:

```sh
node /checkout/archify/bin/archify.mjs document templates --json
node /checkout/archify/bin/archify.mjs document /path/report.md /path/report.html --design /path/design.html --json
node /checkout/archify/bin/archify.mjs document /path/report.md /path/report.html --template analysis/static --json
```

## Report families and components

Decision briefs lead with a recommendation and its conditions; analysis keeps
observations, sources and explanations together; reviews follow authored events,
differences and subsequent actions. Write that order into Markdown. Each template retains its existing figures.

Available native components: `regions` connects two groups; `converge` joins two
paragraphs to one; `branch` adds a side path to three steps; `lanes` alternates
four steps across two regions; `decompose` expands one paragraph into two and
four; `return` shows three short stages with return and wait paths.

When selecting one of these components, read
`references/document-components.md` in the Archify package containing the CLI.
It lists presets and paragraph marks; components use the same document renderer.

## Implement a custom template

A custom HTML file needs no registration or renderer patch. Give its replaceable
content real headings, paragraphs, lists, tables and code. A main region and
repeatable chapter wrappers express structure. Keep the HTML's CSS, SVG and
program in that file or its normal assets.

Inspect the actual DOM before using `content_selector` for one content root or
`exclude_selector` for regions to preserve. Resolve structural boundaries;
do not classify paragraphs by words such as benefit, cause or action.

Template programs can read actual cells, list nesting and heading order.
Keep complete text and source values accessible. Use documented component marks
only in HTML that implements them. Do not invent measurements, causality or
completion status to fill a visual.

For user-configurable behavior, declare a JSON entry:

```html
<script type="application/json" data-document-options>{"density":"regular"}</script>
```

Pass `design_options`, or a JSON file after `--design-options`. The template owns
its option names. Options are data; HTML without that entry does not receive them.

If the renderer reports missing inputs, use its diagnostic to supply them or
adapt the template within the user's editing scope.
Do not hide failed computations by deleting scripts or fabricating their inputs.

## Deliver

Return `output.path` from a successful renderer response. On failure, report its
diagnostics and correct the requested input where appropriate. Rendering checks
belong to the renderer.

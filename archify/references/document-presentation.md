# Document presentation

Read this for styled Markdown documents or rendered answers. Use ordinary Markdown and the existing document
renderer. Any supplied HTML can provide the design; it owns its styles, layout,
components and scripts.

If its calculations need inputs absent from the Markdown, report the concrete
render diagnostic or adapt the HTML within the user's editing scope. Preserve
the authored content and do not fabricate inputs to make a diagram appear.

## Select a presentation

Honor the user's HTML when supplied. Otherwise choose a report family for the
requested purpose and arrange the Markdown accordingly:

| Family | Intended reading | Useful authoring choices |
| --- | --- | --- |
| `decision` | Understand the recommendation, alternatives and supporting conditions | Lead with the recommendation; place alternatives and their stated conditions together; finish with the next action |
| `analysis` | Follow an investigation, evidence and explanation | Keep observations beside their sources; group related objects or measurements; retain code and limitations where they are discussed |
| `review` | Follow a retrospective, differences and subsequent work | Use the authored order of events or steps; state observations, changes and follow-up actions explicitly; supply dates when a time scale is intended |

Their IDs are `decision/static`, `analysis/static` and `review/static`. These
are ordinary HTML designs; `review/static` is the default when no design is selected.
Existing numerical, date, list and text-structure figures remain available in
these designs. Supply actual values and units for measurements.

## Render through the existing tool

When `render_markdown` is available, provide exactly one of `markdown` and
`markdown_path`, one design source, and `output_path`. Choose `design_path` for a
supplied HTML file or `template` for a built-in ID. The tool also accepts any
HTML design by URL and saved HTML templates; use its advertised input schema.

```json
{
  "markdown_path": "/path/report.md",
  "template": "review/static",
  "output_path": "/path/report.html"
}
```

With shell access, call the same renderer from the selected Archify package:

```sh
node /path/archify/bin/archify.mjs document report.md report.html --template analysis/static --json
node /path/archify/bin/archify.mjs document report.md report.html --design design.html --json
```

The JSON entry point is `node /path/archify/bin/document-tool.mjs request.json`.
Replace `/path/archify` with the actual package path. Local Chrome is required.
No agent installation or client configuration is needed for the command line.

Read [Document components](document-components.md) only when invoking a native
component inside the document.

## Deliver

Return `output.path` from a successful renderer response. On failure, report its
diagnostics and correct the requested input where appropriate.

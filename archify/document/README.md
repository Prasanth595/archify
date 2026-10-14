# document

Render Markdown using an HTML document's design.

```sh
archify document <input.md> [output.html]
archify document <input.md> [output.html] --design <design.html>
```

Both forms use the same renderer. Without a design argument, `review/static`
supplies the default reading layout. A supplied HTML file provides its original wrappers,
CSS, resources and scripts. Rendering needs a local Chrome installation;
`ARCHIFY_CHROME` selects an existing Chrome executable.

## Designs and saved templates

The catalog contains three static templates: decision, analysis and review.
Selection resolves an ID to an ordinary HTML file; there
is no family-specific dispatch inside the scanner or mapper.

```sh
archify document templates --json
archify document report.md report.html --template analysis/static --json
archify document report.md report.html --design-url https://example.test/page --json
archify document scan https://example.test/page --save-template ./templates/new-design --json
archify document report.md report.html --template-path ./templates/new-design --json
```

Choose one of --design, --design-url, --template or --template-path. A saved
bundle contains design.html and template.json. Its manifest records the HTML
checksum, source URL, content scopes and scanned content/TOC positions. It does
not duplicate the whole content snapshot or replace the HTML's styles/program.
Every render scans the current HTML again; changed HTML is rejected against an
old manifest. Recapture edited HTML into a new directory, or use it directly.
Capture destinations must be new directories; existing templates are preserved.

HTTP(S) capture follows redirects, limits HTML to 8 MiB and fetching to 30
seconds, normalizes saved encoding to UTF-8, and resolves resource URLs against
the original page. It preserves fragment anchors. External CSS/scripts/images
remain external dependencies; this is not an offline asset bundle. Capture and
scan do not execute page scripts. Rendering separately checks initialization.

For an explicit custom boundary, use --content-selector CSS to select exactly
one root and --exclude-selector CSS to preserve regions inside it. These are
structural inputs. The scanner does not infer navigation/footer roles from
class names, nor classify Markdown prose as benefits, causes or actions.

The three layouts are in [designs](designs/README.md).
The packaged [Archify Skill](../SKILL.md) routes document requests to
[Document presentation](../references/document-presentation.md), including
optional native components through this same renderer.

The scanner reads content positions and navigation relationships from the HTML
without changing it. A saved scan describes a particular HTML version; it is
not an independent template language. The renderer compiles Markdown once, checks the available
inputs and fills those positions. Existing positions retain their own wrappers
and styles. Repeated chapter containers can be reused for additional chapters.
No page names, class prefixes or component allowlists select mapping rules.

The completed page is loaded separately with scripts enabled to check that its
mapped content survives initialization. Runtime errors or changed content return
diagnostics and prevent output replacement. This check covers initialization,
not every possible later interaction or timer. The saved HTML contains no added
source payload, annotation interface or execution probes.

Page controls continue to run the HTML's own code. Controls reading embedded
data keep reading that data; the renderer does not guess that a hidden textarea
or script contains Markdown that should be replaced.

Optional design configuration uses `--design-options options.json` in the CLI
or `design_options` in the document tool. It must be a JSON object. The renderer
merges its top-level fields into explicitly declared entries such as:

```html
<script type="application/json" data-document-options>{"density":"regular"}</script>
```

The HTML defines which fields it reads and what they mean. An HTML file without
this entry is unchanged; when options were supplied, `report.designOptionsApplied`
indicates whether a declared entry received them. Existing defaults are retained
unless overridden. Configuration is stored as JSON data, with characters escaped
so values cannot close the configuration script. The CLI options file is also
protected from being overwritten by output. This channel adds no template-name
dispatch, link rules or automatic resource embedding to the renderer.

```text
Markdown ── compile.mjs ── content blocks ──┐
                                         ├── render.mjs ── fill.mjs ── HTML
HTML ────── scan.mjs ───── content places ──┘
```

| File | Responsibility |
| --- | --- |
| `compile.mjs` | Markdown syntax, content blocks and source ranges |
| `scan.mjs` | Read actual DOM content positions and navigation targets |
| `fill.mjs` | Map blocks into scanned positions and check initialized content |
| `dom.mjs` | Shared DOM paths, block selection and browser evaluation |
| `render.mjs` | One render pipeline: compile, scan, check inputs, fill and verify |
| `relation.mjs` | Calculation input requirements and missing-input reports |
| `browser.mjs` | Isolated page loading and initialization error capture |
| `files.mjs` | Shared file input, browser lifecycle and atomic HTML output |
| `tool.mjs` | Agent-neutral JSON arguments and structured render results |
| `default.html` | Isolated browser origin for fetched HTML |
| `../renderers/document/render-document.mjs` | CLI adapter to the shared file renderer |

Compiler source ranges are available to development tools; rendered pages contain
only the mapped content and the supplied HTML's own presentation.

An HTML design may declare a JSON array in a script element with
`type="application/json" data-document-diagnostics`. Its initialization code may
append objects containing `code`, `severity` (`warning` or `error`) and `message`.
Warnings are returned in `report.warnings`; errors prevent output replacement.
The native component design uses warnings when it preserves ordinary paragraphs
because a requested preset cannot fit or its marks are incomplete.

[Report designs](designs/README.md) supplies three standalone HTML inputs for
decision briefs, analysis notes and delivery reviews. Their native SVG figures
read the mapped source tables and lists. They use `--design` through this same
pipeline; they do not add mapping rules to the scanner or renderer.

[Document tool](../../integrations/mcp/README.md) exposes this renderer through
standard MCP and a JSON command-line entry point. It accepts Markdown text or a
Markdown file plus an HTML design path and an output path.

Run the affected checks from the repository root:

```sh
npm run test:focus -- test/document-html-render.test.mjs test/document-templates.test.mjs test/document-tool.test.mjs test/document-report-designs.test.mjs test/document-components.test.mjs test/document-constructs.test.mjs
npm --prefix archify run check:documents
```

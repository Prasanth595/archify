# Three dynamic information structures

These are three separate presentation structures, supplied as ordinary HTML
inputs to the existing Markdown + HTML renderer. Their familiar names indicate
intended use; the code does not classify prose as a recommendation, cause,
benefit, problem or action. There is no keyword matching or semantic retrieval.

| HTML input | Presentation structure | Interaction |
| --- | --- | --- |
| decision.html | Two information sheets beside a shared single-metric rail | Choose any two rows from the same numeric table, then choose the numeric column to compare |
| analysis.html | An index of actual source structures beside an exploration canvas | Choose a table, nested list or chapter; select coordinate axes and inspect a plotted source row |
| review.html | A spatial stage with focused diagrams and a card corridor | Switch numeric observations, list relationships, ordered entries and full chapters |

These structures differ in layout, visual representation and reader controls.
They do not use a common four-mode page with different colors.

## Render

```sh
node archify/document/designs/dynamic/build.mjs
node archify/bin/archify.mjs document report.md report.html --design archify/document/designs/dynamic/decision.html
node archify/bin/archify.mjs document report.md report.html --design archify/document/designs/dynamic/analysis.html
node archify/bin/archify.mjs document report.md report.html --design archify/document/designs/dynamic/review.html
```

The same files work as design_path in a render_markdown tool request. Every
output contains the canonical logo, styles and scripts; no chart package,
network request or separately loaded asset is required.

## Structural inputs

- Headings and their mapped containers supply document title, source locations
  and chapter order. A leading paragraph or quotation can be an excerpt; it is
  not assigned a business meaning.
- Tables provide row labels, original column titles and original values.
  A numeric column needs finite values and consistent explicit units in its
  header or cell suffixes. Units describe numeric scales, not metric importance.
- Decision compares two chosen rows along one chosen column. All displayed
  metrics keep their original headers and units. Different units never share
  an axis or receive a composite score. If no numeric table is eligible, its
  two sheets select and display chapter excerpts instead.
- Analysis plots two chosen numeric columns as independent X/Y coordinates.
  Selecting a point reveals its actual row. With one numeric column, vertical
  position explicitly represents original row order. Nested-list diagrams use
  only actual parent/child edges. Chapters use their complete mapped body.
- Review retains its numeric arc display, selectable node graph and ordered
  card corridor. Source numbering supplies sequence; reading position does not
  declare completion or infer dependency. Click an adjacent card to select it;
  click the active chapter card to read its full body. Arrow keys, Home and End
  move the keyboard selection without an extra set of visible controls.

List graphs preserve every branch in its own continuous vertical span, with
parents to the left of their children. Selecting a node highlights its ancestors
and descendants while keeping the full layout as context. Clicking that node
again, clicking empty diagram space or pressing Escape restores the full view.
Reading surfaces hide native scrollbars and show a small continuation cue only
while more content remains; keyboard scrolling stays available. Card excerpts
do not contain separate scrolling panels.

Decision includes numeric tables up to 40 rows; analysis includes them up to 80.
Review's arc display uses the first eligible nonnegative two-column table with
1–6 rows. Larger/non-numeric structures remain readable in the original chapter.
The compact node graph handles up to 18 labeled nodes. These drawing choices
belong to the templates and do not restrict the shared mapper or Markdown input.
Existing Markdown compiler limitations are not repaired by presentation code.

## Complete content

There is no second static article underneath these pages. Complete content is
available through interactive chapter reading: a wide source sheet in decision,
the exploration canvas or source sheet in analysis, and the chapter stage in
review. Original DOM nodes are moved and restored; summaries do not replace
paragraphs, tables, code, lists or quotations. Heading links can open their target
chapter. Documents without headings still retain a complete reading entry.

There is no page switch to disable motion or load a static edition. Selection
and navigation change these dynamic structures. Operating-system reduced-motion
settings retain the same controls. Desktop is the design target; mobile has no
separate design pass.

## Build inputs and checks

document-data.js shares source extraction, node mounting and source-sheet
reading. graph.js shares the node/edge primitive, not a whole page. decision.js,
analysis.js and lumen.js own the three separate interaction structures.
lumen.css contains the report-stage/base styles; structures.css contains the
comparison desk, exploration canvas and source-sheet styles. build.mjs embeds
the required inputs into the three standalone HTML files.

```sh
node archify/document/designs/dynamic/check.mjs /absolute/path/to/evidence-directory
```

Create the directory first. Thirteen cases render through the public tool:
the same Markdown in all three structures, each original use-case example,
text-only input in each structure, a no-section input, and neutral headings in
all three. Browser checks cover source values, coordinate/row selection, list
edges, sequence navigation, complete chapter content and restoration. Neutral
headings test that business vocabulary is not required to enable these views.
Screenshots, tool requests and receipts stay in the evidence directory.

The static templates and general renderer remain separate. No agent-specific
integration is introduced here.

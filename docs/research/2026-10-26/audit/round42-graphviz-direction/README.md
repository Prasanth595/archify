# Graphviz arrow appearance and graph type · batch 42

Scope: upstream evidence for the real need in Archify issue 1139, which already has a contributor investigating its contract. No Archify implementation or decision about Route/Reach is made here.

## Replay through the actual application

1. Open https://dreampuf.github.io/GraphvizOnline/ and leave Engine = dot.
2. Paste one complete fixtures/*.dot file into the editor. Wait for the graph name to match.
3. With Format = svg, inspect the arrowheads. With Format = json, inspect directed, edges, tail, head and dir.
4. Repeat the JSON render for all five fixtures. Compare the complete output against native/1 and native/2; our two passes were byte-identical.

The six browser scripts/logs record Ego taskspace3/p1 actions; adapt the taskspace and file paths when replaying elsewhere. Browser script05 records the first successful pass and script06 repeats JSON rendering and checks the source represented in the address-bar fragment. Script03's click on Ace's tiny input textarea was intercepted; script04 inspected the visible editor before script05 used it. No hidden editor API, global application state, Share action or site publication was used.

The five PNG files are actual 1440×900 screenshots and were all visually inspected. The SVG files are DOM snapshots, including the site's pan/zoom markup, not canonical downloaded exports. Each edge group contains 1/0/2/1/1 arrow polygons respectively. The JSON output is the complete text exposed by the application's Format control, not a hand-authored simulation.

Offline integrity check (does not rerun Graphviz):

```sh
python3 docs/research/2026-10-26/audit/round42-graphviz-direction/audit.py
```

## Attribution and limitations

GraphvizOnline by Dreampuf: pinned source ecaf161aade6111e60f49abf03a5442a6f6beec5, BSD-3-Clause. Four complete upstream files, including LICENSE, retain original bytes and attribution, verified against Git blob, size and SHA-256. Its README lists Viz.js and Ace dependencies with their own licenses; we did not copy those runtimes into this repository or Archify.

The five DOT inputs are authored synthetic counterexamples inspired by the shared-ID problem. They are not the reporter's full integration landscape. The deployed website commit and Graphviz engine version remain unknown; pinning the repository does not establish deployment identity.

dot, gvpr and dijkstra were absent from PATH. No installation or local Graphviz CLI run occurred. Graphviz's official dijkstra manual describes the -d policy, but no traversal algorithm was executed in this batch. JSON directedness, edge-record count and visible arrowheads are separately observed facts; they do not prove Archify traversal behavior, runtime traffic or a particular relationship contract.

No new PR, issue, comment, merge, release, installation or website publication. Existing owner scope and current related PR are recorded in scope.json. A passing archive audit is not product acceptance or a reading-efficiency result.

Initial staged whitespace diagnostics are preserved in preflight/initial-staged-whitespace.txt; raw browser/source bytes are unchanged. Authored prose, scripts and fixtures pass the scoped whitespace check.

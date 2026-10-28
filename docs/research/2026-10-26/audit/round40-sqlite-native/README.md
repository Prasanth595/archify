# SQLite native evidence, batch 40

This packet supplements the earlier `query-plan-smalltools.md` source-only study. No Archify implementation passed screening, so there is no new adapter, diagram, runtime, or dedicated experiment branch. These screenshots show the **upstream tool**, not an Archify-generated product.

## Reproduce the recorded native cases

Requires an existing Python 3 with sqlite3 and `/usr/bin/sqlite3` with `SQLITE_ENABLE_STMT_SCANSTATUS`. Nothing is installed or downloaded by the reproducer. Use a new destination:

```sh
python3 docs/research/2026-10-26/audit/round40-sqlite-native/fixture/reproduce.py /tmp/sqlite-native-fresh
/usr/bin/sqlite3 /tmp/sqlite-native-fresh/fixture.db '.scanstats on' "SELECT * FROM events WHERE event_type = 'purchase' LIMIT 10"
python3 docs/research/2026-10-26/audit/round40-sqlite-native/audit.py
```

The reproducer extracts only the reviewed `EXAMPLE_SCHEMA` assignment and `load_example_database` function from the pinned upstream HTML. The function's final `get_schema()` call is stubbed to omit its unused descriptive return; it does not change database setup. It generates the full seeded upstream database, including `ANALYZE`, then uses the existing Apple SQLite CLI for four query variants. The original selected example is `limit-10`; removing/changing LIMIT and adding ORDER BY are explicit controls.

Fixture creation used Python 3.15.0 / sqlite3 3.54.1. Query execution used Apple SQLite 3.51.0 with source ID and compile options retained. These are distinct runtimes. Each formal run records 11 commands, exact arguments, exit status, elapsed time, stdout, and stderr. One additional read-only profile per run was added after the upstream page's initial example claimed that its scan visited all 50,000 event rows. That supplemental case actually visited 39 rows and produced 10.

Two fresh generated database files had the same SHA-256, `f1b5a3945e52641295ae83caa8c414dcb002f92fc6621fbc7b2f9a7f2272562e`. They remain disposable local replay outputs and are **not committed**; the full source generator, seed, version identities, database size and hash are retained. Do not promise identical database bytes across different Python/SQLite versions. All 24 paired stdout/stderr streams are byte-identical between these runs, without path or time normalization. Native profiles here do not report cycles; no speed comparison is made.

| Case | Result rows | Orders index loops | Orders index rows |
| --- | ---: | ---: | ---: |
| LIMIT 0 | 0 | 0 | 0 |
| LIMIT 10 | 10 | 10 | 104 |
| No LIMIT | 2,000 | 2,000 | 20,000 |
| ORDER BY count DESC LIMIT 10 | 10 | 2,000 | 20,000 |

The first three EQP **detail strings** are identical. Their complete EQP rows/IDs are preserved, not claimed identical. A plan entry's presence does not prove it ran, and the same number of returned rows does not establish the same loop count.

## Actual browser observations

Ten unique Ego scripts/logs operate the official upstream page, `https://tools.simonwillison.net/sqlite-query-explainer`. Seven 1440×900 screenshots were viewed. After the first asynchronous Pyodide load, the next observation inspected the same live page rather than restarting it.

- The correlated-query example visibly says 2,000 index searches while its SQL includes LIMIT 10. The default scan example says it visits all 50,000 rows. Native Apple counters provide counterexamples to those unqualified explanations; **they do not measure the browser's runtime**.
- A SQL query through the UI reports SQLite **3.39.0**, source ID `2022-06-25 14:57:57 14e166f40dbfa6e055543f8301525f2ca2e96a02a57269818b9e69e162e98918`. `sqlite_compileoption_used('ENABLE_STMT_SCANSTATUS')` returns 0. No browser loop counts were collected or invented.
- Browser results for LIMIT 10 and its first 200 unlimited rows match corresponding native values. This does not establish full database identity or engine equivalence.
- The unlimited query reports `200+ row(s)` and displays 200 rows. Fixed source times `execute` plus `fetchmany(201)`, then clips display to 200. Its elapsed value is not a full-consumption benchmark or per-operator time. Neither 200 displayed rows nor the 201-row fetch request determines all internal work.
- Hovering `r[1]` highlights both observed occurrences, instructions 1 and 21. Clicking instruction 0's target scrolls instruction 24 into the viewport and applies the native flash class. These are static references, not an execution trace or dependency proof. Source uses declared register sets/address IDs; this is the interaction worth remembering.

The deployment commit was not determined. Pinned current-source HTML was byte-identical to the previously examined older commit, and the relevant wording/behavior was observed on the live page. Do not collapse these separate facts into a known deployment revision.

## Source, license, and decision

The complete HTML and Apache-2.0 LICENSE from Simon Willison's `simonw/tools` repository are in `fixture/`, pinned at `5fc8e8bba888405dd1a447859b231ede37822ae9`. Both were verified against Git blob identity, size, and SHA-256. The HTML is unchanged from `e410e25efd604bf897b476443f406da47b578264`. The fixture generator is reused with that attribution; controls and replay/audit code are authored here. No upstream code was incorporated into Archify's runtime.

Official references checked this batch: [profiling metrics](https://sqlite.org/profile.html) and [EQP format and scope](https://sqlite.org/eqp.html). The official profiler distinguishes loop executions and visited rows; EQP is a debugging plan format, not a stable metrics protocol.

The raw-detail-plus-explanation layout and explicit-reference interactions are useful references. A new SQL engine, opcode parser, plan-tree adapter, or fixed Archify explanation would add maintenance without a demonstrated reader benefit over this baseline. Keep this packet and defer implementation. No upstream issue/comment/PR was sent, and no install, release, merge, or site publication occurred.

# JSON Hero native reading audit · round 48

This packet records existing public JSON Hero pages, not a new Archify product or an upstream build. Research base: Archify hub `c4601be856df1a5685956b00adc9f34606468fcf`. Only the existing research branch is updated; no PR is created.

## Reproduce the observed interaction

1. Open [the official existing GitHub API sample](https://jsonhero.io/j/PjHo1o5MVeH4?path=1.private) at 1440 × 900. Wait for the right panel to show `private / false / bool`.
2. Press Alt+Left, then Down. The observed selection loses the leaf and shows the whole `Index 2` object. Scripts 05 and 11 cover two adjacent row pairs.
3. Open the same sample with `?path=1.name`, then use the same keys. The observed selection retains `name` at `Index 2`, value `hello-worId`. Script 06 starts by selecting name in Index 1.
4. Open `?path=2.private`, expand the `8 false` related-value group, and click the final path's `private` component. This successfully selects `root / 7 / private`.
5. Open `?path=2.created_at`. The raw string, inferred `string/datetime/rfc3339`, converted date, and calendar are shown together. The recorded Asia/Shanghai page shows June 19 in the title but highlights 18 in the calendar; calendar correctness is **not** accepted.

The loader removes the query from the address bar after initial selection. Its header title contains a different URL-like string; this is document title text, not evidence that we created a new document. No New, Share, editing, upload or document-creation action was used. All pages were existing official public samples. Space 3 / p1 was reused and returned to about:blank, retained for the ongoing goal.

The browser scripts bind this session's space and absolute archive paths; they are audit records, not blindly portable automation. For a new session follow the manual steps above. `02-github-sample.png` was captured before navigation settled and is excluded from product observations. All 13 PNGs were visually reviewed, with roles in [image-audit.json](image-audit.json).

## Offline check

From the repository root, using Python's standard library only:

```sh
python3 docs/research/2026-10-26/audit/round48-jsonhero/summarise.py
python3 docs/research/2026-10-26/audit/round48-jsonhero/verify.py
```

The summary derives sample field counts, values, timestamp conversion, and selected archived DOM facts. The verifier checks source Git blob IDs, SHA-256, file inventory and PNG dimensions. Neither executes JSON Hero, upstream tests, schema inference or Archify behavior. The browser observations were performed separately. No dependencies were installed.

The JSON download came from the sample's visible download URL in a later GET, not a captured initial document response. Its visible checked values agree with the page. The entire initially loaded payload was not byte-compared. Deployment commit is unknown; source/website agreement is supporting evidence only.

## Attribution and boundaries

- JSON Hero by Trigger.dev and JSON Hero contributors: [fixed source](https://github.com/triggerdotdev/jsonhero-web/tree/15157053174ba7a0a79c77b2925fbde7e05a6334), [Apache-2.0 LICENSE](sources/LICENSE). Nineteen unchanged source files are archived; [sources.json](sources.json) records exact Git blob IDs and SHA-256. No upstream code is incorporated into Archify runtime.
- [Public sample JSON](https://jsonhero.io/j/PjHo1o5MVeH4.json) is the official JSON Hero GitHub API example containing public octocat repository metadata. A separate data license was not supplied by the observed endpoint; no Apache license is asserted for this download or screenshot assets. The embedded repositories' `license` values describe those repositories, not this audit dataset.
- Screenshots are unmodified captures of the public application with its branding retained, for review of the documented interactions.
- Scoped Archify searches: quoted JSON Hero returned issue #330 (CLI argument errors, unrelated) and zero PRs; unspaced jsonhero returned zero issues/PRs. Search results are not an exhaustive ownership proof. The remote-head snapshot has 333 entries.
- Schema-inference and string-based grouping limitations were inspected in source only. We did not execute mixed-type collision fixtures, alter upstream data, file issues, or publish documents.

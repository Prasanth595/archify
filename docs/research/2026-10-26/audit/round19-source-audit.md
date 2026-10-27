# Round 19 independent source audit

## Blockers and boundaries

No source-packet integrity or three-case assertion mismatch found. Do not describe fixed-source expectations as outputs reproduced against the live deployment: its displayed `v1.155.0-enterprise-cluster` does not establish source commit `61916650cafcb6037b5f6947774302ece0fb32e2`. Deployment commit and equivalence are unknown. No test, server, browser, or installation was run in this audit. Local blob identity checks verify the packet against its recorded Git object IDs; they do not independently fetch upstream or establish live provenance.

## VictoriaMetrics packet

All four TSV entries match their local full-file byte lengths and Git blob SHA-1: `relabel_test.go` 9fb966911b38db2f263ce734f03d0686bf3fa119 / 24007; `debug.go` fcf8626dd6fc0757e9bc65671e00edba0f684c67 / 5892; `debug.qtpl` c10dc0ff19cf3a678c553b0b7f12530cd5a10690 / 13249; `LICENSE` 98bd4341a77a91e05d8be56a2b5b7eb8f6cb8a64 / 10739. All four entries of source-sha256.txt and the cases.json SHA-256 entry match the files. The notice lookup returned 404; it is not proof of absence of every third-party notice.

Compared all three cases with fixed `relabel_test.go` lines 118–163. Their metric input strings and every expected DebugStep Rule/In/Out string and ordering are exact matches. In each case the test's raw Go config literal has an additional initial newline before the first `-`; cases.json omits that leading newline, so config bytes are not exact, even though the YAML content and remaining bytes match. In the two relevant inputs, the test's input label order is `bar,abc` and `foo,foobc,a`; expected debug outputs explicitly sort as `abc,bar` and `a,foo,foobc`. Do not describe input and displayed labels as identical text; they are distinct exact strings in the test. Also, input replacement `''` yields the test's debug rule serialization `""`, and quoted `"foo.*"` / `"abc"` input is serialized without those quotes in the rule: equivalent YAML values, not identical rule bytes.

The test invokes `ApplyDebug` and checks `reflect.DeepEqual` against its expected values; these are assertions in source, not execution receipts from this session. The debug page invokes `newDebugRelabelSteps` after parsing/normalizing and may add additional target- or metric-specific postprocessing (`debug.go` lines 21–53, 56–110); direct test expectations should not be blindly equated with every web page rendering.

## Archify lifecycle

Both source-manifest files match recorded size, SHA-256 and Git blob IDs, and those blob IDs match `d5d979493bba650b3995836afd379cd249f2d0dd:<path>`: `docs/gallery/artifacts/agent-run.lifecycle.html` and `archify/examples/agent-run.lifecycle.json`. From `reviewing`, transitive directed reachability including the starting state is exactly `{reviewing, completed, blocked, expired}`. The reachable transitions are `reviewing-completed` (reviewing → completed), `reviewing-blocked` (reviewing → blocked), `blocked-reviewing` (blocked → reviewing), and `blocked-expired` (blocked → expired). The cycle makes reviewing reachable again; distinct downstream states excluding the start are `{completed, blocked, expired}`. The HTML path elements expose matching `data-edge-id`, `data-edge-from`, and `data-edge-to` for all four. This is a graph reachability calculation, not proof of a viewer interaction or runtime execution.

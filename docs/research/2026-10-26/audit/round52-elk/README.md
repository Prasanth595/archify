# ELK port / hierarchy evidence — round 52

Disposition: retain a bounded engine comparison; defer a general ELK adapter or replacement layout engine. This is a research packet, not an accepted Archify runtime experiment.

## Reproduce

The archived [three layouts](summaries.json) use the upstream [browser fixture](sources/test-browser-draw2.html), translated from its literal object into [JSON](input-original.json) without executing upstream HTML. The fixture has seven nodes, two named ports and six edges. It is an upstream synthetic example chosen by this researcher, not an independent user task.

- Original: upstream properties, including INCLUDE_CHILDREN.
- Fixed side: only add FIXED_SIDE on n2 and WEST/NORTH on p1/p2.
- Separate children: only change the root hierarchy setting to SEPARATE_CHILDREN.

Open [original](original.html), [fixed side](fixed-side.html), and [separate children](separate-children.html). The HTML files are standalone static research drawings with local input/output links. Geometry comes from actual elkjs output; labels, colors and arrows are our presentation. They do not claim ELK Live or Archify visual behavior.

For offline evidence checking, run `python3 verify.py` from this folder. It verifies source Git blob identities, semantic identity across variants, routed-edge coverage, shape endpoints, browser-visible SVG points, PNG dimensions and manifest entries. It does not run the engine or browser.

To rerun layouts, copy this packet to a scratch folder first, then run there:

```sh
python3 fetch-runtime.py
python3 extract-fixture.py
node run.mjs
python3 render-evidence.py
python3 -m http.server 8872 --bind 127.0.0.1
```

The fetch script downloads the fixed npm 0.12.1 tarball, checks the recorded SHA-256 plus registry SHA-512/SHA-1, and extracts only the bundle, license and package metadata. It does not install a package or execute lifecycle scripts. Its cache defaults to ~/.cache/archify-research/elkjs-0.12.1; ELK_CACHE changes the destination. ELK_BUNDLE can point run.mjs at the same verified bundle elsewhere. No Java, Yarn, Docker, source build or dependency resolver is needed for this bounded replay. New runs overwrite runtime/output/timing records in the scratch copy; they do not recapture screenshots. The archived Ego scripts contain this run's absolute paths and space ID; adapt them to an authorized browser space before replay.

## Observed scope

Runtime: elkjs 0.12.1, npm gitHead 624ae90aa37110033a8af59c5ccbb292708b4317; Node v26.12.0, darwin arm64. Bundle 1,646,241 bytes, SHA-256 b1032b7cfd2a57c54c6f0e8369d7665e19a579954f7cd20a6dae28f1912ea0d7. The bundle and tarball remain outside Git. This is a publisher-provided binary with checked integrity, not a reproduced source build; npm signatures/attestations were not independently verified.

All three calls resolved. The original and fixed-side cases have six routed edges; separate-children has five. e2 keeps its source n0 and target n4 in output JSON but has no sections. This establishes the configured example's incomplete geometric output, not lost semantic data or a general ELK bug. The other inspected upstream hierarchy test uses a different graph and expects an exception; it was read, not executed.

The fixed-side case keeps p1 west and moves p2 north; extent changes from 330 × 222 to 410 × 253. Extent is diagnostic only, not a quality score. No FIXED_ORDER, FIXED_POS, incremental layout, large graph, worker, author-speed or reader-efficiency claim is made.

The engine had one exploratory baseline call before the three-case run. Its valid output is byte-equivalent as JSON to the final original output. The first script then failed during terminateWorker because no actual worker had been configured. We removed that unnecessary cleanup call; the failure and script remain in first-attempt/. It is not evidence about Archify or the native site's worker behavior.

## Browser evidence and failures

ELK Live showed a German maintenance page; the deployed commit/version is unknown. No native editor comparison ran. [Maintenance capture](browser/01-maintenance.png) and its public DOM state are retained.

All seven inspected PNGs are **1291 × 762**, and the three final DOM states report that same viewport. The initial CDP request asked for 1440 × 900 but did not produce that observed capture size; cause unverified. A failed assertion expecting 1440 × 900 is retained in first-attempt/. The comparison uses the actual common viewport, not the requested one.

The first drawings placed p1's harness label against e2's line. Those HTMLs, PNGs, generator and capture log remain in first-drawing/. The final drawing moves port labels below the port and makes the e2 legend conditional. No ELK layout was changed or rerun for this presentation repair. Every first/final PNG and the maintenance PNG was opened and inspected.

The owned loopback server was stopped, and Ego space 3 / p1 returned to about:blank. A favicon 404 was harmless and not an engine failure. No share/publication form, PR, merge, release or installation was performed.

## Source and screening records

[sources.json](sources.json) records 11 exact Git blobs and revisions. [remote heads](remote-heads.tsv) contain 333 branches refreshed before work. [Remote context](remote-context.json) records bounded searches and existing branch/PR ownership. [NOTICE](NOTICE.md) retains upstream provenance and licenses. [Manifest](manifest.json) hashes the packet.

Archify source reading is pinned to dev 847146aeb93b492592adb78dc220f57e4a8b4636. Current architecture/dataflow schema and anchor contracts already cover explicit sides and automatic port spreading, but do not expose the fixture's first-class named port objects. No Archify code, schema, generated package or existing experiment artifact changed. No product suite, upstream suite, source build or CI was run for this research-only packet.

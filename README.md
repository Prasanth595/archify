# Archify (English-only fork)

Archify is an agent Skill that turns a description, a Mermaid diagram, or a
repository into a validated, interactive HTML diagram. The agent writes a typed
JSON description; a deterministic renderer lays it out, checks it, and produces
a self-contained HTML page with dark/light themes, focus and path tracing, and
PNG/SVG/WebM export.

This repository is a fork of [tt-a1i/archify](https://github.com/tt-a1i/archify),
kept English-only and reduced to the Skill and what is needed to develop it.

## Diagram types

`architecture`, `workflow`, `sequence`, `dataflow`, `lifecycle`, `erd`, `class`,
`tree`, `timeline`, `waterfall`, and `explainer` (a one-page answer with panels,
native diagrams, and charts).

## Install

The Skill is the `archify/` folder. Install it with the Skills CLI from this
repository:

```sh
npx -y skills add fsa64320/archischeme --skill archify --global --copy --yes
```

or unzip `archify.zip` into your agent's Skills directory (for example
`~/.claude/skills/`). Node.js 18 or newer is required; the Skill has no runtime
dependencies.

## Use

Ask your agent for a diagram, for example "draw the architecture of this
repository" or "show the checkout request as a sequence diagram". The CLI can
also be run directly:

```sh
node archify/bin/archify.mjs guide "deployment topology"
node archify/bin/archify.mjs render architecture archify/examples/web-app.architecture.json out.html
node archify/bin/archify.mjs check out.html
node archify/bin/archify.mjs --help
```

## Repository layout

| Path | Purpose |
| --- | --- |
| `archify/` | The distributed Skill: CLI, renderers, schemas, explainer, viewer template, locales, examples |
| `archify.zip` | Deterministic package of `archify/` |
| `viewer/` | Source of the interactive viewer; generates `archify/assets/template.html` |
| `scripts/` | Build, packaging, and test-runner scripts |
| `test/` | Test suite |
| `examples/` | Reference renders checked by `test/golden.mjs` |
| `benchmarks/`, `experiments/`, `journal/` | Quality measurements, trials, and research notes |

## Development

```sh
npm ci && npm --prefix archify ci
npm --prefix archify run generate:viewer   # after editing viewer/
npm test                                   # core smoke tests
node scripts/run-tests.mjs                 # full suite
npm run test:generated                     # generated-output freshness
scripts/build-zip.sh                       # rebuild archify.zip (official Node 22 required)
```

## License

Apache License 2.0; see [LICENSE](LICENSE) and [NOTICE](NOTICE). Earlier
contributions remain available under [LICENSE-MIT](LICENSE-MIT). Third-party
components keep their own licenses; see
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

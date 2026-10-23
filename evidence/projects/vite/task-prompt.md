# Authoring task prompt (vite)

Explain how Vite's dev server and its production build pipeline actually work in this codebase.

Concretely, I want one diagram that answers:

1. **Dev request path** — what happens end to end when the browser asks the dev server for a
   module during `vite dev`: from the HTTP request, through the Connect middleware stack, the
   module graph, and the plugin pipeline, to the response that is sent back to the browser.
2. **Build path** — what happens when `vite build` produces the production bundle: from config
   resolution through the build plugins and the bundler to the files that end up in the output
   directory.
3. **Where the plugin pipeline sits in each path** — the `resolveId` / `load` / `transform` hooks,
   the `pre` / `normal` / `post` plugin ordering, and the dependency optimizer that pre-bundles
   dependencies for dev.
4. **Where the module graph, the dependency optimizer, and the emitted build output live**, so it
   is visible that the dev path and the build path are two separate runtime paths that share one
   plugin list.

Use the real source under `packages/vite/src/node/` as the authority — in particular
`server/index.ts`, `server/middlewares/transform.ts`, `server/transformRequest.ts`,
`server/pluginContainer.ts`, `plugins/index.ts`, `build.ts` and `optimizer/index.ts` — and attach
the source locations you relied on to the nodes whose claims they support.

Show the two flows as separate lanes, with the shared plugin pipeline visible as its own lane.

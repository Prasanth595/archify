# Task prompt — Express 5 request lifecycle (Workflow diagram)

You are authoring an Archify **Workflow** diagram for the Express 5 web framework
repository (`https://github.com/expressjs/express`, revision
`0dee2c52c7c873498f8ed7d8ee4ddd0a04d3ada8`, package version 5.3.0).

**Question to answer with the diagram:**

> How does an HTTP request actually flow through this codebase? Walk the reader from the
> Node HTTP server, through `app.handle()`, into the router and the middleware stack, out
> to a route handler, and back out through the response helpers. Also show the error path:
> when a middleware or handler calls `next(err)`, how does the request reach the default
> final handler instead of a normal response?

**Scope rules for the answer:**

- Stay inside the request lifecycle. View rendering, static file serving, and
  `body-parser` internals are out of scope, except where the request lifecycle calls
  into them.
- Every node and every claim must be grounded in the source under `lib/` at the pinned
  revision. Attach the repository-relative `sources` ranges you actually inspected to the
  nodes that make the claims. Do not assert behavior you did not read in this repository —
  note in a card when a responsibility lives in a dependency.
- Express 5 does not ship its own router directory any more. Say where path matching
  actually happens instead of implying it does not exist.
- Show both the success path and the error path. The error path must be visually distinct
  from the success path.

**Deliverable:** a schema v2 Workflow candidate JSON that passes `archify finalize workflow`.

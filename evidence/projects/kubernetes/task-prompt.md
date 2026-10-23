# Authoring task prompt (kubernetes)

Using the Kubernetes source in this repository, produce a **workflow diagram** that explains the
Deployment controller's reconcile loop end to end.

The diagram must show:

1. **How a change reaches the controller.** How a Deployment object change in the API server is
   observed, cached locally, and turned into a unit of controller work (watch → local cache →
   event handler → workqueue).
2. **How work is scheduled and retried.** How a queued key is picked up by a worker, and what
   happens when the sync step fails — the rate-limited requeue and what becomes of the key once
   the retry budget is exhausted.
3. **How the reconcile writes back.** How the reconcile step reads the desired state, works out the
   desired ReplicaSet set, and writes the result back to the API server — closing the loop, since
   the write is itself a change the controller observes.

Requirements:

- Ground every step in real source files from this repository and cite them on the diagram.
- Show the retry/backoff path as a distinct branch, not inline in the happy path.
- Use a **workflow** diagram (not a generic architecture overview): lanes for ownership/runtime
  boundaries, a left-to-right happy path, and the write-back as a return edge that closes the loop.

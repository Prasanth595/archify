# Task prompt — Ansible playbook task execution (Workflow diagram)

You are authoring an Archify **Workflow** diagram for the Ansible repository
(`https://github.com/ansible/ansible`, revision
`ba22fe441408f1ffc943950e0ceec8ad624514da`).

**Question to answer with the diagram:**

> How does an Ansible playbook actually execute one task in this codebase? Walk the reader
> from the playbook file, through play compilation and the strategy loop, out to the forked
> worker process that runs the task, onto the managed host where the module runs, and back
> to the controller with the result. Also show where a failed task goes, and how a notified
> handler is eventually triggered.

**Scope rules for the answer:**

- Stay inside the task-execution path. Inventory parsing, module packaging, and the
  connection/network back ends are out of scope, except where the execution path calls
  into them.
- Ground every node and every claim in the source under `lib/ansible/` at the pinned
  revision, and attach the repository-relative `sources` ranges you actually inspected
  (each reference proves only the fact visible at that location).
- Name the real call sites — `PlaybookExecutor.run`, `Play.compile`,
  `TaskQueueManager.run`, the linear `StrategyModule.run`, `_queue_task`,
  `WorkerProcess.run`, `TaskExecutor._execute_internal`, `_process_pending_results` —
  do not invent generic stages.
- The controller process, the forked worker process, and the managed host are different
  runtime boundaries. Show them as separate lanes, and put the failure path in a visibly
  distinct lane.
- The result has to come back to the controller: show the return, not just the outbound
  call. A handler notification is only *recorded* while the result is processed; the
  handler itself runs later, at the implicit `meta: flush_handlers` task.

**Deliverable:** a schema v2 Workflow candidate JSON that passes `archify finalize workflow`.

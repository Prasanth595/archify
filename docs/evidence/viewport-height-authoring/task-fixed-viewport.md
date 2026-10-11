Create an English Architecture diagram for the fictional Northstar image-processing service, using the source facts below. This is a supplied system description, not a repository-backed task.

Target: a 1440 x 900 desktop viewport, light theme, classic preset, default Reader state. Choose an explicit meta.viewBox with width 1100 SVG units and a height of your choice. Aim for the complete title, diagram and supporting material to be readable in the first screen. Keep every named role and relationship; do not regroup roles or discard supporting facts. Use the exact title "Northstar image processing: upload, queue, transformation and notification". Include two supporting cards for the facts listed below.

Source facts:
- Browser sends an HTTPS upload request to Upload API.
- Upload API writes the original to Object Store (label "original").
- Upload API enqueues a job in Job Queue (label "enqueue").
- Job Queue dispatches to Transform Worker (label "dispatch").
- Transform Worker reads the original from Object Store (label "read").
- Transform Worker writes the result to Result Store (label "result").
- Transform Worker publishes completion to Notification Service (label "complete").
- Notification Service sends Browser the result URL (label "result URL").
There are exactly seven separate roles: Browser, Upload API, Object Store, Job Queue, Transform Worker, Result Store, Notification Service. Preserve all eight directed relationships and labels.

Supporting facts, each in its own card:
1. Queue retries: a failed job is retried at most three times; exhausted jobs enter the dead-letter queue for operator review. This describes the queue policy, not an extra processing role.
2. Storage policy: originals expire after seven days; transformed results expire after thirty days. Completion notifications contain a result URL and no image bytes.

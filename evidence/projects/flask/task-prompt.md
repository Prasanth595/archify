# Task prompt — Flask request lifecycle

Using the Flask source in this repository, produce a **Workflow diagram** that
explains how a single HTTP request travels through Flask.

Cover, with the real method names and the file each one lives in:

1. The WSGI server calling the Flask application object.
2. How the request/app context is created and pushed, including where the URL
   is matched and where the session is opened.
3. The dispatch stage: `before_request` hooks, the view function call, and how
   the view's return value becomes a response.
4. The response stage: response construction, `after_request` hooks, and where
   the session is saved.
5. The exception path: a registered error handler versus an unhandled error
   that becomes a 500.
6. The teardown that runs when the request context is popped, including what
   runs on the success path as well as the error path.

Also show where a blueprint's `before_request` / `after_request` hooks are
invoked relative to the application-level hooks, because Flask runs them in a
different order.

State the real method names on the nodes, and attach the repository-relative
source location for every stage you assert.

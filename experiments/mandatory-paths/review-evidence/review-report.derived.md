PUBLIC DERIVED RECORD
{"sourceName": "review-report.md", "originalSha256": "96e6b881ed5ec92f126f97e75ed6f4375264a55dfaf49bb05e71eaf89ab0456d", "originalBytes": 4289, "derived": true, "transformation": "Local absolute paths replaced by explicit placeholders; public derivative, not an original receipt."}

# Independent read-only review

Disposition: ready for the agreed offline Mandatory paths experiment; no blocking defect found. This does not authorize product adoption, publication, merge, installation or release.

Value: the result answers a concrete authored-topology question with an inspectable counterexample for every nonmandatory internal node, including nodes outside all endpoint routes. Unreachable is successful and explicitly distinguished from reachable with no required nodes. The evidence does not establish observed runtime dependency, causality, human acceptance, authoring speed or performance benefit.

Scope and cost: all new work is in experiments/mandatory-paths. The shared renderer, schema and Viewer are unchanged. The removal/BFS implementation is small and appropriate for this bounded experiment; O(V(V+E)) is disclosed and large-graph performance remains unmeasured. A more complex dominator implementation is not necessary to validate this scope.

Independent correctness basis: review.mjs enumerates all simple paths rather than deleting nodes or using BFS. The oracle intersects internal vertices over every path, and selects avoiding paths by hops then lexicographic original edge order. All 4,096 four-node directed graphs and 12 distinct endpoint pairs passed (49,152 queries); self-loop/parallel/cyclic/object-property-ID case and full production fixture bring the total to 49,154, with 61,448 matching nonmandatory witnesses. This finite exhaustive domain is meaningful bounded evidence, not a proof of all possible graph sizes. The mathematical removal characterization is valid for arbitrary directed graphs; shortest witnesses can always be simple paths.

Independent native integration: two real CLI runs passed render/finalize/check with browserCheck.ran=false. Original fixture bytes and complete component/connection graphs were retained. The presentation copy differs only by missing edge IDs. All six reachable bypass step targets resolve to exactly their original keyed edge sequence in the prepared native graph embedded in generated HTML. Required clients→audit nodes are edge,gateway,events,worker. Avoid api_a keys [0,1,3,7,8,10]; avoid api_b [0,1,2,6,8,10]. Reverse query audit→clients is unreachable.

Failure boundaries checked: all explicit JSON direction values sampled (forward/both/none/reverse/empty/null/boolean/number/object), same endpoint, unknown endpoint, malformed JSON, and non-Architecture input reject. Canonical graph identity collision and missing-ID presentation collision cases are covered by the inspected author tests. Source review confirms refusal of identity collisions and full semantic coverage checking. Arbitrary malformed semantic objects passed directly to the internal query helper are outside the validated CLI contract.

Final binding: final-binding.json verifies final source hashes against the reviewed implementation and the public summary. All canonical evidence artifacts match recorded public SHA-256 values. Independent reproduced input JSON, answer JSON, Explainer JSON, and full-native HTML are byte-identical. Explainer HTML is exact outside its prepared payload; the prepared payload is exact except generation sourcePath/baseDir and their digest. Independent delivery/finalize receipts bind the independent paths and exact output hashes. The initial strict byte-comparison failure and a subsequent receipt comparison mistake are retained in bind-final*.stdout/stderr logs; corrected v3 checks distinguish each run's provenance and pass. No source fix was needed.

Source SHA-256:
- mandatory-paths.mjs: 73338da8329400c09bb2ae494e3c6347323f78d23d3ae1cf9f81984f4a176be8
- cli.mjs: cc980d1c2f7bdf8ecf758e0f27421b57ff8c7617c3b4781fdf9f0fd4eb5b2325
- mandatory-paths.test.mjs: d73ac36f6212b4ebd644a953de11f3041ab81273cdf46477a2ed9c21c76e5705
- production fixture: 610a5614667e8f108bdcf1769c9d7af5c3ce0fb62be3ea50550b10eb752e4bda

Limits: no browser, screenshot/perceptual acceptance, human acceptance, upstream implementation execution, performance benchmark, shared-product test suite, install, commit or push. Only temporary independent verification artifacts were written. The author tests were inspected and final 9/9 author evidence was reused, rather than duplicating the same suite.

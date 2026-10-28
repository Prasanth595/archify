# Batch29 CUE semantic review

2026-10-28. **The authored fixture and saved Playground eval output support the proposed narrow explanation, provided “defaults” are not confused with valid values and interpolation is not recommended as a universal override.** No CUE runtime, CLI, browser, build or Archify product operation was executed by this auditor. Sole authored output is this report. Read fixture `experiments/cue-defaults/input/reader-modes.cue` and root's `/tmp/archify-round29-cue/authored-eval.json`.

## Fixed official source

Pinned official specification to **cue-lang/cue v0.17.0, 0fc639bbe9819f08ed132d3981a13ac2e3bf330f**, resolved by read-only `git ls-remote`; read its complete [doc/ref/spec.md](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md). Relevant sections: [Unification](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md#unification), [Default values](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md#default-values), [Field declarations](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md#field-declarations), and [String interpolation](https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md#string-interpolation). Apache-2.0; link-only review, no spec copy written to the repository. This source pin is not independent identification of live WASM bytes.

Specification-derived interpretation (not runtime tracing): unification is commutative. References retain value/default information; ordinary referencing does not select the displayed standalone default first. A default preference is separate from its allowed-value domain. For these two strings, U2 intersects valid domains to string and preferred defaults to bottom because overview and detail disagree. Bottom here is the default component, not the whole string value. Interpolation requires concrete expression resolution and therefore can select a usable default before producing a string. Explicit compatible data narrows an unconstrained string domain. These rules do not define layered last-writer precedence. The spec's example of conflicting marked alternatives likewise retains values with a bottom default.

## Actual authored input and captured output

The mode names are explicitly teaching strings, not Archify schema or runtime modes. Root's saved eval capture has exact submitted bytes365 / SHA-256 `3d378446b37f35eb300218ccb695c91404a71b81beefa2e79d95ac58fb93629d`. It shows:

| Authored field | Captured Playground eval text | Safe interpretation |
| --- | --- | --- |
| `#Reader.mode: *"overview" \| string` | Definition omitted from this eval rendering | Schema allows strings and supplies overview preference; omission is not absence from input. Do not claim this capture independently displayed #Reader's selected default. |
| `preferred: *"detail" \| string` | `preferred: "detail"` | Standalone eval displays its selected preference; it does not convert every reference into that concrete value. |
| `viaReference.mode: preferred` with #Reader | `"overview" \| "detail" \| string` | No usable default selected; string domain remains. It is not an enum restricted to the two named strings and not a surviving default set `{overview,detail}`. |
| `viaInterpolation.mode: "\(preferred)"` with #Reader | `"detail"` | This expression yields a concrete string, which is compatible with #Reader's string domain. This is a materially different expression, not proof of priority for the right-hand operand. |
| `explicitValue: viaReference & {mode:"audit"}` | `mode: "audit"` | Observed counterexample to “only overview/detail are legal.” It does not mean audit won a source-order override. |
| `reversedOperands: {mode:preferred} & #Reader` | Same unresolved disjunction as viaReference | Observed same result for reversed operands, supporting absence of right-hand precedence in this example. |

Avoid “two defaults survive” unless explicitly discussing the two **input preferences**. The output has no stars. Prefer: “The preferences conflict, so eval cannot select either; the field still admits a string. Constraining it explicitly to audit remains valid.” Do not call this an invalid configuration merely because it is not concrete enough for data export.

## Natural question versus authored adaptation

Read full issue body and comments via GitHub connector. [Comment1010034806](https://github.com/cue-lang/cue/issues/1449#issuecomment-1010034806) explains symmetric composition and recommends separating base schema constraints from defaults composed as needed. [Author reply1011370741](https://github.com/cue-lang/cue/issues/1449#issuecomment-1011370741) acknowledges the explanation and asks for examples/guidance. This supports a real historical reading confusion, not demonstrated adoption or a current engine bug. Later discussion still explores designs/patterns; do not turn one interpolation workaround into the maintainers' universal recommendation. The fixture substitutes reader mode strings and adds explicit/reversal contrasts; it is not the issue author's original project or a production input.

## Decisive controls / missing observations

Already present and sufficient for the core bounded claim: complete authored input, full actual eval text, explicit audit contrast and reversed operands. Keep original-issue eval capture separate from authored adaptation. Retain screenshot, UI format/mode/version and input/output bytes, rather than selected lines only.

If text intends to recommend interpolation or claim it is equivalent to referencing, collect one separate negative control: **`viaInterpolation & {mode:"audit"}`** should conflict, whereas saved `viaReference & {mode:"audit"}` succeeds. This is a prediction here, not an observed error. A separate complete probe avoids spoiling the existing teaching input's clean eval capture. It reveals that interpolation narrows the value rather than “just changing which default wins.” Without that observation, phrase the limitation as a bounded expression-semantic caveat and make no empirical universal claim.

Optional only if claimed: independently evaluate #Reader alone to display overview; use an incomplete/no-default string interpolation to show it cannot always manufacture a concrete value; perform export separately if contrasting concreteness. Do not label these predictions as observed, introduce an evaluator/parser into Archify, or enlarge the experiment merely to accumulate tests.

Identity boundary: live menu reports **v0.17.0**; Report Issue URL identifies site **957f004**; pinned wrapper uses Go API/WASM rather than a CLI execution. Root packet is a Playground eval observation. No CLI exit code, native binary/WASM exact identity, latest-version claim or human comprehension gain follows from it. Product core remains unchanged.

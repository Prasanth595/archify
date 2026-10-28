# Why does a CUE reference lose its default? {#cue-defaults}

The reference has no usable default after the two preferences meet, but the field still accepts strings. Interpolation resolves to a concrete value in this fixture.[](source:spec)

@answer scope="Authored teaching fixture · Playground v0.17.0 label · Go API"
@meta locale=en
@source spec title="CUE v0.17.0 language specification" url=https://github.com/cue-lang/cue/blob/0fc639bbe9819f08ed132d3981a13ac2e3bf330f/doc/ref/spec.md
@source natural title="CUE issue1449 and maintainer explanation" url=https://github.com/cue-lang/cue/issues/1449#issuecomment-1010034806
@source redesign title="Defaults design remains under discussion" url=https://github.com/cue-lang/cue/issues/3751
@source playground title="Official Playground implementation" url=https://github.com/cue-lang/cuelang.org/blob/957f004c34a71982b5773e86126d9df2a5c6d48f/playground/impl.go

## Complete authored input {#input}

```cue title="reader-modes.cue"
// Authored teaching fixture; mode names are strings, not an Archify schema.
#Reader: {
    mode: *"overview" | string
}

preferred: *"detail" | string

viaReference: #Reader & {
    mode: preferred
}

viaInterpolation: #Reader & {
    mode: "\(preferred)"
}

explicitValue: viaReference & {
    mode: "audit"
}

reversedOperands: {
    mode: preferred
} & #Reader
```

## Complete Playground output {#output}

The Playground displayed these results for the same input. Displayed code omits the final newline; the raw files are authoritative. Export shows two incomplete-value diagnostics; this is not a CLI exit status.[](source:playground)

```cue title="def"
// Authored teaching fixture; mode names are strings, not an Archify schema.
#Reader: {
	mode: *"overview" | string
}
preferred: *"detail" | string
viaReference: #Reader & {
	mode: preferred
}
viaInterpolation: #Reader & {
	mode: "\(preferred)"
}
explicitValue: viaReference & {
	mode: "audit"
}
reversedOperands: #Reader & {
	mode: preferred
}
```

```cue title="eval"
preferred: "detail"
viaReference: {
	mode: "overview" | "detail" | string
}
viaInterpolation: {
	mode: "detail"
}
explicitValue: {
	mode: "audit"
}
reversedOperands: {
	mode: "overview" | "detail" | string
}
```

```cue title="export"
reversedOperands.mode: incomplete value "overview" | "detail" | string
viaReference.mode: incomplete value "overview" | "detail" | string
```
## Official context and boundaries {#context}

Unification is commutative. Values and default preferences are separate. For this fixture U2 intersects the valid string domains to string while the incompatible overview/detail default components meet at bottom: no usable default, not an empty valid-value domain. Interpolation needs a concrete expression result; it is not a universal override mechanism.[](source:spec)

The natural question compares a direct reference with string interpolation. The maintainer explains composition without operand precedence and recommends considering schema/default separation. The reporter accepted that explanation and requested examples. The authored fixture here is a separate teaching adaptation.[](source:natural)

An open umbrella tracks defaults redesign. This experiment freezes a v0.17.0-labelled Playground observation, not future compatibility.[](source:redesign)

The UI wraps CUE Go API in WASM using a synthetic stdin/module context. Eval selects defaults for rendering; def preserves expressions; export requires concrete values. No issue CLI command or exit was reproduced.[](source:playground)

The fixture is authored for teaching, distinct from issue 1449. The Playground label is v0.17.0; its WASM bytes were not independently identified. The observations are Go API output, not CLI execution or an exit status. No human comprehension benefit has been measured.
## Why does the reference lack a usable default? {#reference}

The two input preferences disagree. Their default component has no usable result, while the allowed-value domain remains `string`. This is not a conflict that removes all valid values. The displayed disjunction is not a set of surviving defaults.[](source:spec)

## Why does interpolation resolve here? {#interpolation}

Interpolation requires a concrete expression result. In this fixture, the preference for `detail` supplies that result, producing a concrete string compatible with the reader constraint. This is a different expression, not a general override rule.[](source:spec)

## Is audit valid, and does order choose a winner? {#controls}

| Question | Observed result | Meaning |
| --- | --- | --- |
| Is `audit` valid? | `explicitValue.mode: "audit"` | Yes: an explicit string narrows the remaining domain. |
| Does reversing operands pick a winner? | Both references show the same unresolved disjunction. | No winner is selected by operand order in this example. |

Unification is commutative; the result is composition rather than last-writer precedence.[](source:spec)

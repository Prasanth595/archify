# Processor architecture extension

## Scope

Extend the existing `architecture` diagram mode with a first-class `processor`
component type. A processor remains an ordinary architecture component for
layout, routing, boundaries, repository evidence, guided views, cards, and
exports; the extension only adds processor-specific authoring facts and visual
semantics.

Each processor may declare these optional facts:

- `architecture`: ISA or microarchitecture label such as `arm64`, `x86_64`, or
  `RISC-V`.
- `vendor`: processor vendor or implementation family.
- `cores`: physical core count.
- `threads`: hardware thread count.
- `cache`: human-readable cache description.
- `frequency`: human-readable clock or performance label.

The existing `label`, `sublabel`, and `tag` fields remain authoritative. When a
processor omits `sublabel`, the renderer may derive a compact detail line from
the processor facts; authored `sublabel` always wins. Processor facts are
descriptive only: Archify does not infer benchmark results, ISA compatibility,
topology, or runtime hardware from them.

## Compatibility and non-goals

- Existing schema-v1 architecture documents and all other diagram types remain
  valid and render byte-for-byte unchanged.
- No new top-level diagram type, automatic layout engine, dependency, native
  binary, runtime hardware probe, benchmark claim, or CPU-specific routing rule
  is introduced.
- The existing component IDs, geometry, relationship IDs, boundaries, source
  evidence, quality profiles, exports, and viewer interactions remain shared.
- Invalid processor facts fail through the normal schema diagnostics before an
  artifact is written.

## Implementation

1. Add `processor` to the shared component and icon vocabularies.
2. Add bounded processor fact fields to the architecture component schema.
3. Reuse the existing frontend palette for processor fills/text, then add a
   processor semantic sigil, localized legend labels, and an architecture
   legend entry without changing the shared template bytes.
4. Render processor facts as stable `data-processor-*` attributes and a
   readable derived detail line only when `sublabel` is absent.
5. Add focused schema/render regression tests and a small processor example.
6. Regenerate validators and the checked-in package archive when the canonical
   toolchain is available.

## Acceptance checks

- A processor example validates, renders, and preserves its facts in the SVG.
- Authored `sublabel` is never replaced by derived processor details.
- Invalid core/thread values and unknown processor fields fail with normal
  schema diagnostics.
- Existing golden renders and the full renderer test suite remain passing.


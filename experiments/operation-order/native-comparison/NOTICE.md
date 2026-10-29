# Attribution and derivation

Porcupine is Copyright (c) Anish Athalye, licensed under MIT. The exact [upstream license](upstream/LICENSE.md) and [README](upstream/README.md) are retained. [sources.json](sources.json) pins every vendored file to [97cd067defd99df172053ba7f4ca5bbae57fe446](https://github.com/anishathalye/porcupine/tree/97cd067defd99df172053ba7f4ca5bbae57fe446).

The native generated HTML embeds the upstream visualizer. It is an output of Porcupine, not an Archify diagram. The main.go model, input type and original events are derived from its README under that license. The additional description functions, single-return-value control, capture scripts, verification and research commentary are new research work.

All eleven files under upstream are byte-preserved; none of the checker or visualizer implementation was modified. Third-party Jepsen histories and other repositories' material were not copied.

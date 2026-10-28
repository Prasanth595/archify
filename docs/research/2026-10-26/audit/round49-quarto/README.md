# Quarto code annotation audit · round 49

Research only. Archify base: `86c37724811a4aa137201e58f4f285d19df7b10d`.
Existing Draft PR #1015 already owns source/code focus-line work; this packet does not implement it again or review/modify that contributor's branch.

## Reproduce

Open [the official code annotation page](https://quarto.org/docs/authoring/code-annotation.html) at 1440×900. In the first example:

1. Click annotation 2 in the list below the code. Observe the four relative code lines and the band extending left of the code block.
2. Click annotation 1 to switch to one line; click it again to remove the band.
3. Focus the first code copy button and press Tab. The observed next focus is the HTML styles link, bypassing the annotation controls.
4. Select annotation 2 again and measure the sourceCode wrapper and highlight band through DOM bounding boxes.

The recorded generator is quarto-1.11.7, not a known deployment commit. Five actual browser scripts, their logs, three states, and five reviewed unmodified PNGs are stored locally under the root in [local-evidence-manifest.json](local-evidence-manifest.json). Only the derived states and hashes are in Git. The local scripts include absolute paths and session-owned space 3/p1; they are historical receipts, not portable scripts to run blindly. The browser ended at about:blank.

The Quarto website documentation's redistribution license was not established from its README/license page; the CLI's MIT license is not asserted for all website prose or assets. Therefore the full DOM logs and page captures remain local. The five pinned CLI files below are separately MIT-licensed and are archived unchanged with the copyright notice.

## Sources and validation

- Quarto CLI `623cd99e8c66ec29c9ef1fe17e4469c11c3c14eb`, [MIT / Posit Software, PBC](sources/COPYING.md). [sources.json](sources.json) contains Git blob IDs, sizes and SHA-256.
- Quarto web `781af76ce83db51b4b02ddcb5a871de1b20f2cba` was read for authoring documentation and license scope; source locations are recorded in [remote-state.json](remote-state.json), not copied.
- Upstream #13448 is closed; this does not establish the tested public page's geometry. The pinned current template uses client-rectangle placement; the public inline script has offsetTop and lacks placeBand.
- The archived Playwright test targets #13448 and multiple formats/scroll contexts, and marks light-theme contrast as expected failure. It was **read, not run**. Quarto was not found on PATH; no install/build/render occurred.
- No R/Python example execution, source revision verification by Quarto, standalone offline export, reader study, or whole-site accessibility acceptance is claimed.

From the Archify repository root:

```sh
python3 docs/research/2026-10-26/audit/round49-quarto/summarise.py
python3 docs/research/2026-10-26/audit/round49-quarto/verify.py
# Original machine only: also verify the local screenshot/log packet.
python3 docs/research/2026-10-26/audit/round49-quarto/verify.py --local
```

These commands verify preserved observations and bytes. They do not rerun Quarto or prove its behavior across other inputs.

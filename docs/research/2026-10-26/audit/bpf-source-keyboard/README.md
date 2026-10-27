# BPF full-source keyboard follow-up · 2026-10-27

The already delivered baseline HTML at `cd5d94ea3bf66b9ae4b08459ac5d454994b2aee2`, SHA-256 `52701f3011450eea283827f2284328a28a174d34532ebdabb2c30a3f034be46b`, was inspected in Ego at 390×844, device scale 1, mobile=false. No content was generated or modified for this check. It remains based on product `500d4a65`, not newer dev.

After file navigation, physical Tab reached the source PRE on the fifteenth step even though its DOM tabIndex was −1. Eight ArrowRight presses moved it to 253.5px. A later invocation's PRE-focus precondition failed, so it sent no arrows and produced no intended screenshot; focus must not be assumed across tool invocations. A fresh bounded keyboard pass again reached PRE at step 15; sixteen ArrowRight presses reached 375.5px, the right limit of 705px content inside a 330px box (rounding differs by half a CSS pixel). Document width remained 390px. The saved end screenshot was inspected.

This confirms keyboard access in this Chrome/Ego observation. It does not establish behavior in every browser, assistive technology, or touch device. No missing-keyboard-access defect was reproduced, so no tabindex or shared Reader change was introduced. Exact observations are in the two JSON files; the earlier focus precondition failure is preserved as a reported failed observation, not a product failure.

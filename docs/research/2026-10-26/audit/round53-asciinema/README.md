# asciinema marker clock — round 53

Disposition: retain native playback evidence; do not add an Archify terminal player/importer. This packet tests marker time coordinates, not user comprehension or command execution.

## Inputs and exact runtime

[original.cast](original.cast) is byte-identical to upstream tests/assets/long.cast at **8ba9c54008ed1f25d2914abe31ea118dbf7da2e4 / v3.17.0**: 136 bytes, asciicast v2, 80 columns × 24 rows, four output events at 0.1, 1, 6 and 12 seconds. Its header has no timestamp origin. It is a synthetic upstream fixture selected by this researcher.

[embedded.cast](embedded.cast) preserves every original output event, adding only an m event immediately after the output at 6 and 12 seconds. Labels explicitly name the source times. [build-fixtures.py](build-fixtures.py) is the complete transformation.

[cases.json](cases.json) defines three cases:

1. Original recording with external markers at 6 and 12 seconds, no idle limit.
2. Same input and external markers, idleTimeLimit 1.
3. Derived recording with the two embedded markers, idleTimeLimit 1; no external marker option.

Common options: preload, poster npt:0, controls true, fit width, font size 14px, hidden cursor. Auto-play stays off. Browser actions click the actual native .ap-marker-container; no player methods or private app state are invoked through browser evaluation. Public player DOM text, timers, labels and screenshot pixels are retained.

Two release assets were downloaded and checked against GitHub asset digests:
- JS: 185010 bytes, SHA-256 a13c37632e1b5c49fe9128417b9319a9b5bc64cb457dd5ae52cbba8a3aceb880.
- CSS: 19184 bytes, SHA-256 f619fe17597043564f03b2c6918b3daf890ee8b912fb408542fba11afade4fdb.

Assets remain outside Git. No package install, recorder invocation, Rust/Nix build, dependency installation or source-build reproducibility claim. The documentation site's observed asset URLs name 3.9.0-83ce182; that site is not the fixed release we executed. Deployment identity was not verified.

## Reproduce

Copy the packet to a scratch directory before regenerating evidence, then:

```sh
python3 fetch-runtime.py
python3 build-fixtures.py
python3 serve.py --port 8873
```

Open http://127.0.0.1:8873/ and use the three navigation links. In each case, click the first dot on the native progress bar. The input links expose the exact recording. The wrapper requires the fetched native assets served through /vendor/; index.html alone is not a self-contained player.

ASCIINEMA_ASSET_CACHE changes the asset destination (default ~/.cache/archify-research/asciinema-player-3.17.0). The server binds loopback and maps only the two allowlisted vendor files to that cache. Browser scripts contain this run's absolute paths and authorized space 3 / p1; adapt those paths/space before replay. Fresh runs do not reproduce existing screenshots automatically.

Run `python3 verify.py` for offline evidence checks. This compares 12 source Git blob identities, the original bytes, exactly two added markers, each terminal's 24-row DOM text layer, native marker labels, elapsed/remaining control fields, PNG dimensions, and manifest entries. It does not execute a fresh browser, upstream test suite or Archify test suite.

## What was observed

| Case | First visible marker | Terminal text after click | Elapsed / remaining DOM fields |
| --- | --- | --- | --- |
| Original / external | 00:06 – source t=6 s | start, one, six | 00:06 / -00:06 |
| Compressed / external | 00:06 – source t=6 s | start, one, six, twelve | 00:06 / -00:06 |
| Compressed / embedded | 00:02 – source t=6 s | start, one, six | 00:02 / -00:01 |

All three remain paused (native button label Play). These are seek observations, not wall-clock playback timing or pauseOnMarkers tests. The screen shows elapsed time; the recorded remaining-time DOM field corroborates the timeline extent but is not claimed visible in the screenshot.

Fixed [prepareRecording](sources/src__driver__recording__full.js) limits idle gaps before merging external markers. With limit 1, the output timestamps become 0.1, 1, 2, 3. External markers retain 6 and 12, extending the final prepared event time to 12. Embedded markers go through the limiter and become 2 and 3. [ControlBar](sources/src__components__ControlBar.js) displays dots only before duration, so the final marker at the exact endpoint has no dot; it is not a deleted source marker.

This confirms a time-coordinate distinction on one tiny fixture, not a general player defect. No live CLI session, input event, ANSI cursor rewrite, resize, alternative screen, v3 playback, streamed/segmented recording, audio, worker mode or reader study was run. The parser's v3 handling was read only.

## Evidence and cleanup

Seven PNGs were opened and inspected: one blank initial poster, three first-layout states, three final states. All are 1291 × 762. The first 880px-wide player left the attribution footer below the viewport; it was narrowed to 760px and the option JSON display compacted. The recording/options/native release were unchanged, and first/final terminal DOM states match. First-layout HTML, states, images and capture log remain in [first-layout](first-layout/).

The initial GitHub README fetch returned raw text rather than JSON metadata; that read-shape error was corrected. No native player interaction failure occurred. Raw official documentation logs are local-only, listed with hashes in [local-only.json](local-only.json); they are not committed attachments. The retained browser scripts can reproduce those reads.

The owned server was stopped and the research tab returned to about:blank. No upload, share, PR, merge, publication or installation occurred. [context.json](context.json) records bounded deduplication; [remote-heads.tsv](remote-heads.tsv) contains 333 refreshed heads; [NOTICE](NOTICE.md) retains attribution; [manifest.json](manifest.json) hashes the committed packet.

# Packet identity, order and reassembly: defer

2026-10-28 · read-only research. **Disposition: defer implementation.** Wireshark's own documented counterexample is a useful explanation question, but we did not find and run a complete small native capture for it, or demonstrate that an Archify rendering helps a reader beyond Wireshark. A guide-derived abstract example is not a packet capture or a measured product gap.

## Deduplication and baseline

At historical `origin/codex/research-lab-20261025` = `60342aa9e40618aeb7c33bdb8d65889fea3a588e`, searched Markdown research and experiments for `qvis`, `qlog`, `wireshark`, and `reassembly`: no matches. Searched current `docs/research/2026-10-26/scouts/*.md` for the same terms and packet identity: no matches. The current [async trace scout](async-trace-reading.md) already covers trace ordering and flow associations; packet-to-byte-range-to-PDU correspondence is a different question, not a reason to repeat its generic timeline work. Current workspace HEAD was `6769a2a06935c95bdfe04bbe065f6f4678159411` when inspected. No remote branch or PR survey was performed for this narrow note.

## Concrete reading question and reusable abstract fixture

**Why can an application have enough bytes for one message before Wireshark displays that message in its packet list?** The [Wireshark TCP reassembly guide](https://github.com/wireshark/wireshark/blob/dc46ccfe1f19cd5d1d63d7dac1555b1ca70eb28b/doc/wsug_src/wsug_advanced.adoc) gives this complete logical example: six distinct segments A–F, stream order `ABCDEF`, PDU 1 = `ABC`, PDU 2 = `DEF`, capture arrival order `ABECDF`. Treat each letter as a segment identity, not a packet number, timestamp, arbitrary byte length or retransmission. The complete table below is a projection of that example, not recorded capture fields:

| Capture position | Segment identity | Stream position | PDU | Contiguous stream after arrival |
| --- | --- | --- | --- | --- |
| 1 | A | 1 | 1 | A |
| 2 | B | 2 | 1 | AB |
| 3 | E | 5 | 2 | AB |
| 4 | C | 3 | 1 | ABC |
| 5 | D | 4 | 2 | ABCDE |
| 6 | F | 6 | 2 | ABCDEF |

At arrival 4 the first PDU is complete, although E arrived earlier; an application can start processing it then. The guide says Wireshark's out-of-order reassembly may wait for the gap D, and GUI / two-pass dissection can display both PDUs on the last segment F. This is a documented illustrative limitation, not an assertion that every dissector, version, preference combination, or capture exhibits it. The guide's caveats also distinguish loss from out-of-order arrival: a missing capture segment can prevent reconstruction. [Current published guide](https://www.wireshark.org/docs/wsug_html_chunked/ChAdvReassemblySection.html).

## Native capabilities and potential increment

Wireshark already exposes packet identity and relationships: the packet list marks related segments, packet details link frame references, the reassembled bytes pane shows reconstructed data, and Follow TCP Stream presents expected stream order. TCP subdissector reassembly and out-of-order reassembly have separate preferences; the latter is documented as disabled by default. The [TCP field reference](https://www.wireshark.org/docs/dfref/t/tcp.html) includes `tcp.reassembled_in` and `tcp.segment` frame references. These are documented capabilities, not a locally reproduced UI session.

An explicitly authored existing Archify Explainer/table could juxtapose arrival identity, stream position, PDU completion and Wireshark display attribution on one page, with links to source and visible assumptions. It could be a teaching aid without a parser or runtime change. It must not equate the frame displaying a reassembled PDU with the first frame at which an application could consume it; nor infer a missing packet, timing, causality or real bytes from the abstract letters. This candidate overlaps the existing trace-flow evidence work in form but focuses on a different data relation. The incremental value over the native tool is a hypothesis, not established user value.

## Source, license, and next evidence gate

Wireshark upstream default-branch snapshot [`dc46ccfe1f19cd5d1d63d7dac1555b1ca70eb28b`](https://github.com/wireshark/wireshark/tree/dc46ccfe1f19cd5d1d63d7dac1555b1ca70eb28b), checked via GitHub API 2026-10-28; repository reports GPL-2.0, see [COPYING](https://github.com/wireshark/wireshark/blob/dc46ccfe1f19cd5d1d63d7dac1555b1ca70eb28b/COPYING). The guide source's latest path commit at that snapshot is `c9e6ef4c13e1669489c0a7b394059b4dbb657bc7`. The upstream capture [`http2-data-reassembly.pcap`](https://github.com/wireshark/wireshark/blob/dc46ccfe1f19cd5d1d63d7dac1555b1ca70eb28b/test/captures/http2-data-reassembly.pcap) is 82,151 bytes; it was discovered but not downloaded, inspected, or shown to contain the above example, so it is **not** an accepted fixture. Repository license metadata does not independently establish rights for every capture; inspect provenance before redistribution.

Before proposing an experiment, obtain a small complete shareable capture whose actual frame IDs, TCP sequence ranges, PDU boundaries and out-of-order preference reproduce a naturally supported question; pin its source, hash, version and license. Run Wireshark/tshark with recorded preferences, retain native output and compare an authored Archify page on the *same* evidence with a concrete reader task. Verify omitted packets, overlaps, capture loss and attribution before drawing conclusions. `tshark` was unavailable here; no installation, native run, visual comparison or user study was performed. The current six-letter logical example remains reusable only for explanation; it cannot establish a native-tool advantage or support a general importer.

# Kconfig package audit

**No packaging blocker found in this read-only audit.** The automated browser gate remains failed and this audit is not product acceptance.

- `evidence/manifest.json`: 131 entries all exist and match SHA-256 and byte size; directory inventory exactly matches those entries plus the intentionally excluded manifest itself.
- `evidence/public-copy-map.json`: 102 entries; all original private backup bytes/hashes, public uncompressed hashes, stored bytes/hashes match. Ten stored copies are gzip; 41 records indicate path placeholders. Every gzip decompresses successfully. Scan of every public file and decompressed gzip found no literal author-home path.
- Final baseline HTML equals render02 baseline byte-for-byte: SHA-256 `dc6ee6dadbf3b6b2e13558a26ae8dd496bd1b640a32481bdfcdeaa2489d6f32e`. Final comparison equals render03 comparison byte-for-byte: `60b73e6a59074e12c94be141f9b49d72223950c4a6d12661462b8d8c183a97ef`.
- All eight upstream manifest entries match size/SHA-256; six upstream source Git blob identities were checked in the separate native audit. Manifest and source identity checks establish byte consistency, not live provenance or downstream runtime acceptance.
- README and VALIDATION state current results rather than pending UI work. Their native execution claim is one recorded run, programmatic formatter, not interactive TUI. The recovered keyboard.jsonl records actual footer reach at 52/74 Tabs; selected browser-check receipts retain 28/52 diagnostics respectively. These are distinct checks and actual Tab observation does not override the failed gate. VALIDATION explicitly preserves initial empty JSONLs and earlier screenshots as capture history, without attributing recovered observations to empty logs.

Checks were confined to saved bytes, JSON, gzip and documentation; no tests, native script, browser, or product code were run or modified. Literal path scan does not prove absence of all possible sensitive data or other private path spellings. The private raw backup remains external and is not a durable public artifact.

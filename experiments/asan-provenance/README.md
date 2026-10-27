# ASan provenance: deferred runtime probe

**Deferred.** The controlled example did not produce an AddressSanitizer report on this machine. There is no diagram, screenshot, baseline/candidate comparison, or evidence of reader benefit. Completing this direction requires a real, complete, symbolized report with access, free and allocation stacks paired with the source; do not substitute an invented report.

## Original experiment

[example.c](example.c) is original single-thread experimental code, deliberately performing an invalid read after `free`. Its separate no-inline allocation, release, and read paths share `scenario`; no external incident code was run or copied. Source SHA-256: `91c16739b225e98975acd711cd46f3ea7d7c01f878070634c1f3e3f42e30bbd8`. This is a controlled test program, not a natural incident. It is offered under the repository's license.

Base revision: `500d4a65211ffe607fde6b3ce7505027b45bb59e`. Apple clang 17.0.0 (`clang-1700.6.3.2`), target `arm64-apple-darwin25.6.0`; local compiler was `/usr/bin/clang`. Commands from a controlled temporary directory containing the exact source:

```sh
clang -O0 -g -fsanitize=address -fno-omit-frame-pointer example.c -o example
./example
ASAN_OPTIONS=symbolize=0 ./example
```

Compilation completed successfully and produced an executable and dSYM. The first run remained CPU-active with empty stdout/stderr and was terminated with SIGTERM after approximately 20 seconds (shell status 143). The second, with online symbolization disabled, remained without output and was terminated after 10 seconds; the worker recorded shell status 143 in an authored note. The original local artifacts, executable, source and outputs are retained at `/tmp/archify-asan-provenance/run/`; they are not committed. All six compile/run stdout/stderr files were zero bytes with SHA-256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. The first `run.exit` contains `143` plus newline, SHA-256 `9d9b18720961e9b4689fd763b85e7b6f36160ccd3a8a1c9ddc5103bb0f66c396`. The second `unsymbolized.exit` is an authored termination/status note, not a captured program stream or raw exit-code receipt; its SHA-256 is `c53db35c457ba2c2efe2235c0375c85345e5e3f6d61ad6aaf3041f6f4c19400f`.

## Independent empty-program control

A separate diagnostic run compared `int main(void) { return 0; }` with and without `-fsanitize=address`, both compiled by the same Apple clang with `-O0 -g -fno-omit-frame-pointer`. Both compiles exited 0 with empty outputs. The plain executable exited 0 in 0.538 seconds, stdout/stderr empty. The ASan executable produced no output, timed out at 5 seconds, and the diagnostic runner sent SIGTERM to its own child (return code -15). The control source SHA-256 is `2ad75d95660563887d8d3f1d0ae1dcf18c2379cbd83a5c72f5ab276351ee6949`. This bounds the failure to this environment and instrumentation combination; it does not establish a root cause or mean every ASan program fails elsewhere.

A one-second process sample during the empty ASan run captured a chain through dyld initialization, `__malloc_init`, `wrap_malloc_default_zone`, `__asan::AsanInitInternal`, `__asan::InitializeShadowMemory`, `__sanitizer::MemoryMappingLayout::Next`, `dyld_shared_cache_iterate_text_swift`, malloc interception, and a second `__asan::AsanInitFromRtl` ending predominantly in `__sanitizer::StaticSpinMutex::LockSlow`. This is a **selected, sanitized derived description**, not the raw sample or proof of the root cause. The original diagnostic outputs are local only in `/tmp/archify-asan-diagnosis/shim-run/`; `results.json` SHA-256 `8b73e8e619eae248f370b9228ff2e2f674ebbea774dca779c29223f75cca3d92`, and `sample-asan.txt` SHA-256 `f4343f147d37876b65097550f95015ac986be3ed9d4909146e9a792d37ddbce2`. These local temporary files may be removed by the OS.

No environment repair, installation, live Archify installation, shared product change, or external publication was attempted. If the runtime becomes usable, rerun from the exact source, retain complete output and version information, confirm the three independently labelled stacks and bounds against the report, then compare the complete source and raw report against the same material with a small sourced projection. The report itself must exist before authoring the diagram.

## Portable diagnostic summary

[Selected control evidence](diagnostic-selected.json) preserves the original empty-program source, complete normalized command arrays, limits, result codes and raw-file hashes. It is a derived selection; the full process sample and raw streams remain local. It also preserves the initial direct-driver link failures separately from the successful normal-launcher builds. AI assistance: GPT-6.1-Terra authored the controlled fixture and records; GPT-6.1-Sol ran and reviewed the independent empty-program controls.

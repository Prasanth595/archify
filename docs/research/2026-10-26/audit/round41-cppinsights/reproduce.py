#!/usr/bin/env python3
"""Compile and run the original and browser-selected transformation; no install."""
import hashlib
import json
from pathlib import Path
import platform
import subprocess
import sys
import time

root = Path(__file__).resolve().parent
out = Path(sys.argv[1]).resolve()
out.mkdir(parents=True, exist_ok=False)
records = []
def run(label, args):
    start = time.monotonic()
    result = subprocess.run(args, capture_output=True)
    (out / (label + ".stdout")).write_bytes(result.stdout)
    (out / (label + ".stderr")).write_bytes(result.stderr)
    records.append(dict(label=label, argv=args, exit=result.returncode,
                        elapsed_seconds=time.monotonic() - start))
    assert result.returncode == 0, (label, result.stderr.decode(errors="replace"))
    return result.stdout

run("compiler", ["/usr/bin/clang++", "--version"])
outputs = []
for name in ("original", "transformed"):
    source = root / "fixture" / (name + ".cpp")
    binary = out / name
    run(name + "-compile", ["/usr/bin/clang++", "-std=c++17", "-Wall",
                           "-Wextra", "-pedantic", str(source), "-o", str(binary)])
    outputs.append(run(name + "-run", [str(binary)]))
assert outputs[0] == outputs[1]
expected = []
for mode, values, outers in [
    ("value", [2, 3, 3], [10, 10, 10]),
    ("reference", [11, 12, 13], [11, 12, 13]),
    ("alias-by-value", [2, 3, 3], [10, 10, 10]),
]:
    for stage, value, outer in zip(("first", "original-after-copy", "copied-closure"), values, outers):
        expected.append(f"{mode}|{stage}|result={value}|outer={outer}\n")
assert outputs[0] == "".join(expected).encode()
(out / "receipt.json").write_text(json.dumps({
    "platform": platform.platform(), "commands": records,
    "input_sha256": {p.name: hashlib.sha256(p.read_bytes()).hexdigest()
                     for p in (root / "fixture").glob("*.cpp")},
    "matched_rows": 9, "claim": "Only this fixture's printed observations match."
}, indent=2) + "\n")
print("PASS: both programs compile; all 9 printed records match the explicit expected observations")

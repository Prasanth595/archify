"""Observe one complete pinned fixture; do not load a user configuration."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys

root = Path(__file__).resolve().parent
source = root / "upstream"
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("output", type=Path, help="A new directory; existing output is refused")
args = parser.parse_args()
output = args.output.resolve()
manifest = json.loads((source / "manifest.json").read_text())
for entry in manifest["files"]:
    data = (source / entry["path"]).read_bytes()
    if len(data) != entry["bytes"] or hashlib.sha256(data).hexdigest() != entry["sha256"]:
        raise SystemExit("Pinned source mismatch: " + entry["path"])
output.mkdir(parents=True, exist_ok=False)
(output / "native-info").mkdir()
sys.dont_write_bytecode = True
sys.path.insert(0, str(source))
os.chdir(source)
import kconfiglib
import menuconfig

print("Python:", sys.version)
print("Source commit:", manifest["commit"])
print("Input: tests/Kimply; no .config loaded or values assigned")
kconf = kconfiglib.Kconfig("tests/Kimply", warn=True, warn_to_stderr=True)
menuconfig._kconf = kconf
values = []
for symbol in kconf.unique_defined_syms:
    values.append({
        "name": symbol.name,
        "value": symbol.str_value,
        "user_value": symbol.user_value,
        "visibility": kconfiglib.TRI_TO_STR[symbol.visibility],
        "direct_dependency": kconfiglib.expr_str(symbol.direct_dep),
        "direct_dependency_value": kconfiglib.TRI_TO_STR[kconfiglib.expr_value(symbol.direct_dep)],
        "weak_reverse_dependency": kconfiglib.expr_str(symbol.weak_rev_dep),
        "weak_reverse_dependency_value": kconfiglib.TRI_TO_STR[kconfiglib.expr_value(symbol.weak_rev_dep)],
        "reverse_dependency": kconfiglib.expr_str(symbol.rev_dep),
        "locations": [{"file": n.filename, "line": n.linenr} for n in symbol.nodes],
    })
for name in ("IMPLY_DIRECT_DEPS", "UNMET_DIRECT_1", "MET_DIRECT_1"):
    text = menuconfig._info_str(kconf.syms[name].nodes[0])
    (output / "native-info" / (name + ".txt")).write_text(text + "\n")
    print("\n=== Native menuconfig information formatter:", name, "===")
    print(text)
print("\n=== Complete generated configuration ===")
print(kconf.write_config(str(output / "generated.config"), save_old=False))
(output / "all-symbol-values.json").write_text(json.dumps(values, indent=2) + "\n")
(output / "native-warnings.json").write_text(json.dumps(kconf.warnings, indent=2) + "\n")
(output / "runtime.json").write_text(json.dumps({
    "python": sys.version, "executable": sys.executable,
    "sourceCommit": manifest["commit"], "input": "tests/Kimply",
    "definedSymbols": len(values), "loadedUserConfig": False,
    "assignedUserValues": False, "interactiveMenuconfigRun": False,
    "formatter": "menuconfig._info_str with native Kconfig object",
}, indent=2) + "\n")

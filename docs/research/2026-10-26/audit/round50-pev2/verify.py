#!/usr/bin/env python3
"""Verify the archived observation packet; no browser, SQL, or product tests."""
import argparse
import hashlib
import json
from pathlib import Path
import struct

parser = argparse.ArgumentParser()
parser.add_argument("--asset", type=Path)
args = parser.parse_args()
root = Path(__file__).resolve().parent
read = lambda name: json.loads((root / name).read_text())
digest = lambda data: hashlib.sha256(data).hexdigest()
manifest = read("manifest.json")
expected_paths = {entry["path"] for entry in manifest["files"]}
actual_paths = {p.relative_to(root).as_posix() for p in root.rglob("*")
                if p.is_file() and p.name != "manifest.json"}
assert actual_paths == expected_paths, "packet file set changed"
for entry in manifest["files"]:
    data = (root / entry["path"]).read_bytes()
    assert len(data) == entry["bytes"] and digest(data) == entry["sha256"], entry["path"]
sources = read("source-tree.json")["files"]
for entry in sources:
    data = (root / "upstream" / entry["path"]).read_bytes()
    blob = b"blob " + str(len(data)).encode() + b"\0" + data
    assert len(data) == entry["size"] and hashlib.sha1(blob).hexdigest() == entry["sha"], entry["path"]
fixture = (root / "fixture/plan_many_ctes.json").read_bytes()
assert len(fixture) == 67418
assert digest(fixture) == "a1c79b5782086474c73bd5ad2f7dd3265d73663f9030f5769638a4c2633cf6b4"
for name in ("native-input.json", "native-raw.json"):
    assert (root / "fixture" / name).read_bytes() == fixture, name
parent = json.loads(fixture)[0]["Plan"]["Plans"][1]["Plans"][0]["Plans"][0]["Plans"][0]
nodes = {"#6": parent, "#7": parent["Plans"][0], "#12": parent["Plans"][1]}
grid = {row["cells"][0]: row["cells"] for row in read("browser/grid-state.json")}
for name, node in nodes.items():
    cells = grid[name]
    shown_rows = int(cells[2].replace("~", "").replace(",", ""))
    assert shown_rows == node["Actual Rows"] * node["Actual Loops"], name
    assert int(cells[5]) == node["Actual Loops"], name
assert [nodes["#12"][key] for key in ("Plan Rows", "Actual Rows", "Actual Loops")] == [3, 3, 352]
assert grid["#12"][3] == "" and grid["#12"][2] == "~1,056"
assert all("2" in grid[key][3] and "▾" in grid[key][3] for key in ("#6", "#7"))
warning = read("browser/zoomed-warning-state.json")
assert "Rows: ~1,056 (Planned: ~1,056)" in warning["selected"]
assert any("rows count is an average value" in t["text"]
           and t["opacity"] == "1" and t["visibility"] == "visible" for t in warning["tooltip"])
assert read("browser/raw-state.json")["sha256"] == digest(fixture)
pngs = list((root / "screenshots").glob("*.png"))
assert len(pngs) == 7
for png in pngs:
    data = png.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", data[16:24]) == (1440, 900), png.name
if args.asset:
    data = args.asset.read_bytes()
    assert len(data) == 1308080
    assert digest(data) == "a9c992a85aa111b4442ece08b1f1abcd92f5a651cb41fc9510a74ad4b3bba99f"
print(json.dumps({"packetFiles": len(expected_paths), "verifiedSourceBlobs": len(sources),
                  "identicalPlanCopies": 3, "nativeGridNodes": 3,
                  "reviewedPNGDimensions": len(pngs), "nativeReleaseAssetVerified": bool(args.asset)},
                 sort_keys=True))

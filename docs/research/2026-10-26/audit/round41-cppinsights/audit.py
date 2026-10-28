#!/usr/bin/env python3
"""Check archived source identities, selected text, replay receipts and manifest."""
import hashlib
import json
from pathlib import Path

r = Path(__file__).resolve().parent
meta = json.loads((r / "sources.json").read_text())
for item in meta["files"]:
    b = (r / "upstream" / item["path"]).read_bytes()
    assert len(b) == item["size"]
    assert hashlib.sha1(b"blob " + str(len(b)).encode() + b"\0" + b).hexdigest() == item["sha"]
    assert hashlib.sha256(b).hexdigest() == item["sha256"]
line = next(x for x in (r / "browser/archify-round41-browser-11.log").read_text().splitlines()
            if x.startswith("SELECTED_OUTPUT "))
selected = json.loads(line.removeprefix("SELECTED_OUTPUT "))
inputs = [x for x in selected["inputs"] if x["value"] and x["start"] == 0 and x["end"] == len(x["value"])]
assert len(inputs) == 1
assert inputs[0]["value"] == selected["selection"] == (r / "fixture/transformed.cpp").read_text()
assert len(selected["selection"].encode()) == 2174
for run in ("1", "2"):
    d = r / "runs" / run
    receipt = json.loads((d / "receipt.json").read_text())
    assert receipt["matched_rows"] == 9 and len(receipt["commands"]) == 5
    assert all(c["exit"] == 0 for c in receipt["commands"])
    assert (d / "original-run.stdout").read_bytes() == (d / "transformed-run.stdout").read_bytes()
    assert len((d / "original-run.stdout").read_text().splitlines()) == 9
    assert all(not p.read_bytes() for p in d.glob("*.stderr"))
    for name, expected in receipt["input_sha256"].items():
        assert hashlib.sha256((r / "fixture" / name).read_bytes()).hexdigest() == expected
for p in (r / "runs/1").glob("*.std*"):
    assert p.read_bytes() == (r / "runs/2" / p.name).read_bytes()
assert len(list((r / "images").glob("*.png"))) == 4
assert len(list((r / "browser").glob("*.mjs"))) == 13
manifest = json.loads((r / "manifest.json").read_text())
actual = {str(p.relative_to(r)): hashlib.sha256(p.read_bytes()).hexdigest()
          for p in r.rglob("*") if p.is_file() and p.name != "manifest.json"}
assert actual == manifest
print(f"PASS: {len(actual)} archived files; source, selection and two replays agree")

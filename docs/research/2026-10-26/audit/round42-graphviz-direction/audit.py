#!/usr/bin/env python3
"""Audit archived native output; does not execute Graphviz or graph traversal."""
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET

r = Path(__file__).resolve().parent
ns = {"s": "http://www.w3.org/2000/svg"}
cases = [
    ("directed_forward", True, "forward", 1),
    ("directed_none", True, "none", 0),
    ("directed_both", True, "both", 2),
    ("directed_back", True, "back", 1),
    ("undirected_forward", False, "forward", 1),
]
for name, directed, direction, arrows in cases:
    first = (r / "native/1" / (name + ".json")).read_bytes()
    assert first == (r / "native/2" / (name + ".json")).read_bytes()
    g = json.loads(first)
    assert g["name"] == name and g["directed"] is directed
    assert len(g["edges"]) == 1
    edge = g["edges"][0]
    nodes = {n["_gvid"]: n["name"] for n in g["objects"]}
    assert nodes[edge["tail"]] == "CRM" and nodes[edge["head"]] == "ERP"
    assert edge["dir"] == direction and edge["label"] == "shared ID"
    svg = ET.fromstring((r / "native/1" / (name + ".svg")).read_text())
    groups = svg.findall(".//s:g[@class='edge']", ns)
    assert len(groups) == 1
    assert len(groups[0].findall("s:polygon", ns)) == arrows
    print(name, "directed=", directed, "edge records=1", "arrow polygons=", arrows)

for line in (r / "browser/archify-round42-browser-06.log").read_text().splitlines():
    if line.startswith("REPLAY "):
        d = json.loads(line.removeprefix("REPLAY "))
        assert d["observedSource"] == (r / "fixtures" / (d["name"] + ".dot")).read_text()
        assert d["text"] == (r / "native/2" / (d["name"] + ".json")).read_text()
for item in json.loads((r / "sources.json").read_text())["files"]:
    b = (r / "upstream" / item["path"]).read_bytes()
    assert len(b) == item["size"]
    assert hashlib.sha1(b"blob " + str(len(b)).encode() + b"\0" + b).hexdigest() == item["sha"]
    assert hashlib.sha256(b).hexdigest() == item["sha256"]
assert len(list((r / "images").glob("*.png"))) == 5
assert len(list((r / "browser").glob("*.mjs"))) == 6
actual = {str(p.relative_to(r)): hashlib.sha256(p.read_bytes()).hexdigest()
          for p in r.rglob("*") if p.is_file() and p.name != "manifest.json"}
assert actual == json.loads((r / "manifest.json").read_text())
print(f"PASS: {len(actual)} archived files; five exact JSON replays, source/DOM evidence and upstream identities agree")

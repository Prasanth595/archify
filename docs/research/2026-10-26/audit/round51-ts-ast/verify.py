#!/usr/bin/env python3
"""Verify archived native evidence, not the live viewer or upstream tests."""
import hashlib
import json
from pathlib import Path
import struct

root = Path(__file__).resolve().parent
read = lambda name: json.loads((root / name).read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
manifest = read("manifest.json")
actual = {p.relative_to(root).as_posix() for p in root.rglob("*")
          if p.is_file() and p.name != "manifest.json"}
assert actual == {e["path"] for e in manifest["files"]}
for entry in manifest["files"]:
    data = (root / entry["path"]).read_bytes()
    assert len(data) == entry["bytes"] and sha(data) == entry["sha256"], entry["path"]
sources = read("source-tree.json")["files"]
for entry in sources:
    data = (root / "upstream" / entry["path"]).read_bytes()
    blob = b"blob " + str(len(data)).encode() + b"\0" + data
    assert len(data) == entry["size"] and hashlib.sha1(blob).hexdigest() == entry["sha"], entry["path"]
data = (root / "fixture/LineAndColumnComputer.ts").read_bytes()
assert len(data) == 1502 and sha(data) == "6ddd8c62c70ded6b3cfc45db33a851f51c28a5bfdbdd513003c3f4aa6db38b12"
assert data.isascii()
for path in ("fixture/native-input.ts", "fixture/native-after.ts", "upstream/src/utils/LineAndColumnComputer.ts"):
    assert (root / path).read_bytes() == data, path
text = data.decode()
assert text[150:152] == "\n\n" and text[152:155] == "/**" and text[234:246] == "export class"
fields = lambda state: {e["name"]: e["value"] for e in state["fields"]}
rows = []
for mode, name in (("0", "foreach-class-state.json"), ("1", "getchildren-class-state.json")):
    state = read("browser/" + name)
    f = fields(state)
    assert state["selected"] == "ClassDeclaration" and state["options"]["mode"] == mode
    assert state["options"]["compiler"] == "typescript-6.0.3"
    assert all(f[k] == str(v) for k, v in {"pos":150, "end":1501, "getFullStart()":150, "getStart()":234, "getStart(sourceFile, true)":152, "getChildCount()":7}.items())
    assert f["getFullText()"] == text[150:1501] and f["getText()"] == text[234:1501]
    children = [e["kind"] for e in state["tree"] if e["parent"] == "ClassDeclaration"]
    rows.append({"mode": mode, "treeDOMLabels": len(state["tree"]), "classChildren": children})
assert len(rows[0]["classChildren"]) == 6 and len(rows[1]["classChildren"]) == 7
token = read("browser/comment-token-state.json")["state"]
each = read("browser/comment-foreach-state.json")["state"]
assert token["status"] == each["status"] == ["Pos 166, Ln 4, Col 15"]
assert token["selected"] == "JSDoc" and each["selected"] == "ClassDeclaration"
assert fields(token)["getFullText()"] == text[152:233]
assert len(token["highlights"]) == 1 and len(each["highlights"]) > 1
pngs = list((root / "screenshots").glob("*.png"))
assert len(pngs) == 6
for path in pngs:
    b = path.read_bytes()
    assert b[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", b[16:24]) == (1440, 900), path
summary = {"sourceBytes": len(data), "sourceSHA256": sha(data), "compilerControl": "6.0.3",
           "classRawRange": [150, 1501], "classTextRange": [234, 1501],
           "classHighlightRangeFromSourceRule": [152, 1501],
           "sameCursor": token["status"][0], "getChildrenHit": token["selected"],
           "forEachChildHit": each["selected"], "traversals": rows}
assert summary == read("observations.json"), "derived observation summary differs"
print(json.dumps({"packetFiles":len(actual), "sourceBlobs":len(sources), "identicalInputCopies":3,
                  "reviewedPNGDimensions":len(pngs), "treeDOMLabels":[len(read("browser/"+p)["tree"]) for p in ("foreach-class-state.json","getchildren-class-state.json")],
                  "sameCursorDifferentSelection":True},sort_keys=True))

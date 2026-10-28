"""Check archived source bytes and inspect upstream expected data; no Datalog execution."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
manifest = json.loads((root / "source-map.json").read_text())
for entry in manifest["files"]:
    data = (root / entry["path"]).read_bytes()
    assert len(data) == entry["bytes"], entry["path"]
    assert hashlib.sha256(data).hexdigest() == entry["sha256"], entry["path"]
    blob = b"blob " + str(len(data)).encode() + b"\0" + data
    assert hashlib.sha1(blob).hexdigest() == entry["blob"], entry["path"]

expected = root / "tests/provenance/path_explain_output/provenance.txt"
proof = json.loads(expected.read_text())
nodes = []

def walk(node):
    nodes.append(node)
    for child in node.get("children", []):
        walk(child)

walk(proof["proof"])
print(json.dumps({
    "kind": "source identity and expected-file inspection; not engine execution",
    "revision": manifest["revision"],
    "filesVerified": len(manifest["files"]),
    "expectedProof": str(expected.relative_to(root)),
    "nodeOccurrences": len(nodes),
    "innerOccurrences": sum("children" in node for node in nodes),
    "axiomFieldOccurrences": sum("axiom" in node for node in nodes),
    "ruleDefinitions": len(proof["rules"]),
    "leafLabels": [node["axiom"] for node in nodes if "axiom" in node],
    "negationExpectedText": (root / "tests/provenance/path_explain_negation/path_explain_negation.out").read_text(),
}, ensure_ascii=False, indent=2))

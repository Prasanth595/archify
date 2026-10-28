"""Verify the lossless archive and recorded replay; does not run Git or application code."""
import base64
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
streams = {}
command_count = 0
snapshot_count = 0
for run in ("initial", "replay"):
    records = [json.loads(line) for line in (root / run / "transcript.jsonl").read_text().splitlines()]
    for record in records:
        command_count += 1
        assert record["exitCode"] == record["expectedExitCode"], record["label"]
        for name in ("stdout", "stderr"):
            data = base64.b64decode(record[name + "Base64"], validate=True)
            assert hashlib.sha256(data).hexdigest() == record[name + "Sha256"], record["label"]
            key = (run, record["label"], name)
            assert key not in streams
            streams[key] = data
        if run == "initial" and record["label"].startswith("blob-"):
            revision, path = record["argv"][-1].split(":", 1)
            assert (root / run / "snapshots" / revision / path).read_bytes() == streams[(run, record["label"], "stdout")]
            snapshot_count += 1

selected = ("range-default", "range-factor0", "range-message", "tip-diff", "old-series",
            "new-series", "parents", "logging-ancestor", "message-tree-diff", "remotes", "final-status")
for label in selected:
    for name in ("stdout", "stderr"):
        assert streams[("initial", label, name)] == streams[("replay", label, name)], (label, name)
first = json.loads((root / "initial/identity.json").read_text())
assert first == json.loads((root / "replay/identity.json").read_text())
copies = json.loads((root / "copy-map.json").read_text())["rawCopies"]
for entry in copies:
    data = (root / entry["public"]).read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry["sha256"]
    assert data == streams[("initial", Path(entry["public"]).stem, "stdout")]
print(json.dumps({"scope": "archived command records, snapshot bindings and replay comparison",
    "commandRecordsVerified": command_count, "streamsVerified": len(streams),
    "initialSnapshotsBound": snapshot_count, "rawTextCopiesVerified": len(copies),
    "replayMatchingStreams": len(selected) * 2, "matchingCommitIdentities": len(first["commits"]),
    "gitVersion": first["gitVersion"], "runtimeExecutedByThisVerifier": False}, indent=2))

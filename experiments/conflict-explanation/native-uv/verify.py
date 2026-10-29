#!/usr/bin/env python3
"""Audit the frozen research packet, not general uv or Archify behavior."""
import base64
import csv
from email.parser import BytesParser
import hashlib
import io
import json
from pathlib import Path
import re
import struct
import subprocess
import zipfile

root = Path(__file__).resolve().parent
repo = root.parents[2]
base = "4805f166d0c3078f06e7b309f1594c788b79ee5f"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def blob(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def load(path):
    return json.loads((root / path).read_text())


manifest = load("wheel-manifest.json")
expected = {("root", "1"): ["foo", "baz"], ("baz", "1"): [], ("bar", "1"): []}
expected.update({("foo", str(i)): ["bar"] for i in range(1, 6)})
assert len(manifest) == 8
assert set(p.relative_to(root).as_posix() for p in (root / "wheels").rglob("*.whl")) == {m["path"] for m in manifest}
seen = set()
for entry in manifest:
    data = (root / entry["path"]).read_bytes()
    assert sha(data) == entry["sha256"] and len(data) == entry["bytes"]
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        assert archive.testzip() is None
        names = archive.namelist()
        assert len(names) == 3 and names == entry["members"]
        assert {n.rsplit("/", 1)[1] for n in names} == {"METADATA", "WHEEL", "RECORD"}
        metadata = BytesParser().parsebytes(archive.read(next(n for n in names if n.endswith("/METADATA"))))
        key = (metadata["Name"], metadata["Version"])
        assert key not in seen
        seen.add(key)
        assert metadata.get_all("Requires-Dist", []) == expected[key]
        assert entry["requires_dist"] == expected[key]
        assert ("wheels/bar/" in entry["path"]) == (key == ("bar", "1"))
        records = list(csv.reader(io.StringIO(archive.read(next(n for n in names if n.endswith("/RECORD"))).decode())))
        assert {row[0] for row in records} == set(names)
        for name, checksum, size in records:
            if name.endswith("/RECORD"):
                assert checksum == size == ""
            else:
                payload = archive.read(name)
                value = base64.urlsafe_b64encode(hashlib.sha256(payload).digest()).rstrip(b"=").decode()
                assert checksum == "sha256=" + value and int(size) == len(payload)
assert seen == set(expected)

for number in (1, 2, 3):
    run = load(f"run{number}/run.json")
    script = root / ("run1/probe.py" if number == 1 else "probe.py")
    assert run["script_sha256"] == sha(script.read_bytes())
    assert [c["exit_code"] for c in run["cases"]] == [1, 0]
    for case in run["cases"]:
        for stream in ("stdout", "stderr"):
            assert case[stream + "_sha256"] == sha((root / f'run{number}/{case["name"]}.{stream}.txt').read_bytes())
        if number > 1:
            for flag in ("--offline", "--no-index", "--no-cache", "--no-python-downloads", "--no-build"):
                assert flag in case["command"]
    assert run["cases"][1]["command"] == run["cases"][0]["command"] + ["--find-links", "wheels/bar"]
    pins = re.findall(r"^([a-z]+)==([0-9]+)$", (root / f"run{number}/provided-bar.stdout.txt").read_text(), re.M)
    assert dict(pins) == {"bar": "1", "baz": "1", "foo": "5", "root": "1"}
for file in ("missing-bar.stdout.txt", "missing-bar.stderr.txt", "provided-bar.stdout.txt"):
    assert (root / "run2" / file).read_bytes() == (root / "run3" / file).read_bytes()
for number in (2, 3):
    summary = (root / f"run{number}/provided-bar.stderr.txt").read_text()
    assert re.fullmatch(r"Resolved 4 packages in [0-9.]+ms\n", summary)
assert "provided package locations" in (root / "run2/missing-bar.stderr.txt").read_text()

for entry in load("source/blobs.json"):
    data = (root / "source" / entry["local_path"]).read_bytes()
    assert blob(data) == entry["git_blob"] and len(data) == entry["bytes"]
observed = load("browser/observation.json")
assert observed["servedFileSha256"] == sha((root / "index.html").read_bytes())
assert len(observed["streamChecks"]) == 4 and all(c["exactText"] for c in observed["streamChecks"])
for name in ("missing-bar", "provided-bar"):
    for stream in ("stdout", "stderr"):
        assert observed["streams"][f"{name}-{stream}"] == (root / f"run2/{name}.{stream}.txt").read_text()
pngs = []
for path in sorted((root / "browser").glob("*.png")):
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n" and struct.unpack(">II", data[16:24]) == (1291, 762)
    pngs.append(path.name)
assert len(pngs) == 2

old = subprocess.check_output(["git", "ls-tree", "-rz", base, "--", "experiments/conflict-explanation"], cwd=repo)
unchanged = 0
for line in old.split(b"\0"):
    if not line:
        continue
    metadata, path = line.split(b"\t", 1)
    path = path.decode()
    if path == "experiments/conflict-explanation/README.md":
        continue
    assert blob((repo / path).read_bytes()) == metadata.split()[2].decode(), path
    unchanged += 1
links = 0
for target in re.findall(r"\]\(([^)]+)\)", (root / "README.md").read_text()):
    if not target.startswith(("http:", "https:")):
        assert (root / target.split("#")[0]).exists(), target
        links += 1
print(json.dumps({"status": "pass", "wheels": len(manifest), "source_blobs": 3,
                  "replay_equal_streams": 3, "success_stderr_timing_only": True,
                  "browser_exact_streams": 4, "screenshots": pngs,
                  "historical_files_unchanged": unchanged, "historical_base": base,
                  "readme_local_links": links}, indent=2))

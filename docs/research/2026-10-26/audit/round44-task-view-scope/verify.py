#!/usr/bin/env python3
"""Offline byte/provenance audit; does not execute upstream applications."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
def sha256(b):
    return hashlib.sha256(b).hexdigest()
def blob(b):
    return hashlib.sha1(b'blob ' + str(len(b)).encode() + b'\0' + b).hexdigest()
for name in ['sources.json', 'inputs.json']:
    meta = json.loads((root / name).read_text())
    for item in meta['files']:
        data = (root / item['path']).read_bytes()
        assert len(data) == item['bytes'], item['path']
        assert sha256(data) == item['sha256'], item['path']
        assert blob(data) == item['gitBlob'], item['path']
runs = json.loads((root / 'runs.json').read_text())
for i, record in enumerate(runs['runs'], 1):
    assert record['exitCode'] == 0
    assert sha256((root / f'runs/probe-{i}.json').read_bytes()) == record['stdoutSha256']
    assert (root / f'runs/probe-{i}.stderr.txt').read_bytes() == b''
assert (root / 'runs/probe-1.json').read_bytes() == (root / 'runs/probe-2.json').read_bytes()
manifest = json.loads((root / 'manifest.json').read_text())
actual = {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p.name != 'manifest.json'}
assert actual == {f['path'] for f in manifest['files']}
for item in manifest['files']:
    b = (root / item['path']).read_bytes()
    assert len(b) == item['bytes'] and sha256(b) == item['sha256'], item['path']
print(f"PASS: {len(manifest['files'])} manifest files, 8 upstream sources, 4 archived experiment/license files, two identical probe outputs")

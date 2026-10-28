#!/usr/bin/env python3
"""Verify archived facts and file integrity; this is not reader-benefit testing."""
import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
data = json.loads((root / 'fixtures/input.json').read_text())
expected = [{'job': job['id'], 'owner': data['owners'][job['owner']]} for job in data['jobs']]
for run in ['native-1', 'native-2']:
    directory = root / 'evidence' / run
    commands = json.loads((directory / 'commands.json').read_text())['commands']
    assert len(commands) == 9
    observed = json.loads((directory / 'observed.json').read_text())
    assert [len(observed[c]) for c in ['bind-owners', 'pipe-owners', 'bind-jobs', 'lost-root']] == [6, 2, 5, 5]
    for case in observed:
        plain, marked = [next(c for c in commands if c['name'] == case + '-' + kind) for kind in ['plain', 'marked']]
        assert plain['exit'] == marked['exit'] == (5 if case == 'pipe-owners' else 0)
        assert (directory / (case+'-plain.stdout')).read_bytes() == (directory / (case+'-marked.stdout')).read_bytes()
        stderr = (directory / (case+'-marked.stderr')).read_text().splitlines()
        assert [json.loads(line)[1] for line in stderr if line.startswith('["DEBUG:",')] == observed[case]
        assert '\n'.join(line for line in stderr if not line.startswith('["DEBUG:",')) == (directory / (case+'-plain.stderr')).read_text().rstrip('\n')
    def outputs(case):
        return [json.loads(line) for line in (directory / (case+'-plain.stdout')).read_text().splitlines()]
    assert outputs('bind-owners') == outputs('bind-jobs') == expected
    assert outputs('pipe-owners') == []
    assert outputs('lost-root') == [{'job': j['id'], 'owner': None} for j in data['jobs']]
    assert observed['bind-owners'][1]['current'] == data
    assert observed['bind-owners'][1]['owners'] == data['owners']
    assert observed['pipe-owners'][1]['current'] == data['owners']
    bindings = [e for e in observed['bind-jobs'] if e['stage'] == 'bound-job']
    assert [e['current'] for e in bindings] == [data, data]
    assert [e['job'] for e in bindings] == data['jobs']
    for case in ['bind-owners', 'lost-root']:
        assert [e['current'] for e in observed[case] if e['stage'] == 'job'] == data['jobs']
for source in json.loads((root / 'sources.json').read_text()):
    content = (root / source['path']).read_bytes()
    assert len(content) == source['size']
    assert hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest() == source['sha']
    assert hashlib.sha256(content).hexdigest() == source['sha256']
receipt = json.loads((root / 'explanation.finalize-summary.json').read_text())
assert receipt['ok'] and receipt['gates'] == {'validate':'pass','deliver':'pass','check':'pass','browser-check':'not-run'}
assert hashlib.sha256((root / 'explanation.html').read_bytes()).hexdigest() == receipt['artifact']['sha256']
manifest = root / 'manifest.json'
if manifest.exists():
    entries = json.loads(manifest.read_text())
    actual = {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p != manifest}
    assert actual == set(entries)
    for path, digest in entries.items():
        assert hashlib.sha256((root / path).read_bytes()).hexdigest() == digest, path
print(json.dumps({'native_commands':18,'observations_per_run':18,'source_files':9,'artifact_receipt':'pass','browser_gate':'not-run','manifest_files':len(entries) if manifest.exists() else None}))

#!/usr/bin/env python3
"""Check the archived observations, not general SQL semantics or reader benefit."""
from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parent
runs = [root / ('native-'+str(n)) for n in [1, 2]]
commands = [json.loads((r/'commands.json').read_text()) for r in runs]
assert commands[0]['database_sha256'] == commands[1]['database_sha256']
assert commands[0]['binary_sha256'] == commands[1]['binary_sha256']
for run, record in zip(runs, commands):
    assert len(record['commands']) == 11
    assert all(c['exit'] == 0 for c in record['commands'])
    assert json.loads((run/'supplemental-initial-page.command.json').read_text())['exit'] == 0
    obs = json.loads((run/'observations.json').read_text())
    assert [(obs[k]['result_rows'],obs[k]['orders_index_loops'],obs[k]['orders_index_rows']) for k in ['limit-0','limit-10','all','sorted-10']] == [(0,0,0),(10,10,104),(2000,2000,20000),(10,2000,20000)]
    assert [x['detail'] for x in obs['limit-0']['eqp']] == [x['detail'] for x in obs['limit-10']['eqp']] == [x['detail'] for x in obs['all']['eqp']]
    for case in obs:
        raw = (run/(case+'-profile.stdout')).read_text()
        values, metrics = raw.split('QUERY PLAN\n',1)
        assert len(values.splitlines()) == obs[case]['result_rows']
        assert metrics == obs[case]['raw_profile']
        assert f"loops={obs[case]['orders_index_loops']} rows={obs[case]['orders_index_rows']}" in next(s for s in metrics.splitlines() if 'SEARCH orders' in s)
    assert 'loops=1 rows=39' in (run/'supplemental-initial-page.stdout').read_text()
streams = sorted(p.name for p in runs[0].iterdir() if p.suffix in ['.stdout','.stderr'])
assert len(streams) == 24
assert all((runs[0]/p).read_bytes() == (runs[1]/p).read_bytes() for p in streams)
for entry in json.loads((root/'source-manifest.json').read_text()):
    data = (root/entry['path']).read_bytes()
    assert len(data) == entry['size']
    assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest() == entry['git_blob']
    assert hashlib.sha256(data).hexdigest() == entry['sha256']
browser = json.loads((root/'browser-observations.json').read_text())
assert browser['version']['rows'][1][0] == '3.39.0'
assert browser['scanstatus'] == [['scanstatus'],['0']]
assert len(browser['all']['rows']) == 201  # includes header; 200 shown values
assert browser['correlated']['rows'][1:] == [row.split('|') for row in (runs[0]/'limit-10-profile.stdout').read_text().split('QUERY PLAN')[0].splitlines()]
assert browser['all']['rows'][1:] == [row.split('|') for row in (runs[0]/'all-profile.stdout').read_text().split('QUERY PLAN')[0].splitlines()[:200]]
manifest = root/'manifest.json'
if manifest.exists():
    entries = json.loads(manifest.read_text())
    assert set(entries) == {str(p.relative_to(root)) for p in root.rglob('*') if p.is_file() and p != manifest}
    for path, digest in entries.items():
        assert hashlib.sha256((root/path).read_bytes()).hexdigest() == digest, path
print(json.dumps({'archived_commands':24,'paired_identical_output_streams':24,'source_files':2,'browser_images':7,'manifest_files':len(entries) if manifest.exists() else None}))

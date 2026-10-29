#!/usr/bin/env python3
"""Verify the frozen browser experiment, not general property-test behavior."""
from pathlib import Path
import hashlib,json,re,struct
root=Path(__file__).resolve().parent
def load(path):return json.loads((root/path).read_text())
results=load('results.json')
runs=[load('browser/run'+str(i)+'.json') for i in (1,2,3)]
assert runs[1]['results']==runs[2]['results']
assert json.loads(runs[1]['results'])==results
assert results['library']['version']=='4.10.2'
assert results['library']['commitHash']=='c77afa8277a67250d798c52e61343b8ed5fd268b'
def flatten(nodes):
    return [value for node in nodes for value in [(node['status'],node['value'][0]),*flatten(node['children'])]]
expected=[(1,20),(-1,0),(1,10),(1,5),(0,3),(0,4)]
for index,case in enumerate(results['cases']):
    details=case['details'];stop=case['name']=='global-stop'
    assert details['failed'] and not details['interrupted']
    assert details['numRuns']==1 and details['numSkips']==0
    assert details['numShrinks']==(0 if stop else 2)
    assert details['counterexample']==([20] if stop else [5])
    assert details['counterexamplePath']==('0' if stop else '0:1:0')
    assert details['runConfiguration']['endOnFailure']==stop
    assert details['runConfiguration']['path']==''
    assert flatten(details['executionSummary'])==([(1,20)] if stop else expected)
    assert 'endOnFailure: true' in case['report']
    assert (root/'reports'/(case['name']+'.txt')).read_text()==case['report']
    assert json.loads(runs[0]['results'])['cases'][index]['report']==case['report']
    plain=re.sub(r'\x1b\[(?:0|31|32|33)m','',case['report'])
    assert runs[1]['displayed'][index]['text']==plain
assert results['cases'][1]['global']==results['cases'][2]['global']=={'endOnFailure':True}
assert results['cases'][2]['local']['endOnFailure'] is False
for record in load('source-blobs.json'):
    data=(root/'source'/record['local']).read_bytes()
    assert len(data)==record['bytes']
    assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()==record['blob']
for run in runs[1:]:
    assert len(run['resources'])==3
    assert all(url.startswith('http://127.0.0.1:8879/') for url in run['resources'])
pngs=sorted((root/'browser').glob('*.png'))
assert len(pngs)==2
for path in pngs:
    data=path.read_bytes();assert data[:8]==b'\x89PNG\r\n\x1a\n'
    assert struct.unpack('>II',data[16:24])==(1279,784)
links=0
for target in re.findall(r'\]\(([^)]+)\)',(root/'README.md').read_text()):
    if not target.startswith(('http:','https:')):
        assert (root/target.split('#')[0]).exists(),target
        links+=1
print(json.dumps({'status':'pass','cases':3,'default_attempts':len(expected),'shrink_counts':[2,0,2],
                  'fresh_load_repeat_exact':True,'native_reports_preserved':3,'source_blobs':8,
                  'images':2,'local_links':links,'seed_path_hint_replay_executed':False},indent=2))

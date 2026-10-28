"""Check this archived three-case observation; not a general trace parser."""
import hashlib, json
from pathlib import Path
root=Path(__file__).resolve().parent
cases={'missing-esm-types':(2,0),'matched-esm-types':(0,0),'missing-runtime-target':(0,1)}
for n in (1,2):
    run=root/f'run-{n}'; d=json.loads((run/'commands.json').read_text()); assert len(d['commands'])==8
    assert (run/'node-version.stdout.txt').read_text().strip()=='v22.23.3'
    assert (run/'tsc-version.stdout.txt').read_text().strip()=='Version 5.8.3'
    for name,pair in cases.items():
        result=d['results'][name]; assert (result['tscExit'],result['nodeExit'])==pair
        trace=(run/f'{name}-tsc.stdout.txt').read_text()
        assert ("Resolved under condition 'default'" if name=='missing-esm-types' else "Resolved under condition 'import'") in trace
        if name!='missing-runtime-target':
            observed=json.loads((run/f'{name}-node.stdout.txt').read_text());assert observed['selected']=='esm' and observed['resolved'].endswith('/index.mjs')
        else: assert 'ERR_MODULE_NOT_FOUND' in (run/f'{name}-node.stderr.txt').read_text()
    assert 'error TS2322' in (run/'missing-esm-types-tsc.stdout.txt').read_text()
streams=sorted((root/'run-1').glob('*.txt'));assert len(streams)==16
for p in streams:
    a=p.read_bytes().replace(b'/private/tmp/archify-round37-native-1',b'<RUN>')
    b=(root/'run-2'/p.name).read_bytes().replace(b'/private/tmp/archify-round37-native-2',b'<RUN>');assert a==b,p.name
for name in cases: assert (root/f'run-1/{name}.tgz').read_bytes()==(root/f'run-2/{name}.tgz').read_bytes()
sources=json.loads((root/'sources/manifest.json').read_text())
for s in sources:
    b=(root/'sources'/s['project']/s['path']).read_bytes();assert len(b)==s['bytes'];assert hashlib.sha256(b).hexdigest()==s['sha256'];assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==s['gitBlob']
print(json.dumps({'commands':16,'normalizedStreamPairs':len(streams),'identicalTarballPairs':3,'sourceFiles':len(sources)}))

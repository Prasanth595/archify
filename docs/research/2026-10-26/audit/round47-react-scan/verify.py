#!/usr/bin/env python3
"""Integrity and archived-observation checks; no browser or React execution."""
from pathlib import Path
import hashlib,json,struct,subprocess,sys
r=Path(__file__).resolve().parent
paths=sorted(p for p in r.rglob('*') if p.is_file() and p!=r/'manifest.json')
current={str(p.relative_to(r)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths}
if sys.argv[1:]==['--write-manifest']:
    (r/'manifest.json').write_text(json.dumps(current,indent=2)+'\n')
else:
    assert not sys.argv[1:]
    assert current==json.loads((r/'manifest.json').read_text()),'packet inventory/hash mismatch'
sources=json.loads((r/'sources.json').read_text())['files']
for f in sources:
    b=(r/f['path']).read_bytes()
    assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256']
    assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==f['gitBlob']
audit=json.loads((r/'image-audit.json').read_text())
assert {x['path'] for x in audit}=={str(p.relative_to(r)) for p in (r/'images').glob('*.png')}
for item in audit:
    b=(r/item['path']).read_bytes()
    assert b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(1440,900)
    assert item['visuallyReviewed']
assert subprocess.check_output([sys.executable,str(r/'summarise.py')])==(r/'observations.json').read_bytes()
print(json.dumps({'manifestFiles':len(current),'verifiedSources':len(sources),'images':len(audit),'acceptedImages':sum(x['role']=='accepted' for x in audit),'summaryMatches':True}))

"""Check committed evidence, plus optional local-only captures."""
from pathlib import Path
import hashlib,json,struct,subprocess,sys
r=Path(__file__).resolve().parent
args=set(sys.argv[1:]);assert args <= {'--write-manifest','--local'}
files=sorted(p for p in r.rglob('*') if p.is_file() and p!=r/'manifest.json')
current={str(p.relative_to(r)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files}
if '--write-manifest' in args:
 (r/'manifest.json').write_text(json.dumps(current,indent=2)+'\n')
else:
 assert current==json.loads((r/'manifest.json').read_text()),'packet hash mismatch'
sources=json.loads((r/'sources.json').read_text())['files']
for f in sources:
 b=(r/'sources'/f['path']).read_bytes()
 assert len(b)==f['size'] and hashlib.sha256(b).hexdigest()==f['sha256']
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==f['sha']
assert subprocess.check_output([sys.executable,str(r/'summarise.py')])==(r/'observations.json').read_bytes()
localCount=0
if '--local' in args:
 evidence=json.loads((r/'local-evidence-manifest.json').read_text()); local=Path(evidence['root'])
 for f in evidence['files']:
  b=(local/f['path']).read_bytes()
  assert len(b)==f['bytes'] and hashlib.sha256(b).hexdigest()==f['sha256'],f['path']
  if f['path'].endswith('.png'):
   assert f['visuallyReviewed'] and b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(1440,900)
  localCount+=1
print(json.dumps({'trackedPacketFiles':len(current),'sourceBlobs':len(sources),'summaryMatches':True,'verifiedLocalFiles':localCount}))

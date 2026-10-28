import pathlib,json,hashlib,struct
r=pathlib.Path(__file__).resolve().parent
def read(n):return json.loads((r/n).read_text())
for entry in read('sources.json'):
 b=(r/entry['file']).read_bytes()
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==entry['blob'],entry['file']
original=(r/'original.cast').read_bytes()
assert original==(r/'sources/tests__assets__long.cast').read_bytes()
orig=[json.loads(x) for x in original.splitlines()]
embedded=[json.loads(x) for x in (r/'embedded.cast').read_text().splitlines()]
assert orig[0]==embedded[0] and orig[0]==dict(version=2,width=80,height=24)
assert [e for e in embedded[1:] if e[1]=='o']==orig[1:]
assert [e for e in embedded[1:] if e[1]=='m']==[[6.0,'m','source t=6 s'],[12.0,'m','source t=12 s']]
assert len(embedded)==len(orig)+2
assert all(e[1]=='o' for e in orig[1:])
expected={
 'original-external':(['start','one','six'],'00:06','-00:06','00:06 - source t=6 s','50%'),
 'compressed-external':(['start','one','six','twelve'],'00:06','-00:06','00:06 - source t=6 s','50%'),
 'compressed-embedded':(['start','one','six'],'00:02','-00:01','00:02 - source t=6 s','66.6667%')}
cases={c['id']:c for c in read('cases.json')}
summary=[]
for variant,(rows,elapsed,remaining,label,left) in expected.items():
 state=read('browser/'+variant+'-state.json')
 assert state['viewport']==dict(width=1291,height=762)
 assert state['elapsed']==elapsed and state['remaining']==remaining
 assert state['markers']==[dict(text=label,left=left)]
 assert json.loads(state['options'])==cases[variant]['options']
 assert state['buttons'][0]=='Play'
 # The terminal has 24 rows. Read the public player DOM text layer, excluding controls.
 raw=state['playerText'].splitlines()
 assert len(raw)>=24
 actual=[line.rstrip() for line in raw[:24] if line.strip()]
 assert actual==rows,(variant,actual)
 previous=read('first-layout/'+variant+'-state.json')
 assert previous['playerText']==state['playerText']
 summary.append(dict(variant=variant,terminalRows=rows,elapsed=elapsed,remainingDomField=remaining,visibleMarker=label))
pngs=list(r.rglob('*.png'))
for p in pngs:
 b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n'
 assert struct.unpack('>II',b[16:24])==(1291,762),p
for a in read('runtime.json')['assets']:
 p=pathlib.Path(a['path'])
 if p.exists():assert p.stat().st_size==a['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256']
if (r/'manifest.json').exists():
 for entry in read('manifest.json'):
  b=(r/entry['file']).read_bytes();assert len(b)==entry['bytes'] and hashlib.sha256(b).hexdigest()==entry['sha256'],entry['file']
print(json.dumps(dict(sourceBlobs=len(read('sources.json')),inputBytes=len(original),originalEvents=len(orig)-1,derivedMarkers=2,pngs=len(pngs),observations=summary,scope='Offline archived-source/input/DOM/image/manifest verification, not a fresh browser run or upstream/product suite.'),indent=2))

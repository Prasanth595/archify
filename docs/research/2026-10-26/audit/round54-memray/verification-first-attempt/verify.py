import pathlib,json,hashlib,struct,re,math
r=pathlib.Path(__file__).resolve().parent
def read(n):return json.loads((r/n).read_text())
for e in read('sources.json'):
 b=(r/e['file']).read_bytes();assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==e['blob']
asset=read('report-asset.json');path=pathlib.Path(asset['path'])
assetChecked=False
if path.exists():
 b=path.read_bytes();assert len(b)==asset['bytes'] and hashlib.sha256(b).hexdigest()==asset['sha256']
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==asset['gitBlob']
 for e in read('report-excerpts.json')['excerpts']:assert b[e['byteOffset']:e['byteOffset']+e['bytes']].decode()==e['text']
 assetChecked=True
stats=read('browser/04-stats-state.json')['dialogs'][0]['text']
for phrase in ['Total number of allocations: 3602050','Total number of frames seen: 404','Peak memory usage: 71.7 MiB','Python allocator: pymalloc']:assert phrase in stats
helptext=read('browser/05-help-state.json')['text']
assert 'when the memory usage was at its peak' in helptext
states=[read('browser/'+v+'-state.json') for v in ['default','unfiltered','inverted']]
for s in states:
 assert s['viewport']==dict(width=1291,height=762) and s['settled']['stable']
 tips=[t for t in s['tooltips'] if t['opacity']=='1' and t['className'].startswith('d3-flame-graph-tip')]
 assert len(tips)==1 and tips[0]['text']=='File memray, line 0 in <tracker>\n71.7 MiB total\n1705027 allocations'
 assert len(s['frames'])==121
assert states[0]['inputs'][0]['checked'] is True
assert states[1]['inputs'][0]['checked'] is False
assert states[2]['inputs'][0]['checked'] is False
assert states[0]['frames']==states[1]['frames']
def xy(t):return tuple(map(float,re.fullmatch(r'translate\(([^,]+),\s*([^\)]+)\)',t).groups()))
for old,new in zip(states[1]['frames'],states[2]['frames']):
 assert (old['name'],old['width'],old['label'])==(new['name'],new['width'],new['label'])
 x,y=xy(old['transform']);xx,yy=xy(new['transform'])
 assert abs(x-xx)<1e-6 and abs(y+yy-680)<1e-6
pngs=list(r.rglob('*.png'))
for p in pngs:
 b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n'
 assert struct.unpack('>II',b[16:24])==(1291,762),p
if (r/'manifest.json').exists():
 for e in read('manifest.json'):
  b=(r/e['file']).read_bytes();assert len(b)==e['bytes'] and hashlib.sha256(b).hexdigest()==e['sha256'],e['file']
print(json.dumps(dict(sourceBlobs=len(read('sources.json')),cachedReportChecked=assetChecked,pngs=len(pngs),graphFrames=121,statsAllocationCount=3602050,rootReportedAllocations=1705027,rootReportedSize='71.7 MiB (rounded)',uncheckedFrames='unchanged in this report',invertGeometry='x and width retained; y reflected around 340',scope='Offline archived evidence, not profiler execution, raw-capture validation, dependency-content pinning or a fresh browser run'),indent=2))

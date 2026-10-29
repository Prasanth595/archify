import hashlib,json,pathlib,re,struct
r=pathlib.Path(__file__).resolve().parent
def j(n):return json.loads((r/n).read_text())
for e in j('sources.json'):
 b=(r/'upstream'/e['path']).read_bytes()
 assert len(b)==e['bytes'] and hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==e['gitBlob']
readme=(r/'upstream/README.md').read_text()
assert (r.parent/'upstream/README.md').read_bytes()==(r/'upstream/README.md').read_bytes()
blocks=re.findall(r'```go\n(.*?)```',readme,re.S)
model=next(b for b in blocks if b.startswith('type registerInput'))
typeblock,modelblock=model.split('// a sequential specification of a register',1)
events=next(b for b in blocks if b.startswith('events :=') and 'false, 200' in b).split('\nok :=',1)[0]
main=(r/'main.go').read_text()
assert typeblock in main and modelblock in main and events in main
a,b=j('results.json')['cases']
assert a['case']=='original' and a['CheckEvents'] is False and a['CheckEventsVerbose']=='Illegal'
assert a['partialLinearizations']==[[[0,1]]]
assert b['case']=='read-200-control' and b['CheckEvents'] is True and b['CheckEventsVerbose']=='Ok'
assert b['partialLinearizations']==[[[0,1,2]]]
expected=[dict(ordinal=i+1,index=i,kind=k,id=oid,clientId=oid,value=val) for i,(k,oid,val) in enumerate([
 ('call',0,dict(op=False,value=200)),('call',1,dict(op=True,value=0)),('return',1,200),
 ('call',2,dict(op=True,value=0)),('return',2,0),('return',0,0)])]
assert a['events']==expected
expected[4]['value']=200;assert b['events']==expected
for case in [a,b]:
 p=r/'generated'/(case['case']+'.html');data=json.loads(re.search(r'      const data = (.+)\n',p.read_text()).group(1))
 assert len(data['Partitions'])==1 and data['Annotations']==[]
 part=data['Partitions'][0];assert len(part['History'])==3
 assert [[x['Index'] for x in seq] for seq in part['PartialLinearizations']]==case['partialLinearizations'][0]
 assert all(x['StateDescription']=='register = 200' for seq in part['PartialLinearizations'] for x in seq)
 for h,(start,end) in zip(part['History'],[(0,5),(1,2),(3,4)]):
  assert (h['OriginalStart'],h['OriginalEnd'])==(str(start),str(end))
  assert (h['Start'],h['End'])==(start*100,end*100)
 for e in part['History']:assert e['Description']
o=j('browser/original-invalid-state.json');c=j('browser/control-valid-state.json')
assert 'register = 200' in o['text'] and '⟨invalid op⟩' in o['text']
assert '⟨invalid op⟩' not in c['text'] and c['text'].count('register = 200')==2
for s in [o,c]:
 assert 'Call: 3' in s['text'] and 'Return: 4' in s['text']
 assert s['viewport']==dict(width=1291,height=762) and s['resources']==[]
assert len(j('browser/original-selected-state.json')['selected'])==1
for e in j('existing-artifacts.json'):
 p=r.parent/e['file'];b=p.read_bytes();assert len(b)==e['bytes'] and hashlib.sha256(b).hexdigest()==e['sha256']
replay=j('replay-check.json');assert replay['exitCode']==0 and replay['identical'] and replay['before']==replay['after']
for n,h in replay['after'].items():assert hashlib.sha256((r/n).read_bytes()).hexdigest()==h
pngs=list((r/'browser').glob('*.png'))
for p in pngs:
 b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n' and struct.unpack('>II',b[16:24])==(1291,762)
if (r/'manifest.json').exists():
 for e in j('manifest.json'):
  b=(r/e['file']).read_bytes();assert len(b)==e['bytes'] and hashlib.sha256(b).hexdigest()==e['sha256'],e['file']
print(json.dumps(dict(sourceBlobs=len(j('sources.json')),nativeCases=2,pngs=len(pngs),priorArtifactsUnchanged=5,warmReplayByteIdentical=True,scope='Archived evidence verification; native Go execution is recorded separately in run.log/replay.log. No product or upstream suite, reader study, live distributed system or timeout behavior tested.'),indent=2))

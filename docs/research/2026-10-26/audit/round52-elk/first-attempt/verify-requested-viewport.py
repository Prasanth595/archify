import pathlib,json,hashlib,struct,re,math
r=pathlib.Path(__file__).resolve().parent
def read(name):return json.loads((r/name).read_text())
for record in read('sources.json'):
 b=(r/record['file']).read_bytes()
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==record['blob'],record['file']
def walk(n,px=0,py=0):
 x,y=px+n.get('x',0),py+n.get('y',0);items=[(n,x,y)]
 for c in n.get('children',[]):items+=walk(c,x,y)
 return items
def semantics(g):
 items=walk(g)
 return dict(nodes=sorted((n['id'],tuple(c['id'] for c in n.get('children',[]))) for n,x,y in items),
 ports=sorted((n['id'],p['id']) for n,x,y in items for p in n.get('ports',[])),
 edges=sorted((e['id'],tuple(e['sources']),tuple(e['targets'])) for n,x,y in items for e in n.get('edges',[])))
base=read('input-original.json')
assert len(walk(base))-1==7
assert len(semantics(base)['ports'])==2 and len(semantics(base)['edges'])==6
for variant in ['original','fixed-side','separate-children']:
 inp=read('input-'+variant+'.json');out=read('output-'+variant+'.json')
 assert semantics(inp)==semantics(base)==semantics(out)
 nodes=walk(out);pos={n['id']:(x,y) for n,x,y in nodes};bounds={n['id']:(x,y,n['width'],n['height']) for n,x,y in nodes}
 for n,x,y in nodes:
  for p in n.get('ports',[]):bounds[p['id']]=(x+p['x'],y+p['y'],p['width'],p['height'])
 edges=[(n,e) for n,x,y in nodes for e in n.get('edges',[])]
 missing=[e['id'] for n,e in edges if not e.get('sections')]
 assert missing==(['e2'] if variant=='separate-children' else [])
 expected=[]
 for n,e in edges:
  ox,oy=pos[e.get('container',n['id'])]
  for section in e.get('sections',[]):
   assert section['incomingShape']==e['sources'][0] and section['outgoingShape']==e['targets'][0]
   for key,shape in [('startPoint',e['sources'][0]),('endPoint',e['targets'][0])]:
    p=section[key];x,y=ox+p['x'],oy+p['y'];a,b,w,h=bounds[shape];eps=1e-6
    assert a-eps<=x<=a+w+eps and b-eps<=y<=b+h+eps,(variant,e['id'],key)
    assert min(abs(x-a),abs(x-a-w),abs(y-b),abs(y-b-h))<eps
   points=[section['startPoint']]+section.get('bendPoints',[])+[section['endPoint']]
   expected.append((e['id'],[(ox+p['x'],oy+p['y']) for p in points]))
 state=read('browser/'+variant+'-state.json')
 assert state['viewport']==dict(width=1440,height=900)
 actual=[(e['id'],[tuple(map(float,p.split(','))) for p in e['points'].split()]) for e in state['renderedEdges']]
 assert actual==expected,(variant,'browser path differs from ELK output')
 assert len(actual)==(5 if missing else 6)
fixed=read('output-fixed-side.json')['children'][2]
p1,p2=fixed['ports']
assert p1['id']=='p1' and p1['x']==-p1['width']
assert p2['id']=='p2' and p2['y']==-p2['height']
assert read('first-attempt/output-original.json')==read('output-original.json')
pngs=list(r.rglob('*.png'))
for p in pngs:
 b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n'
 assert struct.unpack('>II',b[16:24])==(1440,900),p
if (r/'manifest.json').exists():
 for record in read('manifest.json'):
  b=(r/record['file']).read_bytes()
  assert len(b)==record['bytes'] and hashlib.sha256(b).hexdigest()==record['sha256'],record['file']
print(json.dumps(dict(sourceBlobs=len(read('sources.json')),variants=3,nodes=7,ports=2,edges=6,routedEdges=[6,6,5],pngs=len(pngs),browserCoordinates='match saved ELK output',scope='Offline archived-evidence integrity and semantic/path coverage; no upstream suite, Archify acceptance, or browser rerun'),indent=2))

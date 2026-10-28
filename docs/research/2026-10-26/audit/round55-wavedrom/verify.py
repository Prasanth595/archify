import ast,copy,hashlib,json,os,pathlib,re,struct,urllib.parse,xml.etree.ElementTree as ET
r=pathlib.Path(__file__).resolve().parent
def j(p):return json.loads((r/p).read_text())
def blob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
for e in j('sources.json'):
 b=(r/e['file']).read_bytes();assert len(b)==e['bytes'] and blob(b)==e['gitBlob']
cache=pathlib.Path(os.environ.get('WAVEDROM_RESEARCH_CACHE',str(pathlib.Path.home()/'.cache/archify-research/wavedrom-375378e')))
checked=0
if cache.exists():
 for e in j('native-assets.json'):
  b=(cache/e['path']).read_bytes();assert len(b)==e['bytes'] and blob(b)==e['gitBlob'];checked+=1
raw=(r/'cases/original.json5').read_text()
section=(r/'sources/tutorial.html').read_text().split('<h3>Sharp lines</h3>',1)[1]
assert raw==re.search(r'<script type="WaveDrom">(.*?)</script>',section,re.S).group(1)
base=ast.literal_eval(re.sub(r'\b([A-Za-z_]\w*)\s*:',r'"\1":',raw))
assert j('cases/baseline.json')==base
p=copy.deepcopy(base)
for lane in p['signal']:
 if 'phase' in lane:lane['phase']=0
assert j('cases/phase-zero.json')==p
p=copy.deepcopy(base);p['config']={'hscale':2};assert j('cases/scale-two.json')==p
rows=[]
for name in ['baseline','phase-zero','scale-two']:
 s=j('browser/'+name+'-state.json')
 assert json.loads(s['input'])==j('cases/'+name+'.json')
 assert urllib.parse.unquote(urllib.parse.urlsplit(s['url']).query)==s['input']
 assert s['version']=='v3.7.0'
 assert s['viewport']=={'width':1291,'height':762}
 paths={p['id']:p for p in s['paths'] if p['d'] is not None}
 assert len(paths)==10
 dom=ET.fromstring((r/'browser'/f'{name}-dom.svg').read_text())
 exported=ET.parse(r/'exports'/f'{name}.svg')
 for tree in [dom,exported.getroot()]:
  actual={e.attrib['id']:e.attrib['d'] for e in tree.iter() if e.tag.endswith('path') and e.attrib.get('id','').startswith('gmark_')}
  assert actual=={k:v['d'] for k,v in paths.items()}
 texts=[t['text'] for t in s['texts']]
 assert '3 ms' in texts and '5 ms' in texts
 g=paths['gmark_g_h']['bounds'];i=paths['gmark_I_J']['bounds']
 expected={'baseline':(120,20),'phase-zero':(120,0),'scale-two':(240,20)}[name]
 assert g['width']==i['width']==expected[0] and g['x']-i['x']==expected[1]
 rows.append(dict(case=name,spanSvgUnits=g['width'],phaseOffsetSvgUnits=g['x']-i['x']))
pngs=list(r.rglob('*.png'))
for p in pngs:
 b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n';size=struct.unpack('>II',b[16:24])
 if p.parent.name=='exports':assert size==((620,180) if p.stem=='scale-two' else (340,180))
 else:assert size==(1291,762)
if (r/'manifest.json').exists():
 for e in j('manifest.json'):
  b=(r/e['file']).read_bytes();assert len(b)==e['bytes'] and hashlib.sha256(b).hexdigest()==e['sha256'],e['file']
print(json.dumps(dict(sourceBlobs=len(j('sources.json')),cachedNativeAssetsChecked=checked,pngs=len(pngs),nativeSvgExports=3,rows=rows,scope='Archived fixture evidence only; not a fresh browser replay, hardware capture, physical-unit validation or Archify product test.'),indent=2))

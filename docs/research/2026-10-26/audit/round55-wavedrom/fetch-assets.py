import pathlib,json,urllib.request,hashlib,os
r=pathlib.Path(__file__).resolve().parent
cache=pathlib.Path(os.environ.get('WAVEDROM_RESEARCH_CACHE',str(pathlib.Path.home()/'.cache/archify-research/wavedrom-375378e')))
for e in json.loads((r/'native-assets.json').read_text()):
 p=cache/e['path'];p.parent.mkdir(parents=True,exist_ok=True)
 b=urllib.request.urlopen(e['url'],timeout=30).read()
 assert len(b)==e['bytes'] and hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==e['gitBlob']
 p.write_bytes(b)
print(json.dumps(dict(cache=str(cache),assets=len(json.loads((r/'native-assets.json').read_text())))))

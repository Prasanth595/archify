import pathlib,json,urllib.request,hashlib
r=pathlib.Path(__file__).resolve().parent
for e in json.loads((r/'sources.json').read_text()):
 p=r/'upstream'/e['path'];p.parent.mkdir(parents=True,exist_ok=True)
 b=urllib.request.urlopen(e['url'],timeout=30).read()
 assert len(b)==e['bytes'] and hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==e['gitBlob']
 p.write_bytes(b)
print('Verified',len(json.loads((r/'sources.json').read_text())),'fixed source files')

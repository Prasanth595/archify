import pathlib,urllib.request,hashlib,json,os
r=pathlib.Path(__file__).resolve().parent
cache=pathlib.Path(os.environ.get('ASCIINEMA_ASSET_CACHE',str(pathlib.Path.home()/'.cache/archify-research/asciinema-player-3.17.0')))
cache.mkdir(parents=True,exist_ok=True)
assets=[]
for name,sha,size in [('asciinema-player.min.js','a13c37632e1b5c49fe9128417b9319a9b5bc64cb457dd5ae52cbba8a3aceb880',185010),('asciinema-player.css','f619fe17597043564f03b2c6918b3daf890ee8b912fb408542fba11afade4fdb',19184)]:
 url='https://github.com/asciinema/asciinema-player/releases/download/v3.17.0/'+name
 with urllib.request.urlopen(url,timeout=30) as response:data=response.read()
 assert len(data)==size and hashlib.sha256(data).hexdigest()==sha
 (cache/name).write_bytes(data)
 assets.append(dict(name=name,url=url,path=str(cache/name),sha256=sha,bytes=size))
(r/'runtime.json').write_text(json.dumps(dict(tag='v3.17.0',commit='8ba9c54008ed1f25d2914abe31ea118dbf7da2e4',assets=assets,scope='Downloaded two release files; matched GitHub release asset digests, no install or build.'),indent=2)+'\n')
print(json.dumps(assets,indent=2))

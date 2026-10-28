import pathlib,urllib.request,hashlib,json,os
r=pathlib.Path(__file__).resolve().parent
cache=pathlib.Path(os.environ.get('MEMRAY_REPORT_CACHE',str(pathlib.Path.home()/'.cache/archify-research/memray-f70db814')))
cache.mkdir(parents=True,exist_ok=True)
url='https://raw.githubusercontent.com/bloomberg/memray/f70db8143c7601ca55b4b219e50577a3f06e38ea/docs/_static/flamegraphs/memray-flamegraph-sqlite.html'
with urllib.request.urlopen(url,timeout=30) as response:data=response.read()
assert len(data)==1354914
assert hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()=='1fd2cf0171647ebd40461962d2efd066becfb615'
path=cache/'report.html';path.write_bytes(data)
(r/'report-asset.json').write_text(json.dumps(dict(url=url,path=str(path),bytes=len(data),gitBlob='1fd2cf0171647ebd40461962d2efd066becfb615',sha256=hashlib.sha256(data).hexdigest(),scope='Exact upstream pre-generated HTML; no raw capture, profiler execution or source build.'),indent=2)+'\n')
print('Saved verified upstream report',len(data),'bytes',hashlib.sha256(data).hexdigest())

import pathlib,json,urllib.request,hashlib,base64,tarfile,io,os
root=pathlib.Path(__file__).resolve().parent
cache=pathlib.Path(os.environ.get('ELK_CACHE',str(pathlib.Path.home()/'.cache/archify-research/elkjs-0.12.1')))
cache.mkdir(parents=True,exist_ok=True)
with urllib.request.urlopen('https://registry.npmjs.org/elkjs/0.12.1',timeout=30) as r:meta=json.load(r)
assert meta['gitHead']=='624ae90aa37110033a8af59c5ccbb292708b4317'
(root/'npm-release.json').write_text(json.dumps(meta,indent=2)+'\n')
with urllib.request.urlopen(meta['dist']['tarball'],timeout=30) as r:data=r.read()
assert 'sha512-'+base64.b64encode(hashlib.sha512(data).digest()).decode()==meta['dist']['integrity']
assert hashlib.sha1(data).hexdigest()==meta['dist']['shasum']
assert hashlib.sha256(data).hexdigest()=='7a017dd56e31e4963ad5c4b9deb3230db5c37edf53a82dc507a8599f2f01122f'
(cache/'elkjs-0.12.1.tgz').write_bytes(data)
records=[]
with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as tf:
 for name in ['package/lib/elk.bundled.js','package/LICENSE.md','package/package.json']:
  member=tf.getmember(name)
  assert member.isfile()
  content=tf.extractfile(member).read()
  target=cache/pathlib.PurePosixPath(name).name
  target.write_bytes(content)
  records.append(dict(member=name,path=str(target),bytes=len(content),sha256=hashlib.sha256(content).hexdigest()))
out=dict(version=meta['version'],gitHead=meta['gitHead'],tarball=meta['dist']['tarball'],tarballSha256=hashlib.sha256(data).hexdigest(),integrity=meta['dist']['integrity'],files=records,scope='Downloaded and extracted three allowlisted files; no package install, lifecycle scripts, source build, dependency resolver, or system configuration. npm SHA512/SHA1 checked; npm signatures/attestations not independently verified.')
(root/'runtime.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out,indent=2))

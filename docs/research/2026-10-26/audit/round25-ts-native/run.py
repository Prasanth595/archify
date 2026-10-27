import datetime, hashlib, json, os, subprocess, time
from pathlib import Path
root=Path('/tmp/archify-round25-ts-native')
node=Path('/opt/homebrew/opt/node@22/bin/node').resolve(strict=True)
tsc=Path('/usr/local/bin/tsc').resolve(strict=True)
package=tsc.parent.parent/'package.json'
def hashfile(p):
 b=p.read_bytes(); return {'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def command(name,argv):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat(); tick=time.monotonic()
 p=subprocess.run([str(x) for x in argv],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 end=datetime.datetime.now(datetime.timezone.utc).isoformat(); elapsed=time.monotonic()-tick
 (root/(name+'.stdout')).write_bytes(p.stdout);(root/(name+'.stderr')).write_bytes(p.stderr)
 return {'argv':[str(x) for x in argv],'cwd':str(root),'started_utc':start,'ended_utc':end,'duration_seconds':elapsed,'exit':p.returncode}
before={str(p.relative_to(root)):hashfile(p) for p in root.rglob('*') if p.is_file()}
versions=[command('node-version',[node,'--version']),command('tsc-version',[node,tsc,'--version'])]
run=command('tsc-run',[node,tsc,'--strict','--noEmit','--pretty','true','--noErrorTruncation','upstream/fixture.ts'])
after={str(p.relative_to(root)):hashfile(p) for p in root.rglob('*') if p.is_file()}
summary={'node':hashfile(node),'tsc':hashfile(tsc),'typescript_package':hashfile(package),'typescript_version':json.loads(package.read_text())['version'],'before':before,'after':after,'versions':versions,'run':run,'emitted_javascript':[str(p.relative_to(root)) for p in root.rglob('*.js')]}
(root/'observation.json').write_text(json.dumps(summary,indent=2)+'\n')

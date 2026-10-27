#!/usr/bin/env python3
import hashlib, json, os, pathlib, subprocess, sys, tempfile
if len(sys.argv) != 2:
    raise SystemExit('usage: python3 probe.py /absolute/path/to/ninja')
binary = str(pathlib.Path(sys.argv[1]).resolve(strict=True))
root = pathlib.Path(tempfile.mkdtemp(prefix='archify-ninja-run.'))
repo = root / 'fixture'
repo.mkdir()
print('report directory:', root, flush=True)
env = {'PATH': '/usr/bin:/bin', 'LC_ALL': 'C'}
binary_sha = hashlib.sha256(pathlib.Path(binary).read_bytes()).hexdigest()
version = subprocess.run([binary, '--version'], env=env, capture_output=True)
(root/'binary-version.stdout').write_bytes(version.stdout)
(root/'binary-version.stderr').write_bytes(version.stderr)
(root/'binary-version.exit').write_text(str(version.returncode)+'\n')
(root/'run-metadata.json').write_text(json.dumps({'binary_path':binary, 'binary_sha256':binary_sha, 'harness_sha256':hashlib.sha256(pathlib.Path(__file__).read_bytes()).hexdigest(), 'subprocess_env':env, 'python_version':sys.version, 'command_prefix':[binary], 'source_commit':'not established by this harness'}, indent=2)+'\n')
if version.returncode: raise SystemExit('binary version failed')
manifest = '''rule copy
  command = cp $in $out && printf '%s\\n' $out >> actions.log
build oo.h: copy oo.h.in
build foo.o: copy foo.c || oo.h
default foo.o
'''
(repo/'build.ninja').write_text(manifest)
(repo/'foo.c').write_text('foo\n')
(repo/'oo.h.in').write_text('header\n')
def mtime(name, t): os.utime(repo/name, (t,t))
mtime('foo.c', 1000000000); mtime('oo.h.in', 1000000000)
def run(name, args):
    (root/(name+'.command.json')).write_text(json.dumps({'argv':[binary,*args], 'cwd':str(repo), 'env':env}, indent=2)+'\n')
    p = subprocess.run([binary,*args], cwd=repo, env=env, capture_output=True)
    (root/(name+'.stdout')).write_bytes(p.stdout)
    (root/(name+'.stderr')).write_bytes(p.stderr)
    (root/(name+'.exit')).write_text(str(p.returncode)+'\n')
    if p.returncode: raise SystemExit(f'{name} failed: {p.returncode}')
def snap(name):
    data={}
    for p in sorted(repo.iterdir()):
        if p.is_file():
            data[p.name]={'mtime_ns':p.stat().st_mtime_ns,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
    (root/(name+'.files.json')).write_text(json.dumps(data,indent=2)+'\n')
(root/'fixture-path.txt').write_text(str(repo)+'\n')
run('query',['-t','query','foo.o']); run('graph',['-t','graph','foo.o'])
snap('initial-before'); run('initial-plan',['-n','-d','explain','foo.o']); run('initial-build',['-d','explain','foo.o']); snap('initial-after')
# Normalize times to fixed historical values: inputs older than outputs.
mtime('foo.c',1000000000); mtime('oo.h.in',1000000000); mtime('oo.h',1100000000); mtime('foo.o',1200000000)
snap('clean-before'); run('clean-plan',['-n','-d','explain','foo.o']); run('clean-build',['-d','explain','foo.o']); snap('clean-after')
(repo/'oo.h').unlink()
snap('missing-before'); run('missing-plan',['-n','-d','explain','foo.o']); run('missing-build',['-d','explain','foo.o']); snap('missing-after')
# Past fixed mtimes ensure the order-only producer alone is out of date.
mtime('oo.h',1100000000); mtime('oo.h.in',1150000000); mtime('foo.o',1200000000)
snap('updated-before'); run('updated-plan',['-n','-d','explain','foo.o']); run('updated-build',['-d','explain','foo.o']); snap('updated-after')
(root/'action-log.txt').write_bytes((repo/'actions.log').read_bytes())
print('fixture:',repo)

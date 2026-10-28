#!/usr/bin/env python3
"""Compile four authored Mach-O inputs; inspect them without executing them."""
import argparse, hashlib, json, pathlib, platform, subprocess, tempfile, time

ap=argparse.ArgumentParser();ap.add_argument('--output',required=True);args=ap.parse_args()
out=pathlib.Path(args.output).resolve();out.mkdir(parents=True,exist_ok=False)
build=pathlib.Path(tempfile.mkdtemp(prefix='archify-round36-build-'))
(out/'streams').mkdir();(out/'inputs').mkdir();commands=[];artifacts=[]
def run(label,argv,required=True):
    start=time.monotonic();p=subprocess.run(argv,cwd=build,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    for suffix,data in [('stdout',p.stdout),('stderr',p.stderr)]: (out/'streams'/f'{label}.{suffix}').write_bytes(data)
    commands.append({'label':label,'argv':argv,'cwd':str(build),'exitCode':p.returncode,'elapsedSeconds':time.monotonic()-start,'stdout':f'streams/{label}.stdout','stderr':f'streams/{label}.stderr'})
    (out/'commands.json').write_text(json.dumps(commands,indent=2)+'\n')
    if required and p.returncode: raise RuntimeError(f'{label}: {p.returncode}; retained streams')
run('clang-version',['/usr/bin/clang','--version']);run('otool-version',['/usr/bin/otool','--version']);run('os-version',['/usr/bin/sw_vers'])
for name,count,initial in [('zero-4k',4096,0),('zero-1m',1048576,0),('data-4k',4096,1),('data-1m',1048576,1)]:
    code=f'/* Original Archify research fixture; not upstream Bloaty test data. */\nvolatile unsigned char payload[{count}] = {{{initial}}};\nint main(void) {{ return payload[0]; }}\n'
    (out/'inputs'/f'{name}.c').write_text(code);(build/f'{name}.c').write_text(code)
    run(f'{name}-compile',['/usr/bin/clang','-Os','-fno-common',f'{name}.c','-o',name])
    run(f'{name}-size',['/usr/bin/size','-m',name]);run(f'{name}-load-commands',['/usr/bin/otool','-l',name]);run(f'{name}-symbols',['/usr/bin/nm','-nm',name]);run(f'{name}-format',['/usr/bin/file',name])
    b=(build/name).read_bytes();artifacts.append({'name':name,'declaredPayloadBytes':count,'firstInitializer':initial,'fileBytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'localBinaryPath':str(build/name),'sourceSha256':hashlib.sha256(code.encode()).hexdigest(),'executed':False})
result={'platform':platform.platform(),'machine':platform.machine(),'buildDirectory':str(build),'nativeTool':'Apple clang / size / otool / nm; Bloaty not executed','scope':'four authored inputs; static file/load-command observations, not measured resident memory','artifacts':artifacts,'commands':len(commands)}
(out/'result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))

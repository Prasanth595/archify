import argparse, gzip, hashlib, io, json, platform, subprocess, tarfile, time
from pathlib import Path
p=argparse.ArgumentParser(); p.add_argument('--output',required=True); p.add_argument('--node',required=True); p.add_argument('--tsc',required=True); a=p.parse_args()
root=Path(a.output).resolve(); root.mkdir(parents=True,exist_ok=False)
node=str(Path(a.node).resolve()); tsc=str(Path(a.tsc).resolve()); records=[]
def run(label, argv, cwd):
    start=time.monotonic(); r=subprocess.run(argv,cwd=cwd,capture_output=True)
    for channel,data in [('stdout',r.stdout),('stderr',r.stderr)]: (root/f'{label}.{channel}.txt').write_bytes(data)
    records.append(dict(label=label,argv=argv,cwd=str(cwd),exit=r.returncode,durationSeconds=round(time.monotonic()-start,6),stdout=f'{label}.stdout.txt',stderr=f'{label}.stderr.txt'))
    return r.returncode
run('node-version',[node,'--version'],root); run('tsc-version',[node,tsc,'--version'],root)
package={'name':'archify-resolution-probe','version':'0.0.0','private':True,'main':'./index.js','types':'./index.d.ts','exports':{'import':'./index.mjs','default':'./index.js'}}
results={}
for name in ['missing-esm-types','matched-esm-types','missing-runtime-target']:
    case=root/name; case.mkdir()
    files={'package.json':json.dumps(package,indent=2)+'\n','index.js':'exports.selected = "cjs";\n','index.d.ts':'export declare const selected: "cjs";\n'}
    if name!='missing-runtime-target': files['index.mjs']='export const selected = "esm";\n'
    if name!='missing-esm-types': files['index.d.mts']='export declare const selected: "esm";\n'
    for f,text in files.items(): (case/f).write_text(text)
    (case/'probe.mts').write_text('import { selected } from "archify-resolution-probe";\nconst expected: "esm" = selected;\n')
    (case/'tsconfig.json').write_text(json.dumps({'compilerOptions':{'module':'NodeNext','moduleResolution':'NodeNext','target':'ES2022','lib':['ES2022'],'types':[],'strict':True,'noEmit':True,'traceResolution':True,'pretty':False},'files':['probe.mts']},indent=2)+'\n')
    (case/'runtime.mjs').write_text('import { selected } from "archify-resolution-probe";\nconsole.log(JSON.stringify({selected, resolved:import.meta.resolve("archify-resolution-probe")}));\n')
    results[name]={'tscExit':run(name+'-tsc',[node,tsc,'--project','tsconfig.json'],case),'nodeExit':run(name+'-node',[node,'runtime.mjs'],case)}
    archive=io.BytesIO()
    with tarfile.open(fileobj=archive,mode='w',format=tarfile.USTAR_FORMAT) as tar:
        for f in sorted(files):
            content=(case/f).read_bytes(); entry=tarfile.TarInfo('package/'+f);entry.size=len(content);entry.mode=0o644;entry.mtime=0;tar.addfile(entry,io.BytesIO(content))
    (root/(name+'.tgz')).write_bytes(gzip.compress(archive.getvalue(),mtime=0))
(root/'commands.json').write_text(json.dumps({'platform':platform.platform(),'node':node,'tsc':tsc,'commands':records,'results':results},indent=2)+'\n')
print(json.dumps(results,indent=2))

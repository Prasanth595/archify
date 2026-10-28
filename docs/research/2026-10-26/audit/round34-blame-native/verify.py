import base64, hashlib, json, os, pathlib, re, subprocess, sys

roots = [pathlib.Path(x).resolve() for x in sys.argv[1:]]
assert len(roots) == 2
def rows(text):
    result = []
    current = None
    for line in text.splitlines():
        if re.match(r'^[0-9a-f]{40} \d+ \d+( \d+)?$', line):
            current = {'sha':line.split()[0], 'line':int(line.split()[2]), 'flags':[]}
        elif line in ('ignored','unblamable'):
            current['flags'].append(line)
        elif line.startswith('\t'):
            current['text']=line[1:]
            result.append(current)
    return result

for root in roots:
    commits=json.loads((root/'commits.json').read_text())
    outputs=json.loads((root/'outputs.json').read_text())
    snapshots=json.loads((root/'snapshots.json').read_text())
    receipts=[]
    for name in ('A','B','C'):
        command=['git','show',commits[name]+':config.py']
        r=subprocess.run(command,cwd=root/'repo',capture_output=True,
                         env=dict(os.environ,GIT_CONFIG_NOSYSTEM='1',GIT_CONFIG_GLOBAL=os.devnull))
        receipts.append({'command':command,'exit':r.returncode,'stdout_b64':base64.b64encode(r.stdout).decode(),'stderr_b64':base64.b64encode(r.stderr).decode()})
        assert r.returncode==0 and r.stdout.decode()==snapshots[name]
    (root/'committed-source-readback.json').write_text(json.dumps(receipts,indent=2)+'\n')
    default=rows(outputs['porcelain-default'])
    unmarked=rows(outputs['porcelain-ignored-unmarked'])
    marked=rows(outputs['porcelain-ignored-marked'])
    assert len(default)==len(unmarked)==len(marked)==5
    assert all(r['sha']==commits['C'] for r in default)
    assert all(not r['flags'] for r in unmarked)
    assert [r['flags'] for r in marked]==[['ignored']]*4+[['unblamable']]
    assert marked[1]['sha']==commits['B'] and marked[1]['text']=='retry_limit = 4'
    assert snapshots['B'].splitlines()[1]=='retry_limit=5'
    assert marked[4]['sha']==commits['C']
    assert [{**r,'flags':[]} for r in marked]==unmarked
    assert outputs['ignore-file-explicit']==outputs['porcelain-ignored-marked']
    assert outputs['status']==''
    assert [line[0] for line in outputs['plain-ignored-marked'].splitlines()]==['?']*4+['*']
    expected_current=snapshots['C'].splitlines()
    assert [r['text'] for r in marked]==expected_current
    (root/'selected-records.json').write_text(json.dumps({'default':default,'unmarked':unmarked,'marked':marked},ensure_ascii=False,indent=2)+'\n')

left,right=roots
assert json.loads((left/'commits.json').read_text())==json.loads((right/'commits.json').read_text())
a=[json.loads(x) for x in (left/'transcript.jsonl').read_text().splitlines()]
b=[json.loads(x) for x in (right/'transcript.jsonl').read_text().splitlines()]
assert len(a)==len(b)==24
comparisons=0
for x,y in zip(a,b):
    assert x['label']==y['label'] and x['exit']==y['exit']==0
    if x['label']=='init': continue
    assert x['command']==y['command']
    for stream in ('stdout_b64','stderr_b64'):
        assert x[stream]==y[stream],(x['label'],stream)
        comparisons+=1
summary={'passed':True,'runs':2,'commandsPerRun':24,'readbackCommandsPerRun':3,'identicalCommitIds':4,
         'pairedStreamsCompared':comparisons,'excluded':'init paths and elapsed timings',
         'observed':{'ordinaryBlameCommit':'C for all five lines','reassignedLines':4,'unblamableLines':1,
                     'flagsPresentWithMarkingDisabled':False,'line2AttributedTo':'B','line2AtB':'retry_limit=5','line2Current':'retry_limit = 4',
                     'explicitIgnoreFileEqualsIgnoreRev':True,'repositoryClean':True}}
print(json.dumps(summary,indent=2))

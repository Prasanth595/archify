#!/usr/bin/env python3
"""Summarise archived DOM observations, not a React execution simulator."""
from pathlib import Path
import hashlib,json,re
r=Path(__file__).resolve().parent
names=['08-before','09-expanded','10-copyicon','10-reselected','11-script','11-vite']
rows=[]
for name in names:
    d=json.loads((r/'browser'/f'{name}.json').read_text());s=d['scan']
    assert d['viewport']==[1440,900]
    changes=[]
    for hook,count,previous,current in re.findall(r'(\d+)(?:th|nd|st|rd) hook called in InstallGuide\nx(\d+)\n-\n"([^"]+)"\n\+\n"([^"]+)"',s):
        changes.append({'hook':int(hook),'count':int(count),'previous':previous,'current':current})
    tree=re.search(r'\nInstallGuide\n×(\d+)',s)
    rows.append({'state':name,'selectedComponent':s.splitlines()[0],'noChangesSinceSelecting':'No changes detected since selecting' in s,'changes':changes,'installGuideTreeBadge':int(tree[1]) if tree else None,'historyPresent':'History' in s})
by={x['state']:x for x in rows}
assert by['08-before']['noChangesSinceSelecting']
assert by['09-expanded']['changes']==[{'hook':0,'count':1,'previous':'script','current':'vite'},{'hook':2,'count':1,'previous':'138px','current':'307px'}]
assert by['10-copyicon']['selectedComponent']=='CopyIcon'
assert by['10-reselected']['noChangesSinceSelecting'] and by['10-reselected']['installGuideTreeBadge']==2
assert by['10-reselected']['historyPresent'] and not by['10-reselected']['changes']
assert by['11-script']['changes'][0]=={'hook':0,'count':1,'previous':'vite','current':'script'}
assert by['11-vite']['changes']==[{'hook':0,'count':2,'previous':'script','current':'vite'},{'hook':2,'count':2,'previous':'138px','current':'307px'}]
def identity(path):
    b=(r/path).read_bytes()
    return {'path':path,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'gitBlob':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest(),'declaredVersions':re.findall(r'version:"(0\.\d+\.\d+)"',b.decode())}
fixed=identity('source/packages/website/public/auto.global.js');served=identity('served/auto.global.js')
assert fixed['sha256']!=served['sha256']
assert served['sha256']==json.loads((r/'served/metadata.json').read_text())['sha256']
print(json.dumps({'observations':rows,'fixedBundle':fixed,'servedLaterBundle':served,'sameBundleBytes':False,'limits':['served asset fetched after actions, not captured initial response','no reader benchmark or causal/performance conclusion','counts are UI observations, not independently measured React calls','source revision not established as deployment revision']},ensure_ascii=False,indent=2))

from pathlib import Path
import subprocess,json,hashlib,re,datetime,struct
root=Path('docs/research/2026-10-26');audit=root/'audit'
def git(*args):return subprocess.check_output(['git',*args])
def gs(*args):return git(*args).decode().strip()
heads={k:v for v,k in (line.split() for line in (audit/'remote-branches-round27.txt').read_text().splitlines())}
dev=heads['refs/heads/dev'];assert gs('rev-parse','origin/dev')==dev
names=['source-link-context','keyboard-traversal','tree-roles','task-flow-tests','kconfig-imply-reading','task-occurrences','source-question-tour']
extra={
 'source-link-context':['README.md','artifacts/candidate-en.html','screenshots/candidate-en-desktop.png','validation.json'],
 'keyboard-traversal':['README.md','kconfig-transfer-d5/README.md','kconfig-transfer-d5/fixed-inputs/comparison.html','kconfig-transfer-d5/screenshots/card-desktop.png'],
 'tree-roles':['README.md','candidate/repository.html','root-review/candidate-leaf-paired.png','evidence/final-checks.json'],
 'task-flow-tests':['README.md','final/review.html','input/mapping.json','input/provenance.json','root-review/overview-light.png','final/captures/summary.json','tests.tap'],
 'kconfig-imply-reading':['README.md','artifacts/native-baseline.html','artifacts/comparison.html','evidence/browser/final-comparison-desktop.png','VALIDATION.md'],
 'task-occurrences':['README.md','output/explanation.html','screenshots/overview.png','portable-summary.json'],
 'source-question-tour':['README.md','file-first.html','question-first.html','screenshots/question-first-overview.png','receipt.json']}
def blob(sha,path):
 b=git('show',sha+':'+path);d={'path':path,'gitBlob':gs('rev-parse',sha+':'+path),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 if path.endswith('.png'):
  assert b[:8]==b'\x89PNG\r\n\x1a\n';d['pngSize']=list(struct.unpack('>II',b[16:24]))
 return d
rows=[]
for n in names:
 branch='codex/lab-'+n;sha=heads['refs/heads/'+branch];assert gs('rev-parse','origin/'+branch)==sha
 base=gs('merge-base',dev,sha);changed=gs('diff','--name-only',base,sha).splitlines()
 outside=[p for p in changed if not p.startswith('experiments/'+n+'/')]
 if n not in names[:3]:assert not outside,(n,outside)
 rows.append({'id':n,'branch':branch,'head':sha,'mergeBaseWithDev':base,'devOnlyCommits':int(gs('rev-list','--count',sha+'..'+dev)),'headOnlyCommits':int(gs('rev-list','--count',dev+'..'+sha)),'changedPathsFromMergeBase':changed,'outsideOwnExperimentPaths':outside,'selectedArtifacts':[blob(sha,'experiments/'+n+'/'+p) for p in extra[n]]})
(audit/'round27-branch-inventory.json').write_text(json.dumps({'observedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dev':dev,'remoteHeadCount':len(heads),'scope':'Seven selected prior branches; Git object, byte and path verification only, no test rerun, review approval or ancestry refresh. Counts include evidence/generated files.','branches':rows},ensure_ascii=False,indent=2)+'\n')
mds=[root/'review-index-20261028.md',audit/'round27-runtime-review.md',audit/'round27-content-review.md',audit/'round27-task-flow-review.md',root/'scouts/mutation-reading-round27.md']
links={}
for f in mds:
 for sha,p in re.findall(r'https://(?:github\.com/tt-a1i/archify/(?:blob|tree)/|raw\.githubusercontent\.com/tt-a1i/archify/)([0-9a-f]{40})/([^\s)\]#]+)',f.read_text()):
  typ=gs('cat-file','-t',sha+':'+p);key=sha+':'+p
  links[key]={'commit':sha,'path':p,'type':typ,'object':gs('rev-parse',key)}
  if typ=='blob':links[key].update(blob(sha,p))
(audit/'round27-fixed-link-objects.json').write_text(json.dumps({'note':'Only fixed tt-a1i/archify Git URLs in the five new authored/review Markdown files; external sources were read by the scout, not re-fetched here. Object existence is not browser acceptance.','objects':list(links.values())},indent=2)+'\n')
print(json.dumps({'branches':[{'id':r['id'],'devOnly':r['devOnlyCommits'],'headOnly':r['headOnlyCommits'],'changed':len(r['changedPathsFromMergeBase']),'outsideExperiment':len(r['outsideOwnExperimentPaths'])} for r in rows],'selectedArtifactCount':sum(len(r['selectedArtifacts']) for r in rows),'fixedLinkObjects':len(links)},indent=2))

from pathlib import Path
import json, hashlib, re
from html.parser import HTMLParser
from collections import defaultdict
root=Path('<checkout>')
out=Path('<external-review-evidence>')
snap=out/'snapshot'
l=json.loads((snap/'ledger.json').read_text()); doc=json.loads((snap/'candidate.explainer.json').read_text())
checks=[]
def eq(actual,expected,name):
 assert actual==expected,(name,actual,expected)
 checks.append(name)
rawbytes=(root/'experiments/profile-contexts/fixtures/recursion.txt').read_bytes()
jbytes=(root/'experiments/profile-contexts/fixtures/simple-sampled.speedscope.json').read_bytes()
eq((len(rawbytes),hashlib.sha256(rawbytes).hexdigest()),(96,'5e6da30ddbe1e66f4e8a326236f2c9016484c61a6a7022b60389d94920fc4a57'),'raw bytes pinned')
eq((len(jbytes),hashlib.sha256(jbytes).hexdigest()),(458,'6a4508cd712ee7a1a80929009d4a1b212cadfafd30831722ae6f195601f8967c'),'JSON bytes pinned')
rows=[]
for i,line in enumerate(rawbytes.decode().splitlines()):
 stack,w=line.rsplit(' ',1); rows.append((f'R{i+1:02}',stack.split(';'),int(w)))
j=json.loads(jbytes); p=j['profiles'][0]
jrows=[(f'J{i+1:02}',s,w) for i,(s,w) in enumerate(zip(p['samples'],p['weights']))]
# Read independent raw bytes; no import of author implementation or its tests.
def oracle(rows):
 prefixes={tuple(s[:i]) for _,s,_ in rows for i in range(1,len(s)+1)}
 nodes={prefix:{'self':sum(w for _,s,w in rows if tuple(s)==prefix),'total':sum(w for _,s,w in rows if tuple(s[:len(prefix)])==prefix),'rows':[rid for rid,s,_ in rows if tuple(s[:len(prefix)])==prefix]} for prefix in prefixes}
 frames={f:[sum(w for _,s,w in rows if s[-1]==f),sum(w for _,s,w in rows if f in s)] for _,s,_ in rows for f in s}
 return nodes,frames
def verify_model(model,rows,name,overwrite=None):
 nodes,frames=oracle(rows)
 eq({tuple(c['prefix']):{k:c[k] for k in ['self','total','rows']} for c in model['contexts']},nodes,name+' every prefix self/total/members')
 eq({f['key']:[f['self'],f['total']] for f in model['frames']},overwrite or frames,name+' Frame weights')
 eq(model['totalWeight'],sum(w for _,_,w in rows),name+' total weight')
 eq(model['occurrenceCount'],len(rows),name+' occurrence count')
verify_model(l['raw'],rows,'raw')
verify_model(l['json'],jrows,'JSON')
# Full retained-stack oracle fixed from ten complete rows, not author flatten().
retained=['a','b','a;b','a;b','a;b;c','a;b','a;b;c','a;b','a;b;c','a;b;c']
frows=[(rid,stack.split(';'),w) for (rid,_,w),stack in zip(rows,retained)]
verify_model(l['flat']['model'],frows,'flat',oracle(rows)[1])
verify_model(l['jsonFlat']['model'],jrows,'JSON flat',oracle(jrows)[1])
eq([t['retained'] for t in l['flat']['trace']],[s.split(';') for s in retained],'all 10 retained trace rows')
eq([(t['id'],t['interval']) for t in l['flat']['trace']],[(f'R{i+1:02}',[i,i+1]) for i in range(10)],'all 10 weight intervals')
# Null closes cannot mutate retained active stack; event-produced intervals independently integrate.
for e in l['flat']['events']:
 if e['effect']=='suppressed: no leave':
  eq(e['active'][:2] if e['at']>2 else e['active'], ['a','b'] if e['at']>2 else [e['frame']],f'null close {e["at"]} {e["prefix"]}')
iv=l['flat']['model']['eventIntervals']
for prefix,v in oracle(frows)[0].items():
 eq([sum(e['weight'] for e in iv if tuple(e['stack'])==prefix),sum(e['weight'] for e in iv if tuple(e['stack'][:len(prefix)])==prefix)],[v['self'],v['total']],f'event integral {prefix}')
counter=[('R01',['a'],1),('R02',['a','b','a'],1),('R03',['a','b','a','b','a'],1),('R04',['a','b','a'],1)]
verify_model(l['counterexample']['model'],[(rid,['a'] if i==0 else ['a','b'],w) for i,(rid,_,w) in enumerate(counter)],'four-line counterexample',oracle(counter)[1])
eq({f['key']:[f['self'],f['total']] for f in l['counterexample']['model']['framesBeforeOverwrite']},{'a':[1,4],'b':[3,3]},'counterexample exposes leaf drift')
eq([o['source']['line'] for o in l['rawOccurrences']],list(range(1,11)),'all source raw line positions')
for i,o in enumerate(l['jsonOccurrences']):
 eq(o['source'],{'samplesLine':11,'weightsLine':12,'samplePointer':f'/profiles/0/samples/{i}','weightPointer':f'/profiles/0/weights/{i}'},f'JSON occurrence {i} pointers')
eq('"samples"' in jbytes.decode().splitlines()[10] and '"weights"' in jbytes.decode().splitlines()[11],True,'actual JSON source lines 11/12')
class Html(HTMLParser):
 def __init__(self):super().__init__();self.ids=defaultdict(list);self.hrefs=[];self.stack=[];self.texts=defaultdict(list);self.localhrefs=defaultdict(list);self.native=[];self.localattrs=defaultdict(list)
 def handle_starttag(self,t,attrs):
  a=dict(attrs);eid=a.get('id');self.stack.append((t,eid)) if t not in ['meta','link','img','input','br','hr','source','wbr','area','base','embed','param','track','col'] else None
  if eid:self.ids[eid].append(a)
  if 'data-node-id' in a:self.native.append(a['data-node-id'])
  if 'href' in a:
   self.hrefs.append(a['href'])
   for _,ancestor in self.stack:
    if ancestor:
     self.localhrefs[ancestor].append(a['href']);self.localattrs[ancestor].append(a)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==t:self.stack=self.stack[:i];break
 def handle_data(self,data):
  for _,eid in self.stack:
   if eid:self.texts[eid].append(data)
h=Html();h.feed((snap/'candidate.html').read_text())
blocks={b['id']:b for panel in doc['panels'] for b in panel['blocks']}
for text,id in [(rawbytes.decode(),'original-raw'),(jbytes.decode(),'original-json')]:
 eq(blocks[id]['text'],text,id+' authored literal exact bytes decoded')
 # Native snippet wrap keeps complete source, including final LF.
 eq(text in ''.join(h.texts[id]),True,id+' present complete in public HTML')
count={}
for m,rs in [(l['raw'],rows),(l['flat']['model'],frows),(l['json'],jrows)]:
 ns=m['namespace'];diagram=blocks[ns+'-tree'];table=blocks[ns+'-detail-table'];details={r['id']:r for r in table['rows']};count[ns]=0
 for c in m['contexts']:
  pid=c['id'];con='contrib-'+pid;entry='entry-'+pid
  eq(diagram['nodeBlocks'][pid],con,f'{pid} native node to contribution mapping')
  eq(entry in h.ids and con in h.ids,True,f'{pid} public anchor exists')
  for rid in c['rows']:
   did=f'detail-{pid}-{rid.lower()}';count[ns]+=1
   eq(did in h.ids,True,did+' real public row anchor')
   eq('#'+did in h.hrefs,True,did+' public incoming detail link')
   eq(f'block:entry-{pid}' in details[did]['cells'][1]['text'],True,did+' exact prefix return authored')
   eq('#'+entry in h.localhrefs[did],True,did+' public row-specific return exists')
   eq(any(a.get('data-diagram-link')==ns+'-tree' and a.get('data-diagram-hash')=='focus='+pid for a in h.localattrs[did]),True,did+' public row-specific native exact prefix')
   # Real rendered row carries exact return and node target, not only global occurrence.
   txt=''.join(h.texts[did]);eq('返回 '+ ';'.join(str(x) for x in c['prefix']) in txt if ns!='json' else '返回 a' in txt,True,did+' rendered return text')
 eq(len(diagram['spec']['nodes']),len(m['contexts'])+1,ns+' complete native nodes')
eq(count,{'raw':38,'flat':22,'json':14},'all 74 contribution relations independently counted')
# Validate each local anchor href across real final HTML, not model-only targets.
missing=sorted(set(x[1:] for x in h.hrefs if x.startswith('#') and x!='#' and x[1:] not in h.ids))
eq(missing,[],'all public local anchors resolve')
result={'kind':'independent Python raw-byte oracle and public HTML static inspection; no browser','snapshot':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in snap.iterdir()},'passedChecks':len(checks),'checks':checks,'counts':count,'limits':['No browser, pointer, keyboard, perceptual, CI or human acceptance claim.','Model identity is fixture-bounded insertion order, not durable across changed source order.']}
(out/'independent-oracle.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='checks'},ensure_ascii=False,indent=2))

from pathlib import Path
from html.parser import HTMLParser
from collections import defaultdict
import json,hashlib,re
out=Path('$REVIEW_RUN');s=out/'final-snapshot';o=json.loads((out/'derivation.json').read_text());l=json.loads((s/'ledger.json').read_text());d=json.loads((s/'candidate.explainer.json').read_text())
verified=[]
def eq(a,b,n):
 assert a==b,(n,a,b)
 verified.append(n)
for file,sha in [('generate.mjs','20df1edce8366dbb8d4cc1347bdbd40c4a6b4c32b3a23845e0eaf32f60c8d030'),('candidate.explainer.json','dcdda473b220acb17f6b7280f96a24d695b4cf41be9436fa50ad1f295e274ca7'),('candidate.html','035db27d3cac4cda94258f839116cc7e72db39cafa5ddb734184118e8e4c0a94'),('baseline.html','0668f1f91c1c77e81fd55ff0a479f77fcd676675ea2143e35e40940d7197c214')]:eq(hashlib.sha256((s/file).read_bytes()).hexdigest(),sha,'frozen '+file)
for role in ['source','base']:
 eq(len(l[role]['rows']),len(o[role]['rows']),role+' rows complete')
 eq(len(l[role]['maps']),12,role+' 12 maps')
 for actual,expected in zip(l[role]['rows'],o[role]['rows']):
  for a,b in [('id','id'),('line','line'),('literal','literal'),('values','values')]:eq(actual[a],expected[b],actual['id']+' '+a)
  eq(actual['raw']['stack'],expected['rawAddresses'],actual['id']+' full raw stack')
  eq([v['corrected'] for v in actual['locations']],expected['correctedAddresses'],actual['id']+' full corrected stack')
  for loc,ev in zip(actual['locations'],expected['locationEvidence']):
   mapped=next(m for m in l[role]['maps'] if m['id']==loc['mapping'])
   eq(mapped['line'],ev['mapLine'],actual['id']+' mapping source line '+loc['raw'])
 for a,b in zip(l[role]['maps'],o[role]['maps']):
  eq([a['line'],a['literal'],int(a['start'],16),int(a['limit'],16),a['file']],[b['line'],b['literal'],b['start'],b['limit'],b['file']],role+' map '+a['id'])
for a,b in [('sourceTotal','sourceTotals'),('baseTotal','baseTotals'),('normalizedSourceTotal','roundedSourceTotals')]:eq(l[a],o[b],a)
eq(l['netDiff'],[1,0],'net separate')
for a,b in zip(l['comparisonRows'],o['comparisonRows']):
 for key,other in [('id','id'),('source','source'),('normalized','rounded'),('absoluteDiff','absoluteDiff'),('normalizedDiff','normalizedDiff'),('baseId','base')]:eq(a[key],b[other],a['id']+' '+key)
for mode,m in l['modes'].items():
 expected=o['branches'][mode.replace('diff-base','diff_base')]
 eq(m['denominators'],expected['reportDenominators'],mode+' denominators')
 eq(len(m['samples']),expected['sampleCount'],mode+' merged count')
 for a,b in zip(m['samples'],expected['mergedSamples']):
  eq(a['values'],b['values'],mode+' merged values '+a['id']);eq(a['labels'],b['labels'],mode+' label identity '+a['id']);eq(a['contributors'],b['members'],mode+' contributor identities '+a['id'])
blocks={b['id']:b for p in d['panels'] for b in p['blocks']};panels={p['id']:p for p in d['panels']}
graphs={k:json.loads((s/(k+'.architecture.json')).read_text()) for k in ['count','delay','denominators']}
wanted=[(f'S{i}','source-total','贡献') for i in range(1,7)]+[('B1','base-total','贡献'),('source-total','factor','分母'),('base-total','factor','分子'),('factor','round','乘数'),('S1','round','被乘数'),('S1','absolute','被减数'),('B1','absolute','减数'),('round','normalized','被减数'),('B1','normalized','减数')]
for name in ['count','delay']:
 g=graphs[name];eq(len(g['components']),13,name+' 13 components');eq([(e['from'],e['to'],e['label']) for e in g['connections']],wanted,name+' all exact data dependencies')
 eq(blocks[name+'-flow']['spec'],g,name+' public inline graph equal')
 eq(any(b['type']=='steps' for b in panels[name+'-view']['blocks']),False,name+' graph full width')
 eq(panels[name+'-arithmetic']['blocks'][0]['type'],'steps',name+' all steps preserved adjacent')
 for node in g['components']:eq(blocks[name+'-flow']['nodeBlocks'][node['id']],name+'-detail-'+node['id'],name+' '+node['id']+' source block')
# Denominator graph does not feed net 1/0 into a ratio.
g=graphs['denominators'];eq(len(g['components']),9,'denom 9 nodes');eq(len(g['connections']),8,'denom 8 edges')
for ratio,denom in [('base-ratio','base-denom'),('tagged-ratio','tagged-denom')]:eq({(e['from'],e['label']) for e in g['connections'] if e['to']==ratio},{('numerator','分子'),(denom,'分母')},ratio+' complete division inputs')
class Html(HTMLParser):
 def __init__(self):super().__init__();self.ids={};self.stack=[];self.texts=defaultdict(list);self.links=defaultdict(list);self.alllinks=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs);eid=a.get('id')
  if tag not in ['meta','link','img','br','input','hr','wbr','source','area','base','col','embed','param','track']:self.stack.append((tag,eid))
  if eid:self.ids[eid]=a
  if 'href' in a:
   self.alllinks.append(a)
   for _,id in self.stack:
    if id:self.links[id].append(a)
 def handle_endtag(self,tag):
  for i in range(len(self.stack)-1,-1,-1):
   if self.stack[i][0]==tag:self.stack=self.stack[:i];break
 def handle_data(self,data):
  for _,id in self.stack:
   if id:self.texts[id].append(data)
h=Html();h.feed((s/'candidate.html').read_text());baseline=(s/'baseline.html').read_text()
for name in ['count','delay']:
 for node in graphs[name]['components']:
  nid=node['id'];id=name+'-detail-'+nid
  eq('preview-'+name+'-flow-node-'+nid in h.ids,True,name+' real preview '+nid)
  eq(id in h.ids,True,name+' real detail '+nid)
  eq(any(a.get('data-diagram-link')==name+'-flow' and a.get('data-diagram-hash')=='focus='+nid for a in h.links[id]),True,name+' '+nid+' precise native return')
 for i in range(1,7):eq(any(a['href']=='#raw-s'+str(i) for a in h.links[name+'-detail-source-total']),True,name+' total links S'+str(i))
 eq(any(a['href']=='#'+name+'-detail-source-total' for a in h.links[name+'-detail-factor']),True,name+' factor opens total details')
 for ratio in ['factor','source-total','normalized','round','S2']:
  steps=blocks[name+'-entries']['items'];eq(next(t for t in steps if t['id']==name+'-entry-'+ratio)['target'],{'diagram':name+'-flow','node':ratio},name+' exact step '+ratio)
for node in graphs['denominators']['components']:
 nid=node['id'];id='denom-detail-'+nid
 eq('preview-denominator-flow-node-'+nid in h.ids,True,'denom preview '+nid)
 eq(any(a.get('data-diagram-link')=='denominator-flow' and a.get('data-diagram-hash')=='focus='+nid for a in h.links[id]),True,'denom precise native return '+nid)
for row in o['source']['rows']+o['base']['rows']:
 rid=row['id'].lower();literal='literal-'+rid;loc='locations-'+rid
 eq(blocks[literal]['text'],row['literal'],rid+' literal unchanged')
 eq(row['literal'] in ''.join(h.texts[literal]),True,rid+' actual HTML full row')
 for a,b in zip(row['rawAddresses'],row['correctedAddresses']):eq(a+' → '+b in ''.join(h.texts[loc]),True,rid+' visible corrected '+a)
 for metric in ['count','delay']:eq(any(a['href']=='#'+metric+'-factor-entry' for a in h.links['raw-'+rid]),True,rid+' fixed '+metric+' factor return')
 eq(any(a['href']=='#original-'+('source' if rid.startswith('s') else 'base') for a in h.links['raw-'+rid]),True,rid+' full map source reachable')
for i,filename in enumerate(['cppbench.contention','cppbench.small.contention','cppbench.contention.string','LICENSE-pprof']):
 raw=(Path('$REPO/experiments/profile-normalization/fixtures')/filename).read_text();id=['original-source','original-base','original-golden','original-license'][i]
 eq(blocks[id]['text'],raw,id+' authored full text');eq(raw in ''.join(h.texts[id]),True,id+' HTML full text')
 eq(hashlib.sha256(raw.encode()).hexdigest(),o['files'][i]['sha256'],id+' bytes hash')
for a in h.alllinks:
 if a['href'].startswith('#') and a['href']!='#':eq(a['href'][1:] in h.ids,True,'public anchor '+a['href'])
# All six public result rows match independent arithmetic in column order.
for row,exp in zip(blocks['result-table']['rows'],o['comparisonRows']):
 expected=[exp['source'],o['baseTotals'] if exp['base'] else [0,0],exp['rounded'],exp['absoluteDiff'],exp['normalizedDiff']]
 eq([c['text'] for c in row['cells']],[' / '.join(map(str,v)) for v in expected],exp['id']+' public result table')
for text in ['箭头只表示算术值依赖','不是程序调用','不是报告百分比分母','Viewer 内改选不联动父页']:
 eq(text in ''.join(''.join(x) for x in h.texts.values()),True,'public scope '+text)
result={'disposition':'No static arithmetic, complete-data, graph-dependency or exact-link blocker found at frozen bytes. Browser gate remains separate.','basis':'independent derivation.json from complete upstream bytes; no author implementation imported','snapshot':{p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in s.iterdir()},'verifiedContracts':['all 6+1 complete raw occurrences and 24 maps','raw-to-unsampled truncation, per-metric rounding and six full result rows','all four report denominators and 6/7 labeled merged sample identities','two 13-node/15-edge witnesses; 9-node/8-edge denominator division with both inputs','35 actual preview nodes mapped to real details; raw-to-factor fixed returns and all local anchors','complete fixtures, golden and Apache in real public HTML'],'browserRunByThisScript':False}
(out/'final-frozen-review.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='snapshot'},ensure_ascii=False,indent=2))

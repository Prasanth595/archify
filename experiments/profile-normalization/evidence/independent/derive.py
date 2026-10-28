from pathlib import Path
from collections import defaultdict
import hashlib,json,re,math
up=Path('$UPSTREAM_ARCHIVE');out=Path('$REVIEW_RUN')
files=['internal/driver/testdata/cppbench.contention','internal/driver/testdata/cppbench.small.contention','profile/testdata/cppbench.contention.string','LICENSE']
expect=[(1551,'e0f3035db93cd3bb384590b224ca2b26d79aca41e71042a32c351a6d3e34d2d4'),(821,'0d1f47b05eb6664827672b360eb122f13daec15765eb76eed1d77ed9e788516f'),(2025,'a552baca08d20d75945171f9d1ff08f5f9df12a0d7099ce88c9b894358015552'),(11358,'cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30')]
manifest=[]
for name,e in zip(files,expect):
 b=(up/name).read_bytes();actual=(len(b),hashlib.sha256(b).hexdigest());assert actual==e
 manifest.append({'path':name,'bytes':len(b),'sha256':actual[1]})
def read(name,role):
 rows=[];maps=[];headers={}
 for i,line in enumerate((up/name).read_text().splitlines(),1):
  m=re.match(r'\s*(\d+)\s+(\d+) @ (.+)',line)
  if m:
   cycles,n=int(m[1]),int(m[2]);addrs=re.findall(r'0x[0-9a-f]+',m[3])
   # Python float operations mirror exact specified float64 order, int truncates toward zero.
   vals=[n*headers['sampling period'],int(float(cycles)*float(headers['sampling period'])/(float(headers['cycles/second'])/1e9))]
   rows.append({'id':f'{role}{len(rows)+1}','line':i,'literal':line,'rawCycles':cycles,'rawCount':n,'rawAddresses':addrs,'correctedAddresses':[hex(int(a,16)-1) for a in addrs],'values':vals})
  m=re.match(r'\s*([0-9a-f]+)-([0-9a-f]+): (.+)',line)
  if m:maps.append({'line':i,'literal':line,'start':int(m[1],16),'limit':int(m[2],16),'file':m[3]})
  if '=' in line:
   k,v=line.split('=',1);headers[k.strip()]=int(v)
 return {'rows':rows,'maps':maps,'headers':headers}
s=read(files[0],'S');b=read(files[1],'B');assert len(s['rows'])==6 and len(b['rows'])==1 and len(s['maps'])==len(b['maps'])==12
assert [len(x['rawAddresses']) for x in s['rows']]==[13,4,15,16,16,15]
assert s['rows'][0]['rawAddresses']==b['rows'][0]['rawAddresses']
# Independent upstream printed golden: values and location sequences; no author output.
golden=(up/files[2]).read_text();locs={int(i):a for i,a in re.findall(r'^\s+(\d+): (0x[0-9a-f]+) M=\d+',golden,re.M)}
grows=re.findall(r'^\s+(\d+)\s+(\d+): ([\d ]+)$',golden,re.M)
assert len(locs)==40 and len(grows)==6
for row,(count,ns,ids) in zip(s['rows'],grows):
 assert row['values']==[int(count),int(ns)]
 assert row['correctedAddresses']==[locs[int(x)] for x in ids.split()]
gmaps=re.findall(r'^\d+: (0x[0-9a-f]+)/(0x[0-9a-f]+)/(0x[0-9a-f]+) (\S+)',golden,re.M)
assert len(gmaps)==12
for obj in [s,b]:
 assert [(m['start'],m['limit'],m['file']) for m in obj['maps']]==[(int(a,16),int(z,16),f) for a,z,_,f in gmaps]
for obj in [s,b]:
 for row in obj['rows']:
  row['locationEvidence']=[{'raw':a,'corrected':c,'mapLine':next(m['line'] for m in obj['maps'] if m['start']<=int(c,16)<m['limit'])} for a,c in zip(row['rawAddresses'],row['correctedAddresses'])]
total=lambda rows:[sum(r['values'][m] for r in rows) for m in range(2)]
st,bt=total(s['rows']),total(b['rows']);ratios=[bt[m]/st[m] for m in range(2)]
go_round=lambda x:math.floor(x+0.5) if x>=0 else math.ceil(x-0.5)
assert [go_round(x) for x in [0.5,1.5,-0.5,-1.5]]==[1,2,-1,-2]
scaled=[dict(r,values=[go_round(r['values'][m]*ratios[m]) for m in range(2)]) for r in s['rows']]
assert all(any(r['values']) for r in scaled)
baseKey={tuple(r['correctedAddresses']):r for r in b['rows']}
comparison=[]
for raw,norm in zip(s['rows'],scaled):
 base=baseKey.get(tuple(raw['correctedAddresses']));bv=base['values'] if base else [0,0]
 comparison.append({'id':raw['id'],'base':base['id'] if base else None,'source':raw['values'],'rounded':norm['values'],'absoluteDiff':[raw['values'][m]-bv[m] for m in range(2)],'normalizedDiff':[norm['values'][m]-bv[m] for m in range(2)]})
# Merge oracle preserves complete location vector + label map as sample identity.
def merge(source,tagged):
 groups={}
 for row in source+[dict(r,values=[-v for v in r['values']],isBase=True) for r in b['rows']]:
  label={'pprof::base':['true']} if tagged and row.get('isBase') else {}
  key=(tuple(row['correctedAddresses']),json.dumps(label,sort_keys=True))
  if key not in groups:groups[key]={'location':list(key[0]),'labels':label,'values':[0,0],'members':[]}
  dest=groups[key];dest['values']=[x+y for x,y in zip(dest['values'],row['values'])];dest['members'].append(row['id'])
 return [r for r in groups.values() if any(r['values'])]
def report_total(rows):
 result=[]
 for m in range(2):
  allabs=sum(abs(r['values'][m]) for r in rows)
  tagged=sum(abs(r['values'][m]) for r in rows if r['labels'].get('pprof::base')==['true'])
  result.append(tagged if tagged>0 else allabs)
 return result
branches={}
for name,source,tagged in [('absolute-base',s['rows'],False),('absolute-diff_base',s['rows'],True),('normalized-base',scaled,False),('normalized-diff_base',scaled,True)]:
 merged=merge(source,tagged); branches[name]={'mergedSamples':merged,'reportDenominators':report_total(merged),'signedNet':total(merged),'sampleCount':len(merged)}
assert branches['normalized-base']['reportDenominators']==[459,738]
assert branches['normalized-diff_base']['reportDenominators']==[1000,3124]
assert branches['absolute-base']['reportDenominators']==[2500,690505089]
assert branches['absolute-diff_base']['reportDenominators']==[1000,3124]
assert branches['normalized-base']['signedNet']==[1,0]
assert [branches[k]['sampleCount'] for k in branches]==[6,7,6,7]
# Address aggregation is a later different projection: each sample's unique location cumulatives;
# leaf exclusive receives all six sample values because all rows have same corrected leaf.
addr=defaultdict(lambda:[0,0]);flat=defaultdict(lambda:[0,0])
for row in branches['normalized-diff_base']['mergedSamples']:
 for a in set(row['location']):addr[a]=[x+y for x,y in zip(addr[a],row['values'])]
 a=row['location'][0];flat[a]=[x+y for x,y in zip(flat[a],row['values'])]
assert dict(flat)=={'0xbccc96':[1,0]}
result={'basis':'independent source reading + Python standard library; no author implementation/golden imported; upstream not executed','upstream':'dbd0ed30aa888a30e21ba83b9831ac0e80d41022','scope':'fixed full fixtures; no focus/ignore, nonmean, no extra divide_by; report total captured before address graph aggregation','files':manifest,'source':s,'base':b,'sourceTotals':st,'baseTotals':bt,'ratios':ratios,'ratioFractions':[[bt[i],st[i]] for i in range(2)],'roundedSourceTotals':total(scaled),'comparisonRows':comparison,'branches':branches,'normalizedAddressCumulative':dict(addr),'normalizedAddressFlat':dict(flat),'sourceAddressPositions':sum(len(r['rawAddresses']) for r in s['rows']),'baseAddressPositions':len(b['rows'][0]['rawAddresses']),'sourceUniqueLocations':len(locs)}
(out/'derivation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:result[k] for k in ['sourceTotals','baseTotals','ratioFractions','roundedSourceTotals','comparisonRows']},indent=2))
print('report denominators', {k:v['reportDenominators'] for k,v in branches.items()})

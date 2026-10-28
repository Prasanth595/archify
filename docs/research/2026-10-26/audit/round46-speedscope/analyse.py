#!/usr/bin/env python3
"""Analyse only this archived native export; not a general profile importer."""
from pathlib import Path
import collections, hashlib, json, math
r=Path(__file__).resolve().parent
raw=(r/'export/native-1.speedscope.json').read_bytes()
assert raw==(r/'export/native-2.speedscope.json').read_bytes()
original=json.loads((r/'source/sample/profiles/Firefox/61/recursion.json').read_text())
d=json.loads(raw);p=d['profiles'][0];frames=d['shared']['frames']
assert len(d['profiles'])==1 and d['activeProfileIndex']==0
assert p['type']=='evented' and p['unit']=='milliseconds'
own=collections.defaultdict(float);total=collections.defaultdict(float);naive=collections.defaultdict(float)
stack=[];previous=p['startValue'];represented=0
for event in p['events']:
    duration=event['at']-previous
    assert duration>=0
    if stack:
        represented+=duration
        own[stack[-1]]+=duration
        for frame in set(stack):total[frame]+=duration
        for frame in stack:naive[frame]+=duration
    if event['type']=='O':stack.append(event['frame'])
    else:
        assert event['type']=='C' and stack.pop()==event['frame']
    previous=event['at']
assert not stack and previous<=p['endValue']
rows=[]
for i,frame in enumerate(frames):
    rows.append({'name':frame['name'],'self_ms':own[i],'total_ms_unique_per_interval':total[i],
                 'total_ms_if_recursive_occurrences_added':naive[i]})
before=json.loads((r/'browser/sandwich-before.json').read_text())['rows']
after=json.loads((r/'browser/sandwich-after-zoom.json').read_text())['rows']
collapsed=json.loads((r/'browser/sandwich-recursion-collapsed.json').read_text())['rows']
assert before==after==collapsed
byname={x['name']:x for x in rows}
assert math.isclose(byname['main']['total_ms_unique_per_interval'],11.149112000013702,abs_tol=1e-9)
assert math.isclose(byname['alpha']['total_ms_unique_per_interval'],9.954629999992903,abs_tol=1e-9)
assert math.isclose(byname['beta']['total_ms_unique_per_interval'],8.962158999987878,abs_tol=1e-9)
assert math.isclose(sum(own.values()),represented,abs_tol=1e-9)
zoom=json.loads((r/'browser/time-order-zoom.json').read_text())
assert '4.1%' in zoom['text'] and '11.15ms' in zoom['text']
result={'exporter':d['exporter'],'exportSha256':hashlib.sha256(raw).hexdigest(),'twoExportsByteIdentical':True,
        'source':'Firefox fixture; importer reconstructs open/close intervals from sampled stacks',
        'sourceSampleCount':len(original['profile']['threads'][0]['samples']['data']),
        'sourceThread':original['profile']['threads'][0]['name'],'exportEventCount':len(p['events']),
        'unit':p['unit'],'range':[p['startValue'],p['endValue']],'representedStackWeightMs':represented,
        'mainPercentOfExportRange':100*byname['main']['total_ms_unique_per_interval']/(p['endValue']-p['startValue']),
        'mainPercentOfRepresentedStacks':100*byname['main']['total_ms_unique_per_interval']/represented,
        'frames':rows,'sandwichRows':before,'rowsUnchangedAfterZoomAndRecursionCollapse':True,
        'notEstablished':['original issue reproduction','real function invocation counts','true entry/exit instrumentation','reader benefit','deployment commit identity']}
print(json.dumps(result,ensure_ascii=False,indent=2))

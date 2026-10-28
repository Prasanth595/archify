"""Summarize stored native DOM measurements; does not execute Quarto."""
from pathlib import Path
import json
r=Path(__file__).resolve().parent
s=json.loads((r/'states/05-geometry.json').read_text())
t=json.loads((r/'states/04-toggle-keyboard.json').read_text())
before=json.loads((r/'states/03-selected.json').read_text())
band,block=s['band'],s['source']
assert s['lineIds']==['annotated-cell-1-'+str(n) for n in [4,5,6,7]]
assert t['active']=={'active':['1'],'bandCount':1}
assert t['cleared']=={'active':[],'bandCount':0}
assert t['tab']['tag']=='A' and t['tab']['text']=='HTML styles'
assert all(x['tabIndex']==-1 for x in before['selected'])
summary={
 'scope':'Archived native browser observations only; not upstream test results',
 'url':s['url'],'generator':s['generator'],'deploymentCommit':'unknown',
 'selectedRelativeLines':[4,5,6,7],
 'horizontalOverflowPx':{'left':max(0,block['x']-band['x']),'right':max(0,band['x']+band['width']-block['x']-block['width'])},
 'verticalExtraPx':{'above':s['lines'][0]['box']['y']-band['y'],'below':band['y']+band['height']-s['lines'][-1]['box']['y']-s['lines'][-1]['box']['height']},
 'toggle':{'selectedOne':t['active'],'cleared':t['cleared']},
 'keyboard':{'start':'first code copy button','key':'Tab','nextElementText':t['tab']['text'],'annotationDtTabIndex':[x['tabIndex'] for x in before['selected']]},
 'nativeScriptSignals':s['nativeScriptSignals'],
 'limitations':['No Quarto build or upstream tests','No screen-reader or all-formats acceptance','No code execution or source-revision binding inferred from line highlights'],
}
print(json.dumps(summary,indent=2))

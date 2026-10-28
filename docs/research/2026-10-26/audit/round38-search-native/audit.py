"""Audit archived evidence integrity; this is not a UI acceptance test."""
from pathlib import Path
import hashlib,json,re
root=Path(__file__).resolve().parent
sources=json.loads((root/'sources/manifest.json').read_text())
for s in sources:
 b=(root/'sources'/s['project']/s['path']).read_bytes()
 assert len(b)==s['bytes'] and hashlib.sha256(b).hexdigest()==s['sha256']
 assert hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==s['gitBlob']
pngs=sorted((root/'browser').glob('*.png'))
for p in pngs:
 b=p.read_bytes();assert b[:8]==b'\x89PNG\r\n\x1a\n';assert (int.from_bytes(b[16:20],'big'),int.from_bytes(b[20:24],'big'))==(1440,900)
keyboard=json.loads((root/'browser/19-timeline.json').read_text());pointer=json.loads((root/'browser/17-observation.json').read_text())
arrival=json.loads((root/'browser/13-arrival.json').read_text());target=[x for x in arrival['groups'] if x['attrs'].get('data-id')=='boutique.checkout' and x['attrs'].get('aria-roledescription')=='node'];assert len(target)==1
constants={}
for version in ['likec4','likec4-round26']:
 text=(root/'sources'/version/'packages/diagram/src/likec4diagram/state/machine.actions.ts').read_text();constants[version]=int(re.search(r'const AUTO_UNFOCUS_DELAY = (\d+)',text).group(1))
result={'scope':'archived integrity and observed facts only; navigation acceptance remains unconfirmed','sourceFiles':len(sources),'pngFiles':len(pngs),'pngSize':[1440,900],'arrivalUrl':arrival['url'],'arrivalTargetCount':len(target),'keyboardSamples':len(keyboard['samples']),'keyboardFirstMs':keyboard['samples'][0]['ms'],'keyboardLastMs':keyboard['samples'][-1]['ms'],'keyboardUrls':sorted({s['url'] for s in keyboard['samples']}),'pointerDistinctStates':len(pointer['timeline']['samples']),'sourceOnlyAutoUnfocusMs':constants}
print(json.dumps(result,ensure_ascii=False,indent=2))

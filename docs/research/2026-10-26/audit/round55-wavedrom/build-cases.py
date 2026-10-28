import ast,copy,json,pathlib,re
r=pathlib.Path(__file__).resolve().parent
html=(r/'sources/tutorial.html').read_text()
section=html.split('<h3>Sharp lines</h3>',1)[1]
raw=re.search(r'<script type="WaveDrom">(.*?)</script>',section,re.S).group(1)
(r/'cases').mkdir(exist_ok=True)
(r/'cases/original.json5').write_text(raw)
# This reviewed tutorial subset is a literal object; do not eval arbitrary JavaScript.
base=ast.literal_eval(re.sub(r'\b([A-Za-z_]\w*)\s*:',r'"\1":',raw))
cases={'baseline':base,'phase-zero':copy.deepcopy(base),'scale-two':copy.deepcopy(base)}
for lane in cases['phase-zero']['signal']:
 if 'phase' in lane:lane['phase']=0
cases['scale-two']['config']={'hscale':2}
for name,data in cases.items():(r/'cases'/f'{name}.json').write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps({name:len(data['signal']) for name,data in cases.items()}))

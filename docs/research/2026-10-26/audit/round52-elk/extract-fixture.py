import pathlib,re,json
root=pathlib.Path(__file__).resolve().parent
source=(root/'sources/test-browser-draw2.html').read_text()
raw=source.split('const graph = ',1)[1].split('\n    \n    elk.layout(graph)',1)[0].strip()
# This fixed upstream fixture contains only literals; no code is evaluated.
raw=re.sub(r"'([^']*)'",lambda m:json.dumps(m.group(1)),raw)
raw=re.sub(r'([{,]\s*)([A-Za-z_$][\w$]*)(\s*:)',r'\1"\2"\3',raw)
raw=re.sub(r',\s*([}\]])',r'\1',raw)
graph=json.loads(raw)
(root/'input-original.json').write_text(json.dumps(graph,indent=2)+'\n')
print('extracted literal graph, no upstream HTML or script executed')

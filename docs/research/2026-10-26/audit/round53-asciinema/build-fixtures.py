import pathlib,json
r=pathlib.Path(__file__).resolve().parent
source=(r/'sources/tests__assets__long.cast').read_bytes()
(r/'original.cast').write_bytes(source)
lines=source.decode().splitlines();out=[lines[0]]
for line in lines[1:]:
 out.append(line);event=json.loads(line)
 if event[0] in [6.0,12.0]:out.append(json.dumps([event[0],'m','source t='+str(int(event[0]))+' s']))
(r/'embedded.cast').write_text('\n'.join(out)+'\n')
cases=[
 dict(id='original-external',title='Original clock · external markers',cast='original.cast',options=dict(markers=[[6,'source t=6 s'],[12,'source t=12 s']])),
 dict(id='compressed-external',title='Idle limit 1 s · external markers',cast='original.cast',options=dict(idleTimeLimit=1,markers=[[6,'source t=6 s'],[12,'source t=12 s']])),
 dict(id='compressed-embedded',title='Idle limit 1 s · embedded markers',cast='embedded.cast',options=dict(idleTimeLimit=1))]
(r/'cases.json').write_text(json.dumps(cases,indent=2)+'\n')

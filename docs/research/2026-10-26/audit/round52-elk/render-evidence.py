import pathlib,json,html
r=pathlib.Path(__file__).resolve().parent
colors={'e1':'#64748b','e2':'#0f766e','e3':'#8b5cf6','e4':'#a16207','e5':'#475569','e6':'#475569'}
def collect(n,px=0,py=0):
 x,y=px+n.get('x',0),py+n.get('y',0)
 nodes=[(n,x,y)]
 for c in n.get('children',[]):nodes+=collect(c,x,y)
 return nodes
def drawing(g):
 nodes=collect(g); positions={n['id']:(x,y) for n,x,y in nodes};parts=[]
 for n,x,y in nodes[1:]:
  compound=bool(n.get('children'))
  fill='#eef2ff' if compound else '#fff'
  parts.append(f'<rect x="{x}" y="{y}" width="{n["width"]}" height="{n["height"]}" fill="{fill}" stroke="#94a3b8" rx="2"/>')
 for n,nx,ny in nodes:
  for e in n.get('edges',[]):
   ox,oy=positions[e.get('container',n['id'])]
   for s in e.get('sections',[]):
    pts=[s['startPoint']]+s.get('bendPoints',[])+[s['endPoint']]
    points=' '.join(f'{ox+p["x"]},{oy+p["y"]}' for p in pts)
    parts.append(f'<polyline data-edge="{e["id"]}" points="{points}" fill="none" stroke="{colors[e["id"]]}" stroke-width="1.8" marker-end="url(#arrow-{e["id"]})"/>')
 for n,x,y in nodes[1:]:
  compound=bool(n.get('children'));tx=x+5 if compound else x+n['width']/2;ty=y+10 if compound else y+n['height']/2+4
  anchor='start' if compound else 'middle'
  parts.append(f'<text x="{tx}" y="{ty}" text-anchor="{anchor}" font-size="{9 if compound else 14}">{n["id"]}</text>')
  for p in n.get('ports',[]):
   a,b=x+p['x'],y+p['y'];side=p.get('layoutOptions',{}).get('org.eclipse.elk.port.side','auto')
   parts.append(f'<rect x="{a}" y="{b}" width="{p["width"]}" height="{p["height"]}" fill="#fef3c7" stroke="#a16207"/>')
   # Research harness labels; node/port geometry and all paths are untouched ELK output.
   parts.append(f'<text x="{a-4}" y="{b+p["height"]+14}" text-anchor="end" font-size="11" fill="#92400e">{p["id"]}</text>')
 defs=''.join(f'<marker id="arrow-{k}" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8" fill="{v}"/></marker>' for k,v in colors.items())
 # Common 1.35 CSS px / ELK unit across all three variants.
 return f'<svg width="625" height="395" viewBox="-25 -22 463 293" role="img"><defs>{defs}</defs>'+''.join(parts)+'</svg>'
summaries=[]
for name,title,description in [
 ('original','A · Official fixture','INCLUDE_CHILDREN; ports may move'),
 ('fixed-side','B · Fixed port sides','Same graph; p1 WEST, p2 NORTH'),
 ('separate-children','C · Separate children','Same graph; SEPARATE_CHILDREN')]:
 g=json.loads((r/f'output-{name}.json').read_text());nodes=collect(g);edges=[e for n,x,y in nodes for e in n.get('edges',[])];missing=[e['id'] for e in edges if not e.get('sections')]
 summary=dict(variant=name,nodeCount=len(nodes)-1,portCount=sum(len(n.get('ports',[])) for n,x,y in nodes),edgeCount=len(edges),routedEdges=len(edges)-len(missing),missingSections=missing,width=g['width'],height=g['height'],ports=[dict(node=n['id'],id=p['id'],x=p['x'],y=p['y']) for n,x,y in nodes for p in n.get('ports',[])])
 summaries.append(summary)
 alert='<strong class="warn">e2 remains in JSON but has no route sections.</strong>' if missing else '<strong class="ok">All six edges have route sections.</strong>'
 links=' · '.join(f'<a href="{f}">{label}</a>' for label,f in [('input',f'input-{name}.json'),('output',f'output-{name}.json')])
 page='<!doctype html><meta charset="utf-8"><title>ELK port / hierarchy audit — '+name+'</title><style>body{margin:0;background:#f4f6fa;color:#182438;font:16px system-ui}main{max-width:1280px;margin:32px auto}h1{font-size:28px;margin:0 0 8px}.sub{color:#526175;line-height:1.5}nav{display:flex;gap:20px;margin:20px 0}a{color:#375cc5}.grid{display:grid;grid-template-columns:700px 1fr;gap:24px}.card{background:white;border:1px solid #d7dee9;border-radius:12px;padding:24px}svg{display:block;background:#fff}text{font-family:system-ui;fill:#182438}.warn{color:#a13020}.ok{color:#17624b}li{margin:13px 0;line-height:1.5}code{font-size:14px}footer{margin-top:20px;color:#526175;font-size:14px;line-height:1.6}</style><main><h1>'+title+'</h1><div class="sub">'+description+' · elkjs 0.12.1 · 7 nodes / 2 named ports / 6 edges</div><nav>'+''.join(f'<a href="{v}.html">{v}</a>' for v in ['original','fixed-side','separate-children'])+'</nav><div class="grid"><section class="card">'+drawing(g)+'</section><section class="card"><h2>Inspect the same relationships</h2><p>'+alert+'</p><ul><li><code>e2: n0 → n4</code> crosses both n2 and n3 boundaries. When routed, its line is teal.</li><li><code>e3: n1 → p2</code> enters the named port; <code>e4: p2 → n6</code> continues inside n2.</li><li><code>e5: n6 → n6</code> is the self-loop.</li><li>Geometry extent: '+str(g['width'])+' × '+str(g['height'])+'; routed edges: '+str(len(edges)-len(missing))+'/6.</li></ul><p>'+links+'</p></section></div><footer>Actual ELK engine output, drawn by a small research harness. Node and port labels are harness styling; all node/port coordinates and routed points come from the saved output. This is not the ELK Live UI or an Archify rendering.<br>Fixture: kieler/elkjs 624ae90aa37110033a8af59c5ccbb292708b4317, test/examples/test-browser-draw2.html. EPL-2.0 / conditional secondary GPL terms retained in sources/.</footer></main>'
 (r/f'{name}.html').write_text(page+'\n')
(r/'summaries.json').write_text(json.dumps(summaries,indent=2)+'\n')
print(json.dumps(summaries,indent=2))

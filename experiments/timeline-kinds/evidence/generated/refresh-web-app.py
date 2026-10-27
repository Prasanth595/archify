from pathlib import Path
import re, hashlib
p=Path('examples/web-app.html')
s=p.read_text(); t=Path('archify/assets/template.html').read_text()
svg=lambda x: re.search(r'<svg\b[\s\S]*?</svg>', x).group()
before=hashlib.sha256(svg(s).encode()).hexdigest()
for tag in ('style','script'):
    pat=re.compile(r'<'+tag+r'\b[^>]*>[\s\S]*?</'+tag+r'>')
    target=[m for m in pat.finditer(s) if 'type="application/json"' not in m.group() and 'Sample Web App' not in m.group() and (tag != 'style' or m.start() < s.index('</head>'))]
    source=[m.group() for m in pat.finditer(t) if 'type="application/json"' not in m.group() and '[PROJECT NAME]' not in m.group()]
    assert len(target)==len(source), (tag,len(target),len(source))
    for match, replacement in reversed(list(zip(target,source))): s=s[:match.start()]+replacement+s[match.end():]
assert hashlib.sha256(svg(s).encode()).hexdigest()==before
p.write_text(s)
print('SVG SHA256 unchanged:',before)

from pathlib import Path
import subprocess,re,hashlib
script=Path('archify/scripts/render-examples.mjs').read_text()
names=re.findall(r"\['[^']+', '[^']+', '([^']+\.html)'\]",script)
assert len(names)==15, len(names)
for name in names:
    path='examples/'+name
    old=subprocess.check_output(['git','show','d5d979493bba650b3995836afd379cd249f2d0dd:'+path])
    new=Path(path).read_bytes()
    pattern=rb'<svg\b[\s\S]*?</svg>'
    a=re.search(pattern,old).group(); b=re.search(pattern,new).group()
    print(path, 'identical' if a==b else 'DIFF', hashlib.sha256(b).hexdigest())
    assert a==b,path

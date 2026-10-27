from pathlib import Path
import subprocess,zipfile
changes=subprocess.check_output(['git','diff','--name-only','--','archify']).decode().splitlines()
with zipfile.ZipFile('archify.zip') as z:
 names=z.namelist()
 bad=[n for n in names if any(p in ('experiments','node_modules') for p in n.split('/'))]
 assert not bad,bad
 for p in changes:
  name=p
  assert z.read(name)==Path(p).read_bytes(),p
 print('archive entries:',len(names),'excluded matches:',len(bad),'modified tracked package files verified:',len(changes))

from pathlib import Path
entries=Path('/tmp/archify-round13-generated/inventory.stdout').read_text().splitlines()
bad=[x for x in entries if any(part in ('experiments','node_modules') for part in x.split('/'))]
print('entries:',len(entries),'excluded matches:',len(bad))
assert not bad, bad

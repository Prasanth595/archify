#!/usr/bin/env python3
"""Replay four fixed jq cases; no packages, installations, or user data."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import time

source = Path(__file__).resolve().parent
dest = Path(sys.argv[1]).resolve()
dest.mkdir(parents=True, exist_ok=False)
data = source.joinpath('input.json').read_bytes()
dest.joinpath('input.json').write_bytes(data)
cases = ['bind-owners', 'pipe-owners', 'bind-jobs', 'lost-root']
records = []
binary = Path('/usr/bin/jq')
for name, args in [('version', ['--version'])] + [
    (f'{case}-{kind}', ['-c', '-f', str(dest / f'{case}.{kind}.jq'), str(dest / 'input.json')])
    for case in cases for kind in ['plain', 'marked']
]:
    if name != 'version':
        case, kind = name.rsplit('-', 1)
        dest.joinpath(f'{case}.{kind}.jq').write_bytes(source.joinpath(f'{case}.{kind}.jq').read_bytes())
    argv = [str(binary), *args]
    start = time.perf_counter()
    result = subprocess.run(argv, capture_output=True)
    elapsed = time.perf_counter() - start
    dest.joinpath(name + '.stdout').write_bytes(result.stdout)
    dest.joinpath(name + '.stderr').write_bytes(result.stderr)
    records.append({'name': name, 'argv': argv, 'exit': result.returncode,
                    'elapsed_seconds': elapsed})
dest.joinpath('commands.json').write_text(json.dumps({
    'binary': str(binary), 'binary_sha256': hashlib.sha256(binary.read_bytes()).hexdigest(),
    'commands': records}, indent=2) + '\n')
events = {}
for case in cases:
    plain, marked = [next(r for r in records if r['name'] == f'{case}-{kind}') for kind in ['plain', 'marked']]
    assert plain['exit'] == marked['exit'] == (5 if case == 'pipe-owners' else 0), case
    assert dest.joinpath(case+'-plain.stdout').read_bytes() == dest.joinpath(case+'-marked.stdout').read_bytes(), case
    lines = dest.joinpath(case+'-marked.stderr').read_text().splitlines()
    events[case] = [json.loads(line)[1] for line in lines if line.startswith('["DEBUG:",')]
    remaining = '\n'.join(line for line in lines if not line.startswith('["DEBUG:",'))
    assert remaining == dest.joinpath(case+'-plain.stderr').read_text().rstrip('\n'), case
dest.joinpath('observed.json').write_text(json.dumps(events, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'commands':len(records),'event_counts':{k:len(v) for k,v in events.items()},'output':str(dest)}))

#!/usr/bin/env python3
import argparse, datetime, hashlib, json, os, subprocess, time
from pathlib import Path

base = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument('--cargo', required=True)
parser.add_argument('--rustc', required=True)
parser.add_argument('--output', required=True, help='new directory inside results')
args = parser.parse_args()
cargo, rustc = map(lambda p: str(Path(p).resolve(strict=True)), (args.cargo, args.rustc))
out = Path(args.output).resolve()
if out.parent != (base / 'results').resolve(): raise SystemExit('output must be a new child of results')
out.mkdir(parents=True, exist_ok=False)
env = os.environ.copy()
env.update({'RUSTC': rustc, 'CARGO_HOME': str(out / 'cargo-home'), 'CARGO_TARGET_DIR': str(out / 'target'), 'PATH': str(Path(cargo).parent) + os.pathsep + env.get('PATH', ''), 'CARGO_NET_OFFLINE': 'true'})

def execute(label, argv, cwd):
    start = datetime.datetime.now(datetime.timezone.utc).isoformat(); tick = time.monotonic()
    proc = subprocess.run(argv, cwd=cwd, env=env, capture_output=True)
    duration = time.monotonic() - tick; end = datetime.datetime.now(datetime.timezone.utc).isoformat()
    (out / f'{label}.stdout').write_bytes(proc.stdout)
    (out / f'{label}.stderr').write_bytes(proc.stderr)
    record = {'argv': argv, 'cwd': str(cwd), 'start_utc': start, 'end_utc': end, 'duration_seconds': duration, 'exit': proc.returncode}
    (out / f'{label}.json').write_text(json.dumps(record, indent=2) + '\n')
    return record

def inventory():
    items = {}
    for p in sorted((base / 'fixtures').rglob('*')):
        if p.is_file():
            b = p.read_bytes(); items[str(p.relative_to(base))] = {'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
    return items

# Refuse to replace previous Cargo.lock files; reproducibility uses fresh copies.
for v in (1, 2):
    if (base / 'fixtures' / f'resolver{v}' / 'foo' / 'Cargo.lock').exists(): raise SystemExit('existing lockfile: use fresh fixtures, do not overwrite')
pre = inventory()
versions = [execute('cargo-version', [cargo, '-vV'], base), execute('rustc-version', [rustc, '-vV'], base)]
commands = [ ('tree', []), ('normal-build', ['-e','normal,build']), ('features', ['-e','features']), ('inverse-optdep', ['-e','features','-i','optdep']), ('package-bar', ['-p','bar']), ('duplicates', ['-d']), ('features-no-dedupe', ['-e','features','--no-dedupe']) ]
records = []
for v in (1,2):
    cwd = base / 'fixtures' / f'resolver{v}' / 'foo'
    for label, flags in commands:
        rec = execute(f'resolver{v}-{label}', [cargo, 'tree', '--offline', *flags], cwd)
        records.append(rec)
summary = {'cargo': cargo, 'rustc': rustc, 'pre_inventory': pre, 'post_inventory': inventory(), 'versions': versions, 'commands': records, 'target_exists': (out / 'target').exists(), 'fixture_target_paths': [str(p) for p in (base / 'fixtures').rglob('target')], 'all_commands_exit_zero': all(r['exit'] == 0 for r in records)}
(out / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
raise SystemExit(0 if summary['all_commands_exit_zero'] and all(r['exit'] == 0 for r in versions) else 1)

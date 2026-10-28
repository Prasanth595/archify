import base64, hashlib, json, os, pathlib, subprocess, sys, time

root = pathlib.Path(sys.argv[1]).resolve()
root.mkdir(exist_ok=False)
repo = root / 'repo'
repo.mkdir()
empty_template = root / 'empty-template'
empty_template.mkdir()
env = dict(os.environ, GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=os.devnull,
           GIT_TERMINAL_PROMPT='0', LC_ALL='C', TZ='UTC')
records = []
def git(label, args, author='Fixture Author', tick=0):
    identity = dict(env, GIT_AUTHOR_NAME=author, GIT_COMMITTER_NAME=author,
                    GIT_AUTHOR_EMAIL='fixture@example.invalid', GIT_COMMITTER_EMAIL='fixture@example.invalid',
                    GIT_AUTHOR_DATE=f'2026-01-01T00:00:{tick:02d}+0000',
                    GIT_COMMITTER_DATE=f'2026-01-01T00:00:{tick:02d}+0000')
    command = ['git', '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false'] + args
    started = time.monotonic()
    result = subprocess.run(command, cwd=repo, env=identity, capture_output=True)
    records.append(dict(label=label, command=command, exit=result.returncode,
                        stdout_b64=base64.b64encode(result.stdout).decode(),
                        stderr_b64=base64.b64encode(result.stderr).decode(),
                        elapsedSeconds=time.monotonic()-started))
    (root / 'transcript.jsonl').write_text(''.join(json.dumps(r)+'\n' for r in records))
    if result.returncode: raise RuntimeError((label, result.stderr.decode()))
    return result.stdout.decode()

git('version', ['--version'])
git('init', ['init', '-b', 'fixture', '--template='+str(empty_template)])
snapshots = {
    'A': 'timeout_ms=800\nretry_limit=3\ncache_enabled=True\ntransport="https"\n',
    'B': 'timeout_ms=800\nretry_limit=5\ncache_enabled=True\ntransport="https"\n',
    'C': 'timeout_ms = 800\nretry_limit = 4\ncache_enabled = True\ntransport = "https"\n# 🦋🦋🦋\n',
}
commits = {}
for i, (name, source) in enumerate(snapshots.items(), 1):
    (repo/'config.py').write_text(source)
    git('add-'+name, ['add', 'config.py'])
    git('commit-'+name, ['commit', '-m', {'A':'Initial configuration','B':'Adjust retry value','C':'Format configuration and change retry value'}[name]], 'Fixture '+name, i)
    commits[name] = git('sha-'+name, ['rev-parse','HEAD']).strip()
(repo/'.git-blame-ignore-revs').write_text(commits['C']+'\n')
git('add-D', ['add','.git-blame-ignore-revs'])
git('commit-D', ['commit','-m','Record ignored revision'], 'Fixture D', 4)
commits['D'] = git('sha-D', ['rev-parse','HEAD']).strip()
base = ['blame', '--root', '--date=iso-strict']
off = ['-c','blame.markIgnoredLines=false','-c','blame.markUnblamableLines=false']
on = ['-c','blame.markIgnoredLines=true','-c','blame.markUnblamableLines=true']
queries = {
    'plain-default': base+['--','config.py'],
    'plain-ignored-unmarked': off+base+['--ignore-rev',commits['C'],'--','config.py'],
    'plain-ignored-marked': on+base+['--ignore-rev',commits['C'],'--','config.py'],
    'porcelain-default': off+base+['--line-porcelain','--','config.py'],
    'porcelain-ignored-unmarked': off+base+['--line-porcelain','--ignore-rev',commits['C'],'--','config.py'],
    'porcelain-ignored-marked': on+base+['--line-porcelain','--ignore-rev',commits['C'],'--','config.py'],
    'ignore-file-explicit': on+base+['--line-porcelain','--ignore-revs-file','.git-blame-ignore-revs','--','config.py'],
    'actual-change': ['diff',commits['B'],commits['C'],'--','config.py'],
    'parents': ['log','--format=%H %P %s'],
    'status': ['status','--porcelain'],
}
outputs = {label:git(label,args) for label,args in queries.items()}
(root/'snapshots.json').write_text(json.dumps(snapshots,ensure_ascii=False,indent=2)+'\n')
(root/'commits.json').write_text(json.dumps(commits,indent=2)+'\n')
(root/'outputs.json').write_text(json.dumps(outputs,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'root':str(root),'commands':len(records),'commits':commits},indent=2))
print(outputs['plain-ignored-marked'])

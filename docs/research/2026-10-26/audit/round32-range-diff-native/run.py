"""Original, bounded Git range-diff observation. Never reads or modifies a user repository."""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time

out = Path(sys.argv[1]).resolve()
out.mkdir()  # refuse an existing output directory
repo = out / "repository"
repo.mkdir()
logs = out / "logs"
logs.mkdir()
env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
env.update({
    "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": os.devnull,
    "GIT_ATTR_NOSYSTEM": "1", "GIT_TERMINAL_PROMPT": "0",
    "GIT_AUTHOR_NAME": "Archify Research", "GIT_AUTHOR_EMAIL": "research@example.invalid",
    "GIT_COMMITTER_NAME": "Archify Research", "GIT_COMMITTER_EMAIL": "research@example.invalid",
    "GIT_AUTHOR_DATE": "2026-10-01T00:00:00+00:00", "GIT_COMMITTER_DATE": "2026-10-01T00:00:00+00:00",
    "LC_ALL": "C", "TZ": "UTC",
})
git = shutil.which("git")
assert git
prefix = [git, "--no-pager", "-c", "core.hooksPath=" + os.devnull,
          "-c", "core.autocrlf=false", "-c", "color.ui=false", "-c", "core.abbrev=12",
          "-c", "commit.gpgSign=false", "-c", "init.templateDir="]
records = []

def run(label, *args, expected=0):
    start = time.perf_counter()
    result = subprocess.run(prefix + list(args), cwd=repo, env=env, capture_output=True)
    stdout = logs / (label + ".stdout")
    stderr = logs / (label + ".stderr")
    stdout.write_bytes(result.stdout)
    stderr.write_bytes(result.stderr)
    records.append({"label": label, "argv": prefix + list(args), "cwd": "repository",
                    "exitCode": result.returncode, "expectedExitCode": expected,
                    "seconds": time.perf_counter() - start,
                    "stdout": str(stdout.relative_to(out)), "stderr": str(stderr.relative_to(out)),
                    "stdoutSha256": hashlib.sha256(result.stdout).hexdigest(),
                    "stderrSha256": hashlib.sha256(result.stderr).hexdigest()})
    (out / "commands.json").write_text(json.dumps(records, indent=2) + "\n")
    if result.returncode != expected:
        raise RuntimeError(f"{label}: exit {result.returncode}, expected {expected}")
    return result.stdout.decode().strip()

def write(path, text):
    target = repo / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text)

def commit(label, message):
    run(label + "-stage", "add", "--all")
    run(label + "-commit", "commit", "-m", message)
    sha = run(label + "-sha", "rev-parse", "HEAD")
    run(label + "-tag", "tag", label)
    return sha

def config(attempts):
    return f'''# Original synthetic review fixture; not executed application code.
def options():
    return {{
        "attempts": {attempts},
        "timeout_seconds": 10,
        "backoff_seconds": 0,
    }}
'''

version = run("version", "--version")
run("init", "init", "--initial-branch=fixture-base", "--object-format=sha1")
write("worker.py", config(1))
ids = {"base": commit("base", "Create review fixture")}
run("switch-old", "switch", "-c", "series-old")
write("worker.py", config(3))
ids["old-retry"] = commit("old-retry", "Limit retry attempts")
write("logging.conf", "level=INFO\nformat=plain\n")
ids["old-logging"] = commit("old-logging", "Add logging configuration")
write("NOTES.md", "Review retry settings before use.\n")
ids["old-tip"] = commit("old-tip", "Add review note")
run("switch-new", "switch", "-c", "series-new", "base")
write("logging.conf", "level=INFO\nformat=plain\n")
ids["new-logging"] = commit("new-logging", "Add logging configuration")
write("worker.py", config(4))
ids["new-retry"] = commit("new-retry", "Limit retry attempts")
write("metrics.conf", "enabled=false\nformat=counter\n")
ids["new-tip"] = commit("new-tip", "Add metrics configuration")
run("switch-message", "switch", "-c", "series-message", "base")
write("worker.py", config(3))
ids["message-retry"] = commit("message-retry", "Set the retry cap")

run("range-default", "range-diff", "--no-color", "--no-dual-color", "base", "old-tip", "new-tip")
run("range-factor0", "range-diff", "--creation-factor=0", "--no-color", "--no-dual-color", "base", "old-tip", "new-tip")
run("range-message", "range-diff", "--no-color", "--no-dual-color", "base", "old-retry", "message-retry")
run("tip-diff", "diff", "--no-ext-diff", "--no-textconv", "old-tip", "new-tip")
run("old-series", "log", "--reverse", "--format=fuller", "--no-ext-diff", "--no-textconv", "--patch", "base..old-tip")
run("new-series", "log", "--reverse", "--format=fuller", "--no-ext-diff", "--no-textconv", "--patch", "base..new-tip")
run("parents", "log", "--all", "--format=%H %P %s")
run("logging-ancestor", "merge-base", "--is-ancestor", "old-logging", "new-logging", expected=1)
run("message-tree-diff", "diff", "--exit-code", "old-retry", "message-retry")
run("remotes", "remote", "-v")
run("final-status", "status", "--porcelain")
for label in ids:
    dest = out / "snapshots" / label
    dest.mkdir(parents=True)
    names = run("files-" + label, "ls-tree", "-r", "--name-only", label).splitlines()
    for i, name in enumerate(names):
        run("blob-" + label + "-" + str(i), "show", label + ":" + name)
        target = dest / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((logs / ("blob-" + label + "-" + str(i) + ".stdout")).read_bytes())
(out / "identity.json").write_text(json.dumps({"gitVersion": version, "commits": ids,
    "fixture": "original synthetic source, not an upstream test or natural user repository",
    "applicationExecuted": False, "gitInstalled": False, "globalConfigDisabled": True}, indent=2) + "\n")
print(json.dumps({"out": str(out), "version": version, "commands": len(records), "commits": ids}, indent=2))

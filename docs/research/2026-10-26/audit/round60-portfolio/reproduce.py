#!/usr/bin/env python3
"""Read-only Git object inventory and authored patch checks at frozen revisions."""
import hashlib, json, os, subprocess, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
OLD = "d5d979493bba650b3995836afd379cd249f2d0dd"
DEV = "847146aeb93b492592adb78dc220f57e4a8b4636"
def git(*args, env=None, check=True):
    return subprocess.run(["git", *args], cwd=ROOT, env=env,
                          capture_output=True, check=check)
def value(*args):
    return git(*args).stdout.decode().strip()
def digest(ref, path):
    data = git("show", f"{ref}:{path}").stdout
    return {"blob": value("rev-parse", f"{ref}:{path}"),
            "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
heads = dict(line.split()[::-1] for line in (HERE/"remote-heads.tsv").read_text().splitlines())
assert heads["refs/heads/dev"] == DEV
old_inventory = json.loads((HERE.parent/"round27-branch-inventory.json").read_text())
product_paths = {
 "source-link-context": ["viewer/focus.js", "test/repository-evidence-browser.test.mjs"],
 "keyboard-traversal": ["archify/explainer/browser-check.mjs", "test/explainer-browser.test.mjs"],
 "tree-roles": [
  "archify/renderers/tree/render-tree.mjs", "viewer/template.source.html",
  "viewer/semantic-lens.js", "viewer/viewer.css",
  "test/tree-branches-browser.test.mjs", "test/tree-rendering.test.mjs",
  *[f"archify/locales/{lang}.json" for lang in ["ar","en","es","ko","zh-CN","zh-TW"]],
  *[f"archify/examples/locales/{lang}.json" for lang in ["de","fr","it","ja","pt","ru"]]
 ]}
out = {"dev": DEV, "previousReviewDev": OLD, "remoteHeads": len(heads),
       "scope": "Frozen Git objects and patch applicability only; no checkout, merge, runtime test, build, browser or CI.",
       "branches": []}
for old in old_inventory["branches"]:
    branch = old["branch"]
    head = heads["refs/heads/"+branch]
    base = value("merge-base", DEV, head)
    counts = value("rev-list", "--left-right", "--count", DEV+"..."+head).split()
    row = {"id": old["id"], "branch": branch, "head": head,
           "unchangedSinceRound27": head == old["head"],
           "mergeBaseWithDev": base, "devOnlyCommits": int(counts[0]),
           "headOnlyCommits": int(counts[1])}
    paths = product_paths.get(old["id"])
    if paths:
        row["authoredPaths"] = []
        for path in paths:
            before, current, candidate = [digest(ref,path) for ref in [OLD,DEV,head]]
            row["authoredPaths"].append({"path":path,"previousDev":before,"dev":current,
                "candidate":candidate,"devUnchangedSinceRound27":before==current})
        patch = git("diff","--binary",base,head,"--",*paths).stdout
        row["authoredPatchSha256"] = hashlib.sha256(patch).hexdigest()
        with tempfile.TemporaryDirectory(prefix="archify-round60-") as temp:
            patch_file = Path(temp)/"candidate.patch"
            patch_file.write_bytes(patch)
            env = {**os.environ, "GIT_INDEX_FILE":str(Path(temp)/"index")}
            git("read-tree", DEV, env=env)
            check = git("apply","--cached","--check",str(patch_file),env=env,check=False)
            row["patchCheck"] = {"command":"git read-tree DEV; git apply --cached --check candidate.patch (temporary GIT_INDEX_FILE)",
                "exitCode":check.returncode,"stdout":check.stdout.decode(),"stderr":check.stderr.decode(),
                "excludes":"Generated HTML, ZIP, gallery, experiment artifacts; not a complete merge check."}
    out["branches"].append(row)
print(json.dumps(out,ensure_ascii=False,indent=2))

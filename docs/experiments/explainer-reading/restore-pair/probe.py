"""Compare restore destinations in a disposable repository, never the caller's checkout."""
import json
import subprocess
import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory(prefix="archify-restore-probe-") as directory:
    root = Path(directory)
    def git(*args):
        return subprocess.run(["git", "-C", directory, "-c", "core.hooksPath=/dev/null", *args],
                              check=True, text=True, capture_output=True).stdout.strip()
    git("init", "--template=", "--initial-branch=example")
    file = root / "item.txt"
    file.write_text("A\n")
    git("add", "item.txt")
    git("-c", "user.name=Example", "-c", "user.email=example@example.invalid", "commit", "-m", "Example A")
    cases = [([], "B", "B"), (["--staged"], "A", "C"),
             (["--source=HEAD"], "B", "A"), (["--staged", "--worktree"], "A", "A")]
    output = {"git_version": git("--version"), "initial": {"HEAD": "A", "index": "B", "worktree": "C"}, "cases": []}
    for args, expected_index, expected_worktree in cases:
        file.write_text("B\n")
        git("add", "item.txt")
        file.write_text("C\n")
        git("restore", *args, "--", "item.txt")
        result = {"options": args, "HEAD": git("show", "HEAD:item.txt"),
                  "index": git("show", ":item.txt"), "worktree": file.read_text().strip()}
        assert result["HEAD"] == "A"
        assert result["index"] == expected_index, result
        assert result["worktree"] == expected_worktree, result
        output["cases"].append(result)
    print(json.dumps(output, indent=2))

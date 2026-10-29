#!/usr/bin/env python3
"""Create authored, metadata-only wheels and record two offline uv resolutions.

No installer, package import, registry request, or downloaded Python is used.
This is a Python-package analogue, not execution of the PubGrub Rust fixture.
"""
import argparse
import base64
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import time
import zipfile

ROOT = Path(__file__).resolve().parent


def digest(data):
    return hashlib.sha256(data).hexdigest()


def wheel(name, version, dependencies, directory):
    prefix = f"{name}-{version}.dist-info"
    metadata = (f"Metadata-Version: 2.1\nName: {name}\nVersion: {version}\n"
                + "".join(f"Requires-Dist: {dep}\n" for dep in dependencies) + "\n")
    members = {
        f"{prefix}/METADATA": metadata.encode(),
        f"{prefix}/WHEEL": b"Wheel-Version: 1.0\nGenerator: Archify research fixture\nRoot-Is-Purelib: true\nTag: py3-none-any\n\n",
    }
    record = io.StringIO(newline="")
    writer = csv.writer(record, lineterminator="\n")
    for name_in_zip, data in sorted(members.items()):
        encoded = base64.urlsafe_b64encode(hashlib.sha256(data).digest()).rstrip(b"=").decode()
        writer.writerow([name_in_zip, "sha256=" + encoded, len(data)])
    writer.writerow([f"{prefix}/RECORD", "", ""])
    members[f"{prefix}/RECORD"] = record.getvalue().encode()
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{name}-{version}-py3-none-any.whl"
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_STORED) as archive:
        for name_in_zip, data in sorted(members.items()):
            entry = zipfile.ZipInfo(name_in_zip, date_time=(1980, 1, 1, 0, 0, 0))
            entry.create_system = 3
            entry.external_attr = 0o100644 << 16
            archive.writestr(entry, data)
    return {"path": path.relative_to(ROOT).as_posix(), "sha256": digest(path.read_bytes()),
            "bytes": path.stat().st_size, "name": name, "version": str(version),
            "requires_dist": dependencies, "members": sorted(members)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("output", help="New evidence directory, relative to this script")
    args = parser.parse_args()
    out = ROOT / args.output
    out.mkdir(parents=True, exist_ok=False)
    uv = shutil.which("uv")
    if not uv:
        raise SystemExit("An already installed uv is required; no installation is attempted.")
    env = {key: os.environ[key] for key in ("PATH", "HOME", "TMPDIR") if key in os.environ}
    env["LC_ALL"] = "C"
    # No UV_*, PIP_*, VIRTUAL_ENV, or project environment is inherited.
    manifest = [wheel("root", 1, ["foo", "baz"], ROOT / "wheels/base"),
                wheel("baz", 1, [], ROOT / "wheels/base")]
    manifest += [wheel("foo", version, ["bar"], ROOT / "wheels/base") for version in range(1, 6)]
    manifest += [wheel("bar", 1, [], ROOT / "wheels/bar")]
    (ROOT / "requirements.in").write_text("root==1\n")
    (ROOT / "uv.toml").write_text("# Explicit empty configuration for the isolated research command.\n")
    (ROOT / "wheel-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    common = ["pip", "compile", "requirements.in", "--offline", "--no-index", "--no-cache",
              "--no-python-downloads", "--no-managed-python", "--no-build", "--python-version", "3.15",
              "--python-platform", "aarch64-apple-darwin", "--config-file", "uv.toml",
              "--color", "never", "--no-progress", "--find-links", "wheels/base"]
    run = {"uv_version": subprocess.check_output([uv, "--version"], env=env, text=True).strip(),
           "uv_executable_sha256": digest(Path(uv).read_bytes()), "platform": platform.platform(),
           "python_harness": platform.python_version(), "environment_keys": sorted(env),
           "script_sha256": digest(Path(__file__).read_bytes()), "cases": []}
    for name, additional in [("missing-bar", []), ("provided-bar", ["--find-links", "wheels/bar"])]:
        command = [uv, *common, *additional]
        started = time.monotonic()
        process = subprocess.run(command, cwd=ROOT, env=env, capture_output=True, timeout=30)
        elapsed = time.monotonic() - started
        (out / f"{name}.stdout.txt").write_bytes(process.stdout)
        (out / f"{name}.stderr.txt").write_bytes(process.stderr)
        run["cases"].append({"name": name, "command": ["uv", *command[1:]],
                             "exit_code": process.returncode, "elapsed_seconds": elapsed,
                             "stdout_sha256": digest(process.stdout), "stderr_sha256": digest(process.stderr)})
    (out / "run.json").write_text(json.dumps(run, indent=2) + "\n")
    print(json.dumps(run, indent=2))


if __name__ == "__main__":
    main()

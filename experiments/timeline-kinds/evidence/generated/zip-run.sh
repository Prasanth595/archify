#!/bin/bash
set -u
export PATH="/private/tmp/keyboard-refresh-e837/node-v22.23.2-darwin-arm64/bin:$PATH"
cd <USER_HOME>/.codex/worktrees/lab-timeline-kinds/archify
out=/tmp/archify-round13-generated
run() { name="$1"; shift; printf '%q ' "$@" >> "$out/commands.txt"; printf '\n' >> "$out/commands.txt"; "$@" >"$out/$name.stdout" 2>"$out/$name.stderr"; result=$?; printf '%s\n' "$result" >"$out/$name.exit"; return "$result"; }
run zip-1 scripts/build-zip.sh archify.zip || exit 1
run zip-2 scripts/build-zip.sh /tmp/archify-round13-generated/build-2.zip || exit 1
run cmp cmp archify.zip /tmp/archify-round13-generated/build-2.zip || exit 1
run sha shasum -a 256 archify.zip /tmp/archify-round13-generated/build-2.zip || exit 1
run inventory unzip -Z1 archify.zip || exit 1
run exclusions python3 /tmp/archify-round13-generated/check-exclusions.py || exit 1

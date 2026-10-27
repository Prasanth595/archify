#!/bin/bash
set -u
cd <USER_HOME>/.codex/worktrees/lab-timeline-kinds/archify
export PATH="/private/tmp/keyboard-refresh-e837/node-v22.23.2-darwin-arm64/bin:$PATH"
out=/tmp/archify-round13-generated
root_target=<USER_HOME>/.codex/worktrees/pr671-validation/archify/node_modules
skill_target=<USER_HOME>/.codex/worktrees/pr671-validation/archify/archify/node_modules
for p in node_modules archify/node_modules; do [ ! -e "$p" ] && [ ! -L "$p" ] || exit 2; done
[ -d "$root_target" ] && [ -d "$skill_target" ] || exit 3
node -p "JSON.stringify({requirement:require('./archify/package.json').devDependencies['simple-icons'],actual:require('$skill_target/simple-icons/package.json').version})" > "$out/reuse-dependencies.stdout" 2> "$out/reuse-dependencies.stderr"
printf '%s\n' "$?" > "$out/reuse-dependencies.exit"
ln -s "$root_target" node_modules || exit 4
ln -s "$skill_target" archify/node_modules || { rm node_modules; exit 5; }
cleanup() {
  for pair in "node_modules:$root_target" "archify/node_modules:$skill_target"; do
    link=${pair%%:*}; target=${pair#*:}
    actual=$(readlink "$link") || return 1
    printf '%s -> %s\n' "$link" "$actual" >> "$out/reuse-cleanup.stdout"
    [ "$actual" = "$target" ] || return 1
    rm "$link" || return 1
  done
}
trap 'cleanup; printf "%s\n" "$?" > "$out/reuse-cleanup.exit"' EXIT
printf '%s\n' 'npm run test:generated' 'npm test' >> "$out/commands.txt"
npm run test:generated > "$out/reuse-test-generated.stdout" 2> "$out/reuse-test-generated.stderr"
printf '%s\n' "$?" > "$out/reuse-test-generated.exit"
npm test > "$out/reuse-npm-test.stdout" 2> "$out/reuse-npm-test.stderr"
printf '%s\n' "$?" > "$out/reuse-npm-test.exit"

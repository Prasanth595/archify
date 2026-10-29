#!/bin/bash
set -euo pipefail
root="${1:?pass a fresh output directory}"
repo="$(git rev-parse --show-toplevel)"
packet="$repo/experiments/keyboard-traversal/sqlite-transfer-5ec"
test ! -e "$root"
test -d "$repo/node_modules" && test -d "$repo/archify/node_modules"
for lock in package-lock.json archify/package-lock.json; do
  git show "5ecbd1bfdbf83ea747072112493c940e707569cb:$lock" | cmp - "$repo/$lock" || { echo "Lock mismatch: $lock" >&2; exit 1; }
done
mkdir -p "$root/base" "$root/candidate" "$root/inputs"
git archive 5ecbd1bfdbf83ea747072112493c940e707569cb archify | tar -x -C "$root/base"
cp -R "$root/base/archify" "$root/candidate/archify"
git show 3254fda4fcd61a101cc09e6b68fbdbb4d2779604:archify/explainer/browser-check.mjs > "$root/candidate/archify/explainer/browser-check.mjs"
for arm in base candidate; do
  ln -s "$repo/node_modules" "$root/$arm/node_modules"
  ln -s "$repo/archify/node_modules" "$root/$arm/archify/node_modules"
done
cp "$packet"/fixed-inputs/* "$root/inputs/"
(cd "$root/inputs" && shasum -a 256 -c <<'HASHES'
3e305088b843be9e60c3a6442c63d717217fd266df975eb2cf4aab48de540073  candidate.html
b62dea1baabda9cc5422c33202b48e17f2bffe0597a3db01fa69ac010173ab31  candidate.archify.md
a83b4233d3fb71294481bac5b8aba1f63f9340ca09b9c3dd3ce7e86738e9733f  tab-trap.html
HASHES
)
/opt/homebrew/opt/node@22/bin/node "$packet/reproduce.mjs" "$root"

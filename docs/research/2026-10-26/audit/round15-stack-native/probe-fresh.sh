#!/bin/bash
set -euo pipefail
if [ "$#" -ne 1 ]; then printf 'Usage: %s VERIFIED_SOURCE_PATH\n' "$0" >&2; exit 2; fi
TASK_SOURCE=$(cd "$1" && pwd)
TASK_ROOT=$(cd "$(dirname "$0")" && pwd)
while IFS=$'\t' read -r expected path; do
 actual=$(git hash-object --no-filters "$TASK_SOURCE/$path")
 if [ "$actual" != "$expected" ]; then printf 'Source mismatch: %s\n' "$path" >&2; exit 1; fi
done < "$TASK_ROOT/source-blob-manifest.tsv"
TASK_REPO=$(mktemp -d /tmp/archify-stack-replay.XXXXXXXX)
printf 'Source: %s\nRepo: %s\n' "$TASK_SOURCE" "$TASK_REPO"
export GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null PYTHONPATH="$TASK_SOURCE" PYTHONDONTWRITEBYTECODE=1
export GIT_AUTHOR_NAME=Fixture GIT_AUTHOR_EMAIL=fixture@example.invalid GIT_COMMITTER_NAME=Fixture GIT_COMMITTER_EMAIL=fixture@example.invalid
cd "$TASK_REPO"
git init -q
git config user.name Fixture
git config user.email fixture@example.invalid
mkdir .git/no-hooks
git config core.hooksPath "$TASK_REPO/.git/no-hooks"
git checkout -qb root
for branch in root develop feature child; do
 if [ "$branch" != root ]; then git checkout -qb "$branch"; fi
 case "$branch" in root|develop) labels="$branch";; feature) labels='feature_1 feature_2';; child) labels='child_1 child_2';; esac
 for label in $labels; do printf '%s\n' "$label" > "$label.txt"; git add "$label.txt"; git commit -qm "$label"; done
done
printf 'root\n    develop\n        feature\n            child\n' > .git/machete
git checkout -q develop
git merge --squash feature
git commit -qm squash_feature
git checkout -q child
printf '\nGIT GRAPH\n'
git log --all --graph --decorate --format='%h %s parents=%p'
printf '\nLAYOUT\n'
cat .git/machete
printf '\nDEFAULT STATUS\n'
python3 -c 'from git_machete.bin import main; main()' status -l --color=never
printf '\nDEFAULT EXIT=0\n\nNONE STATUS\n'
python3 -c 'from git_machete.bin import main; main()' status -l --color=never --squash-merge-detection=none
printf '\nNONE EXIT=0\n'

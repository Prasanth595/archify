#!/usr/bin/env bash
# Finish the ansible slice: run the remaining repair rounds on both sides.
set -uo pipefail
export EVIDENCE_DIR=/tmp/archify-960/evidence/projects/ansible
cd "$EVIDENCE_DIR"
source /tmp/archify-960/evidence/harness.sh
REPO=/tmp/archify-960/evidence/projects/ansible/src-ansible

# base: repair-2
finalize base base/03-repair-2.workflow.json base/03-repair-2.html --repo-root "$REPO"

# candidate: repair-1 (shorten the texec label, the same edit the base made)
cp base/02-repair-1.workflow.json candidate/02-repair-1.workflow.json
finalize candidate candidate/02-repair-1.workflow.json candidate/02-repair-1.html --repo-root "$REPO"

# candidate: repair-2
finalize candidate candidate/03-repair-2.workflow.json candidate/03-repair-2.html --repo-root "$REPO"

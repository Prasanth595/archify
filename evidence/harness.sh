#!/usr/bin/env bash
# Shared helper for the Issue #934 authoring comparison.
# Usage (from inside projects/<slug>/):
#   source /tmp/archify-960/evidence/harness.sh
#   trace base "label" node <cli> finalize workflow ...     # run + log with timing
#   finalize base draft.workflow.json out.html              # finalize via the base CLI
#   finalize candidate draft.workflow.json out.html          # finalize via the candidate CLI
#
# EVIDENCE_DIR must be set to the current project directory.
set -uo pipefail

BASE_CLI="/tmp/archify-base/archify/bin/archify.mjs"
CAND_CLI="/tmp/archify-960/archify/bin/archify.mjs"

# trace <side> <label> <cmd...>
trace() {
  local side="$1"; shift
  local label="$1"; shift
  local log="${EVIDENCE_DIR:?EVIDENCE_DIR must be set}/$side/commands.log"
  mkdir -p "$(dirname "$log")"
  local start end dur status
  start=$(date +%s.%N)
  {
    echo "=== $label"
    echo "\$ $*"
  } >> "$log"
  "$@" >> "$log" 2>&1
  status=$?
  end=$(date +%s.%N)
  dur=$(awk -v a="$start" -v b="$end" 'BEGIN{printf "%.3f", b-a}')
  {
    echo "--- exit=$status elapsed=${dur}s"
    echo
  } >> "$log"
  echo "[$side] $label exit=$status elapsed=${dur}s"
  return $status
}

# finalize <side> <candidate.json> <out.html> [extra args...]
finalize() {
  local side="$1"; shift
  local candidate="$1"; shift
  local out="$1"; shift
  local cli
  case "$side" in
    base) cli="$BASE_CLI" ;;
    candidate) cli="$CAND_CLI" ;;
    *) echo "unknown side: $side" >&2; exit 2 ;;
  esac
  trace "$side" "finalize $(basename "$candidate")" \
    node "$cli" finalize workflow "$candidate" "$out" --quality showcase --json "$@"
}

# snapshot <side> <label> <cmd...> — same as trace but stdout is also copied to a file
snapshot() {
  local side="$1"; shift
  local label="$1"; shift
  local out="${EVIDENCE_DIR:?}/$side/$label.json"
  mkdir -p "$(dirname "$out")"
  trace "$side" "$label" "$@" >/dev/null 2>&1
  # the last JSON blob was appended to commands.log; extract the final object
  python3 - "$side" "$label" << 'PY'
import json, os, sys
side, label = sys.argv[1], sys.argv[2]
log = os.path.join(os.environ['EVIDENCE_DIR'], side, 'commands.log')
text = open(log).read()
start = text.rfind('\n{\n')
if start == -1:
    start = text.rfind('\n{')
if start != -1:
    body = text[start+1:]
    depth = 0
    end = None
    for i, ch in enumerate(body):
        if ch == '{': depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end:
        try:
            json.loads(body[:end])
        except Exception:
            pass
        else:
            open(os.path.join(os.environ['EVIDENCE_DIR'], side, label + '.json'), 'w').write(body[:end])
            print('snapshot ->', os.path.join(side, label + '.json'))
PY
}

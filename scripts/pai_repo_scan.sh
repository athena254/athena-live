#!/bin/bash
set -euo pipefail
WORKSPACE="/root/.openclaw/workspace"
REPO_DIR="$WORKSPACE/Personal_AI_Infrastructure"
LOGFILE="$WORKSPACE/memory/pai-repo-monitor.md"

cd "$REPO_DIR"

# Fetch latest and describe status
git fetch origin >/dev/null 2>&1
LATEST_COMMIT=$(git log -1 --pretty=format:"%h (%an) %ad - %s" --date=iso)
STATUS=$(git status -sb)

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

{
  echo "## $TIMESTAMP"
  echo "- Latest commit: $LATEST_COMMIT"
  echo "- Status summary:"
  while IFS= read -r line; do
    echo "  - $line"
  done <<< "$STATUS"
  echo "- TELOS summary (first 5 lines of Workflows/Update.md):"
  head -n 5 "$REPO_DIR/Releases/v3.0/.claude/skills/Telos/Workflows/Update.md" | sed 's/^/  /'
  if python3 "$WORKSPACE/scripts/ishtar_telos_capture.py" >/dev/null 2>&1; then
    echo "- TELOS snapshot recorded (memory/telos-snapshot.md)"
  else
    echo "- TELOS snapshot failed (see scripts/ishtar_telos_capture.py output)"
  fi
  echo
} >> "$LOGFILE"

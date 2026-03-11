#!/bin/bash
WORKSPACE_DIR="/root/.openclaw/workspace"
LOG_FILE="/root/.openclaw/cron/runs/backup.log"
cd "$WORKSPACE_DIR"
echo "=== Git Auto-Backup started at $(date -u) ===" >> "$LOG_FILE"
git add -A -- ":!athena-live" ":!skills/last30days" ":!qmd"
git commit -m "Auto-backup: $(date -u)" >> "$LOG_FILE" 2>&1
git push backup fresh-start >> "$LOG_FILE" 2>&1
git push origin fresh-start >> "$LOG_FILE" 2>&1
echo "=== Backup complete ===" >> "$LOG_FILE"

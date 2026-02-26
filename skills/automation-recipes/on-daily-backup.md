# on-daily-backup.md

## Trigger
- **Event:** Scheduled daily at 00:00 UTC
- **Source:** Cron job or heartbeat-based scheduled check

## Actions

1. **Prepare Backup Directory**
   - Create timestamped folder: `/root/.openclaw/backups/YYYY-MM-DD/`
   - Verify write permissions

2. **Backup Core Data**
   - Copy `workspace/` contents (excluding temp/cache files)
   - Copy `memory/` full directory
   - Copy `config/` if exists
   - Export gateway state: `openclaw gateway status > state.json`

3. **Backup Secrets & Credentials**
   - Export encrypted credentials store (if applicable)
   - Backup API keys, tokens (encrypted)
   - Note: Never backup raw secrets in plain text

4. **Cleanup Old Backups**
   - Keep last 7 daily backups
   - Keep last 4 weekly backups
   - Archive and compress any backups older than 30 days
   - Delete backups older than 90 days

5. **Verify Backup Integrity**
   - Run checksum on backup archive
   - Test restore to temp location (spot-check)
   - Log verification result

6. **Log Completion**
   - Record backup size, duration, and status in `memory/backups.md`
   - Update backup manifest with latest backup info

## Conditions

**Skip backup if:**
- Gateway is currently processing a critical task
- Disk space is below 1GB (alert instead of skipping)
- Previous backup is still in progress (concurrent run detected)

**Abort if:**
- Source directory doesn't exist or is inaccessible
- Write permission denied on backup destination
- Checksum validation fails

## Notifications

| When | Who | Channel | Message |
|------|-----|---------|---------|
| On failure | User | Telegram | ❌ Daily backup FAILED: [reason]. Manual intervention required. |
| On low disk | User | Telegram | ⚠️ Backup completed but disk space low: [X]GB remaining. |
| On success | - | - | (No notification - silent success) |
| Weekly summary | User | Telegram | 📦 Weekly backup summary: [X] backups, [Y]GB total, [Z] incidents. |

## Rollback

- **Partial backup:** Delete incomplete backup folder, retry next cycle
- **Corrupted backup:** Use previous day's backup instead
- **Wrong destination:** Mount correct volume, re-run backup manually
- **Failed cleanup:** Manually run cleanup script: `find /root/.openclaw/backups/ -mtime +90 -delete`

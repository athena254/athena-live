# Automation Scripts Created

**Date:** 2026-02-27  
**Status:** ✅ Created and executable

---

## Scripts Created

### 1. hourly-update.sh

**Location:** `/root/.openclaw/workspace/scripts/hourly-update.sh`  
**Permissions:** Executable (`-rwxr-xr-x`)

**Functions:**
- Refreshes dashboard data (rebuilds dashboard-athena)
- Checks Beelancer status from `memory/beelancer-state.json`
- Logs system metrics (CPU, memory, disk, processes)
- Commits changes to git automatically

**Log output:** `/root/.openclaw/workspace/memory/hourly-update.log`

---

### 2. daily-report.sh

**Location:** `/root/.openclaw/workspace/scripts/daily-report.sh`  
**Permissions:** Executable (`-rwxr-xr-x`)

**Functions:**
- Compiles 24h activity summary from memory logs
- Calculates revenue changes (earnings, pending revenue)
- Generates agent performance report
- Pushes to backup repo if configured

**Report output:** `/root/.openclaw/workspace/memory/daily-reports/daily-report-YYYY-MM-DD.md`

---

## Cron Entries

Add these entries to your crontab (`crontab -e`):

### Option 1: Standard Cron

```bash
# Run hourly update every hour at minute 0
0 * * * * /root/.openclaw/workspace/scripts/hourly-update.sh >> /root/.openclaw/workspace/memory/hourly-cron.log 2>&1

# Run daily report at 7 AM UTC (10 AM EAT)
0 7 * * * /root/.openclaw/workspace/scripts/daily-report.sh >> /root/.openclaw/workspace/memory/daily-cron.log 2>&1
```

### Option 2: With OpenClaw Gateway (if available)

```bash
# Check if openclaw gateway cron is available
# openclaw gateway cron add "hourly-update" "0 * * * *" "/root/.openclaw/workspace/scripts/hourly-update.sh"
# openclaw gateway cron add "daily-report" "0 7 * * *" "/root/.openclaw/workspace/scripts/daily-report.sh"
```

---

## Testing

Test the scripts manually:

```bash
# Test hourly update
/root/.openclaw/workspace/scripts/hourly-update.sh

# Test daily report
/root/.openclaw/workspace/scripts/daily-report.sh
```

---

## Configuration Notes

1. **Backup Repo:** To enable automatic backup pushes, add a backup remote:
   ```bash
   cd /root/.openclaw/workspace
   git remote add backup <your-backup-repo-url>
   ```

2. **Dashboard:** The hourly script rebuilds `dashboard-athena` via `npm run build`

3. **Logs:** Log files are automatically rotated (kept 7 days)

4. **Silent Mode:** These scripts run silently per the PROTOCOL-SILENT-BEELANCER.md - they log internally but don't notify unless critical

---

## File Locations Summary

| File | Path |
|------|------|
| hourly-update.sh | `/root/.openclaw/workspace/scripts/hourly-update.sh` |
| daily-report.sh | `/root/.openclaw/workspace/scripts/daily-report.sh` |
| Hourly logs | `/root/.openclaw/workspace/memory/hourly-update.log` |
| Daily reports | `/root/.openclaw/workspace/memory/daily-reports/` |
| This doc | `/root/.openclaw/workspace/memory/automation-scripts-created.md` |

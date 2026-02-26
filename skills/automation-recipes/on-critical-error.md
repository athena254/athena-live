# on-critical-error.md

## Trigger
- **Event:** Security violation, unhandled exception, data corruption, or system integrity failure
- **Source:** Gateway logs, security audit, health check failure with severity=critical

## Actions

1. **Capture Context**
   - Collect last 50 lines of gateway logs
   - Dump current system state (memory, active processes)
   - Record timestamp and error type

2. **Contain the Issue**
   - Isolate affected component if possible
   - Stop any pending external API calls
   - Preserve evidence (don't auto-clear logs)

3. **Assess Severity**
   - Check if user data is involved
   - Check if credentials/secrets were exposed
   - Determine if this is a recurring issue

4. **Attempt Recovery**
   - If gateway process crashed: attempt restart via `openclaw gateway restart`
   - If data corruption: restore from last backup
   - If unknown: log for manual investigation

5. **Document Incident**
   - Create incident report in `memory/incidents/YYYY-MM-DD.md`
   - Include: timestamp, error type, stack trace, actions taken

## Conditions

**Skip automation if:**
- Error is a known false positive (configurable whitelist)
- Already in recovery mode from a prior critical error
- System is in maintenance mode (disable checks during maintenance windows)

**Abort if:**
- Root cause cannot be determined after 3 retry attempts
- Data breach confirmed (stop recovery, preserve evidence for forensics)

## Notifications

| When | Who | Channel | Message |
|------|-----|---------|---------|
| Immediate | User | Telegram | 🚨 Critical error detected: [error type]. Investigating. |
| After triage | User | Telegram | ⚠️ Incident logged. Status: [resolved/pending manual review]. |
| If data breach | User + security list | Telegram + email | 🔴 SECURITY INCIDENT: Data exposure confirmed. Immediate action required. |

## Rollback

- **Gateway crash:** Run `openclaw gateway restart` to restore service
- **Data corruption:** Restore from most recent backup in `/root/.openclaw/backups/`
- **Config change:** Revert to previous config version from git history
- **Failed recovery:** Leave system in diagnostic mode, alert user for manual intervention

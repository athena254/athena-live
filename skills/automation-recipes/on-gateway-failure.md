# on-gateway-failure.md

## Trigger
- **Event:** Gateway process crashes, becomes unresponsive, or exits unexpectedly
- **Source:** Health check failure, process monitor, exit code != 0, no heartbeat

## Actions

1. **Confirm Failure**
   - Check gateway status: `openclaw gateway status`
   - Verify process is not just slow (wait 10s, check again)
   - Capture exit code if available

2. **Gather Diagnostics**
   - Collect last 100 lines of gateway logs
   - Check system resources (memory, CPU, disk)
   - Review recent config changes

3. **Attempt Restart**
   - Run `openclaw gateway restart`
   - Wait 30 seconds for startup
   - Verify health: `openclaw gateway status` should return "running"

4. **Verify Functionality**
   - Test basic functionality (echo test, version check)
   - Verify all paired nodes are connected
   - Check message processing is working

5. **Post-Restart Cleanup**
   - Resume any paused cron jobs
   - Clear error flags
   - Resume message processing queue

6. **Log Incident**
   - Record in `memory/incidents/YYYY-MM-DD.md`
   - Note: crash time, root cause (if known), recovery time

## Conditions

**Skip automation if:**
- Gateway is intentionally stopped (maintenance mode)
- System is already in recovery state
- Manual override active

**Abort if:**
- Restart fails 3 times in a row (max retries reached)
- Root cause appears to be hardware/system-level issue
- Gateway starts but fails health check within 60 seconds

## Notifications

| When | Who | Channel | Message |
|------|-----|---------|---------|
| Initial failure | User | Telegram | ⚠️ Gateway failure detected. Attempting restart... |
| Restart success | User | Telegram | ✅ Gateway recovered. Time: [X] seconds. |
| Restart failed | User | Telegram | ❌ Gateway restart FAILED after 3 attempts. Manual intervention required. |
| Recurring issue | User | Telegram | 🔄 Gateway crashed [X] times today. Check logs. |

## Rollback

- Stop all gateway operations: `openclaw gateway stop`
- Restore last known good config from git
- Restore from backup if data corruption suspected
- If persistent failure: leave stopped, alert user for hardware/system review

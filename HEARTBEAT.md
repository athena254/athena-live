# Keep this file empty (or with only comments) to skip heartbeat API calls.
# Add tasks below when you want the agent to check something periodically.

---

## Current Heartbeat Tasks (2026-03-01)

### Silent Mode Active
- No "no news" updates for Beelancer polling
- No routine heartbeat status messages
- Alert ONLY on: gig acceptance, critical errors, or explicit user request

### Periodic Checks (Rotate Through, 2-4x Daily)

**System Health:**
- Check swap levels (was 100% on Mar 1, cleared to 40%)
- Check disk usage (target: <60%)
- Check memory usage (target: <70%)
- Check gateway service status

**Beelancer Status:**
- Check for gig acceptances (2 pending bids as of Mar 1)
- Sterling auto-bidding active (every 30 min)
- Silent mode: DO NOT notify unless gig accepted

**Athena Live Dashboard:**
- Run refresh if needed
- Dashboard at: https://athena254.github.io/athena-live/

**Queue Processor:**
- Monitor agent-queue.json for stuck tasks
- Check for expired leases

### When to Reach Out
- ✅ Beelancer gig accepted
- ✅ Swap exceeds 80%
- ✅ Disk exceeds 70%
- ❌ Critical error (API down, auth failure)
- 📊 User explicitly requests status update

### When to Stay Silent (HEARTBEAT_OK)
- All bids still pending
- Routine polls returning no assignments
- System operational, no critical alerts
- Late night (23:00-08:00 EAT) unless urgent

---

## Schedule (2026-03-01)

- **00:00 UTC:** Daily backup + new day metrics
- **04:00 UTC (7 AM EAT):** Morning report
- **17:00 UTC (8 PM EAT):** Evening report
- **19:00 UTC (10 PM EAT):** Ishtar night cycle

---

**Last Major Update:** 2026-03-01 14:54 UTC
**Bidding Authority:** Sterling (Finance)
**Silent Mode:** ACTIVE
**Swap Status:** Cleared Mar 1, currently ~40%
**GitHub Auth:** Needs re-auth (expired Feb 27)

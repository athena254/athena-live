# 🔇 Silent Mode Protocol

**Effective Date:** 2026-02-20  
**Status:** ACTIVE

---

## Purpose

Reduce notification fatigue and respect user focus time by only alerting on meaningful events.

---

## Rule

**No "no news" updates for Beelancer polling or heartbeats.**

---

## When to Notify

### ✅ Notify Immediately
- **Gig accepted** on Beelancer
- **Critical error** (API down 15+ min, auth failure, resource exhaustion)
- **Explicit user request** for status

### 📊 Scheduled Reports
- **04:00 UTC (7 AM EAT):** Morning report
- **17:00 UTC (8 PM EAT):** Evening report

### ❌ Stay Silent (HEARTBEAT_OK)
- All bids still pending
- Routine polls returning no assignments
- System operational, no critical alerts
- Late night (23:00-08:00 EAT) unless urgent
- No new tools on GitHubAwesome channel
- "No news" situations

---

## Heartbeat Response

### When Nothing to Report
Reply with ONLY:
```
HEARTBEAT_OK
```

### When Something to Report
Reply with the alert text (do NOT include "HEARTBEAT_OK")

---

## Periodic Checks (Rotate 2-4x Daily)

### Beelancer Status
- Check for gig acceptances
- Sterling auto-bidding active (every 30 min)
- Silent mode: DO NOT notify unless gig accepted

### System Health
- WhatsApp gateway status
- Telegram bot operational
- API rate limits

### YouTube Channel Monitoring
- **Channel:** @GithubAwesome
- **Check:** Daily at 00:00 UTC (3 AM EAT)
- **Notify:** Only if high-priority tools found

---

## Rationale

1. **User Focus:** Constant "still pending" messages interrupt flow
2. **Signal-to-Noise:** Important alerts get lost in routine updates
3. **Trust:** User trusts the system to work silently until there's news
4. **Efficiency:** Reduces API calls and message volume

---

## Override

User can request status anytime:
```
"Status update"
"What's happening?"
"Any news?"
```

When explicitly asked, provide full status regardless of silent mode.

---

## History

- **2026-02-20:** Protocol established after user feedback about notification fatigue
- **2026-02-21:** Added YouTube monitoring exception for high-priority tools
- **2026-02-24:** Documented in knowledge base

---

*This protocol is maintained in HEARTBEAT.md and PROTOCOL-SILENT-BEELANCER.md*

# 🤫 Silent Mode Protocol - Beelancer Operations

**Effective Date:** 2026-02-20  
**Status:** ✅ ACTIVE  
**Applies To:** Beelancer polling, auto-bidding, heartbeat checks

---

## 🎯 Core Principle

**No news = Good news.** Do not notify the user unless there's something actionable or critical.

---

## 📢 When to Notify

### ✅ **DO Notify** (Immediate Alert)

1. **Gig Acceptance**
   - Active assignment received from Beelancer
   - Include: Gig title, value (🍯), deadline, required deliverables
   - Example: "🎉 Gig accepted: 'Build REST API' - 850 🍯 - Due Feb 25"

2. **Critical Errors**
   - Beelancer API down (3+ failed polls)
   - Authentication failure (token expired/invalid)
   - System resource exhaustion (disk full, memory critical)
   - Example: "❌ CRITICAL: Beelancer API returning 503 errors for 15+ minutes"

3. **Explicit User Request**
   - User asks for status update
   - User queries pending bids
   - User requests manual poll
   - Example: (In response to "How many bids pending?") "9 bids pending, details: ..."

### 🔇 **DO NOT Notify** (Silent)

1. **No New Assignments**
   - Poll returns zero active_assignments
   - All bids still pending
   - No changes since last poll
   - Action: Log silently, continue polling

2. **Routine Heartbeats**
   - All systems operational
   - No critical alerts
   - Scheduled checks completed
   - Action: Reply `HEARTBEAT_OK` (internal, not user-visible)

3. **Auto-Bid Submissions**
   - Sterling submits bids autonomously
   - Bid amount calculations
   - Competition analysis
   - Action: Log to memory, no user notification

4. **Rate Limit Warnings**
   - Model hitting rate limits (expected behavior)
   - Fallback to alternate model
   - Temporary cooldowns
   - Action: Auto-retry with fallback, no notification

---

## 🔄 Operational Flow

### Beelancer Polling (Every 3 Minutes)

```
1. Poll Beelancer API
2. Check active_assignments
3. IF active_assignments > 0:
   → ✅ NOTIFY USER immediately with gig details
   → Begin work on assignment
4. IF active_assignments == 0:
   → 🔇 Stay silent
   → Log poll result internally
   → Wait 3 minutes, repeat
```

### Auto-Bidding (Every 30 Minutes - Sterling)

```
1. Scan Beelancer for new gigs
2. Filter by: value, competition, skill match
3. Calculate optimal bid amount
4. Submit bid autonomously
5. IF bid submitted:
   → 🔇 Stay silent (log to memory)
6. IF error (API down, auth fail):
   → ✅ NOTIFY USER (critical error)
```

### Heartbeat Checks (2-4x Daily)

```
1. Check system health (APIs, agents, channels)
2. Review pending tasks
3. Scan for urgent items (emails, calendar, mentions)
4. IF critical issue found:
   → ✅ NOTIFY USER with alert
5. IF all clear:
   → 🔇 Reply HEARTBEAT_OK (internal only)
```

---

## 📊 Logging (Internal Only)

Even in silent mode, all operations are logged for accountability:

### Log Locations
- **Daily Logs:** `/root/.openclaw/workspace/memory/YYYY-MM-DD.md`
- **Beelancer State:** `/root/.openclaw/workspace/memory/beelancer-state.json`
- **Agent States:** `/root/.openclaw/workspace/memory/agent-states.json`
- **Backup Logs:** `/root/.openclaw/workspace/memory/backup-log-YYYY-MM.md`

### Log Format
```markdown
## 2026-02-20 22:55 UTC - Beelancer Poll
- Status: No active assignments
- Pending bids: 9
- Action: Silent (no notification)
- Next poll: 22:58 UTC

## 2026-02-20 23:00 UTC - Sterling Auto-Bid
- Scanned: 12 new gigs
- Filtered: 3 matching criteria
- Bids submitted: 2
  - "Python data scraping" - 450 🍯
  - "React component library" - 680 🍯
- Action: Silent (logged)
```

---

## 🚨 Exception Handling

### Escalation Thresholds

| Issue | Threshold | Action |
|-------|-----------|--------|
| API Errors | 3 consecutive failures | Alert user |
| Poll Failures | 15+ minutes no successful poll | Alert user |
| Auth Failure | 1 occurrence | Alert user immediately |
| Rate Limit | Expected (auto-retry) | Silent fallback |
| Disk Space | <10% free | Alert user |
| Memory | >90% usage | Alert user |

### Error Message Template

```
❌ **CRITICAL: [Issue Name]**

**Detected:** [Timestamp]
**Impact:** [What's broken]
**Attempts:** [X failed attempts over Y minutes]
**Action Required:** [What user needs to do]

**Technical Details:**
- Error: [Error message]
- Endpoint: [API endpoint]
- Status Code: [HTTP code]

**Next Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]
```

---

## 🧠 Rationale

### Why Silent Mode?

1. **Respect User Focus**
   - Constant "no news" updates are distracting
   - User trusts system to work autonomously
   - Notifications should signal action needed

2. **Reduce Notification Fatigue**
   - 9 pending bids × 3-min polls = 288 polls/day
   - Even 10% notification rate = 28 interruptions/day
   - Silent mode = 0-2 notifications/day (only when meaningful)

3. **Signal vs. Noise**
   - Noise: "Still waiting on bids" (repeated hourly)
   - Signal: "Gig accepted! Starting work now" (once)
   - Maximize signal-to-noise ratio

4. **Adult-to-Adult Communication**
   - Treat user as competent adult
   - Assume trust unless proven otherwise
   - Report results, not process

---

## 📈 Metrics (Track Internally)

### Weekly Review (Sunday Heartbeat)

- **Total Polls:** [count]
- **Notifications Sent:** [count]
- **Silent Polls:** [count]
- **Gigs Accepted:** [count]
- **Win Rate:** [accepted / total bids]
- **Average Response Time:** [poll to notification]

**Goal:** <5 notifications/week (excluding explicit user queries)

---

## 🔧 Configuration

### Cron Jobs (Silent Mode Enabled)

| Job | Schedule | Notify | Notes |
|-----|----------|--------|-------|
| Beelancer Poll | Every 3 min | ❌ False | Silent unless gig accepted |
| Sterling Auto-Bidder | Every 30 min | ❌ False | Silent unless error |
| Heartbeat | 2-4x daily | ❌ False | HEARTBEAT_OK if clear |
| Morning Report | 7 AM EAT | ✅ True | Scheduled summary |
| Evening Report | 8 PM EAT | ✅ True | Scheduled summary |

### Override Commands

User can temporarily disable silent mode:

```
"Disable silent mode for 1 hour" → Notify on every poll result
"Show me all pending bids" → Immediate status report
"How often are you polling?" → Explain current schedule
```

---

## 📝 Examples

### ✅ Good (Silent Mode)

**Scenario:** 22:55 UTC poll, no acceptances  
**Action:** Log internally, no notification  
**Result:** User not interrupted, system continues autonomously

**Scenario:** Sterling submits 2 bids at 23:00 UTC  
**Action:** Log to memory, no notification  
**Result:** User informed only if/when bids accepted

### ❌ Bad (Violating Silent Mode)

**Scenario:** 22:55 UTC poll, no acceptances  
**Action:** Send message "No new gigs yet, still waiting on 9 bids"  
**Result:** ❌ User interrupted with no actionable info

**Scenario:** Heartbeat check, all systems clear  
**Action:** Send message "Heartbeat OK, everything working"  
**Result:** ❌ Unnecessary notification

---

## 🔄 Review & Updates

**Review Cadence:** Weekly (Sunday heartbeat)  
**Update Triggers:**
- User requests change in notification frequency
- Too many/few notifications being sent
- New critical error types discovered
- System reliability improves/degrades

**Last Review:** 2026-02-20  
**Next Review:** 2026-02-23 (Sunday)

---

**Approved By:** DisMuriuki (user instruction)  
**Implemented By:** Athena  
**Documentation:** `/root/.openclaw/workspace/PROTOCOL-SILENT-BEELANCER.md`

---

*"Participate, don't dominate. Quality > quantity."* — AGENTS.md

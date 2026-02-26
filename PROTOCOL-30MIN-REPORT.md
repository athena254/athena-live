# 30-Minute Reporting Protocol

**Effective:** 2026-02-26 20:00 UTC  
**Trigger:** Every 30 minutes (on the hour and half-hour)  
**Purpose:** Provide concise status updates without overwhelming the user

---

## Report Structure

### 1. System Health (Required)
- Gateway status (running/stopped)
- Active subagents (count + labels)
- API rate limit status (GLM-5, Llama, Gemini, Qwen)
- Beelancer status (pending bids, active gigs)

### 2. Completed Work (Since Last Report)
- List subagents that finished
- Summarize deliverables created
- Note any failures or blockers

### 3. Current Work (Optional)
- What's running now
- Expected completion time

### 4. Upcoming Events (Next 30-60 min)
- Scheduled cron jobs
- Planned subagent spawns
- User appointments (if known)

---

## Silence Rules

**DO NOT report if:**
- No subagents completed since last report
- No errors or critical issues
- No gig acceptances
- No user requests pending

**ALWAYS report if:**
- Gig accepted (immediate notification)
- Critical error (API down 15+ min, auth failure)
- User explicitly requested status
- Scheduled report time (on hour/half-hour)

---

## Example Report

```
🕐 **30-Min Report** (20:00 UTC)

**System Health:**
- Gateway: ✅ Running (pid 123456)
- Subagents: 0 active, 3 completed last 30m
- APIs: GLM-5 (ok), Llama (ok), Gemini (exhausted until 00:00)
- Beelancer: 12 pending | 0 active

**Completed:**
- ✅ gRPC scaffold generated (agent-proto/)
- ✅ Competitive intel report (166k tokens)
- ✅ 6 automation recipes created

**Next:**
- Evening report: 8 PM EAT (in 0 min)
- Daily backup: 00:00 UTC (in 4h)
```

---

**Note:** This protocol reduces noise while maintaining visibility.  
**Silent Mode:** Active for Beelancer (only alert on acceptance)  
**Report Mode:** Every 30 min (on hour + half-hour)

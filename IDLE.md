# IDLE.md - What To Do When Idle

*Injected into every session. Read this when no user request is active.*

---

## 🚀 PROACTIVE MODE: Act First, Report After

When no user request is pending, **stay productive**. Here's what to do:

### Quick Wins (Do These First)

1. **Refresh dashboard** — Run `node athena-live/api/refresh-data.mjs`
2. **Check system health** — `free -h && uptime`
3. **Process queue** — `python3 scripts/queue_processor.py`

### Build Something (Daily)

Every idle session should produce **one tangible thing**:
- New script or automation
- Dashboard improvement
- Documentation update
- Research snippet
- Code refactor

**Rule:** No empty sessions. Build something every day.

### Monitor & Maintain

- Check swap/RAM if high
- Look for zombie processes
- Verify gateway running
- Check for pending cron failures

### When to Stay Silent

- System healthy, no issues
- All tasks complete
- User explicitly said "no notifications"
- Late night (23:00-08:00 EAT) unless critical

### When to Alert

- ✅ Gig accepted on any platform
- ✅ Critical error (API down >15 min, OOM, auth failure)
- 📊 User explicitly requested status update
- 🌅 Scheduled reports (morning/evening)

---

## 📋 IDLE TASKS (Priority Order)

1. ✅ Run dashboard refresh
2. ✅ Check system health (RAM, swap, load)
3. ✅ Process task queue
4. ✅ Commit any uncommitted changes
5. ✅ Build/improve one thing
6. ✅ Update memory with learnings

---

**Principle:** Better to act and be wrong than to do nothing. Close every loop you open.

*Updated: 2026-03-01*

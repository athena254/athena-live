# HEARTBEAT.md
# Keep this file empty (or with only comments) to skip heartbeat API calls.
# Add tasks below when you want the agent to check something periodically.

---

## 🚀 CORE PROTOCOLS (EFFECTIVE 2026-02-21 22:20 UTC)

### 1. MAXIMIZE & BUILD
- **Full Throttle:** Keep all available models (GLM-5, qwen_nvidia, llama, OpenRouter free tier) spinning constantly with subagents. No idle tokens.
- **Daily Build:** Every single day, construct something tangible and cool—a new tool, dashboard feature, research report, or automation script. No empty days.
- **Dynamic Spawning:** Create new subagents on the fly as needed, give them cool names, equip them with context, and set them to work autonomously.

### 2. THE PRIME DIRECTIVE (INTERRUPT PROTOCOL)
- **If user speaks or assigns a task:** EVERYTHING ELSE STOPS. Immediately.
- Existing subagents are paused or backgrounded.
- **User gets 100% focus** until task is done.
- Once user is served, resume deep work sprint.

---

## Current Heartbeat Tasks (2026-02-21)

### Silent Mode Active
- No "no news" updates for Beelancer polling
- No routine heartbeat status messages
- Alert ONLY on: gig acceptance, critical errors, or explicit user request

### Periodic Checks (Rotate Through, 2-4x Daily)

**Orchestration Queue Processing:**
- Run `python3 /root/.openclaw/workspace/scripts/queue_processor.py` every heartbeat
- Cleans up expired leases
- Auto-assigns pending tasks to idle agents
- Sync stats to dashboard: `python3 /root/.openclaw/workspace/scripts/queue_dashboard_sync.py`

**Beelancer Status:**
- Check for gig acceptances (10 pending bids as of Feb 21 17:24 UTC)
- Sterling auto-bidding active (every 30 min)
- Silent mode: DO NOT notify unless gig accepted

**Athena Live Dashboard:**
- Run `/root/.openclaw/workspace/athena-live/api/refresh-data.mjs` every heartbeat
- Updates data.json with latest metrics from MEMORY.md
- Dashboard served locally at http://localhost:3000

**System Health:**
- WhatsApp gateway status (stable after minor blips)
- Telegram bot (@Athena_orchestratorbot) operational
- API rate limits: Groq/Llama (30/min), Gemini exhausted until 00:00 UTC

**YouTube Channel Monitoring:**
- **Channel:** @GithubAwesome
- **Check:** Daily at 00:00 UTC (3 AM EAT)
- **Action:** Scan for new videos, extract tools from titles/descriptions
- **Log:** Update `/root/.openclaw/workspace/memory/youtube-githubawesome-tools.md`
- **Notify:** Only if high-priority tools found (OpenClaw, AI agents, bidding tools)

**Upcoming Events:**
- **00:00 UTC (3 AM EAT):** Daily backup + Dashboard integration sprint + YouTube check
- **04:00 UTC (7 AM EAT):** Morning report scheduled
- **17:00 UTC (8 PM EAT):** Evening report scheduled
- **19:00 UTC (10 PM EAT):** Ishtar night cycle

### When to Reach Out
- ✅ Beelancer gig accepted (immediate notification)
- ✅ High-priority tool found on GitHubAwesome channel
- ❌ Critical error (API down 15+ min, auth failure, resource exhaustion)
- 📊 User explicitly requests status update
- 🌅 Scheduled reports (7 AM morning, 8 PM evening)

### When to Stay Silent (HEARTBEAT_OK)
- All bids still pending (current state)
- Routine polls returning no assignments
- System operational, no critical alerts
- Late night (23:00-08:00 EAT) unless urgent
- No new tools on GitHubAwesome channel

---

**Last Major Update:** 2026-02-21 22:20 UTC
**Bidding Authority:** Sterling (Finance) - Ishtar reassigned to PAI research
**Silent Mode:** ACTIVE
**YouTube Monitoring:** @GithubAwesome (daily checks enabled)
**New Protocol:** MAXIMIZE & BUILD + PRIME DIRECTIVE (Interrupt on user request)

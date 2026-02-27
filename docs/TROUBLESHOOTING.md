# 🔧 Troubleshooting Guide

Solutions to common issues with Athena.

---

## Quick Diagnostics

Run these commands to check system health:

```
@Squire run a system check
@Squire what's the disk usage?
@Squire check memory
```

---

## Common Issues

### ❌ "Agent Not Responding"

**Symptoms:** Agent doesn't respond to @mention

**Solutions:**
1. **Check if agent exists** — Not all agents are always-on
2. **Try main session** — Some agents only spawn via Athena
3. **Wait 30 seconds** — Agents may be processing other tasks
4. **Retry** — Brief timeout issues resolve themselves

---

### ❌ "Model Rate Limited"

**Symptoms:** "Rate limit exceeded" or "429 error"

**Solutions:**
1. **Wait 1 minute** — Rate limits typically reset quickly
2. **Use fallback** — Most agents auto-failover to backup models
3. **Check MODEL-STATUS.md** — See current rate limit status

**Manual rotation:**
```
@Athena switch to fallback model
```

---

### ❌ "Bidding Not Working"

**Symptoms:** Sterling not placing bids

**Checklist:**
1. ✅ Is Sterling running? (`/cron status` or ask Athena)
2. ✅ Beelancer API accessible? (check manually)
3. ✅ Credentials valid? (API keys not expired)
4. ✅ Silent mode active? (only notifies on acceptance)

**Debug:**
```
@Sterling run a manual bid check
@Sterling show pending gigs
```

---

### ❌ "Dashboard Not Loading"

**Symptoms:** Blank page or 404 on `/athena-live/`

**Solutions:**
1. **Check URL** — Correct path: `/athena-live/mission.html`
2. **Refresh** — Browser cache issue
3. **Check deployment** — Is Vercel working?
4. **Check logs** — Run: `@Prometheus check deployment status`

**Common URLs:**
- Main: `/athena-live/mission.html`
- Beelancer: `/athena-live/beelancer-manager.html`
- Felicity Art: `/athena-live/felicity-art.html`

---

### ❌ "Git/Deployment Failed"

**Symptoms:** Prometheus can't deploy

**Solutions:**
1. **Check git status** — Any uncommitted changes?
2. **Check Vercel** — Is the project connected?
3. **Check credentials** — GitHub token valid?
4. **Try manual deploy** — `@Prometheus deploy manually`

**Common fixes:**
```
@Prometheus force push
@Prometheus sync with remote
```

---

### ❌ "Voice/TTS Not Working"

**Symptoms:** Athena won't speak

**Solutions:**
1. **Check platform** — TTS works on Telegram/WhatsApp
2. **Check voice assigned** — Some agents have no voice
3. **Try different agent** — Athena (Sonia), Sterling (Thomas), Ishtar (Ezinne)
4. **Check edge-tts** — Is the service running?

---

### ❌ "Research Timed Out"

**Symptoms:** Delver returns partial results or error

**Solutions:**
1. **Reduce scope** — "Research X" → "Research X aspect Y"
2. **Try again** — Network blips happen
3. **Use different source** — "Search via web instead of Tavily"
4. **Split task** — Break into smaller research queries

---

### ❌ "Council Won't Convene"

**Symptoms:** THEMIS not responding to convene request

**Solutions:**
1. **Wait** — THEMIS may be in another deliberation
2. **Check agenda** — Is there a clear topic?
3. **Try again** — Brief capacity issues resolve
4. **Direct spawn** — `@THEMIS deliberate on [topic]`

---

## Error Messages Explained

| Error | Meaning | Fix |
|-------|---------|-----|
| `429 Too Many Requests` | Rate limited | Wait 60s, auto-failover |
| `401 Unauthorized` | Auth failed | Check API keys |
| `403 Forbidden` | No permission | Check credentials |
| `Connection Timeout` | Network issue | Retry |
| `Model Not Found` | Wrong model ID | Check MODEL-STATUS.md |

---

## Need More Help?

1. **Check MEMORY.md** — Recent issues documented
2. **Check AGENT-GAP-ANALYSIS.md** — Known limitations
3. **Ask Athena** — "What's currently broken?"
4. **Check cron jobs** — `/cron status`

---

## Emergency Procedures

### Complete System Reset
```
@Athena run full system diagnostic
```

### Kill Stuck Agent
```
@Athena kill [agent-name] session
```

### Manual Override
```
@Athena take over [task] manually
```

---

*Still stuck? Check MEMORY.md for recent incidents or ask for a full diagnostic.*

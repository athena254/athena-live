# 🦉 Athena Knowledge Base

**Last Updated:** 2026-02-24  
**Purpose:** Centralized, searchable reference for all Athena systems

---

## 📁 Structure

```
knowledge-base/
├── INDEX.md              # This file - master index
├── agents/               # Agent identities, roles, voices
├── skills/               # Custom skills documentation
├── dashboards/           # Dashboard pages & features
├── protocols/            # Operational protocols
├── metrics/              # Performance metrics & KPIs
├── api-reference/        # API endpoints & integrations
└── troubleshooting/      # Common issues & solutions
```

---

## 🤖 Quick Reference

### Active Agents (10)
| Agent | Role | Voice | Status |
|-------|------|-------|--------|
| Athena | Main Orchestrator | Sonia (British F) | Active |
| Sterling | Finance, Auto-Bidder | Thomas (British M) | Active |
| Ishtar | Oracle, PAI Research | Ezinne (Nigerian F) | Active |
| Delver | Research | Default | Active |
| Squire | Assistant | Default | Active |
| Felicity | Code Artisan | Default | Active |
| Prometheus | Executor | Default | Active |
| Cisco | Security/BMAD | Default | Active |
| THEMIS | Council | Maisie (British F) | Active |
| Nexus | Intelligence Synthesizer | Default | Active |

### Key URLs
- **Dashboard:** https://athena254.github.io/athena-live/
- **Backup Repo:** https://github.com/athena254/Athena-backup (private)
- **OS Repo:** https://github.com/athena254/Athena_OS
- **Telegram Bot:** @Athena_orchestratorbot

### Key Files
| File | Purpose |
|------|---------|
| `MEMORY.md` | Long-term memory & decisions |
| `HEARTBEAT.md` | Periodic task protocols |
| `AGENT-ROSTER.md` | Full agent details |
| `MODEL-REFERENCE.md` | Model rates & fallbacks |
| `PROTOCOL-*.md` | Operational protocols |

---

## 🔍 Search Tips

### Find Agent Info
```bash
grep -r "Sterling" knowledge-base/agents/
```

### Find Protocol
```bash
grep -r "silent" knowledge-base/protocols/
```

### Find Dashboard
```bash
ls knowledge-base/dashboards/
```

---

## 📊 Categories

### 1. Agents (`agents/`)
- `roster.md` - Full agent roster with details
- `voices.md` - Voice assignments
- `routing.md` - How to spawn specific agents

### 2. Skills (`skills/`)
- `installed.md` - All installed skills
- `custom.md` - Custom-built skills
- `usage.md` - How to invoke skills

### 3. Dashboards (`dashboards/`)
- `pages.md` - All dashboard pages with URLs
- `features.md` - Feature breakdown per page
- `deployment.md` - How to deploy updates

### 4. Protocols (`protocols/`)
- `silent-mode.md` - When to stay quiet
- `bidding.md` - Auto-bidding rules
- `backup.md` - Backup procedures

### 5. Metrics (`metrics/`)
- `beelancer.md` - Bidding stats
- `api-usage.md` - Model usage tracking
- `costs.md` - Operational costs

### 6. API Reference (`api-reference/`)
- `beelancer-api.md` - Beelancer endpoints
- `openrouter.md` - OpenRouter models
- `telegram.md` - Telegram bot API

### 7. Troubleshooting (`troubleshooting/`)
- `common-issues.md` - Frequent problems
- `rate-limits.md` - Handling API limits
- `recovery.md` - Disaster recovery

---

*This knowledge base is maintained by Athena. Update as systems evolve.*

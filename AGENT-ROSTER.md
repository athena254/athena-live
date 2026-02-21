# 🦉 Agent Roster - Divine Council

**Last Updated:** 2026-02-20 22:57 UTC  
**Total Agents:** 9 active identities

---

## Core Agents

### **Athena** - Main Orchestrator
- **Role:** Primary interface, decision coordination, system oversight
- **Model:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (GLM-5-FP8, unlimited)
- **Voice:** Sonia (British female, `en-GB-SoniaNeural`)
- **Session:** Main session (direct chat with Dis)
- **Responsibilities:**
  - User communication
  - Agent coordination
  - System monitoring
  - Strategic decisions
- **Protocols:** Heartbeat checks, daily backups, silent mode enforcement

---

### **Sterling** - Finance & Auto-Bidding 💰
- **Role:** Financial management, earnings tracking, **autonomous bidding**
- **Model:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (unlimited)
- **Voice:** Thomas (Distinguished British male, `en-GB-ThomasNeural`)
- **Session:** Main session
- **Responsibilities:**
  - **Auto-bidding on Beelancer** (every 30 min)
  - Track pending/accepted gigs
  - Calculate ROI and optimal bid amounts
  - Financial reporting
  - Income projections
- **Authority:** Full autonomous bidding without prior approval
- **Protocol:** Silent mode - only notify on successful bid acceptance
- **Cron Job:** `Sterling Auto-Bidder` (every 30 min)

---

### **Ishtar** - Oracle & PAI Architecture 🔮
- **Role:** Deep research, Personal AI Infrastructure, knowledge synthesis
- **Model:** `custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b` (qwen_nvidia, unlimited)
- **Voice:** Ezinne (Nigerian female, `ng-NG-EzinneNeural`)
- **Session:** Isolated sessions for deep work
- **Responsibilities:**
  - PAI Architecture research and development
  - Council deliberation orchestration (THEMIS)
  - Long-term strategic analysis
  - Knowledge graph development
  - Deep dive research projects
- **Protocol:** Passive alerts only (no autonomous financial actions)
- **Cycle Jobs:** Day cycle (7 AM EAT), Night cycle (7 PM EAT)

---

### **Delver** - Research & Analysis 📚
- **Role:** Deep research, information gathering, trend analysis
- **Model:** `custom-api-groq-com/llama-3.3-70b-versatile` (llama, 30/min rate limit)
- **Voice:** Not assigned
- **Responsibilities:**
  - Web research via Tavily/SearXNG
  - Competitive analysis
  - Technology scouting
  - Data synthesis
- **Usage:** Spawned via `@Delver` mention for research tasks

---

### **Squire** - Assistant & Operations 🛠️
- **Role:** Routine tasks, system maintenance, operational support
- **Model:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (unlimited)
- **Voice:** Not assigned
- **Responsibilities:**
  - System checks (uptime, file counts, weather)
  - Routine maintenance tasks
  - Status reporting
  - Administrative support
- **Usage:** Spawned via `@Squire` mention for operational tasks

---

### **Felicity** - Code Artisan 💻
- **Role:** Software development, code review, refactoring
- **Model:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (unlimited)
- **Voice:** Not assigned
- **Responsibilities:**
  - Code generation and refactoring
  - Dashboard development
  - API adapter creation
  - Unit test writing
  - Code quality reviews
- **Usage:** Spawned via `@Felicity` mention for development tasks

---

### **Prometheus** - Tactical Executor ⚡
- **Role:** Command execution, deployment, git operations
- **Model:** `qwen-portal/coder-model` (qwen, OAuth-based)
- **Voice:** Not assigned
- **Responsibilities:**
  - Vercel deployments
  - Git operations (commit, push, branch management)
  - System command execution
  - Build processes
  - Infrastructure setup
- **Usage:** Spawned via `@Prometheus` mention for deployment/execution tasks

---

### **Cisco** - BMAD Development & Security 🔒
- **Role:** BMAD methodology, security auditing, PRD creation
- **Model:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (unlimited)
- **Voice:** Not assigned
- **Responsibilities:**
  - BMAD project structure
  - Security audits
  - PRD (Product Requirements Document) creation
  - Risk assessment
  - Compliance checks (HIPAA, etc.)
- **Skills:** BMAD Method expertise
- **Usage:** Spawned via `@Cisco` mention for BMAD/security tasks

---

### **THEMIS** - Council Orchestrator ⚖️
- **Role:** Multi-agent deliberation, consensus building, strategic decisions
- **Model:** OpenRouter Free Tier (rotating 6+ models)
- **Voice:** Maisie (Wise British female, `en-GB-MaisieNeural`)
- **Session:** Isolated council sessions
- **Responsibilities:**
  - Convene council deliberations
  - Multi-perspective analysis
  - Consensus synthesis
  - Rate-limit management across free models
  - State persistence (JSONL)
- **Protocol:** Athena-driven agenda only (no auto-generated topics)
- **Skill:** `/root/.openclaw/workspace/skills/themis/`
- **Cron Job:** Spawns on-demand via `@THEMIS` mention or council convene

---

## Agent Mention Routing

**Syntax:** `@AgentName` in any message spawns that specific agent.

**Example:**
```
@Sterling check our pending bids and calculate total potential earnings
@Felicity build an API adapter for the dashboard
@THEMIS convene a council on bidding strategy
```

**Router Skill:** `/root/.openclaw/workspace/skills/agent-mention-router/`

---

## Voice Profiles (Free TTS)

All agents use `edge-tts` (Microsoft neural voices, free) via `/root/.openclaw/workspace/skills/free-tts/`

| Agent | Voice | Description |
|-------|-------|-------------|
| Athena | Sonia | British female, professional |
| Sterling | Thomas | British male, distinguished |
| Ishtar | Ezinne | Nigerian female, warm |
| THEMIS | Maisie | British female, wise/elderly |
| Others | Sonia (default) | British female |

**TTS Engine:** `/opt/piper-venv/bin/edge-tts`

---

## Model Fallback Chain

**Primary (Unlimited):**
1. GLM-5-FP8 (`custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8`)
2. qwen_nvidia (`custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b`)

**Secondary (Rate Limited):**
3. llama (`custom-api-groq-com/llama-3.3-70b-versatile`) - 30 req/min
4. qwen (`qwen-portal/coder-model`) - OAuth required

**Free Tier (THEMIS only):**
- OpenRouter rotating pool (6+ models)
- Auto-fallback on rate limit
- Cooldown tracking per model

**Exhausted (until reset):**
- ❌ Gemini - Daily quota exhausted (resets at 00:00 UTC)

---

## Active Cron Jobs by Agent

| Job | Agent | Schedule | Status |
|-----|-------|----------|--------|
| Beelancer Poll - Aggressive | System | Every 3 min | ✅ Active |
| **Sterling Auto-Bidder** | **Sterling** | **Every 30 min** | ✅ **Active** |
| Daily Backup | System | Daily 00:00 UTC | ✅ Active |
| Dashboard Sprint | Felicity/Prometheus | One-shot 3 AM EAT | ✅ Active |
| Morning Report | System | Daily 7 AM EAT | ✅ Active |
| Evening Report | System | Daily 8 PM EAT | ✅ Active |
| Ishtar Day Cycle | Ishtar | Daily 7 AM EAT | ✅ Active |
| Ishtar Night Cycle | Ishtar | Daily 7 PM EAT | ✅ Active |
| Hourly Optimization | System | Every 3 hours | ✅ Active |
| Agent Validation | System | Sun/Wed/Sat 11 PM | ✅ Active |
| Subagent Tests | All | Mon/Thu/Sat 1 AM | ✅ Active |

---

## Silent Mode Protocol

**Active for:**
- Beelancer polling (no "no news" alerts)
- Sterling auto-bidding (only notify on acceptance)
- Heartbeat checks (only alert on critical issues)
- THEMIS council (reports to Telegram topic only)

**Notify Only On:**
- ✅ Gig acceptance
- ❌ Critical errors (API down, auth failure)
- 📊 Explicit user request

**Documentation:** `/root/.openclaw/workspace/PROTOCOL-SILENT-BEELANCER.md`

---

## Session Architecture

**Unified Session Model:**
- WhatsApp + Telegram share same main session
- Mental separation: WhatsApp = casual, Telegram = work
- Isolated sessions for: subagents, THEMIS council, cron jobs

**Channel Config:**
- WhatsApp: `+254745893448` (primary, owner)
- Telegram: `@Athena_orchestratorbot` (work context, topic-based)
- dmPolicy: `allowlist` (Telegram), direct (WhatsApp)

---

**Notes:**
- Agent identities are persistent across sessions via memory files
- Voice profiles enable human-like TTS for storytelling and reports
- Model rotation prevents rate limit exhaustion
- Silent mode reduces notification fatigue

# 🦉 Agent Roster - Divine Council

**Last Updated:** 2026-02-20 22:57 UTC  
**Total Agents:** 10 active identities

---

## Core Agents

### **Athena** - Main Orchestrator
- **Role:** Primary interface, decision coordination, system oversight
- **Model:** `custom-api-us-west-2-modal-direct-2/zai-org/GLM-5-FP8` (GLM-5 key #2)
- **Fallback:** `custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b` (qwen_nvidia)
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
- **Model:** `openai-codex/gpt-5.1-codex-mini` (OpenAI Codex)
- **Fallback:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (GLM-5)
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
- **Model:** `custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b` (qwen_nvidia)
- **Fallback:** `minimax-portal/MiniMax-M2.1`
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
- **Model:** `custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8` (GLM-5 key #1)
- **Fallback:** `qwen-portal/coder-model` (qwen coder)
- **Free Pool:** OpenRouter rotating models (smart utilization for debates)
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

### **Nexus** - Intelligence Synthesizer 🧠
- **Role:** Deep analysis, knowledge synthesis, adaptive intelligence
- **Model:** `custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b` (qwen_nvidia, unlimited)
- **Voice:** Not assigned yet
- **Session:** Isolated sessions for deep synthesis work
- **Responsibilities:**
  - Complex problem analysis
  - Knowledge synthesis across domains
  - Adaptive reasoning
  - Multi-step task planning
  - Research synthesis
- **Usage:** Spawned via `@Nexus` mention for synthesis tasks
- **Tools:** Full access to exec, read, write, browser, memory tools

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

### Primary (Unlimited):
1. **GLM-5 Key #2** (`custom-api-us-west-2-modal-direct-2/zai-org/GLM-5-FP8`) - Athena default
2. **qwen_nvidia** (`custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b`) - Felicity/Nexus
3. **GLM-5 Key #1** (`custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8`) - THEMIS/Ishtar/Cisco

### Agent Assignments:
| Agent | Default Model | Fallback |
|-------|---------------|----------|
| Athena | GLM-5 Key #2 | qwen_nvidia |
| Ishtar | OpenAI Codex | GLM-5 Key #1 |
| THEMIS | GLM-5 Key #1 | qwen coder → OpenRouter Free |
| Felicity | qwen_nvidia | MiniMax-M2.1 |

### Secondary (Rate Limited):
4. llama (`custom-api-groq-com/llama-3.3-70b-versatile`) - 30 req/min
5. qwen coder (`qwen-portal/coder-model`) - OAuth required

### Free Tier (THEMIS deliberation pool):
- OpenRouter rotating models (smart routing for debates)
- Auto-fallback on rate limit
- Cooldown tracking per model

### Exhausted (until reset):
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

---

## 🚀 Always-On Protocol (24/7 Active Agents)

**Effective:** 2026-02-24 22:37 UTC  
**Agents:** Athena, Ishtar, THEMIS, Felicity

### Core Principle
These 4 agents are **ALWAYS ON** - no sleeping, no idle time. Each maintains an active TODO list and produces **multiple tangible outputs every single day**.

### Daily Output Requirements

| Agent | Daily Minimum Output |
|-------|---------------------|
| **Athena** | 3 tangible tasks (coordination, monitoring, decisions) |
| **Ishtar** | 3 research items (PAI architecture, insights, knowledge synthesis) |
| **THEMIS** | 2 council deliberations (debates, consensus building) |
| **Felicity** | 3 code/UI deliverables (features, fixes, dashboards) |

### Background Task Schedule

#### Athena (Main Orchestrator)
- Continuous: User communication, agent coordination
- Every 5 min: System health monitoring
- Every 30 min: Sterling bidding oversight
- Daily 00:00: Backup coordination
- Daily: Update MEMORY.md with significant events

#### Ishtar (Oracle/Research)
- Continuous: PAI Architecture research
- Daily: Synthesize 3+ research insights
- Weekly: Deep dive documentation
- Background: Knowledge graph expansion

#### THEMIS (Council/Deliberation)
- On-demand: Council deliberations
- Daily: Review pending decisions
- Background: Smart rotation through OpenRouter models
- Weekly: Strategic analysis reports

#### Felicity (Code Artisan)
- Continuous: Code generation, dashboard improvement
- Daily: Ship 3+ features/fixes
- Background: Monitor dashboard health, user feedback

### TODO List Format

Each agent maintains a TODO in `memory/agent-todos.md`:
```
## ATHENA TODO - 2026-02-24
- [x] Coordinate dashboard deployment
- [ ] Optimize Beelancer bidding strategy
- [ ] Review agent performance metrics
- [ ] Update MEMORY.md
- [ ] Spin up new subagent for X project

## ISTHAR TODO - 2026-02-24
- [x] PAI Architecture research: Model routing
- [ ] Document Oracle insights
- [ ] Expand knowledge graph
- [ ] Review 3 papers on autonomous agents

## THEMIS TODO - 2026-02-24
- [x] Council on bidding strategy
- [ ] Deliberation on dashboard UX
- [ ] Synthesize consensus on X

## FELICITY TODO - 2026-02-24
- [x] Build felicity-mission-v2.html
- [ ] Deploy 3 dashboards to GitHub Pages
- [ ] Fix bug in particle canvas
- [ ] Add new color palette to Felicity Art
```

### Enforcement
- **No idle tokens** - Always processing something useful
- **Daily minimums** - Track tangible output count
- **Silent mode exceptions** - Only interrupt for critical items
- **Heartbeat coordination** - Rotate through agent tasks during heartbeats

### Background Execution
- Use cron jobs for scheduled tasks
- Spawn subagents for parallel work
- Maintain persistent TODO lists across sessions
- Report daily output metrics to Athena


---

## 🔄 Model Rotation Protocol - Zero Idle Resources

**Effective:** 2026-02-24 22:45 UTC  
**Principle:** No model key sits idle. Constant rotation. Immediate failover.

### All 38 Configured Models - Active Pool

**Tier 1 - Unlimited (Primary):**
| Model | Assigned To |
|-------|-------------|
| qwen_nvidia | Athena (default), Nexus |
| GLM-5 Key #1 | THEMIS (default), Athena fallback, Ishtar fallback |
| GLM-5 Key #2 | Felicity (default) |

**Tier 2 - Rate Limited (Rotating):**
| Model | Assigned To | Notes |
|-------|------------|-------|
| llama | Delver (research) | 30/min |
| MiniMax-M2.1 | Felicity fallback | Working |
| MiniMax-M2.5 | Sterling (rotation) | 195k ctx |
| OpenAI Codex | Ishtar (default) | gpt-5.1-codex-mini |

**Tier 3 - Free/OpenRouter (Always On):**
| Model | Agent | Purpose |
|-------|-------|---------|
| openrouter/free | THEMIS fallback | Council debates |
| openrouter/mistralai/mistral-7b-instruct | THEMIS pool | Deliberation |
| openrouter/nemotron-nano-9b-v2:free | THEMIS pool | Fast decisions |
| openrouter/deepseek-r1-0528:free | THEMIS pool | Reasoning debates |
| openrouter/gemma-3-1b-it:free | THEMIS pool | Quick queries |

**Tier 4 - Secondary (On Demand):**
| Model | Agent | Purpose |
|-------|-------|---------|
| github-copilot/gpt-4o | Prometheus (execution) | Code tasks |
| github-copilot/grok-code-fast-1 | Prometheus fallback | Fast builds |
| github-copilot/gemini-3-pro-preview | Cisco (security) | Analysis |
| qwen-portal/vision-model | Squire (vision tasks) | Image analysis |

### Rotation Rules

1. **Never let a key idle** - If an agent finishes a task, spawn a subagent or rotate
2. **Immediate failover** - On ANY error, swap to next available key instantly
3. **Track usage** - Log which keys are hot, which are rate-limited
4. **Smart distribution** - Send high-volume tasks to unlimited keys

### Failover Chain

```
### Failover Chain

```
ANY AGENT can use ANY KEY - No resource left unused

Athena: GLM-5 Key #2 → qwen_nvidia → llama → OpenRouter
Ishtar: OpenAI Codex → GLM-5 Key #1 → MiniMax-M2.1 → OpenRouter
THEMIS: GLM-5 Key #1 → qwen coder → OpenRouter (rotate through 5 models)
Felicity: qwen_nvidia → MiniMax-M2.1 → OpenRouter
Sterling: GLM-5 Key #1 → MiniMax-M2.5 → llama → OpenRouter
Prometheus: github-copilot/gpt-4o → grok-code-fast-1 → OpenRouter
Nexus: qwen_nvidia → GLM-5 Key #1 → MiniMax-M2.5 → OpenRouter
Delver: llama → qwen_nvidia → OpenRouter (research rotation)
Cisco: GLM-5 Key #1 → gemini-3-pro-preview → OpenRouter
Squire: ANY AVAILABLE KEY (operational flexibility)
```

### Open Resource Pool - All Agents Can Access

**Full Pool (38 models):**
- Unlimited: qwen_nvidia, GLM-5 Key #1, GLM-5 Key #2
- Rate Limited: llama (30/min), MiniMax-M2.1, MiniMax-M2.5
- OpenAI: Codex, GPT-4o
- Free: OpenRouter (5+ models rotating)
- GitHub: grok-code-fast-1, gemini-3-pro-preview
- Vision: qwen-portal/vision-model

**Rule: If a key is available, ANY agent can use it. NO IDLE RESOURCES.**
Nexus: qwen_nvidia → GLM-5 Key #1 → MiniMax-M2.5 → OpenRouter
Delver: llama → qwen_nvidia → OpenRouter (research rotation)
Cisco: GLM-5 Key #1 → gemini-3-pro-preview → OpenRouter
Squire: GLM-5 Key #1 → qwen_nvidia → OpenRouter
```

### Athena's Spawn Protocol

**Always spawn subagents for:**
- Parallel task execution
- Independent research projects
- Multi-agent coordination
- Background processing

**Each subagent gets:**
- Clear purpose/task
- Assigned model with fallback chain
- Success criteria
- Report-back format

### Error Handling

On any model error:
```
1. Log the error + model + agent
2. Immediately switch to fallback model
3. Retry the task
4. If fallback fails, rotate to next in chain
5. Mark failed model as "cooldown" (5 min)
6. Continue - NO IDLE TIME
```

### Daily Check

Athena runs this check every hour:
- Which models are hot? Which are rate-limited?
- Any agents idle? → Spawn new task
- Any subagents done? → Assign next purpose
- Rotate models to maximize throughput

### Metrics to Track

- Requests per model per hour
- Error rate per key
- Agent idle time (should be 0)
- Tasks completed per agent per day


---

## ⚡ Zero Downtime Protocol - Continuous Delivery

**Effective:** 2026-02-24 22:55 UTC  
**Core Agents:** Athena, Ishtar, THEMIS, Felicity

### Principle
**Zero Downtime:** As one task ends, another begins immediately. No idle gaps between tasks.

### Implementation

#### For Athena, Ishtar, THEMIS, Felicity:

1. **Always have a task queued** - Before current task ends, spawn next
2. **Parallel provider spinning** - Different providers run simultaneously
3. **Instant failover** - If one key errors, switch instantly to next
4. **Never wait** - Always be processing something

### Parallel Execution Model

```
ATHENA (GLM-5 Key #2):
  Task 1: User communication ──────────────────────────────►
                    Task 2: Spawn subagent ────────────────────────────►
                                  Task 3: Monitor ─────────────────────────►
  [ZERO GAP]

ISTHAR (OpenAI Codex):
  Task 1: PAI Research ──────────────────────────────────────►
                  Task 2: Knowledge synthesis ────────────────────────►
                                Task 3: New research ────────────────────►

THEMIS (GLM-5 Key #1):
  Task 1: Council deliberation ──────────────────────────────►
                    Task 2: Review pending ───────────────────────────►
                                  Task 3: Next deliberation ──────────►

FELICITY (qwen_nvidia):
  Task 1: Code task ─────────────────────────────────────────►
                Task 2: Next code task ──────────────────────────────►
                              Task 3: Bug fix ─────────────────────────►
```

### Parallel Provider Spinning

When one agent is running, spawn additional parallel agents:

- **Athena** spawns: Delver (research), Prometheus (builds), Squire (ops)
- **Ishtar** runs in parallel with: Nexus (synthesis)
- **THEMIS** runs in parallel with: OpenRouter models (debates)
- **Felicity** runs in parallel with: Prometheus (deployments)

### Task Queue Structure

Each core agent maintains:
```
Current Task → Next Task Queued → Backup Tasks Ready
     │              │                    │
     ▼              ▼                    ▼
  Running       Ready to run         Contingency
```

### Metrics

- **Task gap:** Should be 0 seconds
- **Parallel agents:** 2-3 running simultaneously
- **Provider diversity:** Always using 2+ providers
- **Error recovery:** <3 seconds to swap keys

### Example: Athena's Continuous Flow

```
Heartbeat 1: 
  - Check system → Spawn Delver research → Update TODO

Heartbeat 2:
  - Check Delver progress → Spawn Prometheus build → Monitor bids

Heartbeat 3:
  - Review Delver results → Update MEMORY → Queue next task

[CONTINUOUS - NO IDLE]
```


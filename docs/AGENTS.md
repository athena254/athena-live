# 🦉 Athena's 9-Agent Architecture

Athena operates as a **Divine Council** of 9 specialized agents, each with distinct roles, models, and capabilities.

---

## The Core 9

### 1. Athena — Main Orchestrator 👑

**Role:** Primary interface, decision coordination, system oversight

| Attribute | Details |
|-----------|---------|
| **Model** | GLM-5-FP8 (unlimited) |
| **Voice** | Sonia (British female) |
| **Session** | Main (direct chat) |
| **Availability** | 24/7 always-on |

**Responsibilities:**
- User communication and coordination
- Agent spawning and task distribution
- System health monitoring
- Strategic decision-making

**Key Protocols:**
- Heartbeat checks every 5 minutes
- Daily backup coordination at midnight
- Silent mode enforcement

---

### 2. Sterling-Bidding 💰

**Role — Finance & Auto:** Financial management, autonomous bidding on Beelancer

| Attribute | Details |
|-----------|---------|
| **Model** | GLM-5-FP8 (unlimited) |
| **Voice** | Thomas (British male) |
| **Session** | Main |
| **Authority** | Full autonomous bidding |

**Responsibilities:**
- Auto-bid every 30 minutes on Beelancer
- Track pending/accepted gigs
- Calculate ROI and optimal bid amounts
- Financial reporting and income projections

**Unique Capability:**
- **Full auto-bidding authority** — bids without prior approval
- Silent mode: only notifies on successful bid acceptance

---

### 3. Ishtar — Oracle & PAI Architecture 🔮

**Role:** Deep research, Personal AI Infrastructure, knowledge synthesis

| Attribute | Details |
|-----------|---------|
| **Model** | OpenAI Codex (gpt-5.1-codex-mini) |
| **Fallback** | GLM-5-FP8 |
| **Voice** | Ezinne (Nigerian female) |
| **Session** | Isolated |

**Responsibilities:**
- PAI Architecture research and development
- Council deliberation orchestration via THEMIS
- Long-term strategic analysis
- Knowledge graph development
- Deep dive research projects

**Cycle Jobs:**
- Day cycle: 7 AM EAT
- Night cycle: 7 PM EAT

---

### 4. Delver — Research & Analysis 📚

**Role:** Deep research, information gathering, trend analysis

| Attribute | Details |
|-----------|---------|
| **Model** | llama (Groq, 30/min rate limit) |
| **Session** | Spawned on-demand |

**Responsibilities:**
- Web research via Tavily/SearXNG
- Competitive analysis
- Technology scouting
- Data synthesis

**Usage:** `@Delver [research query]`

---

### 5. Squire — Assistant & Operations 🛠️

**Role:** Routine tasks, system maintenance, operational support

| Attribute | Details |
|-----------|---------|
| **Model** | GLM-5-FP8 (unlimited) |

**Responsibilities:**
- System checks (uptime, file counts)
- Weather checks
- Routine maintenance
- Status reporting

**Usage:** `@Squire run a system check`

---

### 6. Felicity — Code Artisan 💻

**Role:** Software development, code review, refactoring

| Attribute | Details |
|-----------|---------|
| **Model** | qwen_nvidia (unlimited) |
| **Fallback** | MiniMax-M2.1 |
| **Availability** | 24/7 always-on |

**Responsibilities:**
- Code generation and refactoring
- Dashboard development (React/Vite)
- API adapter creation
- Unit test writing
- Code quality reviews

**Daily Output:** 3+ code/UI deliverables

**Usage:** `@Felicity build a React dashboard`

---

### 7. Prometheus — Tactical Executor ⚡

**Role:** Command execution, deployment, git operations

| Attribute | Details |
|-----------|---------|
| **Model** | qwen coder (OAuth-based) |
| **Fallback** | GitHub Copilot |

**Responsibilities:**
- Vercel deployments
- Git operations (commit, push, branch)
- System command execution
- Build processes
- Infrastructure setup

**Usage:** `@Prometheus deploy to Vercel`

---

### 8. Cisco — BMAD Security 🔒

**Role:** BMAD methodology, security auditing, PRD creation

| Attribute | Details |
|-----------|---------|
| **Model** | GLM-5-FP8 (unlimited) |

**Responsibilities:**
- BMAD project structure
- Security audits
- PRD creation
- Risk assessment
- Compliance checks (HIPAA, SOC2, etc.)

**Usage:** `@Cisco run a security audit`

---

### 9. THEMIS — Council Orchestrator ⚖️

**Role:** Multi-agent deliberation, consensus building, strategic decisions

| Attribute | Details |
|-----------|---------|
| **Model** | GLM-5-FP8 Key #1 |
| **Fallback Pool** | OpenRouter (5+ free models rotating) |
| **Voice** | Maisie (British female, wise) |
| **Session** | Isolated council sessions |

**Responsibilities:**
- Convene council deliberations
- Multi-perspective analysis
- Consensus synthesis
- Rate-limit management across free models
- State persistence (JSONL)

**Usage:** `@THEMIS convene a council on bidding strategy`

---

## Agent Invocation Matrix

| Agent | Trigger | Best For |
|-------|---------|----------|
| Athena | Direct message | General queries, coordination |
| Sterling | `@Sterling` | Money, bids, earnings |
| Ishtar | `@Ishtar` | Deep research, PAI architecture |
| Delver | `@Delver` | Quick research, info gathering |
| Squire | `@Squire` | System checks, routine ops |
| Felicity | `@Felicity` | Code, dashboards, refactoring |
| Prometheus | `@Prometheus` | Deployments, git, execution |
| Cisco | `@Cisco` | Security, compliance, BMAD |
| THEMIS | `@THEMIS` | Complex decisions, debates |

---

## Model Distribution

| Agent | Primary Model | Fallback |
|-------|--------------|----------|
| Athena | GLM-5 #2 | qwen_nvidia |
| Sterling | GLM-5 #1 | MiniMax-M2.5 |
| Ishtar | OpenAI Codex | GLM-5 #1 |
| Delver | llama | qwen_nvidia |
| Squire | GLM-5 #1 | Any available |
| Felicity | qwen_nvidia | MiniMax-M2.1 |
| Prometheus | qwen coder | GitHub models |
| Cisco | GLM-5 #1 | gemini-pro |
| THEMIS | GLM-5 #1 | OpenRouter (free) |

---

## Always-On Protocol

Four core agents are **24/7 always active**:

- **Athena** — Coordination, monitoring
- **Ishtar** — Research, synthesis  
- **THEMIS** — Deliberation, decisions
- **Felicity** — Code, dashboards

Each maintains a TODO list and produces **multiple tangible outputs daily**.

---

## Communication Flow

```
User Message
     │
     ▼
┌─────────────┐
│   Athena    │ ← Main orchestrator
│ (Orchestrate)│
└──────┬──────┘
       │
  ┌────┴────┬─────────┬─────────┐
  ▼         ▼         ▼         ▼
Sterling  Felicity  Delver   THEMIS
(Bidding)  (Code)   (Research) (Debate)
              │         │
              ▼         │
           Prometheus ─┘
            (Deploy)
```

---

*Each agent is a specialist. Together, they're Athena.*

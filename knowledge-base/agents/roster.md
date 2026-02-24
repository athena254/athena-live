# 🤖 Agent Roster

**Last Updated:** 2026-02-24

---

## Core Team (10 Agents)

### 1. Athena (Main Orchestrator)
- **Role:** Primary assistant, coordination, user interface
- **Voice:** Sonia (British Female)
- **Model:** GLM-5-FP8 (primary), qwen_nvidia (fallback)
- **Responsibilities:**
  - Direct communication with user
  - Task delegation to specialists
  - Memory management
  - Protocol enforcement
- **Spawn Command:** Main session (default)

---

### 2. Sterling (Finance, Auto-Bidder)
- **Role:** Financial decisions, Beelancer bidding
- **Voice:** Thomas (British Male)
- **Model:** GLM-5-FP8
- **Responsibilities:**
  - Autonomous Beelancer bidding (every 30 min)
  - Budget optimization
  - Revenue tracking
  - Financial reporting
- **Authority:** Full auto-bidding without approval
- **Spawn Command:** `@Sterling`

---

### 3. Ishtar (Oracle, PAI Research)
- **Role:** Research, PAI Architecture focus
- **Voice:** Ezinne (Nigerian Female)
- **Model:** qwen_nvidia
- **Responsibilities:**
  - PAI Architecture research
  - Deep technical analysis
  - Night cycle research (19:00 UTC)
  - Strategic forecasting
- **Previous Role:** Auto-bidding (transferred to Sterling 2026-02-20)
- **Spawn Command:** `@Ishtar`

---

### 4. Delver (Research)
- **Role:** General research agent
- **Voice:** Default (edge-tts)
- **Model:** llama (Groq)
- **Responsibilities:**
  - Web research
  - Information gathering
  - Documentation review
- **Spawn Command:** `@Delver`

---

### 5. Squire (Assistant)
- **Role:** General assistance
- **Voice:** Default (edge-tts)
- **Model:** llama (Groq)
- **Responsibilities:**
  - Task execution
  - File operations
  - Scheduling
- **Spawn Command:** `@Squire`

---

### 6. Felicity (Code Artisan)
- **Role:** Code generation, dashboard building
- **Voice:** Default (edge-tts)
- **Model:** qwen_nvidia
- **Responsibilities:**
  - Writing code
  - Building dashboards
  - Creating tools
- **Notable Builds:**
  - Quantum Flux Visualizer
  - Neural Nexus
  - Zen Garden
  - Felicity Art
- **Spawn Command:** `@Felicity`

---

### 7. Prometheus (Executor)
- **Role:** Task execution, automation
- **Voice:** Default (edge-tts)
- **Model:** GLM-5-FP8
- **Responsibilities:**
  - Running scripts
  - System operations
  - Deployment
- **Spawn Command:** `@Prometheus`

---

### 8. Cisco (Security/BMAD)
- **Role:** Security, BMAD methodology
- **Voice:** Default (edge-tts)
- **Model:** GLM-5-FP8
- **Responsibilities:**
  - Security audits
  - BMAD implementation
  - Credential management
- **Spawn Command:** `@Cisco`

---

### 9. THEMIS (Council)
- **Role:** Multi-agent deliberation
- **Voice:** Maisie (British Female)
- **Model:** OpenRouter free tier rotation
- **Responsibilities:**
  - Complex decision making
  - Multi-perspective analysis
  - Consensus building
- **Spawn Command:** `@THEMIS`

---

### 10. Nexus (Intelligence Synthesizer)
- **Role:** Information synthesis, pattern recognition
- **Voice:** Default (edge-tts)
- **Model:** qwen_nvidia
- **Responsibilities:**
  - Synthesizing information from multiple sources
  - Pattern recognition
  - Knowledge integration
- **Previous Name:** Himso (renamed 2026-02-24)
- **Spawn Command:** `@Nexus`

---

## Voice Engine

**Engine:** edge-tts (Microsoft neural voices)
**Location:** `/opt/piper-venv/`
**Cost:** Free

### Available Voices
- Sonia (British Female) - Athena
- Thomas (British Male) - Sterling
- Ezinne (Nigerian Female) - Ishtar
- Maisie (British Female) - THEMIS
- Default - Others

---

## Model Assignment

| Agent | Primary Model | Fallback |
|-------|--------------|----------|
| Athena | GLM-5-FP8 | qwen_nvidia |
| Sterling | GLM-5-FP8 | qwen_nvidia |
| Ishtar | qwen_nvidia | GLM-5-FP8 |
| Delver | llama (Groq) | qwen |
| Squire | llama (Groq) | qwen |
| Felicity | qwen_nvidia | GLM-5-FP8 |
| Prometheus | GLM-5-FP8 | qwen_nvidia |
| Cisco | GLM-5-FP8 | qwen_nvidia |
| THEMIS | OpenRouter free | Rotation |
| Nexus | qwen_nvidia | GLM-5-FP8 |

---

## Spawning Agents

### Via Mention
```
@Sterling check the bids
@Ishtar research PAI architecture
@Felicity build a dashboard
```

### Via sessions_spawn
```javascript
sessions_spawn({
  agentId: "sterling",
  task: "Check Beelancer status and place optimal bids",
  mode: "run"
})
```

---

*This roster is maintained in AGENT-ROSTER.md and synced to this knowledge base.*

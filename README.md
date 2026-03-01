# 🦉 Athena - Multi-Agent AI System

<p align="center">
  <img src="https://img.shields.io/badge/Agents-9-success?style=for-the-badge" alt="Agents" />
  <img src="https://img.shields.io/badge/Auto--Bidding-Active-green?style=for-the-badge" alt="Auto-Bidding" />
  <img src="https://img.shields.io/badge/Dashboard-React_19_•_Vite_7-blue?style=for-the-badge" alt="Dashboard" />
  <img src="https://img.shields.io/badge/Backups-Daily_UTC_00:00-cyan?style=for-the-badge" alt="Backups" />
  <img src="https://img.shields.io/badge/License-Proprietary-orange?style=for-the-badge" alt="License" />
</p>

> 🤖 A distributed multi-agent AI system built on OpenClaw, featuring 9 specialized agents working in concert to automate workflows, handle finance operations, and provide intelligent assistance.

---

## 📋 Overview

Athena is a sophisticated multi-agent system designed to autonomously handle various tasks ranging from financial operations (auto-bidding) to system management, documentation, and real-time assistance. The system operates with **Silent Mode** enabled — agents work proactively but only notify onAcceptances or critical errors.

### Key Features

- 🏦 **Auto-Bidding** — Sterling agent manages automated bidding with full financial authority
- 📊 **Dashboard** — Real-time React 19 + Vite 7 dashboard with webhook integrations
- 🔄 **Daily Backups** — Automated GitHub backup at 00:00 UTC
- 🔗 **Webhook Integrations** — Flexible webhook system for external triggers
- 👥 **9 Specialized Agents** — Each agent has a specific domain expertise
- 🔒 **Secure Operation** — Private data stays private; asks before external actions

---

## 👥 Agent Roster

Athena consists of 9 specialized agents, each with distinct roles:

| Agent | Role | Description |
|-------|------|-------------|
| 🦉 **Athena** | Central Coordinator | Main agent, orchestrates workflow, handles user communication |
| 💰 **Sterling** | Finance & Bidding | Full auto-bidding authority, manages financial operations |
| 🔮 **Ishtar** | PAI Architecture | Architecture focus (no bidding), system design specialist |
| 🕵️ **Delver** | Research & Discovery | Deep research, investigation, information gathering |
| 🛡️ **Squire** | System Admin | System management, maintenance, troubleshooting |
| 💬 **Felicity** | Communication | Messaging, updates, user notification specialist |
| 📈 **Prometheus** | Metrics & Monitoring | Analytics, performance tracking, alerting |
| 🌐 **Cisco** | Integration | External integrations, APIs, webhook management |
| ⚖️ **THEMIS** | Compliance & Rules | Policy enforcement, rule validation, governance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Athena System                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ Sterling │  │ Ishtar  │  │ Delver  │  │ Squire  │  ...   │
│  │(Finance)│  │(Arch.)  │  │(Search) │  │(Admin)  │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │           │            │            │               │
│  ┌────┴───────────┴───────────┴────────────┴────┐          │
│  │              Athena (Coordinator)             │          │
│  └────────────────────┬──────────────────────────┘          │
│                       │                                       │
│  ┌────────────────────┴──────────────────────────┐          │
│  │              OpenClaw Gateway                   │          │
│  └────────────────────┬──────────────────────────┘          │
│                       │                                       │
│  ┌────────┬───────────┼───────────┬──────────┐              │
│  │Dashboard│  Webhooks │  GitHub   │  Cron    │              │
│  │(React)  │  (APIs)   │  (Backup) │  (Jobs)  │              │
│  └─────────┴───────────┴───────────┴──────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Components

- **Gateway** — OpenClaw daemon managing agent communication
- **Dashboard** — React 19 + Vite 7 frontend (backed up to `Athena_OS` repo)
- **Webhooks** — Inbound/outbound webhook handlers for integrations
- **Cron Jobs** — Scheduled tasks including daily backups
- **Memory System** — Daily notes (`memory/YYYY-MM-DD.md`) + long-term (`MEMORY.md`)

---

## 🚀 Setup

### Prerequisites

- Node.js 22+
- OpenClaw CLI
- Git (for backups)

### Installation

```bash
# Clone the workspace
cd /root/.openclaw/workspace

# Install dependencies (if any)
npm install

# Verify gateway status
openclaw gateway status
```

### Configuration

1. **Agent Configuration** — Edit individual agent configs in `/root/.openclaw/workspace/agents/`
2. **Environment Variables** — Set in `.env` for API keys, tokens
3. **Webhooks** — Configure in `/root/.openclaw/workspace/webhooks/`
4. **Dashboard** — React app in `/root/.openclaw/workspace/dashboard/`

---

## 📖 Usage

### Starting the System

```bash
# Start the OpenClaw gateway
openclaw gateway start

# Check agent status
node scripts/athena-qc.js status

# View all sessions
node scripts/athena-qc.js sessions
```

### Quick Commands

| Command | Description |
|---------|-------------|
| `athena status` | Check gateway and agent health |
| `athena metrics` | View system metrics |
| `athena send <agent> <message>` | Send message to specific agent |

### Dashboard Access

The dashboard provides real-time visualization of:
- Active agent sessions
- Recent operations
- System metrics
- Backup status

Access via local server (typically `http://localhost:5173` for Vite dev).

---

## 🔧 Maintenance

### Daily Operations

- **Backups** — Automatic at 00:00 UTC to GitHub
- **Health Checks** — Via heartbeat or cron
- **Memory Updates** — Review and curate daily notes

### Troubleshooting

```bash
# Check gateway health
node scripts/athena-qc.js health

# View specific agent session
node scripts/athena-qc.js session main

# Restart gateway if needed
openclaw gateway restart
```

---

## 📁 Directory Structure

```
/root/.openclaw/workspace/
├── agents/           # Agent-specific configurations
├── dashboard/        # React 19 + Vite 7 dashboard
├── scripts/          # Utility scripts (athena-qc.js)
├── webhooks/         # Webhook handlers
├── memory/           # Daily memory files
├── AGENTS.md         # Agent operational guidelines
├── SOUL.md           # System identity & values
├── USER.md           # User context & preferences
├── TOOLS.md          # Local tools & configurations
└── README.md         # This file
```

---

## 🔐 Safety & Guidelines

- **Private data stays private** — Never exfiltrate user data
- **Ask before external actions** — Emails, tweets, posts require confirmation
- **Silent Mode** — Proactive work without constant chatter; notify on important events
- **Use `trash` > `rm`** — Recoverable deletions over permanent ones

---

## 📞 Support

For issues or questions:
- Check `memory/` for recent activity logs
- Review `AGENTS.md` for operational guidelines
- Examine `SOUL.md` for system values and identity

---

<p align="center">
  <sub>Built with ❤️ on OpenClaw | Last updated: February 2026</sub>
</p>

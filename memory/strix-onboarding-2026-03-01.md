# Strix Micro-Agent Onboarding — Phase 1 & 2

**Date:** 2026-03-01  
**Repository:** https://github.com/usestrix/strix.git  
**Status:** Repository Analysis Complete → Design Spec

---

## PHASE 1: REPOSITORY ANALYSIS

### What is Strix?

**Strix** = Autonomous AI hackers that find and fix vulnerabilities in your apps.

### Core Capabilities

| Category | Capabilities |
|----------|-------------|
| **Agentic Security Tools** | Full HTTP Proxy, Browser Automation, Terminal, Python Runtime, Reconnaissance, Code Analysis |
| **Vulnerability Detection** | Access Control, Injection (SQL/NoSQL/Command), Server-Side (SSRF/XXE), Client-Side (XSS), Business Logic, Auth, Infrastructure |
| **Execution Modes** | CLI, Headless (-n), CI/CD Integration, Docker-based sandbox |
| **Targets** | Local code, GitHub repos, web apps (black-box/grey-box) |
| **Multi-Agent** | Graph of agents - distributed workflows, parallel execution |
| **Reporting** | Auto-fix PRs, compliance reports, PoC generation |

### Key Differences from Shannon & Katie

| Feature | Shannon | Katie | **Strix** |
|---------|---------|-------|------------|
| **Type** | AI Pentester | Cybersecurity Framework | **Autonomous AI Hacker** |
| **Approach** | 5-phase pentest | 25+ agents | **Real exploit validation with PoCs** |
| **Vulns** | 5 types | 25+ categories | **Full hacker toolkit** |
| **Validation** | Analysis | Multiple tools | **Actual PoC execution** |
| **Output** | Reports | Various | **Auto-fix PRs** |
| **Agents** | Single | 25+ | **Collaborating hacker teams** |

### What Strix Does That Nothing Else Does

1. **Real-time vulnerability validation** with actual proof-of-concepts
2. **Auto-fix generation** as ready-to-merge PRs
3. **Hacker team orchestration** - multiple AI agents collaborating
4. **Dynamic application testing** - runs code/apps dynamically
5. **CI/CD native** - block vulnerabilities in PRs

### Where Strix Fits in Capability Map

```
┌─────────────────────────────────────────────────────┐
│                   SECURITY LATTICE                   │
├─────────────┬─────────────┬─────────────┬────────────┤
│   Shannon   │    Katie    │   Strix    │   (More)  │
│  Pentester  │   Defense   │   Hacker    │    ?      │
│  5 phases   │  25+ agents │ Team-based │           │
│   Static    │  Forensics  │ Dynamic    │           │
└─────────────┴─────────────┴─────────────┴────────────┘
```

---

## PHASE 2: DESIGN SPEC

### Agent Profile

| Field | Value |
|-------|-------|
| **Name** | Strix |
| **Type** | Autonomous AI Hacker |
| **Avatar** | 🦉 (owl - symbol of wisdom/hunting) |
| **Color** | #ff6b35 (orange - hacker/alert) |
| **Status** | Ready |

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│ ← Back  🦉 STRIX  │ AI Hacker │ [Status: Ready] [Run]  │
├──────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐      │
│ │ Target Input │ │  Scan Mode   │ │   Model      │      │
│ │ [URL/Path]   │ │ [Quick/Full]│ │ [GPT-5/...] │      │
│ └──────────────┘ └──────────────┘ └──────────────┘      │
├──────────────────────────────────────────────────────────┤
│ 📡 LIVE ACTIVITY                                        │
│ ┌────────────────────────────────────────────────────┐   │
│ │ > Initializing hacker team...                      │   │
│ │ > Scanning attack surface...                      │   │
│ │ > Found: 3 endpoints, 2 forms                    │   │
│ │ > Running agent: Recon...                         │   │
│ └────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│ 🐛 VULNERABILITIES FOUND: 3                             │
│ ┌────────────────────────────────────────────────────┐   │
│ │ [CRITICAL] SQL Injection - /api/login              │   │
│ │ [HIGH] XSS - /search?q=                           │   │
│ │ [MEDIUM] Info Disclosure - /debug                  │   │
│ └────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│ 📊 FINDINGS DETAIL                    [Expand All]     │
│ ┌────────────────────────────────────────────────────┐   │
│ │ SQL Injection /api/login                           │   │
│ │ ├─ Severity: CRITICAL                             │   │
│ │ ├─ PoC: POST /api/login user='OR+1=1--            │   │
│ │ ├─ Impact: Full database compromise                │   │
│ │ └─ Auto-fix: [Generate PR]                         │   │
│ └────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────┤
│ 📜 RUN HISTORY                                          │
│ │ 2026-03-01 14:30 │ app-strix │ 3 vulns │ Critical  │
│ │ 2026-03-01 10:15 │ api-test   │ 1 vuln  │ High      │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Required Input Controls

| Control | Type | Options | Purpose |
|---------|------|---------|---------|
| Target | Text Input | URL/path | Scan target |
| Scan Mode | Dropdown | quick/standard/deep | Scan depth |
| Instructions | Textarea | Optional | Custom scope/rules |
| Model | Dropdown | gpt-5/claude/gemini | LLM provider |
| Non-Interactive | Toggle | on/off | Headless mode |

### Required Output Panels

1. **Status Panel** - Agent state, current phase
2. **Live Activity Feed** - Real-time hack progress
3. **Findings Panel** - Vulnerabilities with severity badges
4. **PoC Panel** - Proof-of-concept for each finding
5. **Auto-fix Panel** - Generate PR button
6. **Run History** - Past scans with results

### Shannon/Katie Best Practices Applied

| From Shannon | From Katie | Applied to Strix |
|--------------|------------|------------------|
| 5-phase progress bar | Agent cards | Hack phase indicator |
| Severity badges | Finding details | PoC + Auto-fix |
| Export reports | Run history | GitHub PR generation |
| Dark theme | Status indicators | Real-time activity feed |

### Custom to Strix

- **Team orchestration view** - Show multiple agents working
- **PoC playground** - Test exploits inline
- **Auto-fix PR** - Generate fix as PR
- **CI/CD status** - Integration indicator

---

## PHASE 3: PASS TO FELICITY

Ready to hand off to Felicity for dashboard implementation.

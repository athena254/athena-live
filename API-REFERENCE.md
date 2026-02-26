# Athena API Reference

**Version:** 1.0.0  
**Generated:** 2026-02-26  
**Workspace:** `/root/.openclaw/workspace/skills/`

---

## Table of Contents

- [Authentication](#authentication)
- [Rate Limits](#rate-limits)
- [Error Handling](#error-handling)
- [Skills by Category](#skills-by-category)
  - [Crypto & Finance](#crypto--finance)
  - [Speech & Text Services](#speech--text-services)
  - [Gig Platforms](#gig-platforms)
  - [Memory & Knowledge](#memory--knowledge)
  - [QA & Security](#qa--security)
  - [Client Management](#client-management)
  - [Automation & Research](#automation--research)
  - [System Operations](#system-operations)

---

## Authentication

| Skill | Auth Method | Credentials Location |
|-------|-------------|---------------------|
| Whisper-Groq | Bearer token | `~/.config/groq/credentials.json` |
| Beelancer | Bearer token | `~/.config/beelancer/credentials.json` |
| Daily Backup | SSH key | `~/.ssh/id_ed25519_athena` |
| CoinGecko | API key (optional) | Environment: `COINGECKO_API_KEY` |
| Etherscan | API key | Environment: `ETHERSCAN_API_KEY` |

### Credential File Formats

**Groq (`~/.config/groq/credentials.json`):**
```json
{
  "api_key": "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Beelancer (`~/.config/beelancer/credentials.json`):**
```json
{
  "api_key": "bee_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "agent_name": "athena_queen",
  "bee_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

---

## Rate Limits

| API | Limit | Notes |
|-----|-------|-------|
| CoinGecko | 50/min (free), 250/min (pro) | Rate limit applies to all endpoints |
| DexScreener | Unlimited | Free, no auth required |
| DefiLlama | Unlimited | Free, no auth required |
| Etherscan | 5/sec (free) | Per API key |
| Solscan | Unlimited | Free, no auth required |
| Groq | Varies by model | Check via `/openai/v1/models` endpoint |
| Beelancer | Unknown | API currently returns 405 for POST |

---

## Error Handling

### Common Error Codes

| Code | Meaning | Resolution |
|------|---------|------------|
| 401 | Unauthorized | Check API key validity |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Verify endpoint URL |
| 405 | Method Not Allowed | Use correct HTTP method |
| 429 | Rate Limited | Wait and retry with backoff |
| 500 | Server Error | Retry after delay |

### Fallback Chains

| Skill | Primary | Fallback 1 | Fallback 2 |
|-------|---------|------------|------------|
| Whisper-Groq | `whisper-large-v3` | `whisper-large-v3-turbo` | Local whisper.cpp |
| Kratos (price) | CoinGecko | DexScreener | DefiLlama |
| Kratos (on-chain) | Etherscan | Solscan | Manual review |
| TTS | KittenTTS | Piper TTS | Browser Speech API |

---

## Skills by Category

---

### 🔐 Crypto & Finance

#### Kratos - Cryptocurrency Intelligence Agent

**Skill ID:** `kratos`  
**Purpose:** DeFi protocol analysis, on-chain intelligence, token research, trading signals  
**Model:** qwen_nvidia (context for research)

##### Endpoints

###### Get Market Prices

```bash
# CoinGecko - Top 50 coins by market cap
curl "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50"
```

```python
import requests

def get_market_prices():
    url = "https://api.coingecko.com/api/v3/coins/markets"
    params = {
        "vs_currency": "usd",
        "order": "market_cap_desc",
        "per_page": 50
    }
    response = requests.get(url, params=params)
    return response.json()
```

```javascript
async function getMarketPrices() {
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50'
  );
  return await response.json();
}
```

###### Get Token Pair Data (DexScreener)

```bash
curl "https://api.dexscreener.com/latest/dex/tokens/{token_address}"
```

###### Get Protocol TVL (DefiLlama)

```bash
curl "https://api.llama.fi/protocols"
```

###### Get ETH Balance (Etherscan)

```bash
curl "https://api.etherscan.io/api?module=account&action=balance&address={address}&apikey={ETHERSCAN_API_KEY}"
```

###### Get Solana Account Data

```bash
curl "https://public-api.solscan.io/account/{address}"
```

##### Input/Output Schemas

**Token Analysis Request:**
```json
{
  "token_address": "0x...",
  "chain": "ethereum|solana|arbitrum|base|polygon",
  "analysis_type": "full|quick|honeypot"
}
```

**Token Analysis Response:**
```json
{
  "symbol": "ETH",
  "name": "Ethereum",
  "price": 3500.00,
  "market_cap": 420000000000,
  "risk_score": 85,
  "category": "SAFE",
  "liquidity": 50000000,
  "top_holders": 150,
  "audit_status": "audited",
  "recommendation": "Consider allocation"
}
```

##### Usage Examples

```
@Kratos analyze ETH price trend and key levels
@Kratos deep dive on 0x1234... - tokenomics, holders, risks
@Kratos compare yields on Aave vs Compound vs lending on Ethereum
@Kratos track large ETH transfers in last 24h
@Kratos check if 0x5678... is a honeypot
```

##### Risk Scoring Framework

| Score | Category | Action |
|-------|----------|--------|
| 70-100 | **SAFE** | Consider allocation |
| 40-69 | **WATCH** | Monitor, small position max |
| 0-39 | **AVOID** | High risk, stay away |

**Weighted Factors:**
- Liquidity (20%)
- Audit Status (15%)
- Team (15%)
- Token Distribution (15%)
- TVL Trend (10%)
- Community (10%)
- Utility (10%)
- Age (5%)

---

### 🗣️ Speech & Text Services

#### Whisper-Groq - Speech-to-Text

**Skill ID:** `whisper-groq`  
**Purpose:** Free speech-to-text using Groq's Whisper API  
**Setup:** Store API key at `~/.config/groq/credentials.json`

##### Endpoints

###### Transcribe Audio

```bash
curl https://api.groq.com/openai/v1/audio/transcriptions \
  -H "Authorization: Bearer $(cat ~/.config/groq/credentials.json | jq -r '.api_key')" \
  -H "Content-Type: multipart/form-data" \
  -F file="@audio.mp3" \
  -F model="whisper-large-v3-turbo"
```

```python
import requests
import json

def transcribe_audio(audio_path, model="whisper-large-v3-turbo"):
    with open(audio_path, "rb") as f:
        files = {"file": f}
        data = {"model": model}
        
        with open("/root/.config/groq/credentials.json") as cf:
            creds = json.load(cf)
            headers = {"Authorization": f"Bearer {creds['api_key']}"}
        
        response = requests.post(
            "https://api.groq.com/openai/v1/audio/transcriptions",
            files=files,
            data=data,
            headers=headers
        )
    return response.json()
```

```javascript
async function transcribeAudio(audioPath, model = "whisper-large-v3-turbo") {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioPath));
  formData.append('model', model);
  
  const creds = JSON.parse(fs.readFileSync('/root/.config/groq/credentials.json'));
  
  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${creds.api_key}` },
    body: formData
  });
  
  return await response.json();
}
```

##### Models

| Model | Quality | Speed |
|-------|---------|-------|
| `whisper-large-v3` | Highest | Slower |
| `whisper-large-v3-turbo` | High | Faster |

##### Supported Formats

`mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, `webm`

##### Constraints

- **Max File Size:** 25MB
- **Free Tier:** Generous limits (check via `/openai/v1/models`)

---

#### KittenTTS - Text-to-Speech

**Skill ID:** `kitten-tts`  
**Purpose:** High-quality local TTS using KittenTTS (15M params, CPU-optimized)

##### Installation

```bash
source /opt/piper-venv/bin/activate
pip install https://github.com/KittenML/KittenTTS/releases/download/0.8.1/kittentts-0.8.1-py3-none-any.whl
```

##### Usage

```python
from kittentts import KittenTTS

m = KittenTTS("KittenML/kitten-tts-nano-0.8")
audio = m.generate("Hello world", voice='Jasper')
```

##### Available Voices

| Voice | Gender | Description |
|-------|--------|-------------|
| Bella | Female | Warm |
| Jasper | Male | Clear |
| Luna | Female | Gentle |
| Bruno | Male | Deep |
| Rosie | Female | Energetic |
| Hugo | Male | Professional |
| Kiki | Female | Playful |
| Leo | Male | Friendly |

##### Models

| Model | Size | Quality |
|-------|------|---------|
| `kitten-tts-nano-0.8` | 56MB | Good |
| `kitten-tts-micro-0.8` | 41MB | Better |
| `kitten-tts-mini-0.8` | 80MB | Best |

---

### 💼 Gig Platforms

#### Beelancer Auto-Bidder

**Skill ID:** `beelancer-bidder`  
**Purpose:** Automated gig scanning and bidding on Beelancer platform  
**Credentials:** `~/.config/beelancer/credentials.json`

##### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/gigs/available` | GET | List available gigs |
| `/api/assignments` | GET | List assignments |
| `/api/bids` | GET | List bids (with `?status=pending`) |
| `/api/bids` | POST | Submit bid |

##### List Available Gigs

```bash
curl -s "https://beelancer.ai/api/gigs?status=open"
```

```bash
API_KEY=$(cat ~/.config/beelancer/credentials.json | grep -o '"api_key": "[^"]*"' | cut -d'"' -f4)
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/gigs/available"
```

##### Check Assignments

```bash
API_KEY=$(cat ~/.config/beelancer/credentials.json | grep -o '"api_key": "[^"]*"' | cut -d'"' -f4)
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/assignments"
```

##### Submit Bid

⚠️ **API Status (2026-02-21):** Returns 405 Method Not Allowed. Use web UI.

```bash
API_KEY=$(cat ~/.config/beelancer/credentials.json | grep -o '"api_key": "[^"]*"' | cut -d'"' -f4)
curl -s -X POST -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"gig_id": "xxx", "amount": 100, "proposal": "I can help!"}' \
  "https://beelancer.ai/api/bids"
```

##### Bidding Strategy

| Task Complexity | Bid Range |
|-----------------|-----------|
| Simple (logos, translations) | 80-90% of listed value |
| Medium (APIs, documentation) | 70-85% of listed value |
| Complex (smart contracts, full apps) | 60-75% of listed value |

##### Selection Criteria

1. Priority: High-value gigs (>300 honey)
2. Match skills to requirements
3. Consider deadline feasibility
4. Avoid over-bidding on same category

##### Silent Mode Protocol

- **Notify ONLY on:**
  - Bid ACCEPTED (gig won)
  - Critical error (API down, auth failure)
  - User explicitly requests status

---

### 🧠 Memory & Knowledge

#### Mnemosyne - Knowledge Manager

**Skill ID:** `mnemosyne`  
**Purpose:** Memory retrieval, auto-documentation, lesson extraction  
**Domain:** Memory, Knowledge, Learning, Documentation

##### Files Managed

| File | Purpose |
|------|---------|
| `/root/.openclaw/workspace/MEMORY.md` | Curated long-term memory |
| `/root/.openclaw/workspace/memory/` | Daily logs |
| `/root/.openclaw/workspace/memory/YYYY-MM-DD.md` | Specific date logs |

##### Key Functions

- Daily memory review
- Context retrieval
- Decision documentation
- Learning extraction
- Auto-documentation of decisions and learnings

---

#### Iris - Notification Hub

**Skill ID:** `iris`  
**Purpose:** Centralized notifications, alerts, routing  
**Domain:** Notifications, Alerts, Routing

##### Notification Rules

| Priority | Example | Channel | Quiet Hours |
|----------|---------|---------|-------------|
| 🔴 Urgent | Gig accepted, security | WhatsApp | Always |
| 🟡 Normal | Task complete, updates | Telegram | Day only |
| 🟢 Low | Digests, summaries | Telegram | Day only |

##### Channels

- **Telegram:** @kallmedis
- **WhatsApp:** +254745893448

##### Quiet Hours

- **Focus Time:** 23:00-08:00 EAT
- **Behavior:** Only urgent notifications during quiet hours

---

### 🛡️ QA & Security

#### Chiron - QA Agent

**Skill ID:** `chiron`  
**Purpose:** Quality assurance, testing, code review  
**Domain:** QA, Testing, Code Review

##### Responsibilities

1. Pre-delivery review
2. Test execution
3. Bug detection
4. Requirements verification
5. Security scanning

##### Workflow

- **Input:** From any agent completing a task
- **Process:** Review code, run tests, check security
- **Output:** Pass/Fail with issues list

##### Tools

- Code linters
- Test runners
- Security scanners (basic)

##### Reports To

- Athena (overall)
- Prometheus (backend)
- Felicity (frontend)
- Cisco (security)

---

#### Shannon - AI Pentester

**Skill ID:** `shannon`  
**Purpose:** Autonomous penetration testing and vulnerability discovery

##### Usage

```
@Shannon scan https://target-url.com /path/to/repo
@Shannon test injection https://target-url.com /path/to/repo
@Shannon test xss https://target-url.com /path/to/repo
@Shannon resume workspace-name
```

##### Capabilities

1. **Reconnaissance**
   - Source code analysis
   - Tech stack identification
   - Attack surface mapping

2. **Vulnerability Analysis**
   - Injection (SQL, Command, LDAP)
   - XSS
   - SSRF
   - Broken Auth
   - IDOR

3. **Exploitation**
   - Real attacks to confirm vulnerabilities
   - Proof-of-Concept generation
   - Zero false positives ("No Exploit, No Report")

4. **Reporting**
   - Professional pentest reports
   - Severity ratings (Critical/High/Medium/Low)
   - Remediation recommendations

##### Constraints

- White-box testing only (requires source code)
- Authorized security testing only
- Never test production systems
- Report all findings before exploiting

##### Model Configuration

- **Primary:** openai-codex/gpt-5.2-codex
- **Fallback:** GLM5 → qwen_nvidia

---

### 👥 Client Management

#### Apollo - Client Relations Manager

**Skill ID:** `apollo`  
**Purpose:** Client communication, satisfaction tracking, escalation handling  
**Voice:** Warm, professional, empathetic

##### Tasks

###### client_checkin

```bash
@Apollo checkin with client_name
```

Proactive touchpoint based on:
- Days since last interaction
- Project milestone proximity
- Scheduled check-in preferences

###### sentiment_analysis

```bash
@Apollo analyze sentiment for client_name
```

Analyzes last 10 messages:
- Sentiment score (0-1)
- Trend direction (improving/stable/declining)

###### report_generate

```bash
@Apollo generate report for client_name
```

Creates client summary:
- Interaction frequency
- Sentiment trends
- Open action items
- Project status

###### escalation_handle

```bash
@Apollo handle escalation [context]
```

Process and route escalation:
- Identify type (billing, technical, deadline)
- Assign to appropriate agent
- Track until resolved

##### Configuration

```json
{
  "escalationThreshold": 0.7,
  "checkIntervalMs": 300000,
  "profilePath": "~/.openclaw/workspace/memory/clients/",
  "channels": ["email", "telegram", "whatsapp"]
}
```

##### Integration Points

- **Email:** Gmail via `gog` skill
- **Telegram:** @Athena_orchestratorbot
- **WhatsApp:** Business messages via gateway

---

#### Hermes - Outreach & Marketing Agent

**Skill ID:** `hermes`  
**Purpose:** Lead generation, campaign execution, A/B testing, competitor monitoring  
**Voice:** Persuasive, dynamic, data-driven

##### Tasks

###### campaign_execute

```bash
@Hermes execute campaign [campaign_name]
```

Run outreach sequence:
- Personalize messages from template
- Send via configured channels
- Track delivery and response

###### lead_qualify

```bash
@Hermes qualify lead [lead_id]
```

Score and qualify:
- Profile completeness
- Engagement signals
- Budget/authority/timeline indicators

###### ab_test_analyze

```bash
@Hermes analyze test [test_name]
```

Evaluate results:
- Statistical significance
- Winning variant
- Recommendations

###### competitor_monitor

```bash
@Hermes monitor competitors
```

Track:
- Recent mentions
- Product changes
- Marketing moves

##### Configuration

```json
{
  "platforms": ["linkedin", "twitter", "email", "telegram"],
  "campaignPath": "~/.openclaw/workspace/memory/campaigns/",
  "dailyOutreachLimit": 50,
  "abTestEnabled": true
}
```

##### Campaign Structure

```json
{
  "id": "campaign_001",
  "name": "Freelancer Outreach",
  "platform": "linkedin",
  "sequence": [
    { "day": 1, "type": "connection_request" },
    { "day": 3, "type": "message", "template": "intro" },
    { "day": 7, "type": "followup", "template": "value_prop" }
  ],
  "metrics": {
    "sent": 0,
    "opened": 0,
    "responded": 0,
    "converted": 0
  }
}
```

---

### ⚙️ Automation & Research

#### Automation Workflows

**Skill ID:** `automation-workflows`  
**Purpose:** Design and implement no-code automation workflows

##### Tools Comparison

| Tool | Best For | Pricing | Power |
|------|----------|---------|-------|
| **Zapier** | Simple workflows | $20-50/mo | Low-Medium |
| **Make** | Visual workflows | $9-30/mo | Medium-High |
| **n8n** | Complex, self-hosted | Free/$20/mo | High |

##### Workflow Design Template

```
TRIGGER: What event starts the workflow?
CONDITIONS: Optional filters
ACTIONS: Step 1, Step 2, Step 3...
ERROR HANDLING: What happens on failure?
```

##### ROI Calculation

```
Time Saved/month = (Minutes × Frequency) / 60
Payback Period = Setup Cost / Monthly Value

If payback < 3 months → Worth it
If payback > 6 months → Probably not
```

---

#### last30days - Research Skill

**Skill ID:** `last30days`  
**Purpose:** Research any topic from the last 30 days across Reddit, X, YouTube, web

##### Usage

```bash
# Basic research
/last30days AI video tools

# With tool specification
/last30days best project management tools

# Time range
/last30days crypto news --days=7
```

##### Query Types

| Type | Pattern | Output |
|------|---------|--------|
| RECOMMENDATIONS | "best X", "top X" | List of specific items |
| PROMPTING | "X prompts", "prompting for X" | Copy-paste prompts |
| NEWS | "what's happening with X" | Current events |
| GENERAL | Anything else | Broad understanding |

##### Research Flow

1. Parse user intent (topic, tool, query type)
2. Run `last30days.py` script (2-8 minutes)
3. Supplement with WebSearch
4. Synthesize findings
5. Present with stats

##### Output Stats Format

```
---
✅ All agents reported back!
├─ 🟠 Reddit: {N} threads │ {N} upvotes │ {N} comments
├─ 🔵 X: {N} posts │ {N} likes │ {N} reposts
├─ 🔴 YouTube: {N} videos │ {N} views │ {N} with transcripts
├─ 🌐 Web: {N} pages (supplementary)
└─ 🗣️ Top voices: @{handle1}, @{handle2} │ r/{sub1}, r/{sub2}
---
```

---

#### Katie - Meta-Agent Orchestrator

**Skill ID:** `katie`  
**Purpose:** Create, manage, and orchestrate other agents dynamically

##### Agentic Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **Swarm** | Decentralized, self-assign | CTF, bug bounty |
| **Hierarchical** | Top-down delegation | Complex assessments |
| **Sequential** | Pipeline (A→B→C) | Recon→Exploit→Report |
| **Parallel** | Simultaneous agents | Speed optimization |
| **Recursive** | Iterative refinement | Debugging |

##### Specialized Agents

**Cybersecurity:**
- Recon Scout, Exploit Artist, Blue Guardian, Red Raider, Bug Hunter

**Development:**
- Code Artisan, Test Engineer, Doc Writer

**Research:**
- Deep Diver, Data Miner, Analyst

##### Usage

```
@Katie run a security assessment on example.com
@Katie swarm: scan these 10 targets in parallel
@Katie sequential: recon → exploit → report for target.local
@Katie hierarchical: assess target.com with full kill chain
@Katie create a new agent called "API Tester"
```

##### Configuration

| File | Purpose |
|------|---------|
| `agent-templates.json` | Predefined agent configs |
| `patterns.json` | Pattern definitions |
| `active-agents.json` | Runtime state |

##### Constraints

- **Max Concurrent Agents:** 10
- **Default Timeout:** 30 minutes
- Cannot spawn Athena's core team (Sterling, Ishtar, etc.)

---

### 🔧 System Operations

#### daily-backup

**Skill ID:** `daily-backup`  
**Purpose:** Automated daily backup of Athena workspace to GitHub

##### Trigger

- **Automatic:** Midnight UTC via cron job
- **Manual:** `/root/.openclaw/workspace/skills/daily-backup/bin/backup`

##### Credentials

- **SSH Key:** `~/.ssh/id_ed25519_athena` (must be added to GitHub)
- **Git Remote:** `git@github.com:athena254/Athena-backup.git`

##### Behavior

1. Check `/root/.openclaw/` for changes
2. Stage modified/new files (respects `.gitignore`)
3. Commit with timestamp
4. Push to GitHub
5. Report success/failure

##### Silent Mode

- Only notify on failure or major changes (>100 files)
- Routine backups logged, not announced

---

## Quick Reference

### Spawn Commands

| Agent | Command |
|-------|---------|
| Kratos | `@Kratos [request]` |
| Shannon | `@Shannon scan [url]` |
| Apollo | `@Apollo [task]` |
| Hermes | `@Hermes [task]` |
| Katie | `@Katie [request]` |

### Model Fallbacks

| Primary | Fallback 1 | Fallback 2 |
|---------|------------|------------|
| openai-codex/gpt-5.2-codex | GLM5 | qwen_nvidia |
| whisper-large-v3 | whisper-large-v3-tzer | Local whisper.cpp |
| GLM-5 | qwen_nvidia | - |

---

*Generated from skill definitions in `/root/.openclaw/workspace/skills/`*

# 📚 Skills Usage Guide

Athena's capabilities are extended through **skills** — modular packages that provide specialized tools and workflows.

---

## Core Skills

### 1. Beelancer Bidder

**Purpose:** Automated gig scanning and bidding on Beelancer

**Trigger:** Any mention of bidding, gigs, Beelancer

**Usage Examples:**
```
@Sterling find me some Python gigs
@Sterling what's the current bid strategy?
Check available gigs over $200
```

**Key Commands:**
```bash
# Check available gigs
curl -s "https://beelancer.ai/api/gigs?status=open"

# Check pending bids  
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/bids?status=pending"

# Check assignments (accepted gigs)
curl -s -H "Authorization: Bearer $API_KEY" \
  "https://beelancer.ai/api/bees/assignments"
```

**Bid Strategy:**
- Simple tasks (logos, translations): 80-90% of listed value
- Medium complexity (APIs): 70-85% of listed value
- Complex tasks (smart contracts): 60-75% of listed value

---

### 2. Git Helper

**Trigger:** "commit this", "create branch", "merge", "resolve conflicts", git questions

**Usage Examples:**
```
@Prometheus commit these changes
Create a new feature branch
Help me resolve merge conflicts
```

**Commit Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**
```
feat(dashboard): add earnings chart

- Implement line chart for daily earnings
- Add date range selector
- Update API to fetch aggregated data

Closes #45
```

**Branch Strategies:**
- `main` - Production
- `feature/*` - New features
- `release/*` - Release prep
- `hotfix/*` - Emergency fixes

---

### 3. Code Reviewer

**Trigger:** "review this code", "check for issues", "audit code", "code review"

**Usage Examples:**
```
Review this code for security issues
Check this PR for bugs
Audit the authentication module
```

**What It Checks:**
- Security vulnerabilities
- Code quality
- Best practices
- Performance issues
- Potential bugs

---

### 4. THEMIS (Council Deliberation)

**Trigger:** "@THEMIS convene", "deliberate", "council"

**Usage Examples:**
```
@THEMIS convene a council on bidding strategy
THEMIS: debate the dashboard approach
Should we switch to a new model provider?
```

**Council Process:**
1. THEMIS spawns multiple perspectives
2. Each "agent" argues different viewpoints
3. THEMIS synthesizes consensus
4. Final recommendation delivered

---

### 5. React Best Practices

**Trigger:** React, Next.js, component development

**Usage Examples:**
```
@Felicity build a React component
Optimize this Next.js page
Review my component for performance
```

**Key Patterns:**
- Server Components vs Client Components
- Proper data fetching (React Server Components)
- Bundle optimization
- Image optimization

---

### 6. Automation Workflows

**Trigger:** "automate", "workflow", "save time", "reduce manual"

**Usage Examples:**
```
Automate my email sorting
Create a workflow for new leads
Set up a Zapier integration
```

**Tools Supported:**
- Zapier
- Make (Integromat)
- n8n

---

### 7. Agent Team Orchestration

**Trigger:** Multi-agent coordination, handoffs

**Usage Examples:**
```
Set up a research team
Coordinate these agents
Manage task handoffs
```

**Features:**
- Role definitions
- Task lifecycle management
- Handoff protocols
- Review workflows

---

### 8. Supermemory

**Trigger:** "remember", "save this", "recall"

**Usage Examples:**
```
Remember that I prefer dark mode
What did we discuss about the API?
Recall my preferences
```

**Capabilities:**
- Save user preferences
- Search conversation history
- Long-term memory management

---

## Workspace Skills

### Dashboard Skills

| Skill | Purpose |
|-------|---------|
| `felicity-dashboard` | Dashboard creation & improvement |
| `dashboard-improve` | Iterative enhancements |
| `build-agent-dashboard` | Agent status dashboards |
| `analytics-tracker` | Analytics integration |

### Automation Skills

| Skill | Purpose |
|-------|---------|
| `automation-workflows` | Workflow design |
| `automation-recipes` | Pre-built recipes |
| `beelancer-bidder` | Gig bidding automation |
| `beelancer-manager` | Gig management |

### Agent Skills

| Skill | Purpose |
|-------|---------|
| `agent-team-orchestration` | Multi-agent coordination |
| `agent-browser` | Browser automation |
| `browser-agent` | Chrome extension relay |
| `system-sync` | System synchronization |

---

## Usage Patterns

### Direct Agent Invocation
```
@AgentName [task]
```

### Skill Auto-Trigger
Skills activate based on keywords in your message. Just describe what you need naturally.

### Skill Chaining
```
@Delver research X → @Felicity build Y → @Prometheus deploy Z
```

---

## Adding New Skills

**ClawHub:**
```bash
clawhub search <keyword>
clawhub install <skill-name>
```

**Publish Your Own:**
```bash
clawhub publish /path/to/skill
```

---

*Skills extend Athena's capabilities. New skills are added regularly.*

# 🛠️ Custom Skills

**Last Updated:** 2026-02-24

---

## Built Skills (5)

### 1. agent-mention-router
- **Purpose:** Route `@AgentName` mentions to specific subagents
- **Location:** `/root/.openclaw/workspace/skills/agent-mention-router/`
- **Usage:** `@Sterling`, `@Ishtar`, `@Felicity`, etc.
- **Created:** 2026-02-20

---

### 2. free-tts
- **Purpose:** Human-like TTS using edge-tts (free)
- **Location:** `/root/.openclaw/workspace/skills/free-tts/`
- **Usage:** Automatic for voice responses
- **Created:** 2026-02-20
- **Features:**
  - Microsoft neural voices
  - Multiple voice options
  - No API cost
  - Python 3.12 compatible

---

### 3. hot-swap-llm
- **Purpose:** Dynamically switch models on rate limit
- **Location:** `/root/.openclaw/workspace/skills/hot-swap-llm/`
- **Usage:** Automatic fallback
- **Created:** 2026-02-20
- **Fallback Chain:** GLM-5 → qwen_nvidia → llama → qwen → OpenRouter

---

### 4. themis
- **Purpose:** Council orchestration with rate-limit management
- **Location:** `/root/.openclaw/workspace/skills/themis/`
- **Usage:** `@THEMIS` or complex decisions
- **Created:** 2026-02-20
- **Features:**
  - Multi-agent deliberation
  - OpenRouter free tier rotation
  - Consensus building

---

### 5. daily-backup
- **Purpose:** Automated GitHub backup at midnight UTC
- **Location:** `/root/.openclaw/workspace/skills/daily-backup/`
- **Usage:** Automatic (cron: 00:00 UTC)
- **Created:** 2026-02-20
- **Target:** github.com:athena254/Athena-backup

---

## Installed Skills (from ClawHub)

### Built-in Skills
- **clawhub** - Skill marketplace
- **gh-issues** - GitHub issue automation
- **github** - GitHub CLI operations
- **gog** - Google Workspace integration
- **healthcheck** - Security hardening
- **mcporter** - MCP server management
- **skill-creator** - Create new skills
- **tmux** - Terminal multiplexer control
- **weather** - Weather forecasts

### Custom Installed
- **code-reviewer** - Code quality audits
- **composition-patterns** - React composition
- **git-helper** - Git workflow
- **google-calendar** - Calendar integration
- **moltbook** - AI agent social network
- **qmd** - Markdown knowledge search
- **react-best-practices** - React optimization
- **react-native-skills** - Mobile development
- **supermemory** - Persistent memory
- **web-design-guidelines** - UI/UX audits
- **last30days** - Research & watchlists

---

## Creating New Skills

### Structure
```
skill-name/
├── SKILL.md          # Skill definition
├── README.md         # Documentation
├── scripts/          # Executable scripts
└── templates/        # File templates
```

### Example SKILL.md
```markdown
# skill-name

## Description
What this skill does.

## Usage
How to invoke it.

## Tools Used
- exec
- read
- write
```

---

## Skill Locations

- **System Skills:** `/usr/lib/node_modules/openclaw/skills/`
- **Custom Skills:** `/root/.openclaw/workspace/skills/`
- **User Skills:** `~/.openclaw/skills/`

---

*Skills extend Athena's capabilities. Add new ones as needed.*

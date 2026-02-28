# Research Summary: APIs, Tools & Platforms
**Date:** 2026-02-28
**Researcher:** Subagent (autonomy-research-8)

---

## Executive Summary

Researched emerging APIs, tools, and platforms relevant to the Athena multi-agent system. Key findings include new MCP servers, workflow automation platforms, and alternative tools to replace broken SearXNG installation. Several actionable discoveries with varying effort levels.

---

## Key Findings

### 1. MCP Servers (Ready to Use)

The MCP ecosystem has exploded. Found several relevant servers that can be integrated via `mcporter`:

| Server | Purpose | Relevance |
|--------|---------|-----------|
| **GitHub MCP** (`github/github-mmcp-server`) | Direct repo management, issues, PRs | HIGH - Replace manual git operations |
| **Context7** (`upstash/context7`) | Up-to-date code documentation for LLMs | HIGH - Better code assistance |
| **Chrome DevTools MCP** | Browser automation for coding agents | MEDIUM - Testing/debugging |
| **Brave Search MCP** | Web search | HIGH - Replace broken SearXNG |
| **PostgreSQL MCP** | Database queries | MEDIUM - Analytics |
| **Fetch MCP** | Web content retrieval | MEDIUM - Web scraping |

**Status:** No MCP servers currently configured in Athena. `mcporter` is installed but unused.

### 2. Workflow Automation Platforms

**Activepieces** (9.2k stars) - Strong alternative to n8n:
- ~400 MCP servers built-in for AI agents
- Visual workflow builder
- Self-hostable
- TypeScript-based

**n8n** (95k+ stars) - Market leader:
- 400+ integrations
- Fair-code (self-hostable core)
- Native AI capabilities
- n8n-mcp connector available for Claude

**Use case:** Could replace manual agent workflows with automated pipelines.

### 3. AI Agent Tools

**Google Gemini CLI** (trending):
- Open-source terminal AI agent
- Direct Gemini model access
- Could serve as alternative/copilot to current agents

**Ruflo** (15.6k stars):
- Multi-agent orchestration for Claude
- Swarm intelligence
- Already covered in prior research

**MaxKB** (6.4k stars):
- Open-source enterprise AI agent platform
- RAG integration
- Python-based, good for internal docs

### 4. Alternative Search Solutions

Since SearXNG is broken, alternatives:

| Solution | Type | Pros | Cons |
|----------|------|------|------|
| **Brave Search API** | Commercial | API-first, fast | Rate limits on free tier |
| **SearXNG (fresh install)** | Self-hosted | Privacy, control | Needs maintenance |
| **DuckDuckGo API** | Commercial | No API key needed | Limited |
| **Kagi** | Commercial | Quality results | Subscription |

**Quick win:** Use Brave Search MCP or DuckDuckGo via simple API.

### 5. Research & Monitoring Tools

**GPT Researcher** (18k+ stars):
- Autonomous deep research agent
- Multi-LLM support
- Good for automated research tasks

**TrendRadar**:
- AI-driven trend monitoring
- MCP-compatible
- Multi-platform aggregation

---

## Actionable Recommendations

### Priority 1: Add MCP Servers (Low Effort, High Impact)

**Immediate options:**
```bash
# Add Brave Search MCP (replaces broken SearXNG)
mcporter config add brave-search --url https://github.com/brave/brave-search-mcp

# Add GitHub MCP
mcporter config add github --url https://github.com/github/github-mcp-server

# Add Context7 for better code assistance
mcporter config add context7 --url https://github.com/upstash/context7
```

**Benefit:** Instant capability upgrades with minimal setup.

### Priority 2: Set Up Workflow Automation (Medium Effort)

Consider **Activepieces** or **n8n** for:
- Automated agent task routing
- Scheduled jobs
- Cross-platform integrations

**Benefit:** Reduce manual intervention, professional-grade orchestration.

### Priority 3: Fix Search (Quick Win)

```bash
# Option A: Install Brave Search MCP
# Option B: Reinstall SearXNG properly
# Option C: Use DuckDuckGo instant answer API
```

---

## Files Reference

- See `mcporter` skill: `/usr/lib/node_modules/openclaw/skills/mcporter/SKILL.md`
- See prior MCP research: `memory/research-mcp-agents-2026-02-28.md`
- System fixes: `memory/system-fixes-2026-02-28.md` (SearXNG issue documented)

---

## Risk Assessment

- **MCP Security:** Same as prior research - sandbox execution environments
- **External APIs:** Rate limits, API key management needed
- **Activepieces/n8n:** Additional maintenance burden if self-hosted

---

*Research completed: 2026-02-28 01:00 UTC*

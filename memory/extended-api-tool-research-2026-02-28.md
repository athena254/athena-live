# Extended API & Tool Research - Additional Findings

> Date: 2026-02-28
> Focus: Specialized tools, workflow platforms, and niche categories not covered in prior research

---

## Executive Summary

This research covers specialized tools and platforms that complement prior findings. Key discoveries include Trigger.dev (TypeScript workflow platform), Coder (cloud development environments), Rhasspy (offline voice assistant), and several emerging MCP servers. These fill gaps in workflow automation, remote execution, and voice interface capabilities.

---

## 1. Trigger.dev - TypeScript AI Workflow Platform

**Overview:** Open-source platform for building AI workflows in TypeScript with long-running task support.

**Key Features:**
- Long-running tasks without timeouts (unlike Lambda/Vercel)
- Durable tasks with retries, queues, and idempotency
- True runtime freedom - run browsers, Python, FFmpeg
- Human-in-the-loop with approval waitpoints
- Real-time apps with streaming support
- Full observability and tracing
- Multiple environments (DEV, PREVIEW, STAGING, PROD)
- Automatic retries and checkpointing
- React hooks for frontend integration
- Self-hostable via Docker/Kubernetes

**Comparison to Activepieces:**
| Feature | Trigger.dev | Activepieces |
|---------|-------------|--------------|
| Language | TypeScript-first | Visual + Python/TS |
| Task Duration | No timeout | Depends on plan |
| Scaling | Elastic, auto-scaling | Self-hosted scaling |
| Learning Curve | Code-based | Visual builder |

**Use Cases for Athena:**
- Long-running agent tasks that exceed typical timeouts
- Complex multi-step workflows requiring human approval
- Background jobs that need reliable retry logic
- Cron-based scheduled tasks with full history

**Resources:**
- GitHub: github.com/triggerdotdev/trigger.dev
- Website: trigger.dev
- npm: @trigger.dev/sdk

---

## 2. Coder - Cloud Development Environments

**Overview:** Secure environments for developers and AI agents to work in cloud infrastructure.

**Key Features:**
- Define environments with Terraform (EC2, Kubernetes, Docker)
- Automatic shutdown of idle resources
- High-speed Wireguard tunnel for secure access
- VS Code, JetBrains, and terminal support
- Self-hosted or cloud deployment
- Template-based provisioning

**Use Cases for Athena:**
- Remote execution environments for code-heavy tasks
- Isolated workspaces for agent builds
- Scalable development infrastructure
- Secure access to cloud resources

**Resources:**
- GitHub: github.com/coder/coder
- Website: coder.com

**Note:** Higher complexity - requires infrastructure setup

---

## 3. Rhasspy - Offline Voice Assistant

**Overview:** Fully offline voice assistant for multiple human languages.

**Key Features:**
- Works completely offline (privacy-focused)
- Supports 15+ languages
- MQTT, HTTP, and Websocket integration
- Home Assistant, Node-RED, OpenHAB compatible
- Custom voice command grammar
- No cloud dependencies

**Use Cases for Athena:**
- Local voice control without external APIs
- Privacy-sensitive voice interactions
- Home automation integration
- Custom wake-word detection

**Resources:**
- GitHub: github.com/rhasspy/rhasspy
- Documentation: rhasspy.readthedocs.io

**Note:** Requires dedicated hardware (Pi, server) - not a quick win

---

## 4. Additional MCP Servers (New Findings)

| Server | Purpose | Status |
|--------|---------|--------|
| **Serena** (`oraios/serena`) | Semantic retrieval and editing | Updated Feb 27 |
| **Scrapling** (`D4Vinci/Scrapling`) | Adaptive web scraping framework | Updated Feb 28 |
| **Skill Seekers** (`yusufkaraaslan/Skill_Seekers`) | Convert docs to Claude skills | New |
| **FastAPI MCP** (`tadata-org/fastapi_mcp`) | Expose FastAPI as MCP tools | Python |
| **nginx-ui** (`0xJacky/nginx-ui`) | WebUI for Nginx management | Go-based |

### Serena - Semantic Retrieval Toolkit
- Provides semantic search and editing capabilities
- MCP server + other integrations
- Python-based
- **Use case:** Enhanced code search/retrieval

### Scrapling - Adaptive Web Scraping
- Handles single requests to full-scale crawls
- Adaptive parsing
- Python framework
- **Use case:** Data collection, research automation

---

## 5. Code Execution & Sandboxes (Extended)

### Previously Covered
- E2B (primary recommendation)

### Additional Options

| Tool | Type | Best For |
|------|------|----------|
| **Pituitary** | Cloud sandboxes | Quick ephemeral environments |
| **Judge0** | Code execution API | Multi-language compilation |
| **Sandpack** (by CodeSandbox) | In-browser execution | Lightweight code demos |
| **GitHub Codespaces** | Full dev environments | Complex remote work |

---

## 6. Container & Orchestration Tools

### For Agent Workloads

| Tool | Purpose | Relevance |
|------|---------|-----------|
| **Coolify** | Heroku alternative | Self-hosted deployment |
| **Portainer** | Container management | UI for Docker/K8s |
| **Yacht** | Docker management | Simpler Portainer alternative |
| **Traefik** | Reverse proxy | Agent service routing |

### Coolify - Detailed
- Open-source Heroku alternative
- Self-host anything
- One-click deployments
- Integrates with cloud providers
- **Use case:** Deploy agent services without managed cloud

---

## 7. Notification & Alerting (Extended)

### Previously Covered
- ntfy, Apprise, Gotify

### Additional Options

| Tool | Features | Best For |
|------|----------|----------|
| **AlertManager** (Prometheus) | Grouping, silencing | Technical alerts |
| **Gotify** | Self-hosted push | Simple notifications |
| **Shout** | Docker-based notifications | Container logs |
| **Healthchecks.io** | Cron monitoring | Job success/failure |

---

## 8. Database Options (Extended)

### Specialized Databases for Agent Use

| Database | Type | Use Case |
|----------|------|----------|
| **SurrealDB** | Multi-model (SQL+NoSQL) | All-in-one database |
| **DuckDB** | OLAP analytics | Agent analytics |
| **TinyDB** | Python document DB | Lightweight embedded |
| **SQLite** (via SQL.js) | In-browser DB | Browser-based agents |
| **D1** (Cloudflare) | Serverless SQL | Edge-deployed agents |

---

## Priority Recommendations

### Priority 1: Quick Wins (Same Day)

1. **Add Serena MCP** - Semantic retrieval for code assistance
   ```bash
   mcporter config add serena --url https://github.com/oraios/serena
   ```

2. **Add Scrapling** - For web scraping needs
   ```bash
   pip install scrapling
   ```

### Priority 2: Medium Effort (1-3 Days)

3. **Evaluate Trigger.dev** vs Activepieces for workflow automation
   - Trigger.dev: Better for TypeScript, long-running tasks
   - Activepieces: Better for visual builders, faster onboarding

4. **Set up ntfy** for push notifications
   ```bash
   # Self-hosted or use free tier
   docker run -p 80:80 binwiederhier/ntfy
   ```

### Priority 3: Future Exploration

5. **Coder** - For remote development environments (complex setup)
6. **Rhasspy** - For offline voice control (hardware required)
7. **Coolify** - For self-hosted deployments

---

## Gap Analysis

### Already Well Covered ✅
- MCP ecosystem (comprehensive)
- Vector databases (Qdrant, Weaviate, Chroma, AnythingLLM)
- LLM gateways (lm-proxy, cc-relay)
- Workflow automation (Activepieces, n8n)
- Search solutions (Brave, DuckDuckGo)
- Cloudflare Agents (edge deployment)

### Newly Covered in This Research
- Trigger.dev (TypeScript workflows)
- Coder (cloud dev environments)
- Rhasspy (offline voice)
- Serena MCP (semantic retrieval)
- Scrapling (web scraping)
- Coolify (self-hosted deployment)

### Still Gaps to Explore
- [ ] More specialized MCP servers for specific use cases
- [ ] Alternative LLM providers (deepseek, mistral, etc.)
- [ ] Graph databases for knowledge management
- [ ] Time-series databases for agent analytics

---

## Files Reference

- Prior research: `memory/research-apis-tools-platforms-2026-02-28.md`
- MCP research: `memory/research-mcp-agents-2026-02-28.md`
- Vector DB research: `memory/vector-db-llm-gateway-research-2026-02-28.md`
- Platform research: `memory/platform-research.md`

---

*Research completed: 2026-02-28 01:15 UTC*
*Researcher: Subagent (autonomy-research-15)*

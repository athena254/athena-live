# Research: Agent Observability, Testing & Security Tools

**Date:** 2026-02-28
**Researcher:** Subagent (autonomy-research-21)
**Focus:** Agent observability, testing frameworks, and security tools - gaps from prior research

---

## Executive Summary

Researched three key areas not fully covered in prior research: (1) LLM/Agent observability platforms for monitoring agent behavior, (2) Agent testing and evaluation frameworks, and (3) Agent security tools. These are critical for production-grade multi-agent systems like Athena.

---

## 1. Agent Observability Platforms

### Why It Matters for Athena

Multi-agent systems need debugging, performance monitoring, and behavior tracking. Current Athena setup lacks observability - we can't see:
- Which agent made which decision
- Token usage across agents
- Latency bottlenecks
- Error rates and patterns

### Top Recommendations

| Platform | Type | Key Feature | Relevance |
|----------|------|-------------|-----------|
| **Langfuse** | Open Source | Full-stack LLM engineering platform | ⭐ HIGH |
| **Laminar (lmnr)** | Open Source | Purpose-built for AI agents | ⭐ HIGH |
| **Opik** (Comet) | Open Source | Debug, evaluate, monitor | ⭐ HIGH |
| **Logfire** | Open Source | Pydantic-native observability | MEDIUM |
| **Helicone** | Open Source | Simple one-line integration | MEDIUM |
| **Agenta** | Open Source | All-in-one LLMOps | MEDIUM |

### Langfuse - Detailed ⭐
- **Purpose:** Open source LLM engineering platform
- **Key Features:**
  - LLM Observability with traces
  - Metrics and evaluations
  - Prompt management
  - Playground for testing
  - Datasets for fine-tuning
  - OpenTelemetry integration
  - Integrations: Langchain, OpenAI SDK, LiteLLM
- **Use for Athena:**
  - Track all agent interactions
  - Monitor token usage per agent
  - Debug failed agent tasks
  - A/B test prompts
- **GitHub:** github.com/langfuse/langfuse
- **Self-hostable:** Yes (or cloud)

### Laminar (lmnr) - Detailed ⭐
- **Purpose:** Open-source observability platform purpose-built for AI agents
- **Key Features:**
  - Agent-specific tracing
  - Tool usage tracking
  - Cost monitoring
  - Session replay
  - YC S24 backed
- **Use for Athena:**
  - Monitor Ishtar's PAI architecture
  - Track Sterling's bidding decisions
  - Agent-to-agent communication logs
- **GitHub:** github.com/lmnr-ai/lmnr

### Opik (Comet) - Detailed
- **Purpose:** Debug, evaluate, and monitor LLM applications
- **Key Features:**
  - Comprehensive tracing
  - Automated evaluations
  - Production-ready dashboards
  - RAG system monitoring
  - Agentic workflow tracking
- **Use for Athena:**
  - Evaluate bid success predictions
  - Monitor agent performance over time
- **GitHub:** github.com/comet-ml/opik

### Logfire - Detailed
- **Purpose:** AI observability from Pydantic
- **Key Features:**
  - Python-native
  - Integrates with Pydantic AI
  - Low overhead
  - Structured logging
- **Use for Athena:**
  - If using Pydantic AI for any agent
- **GitHub:** github.com/pydantic/logfire

---

## 2. Agent Testing & Evaluation Frameworks

### Why It Matters

Athena runs autonomous bidding. We need to:
- Test agent behavior before deployment
- Evaluate decision quality
- Benchmark against historical data
- Catch regressions

### Top Recommendations

| Framework | Purpose | Relevance |
|-----------|---------|-----------|
| **AgentOps** | Agent lifecycle management | ⭐ HIGH |
| **braintrust** | AI evaluation platform | ⭐ HIGH |
| **deepeval** | LLM evaluation | ⭐ MEDIUM |
| **Guardrails AI** | Output validation | ⭐ MEDIUM |
| **Promptfoo** | Prompt testing | MEDIUM |

### AgentOps - Detailed ⭐
- **Purpose:** Agent lifecycle management and observability
- **Key Features:**
  - Session replay
  - Cost tracking
  - Tool usage analytics
  - Multi-agent coordination monitoring
- **GitHub:** github.com/AgentOps-AI/agentops
- **Use for Athena:** Comprehensive agent monitoring + testing

### braintrust - Detailed ⭐
- **Purpose:** AI evaluation platform
- **Key Features:**
  - Automated evals
  - Traces and debugging
  - Dataset management
  - Regression testing
- **GitHub:** github.com/braintrustdata/braintrust-open
- **Use for Athena:** Evaluate bidding strategies, test agent responses

### deepeval - Detailed
- **Purpose:** LLM evaluation framework
- **Key Features:**
  - Pytest-like syntax
  - 80+ metrics
  - Synthetic data generation
  - Confident AI backing
- **GitHub:** github.com/confident-ai/deepeval

### Guardrails AI - Detailed
- **Purpose:** Output validation for LLMs
- **Key Features:**
  - Structuring LLM outputs
  - Validating responses
  - Quality checks
  - Pydantic integration
- **GitHub:** github.com/guardrails-ai/guardrails

---

## 3. Agent Security Tools

### Why It Matters

Multi-agent systems with external API access need:
- Input/output validation
- Rate limiting
- Secret management
- Vulnerability scanning

### Top Recommendations

| Tool | Purpose | Relevance |
|------|---------|-----------|
| **agentic_security** | LLM vulnerability scanner | ⭐ HIGH |
| **Gitleaks** | Secret detection | ⭐ HIGH |
| **Vault** | Secret management | ⭐ MEDIUM |
| **Prompt Inject** | Injection detection | ⭐ MEDIUM |

### agentic_security - Detailed ⭐
- **Purpose:** Agentic LLM Vulnerability Scanner / AI red teaming kit
- **Key Features:**
  - Vulnerability scanning for agents
  - Red teaming capabilities
  - Security testing
- **GitHub:** github.com/msoedov/agentic_security

### Gitleaks - Detailed
- **Purpose:** Secret detection in code
- **Key Features:**
  - Pre-commit hooks
  - CI/CD integration
  - 180+ secret types
- **Use for Athena:** Scan agent code for leaked API keys
- **GitHub:** github.com/gitleaks/gitleaks

### Vault (HashiCorp) - Detailed
- **Purpose:** Secret management
- **Key Features:**
  - Dynamic secrets
  - Access control
  - Audit logging
- **Use for Athena:** Store API keys, tokens securely
- **Alternative:** AWS Secrets Manager, Doppler

---

## 4. Additional Agent Frameworks (New)

Not covered in prior research:

| Framework | Purpose | Notes |
|-----------|---------|-------|
| **Pydantic AI** | Type-safe AI agents | Python, Pydantic integration |
| **Microsoft Agent Framework** | Cross-platform agents | Python + .NET |
| **Hive** | Outcome-driven agents | Evolving framework |
| **Agently** | GenAI app development | Structured interactions |

---

## 5. Actionable Recommendations

### Priority 1: Observability (This Week)

1. **Add Langfuse** - Quick integration, self-hostable
   ```bash
   pip install langfuse
   ```
   - Track all 9 agents
   - Monitor Sterling's bidding
   - Debug Ishtar's PAI

2. **Try Laminar** - Agent-specific
   - Purpose-built for agents like Athena
   - Session replay is valuable

### Priority 2: Testing (This Month)

3. **Integrate AgentOps** - Full lifecycle
   - Session replay for debugging
   - Cost tracking

4. **Set up braintrust** - For evaluating:
   - Bid success rates
   - Response quality
   - Regression testing

### Priority 3: Security (This Quarter)

5. **Add Gitleaks to CI** - Prevent secret leaks
6. **Explore agentic_security** - Red team Athena
7. **Implement Vault** - Centralized secret management

---

## Gap Coverage Summary

| Category | Status | Key Tools |
|----------|--------|-----------|
| Agent Observability | ✅ NEW | Langfuse, Laminar, Opik, Logfire |
| Agent Testing | ✅ NEW | AgentOps, braintrust, deepeval |
| Agent Security | ✅ NEW | agentic_security, Gitleaks |
| Agent Frameworks | ✅ NEW | Pydantic AI, Microsoft Agent |

---

## References

- Prior API research: `memory/final-gap-research-2026-02-28.md`
- MCP research: `memory/research-mcp-agents-2026-02-28.md`
- Vector DB research: `memory/vector-db-llm-gateway-research-2026-02-28.md`

---

*Research completed: 2026-02-28 01:25 UTC*

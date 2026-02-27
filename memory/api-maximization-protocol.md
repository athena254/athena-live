# Athena Full API Maximization Protocol

**Created:** 2026-02-27  
**Type:** Continuous Background Process  
**Runs:** Every 15 minutes

---

## The Mandate

- Every API key is a resource to maximize
- No free tier limits should sit idle
- No agent should be dormant
- Quality is non-negotiable

---

## Phase 1: API Audit & Limit Mapping

| Item | Description |
|------|-------------|
| Audit | Full scan of all API keys |
| Limits | Requests/min, day, tokens/month |
| Usage | Current consumption |
| Allocation | Which agents use which APIs |
| Reset | When limits refresh |

**Live Table Location:** `memory/api-allocation-table.json`

---

## Phase 2: Problem Finding & Solving

| Step | Action |
|------|--------|
| Find | Survey assigned domain |
| Document | Structured problem report |
| Solve | Fix the issue |
| Escalate | If can't fix, pass to right agent |
| Report | Completion report to Athena |

---

## Phase 3: Idle Agent Creative Operations

**Rule:** No idle agents. Each must create daily:
- Something genuinely interesting/useful
- Production-ready
- Completed in active window

**Examples:**
- Felicity: Beautiful wellness app, finance visualizer
- THEMIS: Deep intellectual deliberation
- Research agents: Original analysis/trends

---

## Phase 4: Quality Enforcement

| Check | Standard |
|-------|----------|
| Real user ready? | Yes/No |
| Feedback | Specific & precise |
| Second fail | Flag for operator |

---

## Phase 5: Daily Creative Showcase

- Compile all creative outputs
- Agent name, what built, why, where
- Quality rating

---

## Cron Jobs

```json
{
  "name": "Daily Competition Report Assembly",
  "schedule": "55 4 * * *"
}
{
  "name": "Athena Full API Maximization", 
  "schedule": "*/15 * * * *"
}
```

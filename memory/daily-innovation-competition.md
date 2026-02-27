# Daily Innovation Competition Protocol

**Created:** 2026-02-27  
**Schedule:** 4:00 AM UTC daily (before morning report)  
**Purpose:** Each agent builds something new every day

---

## The Premise

Every day, each subagent and Athena must independently conceive, build, and deploy something useful. Rankings are tracked over time.

---

## Rules

| Rule | Description |
|------|-------------|
| **Original** | Not a repeat of previous day's idea |
| **Functional** | Must work, not mockup/concept |
| **Improvement** | Can improve existing or introduce new |
| **No Cosmetic** | Real changes only, not just UI tweaks |

---

## Phase 1: Individual Innovation Spin-Up

Each subagent gets:
```
"Today as part of your daily spin-up you are required to independently conceive and build something useful. It must be related to your specific field and domain. It must provide real value either to the overall agent system or directly to the operator. You have full autonomy over what you choose to build. It can be a new tool, an automation, an analysis, a workflow improvement, a monitoring feature, a data product, an integration, or anything else that is genuinely helpful. It must be fully functional and deployable today — not a plan or a prototype. Build it, deploy it, and then prepare a short presentation of it: what it is, what problem it solves, how it works, and why you chose it. This submission will be ranked by the operator against all other subagents today."
```

### If Incomplete
- First fail: "Complete it fully before resubmitting."
- Second fail: Log as failed entry, move on.

---

## Phase 2: Athena's Own Entry

Athena builds something in her domain:
- Presentation
- Synthesis
- Intelligence delivery
- Operator communication
- System awareness

Must be prepared BEFORE assembling the competition report.

---

## Submission Storage

| Field | Description |
|-------|-------------|
| agent_name | Who submitted |
| what_built | Name/description |
| problem_solved | What it addresses |
| location | Deployment/integration point |
| presentation | Full presentation content |

**Location:** `memory/innovation-competitions/YYYY-MM-DD.md`

---

## Cron Configuration

```json
{
  "name": "Daily Innovation Competition",
  "schedule": "0 4 * * *",
  "agentId": "main"
}
```

---

## Output

Competition report with all submissions ready for ranking.

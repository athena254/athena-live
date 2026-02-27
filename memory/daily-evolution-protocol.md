# Daily System Evolution Protocol

**Created:** 2026-02-27  
**Schedule:** 5:00 AM UTC daily  
**Purpose:** Autonomous system improvement

---

## Phase 1: Agent Change Detection

### Agents to Check
| Agent | Type | Check Method |
|-------|------|-------------|
| Athena | Main | System logs, recent commits |
| Sterling | Subagent | Config diff |
| Ishtar | Subagent | Identity files |
| THEMIS | Subagent | Protocol updates |
| Felicity | Subagent | Recent builds |
| Prometheus | Subagent | Config |
| Nexus | Subagent | Config |
| Delver | Subagent | Config |
| Squire | Subagent | Config |
| Cisco | Subagent | Config |
| Kratos | Subagent | Config |
| Apollo | Subagent | Config |
| Hermes | Subagent | Config |
| Ghost | Subagent | Config |
| Shannon | Micro-Agent | GitHub commits |
| Katie | Micro-Agent | GitHub commits |

### Change Detection Steps
1. Query each agent's current state
2. Compare against last stored spec
3. Flag agents with changes for dashboard update

---

## Phase 2: Dashboard Upgrade

### For Flagged Agents
1. Spawn agent → request current capabilities
2. Diff against stored spec
3. Pass to Felicity → rebuild dashboard

### Felicity's Role
- All frontend work
- Production quality output
- Design system compliance

---

## Phase 3: Security Check

- **Shannon** → Scan dashboards for vulnerabilities
- **Katie** → Review backend connections

---

## Phase 4: Memory Update

- Write to `memory/daily-evolution-YYYY-MM-DD.md`
- Push to GitHub
- Summarize changes

---

## Cron Configuration

```json
{
  "name": "Daily System Evolution - 5AM",
  "schedule": "0 5 * * *",
  "agentId": "main"
}
```

---

## Output

Daily report with:
- What changed
- What was upgraded
- Security findings
- GitHub commits

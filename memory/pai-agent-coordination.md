# PAI Agent Coordination Architecture

## Overview
9-agent system with staggered spawn patterns to mitigate API rate limits.

## Agent Roster

| Agent | Role | Status | Voice |
|-------|------|--------|-------|
| Athena | Main Orchestrator | Active | Sonia |
| Sterling | Finance/Auto-Bidder | Active | Thomas |
| Ishtar | Oracle/PAI Research | Active | Ezinne |
| Felicity | Code Artisan | Ready | default |
| Cisco | Security/BMAD | Ready | default |
| Prometheus | Executor | Ready | default |
| Delver | Research | Ready | default |
| Squire | Assistant | Ready | default |
| Themis | Council | Ready | Maisie |

## Rate Limit Mitigation

### Model Configuration
- **GLM-5-FP8** (primary): Unlimited rate - use for heavy tasks
- **qwen_nvidia**: Unlimited rate - research tasks
- **llama**: 30/min limit - stagger required

### Spawn Stagger Pattern
```
Default: 30 second intervals between parallel spawns
Configuration: spawnStaggerMs: 30000

Implementation:
1. Track spawn timestamps in agent-states.json
2. Queue pending spawns if lastSpawn < staggerMs ago
3. Process queue FIFO with stagger enforcement
```

### Priority Ordering for Parallel Spawns
1. **Critical**: Athena (orchestrator), Cisco (security)
2. **High**: Sterling (time-sensitive bids), Prometheus (exec)
3. **Normal**: Ishtar (research), Felicity (code)
4. **Low**: Delver, Squire, Themis

### Fallback Chain
```
Primary: custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8
Fallback 1: custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b
Fallback 2: local model (if available)
```

### Backoff Strategy
```
On rate limit error:
1. Exponential backoff: 5s → 10s → 20s → 40s
2. Max backoff: 60 seconds
3. After 3 failures: Switch to fallback model
4. Track failures in agent-states.json
```

## State Locking Mechanism

### File-Based Coordination
- State file: `memory/agent-states.json`
- Lock file: `memory/.agent-lock` (atomic creation)
- Lock timeout: 5 seconds

### Spawn Coordination
```json
{
  "pendingSpawns": [
    {"agentId": "sterling", "queuedAt": "timestamp", "priority": 2},
    {"agentId": "ishtar", "queuedAt": "timestamp", "priority": 3}
  ],
  "lastSpawn": "2026-02-21T19:00:00Z",
  "activeSpawns": ["athena", "sterling"]
}
```

## Implementation Notes

### Best Practices
1. Never spawn more than 2 agents simultaneously
2. Use `runTimeoutSeconds` appropriately (default: 300)
3. Check `memory/ishtar-state.json` for research task status
4. Update agent-states.json after task completion

### Error Recovery
- Track failed spawns per agent
- Implement retry with backoff
- Escalate to Athena if 3+ consecutive failures

## Metrics to Track
- Spawn success rate per agent
- Average spawn time
- Rate limit hit count
- Fallback usage frequency

---
Created: 2026-02-21
Updated: 2026-02-21

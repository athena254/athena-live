# Ishtar Research Log

## PAI Architecture Deep Dive (2026-02-24 → 2026-02-25)
*Completed*

---

## Multi-Agent Orchestration Systems (2026-02-26)
*Research in progress*

### Research Focus
Designing comprehensive multi-agent orchestration for Athena's 13+ agents, integrating OpenClaw's native capabilities with PAI-inspired patterns.

---

## 1. OPENCLAW MULTI-AGENT ARCHITECTURE

### Core Concepts

**Agent Definition:**
Each agent in OpenClaw is a fully scoped "brain" with:
- **Workspace** (files, AGENTS.md/SOUL.md/USER.md, local notes, persona rules)
- **State directory** (`agentDir`) for auth profiles, model registry, per-agent config
- **Session store** (chat history + routing state) under `~/.openclaw/agents/<agentId>/sessions`

**Isolation Guarantees:**
- Auth profiles are per-agent
- Skills are per-agent via workspace `skills/` folder
- Shared skills from `~/.openclaw/skills`
- Sessions keyed as `agent:<agentId>:<mainKey>`

### Routing Layer

**Deterministic Binding Rules** (most-specific wins):
1. `peer` match (exact DM/group/channel id)
2. `parentPeer` match (thread inheritance)
3. `guildId + roles` (Discord role routing)
4. `guildId` (Discord)
5. `teamId` (Slack)
6. `accountId` match for a channel
7. channel-level match (`accountId: "*"`)
8. fallback to default agent

**Binding Structure:**
```json
{
  "agentId": "work",
  "match": {
    "channel": "whatsapp",
    "accountId": "personal",
    "peer": { "kind": "group", "id": "1203630...@g.us" }
  }
}
```

### Session Tools

**Tool Suite:**
- `sessions_list` - List sessions with optional filters
- `sessions_history` - Fetch transcript for a session
- `sessions_send` - Send message to another session
- `sessions_spawn` - Spawn sub-agent in isolated session

**Key Patterns:**
- Main direct chat key: `"main"` (resolves to agent's main key)
- Group chats: `agent:<agentId>:<channel>:group:<id>`
- Cron jobs: `cron:<job.id>`
- Hooks: `hook:<uuid>`
- Node sessions: `node-<nodeId>`

**Security Model:**
- Session visibility: `self | tree | agent | all`
- Sandboxed sessions default to `spawned` visibility
- Agent-to-agent messaging requires explicit enable + allowlist

---

## 2. ATHENA'S CURRENT IMPLEMENTATION

### Agent Roster (13+ Agents)

**Core Agents:**
1. **Athena** - Main orchestrator, primary interface
2. **Sterling** - Finance, full auto-bidding authority
3. **Ishtar** - PAI Architecture, research
4. **Delver** - Deep research, knowledge exploration
5. **Squire** - Task management, reminders
6. **Felicity** - Emotional support, wellness
7. **Prometheus** - Project planning, milestones
8. **Cisco** - Communication, notifications
9. **THEMIS** - Oversight, compliance

**Planned/Recent Agents:**
10. **Apollo** - Prospecting, new client acquisition (JSON config)
11. **Hermes** - Client relations, communication (JSON config)
12. **Kratos** - Crypto/DeFi trading (JSON config)
13. **Chiron** - QA testing, validation (markdown profile)
14. **Mnemosyne** - Memory management, archival (markdown profile)
15. **Talia** - Content creation, social media (markdown profile)

### Lattice Accountability Pattern

Each agent defines communication channels:

```markdown
### Lattice Accountability

**I Receive From:**
- Athena (primary directives)
- Cisco (user communications)

**I Output To:**
- Athena (status reports)
- Sterling (financial data)

**I Am Accountable To:**
- Athena (primary)
- THEMIS (compliance oversight)
```

### Configuration Patterns

**JSON Config Structure (Apollo, Hermes, Kratos):**
```json
{
  "id": "apollo",
  "name": "Apollo",
  "role": "Prospecting Agent",
  "description": "Prospecting and new client acquisition",
  "preferredModel": "anthropic/claude-3-5-sonnet",
  "tasks": [
    {
      "name": "prospect_search",
      "description": "Search for new prospects on platforms",
      "priority": "HIGH"
    }
  ],
  "spawnTriggers": [
    {
      "condition": "beelancer_new_lead",
      "action": "analyze_prospect"
    }
  ]
}
```

**Markdown Profile Structure (Chiron, Mnemosyne):**
```markdown
# Agent Profile: Chiron (QA)

## Operating Specs
- Model: claude-3-5-sonnet
- Tools: exec, read, write, sessions_spawn
- Isolation: sandboxed

## Workflow
1. Receive test request from Athena
2. Execute test suite
3. Report results to Mnemosyne for logging

## Success Metrics
- Test coverage > 80%
- False positive rate < 5%
```

---

## 3. ORCHESTRATION ARCHITECTURE DESIGN

### 3.1 Communication Protocol

**Message Structure:**
```typescript
interface AgentMessage {
  id: string;           // UUID
  timestamp: string;    // ISO 8601
  source: AgentRef;     // Sender agent
  target: AgentRef;     // Recipient agent
  type: MessageType;    // REQUEST | RESPONSE | BROADCAST | STATUS
  priority: Priority;   // CRITICAL | HIGH | MEDIUM | LOW
  payload: any;         // Message content
  context?: Context;    // Task context
  replyTo?: string;     // Original message ID
}

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type MessageType = 'REQUEST' | 'RESPONSE' | 'BROADCAST' | 'STATUS' | 'HEARTBEAT';

interface AgentRef {
  agentId: string;
  sessionId?: string;
  channel?: string;
}

interface Context {
  taskId?: string;
  parentTask?: string;
  deadline?: string;
  metadata?: Record<string, any>;
}
```

**Priority Handling:**
| Priority | Response Time | Use Case |
|----------|--------------|----------|
| CRITICAL | Immediate | Security alerts, system failures |
| HIGH | < 5 min | Active tasks, user requests |
| MEDIUM | < 1 hour | Research, analysis |
| LOW | < 24 hours | Maintenance, archival |

### 3.2 Task Delegation Engine

**Delegation Decision Tree:**
```
User Request → Athena (Router)
    │
    ├─ Finance related? → Sterling
    │       └─ Auto-bid eligible? → Process immediately
    │       └─ Needs approval? → Route to Dis
    │
    ├─ Research needed? → Ishtar/Delver
    │       └─ PAI architecture? → Ishtar
    │       └─ General research? → Delver
    │
    ├─ Client communication? → Hermes
    │       └─ New prospect? → Apollo
    │       └─ Existing client? → Hermes
    │
    ├─ Task management? → Squire
    │
    ├─ Emotional support? → Felicity
    │
    └─ Content creation? → Talia
```

**Task Structure:**
```typescript
interface Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  created: string;
  deadline?: string;
  assignee: string;      // Agent ID
  requester: string;     // Agent or user
  input: any;
  output?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
  dependencies: string[]; // Task IDs
}

type TaskType = 
  | 'RESEARCH' | 'ANALYSIS' | 'EXECUTION' 
  | 'COMMUNICATION' | 'MONITORING' | 'MAINTENANCE';

type TaskStatus = 
  | 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' 
  | 'COMPLETED' | 'FAILED' | 'CANCELLED';
```

### 3.3 State Synchronization

**Shared State Objects:**
```typescript
// Global state accessible to all agents
interface GlobalState {
  activeTasks: Map<string, Task>;
  agentStatus: Map<string, AgentStatus>;
  recentDecisions: Decision[];
  systemAlerts: Alert[];
}

// Per-agent state
interface AgentState {
  agentId: string;
  currentTask?: string;
  queue: Task[];
  capabilities: string[];
  lastHeartbeat: string;
  metrics: AgentMetrics;
}

interface AgentStatus {
  status: 'IDLE' | 'BUSY' | 'OFFLINE' | 'ERROR';
  currentLoad: number;    // 0.0 - 1.0
  lastActivity: string;
  upcomingTasks: number;
}
```

**State File Locations:**
```
~/.openclaw/workspace/memory/
├── global-state.json      # Shared state
├── agent-queue.json       # Task queue
├── ishtar-state.json      # Per-agent state
├── sterling-state.json
├── telos-state.json       # TELOS tracking
└── subagent-architecture.md
```

### 3.4 Output Capture & Routing

**Capture Points:**
1. **Session Spawn Results** - `sessions_spawn` returns results
2. **Hook Outputs** - Triggers on events
3. **Cron Outputs** - Scheduled task results
4. **Direct Messages** - Cross-agent communication

**Routing Matrix:**
```
┌─────────────┬───────────────────────────────────────┐
│ Source      │ Output Destinations                   │
├─────────────┼───────────────────────────────────────┤
│ Sterling    │ Athena (status), Dis (alerts)         │
│ Ishtar      │ MEMORY.md, research-log.md            │
│ Delver      │ Athena (findings), Mnemosyne (archive)│
│ Squire      │ Dis (reminders), Athena (status)      │
│ Cisco       │ All agents (notifications)            │
│ THEMIS      │ Dis (compliance alerts), Athena       │
│ Apollo      │ Hermes (leads), Sterling (revenue)    │
│ Hermes      │ Apollo (feedback), Athena (status)    │
│ Kratos      │ Sterling (trades), Dis (alerts)       │
│ Chiron      │ Athena (test results), THEMIS         │
│ Mnemosyne   │ All agents (memory queries)           │
│ Talia       │ Cisco (content), Dis (drafts)         │
└─────────────┴───────────────────────────────────────┘
```

---

## 4. IMPLEMENTATION RECOMMENDATIONS

### 4.1 Immediate Actions (Week 1)

1. **Standardize Agent Configs**
   - Migrate all agents to JSON configs with consistent schema
   - Add `latticeAccountability` field to each config
   - Define spawn triggers for each agent

2. **Create Task Queue System**
   - Implement `agent-queue.json` with priority ordering
   - Add queue monitoring to Athena's heartbeat
   - Create task status dashboard

3. **Enable Agent-to-Agent Messaging**
   - Configure `tools.agentToAgent` in openclaw.json
   - Set up allowlist for all 13 agents
   - Test cross-agent communication

### 4.2 Short-Term Enhancements (Month 1)

1. **Build Orchestration Rules Engine**
   ```javascript
   // Example rules
   const orchestrationRules = [
     {
       trigger: { type: 'finance', amount: { gt: 1000 } },
       action: { assignTo: 'Sterling', notify: ['Dis'] }
     },
     {
       trigger: { type: 'research', topic: 'PAI' },
       action: { assignTo: 'Ishtar', deadline: '4h' }
     }
   ];
   ```

2. **Implement State Synchronization**
   - Create shared state file with TTL
   - Add heartbeat updates to state
   - Build conflict resolution for concurrent updates

3. **Create Agent Dashboard**
   - Real-time status of all agents
   - Task queue visualization
   - Communication flow diagram

### 4.3 Medium-Term Evolution (Quarter 1)

1. **Dynamic Load Balancing**
   - Monitor agent workload
   - Automatically redistribute tasks
   - Spawn additional instances for high-load agents

2. **Learning Orchestration**
   - Track successful task completions
   - Learn optimal agent assignments
   - Predict task duration

3. **Cross-Agent Memory**
   - Shared knowledge base
   - Context handoff between agents
   - Collective learning from outcomes

---

## 5. CODE PATTERNS

### 5.1 Spawning Sub-Agents

```javascript
// Spawn Apollo for prospect analysis
const result = await sessions_spawn({
  task: "Analyze prospect: John Doe from Acme Corp. Score fit for our services.",
  agentId: "apollo",
  label: "prospect-analysis-acme",
  model: "anthropic/claude-3-5-sonnet",
  runTimeoutSeconds: 300,
  thread: true
});
```

### 5.2 Cross-Agent Messaging

```javascript
// Send task to Sterling
await sessions_send({
  sessionKey: "agent:sterling:main",
  message: JSON.stringify({
    type: "REQUEST",
    priority: "HIGH",
    payload: {
      action: "evaluate_bid",
      data: { project_id: "12345", budget: 5000 }
    }
  }),
  timeoutSeconds: 60
});
```

### 5.3 Task Queue Processing

```javascript
// In Athena's heartbeat
const queue = JSON.parse(fs.readFileSync('memory/agent-queue.json'));
const pending = queue.tasks.filter(t => t.status === 'PENDING');

for (const task of pending) {
  const assignee = selectAgent(task);
  await assignTask(assignee, task);
  task.status = 'ASSIGNED';
}

fs.writeFileSync('memory/agent-queue.json', JSON.stringify(queue, null, 2));
```

---

## 6. MONITORING & OBSERVABILITY

### 6.1 Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Task Completion Rate | > 95% | < 90% |
| Average Response Time | < 30s | > 2min |
| Agent Availability | > 99% | < 95% |
| Queue Depth | < 10 | > 50 |
| Error Rate | < 1% | > 5% |

### 6.2 Health Checks

```javascript
// Agent health check (in heartbeat)
async function checkAgentHealth() {
  const agents = ['athena', 'sterling', 'ishtar', 'delver', 'squire', 
                  'felicity', 'prometheus', 'cisco', 'themis'];
  
  const results = {};
  for (const agentId of agents) {
    const state = readAgentState(agentId);
    const lastHeartbeat = new Date(state.lastHeartbeat);
    const age = Date.now() - lastHeartbeat.getTime();
    
    results[agentId] = {
      status: age < 300000 ? 'HEALTHY' : 'STALE',
      lastHeartbeat: state.lastHeartbeat,
      currentTask: state.currentTask
    };
  }
  
  return results;
}
```

---

## 7. SECURITY CONSIDERATIONS

### 7.1 Access Control

- **Agent-to-Agent**: Explicit allowlist required
- **Tool Restrictions**: Per-agent tool allow/deny lists
- **Sandbox Isolation**: Critical for untrusted agents
- **Credential Isolation**: Each agent has own auth profiles

### 7.2 Data Flow Security

```
┌─────────────────────────────────────────────────────┐
│                    External World                    │
└─────────────────────────────────────────────────────┘
                         │
                    [Firewall]
                         │
┌─────────────────────────────────────────────────────┐
│                    Gateway Layer                     │
│  - Message routing                                   │
│  - Auth validation                                   │
│  - Rate limiting                                     │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    [Agent: Athena] [Agent: Sterling] [Agent: Ishtar]
         │               │               │
    [Sandbox?]      [Sandbox?]      [Sandbox?]
         │               │               │
    [Workspace]     [Workspace]     [Workspace]
```

---

## 8. CONCLUSIONS

### Key Findings

1. **OpenClaw provides robust multi-agent infrastructure** with isolation, routing, and session tools
2. **Athena's Lattice Accountability pattern** is a solid foundation for agent communication
3. **Missing pieces**: Task queue, orchestration rules engine, state synchronization
4. **Low-hanging fruit**: Enable agent-to-agent messaging, standardize configs

### Recommended Next Steps

1. **Immediate**: Enable `tools.agentToAgent` and test cross-agent messaging
2. **This Week**: Create `agent-queue.json` and task assignment logic
3. **This Month**: Build orchestration rules engine and dashboard
4. **This Quarter**: Implement learning orchestration and cross-agent memory

### Research Complete

This research provides a comprehensive foundation for implementing multi-agent orchestration in Athena. The combination of OpenClaw's native capabilities and the designed patterns enables sophisticated agent coordination.

---

*Research completed: 2026-02-26*
*Next cycle: Implement orchestration patterns*

---

## 9. TELOS Integration for Dis (2026-02-26)

### Key Findings (PAI Telos skill)
- **Mandatory notification**: Telos skill requires a voice + text notification *before* any workflow action.
- **Personal TELOS location**: `~/.claude/skills/PAI/USER/TELOS/` (CORE USER directory).
- **Update workflow only**: No manual edits. Must use `Workflows/Update.md` → `bun ~/.claude/commands/update-telos.ts "FILE" "CONTENT" "DESCRIPTION"`.
- **Backups & changelog**: Automatic timestamped backups in `Backups/` and log to `updates.md`.
- **Valid files**: BELIEFS, BOOKS, CHALLENGES, FRAMES, GOALS, LEARNED/LESSONS, MISSION, MODELS, MOVIES, NARRATIVES, PREDICTIONS, PROBLEMS, PROJECTS, STRATEGIES, TELOS, TRAUMAS, WISDOM, WRONG.

### Existing Automation (already in place)
- `scripts/ishtar_telos_capture.py` → snapshots TELOS headings into `memory/telos-snapshot.md` (cron via `pai_repo_scan.sh`).
- `scripts/ishtar_telos_update_helper.py` → validates update request, logs to `memory/ishtar-telos-update.log`, prints exact update-telos command.
- `memory/state/telos-state.json` → summary KPIs + upcoming deadlines for dashboards/alerts.

### Integration Blueprint for Dis
1. **Trigger routing**: When Dis requests TELOS update, route through Update workflow (with voice/text notification) and use update helper to ensure compliance.
2. **Change capture**: On successful update, append summary to `memory/ishtar-research-log.md` and update `telos-state.json` (goals/projects counts + recentActivity).
3. **Dashcard**: Generate/refresh `athena-live` TELOS card from `telos-state.json` and `telos-snapshot.md`.
4. **Notification**: Cisco posts a short confirmation to Dis (or Athena sends via main channel) with file + description; do not expose private content unless asked.

---

## 10. Agent Queue Implementation Plan (agent-queue.json)

### File Structure
```json
{
  "version": "1.1",
  "updated": "<ISO8601>",
  "tasks": [],
  "stats": {
    "totalProcessed": 0,
    "avgCompletionTime": 0,
    "lastProcessedAt": null
  },
  "indexes": {
    "byStatus": {"PENDING": [], "ASSIGNED": [], "IN_PROGRESS": [], "COMPLETED": [], "FAILED": []},
    "byAssignee": {}
  }
}
```

### Task Schema (additions)
```ts
interface Task {
  id: string;
  type: TaskType;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  created: string;
  deadline?: string;
  assignee?: string;
  requester: string;
  input: any;
  output?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
  dependencies: string[];
  tags?: string[];
  context?: Record<string, any>;
  lease?: { owner: string; expiresAt: string };
  history?: Array<{ at: string; event: string; by?: string }>;
}
```

### Processing Rules
1. **Ordering**: CRITICAL → HIGH → MEDIUM → LOW, then earliest deadline first.
2. **Assignment**: Athena selects assignee by rules engine + agent availability.
3. **Locking**: Use `lease` to avoid duplicate pickup (TTL 5–10 min).
4. **State transitions**: PENDING → ASSIGNED → IN_PROGRESS → (COMPLETED|FAILED). Retries move FAILED → PENDING when `retryCount < maxRetries`.
5. **Telemetry**: Update `stats`, `indexes`, and per-agent queue depth in `agent-status.json`.

### Implementation Steps
1. Create base `agent-queue.json` in `memory/` with empty arrays + stats.
2. Add Athena heartbeat handler to:
   - Load queue
   - Assign eligible tasks
   - Update status/lease
   - Write back queue + agent-status
3. Add periodic cleanup: drop expired leases, move stuck tasks back to PENDING, archive COMPLETED tasks to `memory/state/task-archive-YYYY-MM.json`.
4. Add simple CLI helper (`scripts/queue_add_task.py`) for manual task insertions.

---

## 11. ORCHESTRATION IMPLEMENTATION (2026-02-26 Night Cycle)
*In Progress - Ishtar*

### Implementation Status

**Completed:**
1. ✅ Created `memory/agent-queue.json` - Full task queue with indexes and stats
2. ✅ Created `memory/agent-status.json` - 15 agents with capabilities, status, lattice accountability
3. ✅ Created `memory/global-state.json` - System-wide state tracking
4. ✅ Created `memory/orchestration-rules.json` - 16 routing rules

**Scripts Created:**
1. ✅ `scripts/queue_manager.py` - Full task queue operations
   - `add` - Create and add tasks
   - `next` - Get next pending task (priority + deadline ordered)
   - `assign/start/complete/fail` - Lifecycle operations
   - `stats/list/cleanup` - Utilities

2. ✅ `scripts/orchestration_rules.py` - Rules engine
   - Pattern-based trigger matching
   - Agent selection by capability and load
   - Route requests to appropriate agents
   - Default assignments per task type

3. ✅ `scripts/task_coordinator.py` - Athena's main orchestration loop
   - `process` - Process pending tasks from queue
   - `status` - Get system status
   - `health` - Check agent health
   - `balance` - Load balancing analysis
   - `summary` - Daily activity summary
   - `handoff` - Agent-to-agent handoff coordination

### Architecture Decisions

**1. Task Queue Design**
- In-memory JSON for simplicity (can migrate to SQLite/Redis later)
- Priority ordering: CRITICAL → HIGH → MEDIUM → LOW
- Lease-based locking (10 min TTL) to prevent duplicate pickup
- Full history trail for each task

**2. Agent Selection**
- Rules engine evaluates triggers first
- Falls back to capability-based defaults
- Load-aware: prefers least-loaded agents
- Supports explicit assignee preference

**3. State Management**
- `agent-queue.json` - Task queue + indexes
- `agent-status.json` - Agent health + current tasks
- `global-state.json` - System-wide metrics
- `orchestration-rules.json` - Routing rules

**4. Lattice Accountability Integration**
- Each agent has `receivesFrom`, `outputsTo`, `accountableTo`
- Handoffs tracked in global-state coordination metrics
- Supports compliance oversight via THEMIS

### Test Results

```
$ python3 scripts/task_coordinator.py status
{
  "timestamp": "2026-02-26T19:22:07.716472Z",
  "queue": {
    "pending": 0,
    "assigned": 0,
    "inProgress": 0,
    "completed": 0,
    "failed": 0
  },
  "agents": {
    "total": 15,
    "healthy": 15,
    "idle": 14,
    "busy": 1,
    "error": 0,
    "offline": 0
  },
  "health": "HEALTHY"
}
```

### Remaining Work

1. **Hook Integration** - Connect queue to OpenClaw hooks
2. **Athena Heartbeat** - Auto-process queue on heartbeat
3. **Agent Polling** - Agents pick up assigned tasks
4. **Dashboard API** - Expose queue stats to athena-live
5. **Persistence** - Archive completed tasks monthly

### Files Created

| File | Purpose | Lines |
|------|---------|-------|
| `memory/agent-queue.json` | Task queue + indexes | 35 |
| `memory/agent-status.json` | Agent registry + health | 220 |
| `memory/global-state.json` | System state | 25 |
| `memory/orchestration-rules.json` | Routing rules | 160 |
| `scripts/queue_manager.py` | Queue operations | 350 |
| `scripts/orchestration_rules.py` | Rules engine | 280 |
| `scripts/task_coordinator.py` | Main coordinator | 250 |

---

*Implementation ongoing - 2026-02-26*

---

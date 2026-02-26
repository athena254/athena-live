# Missing Subagents Architecture

## Overview

Based on analysis of current Athena operations, **9 new subagents** have been identified as needed to complete the ecosystem. This document provides architectural specifications for each.

---

## Priority Classification

| Priority | Agents | Rationale |
|----------|--------|-----------|
| **HIGH** | Apollo, Hermes | Revenue/client-facing operations |
| **MEDIUM** | Chiron, Clio, Mnemosyne, Tyche | Quality and knowledge infrastructure |
| **LOW** | Hyperion, Iris, Atlas | Backup and utility functions |

---

## HIGH Priority Agents

### 1. Apollo - Client Relations Manager

**Domain:** Client communication, relationship management, satisfaction tracking

**Responsibilities:**
- Monitor client communication channels (email, Slack, Telegram)
- Track client satisfaction and sentiment
- Generate client reports and summaries
- Alert on client issues or escalation needs
- Maintain client profile database

**Configuration:**
```json
{
  "id": "apollo",
  "name": "Apollo",
  "role": "Client Relations Manager",
  "voice": "Apollo",
  "status": "ready",
  "priority": 1,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "channels": ["email", "slack", "telegram"],
  "checkIntervalMs": 300000,
  "escalationThreshold": 0.7,
  "profilePath": "~/.openclaw/workspace/memory/clients/"
}
```

**Integration Points:**
- Email API (Gmail via gog skill)
- Slack/Discord messaging
- Telegram for direct client chats
- CRM sync capabilities

**Spawn Triggers:**
- Client message received
- Scheduled check-in times
- Escalation detected in sentiment analysis

**Tasks:**
1. `client_checkin` - Proactive client touchpoint
2. `sentiment_analysis` - Analyze recent communications
3. `report_generate` - Create client summary reports
4. `escalation_handle` - Process and route escalations

---

### 2. Hermes - Outreach & Marketing Agent

**Domain:** Lead generation, outreach campaigns, marketing automation

**Responsibilities:**
- Execute outreach campaigns
- Track lead pipeline
- A/B test messaging
- Schedule social posts
- Monitor competitor activity

**Configuration:**
```json
{
  "id": "hermes",
  "name": "Hermes",
  "role": "Outreach & Marketing",
  "voice": "Hermes",
  "status": "ready",
  "priority": 1,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "platforms": ["linkedin", "twitter", "email"],
  "campaignPath": "~/.openclaw/workspace/memory/campaigns/",
  "dailyOutreachLimit": 50,
  "abTestEnabled": true
}
```

**Integration Points:**
- LinkedIn API (via browser automation)
- Twitter/X API
- Email (Gmail)
- Analytics platforms

**Spawn Triggers:**
- Scheduled campaign times
- Lead response received
- Competitor mention detected

**Tasks:**
1. `campaign_execute` - Run outreach sequences
2. `lead_qualify` - Score and qualify leads
3. `ab_test_analyze` - Evaluate messaging variants
4. `competitor_monitor` - Track competitor activity

---

## MEDIUM Priority Agents

### 3. Chiron - Quality Assurance Agent

**Domain:** Code quality, testing, validation, standards compliance

**Responsibilities:**
- Run automated test suites
- Static code analysis
- Performance benchmarking
- Security vulnerability scanning
- Standards compliance checks

**Configuration:**
```json
{
  "id": "chiron",
  "name": "Chiron",
  "role": "Quality Assurance",
  "voice": "Chiron",
  "status": "ready",
  "priority": 2,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "testFrameworks": ["jest", "vitest", "playwright"],
  "qualityThreshold": 0.85,
  "scanIntervalMs": 3600000,
  "reportsPath": "~/.openclaw/workspace/memory/qa-reports/"
}
```

**Integration Points:**
- GitHub Actions CI/CD
- SonarQube/CodeClimate
- Lighthouse (performance)
- OWASP ZAP (security)

**Spawn Triggers:**
- Pull request created
- Scheduled quality scan
- Pre-deployment validation
- Code review request

**Tasks:**
1. `test_run` - Execute test suite
2. `lint_check` - Run linters and formatters
3. `security_scan` - Vulnerability assessment
4. `performance_benchmark` - Speed/resource testing
5. `standards_audit` - Best practices compliance

---

### 4. Clio - Documentation Agent

**Domain:** Documentation generation, maintenance, organization

**Responsibilities:**
- Generate API documentation
- Update README files
- Maintain changelog
- Create user guides
- Organize knowledge base

**Configuration:**
```json
{
  "id": "clio",
  "name": "Clio",
  "role": "Documentation",
  "voice": "Clio",
  "status": "ready",
  "priority": 2,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "formats": ["markdown", "openapi", "jsdoc"],
  "templatesPath": "~/.openclaw/workspace/templates/docs/",
  "outputPath": "~/.openclaw/workspace/docs/"
}
```

**Integration Points:**
- GitHub (readme, wiki)
- Notion (knowledge base)
- Swagger/OpenAPI
- JSDoc/TypeDoc

**Spawn Triggers:**
- Feature completion
- API endpoint added
- Scheduled doc refresh
- User request

**Tasks:**
1. `doc_generate` - Create documentation from code
2. `readme_update` - Update README sections
3. `changelog_entry` - Add changelog item
4. `guide_create` - Build user tutorial
5. `api_spec_update` - Update OpenAPI spec

---

### 5. Mnemosyne - Memory & Knowledge Agent

**Domain:** Knowledge management, memory persistence, learning aggregation

**Responsibilities:**
- Aggregate learnings across sessions
- Maintain knowledge graph
- Index and search memory
- Detect knowledge gaps
- Generate insights from patterns

**Configuration:**
```json
{
  "id": "mnemosyne",
  "name": "Mnemosyne",
  "role": "Memory & Knowledge",
  "voice": "Mnemosyne",
  "status": "ready",
  "priority": 2,
  "preferredModel": "custom-integrate-api-nvidia-com/qwen/qwen3.5-397b-a17b",
  "memoryPath": "~/.openclaw/workspace/memory/",
  "indexUpdateIntervalMs": 600000,
  "embeddingModel": "text-embedding-3-small"
}
```

**Integration Points:**
- MEMORY.md maintenance
- Daily notes aggregation
- Supermemory API
- Vector databases (Pinecone, Weaviate)

**Spawn Triggers:**
- Session end (memory extraction)
- Knowledge query received
- Scheduled index update
- Gap detection trigger

**Tasks:**
1. `memory_consolidate` - Merge daily notes to MEMORY.md
2. `knowledge_index` - Update search indices
3. `gap_detect` - Identify missing knowledge areas
4. `insight_generate` - Pattern-based insights
5. `query_answer` - Knowledge-based Q&A

---

### 6. Tyche - Trend Scout Agent

**Domain:** Market trends, technology radar, opportunity detection

**Responsibilities:**
- Monitor tech news and blogs
- Track GitHub trending repos
- Analyze market movements
- Identify emerging opportunities
- Generate trend reports

**Configuration:**
```json
{
  "id": "tyche",
  "name": "Tyche",
  "role": "Trend Scout",
  "voice": "Tyche",
  "status": "ready",
  "priority": 2,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "sources": ["hackernews", "github_trending", "producthunt", "techcrunch"],
  "scanIntervalMs": 1800000,
  "reportsPath": "~/.openclaw/workspace/memory/trends/"
}
```

**Integration Points:**
- Hacker News API
- GitHub Trending
- Product Hunt
- RSS feeds
- Twitter trends

**Spawn Triggers:**
- Scheduled trend scan
- Breaking news detected
- User request for trends

**Tasks:**
1. `trend_scan` - Aggregate trending topics
2. `opportunity_identify` - Find actionable opportunities
3. `competitor_track` - Monitor competitor moves
4. `report_generate` - Create trend summary
5. `alert_send` - Breaking news notification

---

## LOW Priority Agents

### 7. Hyperion - Backup & Disaster Recovery Agent

**Domain:** Backups, disaster recovery, data integrity

**Responsibilities:**
- Execute scheduled backups
- Verify backup integrity
- Manage retention policies
- Disaster recovery procedures
- Data migration

**Configuration:**
```json
{
  "id": "hyperion",
  "name": "Hyperion",
  "role": "Backup & DR",
  "voice": "Hyperion",
  "status": "ready",
  "priority": 3,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "backupTargets": [
    "~/.openclaw/workspace",
    "~/.openclaw/config.json"
  ],
  "retentionDays": 30,
  "backupIntervalMs": 86400000,
  "storagePath": "~/.openclaw/backups/"
}
```

**Integration Points:**
- GitHub (remote backup)
- S3/Backblaze (cloud storage)
- Local filesystem

**Spawn Triggers:**
- Scheduled backup time
- Pre-deployment backup
- Manual backup request
- Recovery needed

**Tasks:**
1. `backup_create` - Execute backup
2. `backup_verify` - Integrity check
3. `backup_restore` - Restore from backup
4. `retention_enforce` - Apply retention policy
5. `dr_test` - Disaster recovery drill

---

### 8. Iris - Notification Hub Agent

**Domain:** Central notification routing, alert aggregation, multi-channel delivery

**Responsibilities:**
- Route notifications to appropriate channels
- Aggregate alerts from multiple sources
- Manage notification preferences
- Throttle and batch notifications
- Track delivery status

**Configuration:**
```json
{
  "id": "iris",
  "name": "Iris",
  "role": "Notification Hub",
  "voice": "Iris",
  "status": "ready",
  "priority": 3,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "channels": {
    "urgent": ["telegram", "push"],
    "normal": ["telegram"],
    "low": ["digest"]
  },
  "throttleWindowMs": 300000,
  "digestIntervalMs": 3600000
}
```

**Integration Points:**
- Telegram
- Discord
- Email
- Push notifications
- Webhooks

**Spawn Triggers:**
- Notification received
- Scheduled digest time
- Channel failure detected

**Tasks:**
1. `notify_send` - Deliver notification
2. `alert_aggregate` - Combine related alerts
3. `preference_update` - Manage user preferences
4. `digest_generate` - Create summary digest
5. `channel_test` - Verify channel health

---

### 9. Atlas - Scheduler Agent

**Domain:** Task scheduling, calendar management, time-based automation

**Responsibilities:**
- Schedule recurring tasks
- Manage calendar integration
- Execute time-based triggers
- Handle timezone complexities
- Reminder management

**Configuration:**
```json
{
  "id": "atlas",
  "name": "Atlas",
  "role": "Scheduler",
  "voice": "Atlas",
  "status": "ready",
  "priority": 3,
  "preferredModel": "custom-api-us-west-2-modal-direct/zai-org/GLM-5-FP8",
  "timezone": "Africa/Nairobi",
  "calendarIntegration": "google",
  "schedulePath": "~/.openclaw/workspace/memory/schedules/"
}
```

**Integration Points:**
- Google Calendar API
- Cron scheduler
- OpenClaw crons
- Time-based triggers

**Spawn Triggers:**
- Scheduled task time
- Calendar event approaching
- User scheduling request

**Tasks:**
1. `task_schedule` - Create scheduled task
2. `reminder_set` - Set reminder
3. `calendar_sync` - Sync with calendar
4. `trigger_execute` - Run time-based action
5. `conflict_resolve` - Handle scheduling conflicts

---

## Implementation Roadmap

### Phase 1 (Week 1-2): HIGH Priority
1. Implement Apollo
2. Implement Hermes
3. Integration testing with existing agents

### Phase 2 (Week 3-4): MEDIUM Priority
4. Implement Chiron
5. Implement Clio
6. Implement Mnemosyne
7. Implement Tyche

### Phase 3 (Week 5-6): LOW Priority
8. Implement Hyperion
9. Implement Iris
10. Implement Atlas

### Phase 4 (Week 7+): Integration
- Cross-agent communication
- Shared memory access
- Orchestration rules
- Dashboard integration

---

## Agent Communication Protocol

```typescript
interface AgentMessage {
  from: string;      // Agent ID
  to: string;        // Agent ID or "broadcast"
  type: "request" | "response" | "notification";
  task: string;      // Task type
  payload: any;      // Task-specific data
  priority: 1 | 2 | 3;
  timestamp: number;
}

// Example: Apollo requests research from Delver
{
  from: "apollo",
  to: "delver",
  type: "request",
  task: "research",
  payload: { query: "client_name recent news" },
  priority: 2,
  timestamp: 1740460800000
}
```

---

## Updated Agent Registry

After implementation, the full roster will be:

| Agent | Role | Priority | Status |
|-------|------|----------|--------|
| Athena | Main Orchestrator | 1 | ACTIVE |
| Sterling | Finance/Auto-Bidder | 1 | ACTIVE |
| Apollo | Client Relations | 1 | PLANNED |
| Hermes | Outreach/Marketing | 1 | PLANNED |
| Ishtar | Oracle/PAI Research | 2 | ACTIVE |
| Felicity | Code Artisan | 2 | READY |
| Cisco | Security/BMAD | 2 | READY |
| Prometheus | Executor | 2 | READY |
| Chiron | QA | 2 | PLANNED |
| Clio | Documentation | 2 | PLANNED |
| Mnemosyne | Memory/Knowledge | 2 | PLANNED |
| Tyche | Trend Scout | 2 | PLANNED |
| Delver | Research | 3 | READY |
| Squire | Assistant | 3 | READY |
| THEMIS | Council | 3 | READY |
| Hyperion | Backup/DR | 3 | PLANNED |
| Iris | Notification Hub | 3 | PLANNED |
| Atlas | Scheduler | 3 | PLANNED |

**Total Agents:** 18 (9 existing + 9 planned)

---

*Architecture designed by Ishtar - 2026-02-25*

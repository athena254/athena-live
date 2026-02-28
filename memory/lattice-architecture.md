# 🕸️ LATTICE ARCHITECTURE
**Fundamental System Restructure**  
**Date:** 2026-02-28  
**Status:** PHASE 1 IN PROGRESS

---

## The Shift: Hierarchy → Lattice

### Current Model (Hierarchy)
```
         ATHENA
        /  |  \
     Ster  Ish  Delv
      |     |    |
 up, instructions flow     [Agents report down]
```

### Lattice Model
```
      ┌─────────────────────────────────────┐
      │           ATHENA                    │
      │    (Lattice Architect)              │
      │    Monitors health, synthesizes     │
      └─────────────────────────────────────┘
              │   │   │   │   │   │
      ┌───────┐ │ ┌──┴──┐ │ ┌──┴──┐ │
      │Sterlng│◄─┤Kratos│ │ │Shannon│◄─┤Cisco
      │↔Krts │   │↔Ster │   │↔Felic│   │
      └───────┘   └─────┘   └──────┘   │
         │             │           │
      ┌──┴──┐      ┌───┴───┐   ┌────┴────┐
      │Delvr│◄────►│ Felcity│◄─►│Promeths│
      └─────┘      └───────┘   └────────┘
```

**Key difference:** Intelligence flows directly between agents. Athena synthesizes, doesn't bottleneck.

---

# PHASE 1: CONNECTION MAPPING 🔄 IN PROGRESS

*Before writing code — map every agent and every meaningful connection*

## Agent Inventory

| Agent | Domain | Outputs | Needs From |
|-------|--------|---------|------------|
| **Athena** | Orchestration | Synthesis, coordination | Everything |
| **Sterling** | Finance/Bidding | Bid decisions, financial patterns | Crypto exposure, career goals |
| **Kratos** | Crypto/DeFi | Portfolio analysis, market signals | Financial context, career risk |
| **Shannon** | Security | Vulnerability reports | Code from Felicity, architecture from Cisco |
| **Cisco** | Security/BMAD | Risk assessments | Vulnerabilities, system architecture |
| **Felicity** | Code | Implementation, fixes | Security requirements, specs |
| **Prometheus** | Execution | Task completion | Code from Felicity |
| **Delver** | Research | Findings, analysis | Domain context from any |
| **Ishtar** | Oracle/Companion | Insights, TELOS | Everything (oracle perspective) |
| **THEMIS** | Council/Deliberation | Verdict, recommendations | All agent outputs |
| **Squire** | Assistant | Support tasks | Context from any |
| **Nexus** | Synthesis | Cross-domain insights | Domain outputs |
| **Apollo** | Client Relations | Outreach, proposals | Market research, financial capacity |
| **Hermes** | Marketing | Campaigns, content | Research, financial positioning |
| **Ghost** | Browser | Automation | Tasks, targets |

---

## Connection Map

### Primary Connections (Must Have)

| # | From | To | Direction | Trigger | Payload |
|---|------|----|-----------|---------|---------|
| 1 | Sterling | Kratos | ↔ BIDIR | Financial pattern with crypto implications | Summary + relevance tags |
| 2 | Kratos | Sterling | ↔ BIDIR | Crypto analysis with financial impact | Summary + relevance tags |
| 3 | Shannon | Cisco | → UNIDIR | New vulnerability found | Severity + details + affected component |
| 4 | Cisco | Shannon | → UNIDIR | Assessment request | Scope + context |
| 5 | Shannon | Felicity | → UNIDIR | Security issue in code | Location + severity + fix guidance |
| 6 | Cisco | Felicity | → UNIDIR | Approved security requirement | Spec + priority |
| 7 | Felicity | Shannon | → UNIDIR | Code complete, request review | Location + changes |
| 8 | Felicity | Cisco | → UNIDIR | Security fix applied | What + why + verification |
| 9 | Delver | Sterling | → UNIDIR | Job/financial opportunity found | Opportunity details + relevance |
| 10 | Delver | Kratos | → UNIDIR | Market intelligence relevant to crypto | Intelligence + confidence |
| 11 | Delver | Ishtar | → UNIDIR | Strategic insight for operator | Insight + implications |
| 12 | Sterling | Delver | → UNIDIR | Research request | Topic + priority + deadline |
| 13 | Ishtar | Athena | → SYNTHESIS | Oracle insight requiring action | Insight + urgency + recommendation |
| 14 | THEMIS | ALL | ⇄ BROADCAST | Deliberation request | Topic + context + agents needed |
| 15 | Apollo | Sterling | → UNIDIR | Client capacity question | Project scope + timeline |
| 16 | Hermes | ALL | ⇄ COLLAB | Campaign needing domain input | Campaign + domains needed |

---

## Connection Conditions

Each connection activates under specific conditions:

### Sterling ↔ Kratos
- **Activates when:** Either detects pattern in other's domain
- **Direction:** Bidirectional
- **Content:** Summary (<200 chars) + relevance tags + action recommendation
- **Receiving agent action:** 
  - Kratos: Factor into portfolio analysis, flag if significant
  - Sterling: Factor into bidding strategy, flag if significant
- **Escalation:** If combined insight → send synthesis to Athena

### Shannon → Cisco
- **Activates when:** New vulnerability confirmed (not suspected)
- **Direction:** Unidirectional
- **Content:** CVE-style report + severity (CRITICAL/HIGH/MEDIUM/LOW) + affected components
- **Receiving agent action:** Cisco assesses, determines response required

### Shannon → Felicity
- **Activates when:** Vulnerability in code OR security requirement needed
- **Direction:** Unidirectional  
- **Content:** File path + line numbers + severity + remediation guidance
- **Receiving agent action:** Felicity implements fix or adds security control

### Delver → Domain Agents
- **Activates when:** Research finding has domain-specific implications
- **Direction:** One-to-one or one-to-many
- **Content:** Finding + confidence level + relevance to domain
- **Receiving agent action:** Agent evaluates relevance, responds if actionable

---

## What Information Should NOT Travel Lattice

| Type | Route | Why |
|------|-------|-----|
| Routine task updates | Direct to Athena | Coordination still needed |
| Operator queries | Direct to Athena | Athena routes to right agent |
| Emergency/security CRITICAL | Athena (for visibility) | Need centralized response |
| Context-building | Athena (for memory) | Long-term memory is centralized |

---

## Phase 1 Deliverable

**File:** `memory/lattice-connection-map.md` — This document IS the Phase 1 deliverable.

It must be complete, accurate, and reviewed before Phase 2 begins.

---

# PHASE 2: COMMUNICATION INFRASTRUCTURE

*Design and build the messaging layer*

## Requirements

1. **Reliability:** Messages must not be lost
2. **Speed:** <1s latency for direct messages
3. **Auditability:** Every message logged, retrievable
4. **Extensibility:** Adding agents/connections requires minimal change

## Implementation Options

### Option A: Session-Based (Current OpenClaw)
- Uses `sessions_send` between agent sessions
- Pros: Already implemented, no new infrastructure
- Cons: Route through Athena for discovery

### Option B: Shared Message Bus
- Agents post to shared queue
- Pros: True decoupled communication
- Cons: New infrastructure needed

### Option C: Hybrid
- Direct session messages for active agents
- Message bus for idle agents

**Recommendation:** Option C - start with what's available, evolve as needed

---

## Message Schema

```typescript
interface LatticeMessage {
  id: string;                    // uuid
  timestamp: string;              // ISO 8601
  from: AgentId;
  to: AgentId;
  connectionId: string;          // Reference to lattice-config.json
  type: 'INSIGHT' | 'REQUEST' | 'ALERT' | 'SYNTHESIS';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payload: {
    summary: string;             // <200 chars
    details: string;            // Full content (optional)
    relevance: string[];        // Tags for routing
    action?: string;             // What recipient should do
    requiresResponse: boolean;
    responseDeadline?: string;
  };
  routing: {
    path: AgentId[];             // Full path taken
    hopCount: number;
    latency: number;             // ms
  };
  audit: {
    loggedAt: string;
    retrievedAt?: string;
  };
}
```

---

## Logging & Audit

Every message stored in:
- **File:** `memory/lattice-messages.jsonl`
- **Database:** `memory/lattice_messages` table

Queryable by:
- `from_agent`
- `to_agent`  
- `connection_id`
- `timestamp`
- `priority`

---

# PHASE 3: AGENT INTEGRATION

*Integrate agents one at a time*

## Integration Checklist Per Agent

- [ ] Update agent's lattice awareness (knows its connections)
- [ ] Add send logic (when to send, what to send)
- [ ] Add receive logic (how to process incoming)
- [ ] Add mem0 tracking (sent/received/actions taken)
- [ ] Test bidirectional flow with connected agent
- [ ] Document first successful exchange

## Integration Order

1. **Sterling ↔ Kratos** (Proof of concept - simplest bidirectional)
2. **Shannon → Cisco** (One-directional, clear trigger)
3. **Shannon → Felicity** (Security workflow)
4. **Delver → Domain** (Research distribution)
5. **THEMIS broadcast** (Council deliberation)
6. **Ishtar synthesis** (Oracle perspective)

---

# PHASE 4: ATHENA'S LATTICE ROLE

*Athena becomes architect, not bottleneck*

## Athena's New Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Connection Health** | Monitor every connection's activity level |
| **Synthesis** | Combine insights from multiple agents |
| **New Connections** | Identify when agents should connect but don't |
| **Pattern Detection** | Learn which connections produce valuable insights |
| **Escalation Handling** | Receive and process escalated insights |

## Lattice Management Dashboard

**Existing:** `athena-live/lattice-monitor.html` (Phase 1)

**To build (Phase 4):**
- Real-time message flow visualization
- Connection health scores
- Synthesis quality metrics
- New connection recommendations

---

# PHASE 5: LATTICE INTELLIGENCE LAYER

*The lattice learns from itself*

## What It Learns

1. **Connection Value:** Which connections carry highest-value information?
2. **Agent Performance:** Which agents produce insights that generate useful responses?
3. **Pattern Discovery:** Which information types should travel to additional nodes?
4. **Bottleneck Detection:** Where is information getting stuck?

## Athena's Learning Process

```
Each night at 02:00 UTC:
1. Query last 24h of lattice messages
2. Calculate connection metrics:
   - Message count per connection
   - Average latency
   - Synthesis rate (messages that generated responses)
3. Identify patterns:
   - Which senders consistently produce valuable insights?
   - Which receivers act quickly vs. ignore?
   - Are there missing connections that should exist?
4. Update lattice-config.json if needed:
   - Add new connections
   - Remove stale connections
   - Adjust message types
5. Generate report for morning report
```

---

## Quality Over Speed

| Phase | Focus | Done When |
|-------|-------|-----------|
| Phase 1 | Connection Map | Every agent mapped, every connection defined |
| Phase 2 | Infrastructure | Reliable, auditable messaging exists |
| Phase 3 | Integration | Each agent tested with real messages |
| Phase 4 | Athena Role | Dashboard complete, synthesis working |
| Phase 5 | Intelligence | System learning from its own patterns |

**Timeline:** This is a living architecture. Phase 1 alone takes as long as it takes to get right.

---

*Document lives in: memory/lattice-architecture.md*  
*Updated: 2026-02-28 02:35 UTC*

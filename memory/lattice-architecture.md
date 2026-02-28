# 🕸️ LATTICE ARCHITECTURE
**Fundamental System Restructure**  
**Date:** 2026-02-28  
**Status:** DESIGN PHASE

---

## The Shift: Hierarchy → Lattice

### Current Model (Hierarchy)
```
         ATHENA
        /  |  \
     Ster  Ish  Delv
      |     |    |
     [Agents report up, instructions flow down]
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

## Connection Topology

### Primary Connections (Domain Overlap)

| Agent | Connects To | Why |
|-------|-------------|-----|
| **Sterling** | Kratos | Finance ↔ Crypto intersection |
| **Kratos** | Sterling, Delver | Crypto patterns + market research |
| **Shannon** | Cisco, Felicity | Security findings → fixes |
| **Cisco** | Shannon, Felicity | Security assessment + implementation |
| **Felicity** | Shannon, Cisco, Prometheus | Code + security + execution |
| **Delver** | Sterling, Kratos, Ishtar | Research + finance + strategy |
| **Ishtar** | All | Oracle perspective on everything |
| **Prometheus** | Felicity, Squire | Execution + code + assistance |
| **THEMIS** | All | Deliberation on any decision |
| **Athena** | All (monitor only) | Lattice architect |

### Secondary Connections (Event-Driven)

| Trigger | Propagation |
|---------|-------------|
| Security finding | Shannon → Cisco → Felicity (parallel) |
| Financial insight | Sterling ↔ Kratos (bidirectional) |
| Research discovery | Delver → relevant domain agents |
| Career decision | Delver → Sterling → Athena |

---

## Message Protocol

### Message Types

```typescript
type LatticeMessage = {
  id: string;              // Unique message ID
  from: AgentId;           // Originating agent
  to: AgentId | 'BROADCAST'; // Recipient(s)
  type: 'INSIGHT' | 'REQUEST' | 'ALERT' | 'SYNTHESIS';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  payload: {
    summary: string;       // One-line summary
    details: string;       // Full content
    relevance: string[];   // Tags for routing
    action?: string;       // What recipient should do
    ttl: number;           // Time-to-live in hours
  };
  created: string;         // ISO timestamp
  expires?: string;        // Expiration
};
```

### Message Flow

```
Sterling finds pattern 
     │
     ▼
┌─────────────┐
│ Lattice     │
│ Router      │ ◄─── Direct to Kratos (not through Athena)
└─────────────┘
     │
     ▼
Kratos receives, factors into analysis
     │
     ▼
If synthesis needed → Kratos + Sterling → Athena (combined)
     │
     ▼
Athena surfaces to Dis (richer than individual report)
```

---

## Lattice Health Monitoring

Athena monitors lattice health, not every message.

### Metrics

| Metric | Target | Alert |
|-------|--------|-------|
| Connection freshness | < 24h | No messages on connection in 24h |
| Synthesis rate | > 50% | Agents escalating without synthesis |
| Cross-agent insights | > 10/day | Disconnected agents |
| Response latency | < 5min (HIGH), < 1hr (MEDIUM) | Pathological delays |

### Dashboard

`athena-live/lattice-monitor.html` shows:
- Active connections
- Messages per hour
- Synthesis quality score
- Agent health indicators

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Enable agentToAgent in openclaw.json
- [ ] Define connection topology in `lattice-config.json`
- [ ] Build lattice monitor dashboard

### Phase 2: Direct Paths (Week 2)
- [ ] Sterling ↔ Kratos connection live
- [ ] Test cross-agent insight flow
- [ ] Document first synthesis

### Phase 3: Security Cluster (Week 3)
- [ ] Shannon → Cisco → Felicity path
- [ ] Parallel response to security findings

### Phase 4: Full Lattice (Week 4)
- [ ] All primary connections active
- [ ] Athena shifts to architect mode
- [ ] Measure: synthesis rate vs. escalation rate

---

## Quality Over Speed

This is not a fast build. Each phase requires:
- Actual usage, not just enabled
- Evidence of cross-agent intelligence
- Synthesis quality verification

**The goal:** Intelligence that emerges from connection, not coordination.

---

## Decision: Build Approach

### Option A: Incremental
Enable agentToAgent, activate one connection pair (Sterling↔Kratos), measure, expand.

### Option B: Full Architecture
Build complete lattice monitor, define all connections, activate comprehensively.

**Recommendation:** Option A - prove with Sterling↔Kratos first, then expand.

---

*This document lives in memory/lattice-architecture.md*
*Updated: 2026-02-28 02:25 UTC*

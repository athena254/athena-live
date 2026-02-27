# MEM0 Integration Plan

**Repository:** https://github.com/mem0ai/mem0.git  
**Status:** Pending Installation (pip limited in environment)

---

## Phase 1: Configuration

### Storage Backend
**Selected:** Local Vector Storage (Chroma)

**Rationale:**
- No external service needed
- Free, persistent
- Works offline

### Config Location
`/root/.openclaw/config/mem0.json`

---

## Phase 2: Memory Architecture

### Agent Memory Namespaces

| Agent | Namespace | Contents |
|-------|-----------|----------|
| Athena | `athena_system` | Routing decisions, broadcasts, preferences |
| Ishtar | `ishtar_companion` | Conversations, preferences, TELOS |
| THEMIS | `themis_council` | Deliberations, verdicts, patterns |
| Sterling | `sterling_finance` | Bid history, wins, pricing |
| Felicity | `felicity_code` | Builds, patterns, preferences |
| Shannon | `shannon_pentest` | Targets, findings, techniques |
| Katie | `katie_cyber` | Analyses, results, methods |

### Shared Memory
| Namespace | Access | Contents |
|-----------|--------|----------|
| `system_shared` | Read: All / Write: Athena | Dashboard state, tools, APIs, operator prefs |

---

## Token Savings Estimate

| Agent | Current Context | With Mem0 | Savings |
|-------|-----------------|------------|---------|
| Athena | ~15k tokens | ~3k | ~80% |
| THEMIS | ~10k tokens | ~2k | ~80% |
| Shannon | ~8k tokens | ~1.5k | ~80% |

---

## Installation Commands (for deployment)

```bash
pip install mem0ai
```

---

## Implementation Notes

Mem0 provides:
- Persistent vector storage
- Semantic search
- Memory consolidation
- User/agent namespaces

Will reduce API token usage significantly once installed.

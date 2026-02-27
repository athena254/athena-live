# FULL REDUNDANCY & CLEANUP AUDIT
**Date:** 2026-02-27 23:50 UTC  
**Total Disk:** 79GB | **Used:** 71GB | **Free:** 3.8GB

---

## 📊 SUMMARY

| Metric | Value |
|--------|-------|
| Total Space Used | 71GB |
| High Confidence Recovery | ~8.2GB |
| Medium Confidence | ~200MB |
| 10 Largest Items | See below |

### Top 10 Largest Items
| Size | Path | Category |
|------|------|----------|
| 4.2GB | /root/.cache/pip | Cache |
| 4.2GB | /root/.ollama/models | AI Models |
| 1.6GB | /root/.cache/qmd | Cache |
| 1.3GB | /root/.npm/_cacache | Cache |
| 884MB | /root/.cache/go-build | Cache |
| 622MB | /root/.cache/ms-playwright | Browser |
| 50MB | /workspace/athena-live | Active |
| 50MB | /memory/main.sqlite | Database |
| 41MB | /workspace/node_modules | Dependencies |
| 41MB | /workspace/browser-use | Tool |

---

## 1. DUPLICATE FILES

### Known Duplicates
| Size | Path 1 | Path 2 |
|------|--------|---------|
| 928KB | /memory/athena.db | /workspace-ishtar-whatsapp/memory/athena.db |
| 20KB | /memory/critical_files_backups.db | /workspace-ishtar-whatsapp/memory/...db |

**Confidence:** HIGH - Exact duplicates

---

## 2. OLD LOGS

| Size | Path | Last Modified | Confidence |
|------|------|--------------|------------|
| 1.9KB | /logs/bot-fleet/athena.log | Feb 19 | HIGH |
| 669B | /logs/bot-fleet/prometheus.log | Feb 19 | HIGH |
| 669B | /logs/bot-fleet/prometheus2.log | Feb 19 | HIGH |
| 669B | /logs/bot-fleet/themis.log | Feb 19 | HIGH |

---

## 3. TEMPORARY FILES

### Cache Directories (~7.6GB)
| Size | Path | Confidence |
|------|------|------------|
| 4.2GB | /root/.cache/pip | HIGH |
| 1.6GB | /root/.cache/qmd | HIGH |
| 884MB | /root/.cache/go-build | HIGH |
| 1.2GB | /root/.npm/_cacache | HIGH |
| 72MB | /root/.npm/_npx | HIGH |
| 67MB | /root/.cache/node-gyp | HIGH |
| 1.5MB | /root/.npm/_logs | HIGH |

### Tmp Files (~5MB remaining)
| Size | Path | Confidence |
|------|------|------------|
| ~5MB | /tmp/* various | HIGH |

---

## 4. ORPHANED DEPENDENCIES

### Node Modules (Not in Active Projects)
| Size | Path | Status |
|------|------|--------|
| 16MB | /workspace/skills/last30days/.../node_modules | Possibly orphaned |

**Assessment:** Last30days skill may still need node_modules

---

## 5. REDUNDANT VIRTUAL ENVIRONMENTS

| Size | Path | Assessment |
|------|------|------------|
| ~50MB | /root/.venv | Single venv - KEEP |

---

## 6. STALE BUILD ARTIFACTS

| Size | Path | Confidence |
|------|------|------------|
| 884MB | /root/.cache/go-build | HIGH |
| 622MB | /root/.cache/ms-playwright | MEDIUM (may need) |

---

## 7. OLD BACKUPS

| Size | Path | Confidence |
|------|------|------------|
| 4KB | /openclaw.json.bak | HIGH |
| - | /credentials/.../creds.json.bak | HIGH |

---

## 8. ABANDONED PROJECT DIRECTORIES

*(Checked - most are useful or already deleted)*

| Size | Path | Assessment |
|------|------|------------|
| 35MB | /workspace/perplexica-agent | KEEP - AI search |
| 22MB | /workspace/RepoAgent | KEEP - Code docs |
| 41MB | /workspace/browser-use | KEEP - Automation |

---

## 9. ROTATED CONFIG FILES

| Size | Path | Confidence |
|------|------|------------|
| 4KB | /openclaw.json.bak | HIGH |
| - | /cron/jobs.json.bak | HIGH |

---

## 10. EMPTY DIRECTORIES

| Path | Confidence |
|------|------------|
| /workspace-ishtar-whatsapp/memory/state/algorithms | HIGH |
| /workspace-ishtar-whatsapp/memory/campaigns | HIGH |
| Various .git empty dirs | LOW |

---

## 11. DOCKER ARTIFACTS

**Cannot access** - Docker overlay filesystem (system-managed)

---

## 12. SYSTEM PACKAGE CACHE

**Not scanned** - System directories

---

## 13. DUPLICATE/OLD DATABASE FILES

| Size | Path | Confidence |
|------|------|------------|
| 928KB | /workspace/memory/athena.db | HIGH (duplicate) |
| 20KB | /workspace/memory/critical_files_backups.db | HIGH (duplicate) |

---

## 14. UNUSED APPLICATION FILES

| Size | Path | Assessment |
|------|------|------------|
| 4.2GB | /root/.ollama/models | KEEP - AI models |
| 622MB | /root/.cache/ms-playwright | KEEP - Browser |

---

## 🚀 RECOVERY SUMMARY

### HIGH CONFIDENCE
| Category | Size |
|----------|------|
| pip cache | 4.2GB |
| qmd cache | 1.6GB |
| npm cache | 1.3GB |
| go-build cache | 884MB |
| node-gyp cache | 67MB |
| npx cache | 72MB |
| Old logs | 4KB |
| Backup files | 5KB |
| Duplicate DBs | 1MB |

**Total HIGH:** ~8.1GB

### MEDIUM CONFIDENCE
| Category | Size |
|----------|------|
| ms-playwright cache | 622MB |

---

## ✅ ALREADY CLEANED THIS SESSION
- devika, agent-proto, babyagi, athena-cyber-os: ~37MB
- /tmp/openclaw: ~41MB
- athena-starter-pack.zip: 3.1MB
- Various old logs: ~4KB

---

## 📋 APPROVED FOR DELETION

```bash
# Cache cleanup (~8.1GB)
rm -rf /root/.cache/pip
rm -rf /root/.cache/qmd  
rm -rf /root/.npm/_cacache
rm -rf /root/.npm/_npx
rm -rf /root/.cache/go-build
rm -rf /root/.cache/node-gyp

# Old logs
rm -f /root/.openclaw/logs/bot-fleet/*.log

# Backup files
rm -f /root/.openclaw/openclaw.json.bak
rm -f /root/.openclaw/cron/jobs.json.bak

# Duplicate DBs
rm -f /root/.openclaw/workspace/memory/athena.db
rm -f /root/.openclaw/workspace/memory/critical_files_backups.db
```

**Potential Recovery:** ~8.1GB

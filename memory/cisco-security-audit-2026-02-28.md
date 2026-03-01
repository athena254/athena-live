# 🔒 SECURITY AUDIT REPORT - Cisco
**2026-02-28 16:15 UTC**

---

## Problems Found (with severity)

| Severity | Issue | Location |
|----------|-------|----------|
| **CRITICAL** | 2,305 credential files with 644 permissions (should be 600) | `/root/.openclaw/credentials/` |
| **HIGH** | API keys stored in plaintext in `openclaw.json` | `/root/.openclaw/openclaw.json` |
| **HIGH** | `.gitignore` file contains actual env content with API key | `/root/.openclaw/.gitignore` (lines 45-53) |
| **MEDIUM** | Hardcoded gateway token in config | `openclaw.json` → gateway.auth.token |
| **MEDIUM** | 13 zombie node processes (process leak) | Running processes |
| **LOW** | Gateway listens only on localhost | Ports 18789-18792 (127.0.0.1) |

---

## Recommended Actions (with priority)

| Priority | Action |
|----------|--------|
| **P1** | Fix all credential file permissions: `find /root/.openclaw/credentials -type f -exec chmod 600 {} \;` |
| **P1** | Remove embedded env content from `.gitignore` - create proper `.env` file instead |
| **P2** | Move API keys from `openclaw.json` to environment variables or secret manager |
| **P2** | Rotate the hardcoded gateway token |
| **P3** | Clean up zombie node processes - investigate root cause |
| **P3** | Consider encrypting `openclaw.json` at rest |

---

## Quick Wins (immediate fixes)

```bash
# Fix credential permissions (immediate)
find /root/.openclaw/credentials -type f -exec chmod 600 {} \;

# Rotate gateway token (generate new)
openssl rand -hex 20

# Separate .gitignore from env content
# Extract lines 45-53 to /root/.openclaw/skills/themis/.env
```

---

## Summary

- **Credential exposure risk**: HIGH - 2,305 files readable by any user on the system
- **API key exposure**: MODERATE - Keys in openclaw.json but file is .gitignored
- **Git history**: CLEAN - No exposed keys found in commit history
- **Network posture**: GOOD - Gateway only listens on localhost
- **Zombie processes**: NEEDS INVESTIGATION - Multiple defunct node processes

**Immediate action**: Run the permission fix command above to secure credentials.

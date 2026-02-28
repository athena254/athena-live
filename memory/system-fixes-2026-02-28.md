# System Fixes - 2026-02-28

## Issues Found

### 1. THEMIS Bot - Invalid Telegram Token (CRITICAL)
- **Problem**: Bot token `8537973261:AAE82ChF6kv1N7CMEfLI-YzzPU3LgU9rAtk` returns 401 Unauthorized
- **Location**: `/root/.openclaw/bots/themis/config.json`
- **Impact**: THEMIS bot cannot connect to Telegram, service constantly restarts
- **Status**: NEEDS FIX - Token invalid or revoked

### 2. SearXNG - Missing Installation (CRITICAL)
- **Problem**: Installation directory `/root/.openclaw/searxng-install/` doesn't exist
- **Location**: `/etc/systemd/system/searxng.service`
- **Impact**: Service fails with exit code 203/EXEC (cannot find executable)
- **Status**: NEEDS FIX - Reinstall required or disable service

### 3. Deprecated datetime.utcnow() (MINOR)
- **Problem**: Scripts use deprecated `datetime.utcnow()`
- **Locations**: 
  - `/root/.openclaw/workspace/scripts/supermemory_backup.py`
  - `/root/.openclaw/workspace/cleanup/memory_validator.py`
- **Impact**: Deprecation warnings, will break in future Python versions
- **Status**: PENDING FIX

## Actions Taken

### Attempted Fixes
1. Disabled searxng service to stop restart loop
2. Fixed deprecated datetime.utcnow() in:
   - `/root/.openclaw/workspace/scripts/supermemory_backup.py` (3 occurrences)
   - `/root/.openclaw/workspace/cleanup/memory_validator.py` (1 occurrence)
3. Created this documentation

### Manual Actions Required
1. **THEMIS**: Obtain new Telegram bot token from @BotFather
2. **SearXNG**: Either reinstall or decide if service is still needed

## Resolution

- [x] Deprecated datetime: Update to `datetime.now(datetime.timezone.utc)` - DONE
- [x] SearXNG: Disabled failing service - DONE
- [ ] THEMIS: Update bot token in `/root/.openclaw/bots/themis/config.json`
- [ ] THEMIS: Update bot token in `/root/.openclaw/skills/themis/.env`

---

## Current Status (2026-02-28 01:17 UTC)

### System Health
- **Gateway**: Running on port 18789 ✓
- **Cron jobs**: 30 total, 5 with errors (mostly timeouts)
- **Supermemory backup**: Working ✓
- **Memory cleanup**: Working ✓

### Known Issues
1. **THEMIS Bot Token** - Invalid, needs replacement from @BotFather
2. **Zombie Node Processes** - 15 defunct processes from old runs (minor issue)
3. **Cron Job Errors** - 5 jobs showing "error" status (timeout-related)

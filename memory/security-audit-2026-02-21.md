# CERBERUS Security Audit Report
**Date:** 2026-02-21 22:26 UTC  
**Auditor:** CERBERUS Security Protocol  
**Classification:** CONFIDENTIAL

---

## Executive Summary

⚠️ **CRITICAL SECURITY ISSUES IDENTIFIED**

This audit revealed **multiple critical security vulnerabilities** requiring immediate remediation. Several API keys and tokens are stored in world-readable configuration files, and directory permissions allow unauthorized access to sensitive credential stores.

---

## Detailed Findings

### 1. Credentials Directory Permissions

| Path | Permissions | Status |
|------|-------------|--------|
| `/root/.openclaw/credentials/` | drwxr-xr-x (755) | ⚠️ WARNING |
| `/root/.openclaw/credentials/telegram-*.json` | -rw------- (600) | ✅ PASS |
| `/root/.openclaw/credentials/whatsapp/` | drwxr-xr-x (755) | ❌ FAIL |
| `/root/.openclaw/credentials/whatsapp/default/` | drwxr-xr-x (755) | ❌ FAIL |
| `/root/.openclaw/credentials/whatsapp/default/creds.json` | -rw------- (600) | ✅ PASS |
| `/root/.openclaw/credentials/whatsapp/default/pre-key-*.json` | -rw------- (600) | ✅ PASS |

**Issues:**
- Parent credentials directory is world-readable (755)
- WhatsApp subdirectories are world-readable (755)
- Pre-key files have correct permissions but parent directories expose them

**Remediation:**
```bash
chmod 700 /root/.openclaw/credentials/
chmod 700 /root/.openclaw/credentials/whatsapp/
chmod 700 /root/.openclaw/credentials/whatsapp/default/
```

---

### 2. API Keys Hardcoded in Workspace Files

| Check | Status |
|-------|--------|
| Workspace files scanned | ✅ PASS |
| No API keys in `.md`, `.json`, `.yaml`, `.env`, `.txt` files in workspace | ✅ PASS |

**Note:** Workspace files are clean. However, see Section 3 for configuration file issues.

---

### 3. GitHub PAT Scope and Expiry

| Check | Status |
|-------|--------|
| GitHub PAT in configuration | ⚠️ NOT FOUND |
| Environment variables | ⚠️ NOT FOUND |

**Status:** ⚠️ **INCONCLUSIVE**  
No GitHub Personal Access Token was found in scanned locations. If GitHub integration is used, verify token storage location.

---

### 4. WhatsApp Pre-keys Validity

| Check | Status |
|-------|--------|
| Pre-key files exist | ✅ PASS |
| Pre-key structure valid | ✅ PASS |
| Current pre-key range: 100-1552 | ✅ PASS |
| Credentials file exists | ✅ PASS |
| Device registered | ⚠️ `registered: false` in creds.json |

**Status:** ✅ PASS with advisory  
Pre-keys are properly generated and stored. Note that `registered` flag is `false` in credentials - this may be expected depending on pairing state.

**Active WhatsApp Identity:**
- ID: `254778816429:6@s.whatsapp.net`
- LID: `62917697376429:6@lid`
- Platform: android
- Registration ID: 205

---

### 5. Telegram Bot Token Permissions

| Bot Name | Token Exposed In | Permissions |
|----------|-----------------|-------------|
| Main Bot | `openclaw.json` | 644 ❌ FAIL |
| Athena | `telegram-bots.json` | 644 ❌ FAIL |
| Prometheus | `telegram-bots.json` | 644 ❌ FAIL |
| THEMIS | `telegram-bots.json` | 644 ❌ FAIL |

**Tokens Found (REDACTED):**
```
Main Bot:    8493557802:AAH9********************************
Athena:      8540710710:AAFi********************************
Prometheus:  8502681410:AAHF********************************
THEMIS:      8537973261:AAE8********************************
```

**Critical Issue:** Bot tokens stored in world-readable files (644 permissions)

**Remediation:**
```bash
chmod 600 /root/.openclaw/openclaw.json
chmod 600 /root/.openclaw/telegram-bots.json
```

**Token Permissions Audit:**
- Cannot verify token scopes without BotFather access
- Recommend reviewing each bot's permissions via BotFather

---

### 6. OpenRouter API Key Usage Limits

| Check | Status |
|-------|--------|
| Key exists | ✅ FOUND |
| Storage location | `openclaw.json` (644 permissions) ❌ |
| Key prefix | `sk-or-v1-` |

**Key Found (REDACTED):**
```
sk-or-****REDACTED****
```

**Issues:**
- Key stored in world-readable configuration file
- Cannot verify usage limits without API access

**Remediation:**
1. Rotate key immediately
2. Store in environment variable or secure vault
3. Set file permissions to 600

---

### 7. Vercel Token Scope

| Check | Status |
|-------|--------|
| Vercel token in configuration | ⚠️ NOT FOUND |
| Environment variables | ⚠️ NOT FOUND |

**Status:** ⚠️ **INCONCLUSIVE**  
No Vercel token found in scanned locations. If Vercel integration is used, verify token storage.

---

## Additional Critical Findings

### Configuration File Security

| File | Permissions | Contains Secrets | Status |
|------|-------------|-----------------|--------|
| `/root/.openclaw/openclaw.json` | 644 | YES - Multiple API keys | ❌ CRITICAL |
| `/root/.openclaw/telegram-bots.json` | 644 | YES - Bot tokens | ❌ CRITICAL |

**API Keys Exposed in openclaw.json:**

| Provider | Key Prefix | Status |
|----------|------------|--------|
| Tavily | `tvly-dev-` | ❌ EXPOSED |
| Modal | `modalresearch_` | ❌ EXPOSED |
| OpenRouter | `sk-or-****` | ✅ SECURED |
| Google AI | `AIzaSy` | ❌ EXPOSED |
| NVIDIA | `nvapi-` | ❌ EXPOSED |
| Groq | `gsk_` | ❌ EXPOSED |
| Gateway Token | (32 char hex) | ❌ EXPOSED |

---

## Remediation Checklist

### Immediate Actions (Priority: CRITICAL)

- [ ] **Rotate ALL exposed API keys immediately**
  - [ ] Tavily API key
  - [ ] Modal API key
  - [ ] OpenRouter API key
  - [ ] Google AI API key
  - [ ] NVIDIA API key
  - [ ] Groq API key
  - [ ] Gateway token

- [ ] **Fix file permissions:**
  ```bash
  chmod 600 /root/.openclaw/openclaw.json
  chmod 600 /root/.openclaw/telegram-bots.json
  chmod 700 /root/.openclaw/credentials/
  chmod 700 /root/.openclaw/credentials/whatsapp/
  chmod 700 /root/.openclaw/credentials/whatsapp/default/
  ```

- [ ] **Review Telegram bot permissions via BotFather**

### Short-term Actions (Priority: HIGH)

- [ ] Move API keys to environment variables
- [ ] Implement secrets management (e.g., HashiCorp Vault, AWS Secrets Manager)
- [ ] Add `.gitignore` entries for sensitive files
- [ ] Audit git history for exposed secrets

### Long-term Actions (Priority: MEDIUM)

- [ ] Implement automated secret scanning (e.g., GitLeaks, TruffleHog)
- [ ] Set up key rotation schedule
- [ ] Document secret management procedures

---

## Recommended Rotation Schedule

| Secret Type | Rotation Frequency | Last Rotation | Next Due |
|-------------|-------------------|---------------|----------|
| API Keys | Every 90 days | Unknown | IMMEDIATE |
| Telegram Bot Tokens | Every 180 days | Unknown | IMMEDIATE |
| Gateway Token | Every 30 days | Unknown | IMMEDIATE |
| WhatsApp Pre-keys | Auto-regenerated | Ongoing | N/A |

---

## Summary

| Check | Status |
|-------|--------|
| 1. Credentials directory permissions | ❌ FAIL |
| 2. No hardcoded API keys in workspace | ✅ PASS |
| 3. GitHub PAT scope and expiry | ⚠️ INCONCLUSIVE |
| 4. WhatsApp pre-keys validity | ✅ PASS |
| 5. Telegram bot token permissions | ❌ FAIL |
| 6. OpenRouter API key usage | ❌ FAIL (exposed) |
| 7. Vercel token scope | ⚠️ INCONCLUSIVE |

**Overall Assessment:** 🔴 **COMPROMISED - IMMEDIATE ACTION REQUIRED**

Multiple critical secrets are exposed in world-readable configuration files. Immediate rotation of ALL API keys and tokens is required, followed by implementation of proper access controls.

---

*End of Report - CERBERUS Security Protocol*

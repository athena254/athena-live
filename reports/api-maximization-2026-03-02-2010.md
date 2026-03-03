# API Allocation Table - 2026-03-02 20:10 UTC

## LIVE API STATUS

| Provider | Model | Status | Rate Limit | Daily Usage | Headroom | Cost |
|----------|-------|--------|------------|-------------|----------|------|
| **MODAL** | GLM-5-FP8 | ✅ WORKING | Unlimited | Unknown | High | Free |
| **NVIDIA** | Qwen 3.5 397B | ✅ WORKING | Unlimited | Unknown | High | Free |
| **GROQ** | Llama 3.3-70B | ✅ WORKING | 30/min* | Low | High | Free |
| **GOOGLE** | Gemini 2.5 Flash | ✅ WORKING | 15/min* | Low | High | Free |
| **MINIMAX** | M2.5 / M2.1 | ❌ OAUTH EXPIRED | N/A | N/A | 0 | $ |
| **QWEN PORTAL** | Coder / Vision | ❌ TOKEN EXPIRED | N/A | N/A | 0 | Free |
| **OPENROUTER** | 40+ Free Models | ❌ KEY INVALID | N/A | N/A | 0 | Free |

## WORKING API DETAIL

### 1. MODAL Direct (GLM-5-FP8) ✅
- **Endpoint:** `https://api.us-west-2.modal.direct/v1`
- **Key:** `modalresearch_o8axc4tgT7uo7Qg--...` (embedded)
- **Status:** WORKING - Test passed
- **Rate Limit:** Appears unlimited
- **Context:** 32K
- **Use:** Primary reasoning model

### 2. NVIDIA (Qwen 3.5 397B) ✅
- **Endpoint:** `https://integrate.api.nvidia.com/v1`
- **Key:** `nvapi-Jp7Yq6ehRZL3fmWflVMGg...` (embedded)
- **Status:** WORKING - Test passed
- **Rate Limit:** Unlimited
- **Context:** 128K
- **Use:** Primary coding/modeling

### 3. Groq (Llama 3.3-70B) ✅
- **Endpoint:** `https://api.groq.com/openai/v1`
- **Key:** `gsk_nvugDJjMZ3w8uZvA5lHnW...` (embedded)
- **Status:** WORKING - Test passed
- **Rate Limit:** ~30/min (variable)
- **Context:** 128K
- **Use:** Fast inference

### 4. Google Gemini ✅
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta`
- **Key:** `AIzaSyB6KMen697ZW3feTvdk8_UCuntE_r4gLfQ`
- **Status:** WORKING - Test passed
- **Rate Limit:** 15/min (lite)
- **Context:** 1M (Lite)
- **Use:** Large context tasks

## BROKEN APIs - REQUIRES ACTION

### 5. MiniMax (OAuth) ❌
- **Endpoint:** `https://api.minimax.io/anthropic/v1`
- **Auth:** `minimax-oauth` (placeholder)
- **Status:** 404 - OAuth session expired
- **Action:** Re-authenticate via `openclaw auth`

### 6. Qwen Portal (OAuth) ❌
- **Endpoint:** `https://portal.qwen.ai/v1`
- **Auth:** `qwen-oauth` (placeholder)
- **Status:** Token expired
- **Action:** Re-authenticate via `openclaw auth`

### 7. OpenRouter ❌
- **Endpoint:** `https://openrouter.ai/api/v1`
- **Key:** `sk-or-v1-391df93c38a645f1...` (invalid)
- **Status:** 401 - User not found
- **Action:** Regenerate key at openrouter.ai

## AGENT ALLOCATION (Current)

| Agent | Primary Model | Fallback | Status |
|-------|---------------|----------|--------|
| Athena | MiniMax-M2.5 | GLM5, qwen_nvidia | ❌ → GLM5 |
| Ishtar | Codex | GLM5, qwen_nvidia | ✅ |
| THEMIS | GLM5 | OpenRouter Free | ❌ → GLM5 |
| Felicity | qwen_nvidia | MiniMax-M2.1 | ✅ |
| Sterling | GLM5 | llama | ✅ |
| Nexus | qwen_nvidia | GLM5 | ✅ |
| Prometheus | llama | qwen | ✅ |
| Cisco | GLM5 | qwen | ✅ |

## RECOMMENDED ACTIONS

1. **CRITICAL:** Re-auth MiniMax OAuth
2. **CRITICAL:** Re-auth Qwen Portal OAuth  
3. **CRITICAL:** Rotate OpenRouter key
4. **OPTIONAL:** Enable GitHub Copilot for Codex access

---
*Generated: 2026-03-02 20:10 UTC*
*Protocol: api-maximization-6666666666666*

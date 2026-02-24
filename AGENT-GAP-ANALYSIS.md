# 🔍 Agent Gap Analysis Report

**Generated:** 2026-02-24 00:22 UTC  
**Source:** Config audit vs AGENT-ROSTER.md documentation

---

## 🚨 CRITICAL FINDINGS

### 1. Documentation vs Config Mismatch

| Documented Name | Config ID | Config Name | Status |
|----------------|----------|-------------|--------|
| Athena | main | Athena | ✅ Match |
| Sterling | finance | Finance | ⚠️ **MISMATCH** |
| Ishtar | ishtar | Ishtar | ✅ Match |
| Delver | researcher | Researcher | ⚠️ **MISMATCH** |
| Squire | butler | Butler | ⚠️ **MISMATCH** |
| Felicity | coder | Felicity | ✅ Match |
| Prometheus | prometheus | Prometheus | ✅ Match |
| Cisco | cisco | Cisco | ✅ Match |
| THEMIS | themis | THEMIS | ✅ Match |
| Nexus | qwen-nvidia | Nexus | ✅ Match |

**Issue:** 3 agents have different names in config vs documentation:
- **Sterling** → Config says "Finance"
- **Delver** → Config says "Researcher"  
- **Squire** → Config says "Butler"

---

### 2. Model Configuration Issues

#### Ishtar 🔴
- **Primary:** `openai-codex/gpt-5.1-codex-mini` ❌ (Model may not exist)
- **Fallbacks:** qwen_nvidia, GLM-5 ✅
- **Issue:** Primary model is untested/unknown
- **Impact:** Will fail first attempt, fallback to NVIDIA/GLM-5
- **Fix:** Change primary to GLM-5 or NVIDIA Qwen

#### Felicity (Coder) ⚠️
- **Primary:** `qwen-portal/coder-model` ❓ (Needs OAuth)
- **Fallbacks:** Gemini ✅
- **Issue:** OAuth may not be active
- **Impact:** May fail if OAuth expired
- **Fix:** Test qwen-portal authentication

#### THEMIS ⚠️
- **Primary:** GLM-5 ✅
- **Fallbacks:** OpenRouter free models 🔴 (404 errors)
- **Issue:** OpenRouter free tier is broken
- **Impact:** No fallback if GLM-5 fails
- **Fix:** Replace OpenRouter with Groq Llama

---

### 3. Missing Agent Features

| Agent | Voice Assigned | Heartbeat | Tools Profile | Gap |
|-------|---------------|-----------|---------------|-----|
| Athena | ✅ Sonia | 30m | Full | None |
| Sterling | ✅ Thomas | 30m | Full | ⚠️ Named "Finance" in config |
| Ishtar | ✅ Ezinne | 1h | Full | Primary model unknown |
| Delver/Researcher | ❌ None | 30m | Full | No voice, wrong name |
| Squire/Butler | ❌ None | 30m | Minimal | No voice, wrong name |
| Felicity | ❌ None | 30m | Coding | No voice, OAuth issue |
| Prometheus | ❌ None | 30m | Full | No voice |
| Cisco | ❌ None | 30m | Full | No voice |
| THEMIS | ✅ Maisie | 30m | Full | Fallback broken |
| Nexus | ❌ None | 30m | Full | No voice |

**Total agents missing voices:** 6 (Delver, Squire, Felicity, Prometheus, Cisco, Nexus)

---

### 4. Channel Binding Issues

| Channel | Bound Agent | Expected | Status |
|---------|-------------|----------|--------|
| WhatsApp | ishtar | Ishtar | ✅ Correct |
| Telegram | main | Athena | ✅ Correct (default) |

**Issue:** WhatsApp is correctly bound to Ishtar, but Ishtar's model config is problematic.

---

### 5. Subagent Delegation Matrix

| Agent | Can Spawn Subagents | Allowed Agents |
|-------|---------------------|----------------|
| Athena (main) | ✅ Yes | All except self |
| Ishtar | ✅ Yes | All except self |
| Others | ❓ Not specified | N/A |

**Gap:** Most agents don't have subagent delegation configured. Only main and ishtar have it.

---

## 📋 RECOMMENDED FIXES

### Immediate (Critical)

1. **Fix Ishtar's Primary Model**
   ```json
   "ishtar": {
     "model": {
       "primary": "GLM5",  // Change from openai-codex/gpt-5.1-codex-mini
       "fallbacks": ["qwen_nvidia"]
     }
   }
   ```

2. **Fix THEMIS Fallback Chain**
   ```json
   "themis": {
     "model": {
       "primary": "GLM5",
       "fallbacks": ["llama", "qwen_nvidia"]  // Remove broken OpenRouter
     }
   }
   ```

3. **Update Agent Names in Config**
   ```json
   "finance": { "name": "Sterling", ... }  // Already done
   "researcher": { "name": "Delver", ... }
   "butler": { "name": "Squire", ... }
   ```

### Short-term

4. **Assign Missing Voices**
   - Delver: Thomas (en-GB-ThomasNeural)
   - Squire: Ryan (en-US-RyanNeural)
   - Felicity: Jenny (en-US-JennyNeural)
   - Prometheus: Guy (en-US-GuyNeural)
   - Cisco: Brandon (en-US-BrandonNeural)
   - Nexus: Christopher (en-US-ChristopherNeural)

5. **Test qwen-portal OAuth**
   - Run: `openclaw auth status qwen-portal`
   - If expired, re-authenticate

6. **Add Subagent Delegation**
   - Allow Sterling to spawn researchers for market analysis
   - Allow THEMIS to spawn multiple agents for council votes

### Long-term

7. **Add Model Health Monitoring**
   - Create cron job to test each model every hour
   - Update MODEL-STATUS.md automatically

8. **Implement Auto-Failover**
   - Track model success rates
   - Automatically demote failing models

---

## 🎯 AGENT ROLE ALIGNMENT

| Agent | Role | Model Fit | Voice Fit | Config Fit |
|-------|------|-----------|-----------|------------|
| Athena | Orchestrator | ✅ GLM-5 | ✅ Sonia | ✅ |
| Sterling | Finance/Bidding | ✅ GLM-5 | ✅ Thomas | ⚠️ Named "Finance" |
| Ishtar | Oracle/PAI | ⚠️ Unknown primary | ✅ Ezinne | ⚠️ Model issue |
| Delver | Research | ✅ GLM-5 | ❌ No voice | ⚠️ Named "Researcher" |
| Squire | Operations | ✅ GLM-5 | ❌ No voice | ⚠️ Named "Butler" |
| Felicity | Coding | ⚠️ OAuth issue | ❌ No voice | ✅ |
| Prometheus | Execution | ✅ Groq Llama | ❌ No voice | ✅ |
| Cisco | Security | ✅ GLM-5 | ❌ No voice | ✅ |
| THEMIS | Council | ⚠️ Fallback broken | ✅ Maisie | ⚠️ Fallback issue |
| Nexus | Synthesis | ✅ GLM-5 | ❌ No voice | ✅ |

---

## 📊 HEALTH SCORE

| Category | Score | Notes |
|----------|-------|-------|
| Model Availability | 7/10 | OpenRouter broken, Ishtar primary unknown |
| Agent Configuration | 8/10 | Minor naming issues |
| Voice Assignment | 4/10 | 6/10 agents missing voices |
| Fallback Chains | 6/10 | THEMIS and Ishtar have issues |
| Channel Binding | 10/10 | WhatsApp correctly bound to Ishtar |
| **Overall** | **7/10** | Good but needs polish |

---

## 🔄 NEXT STEPS

1. ✅ Create MODEL-STATUS.md (done)
2. ⏳ Fix Ishtar's primary model in config
3. ⏳ Fix THEMIS fallback chain
4. ⏳ Update agent names in config
5. ⏳ Assign missing voices
6. ⏳ Test qwen-portal OAuth
7. ⏳ Create model health monitoring cron

---

*Report generated by Athena System Audit*
*Run `athena agent-audit` to regenerate*

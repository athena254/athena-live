# API MAXIMIZATION REPORT - Phase 1
## Generated: Sunday, March 1st, 2026 — 7:53 PM (UTC)

---

## LIVE API ALLOCATION TABLE

| Provider | API Key (masked) | Model(s) | Context | Max Tokens | Cost | Status |
|----------|------------------|----------|---------|------------|------|--------|
| **minimax-portal** | oauth | M2.1, M2.5 | 200K | 8192 | $0 | ✅ ACTIVE |
| **custom-api-us-west-2-modal-direct** | modal*** | GLM-5-FP8 | 32K | 8192 | $0 | ✅ ACTIVE |
| **custom-integrate-api-nvidia-com** | nvapi*** | Qwen 3.5 397B | 128K | 8192 | $0 | ✅ ACTIVE |
| **custom-api-groq-com** | gsk*** | Llama 3.3 70B | 128K | 8192 | $0 | ✅ ACTIVE |
| **qwen-portal** | oauth | Coder, Vision | 128K | 8192 | $0 | ✅ ACTIVE |
| **google** | AIzaSy*** | Gemini 2.5 Flash Lite | 1M | 8192 | $0 | ✅ ACTIVE |
| **openrouter** | sk-or-v1-*** | Llama, Gemma, Mistral, Qwen, DeepSeek R1 | 32K-128K | 2K-8K | FREE | ✅ ACTIVE |
| **Tavily** | tvly-dev-*** | Search API | - | - | DEV | ✅ ACTIVE |

---

## API HEADROOM ANALYSIS

### Unused/Low-Utilized APIs:
1. **OpenRouter Free Tier** - 5 free models available (Llama, Gemma, Mistral, Qwen, DeepSeek R1) - MINIMAL USAGE
2. **Google Gemini 2.5 Flash Lite** - 1M context window - UNDERUTILIZED
3. **Qwen Portal** (OAuth) - Both coder and vision models - LOW USAGE

### Active APIs:
- **MiniMax M2.5** - Primary model (current default)
- **NVIDIA Qwen** - Secondary high-capacity
- **Groq Llama** - Fast inference备用

---

## PHASE 1 COMPLETE ✅

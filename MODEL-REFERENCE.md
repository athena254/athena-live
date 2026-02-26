
---

## Groq API (Free Whisper + LLMs)

**API Key:** `~/.config/groq/credentials.json`

### Whisper (Speech-to-Text)
| Model | Speed | Accuracy | Use Case |
|-------|-------|----------|----------|
| `whisper-large-v3-turbo` | Fast | Good | Real-time transcription |
| `whisper-large-v3` | Medium | Best | Final transcripts |

### LLMs Available
| Model | Use Case |
|-------|----------|
| `llama-3.3-70b-versatile` | General chat (already using) |
| `llama-3.1-8b-instant` | Fast, simple tasks |
| `qwen/qwen3-32b` | Code, reasoning |
| `meta-llama/llama-4-maverick-17b-128e-instruct` | Latest Llama 4 |
| `moonshotai/kimi-k2-instruct` | Long context |

### Endpoint
```
Base: https://api.groq.com/openai/v1
Chat: /chat/completions
Audio: /audio/transcriptions
```

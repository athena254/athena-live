# Whisper-Groq Skill

Free speech-to-text using Groq's OpenAI-compatible Whisper API.

## Setup

API key stored at: `~/.config/groq/credentials.json`

## Usage

### Transcribe Audio File

```bash
# Using curl directly
curl https://api.groq.com/openai/v1/audio/transcriptions \
  -H "Authorization: Bearer $(cat ~/.config/groq/credentials.json | jq -r '.api_key')" \
  -H "Content-Type: multipart/form-data" \
  -F file="@audio.mp3" \
  -F model="whisper-large-v3-turbo"
```

### Available Models

- `whisper-large-v3` - Highest accuracy
- `whisper-large-v3-turbo` - Faster, slightly less accurate

### Supported Formats

mp3, mp4, mpeg, mpga, m4a, wav, webm

### Max File Size

25MB

## Rate Limits

- Free tier: Generous limits
- Check status: `curl -s https://api.groq.com/openai/v1/models -H "Authorization: Bearer $KEY"`

## Integration

To use in agents:
1. Load key from `~/.config/groq/credentials.json`
2. POST to `https://api.groq.com/openai/v1/audio/transcriptions`
3. Use `whisper-large-v3-turbo` for speed, `whisper-large-v3` for accuracy

# KittenTTS Skill

High-quality TTS using KittenTTS (15M params, CPU-optimized).

## Usage

```python
from kittentts import KittenTTS
m = KittenTTS("KittenML/kitten-tts-nano-0.8")
audio = m.generate("Hello world", voice='Jasper')
```

## Available Voices

| Voice | Description |
|-------|-------------|
| Bella | Female, warm |
| Jasper | Male, clear |
| Luna | Female, gentle |
| Bruno | Male, deep |
| Rosie | Female, energetic |
| Hugo | Male, professional |
| Kiki | Female, playful |
| Leo | Male, friendly |

## Models

| Model | Size | Quality |
|-------|------|---------|
| kitten-tts-nano-0.8 | 56MB | Good |
| kitten-tts-micro-0.8 | 41MB | Better |
| kitten-tts-mini-0.8 | 80MB | Best |

## Installation

```bash
source /opt/piper-venv/bin/activate
pip install https://github.com/KittenML/KittenTTS/releases/download/0.8.1/kittentts-0.8.1-py3-none-any.whl
```

## Integration

To use in a skill:
1. Load model once (cache it)
2. Generate audio with selected voice
3. Save as WAV or convert to MP3/OGG for messaging

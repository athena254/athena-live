# Voice Commands Research - Deep Dive

**Research Topic:** Voice-activated dashboard control for Athena  
**Started:** 2026-03-01T04:02:00Z  
**Agent:** Ishtar  
**Status:** In Progress

---

## Executive Summary

This research explores implementing voice command functionality for the Athena multi-agent dashboard. Voice commands would enable hands-free control of agent status monitoring, bidding operations, and dashboard navigation.

---

## Technology Stack Analysis

### 1. Web Speech API (Native Browser API)

**Pros:**
- No external dependencies
- Supported in Chrome, Edge, Safari 14.1+
- Real-time speech recognition
- Continuous listening mode available
- Interim results support
- Language support: 60+ languages

**Cons:**
- Not supported in Firefox (as of 2024)
- Requires HTTPS or localhost
- Requires user permission
- Accuracy varies by browser implementation
- Network-dependent (speech processed in cloud for most browsers)

**Key Properties:**
```javascript
const recognition = new SpeechRecognition();
recognition.continuous = true;      // Keep listening
recognition.interimResults = true;  // Show partial results
recognition.lang = 'en-US';         // Language
recognition.maxAlternatives = 3;    // Get multiple guesses
```

### 2. React Speech Recognition (Hook-based wrapper)

**Pros:**
- React-friendly hooks API
- Handles browser compatibility
- Transcripts managed in state
- Easy command registration
- TypeScript support

**Cons:**
- Depends on Web Speech API (same browser limitations)
- Additional bundle size (~5KB)
- May need polyfills for older browsers

**Installation:**
```bash
npm install react-speech-recognition
```

**Basic Usage:**
```tsx
import { useSpeechRecognition } from 'react-speech-recognition';

const MyComponent = () => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }
  
  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={() => SpeechRecognition.startListening({ continuous: true })}>Start</button>
      <button onClick={SpeechRecognition.stopListening}>Stop</button>
      <button onClick={resetTranscript}>Reset</button>
      <p>{transcript}</p>
    </div>
  );
};
```

### 3. annyang.js (Lightweight command library)

**Pros:**
- Simple command syntax with pattern matching
- Named parameters in commands
- No dependencies
- Small footprint (~3KB)

**Cons:**
- Not React-native (vanilla JS focused)
- Less maintained recently
- No TypeScript support built-in

**Command Syntax:**
```javascript
const commands = {
  'hello': () => alert('Hello world!'),
  'change color to :color': (color) => changeColor(color),
  'navigate to :page': (page) => navigate(page),
  '(show) (me) the dashboard': () => showDashboard()
};

annyang.addCommands(commands);
annyang.start();
```

---

## Voice Command Design for Athena Dashboard

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Voice Command System                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ SpeechEngine │───▶│ CommandParser│───▶│ ActionRouter │   │
│  │   (Hook)     │    │              │    │              │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Transcript   │    │ Command      │    │ Dashboard    │   │
│  │ State        │    │ Registry     │    │ Actions      │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Command Vocabulary Design

#### Global Navigation Commands
| Voice Command | Action | Context |
|--------------|--------|---------|
| "Go to dashboard" | Navigate to main dashboard | Any page |
| "Show agents" | Navigate to agents view | Any page |
| "Open settings" | Navigate to settings | Any page |
| "Go back" | Navigate to previous page | Any page |
| "Home" | Navigate to home | Any page |

#### Agent Control Commands
| Voice Command | Action | Context |
|--------------|--------|---------|
| "Show [agent name]" | Navigate to agent detail | Dashboard |
| "What's [agent] status?" | Read agent status aloud | Dashboard |
| "Pause [agent name]" | Pause agent | Agent page |
| "Resume [agent name]" | Resume agent | Agent page |
| "List all agents" | Read agent list aloud | Any |

#### Sterling Finance Commands
| Voice Command | Action | Context |
|--------------|--------|---------|
| "Show pending bids" | Filter bids to pending | Sterling page |
| "What's the honey potential?" | Read total honey aloud | Sterling page |
| "How many bids today?" | Read bid count | Sterling page |
| "Show win rate" | Display win rate chart | Sterling page |
| "Pause bidding" | Pause auto-bidding | Sterling page |

#### System Commands
| Voice Command | Action | Context |
|--------------|--------|---------|
| "Refresh" | Refresh current data | Any page |
| "Stop listening" | Turn off voice commands | Any |
| "What can I say?" | Show command help | Any |
| "Repeat that" | Repeat last response | Any |

### Command Priority System

```typescript
interface VoiceCommand {
  patterns: string[];           // Match patterns
  action: () => void;           // Handler function
  context?: 'any' | 'dashboard' | 'agent' | 'sterling';  // Where it works
  priority: 'high' | 'medium' | 'low';  // Match priority
  feedback?: string;            // TTS response
}
```

---

## Implementation Artifacts

### 1. useVoiceCommands Hook

```typescript
// hooks/useVoiceCommands.ts
import { useCallback, useEffect, useState } from 'react';
import { useSpeechRecognition } from 'react-speech-recognition';

interface Command {
  patterns: RegExp[];
  action: () => void;
  feedback?: string;
}

export function useVoiceCommands(commands: Command[]) {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  useEffect(() => {
    if (!transcript) return;
    
    const normalized = transcript.toLowerCase().trim();
    
    for (const cmd of commands) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(normalized)) {
          cmd.action();
          setLastCommand(normalized);
          if (cmd.feedback) {
            speak(cmd.feedback);
          }
          resetTranscript();
          return;
        }
      }
    }
  }, [transcript, commands, resetTranscript]);

  const startListening = useCallback(() => {
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [browserSupportsSpeechRecognition]);

  const stopListening = useCallback(() => {
    SpeechRecognition.stopListening();
  }, []);

  return {
    transcript,
    listening,
    lastCommand,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  };
}
```

### 2. Command Registry

```typescript
// voice/commandRegistry.ts
export const globalCommands = [
  {
    patterns: [/^(go to |open )?dashboard$/i, /^show (me )?home$/i],
    action: () => navigate('/dashboard'),
    feedback: 'Opening dashboard'
  },
  {
    patterns: [/^(show |list )?all agents$/i],
    action: () => readAgentsList(),
    feedback: null // Custom speech handled by action
  },
  {
    patterns: [/^what can (i |you )?say$/i, /^help$/i, /^commands$/i],
    action: () => showCommandHelp(),
    feedback: 'Showing available commands'
  }
];

export const sterlingCommands = [
  {
    patterns: [/^(show |what('s| is) )?(the )?honey( potential)?$/i],
    action: () => readHoneyPotential(),
    feedback: null
  },
  {
    patterns: [/^(how many )?bids (today|this week)$/i],
    action: () => readBidCount(),
    feedback: null
  },
  {
    patterns: [/^pause (auto )?bidding$/i],
    action: () => toggleBidding(false),
    feedback: 'Auto-bidding paused'
  },
  {
    patterns: [/^resume (auto )?bidding$/i],
    action: () => toggleBidding(true),
    feedback: 'Auto-bidding resumed'
  }
];
```

### 3. Voice UI Component

```tsx
// components/VoiceCommandIndicator.tsx
import { useState } from 'react';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { globalCommands } from '../voice/commandRegistry';

export function VoiceCommandIndicator() {
  const [showTranscript, setShowTranscript] = useState(false);
  
  const {
    transcript,
    listening,
    startListening,
    stopListening,
    browserSupportsSpeechRecognition
  } = useVoiceCommands(globalCommands);

  if (!browserSupportsSpeechRecognition) {
    return null; // Or show a "not supported" badge
  }

  return (
    <div className="voice-indicator">
      <button
        onClick={() => listening ? stopListening() : startListening()}
        className={`voice-btn ${listening ? 'active' : ''}`}
        title={listening ? 'Stop listening' : 'Start voice commands'}
      >
        🎤 {listening && <span className="pulse" />}
      </button>
      
      {listening && transcript && (
        <div className="transcript-bubble">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
```

---

## Browser Support Matrix

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 33+ | ✅ Full | Best accuracy, cloud-based |
| Edge 79+ | ✅ Full | Chromium-based, same as Chrome |
| Safari 14.1+ | ✅ Partial | On-device processing, may need fallback |
| Firefox | ❌ None | No Web Speech API support |
| Opera | ✅ Full | Chromium-based |
| Mobile Chrome | ✅ Full | Works well on Android |
| Mobile Safari | ✅ Partial | iOS 14.5+ |

### Fallback Strategy

```typescript
// Detect support and provide fallback UI
function VoiceCommandWrapper() {
  const { browserSupportsSpeechRecognition } = useVoiceCommands([]);
  
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="voice-fallback">
        <span title="Voice commands not supported in this browser">
          🎤❌
        </span>
      </div>
    );
  }
  
  return <VoiceCommandIndicator />;
}
```

---

## Accessibility Considerations

1. **Visual Feedback:** Always show visual indication when listening
2. **Audio Feedback:** TTS confirmation of actions (optional, configurable)
3. **Command Discovery:** "What can I say?" command shows all available commands
4. **Error Handling:** Clear error messages for unrecognized commands
5. **Timeout:** Auto-stop listening after configurable silence period

---

## Performance Considerations

1. **Memory:** SpeechRecognition object should be single instance
2. **Battery:** Continuous listening drains battery on mobile
3. **Network:** Chrome sends audio to cloud - consider for sensitive data
4. **Processing:** Interim results can cause rapid re-renders - debounce

---

## Security & Privacy

1. **Permission Required:** Microphone access requires explicit user permission
2. **HTTPS Only:** Speech recognition requires secure context
3. **Cloud Processing:** Chrome processes speech in Google cloud
4. **Local Alternative:** Safari processes on-device (more private)
5. **Data Handling:** Never send sensitive data via voice commands

---

## Recommended Implementation Path

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create `useVoiceCommands` hook
- [ ] Implement basic command parsing
- [ ] Add visual indicator component
- [ ] Test across browsers

### Phase 2: Dashboard Integration (Week 2)
- [ ] Integrate with React Dashboard
- [ ] Add global navigation commands
- [ ] Add basic agent status commands
- [ ] Implement "What can I say?" help

### Phase 3: Agent-Specific Commands (Week 3)
- [ ] Sterling finance commands
- [ ] Felicity dashboard builder commands
- [ ] Agent control commands (pause/resume)
- [ ] Status query commands

### Phase 4: Polish & Testing (Week 4)
- [ ] Add TTS feedback system
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Documentation

---

## Research Conclusions

1. **Technology Choice:** React Speech Recognition + native Web Speech API is the best choice for Athena
2. **Browser Coverage:** Chrome/Edge/Safari cover 85%+ of users; Firefox needs graceful fallback
3. **Command Design:** Natural language patterns with wildcards for flexibility
4. **UX Considerations:** Visual feedback essential; TTS feedback optional but recommended
5. **Security:** Permission-based with clear privacy implications

---

## Files to Create

| File | Purpose |
|------|---------|
| `dashboard/src/hooks/useVoiceCommands.ts` | Main voice command hook |
| `dashboard/src/voice/commandRegistry.ts` | Command definitions |
| `dashboard/src/voice/commandParser.ts` | Pattern matching logic |
| `dashboard/src/components/VoiceIndicator.tsx` | UI component |
| `dashboard/src/components/VoiceHelp.tsx` | Command help modal |
| `dashboard/src/utils/speechSynthesis.ts` | TTS utilities |

---

*Research completed by Ishtar - 2026-03-01*

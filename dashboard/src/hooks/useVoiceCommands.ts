/**
 * useVoiceCommands - Custom hook for voice command recognition
 * 
 * Provides speech recognition capabilities with command pattern matching
 * for the Athena multi-agent dashboard.
 * 
 * @module useVoiceCommands
 * @author Ishtar (Research Agent)
 * @created 2026-03-01
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Types
export interface VoiceCommand {
  /** Regex patterns to match against transcript */
  patterns: RegExp[];
  /** Action to execute when matched */
  action: () => void;
  /** Optional TTS feedback message */
  feedback?: string;
  /** Context where command is available */
  context?: 'any' | 'dashboard' | 'agent' | 'sterling' | 'felicity';
  /** Priority for matching (higher = checked first) */
  priority?: 'high' | 'medium' | 'low';
  /** Description for help display */
  description?: string;
}

export interface VoiceCommandsOptions {
  /** Auto-start listening on mount */
  autoStart?: boolean;
  /** Silence timeout in ms before stopping */
  silenceTimeout?: number;
  /** Enable interim results */
  interimResults?: boolean;
  /** Language for recognition */
  language?: string;
}

export interface VoiceCommandsResult {
  /** Current transcript */
  transcript: string;
  /** Whether currently listening */
  listening: boolean;
  /** Whether browser supports speech recognition */
  browserSupportsSpeechRecognition: boolean;
  /** Last matched command */
  lastMatchedCommand: string | null;
  /** Start listening */
  startListening: () => void;
  /** Stop listening */
  stopListening: () => void;
  /** Toggle listening state */
  toggleListening: () => void;
  /** Reset transcript */
  resetTranscript: () => void;
  /** Error message if any */
  error: string | null;
  /** Whether voice is supported */
  isSupported: boolean;
}

// Speech synthesis utilities
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

/**
 * Speak text using TTS
 */
export function speak(text: string, options?: { rate?: number; pitch?: number; lang?: string }) {
  if (!synth) return;
  
  // Cancel any ongoing speech
  synth.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options?.rate ?? 1;
  utterance.pitch = options?.pitch ?? 1;
  utterance.lang = options?.lang ?? 'en-US';
  
  synth.speak(utterance);
}

/**
 * Custom hook for voice command recognition
 */
export function useVoiceCommands(
  commands: VoiceCommand[],
  options: VoiceCommandsOptions = {}
): VoiceCommandsResult {
  const {
    autoStart = false,
    silenceTimeout = 5000,
    interimResults = true,
    language = 'en-US'
  } = options;

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = 
    useSpeechRecognition();
  
  const [lastMatchedCommand, setLastMatchedCommand] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processedTranscriptRef = useRef<string>('');

  // Sort commands by priority for matching
  const sortedCommands = [...commands].sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority ?? 'medium'] ?? 2) - (priorityOrder[a.priority ?? 'medium'] ?? 2);
  });

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Set silence timer
  const setSilenceTimer = useCallback(() => {
    if (silenceTimeout > 0 && listening) {
      clearSilenceTimer();
      silenceTimerRef.current = setTimeout(() => {
        SpeechRecognition.stopListening();
      }, silenceTimeout);
    }
  }, [silenceTimeout, listening, clearSilenceTimer]);

  // Start listening
  const startListening = useCallback(() => {
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    setError(null);
    SpeechRecognition.startListening({
      continuous: true,
      interimResults,
      language
    });
  }, [browserSupportsSpeechRecognition, interimResults, language]);

  // Stop listening
  const stopListening = useCallback(() => {
    clearSilenceTimer();
    SpeechRecognition.stopListening();
  }, [clearSilenceTimer]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  }, [listening, startListening, stopListening]);

  // Process transcript and match commands
  useEffect(() => {
    if (!transcript || transcript === processedTranscriptRef.current) return;

    // Update silence timer on new speech
    setSilenceTimer();

    const normalized = transcript.toLowerCase().trim();
    processedTranscriptRef.current = transcript;

    // Try to match commands
    for (const cmd of sortedCommands) {
      for (const pattern of cmd.patterns) {
        if (pattern.test(normalized)) {
          console.log('[VoiceCommands] Matched:', normalized, 'Pattern:', pattern);
          
          try {
            cmd.action();
            setLastMatchedCommand(normalized);
            
            // Provide audio feedback if specified
            if (cmd.feedback) {
              speak(cmd.feedback);
            }
          } catch (err) {
            console.error('[VoiceCommands] Command execution error:', err);
            setError(`Command failed: ${normalized}`);
          }
          
          // Reset transcript after processing
          resetTranscript();
          processedTranscriptRef.current = '';
          return;
        }
      }
    }

    // If no match and transcript is long enough, it might be unrecognized
    // (Keep listening but don't show error for interim results)
    if (!interimResults && normalized.length > 3) {
      console.log('[VoiceCommands] No match for:', normalized);
    }
  }, [transcript, sortedCommands, resetTranscript, setSilenceTimer, interimResults]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && browserSupportsSpeechRecognition) {
      startListening();
    }
    
    return () => {
      clearSilenceTimer();
    };
  }, [autoStart, browserSupportsSpeechRecognition, startListening, clearSilenceTimer]);

  return {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
    lastMatchedCommand,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    error,
    isSupported: browserSupportsSpeechRecognition
  };
}

// Pre-defined common command patterns
export const commandPatterns = {
  navigate: {
    dashboard: [/^(go to |open )?dashboard$/i, /^show (me )?home$/i, /^home$/i],
    agents: [/^(go to |open |show )?agents$/i, /^show (me )?all agents$/i],
    settings: [/^(open |go to )?settings$/i, /^preferences$/i],
    back: [/^go back$/i, /^back$/i]
  },
  action: {
    refresh: [/^refresh$/i, /^reload$/i],
    pause: [/^pause$/i, /^stop$/i],
    resume: [/^resume$/i, /^continue$/i, /^start$/i],
    help: [/^(what can (i |you )?say|help|commands)$/i]
  },
  query: {
    status: [/^what('s| is) (the )?status$/i, /^status report$/i],
    count: [/^how many \w+$/i, /^count \w+$/i]
  }
};

export default useVoiceCommands;

/**
 * Speech Synthesis Utilities
 * 
 * Text-to-speech functions for voice feedback
 * in the Athena dashboard.
 * 
 * @module speechSynthesis
 * @author Ishtar (Research Agent)
 * @created 2026-03-01
 */

// Types
interface SpeakOptions {
  rate?: number;      // Speech rate (0.1 to 10)
  pitch?: number;     // Pitch (0 to 2)
  volume?: number;    // Volume (0 to 1)
  lang?: string;      // Language code
  voice?: SpeechSynthesisVoice;  // Specific voice
  onEnd?: () => void; // Callback when speech ends
  onStart?: () => void; // Callback when speech starts
  onError?: (error: Error) => void; // Callback on error
}

// Voice cache
let cachedVoices: SpeechSynthesisVoice[] = [];

/**
 * Initialize voice cache (call once on app startup)
 */
export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    
    if (!synth) {
      console.warn('[TTS] Speech synthesis not supported');
      resolve([]);
      return;
    }

    // Voices load asynchronously
    const loadVoices = () => {
      cachedVoices = synth.getVoices();
      resolve(cachedVoices);
    };

    // Chrome requires waiting for voiceschanged event
    if (synth.getVoices().length > 0) {
      loadVoices();
    } else {
      synth.addEventListener('voiceschanged', loadVoices, { once: true });
    }
  });
}

/**
 * Get available voices
 */
export function getVoices(): SpeechSynthesisVoice[] {
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis?.getVoices() || [];
  }
  return cachedVoices;
}

/**
 * Get preferred voice for a language
 */
export function getPreferredVoice(lang = 'en-US'): SpeechSynthesisVoice | null {
  const voices = getVoices();
  
  // Prefer voices in order:
  // 1. Exact language match
  // 2. Same language prefix (en, en-GB, etc.)
  // 3. Google voices (usually high quality)
  // 4. Any available voice
  
  const exactMatch = voices.find(v => v.lang === lang);
  if (exactMatch) return exactMatch;

  const langPrefix = lang.split('-')[0];
  const prefixMatch = voices.find(v => v.lang.startsWith(langPrefix));
  if (prefixMatch) return prefixMatch;

  const googleVoice = voices.find(v => 
    v.name.toLowerCase().includes('google') && 
    v.lang.startsWith(langPrefix)
  );
  if (googleVoice) return googleVoice;

  return voices.find(v => v.lang.startsWith(langPrefix)) || null;
}

/**
 * Speak text using TTS
 */
export function speak(
  text: string,
  options: SpeakOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = window.speechSynthesis;

    if (!synth) {
      console.warn('[TTS] Speech synthesis not supported');
      resolve();
      return;
    }

    // Cancel any ongoing speech
    synth.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply options
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    utterance.lang = options.lang ?? 'en-US';

    // Use specific voice or get preferred
    if (options.voice) {
      utterance.voice = options.voice;
    } else {
      const preferredVoice = getPreferredVoice(utterance.lang);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Event handlers
    utterance.onend = () => {
      options.onEnd?.();
      resolve();
    };

    utterance.onstart = () => {
      options.onStart?.();
    };

    utterance.onerror = (event) => {
      const error = new Error(`Speech synthesis error: ${event.error}`);
      options.onError?.(error);
      reject(error);
    };

    // Speak
    synth.speak(utterance);
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  return window.speechSynthesis?.speaking ?? false;
}

/**
 * Speak with queue (multiple texts in sequence)
 */
export async function speakQueue(
  texts: string[],
  options: SpeakOptions = {}
): Promise<void> {
  for (const text of texts) {
    await speak(text, options);
  }
}

/**
 * Format number for speech
 */
export function formatNumberForSpeech(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)} million`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} thousand`;
  }
  return num.toString();
}

/**
 * Format currency for speech
 */
export function formatCurrencyForSpeech(amount: number, currency = '$'): string {
  const formatted = formatNumberForSpeech(amount);
  return `${formatted} ${currency === '$' ? 'dollars' : currency}`;
}

/**
 * Format percentage for speech
 */
export function formatPercentForSpeech(percent: number): string {
  return `${percent.toFixed(1)} percent`;
}

// Default export
const speechSynthesis = {
  initVoices,
  getVoices,
  getPreferredVoice,
  speak,
  stopSpeaking,
  isSpeaking,
  speakQueue,
  formatNumberForSpeech,
  formatCurrencyForSpeech,
  formatPercentForSpeech
};

export default speechSynthesis;

/**
 * VoiceIndicator - Voice command UI component
 * 
 * Displays microphone button and transcript feedback
 * for voice command system.
 * 
 * @module VoiceIndicator
 * @author Ishtar (Research Agent)
 * @created 2026-03-01
 */

import React, { useState, useEffect } from 'react';
import { useVoiceCommands, VoiceCommand } from '../hooks/useVoiceCommands';
import { globalCommands, getCommandsForContext, getCommandDescriptions } from '../voice/commandRegistry';
import VoiceHelp from './VoiceHelp';

// Styles (using inline styles for simplicity - can be moved to CSS)
const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  button: {
    background: 'transparent',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  buttonActive: {
    borderColor: '#10B981',
    background: 'rgba(16, 185, 129, 0.1)'
  },
  pulseRing: {
    position: 'absolute',
    inset: '0',
    borderRadius: '50%',
    animation: 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
    background: 'rgba(16, 185, 129, 0.3)'
  },
  transcript: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px',
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    minWidth: '200px',
    maxWidth: '300px',
    color: '#F8FAFC',
    fontSize: '14px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    zIndex: 100
  },
  transcriptText: {
    opacity: 0.9
  },
  transcriptHint: {
    fontSize: '11px',
    opacity: 0.5,
    marginTop: '4px'
  },
  error: {
    color: '#EF4444',
    fontSize: '12px',
    marginTop: '4px'
  },
  tooltip: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '4px',
    background: 'rgba(30, 41, 59, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '4px 8px',
    fontSize: '11px',
    color: '#94A3B8',
    whiteSpace: 'nowrap',
    zIndex: 100
  }
};

// Inject pulse animation CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes pulse-ring {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
`;
document.head.appendChild(styleSheet);

interface VoiceIndicatorProps {
  /** Current context for context-aware commands */
  context?: 'dashboard' | 'agent' | 'sterling' | 'felicity';
  /** Additional commands to register */
  commands?: VoiceCommand[];
  /** Custom styles */
  className?: string;
  /** Show transcript popup */
  showTranscript?: boolean;
  /** Auto-start listening */
  autoStart?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceIndicator({
  context,
  commands = [],
  className,
  showTranscript = true,
  autoStart = false,
  size = 'md'
}: VoiceIndicatorProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Get commands for current context
  const contextCommands = context ? getCommandsForContext(context) : globalCommands;
  const allCommands = [...contextCommands, ...commands];

  const {
    transcript,
    listening,
    startListening,
    stopListening,
    toggleListening,
    browserSupportsSpeechRecognition,
    error,
    isSupported
  } = useVoiceCommands(allCommands, {
    autoStart,
    silenceTimeout: 8000
  });

  // Keyboard shortcut to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + V to toggle voice commands
      if (e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleListening();
      }
      // Escape to stop listening
      if (e.key === 'Escape' && listening) {
        stopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening, stopListening, listening]);

  // Show help when asked
  useEffect(() => {
    if (transcript.toLowerCase().includes('help') || 
        transcript.toLowerCase().includes('what can i say')) {
      setShowHelp(true);
    }
  }, [transcript]);

  // Don't render if not supported
  if (!isSupported) {
    return (
      <div style={styles.container} className={className}>
        <div 
          style={styles.button}
          title="Voice commands not supported in this browser"
        >
          🎤
          <span style={{ opacity: 0.3 }}>❌</span>
        </div>
      </div>
    );
  }

  const sizeStyles = {
    sm: { width: '36px', height: '36px', fontSize: '16px' },
    md: { width: '44px', height: '44px', fontSize: '20px' },
    lg: { width: '52px', height: '52px', fontSize: '24px' }
  };

  return (
    <div style={styles.container} className={className}>
      {/* Microphone Button */}
      <button
        onClick={toggleListening}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...styles.button,
          ...sizeStyles[size],
          ...(listening ? styles.buttonActive : {}),
          borderColor: listening ? '#10B981' : 'rgba(255, 255, 255, 0.3)'
        }}
        aria-label={listening ? 'Stop voice commands' : 'Start voice commands'}
        aria-pressed={listening}
      >
        {listening ? (
          <>
            {/* Pulse animation */}
            <span style={styles.pulseRing} />
            {/* Active mic */}
            <span style={{ position: 'relative', zIndex: 1 }}>🎤</span>
          </>
        ) : (
          <span style={{ opacity: 0.7 }}>🎤</span>
        )}
      </button>

      {/* Tooltip on hover */}
      {isHovered && !listening && (
        <div style={styles.tooltip}>
          Click to start • Alt+V
        </div>
      )}

      {/* Transcript Popup */}
      {listening && showTranscript && (
        <div style={styles.transcript}>
          {transcript ? (
            <>
              <div style={styles.transcriptText}>
                "{transcript}"
              </div>
              <div style={styles.transcriptHint}>
                Listening... (Esc to stop)
              </div>
            </>
          ) : (
            <div style={{ opacity: 0.6 }}>
              Listening for commands...
            </div>
          )}
          
          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <VoiceHelp
          commands={getCommandDescriptions(context)}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}

export default VoiceIndicator;

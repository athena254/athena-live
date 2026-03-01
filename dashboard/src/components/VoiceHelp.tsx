/**
 * VoiceHelp - Voice command help modal
 * 
 * Displays available voice commands organized by category
 * when user asks "What can I say?"
 * 
 * @module VoiceHelp
 * @author Ishtar (Research Agent)
 * @created 2026-03-01
 */

import React from 'react';

interface CommandInfo {
  patterns: string[];
  description: string;
}

interface VoiceHelpProps {
  /** Available commands to display */
  commands: CommandInfo[];
  /** Close callback */
  onClose: () => void;
  /** Custom title */
  title?: string;
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  },
  modal: {
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 600,
    color: '#F8FAFC',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#94A3B8',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  content: {
    padding: '24px',
    overflowY: 'auto' as const,
    flex: 1
  },
  section: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    color: '#94A3B8',
    marginBottom: '12px'
  },
  commandGrid: {
    display: 'grid',
    gap: '12px'
  },
  commandItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  patterns: {
    flex: 1
  },
  patternTag: {
    display: 'inline-block',
    background: 'rgba(99, 102, 241, 0.2)',
    color: '#A5B4FC',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginRight: '6px',
    marginBottom: '4px',
    fontFamily: 'monospace'
  },
  description: {
    color: '#94A3B8',
    fontSize: '12px',
    marginTop: '6px'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#64748B'
  },
  shortcut: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  kbd: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'monospace'
  },
  tip: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginTop: '16px',
    fontSize: '13px',
    color: '#A7F3D0'
  }
};

// Command categories for organization
const categorizeCommands = (commands: CommandInfo[]) => {
  const categories: Record<string, CommandInfo[]> = {
    Navigation: [],
    Actions: [],
    Queries: [],
    Agent: [],
    Finance: [],
    Other: []
  };

  commands.forEach(cmd => {
    const pattern = cmd.patterns[0]?.toLowerCase() || '';
    
    if (pattern.includes('go to') || pattern.includes('show') || pattern.includes('open') || pattern.includes('back')) {
      categories.Navigation.push(cmd);
    } else if (pattern.includes('pause') || pattern.includes('resume') || pattern.includes('start') || pattern.includes('stop')) {
      categories.Actions.push(cmd);
    } else if (pattern.includes('what') || pattern.includes('how') || pattern.includes('status') || pattern.includes('many')) {
      categories.Queries.push(cmd);
    } else if (pattern.includes('sterling') || pattern.includes('felicity') || pattern.includes('bids') || pattern.includes('honey')) {
      categories.Finance.push(cmd);
    } else if (pattern.includes('agent')) {
      categories.Agent.push(cmd);
    } else {
      categories.Other.push(cmd);
    }
  });

  return Object.entries(categories).filter(([_, cmds]) => cmds.length > 0);
};

export function VoiceHelp({ commands, onClose, title = 'Voice Commands' }: VoiceHelpProps) {
  const categories = categorizeCommands(commands);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            🎤 {title}
          </h2>
          <button 
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {categories.map(([category, cmds]) => (
            <div key={category} style={styles.section}>
              <h3 style={styles.sectionTitle}>
                {category}
              </h3>
              <div style={styles.commandGrid}>
                {cmds.map((cmd, idx) => (
                  <div key={idx} style={styles.commandItem}>
                    <div style={styles.patterns}>
                      {cmd.patterns.slice(0, 3).map((pattern, pIdx) => (
                        <span key={pIdx} style={styles.patternTag}>
                          {pattern}
                        </span>
                      ))}
                      {cmd.patterns.length > 3 && (
                        <span style={{ color: '#64748B', fontSize: '12px' }}>
                          +{cmd.patterns.length - 3} more
                        </span>
                      )}
                      <div style={styles.description}>
                        {cmd.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips */}
          <div style={styles.tip}>
            💡 <strong>Tip:</strong> Speak naturally! The system recognizes variations like "show agents" or "go to agents" as the same command.
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <div style={styles.shortcut}>
            <span>Toggle voice:</span>
            <kbd style={styles.kbd}>Alt</kbd>
            <span>+</span>
            <kbd style={styles.kbd}>V</kbd>
          </div>
          <div style={styles.shortcut}>
            <span>Stop listening:</span>
            <kbd style={styles.kbd}>Esc</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceHelp;

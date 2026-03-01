/**
 * Command Registry - Voice command definitions for Athena Dashboard
 * 
 * This file contains all voice commands organized by context.
 * Commands use regex patterns for flexible natural language matching.
 * 
 * @module commandRegistry
 * @author Ishtar (Research Agent)
 * @created 2026-03-01
 */

import { VoiceCommand, speak } from '../hooks/useVoiceCommands';

// Navigation function (to be connected to router)
declare const navigate: (path: string) => void;

// Placeholder functions - to be connected to actual state management
const showToast = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
  console.log(`[Toast ${type}] ${message}`);
};

const showCommandHelp = () => {
  console.log('[Voice] Showing command help');
};

// ============================================
// GLOBAL COMMANDS - Available everywhere
// ============================================

export const globalCommands: VoiceCommand[] = [
  // Navigation
  {
    patterns: [/^(go to |open )?dashboard$/i, /^show (me )?home$/i, /^home$/i],
    action: () => {
      navigate?.('/dashboard');
    },
    feedback: 'Opening dashboard',
    context: 'any',
    priority: 'high',
    description: 'Navigate to the main dashboard'
  },
  {
    patterns: [/^(go to |open |show )?agents$/i, /^show (me )?all agents$/i, /^list agents$/i],
    action: () => {
      navigate?.('/agents');
    },
    feedback: 'Showing all agents',
    context: 'any',
    priority: 'high',
    description: 'Navigate to agents list'
  },
  {
    patterns: [/^(open |go to )?settings$/i, /^preferences$/i],
    action: () => {
      navigate?.('/settings');
    },
    feedback: 'Opening settings',
    context: 'any',
    priority: 'high',
    description: 'Open settings page'
  },
  {
    patterns: [/^go back$/i, /^back$/i],
    action: () => {
      window.history.back();
    },
    feedback: 'Going back',
    context: 'any',
    priority: 'high',
    description: 'Navigate to previous page'
  },
  
  // System actions
  {
    patterns: [/^refresh$/i, /^reload$/i, /^refresh (the )?page$/i],
    action: () => {
      window.location.reload();
    },
    feedback: 'Refreshing',
    context: 'any',
    priority: 'medium',
    description: 'Refresh the current page'
  },
  {
    patterns: [/^(what can (i |you )?say|help|commands|show commands)$/i],
    action: () => {
      showCommandHelp();
    },
    feedback: 'Showing available commands',
    context: 'any',
    priority: 'high',
    description: 'Show available voice commands'
  },
  {
    patterns: [/^stop listening$/i, /^turn off voice$/i],
    action: () => {
      showToast('Voice commands disabled. Click the microphone to re-enable.', 'info');
    },
    feedback: 'Stopping voice commands',
    context: 'any',
    priority: 'high',
    description: 'Disable voice commands'
  }
];

// ============================================
// AGENT COMMANDS - For agent management
// ============================================

export const agentCommands: VoiceCommand[] = [
  // Agent status queries
  {
    patterns: [/^what('s| is) (the )?status$/i, /^status report$/i, /^how (are )?we doing$/i],
    action: () => {
      // Read all agents status
      const statusText = 'All agents are online and operational.';
      speak(statusText);
    },
    context: 'dashboard',
    priority: 'medium',
    description: 'Get status of all agents'
  },
  {
    patterns: [/^show (me )?(sterling|felicity|athena|ishtar|delver|squire|prometheus|cisco|themis)$/i],
    action: () => {
      const match = /^show (me )?(\w+)$/i.exec('show me sterling');
      if (match) {
        const agentName = match[2].toLowerCase();
        navigate?.(`/agents/${agentName}`);
      }
    },
    feedback: 'Showing agent details',
    context: 'any',
    priority: 'high',
    description: 'Navigate to specific agent'
  },
  {
    patterns: [/^what('s| is) (sterling|felicity|athena|ishtar|delver|squire|prometheus|cisco|themis) (status|doing)$/i],
    action: () => {
      // Query specific agent status
      const match = /^what('s| is) (\w+) (status|doing)$/i.exec('what is sterling status');
      if (match) {
        const agentName = match[2];
        // In real implementation, fetch actual status
        speak(`${agentName} is currently active and operational.`);
      }
    },
    context: 'any',
    priority: 'medium',
    description: 'Query specific agent status'
  },
  
  // Agent control
  {
    patterns: [/^pause (sterling|felicity|athena|ishtar|delver|squire|prometheus|cisco|themis)$/i],
    action: () => {
      const match = /^pause (\w+)$/i.exec('pause sterling');
      if (match) {
        const agentName = match[1];
        showToast(`Pausing ${agentName}...`, 'info');
      }
    },
    feedback: 'Agent paused',
    context: 'agent',
    priority: 'high',
    description: 'Pause specific agent'
  },
  {
    patterns: [/^resume (sterling|felicity|athena|ishtar|delver|squire|prometheus|cisco|themis)$/i],
    action: () => {
      const match = /^resume (\w+)$/i.exec('resume sterling');
      if (match) {
        const agentName = match[1];
        showToast(`Resuming ${agentName}...`, 'success');
      }
    },
    feedback: 'Agent resumed',
    context: 'agent',
    priority: 'high',
    description: 'Resume specific agent'
  }
];

// ============================================
// STERLING COMMANDS - Finance & bidding
// ============================================

export const sterlingCommands: VoiceCommand[] = [
  // Bidding status
  {
    patterns: [/^(what('s| is) )?(the )?honey( potential)?$/i, /^show honey$/i],
    action: () => {
      // Fetch honey potential from state
      const honeyPotential = 4400; // Placeholder
      speak(`Current honey potential is ${honeyPotential} pounds.`);
    },
    context: 'sterling',
    priority: 'high',
    description: 'Get total honey potential'
  },
  {
    patterns: [/^(how many )?bids (today|this week|this month)$/i],
    action: () => {
      const match = /^(how many )?bids (\w+(?:\s+\w+)?)$/i.exec('bids today');
      const period = match?.[3] ?? 'today';
      const count = 10; // Placeholder
      speak(`${count} bids ${period}.`);
    },
    context: 'sterling',
    priority: 'high',
    description: 'Get bid count for period'
  },
  {
    patterns: [/^(what('s| is) )?(the )?win rate$/i, /^show win rate$/i],
    action: () => {
      const winRate = 23; // Placeholder
      speak(`Current win rate is ${winRate} percent.`);
    },
    context: 'sterling',
    priority: 'medium',
    description: 'Get bidding win rate'
  },
  
  // Bidding control
  {
    patterns: [/^pause (auto )?bidding$/i, /^stop bidding$/i],
    action: () => {
      showToast('Auto-bidding paused', 'info');
    },
    feedback: 'Auto-bidding paused',
    context: 'sterling',
    priority: 'high',
    description: 'Pause auto-bidding'
  },
  {
    patterns: [/^resume (auto )?bidding$/i, /^start bidding$/i],
    action: () => {
      showToast('Auto-bidding resumed', 'success');
    },
    feedback: 'Auto-bidding resumed',
    context: 'sterling',
    priority: 'high',
    description: 'Resume auto-bidding'
  },
  
  // Bid management
  {
    patterns: [/^show pending bids$/i, /^pending bids$/i],
    action: () => {
      navigate?.('/sterling/bids?status=pending');
    },
    feedback: 'Showing pending bids',
    context: 'sterling',
    priority: 'medium',
    description: 'Show pending bids'
  },
  {
    patterns: [/^show (bid )?history$/i],
    action: () => {
      navigate?.('/sterling/history');
    },
    feedback: 'Showing bid history',
    context: 'sterling',
    priority: 'medium',
    description: 'Show bid history'
  }
];

// ============================================
// FELICITY COMMANDS - Code generation
// ============================================

export const felicityCommands: VoiceCommand[] = [
  // Code generation
  {
    patterns: [/^generate (a )?(react|vue|svelte) component$/i],
    action: () => {
      const match = /^generate (a )?(\w+) component$/i.exec('generate a react component');
      if (match) {
        const framework = match[2];
        showToast(`Ready to generate ${framework} component. Please provide the component specification.`, 'info');
      }
    },
    feedback: 'Ready for component specification',
    context: 'felicity',
    priority: 'medium',
    description: 'Start component generation'
  },
  {
    patterns: [/^create (a )?dashboard$/i],
    action: () => {
      showToast('Opening dashboard builder...', 'info');
    },
    feedback: 'Opening dashboard builder',
    context: 'felicity',
    priority: 'high',
    description: 'Start dashboard creation'
  },
  
  // File operations
  {
    patterns: [/^open file$/i, /^browse files$/i],
    action: () => {
      showToast('Opening file browser...', 'info');
    },
    feedback: 'Opening file browser',
    context: 'felicity',
    priority: 'medium',
    description: 'Open file browser'
  }
];

// ============================================
// ALL COMMANDS - Combined registry
// ============================================

export const allCommands: VoiceCommand[] = [
  ...globalCommands,
  ...agentCommands,
  ...sterlingCommands,
  ...felicityCommands
];

// Get commands for specific context
export function getCommandsForContext(context: string): VoiceCommand[] {
  return allCommands.filter(cmd => 
    cmd.context === 'any' || cmd.context === context
  );
}

// Get command descriptions for help
export function getCommandDescriptions(context?: string): Array<{ patterns: string[]; description: string }> {
  const commands = context ? getCommandsForContext(context) : allCommands;
  
  return commands
    .filter(cmd => cmd.description)
    .map(cmd => ({
      patterns: cmd.patterns.map(p => p.source.replace(/\^|\$|\\/g, '').replace(/\(.*?\)/g, '')),
      description: cmd.description!
    }));
}

export default allCommands;

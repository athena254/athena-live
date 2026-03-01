/**
 * Voice Commands Integration Example
 * 
 * This example shows how to integrate voice commands
 * into the Athena dashboard.
 * 
 * @module VoiceCommandsExample
 * @author Ishtar (Research Agent)
 * @created 2026-03-01
 */

import React from 'react';
import { VoiceIndicator } from '../components/VoiceIndicator';
import { initVoices } from '../utils/speechSynthesis';

/**
 * Example Dashboard with Voice Commands
 */
export function VoiceEnabledDashboard() {
  // Initialize TTS voices on mount
  React.useEffect(() => {
    initVoices();
  }, []);

  return (
    <div className="dashboard">
      {/* Header with Voice Indicator */}
      <header className="dashboard-header">
        <h1>Athena Dashboard</h1>
        <div className="header-actions">
          {/* Voice Command Button */}
          <VoiceIndicator 
            context="dashboard"
            showTranscript={true}
          />
          <button>Settings</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-content">
        {/* ... dashboard content ... */}
      </main>
    </div>
  );
}

/**
 * Example Sterling Page with Finance Commands
 */
export function VoiceEnabledSterlingPage() {
  const customCommands = [
    {
      patterns: [/^what('s| is) my (total )?earnings$/i],
      action: () => {
        // Custom earnings query
        console.log('Query earnings');
      },
      feedback: 'Your total earnings are $12,450',
      description: 'Query total earnings'
    }
  ];

  return (
    <div className="sterling-page">
      <header>
        <h1>Sterling - Finance Agent</h1>
        <VoiceIndicator 
          context="sterling"
          commands={customCommands}
        />
      </header>
      
      {/* ... sterling content ... */}
    </div>
  );
}

/**
 * Example Agent Detail Page with Agent Commands
 */
export function VoiceEnabledAgentPage({ agentName }: { agentName: string }) {
  const customCommands = [
    {
      patterns: [/^restart (this )?agent$/i],
      action: () => {
        // Restart current agent
        console.log(`Restarting ${agentName}`);
      },
      feedback: `Restarting ${agentName}`,
      description: 'Restart current agent'
    },
    {
      patterns: [/^show (agent )?logs$/i],
      action: () => {
        // Show logs
        console.log('Showing logs');
      },
      feedback: 'Showing agent logs',
      description: 'Show agent logs'
    }
  ];

  return (
    <div className="agent-page">
      <header>
        <h1>{agentName}</h1>
        <VoiceIndicator 
          context="agent"
          commands={customCommands}
        />
      </header>
      
      {/* ... agent content ... */}
    </div>
  );
}

/**
 * Hook Usage Example
 */
export function useVoiceExample() {
  const { speak } = require('../utils/speechSynthesis');
  const { useVoiceCommands } = require('../hooks/useVoiceCommands');

  // Define custom commands
  const commands = [
    {
      patterns: [/^hello$/i, /^hi$/i],
      action: () => speak('Hello! How can I help you?'),
      feedback: 'Hello! How can I help you?',
      description: 'Greet the assistant'
    },
    {
      patterns: [/^what time is it$/i],
      action: () => {
        const time = new Date().toLocaleTimeString();
        speak(`It's ${time}`);
      },
      description: 'Get current time'
    }
  ];

  // Use the hook
  const {
    listening,
    transcript,
    startListening,
    stopListening,
    isSupported
  } = useVoiceCommands(commands, {
    autoStart: false,
    silenceTimeout: 5000
  });

  return {
    listening,
    transcript,
    startListening,
    stopListening,
    isSupported
  };
}

/**
 * CSS Styles Example
 * 
 * Add these styles to your CSS file:
 * 
 * .voice-indicator {
 *   position: relative;
 * }
 * 
 * .voice-btn {
 *   background: transparent;
 *   border: 2px solid rgba(255, 255, 255, 0.3);
 *   border-radius: 50%;
 *   width: 44px;
 *   height: 44px;
 *   display: flex;
 *   align-items: center;
 *   justify-content: center;
 *   cursor: pointer;
 *   transition: all 0.2s ease;
 * }
 * 
 * .voice-btn.active {
 *   border-color: #10B981;
 *   background: rgba(16, 185, 129, 0.1);
 * }
 * 
 * .voice-btn:hover {
 *   border-color: rgba(255, 255, 255, 0.5);
 * }
 * 
 * .pulse {
 *   position: absolute;
 *   inset: 0;
 *   border-radius: 50%;
 *   animation: pulse-ring 1.5s ease-out infinite;
 *   background: rgba(16, 185, 129, 0.3);
 * }
 * 
 * @keyframes pulse-ring {
 *   0% { transform: scale(1); opacity: 1; }
 *   100% { transform: scale(1.5); opacity: 0; }
 * }
 * 
 * .transcript-bubble {
 *   position: absolute;
 *   top: 100%;
 *   left: 50%;
 *   transform: translateX(-50%);
 *   margin-top: 8px;
 *   background: rgba(30, 41, 59, 0.95);
 *   backdrop-filter: blur(8px);
 *   border: 1px solid rgba(255, 255, 255, 0.1);
 *   border-radius: 12px;
 *   padding: 12px 16px;
 *   min-width: 200px;
 *   color: #F8FAFC;
 *   font-size: 14px;
 *   box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
 * }
 */

export default VoiceEnabledDashboard;

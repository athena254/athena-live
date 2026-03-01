/**
 * Athena Agent Event Bus - Inter-Agent Communication
 * 
 * Provides a lightweight pub/sub event bus for agent coordination.
 * Supports channels, topics, and event sourcing for audit trails.
 * 
 * Based on Ishtar Research: Agent Communication Protocol (2026-03-01)
 */

import { EventEmitter } from 'events';
import { appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Agent names enum
const AGENTS = {
  ATHENA: 'athena',
  STERLING: 'sterling',
  ISHTAR: 'ishtar',
  DELVER: 'delver',
  SQUIRE: 'squire',
  FELICITY: 'felicity',
  PROMETHEUS: 'prometheus',
  CISCO: 'cisco',
  THEMIS: 'themis'
};

// Message types
const MESSAGE_TYPES = {
  EVENT: 'event',      // One-way notification
  COMMAND: 'command',  // Request action
  QUERY: 'query',      // Request data
  RESPONSE: 'response' // Response to query
};

// Priority levels
const PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Agent Message Envelope
 * @typedef {Object} AgentMessage
 * @property {string} id - Unique message ID
 * @property {number} timestamp - Unix timestamp in ms
 * @property {string} from - Sender agent name
 * @property {string|string[]} to - Recipient(s) or '*' for broadcast
 * @property {string} type - Message type (event|command|query|response)
 * @property {string} topic - Topic identifier (e.g., 'bid.won')
 * @property {any} payload - Message content
 * @property {string} [correlationId] - For request/response correlation
 * @property {number} [ttl] - Time-to-live in ms
 * @property {string} [priority] - Message priority
 */

class AthenaAgentBus extends EventEmitter {
  /**
   * Create a new Agent Event Bus
   * @param {Object} options - Configuration options
   * @param {string} [options.eventLogPath] - Path for event log storage
   * @param {boolean} [options.enableEventSourcing] - Enable event sourcing
   */
  constructor(options = {}) {
    super();
    this.setMaxListeners(100); // Support many subscribers
    
    this.eventLogPath = options.eventLogPath || './events';
    this.enableEventSourcing = options.enableEventSourcing ?? true;
    
    // Agent registry
    this.agents = new Map();
    
    // Subscription registry
    this.subscriptions = new Map(); // agentName -> Set of topics
    
    // Pending queries awaiting response
    this.pendingQueries = new Map(); // correlationId -> { resolve, timeout }
    
    // Coordination primitives
    this.locks = new Map();
    this.semaphores = new Map();
    
    // Metrics
    this.metrics = {
      messagesSent: 0,
      messagesDelivered: 0,
      broadcasts: 0,
      queries: 0
    };
    
    // Initialize event log directory
    if (this.enableEventSourcing && !existsSync(this.eventLogPath)) {
      mkdirSync(this.eventLogPath, { recursive: true });
    }
    
    console.log('[AgentBus] Initialized');
  }

  /**
   * Register an agent with the bus
   * @param {string} agentName - Name of the agent
   * @param {string[]} [capabilities] - Agent capabilities
   */
  registerAgent(agentName, capabilities = []) {
    if (this.agents.has(agentName)) {
      console.warn(`[AgentBus] Agent ${agentName} already registered`);
      return;
    }

    this.agents.set(agentName, {
      name: agentName,
      capabilities,
      status: 'active',
      lastSeen: Date.now(),
      messageQueue: []
    });

    // Subscribe to inbox
    this.on(`${agentName}:inbox`, (message) => {
      this.handleInboxMessage(agentName, message);
    });

    console.log(`[AgentBus] Registered agent: ${agentName}`);
    this.emit('agent:registered', { agentName, capabilities });
  }

  /**
   * Send a message
   * @param {Object} options - Message options
   * @param {string} options.from - Sender
   * @param {string|string[]} options.to - Recipient(s)
   * @param {string} options.type - Message type
   * @param {string} options.topic - Topic
   * @param {any} options.payload - Message content
   * @param {string} [options.correlationId] - For responses
   * @param {string} [options.priority] - Message priority
   * @returns {string} Message ID
   */
  send(options) {
    const message = {
      id: `msg_${randomUUID()}`,
      timestamp: Date.now(),
      from: options.from,
      to: options.to,
      type: options.type,
      topic: options.topic,
      payload: options.payload,
      correlationId: options.correlationId,
      priority: options.priority || PRIORITY.NORMAL,
      ttl: options.ttl
    };

    // Log event
    if (this.enableEventSourcing) {
      this.logEvent(message);
    }

    // Route message
    if (message.to === '*') {
      // Broadcast to all agents
      this.broadcast(message);
    } else if (Array.isArray(message.to)) {
      // Multi-cast to specific agents
      message.to.forEach(recipient => {
        this.deliver(recipient, message);
      });
    } else {
      // Direct message
      this.deliver(message.to, message);
    }

    this.metrics.messagesSent++;
    return message.id;
  }

  /**
   * Broadcast a message to all agents
   * @param {AgentMessage} message - Message to broadcast
   */
  broadcast(message) {
    console.log(`[AgentBus] Broadcast from ${message.from}: ${message.topic}`);
    
    // Emit to broadcast channel
    this.emit('broadcast', message);
    
    // Deliver to all registered agents
    for (const agentName of this.agents.keys()) {
      if (agentName !== message.from) {
        this.deliver(agentName, message);
      }
    }
    
    this.metrics.broadcasts++;
  }

  /**
   * Deliver a message to a specific agent
   * @param {string} agentName - Target agent
   * @param {AgentMessage} message - Message to deliver
   */
  deliver(agentName, message) {
    const agent = this.agents.get(agentName);
    
    if (!agent) {
      console.warn(`[AgentBus] Agent ${agentName} not registered`);
      return;
    }

    // Update last seen
    agent.lastSeen = Date.now();

    // Emit to agent's inbox
    this.emit(`${agentName}:inbox`, message);
    this.emit(`message:${message.topic}`, message);
    
    this.metrics.messagesDelivered++;
  }

  /**
   * Handle incoming message for an agent
   * @param {string} agentName - Agent receiving message
   * @param {AgentMessage} message - The message
   */
  handleInboxMessage(agentName, message) {
    const agent = this.agents.get(agentName);
    
    // Check if this is a response to a pending query
    if (message.type === MESSAGE_TYPES.RESPONSE && message.correlationId) {
      const pending = this.pendingQueries.get(message.correlationId);
      if (pending) {
        clearTimeout(pending.timeout);
        pending.resolve(message.payload);
        this.pendingQueries.delete(message.correlationId);
        return;
      }
    }

    // Queue message for agent
    agent.messageQueue.push(message);
    
    // Emit for subscribers
    this.emit(`${agentName}:message`, message);
  }

  /**
   * Subscribe to a topic
   * @param {string} agentName - Subscriber agent
   * @param {string} topic - Topic pattern (supports wildcards)
   * @param {Function} handler - Message handler
   */
  subscribe(agentName, topic, handler) {
    const key = `${agentName}:${topic}`;
    
    if (!this.subscriptions.has(agentName)) {
      this.subscriptions.set(agentName, new Set());
    }
    this.subscriptions.get(agentName).add(topic);

    // Create handler wrapper
    const wrapper = (message) => {
      if (this.matchesTopic(topic, message.topic)) {
        handler(message);
      }
    };

    this.on(`message:${topic}`, wrapper);
    console.log(`[AgentBus] ${agentName} subscribed to ${topic}`);
  }

  /**
   * Check if message topic matches subscription pattern
   * @param {string} pattern - Subscription pattern (e.g., 'bid.*')
   * @param {string} topic - Actual topic
   * @returns {boolean} Match result
   */
  matchesTopic(pattern, topic) {
    if (pattern === '*') return true;
    if (!pattern.includes('*')) return pattern === topic;
    
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return regex.test(topic);
  }

  /**
   * Send a query and wait for response
   * @param {Object} options - Query options
   * @param {number} [options.timeout=5000] - Timeout in ms
   * @returns {Promise<any>} Response payload
   */
  async query(options) {
    const correlationId = `qry_${randomUUID()}`;
    const timeout = options.timeout || 5000;

    return new Promise((resolve, reject) => {
      // Set up pending query
      const timeoutId = setTimeout(() => {
        this.pendingQueries.delete(correlationId);
        reject(new Error(`Query timeout: ${options.topic}`));
      }, timeout);

      this.pendingQueries.set(correlationId, {
        resolve,
        timeout: timeoutId
      });

      // Send query
      this.send({
        ...options,
        type: MESSAGE_TYPES.QUERY,
        correlationId
      });

      this.metrics.queries++;
    });
  }

  /**
   * Respond to a query
   * @param {AgentMessage} originalQuery - The original query message
   * @param {any} payload - Response payload
   * @param {string} from - Responding agent
   */
  respond(originalQuery, payload, from) {
    this.send({
      from,
      to: originalQuery.from,
      type: MESSAGE_TYPES.RESPONSE,
      topic: originalQuery.topic,
      payload,
      correlationId: originalQuery.correlationId
    });
  }

  /**
   * Acquire a distributed lock
   * @param {string} lockName - Lock identifier
   * @param {string} agentName - Agent requesting lock
   * @param {number} [timeout=30000] - Lock timeout in ms
   * @returns {boolean} Whether lock was acquired
   */
  acquireLock(lockName, agentName, timeout = 30000) {
    const lock = this.locks.get(lockName);
    
    if (lock && Date.now() < lock.expiry) {
      return false; // Lock held by another agent
    }

    this.locks.set(lockName, {
      holder: agentName,
      expiry: Date.now() + timeout,
      acquired: Date.now()
    });

    console.log(`[AgentBus] Lock "${lockName}" acquired by ${agentName}`);
    this.emit('lock:acquired', { lockName, agentName });
    
    return true;
  }

  /**
   * Release a distributed lock
   * @param {string} lockName - Lock identifier
   * @param {string} agentName - Agent releasing lock
   * @returns {boolean} Whether lock was released
   */
  releaseLock(lockName, agentName) {
    const lock = this.locks.get(lockName);
    
    if (!lock || lock.holder !== agentName) {
      return false;
    }

    this.locks.delete(lockName);
    console.log(`[AgentBus] Lock "${lockName}" released by ${agentName}`);
    this.emit('lock:released', { lockName, agentName });
    
    return true;
  }

  /**
   * Acquire semaphore slot
   * @param {string} resourceName - Semaphore identifier
   * @param {string} agentName - Agent requesting slot
   * @param {number} [maxConcurrent=3] - Max concurrent holders
   * @returns {boolean} Whether slot was acquired
   */
  acquireSemaphore(resourceName, agentName, maxConcurrent = 3) {
    if (!this.semaphores.has(resourceName)) {
      this.semaphores.set(resourceName, []);
    }

    const holders = this.semaphores.get(resourceName);
    
    if (holders.length >= maxConcurrent) {
      return false;
    }

    holders.push(agentName);
    this.emit('semaphore:acquired', { resourceName, agentName });
    return true;
  }

  /**
   * Release semaphore slot
   * @param {string} resourceName - Semaphore identifier
   * @param {string} agentName - Agent releasing slot
   */
  releaseSemaphore(resourceName, agentName) {
    const holders = this.semaphores.get(resourceName);
    if (!holders) return;

    const index = holders.indexOf(agentName);
    if (index > -1) {
      holders.splice(index, 1);
      this.emit('semaphore:released', { resourceName, agentName });
    }
  }

  /**
   * Log event for sourcing
   * @param {AgentMessage} event - Event to log
   */
  logEvent(event) {
    const date = new Date(event.timestamp).toISOString().split('T')[0];
    const logFile = join(this.eventLogPath, `events-${date}.jsonl`);
    
    const logEntry = JSON.stringify({
      eventId: event.id,
      eventType: event.topic,
      timestamp: event.timestamp,
      data: event.payload,
      metadata: {
        from: event.from,
        to: event.to,
        type: event.type,
        correlationId: event.correlationId
      }
    }) + '\n';
    
    appendFileSync(logFile, logEntry);
  }

  /**
   * Replay events from log
   * @param {string} date - Date to replay (YYYY-MM-DD)
   * @param {Function} handler - Event handler
   */
  replayEvents(date, handler) {
    const logFile = join(this.eventLogPath, `events-${date}.jsonl`);
    
    if (!existsSync(logFile)) {
      console.warn(`[AgentBus] No events for ${date}`);
      return;
    }

    const content = readFileSync(logFile, 'utf-8');
    const lines = content.trim().split('\n');
    
    for (const line of lines) {
      const event = JSON.parse(line);
      handler(event);
    }
    
    console.log(`[AgentBus] Replayed ${lines.length} events from ${date}`);
  }

  /**
   * Project current state from events
   * @param {string} date - Date to project
   * @param {Function} reducer - State reducer function
   * @param {any} initialState - Initial state
   * @returns {any} Projected state
   */
  project(date, reducer, initialState) {
    let state = initialState;
    
    this.replayEvents(date, (event) => {
      state = reducer(state, event);
    });
    
    return state;
  }

  /**
   * Get bus metrics
   * @returns {Object} Metrics object
   */
  getMetrics() {
    return {
      ...this.metrics,
      agents: this.agents.size,
      subscriptions: this.subscriptions.size,
      pendingQueries: this.pendingQueries.size,
      activeLocks: this.locks.size,
      activeSemaphores: this.semaphores.size
    };
  }

  /**
   * Get agent status
   * @param {string} agentName - Agent name
   * @returns {Object} Agent status
   */
  getAgentStatus(agentName) {
    const agent = this.agents.get(agentName);
    if (!agent) return null;
    
    return {
      name: agent.name,
      status: agent.status,
      lastSeen: agent.lastSeen,
      queueLength: agent.messageQueue.length,
      capabilities: agent.capabilities
    };
  }
}

// Export
export { AthenaAgentBus, AGENTS, MESSAGE_TYPES, PRIORITY };
export default AthenaAgentBus;

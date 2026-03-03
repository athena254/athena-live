/**
 * Athena Event Sourcing Implementation
 * For state recovery, audit trails, and temporal queries
 * 
 * Use case: Reconstruct agent state at any point in time
 * Example: What was Sterling's bidding status 2 hours ago?
 */

const fs = require('fs').promises;
const path = require('path');

// ============================================================
// EVENT STORE
// ============================================================

class EventStore {
  constructor(options = {}) {
    this.storeDir = options.storeDir || '/root/.openclaw/workspace/memory/events';
    this.maxEventsPerFile = options.maxEventsPerFile || 1000;
    this.snapshotThreshold = options.snapshotThreshold || 100; // Create snapshot every N events
  }

  /**
   * Append an event to the store
   * @param {string} aggregateId - Entity ID (e.g., 'sterling-bidding-state')
   * @param {Object} event - Event payload
   */
  async append(aggregateId, event) {
    await fs.mkdir(this.storeDir, { recursive: true });
    
    const eventWithMeta = {
      eventId: this.generateEventId(),
      aggregateId,
      eventType: event.type,
      timestamp: new Date().toISOString(),
      version: await this.getNextVersion(aggregateId),
      payload: event.payload || event,
      metadata: event.metadata || {}
    };
    
    const eventsFile = path.join(this.storeDir, `${aggregateId}.jsonl`);
    await fs.appendFile(eventsFile, JSON.stringify(eventWithMeta) + '\n');
    
    // Check if we need a snapshot
    const eventCount = await this.getEventCount(aggregateId);
    if (eventCount % this.snapshotThreshold === 0) {
      await this.createSnapshot(aggregateId);
    }
    
    return eventWithMeta;
  }

  /**
   * Get all events for an aggregate
   */
  async getEvents(aggregateId, options = {}) {
    const eventsFile = path.join(this.storeDir, `${aggregateId}.jsonl`);
    
    try {
      const content = await fs.readFile(eventsFile, 'utf8');
      let events = content.trim().split('\n').map(line => JSON.parse(line));
      
      // Filter by version range
      if (options.fromVersion !== undefined) {
        events = events.filter(e => e.version >= options.fromVersion);
      }
      if (options.toVersion !== undefined) {
        events = events.filter(e => e.version <= options.toVersion);
      }
      
      // Filter by time range
      if (options.fromTime) {
        const fromTime = new Date(options.fromTime).getTime();
        events = events.filter(e => new Date(e.timestamp).getTime() >= fromTime);
      }
      if (options.toTime) {
        const toTime = new Date(options.toTime).getTime();
        events = events.filter(e => new Date(e.timestamp).getTime() <= toTime);
      }
      
      return events;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  /**
   * Get event count for an aggregate
   */
  async getEventCount(aggregateId) {
    const events = await this.getEvents(aggregateId);
    return events.length;
  }

  /**
   * Get next version number for an aggregate
   */
  async getNextVersion(aggregateId) {
    const events = await this.getEvents(aggregateId);
    return events.length > 0 ? events[events.length - 1].version + 1 : 1;
  }

  /**
   * Create a snapshot of current state
   */
  async createSnapshot(aggregateId, state = null) {
    const snapshotDir = path.join(this.storeDir, 'snapshots');
    await fs.mkdir(snapshotDir, { recursive: true });
    
    const snapshot = {
      aggregateId,
      timestamp: new Date().toISOString(),
      version: await this.getEventCount(aggregateId),
      state: state || await this.replay(aggregateId)
    };
    
    const snapshotFile = path.join(snapshotDir, `${aggregateId}-snapshot.json`);
    await fs.writeFile(snapshotFile, JSON.stringify(snapshot, null, 2));
    
    return snapshot;
  }

  /**
   * Load the latest snapshot for an aggregate
   */
  async loadSnapshot(aggregateId) {
    const snapshotFile = path.join(this.storeDir, 'snapshots', `${aggregateId}-snapshot.json`);
    
    try {
      const content = await fs.readFile(snapshotFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      if (error.code === 'ENOENT') return null;
      throw error;
    }
  }

  /**
   * Replay events to reconstruct state
   * Uses snapshot optimization if available
   */
  async replay(aggregateId, options = {}) {
    // Try to load snapshot first
    const snapshot = await this.loadSnapshot(aggregateId);
    
    let state = snapshot ? snapshot.state : null;
    let fromVersion = snapshot ? snapshot.version + 1 : 1;
    
    // Get events after snapshot
    const events = await this.getEvents(aggregateId, { fromVersion, ...options });
    
    // If we have a snapshot and no new events, return snapshot state
    if (state && events.length === 0) {
      return state;
    }
    
    // Replay events
    for (const event of events) {
      state = this.applyEvent(state, event);
    }
    
    return state;
  }

  /**
   * Apply an event to state (to be overridden by specific aggregates)
   */
  applyEvent(state, event) {
    // Default implementation - just merge payload
    return { ...state, ...event.payload };
  }

  generateEventId() {
    return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================
// AGGREGATE BASE CLASS
// ============================================================

class Aggregate {
  constructor(aggregateId, eventStore) {
    this.aggregateId = aggregateId;
    this.eventStore = eventStore;
    this.uncommittedEvents = [];
    this.version = 0;
    this.state = {};
  }

  /**
   * Load aggregate state from event store
   */
  async load() {
    this.state = await this.eventStore.replay(this.aggregateId);
    const events = await this.eventStore.getEvents(this.aggregateId);
    this.version = events.length;
    return this;
  }

  /**
   * Apply a new event
   */
  apply(eventType, payload, metadata = {}) {
    const event = {
      type: eventType,
      payload,
      metadata
    };
    
    // Apply to state immediately
    this.state = this.handleEvent(this.state, {
      ...event,
      timestamp: new Date().toISOString()
    });
    
    // Queue for commit
    this.uncommittedEvents.push(event);
    this.version++;
    
    return this;
  }

  /**
   * Commit all uncommitted events
   */
  async commit() {
    for (const event of this.uncommittedEvents) {
      await this.eventStore.append(this.aggregateId, event);
    }
    
    this.uncommittedEvents = [];
    return this;
  }

  /**
   * Handle an event (override in subclass)
   */
  handleEvent(state, event) {
    return state;
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }
}

// ============================================================
// ATHENA-SPECIFIC AGGREGATES
// ============================================================

/**
 * Sterling Bidding State Aggregate
 */
class SterlingBiddingAggregate extends Aggregate {
  constructor(aggregateId, eventStore) {
    super(aggregateId || 'sterling-bidding-state', eventStore);
  }

  handleEvent(state, event) {
    switch (event.type) {
      case 'BiddingStarted':
        return {
          ...state,
          status: 'active',
          startedAt: event.timestamp,
          totalBids: 0,
          wonBids: 0
        };
      
      case 'BidPlaced':
        return {
          ...state,
          totalBids: (state.totalBids || 0) + 1,
          lastBidAt: event.timestamp,
          lastBidAmount: event.payload.amount,
          lastBidProject: event.payload.projectId
        };
      
      case 'BidWon':
        return {
          ...state,
          wonBids: (state.wonBids || 0) + 1,
          lastWonAt: event.timestamp,
          totalEarnings: (state.totalEarnings || 0) + (event.payload.amount || 0)
        };
      
      case 'BidLost':
        return {
          ...state,
          lostBids: (state.lostBids || 0) + 1,
          lastLostAt: event.timestamp
        };
      
      case 'BiddingPaused':
        return {
          ...state,
          status: 'paused',
          pausedAt: event.timestamp,
          pauseReason: event.payload.reason
        };
      
      case 'BiddingResumed':
        return {
          ...state,
          status: 'active',
          resumedAt: event.timestamp
        };
      
      case 'CreditsUpdated':
        return {
          ...state,
          credits: event.payload.credits,
          creditsUpdatedAt: event.timestamp
        };
      
      default:
        return state;
    }
  }

  // Commands
  startBidding() {
    if (this.state.status === 'active') return this;
    return this.apply('BiddingStarted', {});
  }

  placeBid(projectId, amount) {
    return this.apply('BidPlaced', { projectId, amount });
  }

  winBid(projectId, amount) {
    return this.apply('BidWon', { projectId, amount });
  }

  loseBid(projectId, amount) {
    return this.apply('BidLost', { projectId, amount });
  }

  pauseBidding(reason) {
    return this.apply('BiddingPaused', { reason });
  }

  resumeBidding() {
    return this.apply('BiddingResumed', {});
  }

  updateCredits(credits) {
    return this.apply('CreditsUpdated', { credits });
  }
}

/**
 * Agent Health Aggregate
 */
class AgentHealthAggregate extends Aggregate {
  constructor(agentId, eventStore) {
    super(`agent-health-${agentId}`, eventStore);
    this.agentId = agentId;
  }

  handleEvent(state, event) {
    switch (event.type) {
      case 'AgentStarted':
        return {
          agentId: this.agentId,
          status: 'running',
          startedAt: event.timestamp,
          restarts: (state.restarts || 0),
          lastHeartbeat: event.timestamp
        };
      
      case 'Heartbeat':
        return {
          ...state,
          status: 'running',
          lastHeartbeat: event.timestamp,
          consecutiveFailures: 0
        };
      
      case 'HealthCheckFailed':
        return {
          ...state,
          status: 'degraded',
          lastFailure: event.timestamp,
          consecutiveFailures: (state.consecutiveFailures || 0) + 1,
          failureReason: event.payload.reason
        };
      
      case 'AgentRecovered':
        return {
          ...state,
          status: 'running',
          recoveredAt: event.timestamp,
          consecutiveFailures: 0
        };
      
      case 'AgentRestarted':
        return {
          ...state,
          status: 'restarting',
          restarts: (state.restarts || 0) + 1,
          lastRestart: event.timestamp
        };
      
      case 'AgentStopped':
        return {
          ...state,
          status: 'stopped',
          stoppedAt: event.timestamp
        };
      
      default:
        return state;
    }
  }

  // Commands
  recordStart() {
    return this.apply('AgentStarted', {});
  }

  recordHeartbeat(metrics = {}) {
    return this.apply('Heartbeat', { metrics });
  }

  recordFailure(reason) {
    return this.apply('HealthCheckFailed', { reason });
  }

  recordRecovery() {
    return this.apply('AgentRecovered', {});
  }

  recordRestart() {
    return this.apply('AgentRestarted', {});
  }

  recordStop() {
    return this.apply('AgentStopped', {});
  }
}

// ============================================================
// TEMPORAL QUERIES
// ============================================================

class TemporalQuery {
  constructor(eventStore) {
    this.eventStore = eventStore;
  }

  /**
   * Get aggregate state at a specific point in time
   */
  async getStateAtTime(aggregateId, targetTime) {
    const events = await this.eventStore.getEvents(aggregateId, {
      toTime: targetTime
    });
    
    let state = null;
    for (const event of events) {
      state = this.eventStore.applyEvent(state, event);
    }
    
    return {
      aggregateId,
      targetTime,
      state,
      version: events.length,
      events: events.slice(-5) // Last 5 events leading to this state
    };
  }

  /**
   * Get state changes between two points in time
   */
  async getStateDiff(aggregateId, fromTime, toTime) {
    const beforeState = await this.getStateAtTime(aggregateId, fromTime);
    const afterState = await this.getStateAtTime(aggregateId, toTime);
    
    const events = await this.eventStore.getEvents(aggregateId, {
      fromTime,
      toTime
    });
    
    return {
      aggregateId,
      fromTime,
      toTime,
      beforeState: beforeState.state,
      afterState: afterState.state,
      eventsCount: events.length,
      eventTypes: [...new Set(events.map(e => e.eventType))]
    };
  }

  /**
   * Find all events of a specific type
   */
  async findEvents(eventType, options = {}) {
    const results = [];
    const aggregates = await this.listAggregates();
    
    for (const aggregateId of aggregates) {
      const events = await this.eventStore.getEvents(aggregateId);
      for (const event of events) {
        if (event.eventType === eventType) {
          results.push({
            aggregateId,
            ...event
          });
        }
      }
    }
    
    return results;
  }

  /**
   * List all aggregates in the store
   */
  async listAggregates() {
    const files = await fs.readdir(this.eventStore.storeDir);
    return files
      .filter(f => f.endsWith('.jsonl'))
      .map(f => f.replace('.jsonl', ''));
  }
}

// ============================================================
// AUDIT LOG
// ============================================================

class AuditLog {
  constructor(eventStore) {
    this.eventStore = eventStore;
    this.auditFile = '/root/.openclaw/workspace/memory/audit-log.jsonl';
  }

  /**
   * Log an audit event
   */
  async log(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      actor: details.actor || 'athena',
      resource: details.resource,
      oldValue: details.oldValue,
      newValue: details.newValue,
      reason: details.reason,
      correlationId: details.correlationId
    };
    
    await fs.appendFile(this.auditFile, JSON.stringify(entry) + '\n');
    return entry;
  }

  /**
   * Get audit entries for a resource
   */
  async getAuditTrail(resource, options = {}) {
    try {
      const content = await fs.readFile(this.auditFile, 'utf8');
      let entries = content.trim().split('\n').map(line => JSON.parse(line));
      
      // Filter by resource
      if (resource) {
        entries = entries.filter(e => e.resource === resource);
      }
      
      // Filter by time
      if (options.fromTime) {
        const fromTime = new Date(options.fromTime).getTime();
        entries = entries.filter(e => new Date(e.timestamp).getTime() >= fromTime);
      }
      if (options.toTime) {
        const toTime = new Date(options.toTime).getTime();
        entries = entries.filter(e => new Date(e.timestamp).getTime() <= toTime);
      }
      
      // Filter by action
      if (options.action) {
        entries = entries.filter(e => e.action === options.action);
      }
      
      return entries;
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  EventStore,
  Aggregate,
  SterlingBiddingAggregate,
  AgentHealthAggregate,
  TemporalQuery,
  AuditLog
};

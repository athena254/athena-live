/**
 * Athena Leader Election Implementation
 * For critical agent failover and high availability
 * 
 * Use case: Ensuring exactly one agent is the "leader" for critical tasks
 * Example: Only one Sterling should bid at a time to avoid duplicate bids
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Raft-inspired Leader Election for Athena Agents
 * Uses file-based consensus for simplicity (single-machine deployment)
 */
class LeaderElection {
  constructor(options = {}) {
    this.agentId = options.agentId || 'unknown';
    this.groupId = options.groupId || 'athena-agents';
    this.heartbeatInterval = options.heartbeatInterval || 5000;   // 5s
    this.electionTimeout = options.electionTimeout || 15000;      // 15s
    this.leaseDuration = options.leaseDuration || 30000;          // 30s lease
    
    this.stateDir = options.stateDir || '/root/.openclaw/workspace/memory/election';
    this.leaseFile = path.join(this.stateDir, `${this.groupId}-leader.json`);
    
    this.state = 'follower';  // follower | candidate | leader
    this.currentLeader = null;
    this.term = 0;
    this.heartbeatTimer = null;
    this.electionTimer = null;
    
    this.onElected = options.onElected || (() => {});
    this.onDeposed = options.onDeposed || (() => {});
    this.onLeaderChange = options.onLeaderChange || (() => {});
  }

  /**
   * Start participating in leader election
   */
  async start() {
    await fs.mkdir(this.stateDir, { recursive: true });
    await this.loadState();
    this.startElectionTimer();
    this.startHeartbeat();
    
    console.log(`[${this.agentId}] Leader election started. Term: ${this.term}`);
    return this;
  }

  /**
   * Stop participating in leader election
   */
  async stop() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.electionTimer) clearTimeout(this.electionTimer);
    
    // If we're leader, release the lease
    if (this.state === 'leader') {
      await this.releaseLease();
      await this.onDeposed();
    }
    
    this.state = 'follower';
    console.log(`[${this.agentId}] Leader election stopped`);
  }

  /**
   * Load current election state from disk
   */
  async loadState() {
    try {
      const data = await fs.readFile(this.leaseFile, 'utf8');
      const lease = JSON.parse(data);
      
      // Check if lease is still valid
      if (Date.now() < lease.expiresAt) {
        this.currentLeader = lease.leaderId;
        this.term = lease.term;
        this.state = this.agentId === lease.leaderId ? 'leader' : 'follower';
      } else {
        // Lease expired - election needed
        this.currentLeader = null;
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`[${this.agentId}] Error loading state:`, error.message);
      }
      // No state file - start fresh
      this.currentLeader = null;
      this.term = 0;
    }
  }

  /**
   * Start election timer (randomized for collision avoidance)
   */
  startElectionTimer() {
    if (this.electionTimer) clearTimeout(this.electionTimer);
    
    // Random timeout between electionTimeout and 2*electionTimeout
    const timeout = this.electionTimeout + Math.random() * this.electionTimeout;
    
    this.electionTimer = setTimeout(() => {
      this.initiateElection();
    }, timeout);
  }

  /**
   * Initiate a new election
   */
  async initiateElection() {
    if (this.state === 'leader') {
      // We're still leader, just renew
      this.startElectionTimer();
      return;
    }
    
    this.state = 'candidate';
    this.term++;
    
    console.log(`[${this.agentId}] Starting election for term ${this.term}`);
    
    // "Vote" for ourselves (single-node scenario)
    // In multi-node, this would be a broadcast for votes
    const wonElection = await this.campaign();
    
    if (wonElection) {
      await this.becomeLeader();
    } else {
      this.state = 'follower';
      this.startElectionTimer();
    }
  }

  /**
   * Campaign for leadership
   * In single-node: always win if no valid leader exists
   */
  async campaign() {
    try {
      // Check if another leader already exists
      await this.loadState();
      
      if (this.currentLeader && this.currentLeader !== this.agentId) {
        const leaseData = await fs.readFile(this.leaseFile, 'utf8').catch(() => null);
        if (leaseData) {
          const lease = JSON.parse(leaseData);
          if (Date.now() < lease.expiresAt) {
            // Another valid leader exists
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      return true; // No leader file, we can become leader
    }
  }

  /**
   * Become the leader
   */
  async becomeLeader() {
    this.state = 'leader';
    this.currentLeader = this.agentId;
    
    // Write lease
    await this.acquireLease();
    
    console.log(`[${this.agentId}] 👑 Became leader for term ${this.term}`);
    
    // Notify
    await this.onElected();
    await this.onLeaderChange(this.agentId, this.term);
    
    // Start leader heartbeat
    this.startLeaderHeartbeat();
  }

  /**
   * Acquire leadership lease
   */
  async acquireLease() {
    const lease = {
      leaderId: this.agentId,
      term: this.term,
      acquiredAt: Date.now(),
      expiresAt: Date.now() + this.leaseDuration,
      groupId: this.groupId
    };
    
    await fs.writeFile(this.leaseFile, JSON.stringify(lease, null, 2));
    return lease;
  }

  /**
   * Release leadership lease
   */
  async releaseLease() {
    try {
      await fs.unlink(this.leaseFile);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`[${this.agentId}] Error releasing lease:`, error.message);
      }
    }
  }

  /**
   * Leader heartbeat - renew lease periodically
   */
  startLeaderHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    
    this.heartbeatTimer = setInterval(async () => {
      if (this.state !== 'leader') {
        clearInterval(this.heartbeatTimer);
        return;
      }
      
      try {
        await this.acquireLease();
        console.log(`[${this.agentId}] 💓 Leader heartbeat - lease renewed`);
      } catch (error) {
        console.error(`[${this.agentId}] Failed to renew lease:`, error.message);
        // Lost leadership
        this.state = 'follower';
        await this.onDeposed();
        this.startElectionTimer();
      }
    }, this.heartbeatInterval);
  }

  /**
   * Regular heartbeat for followers
   */
  startHeartbeat() {
    // Followers just watch for leader heartbeats
    setInterval(async () => {
      if (this.state === 'leader') return;
      
      await this.loadState();
      
      if (this.currentLeader && this.currentLeader !== this.agentId) {
        // Leader exists, reset election timer
        this.startElectionTimer();
      }
    }, this.heartbeatInterval);
  }

  /**
   * Check if this agent is the leader
   */
  isLeader() {
    return this.state === 'leader';
  }

  /**
   * Get current leader info
   */
  async getLeader() {
    await this.loadState();
    return {
      leaderId: this.currentLeader,
      term: this.term,
      isSelf: this.currentLeader === this.agentId
    };
  }

  /**
   * Get election status for monitoring
   */
  getStatus() {
    return {
      agentId: this.agentId,
      groupId: this.groupId,
      state: this.state,
      currentLeader: this.currentLeader,
      term: this.term,
      isLeader: this.isLeader()
    };
  }
}

// ============================================================
// ATHENA CRITICAL AGENT REGISTRY
// ============================================================

/**
 * Manages leader election for multiple critical agent roles
 */
class CriticalAgentRegistry {
  constructor() {
    this.elections = new Map(); // role -> LeaderElection
    this.stateDir = '/root/.openclaw/workspace/memory/election';
  }

  /**
   * Register a critical agent role
   * @param {string} role - e.g., 'bidding', 'dashboard', 'notifications'
   * @param {string} agentId - The agent competing for this role
   * @param {Object} callbacks - onElected, onDeposed, onLeaderChange
   */
  async registerRole(role, agentId, callbacks = {}) {
    const election = new LeaderElection({
      agentId,
      groupId: `athena-${role}`,
      stateDir: this.stateDir,
      ...callbacks
    });
    
    this.elections.set(role, election);
    await election.start();
    
    return election;
  }

  /**
   * Check if this agent is leader for a role
   */
  isLeaderFor(role) {
    const election = this.elections.get(role);
    return election ? election.isLeader() : false;
  }

  /**
   * Get leader for a role
   */
  async getLeaderFor(role) {
    const election = this.elections.get(role);
    return election ? election.getLeader() : null;
  }

  /**
   * Get all election statuses
   */
  getAllStatuses() {
    const statuses = {};
    for (const [role, election] of this.elections) {
      statuses[role] = election.getStatus();
    }
    return statuses;
  }

  /**
   * Stop all elections
   */
  async stopAll() {
    for (const election of this.elections.values()) {
      await election.stop();
    }
    this.elections.clear();
  }
}

// ============================================================
// USAGE EXAMPLES
// ============================================================

/**
 * Sterling Bidding Leader Setup
 * Ensures only one Sterling instance bids at a time
 */
async function setupSterlingBiddingLeader() {
  const registry = new CriticalAgentRegistry();
  
  await registry.registerRole('bidding', 'sterling-1', {
    onElected: async () => {
      console.log('[Sterling] 👑 I am now the bidding leader!');
      console.log('[Sterling] Starting auto-bidding...');
      // Start bidding logic
    },
    onDeposed: async () => {
      console.log('[Sterling] 🔻 Lost bidding leadership');
      console.log('[Sterling] Pausing all bids...');
      // Stop bidding immediately
    },
    onLeaderChange: async (leaderId, term) => {
      console.log(`[Sterling] Leader changed to ${leaderId} (term ${term})`);
    }
  });
  
  return registry;
}

/**
 * Multi-Sterling Failover
 * If sterling-1 crashes, sterling-2 takes over automatically
 */
async function setupSterlingFailover() {
  // Sterling 1 (primary)
  const primary = new LeaderElection({
    agentId: 'sterling-1',
    groupId: 'athena-bidding',
    electionTimeout: 10000,
    leaseDuration: 20000
  });
  
  // Sterling 2 (standby)
  const standby = new LeaderElection({
    agentId: 'sterling-2',
    groupId: 'athena-bidding',
    electionTimeout: 15000, // Longer timeout so primary wins
    leaseDuration: 20000
  });
  
  await primary.start();
  await standby.start();
  
  return { primary, standby };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  LeaderElection,
  CriticalAgentRegistry,
  setupSterlingBiddingLeader,
  setupSterlingFailover
};

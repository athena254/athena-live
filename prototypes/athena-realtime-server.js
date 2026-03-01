/**
 * Athena Real-time Server - SSE Implementation
 * 
 * Provides Server-Sent Events for real-time dashboard updates.
 * Watches agent state files and broadcasts changes.
 * 
 * Based on Ishtar Research: Real-time Dashboard Optimization (2026-03-01)
 */

import { createServer } from 'http';
import { watch, readFile } from 'fs/promises';
import { existsSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { EventEmitter } from 'events';

// Configuration
const PORT = process.env.ATHENA_RT_PORT || 3001;
const STATE_DIR = process.env.ATHENA_STATE_DIR || './state';
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 1000; // 1 second initial

class AthenaRealtimeServer extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // clientId -> { res, channels }
    this.stateCache = new Map(); // file -> data
    this.clientIdCounter = 0;
  }

  // Start the server
  start() {
    const server = createServer((req, res) => this.handleRequest(req, res));
    
    server.listen(PORT, () => {
      console.log(`[AthenaRT] Server started on port ${PORT}`);
      console.log(`[AthenaRT] SSE endpoint: http://localhost:${PORT}/events`);
      console.log(`[AthenaRT] Watching: ${STATE_DIR}`);
    });

    // Start watching state directory
    this.watchStateDirectory();
    
    // Start heartbeat
    this.startHeartbeat();
    
    return server;
  }

  // Handle incoming HTTP requests
  handleRequest(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // CORS headers for cross-origin requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Last-Event-ID');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (url.pathname === '/events') {
      this.handleSSE(req, res, url);
    } else if (url.pathname === '/status') {
      this.handleStatus(req, res);
    } else if (url.pathname === '/channels') {
      this.handleChannels(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  // Handle SSE connection
  handleSSE(req, res, url) {
    const clientId = `client_${++this.clientIdCounter}`;
    const channels = url.searchParams.get('channels')?.split(',') || ['*'];
    const lastEventId = req.headers['last-event-id'];

    // Setup SSE response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    });

    // Register client
    this.clients.set(clientId, { res, channels, connected: Date.now() });
    console.log(`[AthenaRT] Client connected: ${clientId} (channels: ${channels.join(', ')})`);

    // Send initial connection event
    this.sendEvent(res, 'connected', { 
      clientId, 
      timestamp: Date.now(),
      reconnectDelay: RECONNECT_DELAY
    });

    // Send cached state for subscribed channels
    if (lastEventId) {
      console.log(`[AthenaRT] Client ${clientId} reconnecting from event ${lastEventId}`);
      // TODO: Implement event replay from log
    } else {
      // Send current state
      this.sendCachedState(res, channels);
    }

    // Handle client disconnect
    req.on('close', () => {
      this.clients.delete(clientId);
      console.log(`[AthenaRT] Client disconnected: ${clientId}`);
    });

    // Handle errors
    req.on('error', (err) => {
      console.error(`[AthenaRT] Client error ${clientId}:`, err.message);
      this.clients.delete(clientId);
    });
  }

  // Send SSE event
  sendEvent(res, event, data) {
    const eventData = JSON.stringify(data);
    res.write(`event: ${event}\n`);
    res.write(`data: ${eventData}\n`);
    res.write(`id: ${Date.now()}\n`);
    res.write('\n');
  }

  // Send cached state to newly connected client
  sendCachedState(res, channels) {
    for (const [file, data] of this.stateCache) {
      const channel = this.fileToChannel(file);
      if (channels.includes('*') || channels.includes(channel)) {
        this.sendEvent(res, 'state', { channel, data, initial: true });
      }
    }
  }

  // Handle /status endpoint
  handleStatus(req, res) {
    const status = {
      uptime: process.uptime(),
      clients: this.clients.size,
      channels: this.stateCache.size,
      memory: process.memoryUsage()
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status, null, 2));
  }

  // Handle /channels endpoint
  handleChannels(req, res) {
    const channels = Array.from(this.stateCache.keys()).map(f => this.fileToChannel(f));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ channels }, null, 2));
  }

  // Watch state directory for changes
  async watchStateDirectory() {
    if (!existsSync(STATE_DIR)) {
      console.warn(`[AthenaRT] State directory not found: ${STATE_DIR}`);
      return;
    }

    // Initial load of all state files
    await this.loadAllState();

    // Watch for changes
    try {
      const watcher = watch(STATE_DIR, { persistent: true });
      
      for await (const event of watcher) {
        if (event.eventType === 'change' || event.eventType === 'rename') {
          const filePath = join(STATE_DIR, event.filename);
          if (event.filename.endsWith('.json')) {
            await this.handleFileChange(filePath);
          }
        }
      }
    } catch (err) {
      console.error('[AthenaRT] Watch error:', err.message);
    }
  }

  // Load all state files initially
  async loadAllState() {
    if (!existsSync(STATE_DIR)) return;
    
    const files = readdirSync(STATE_DIR).filter(f => f.endsWith('.json'));
    
    for (const file of files) {
      const filePath = join(STATE_DIR, file);
      await this.handleFileChange(filePath, true);
    }
    
    console.log(`[AthenaRT] Loaded ${files.length} state files`);
  }

  // Handle a file change
  async handleFileChange(filePath, initial = false) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      const channel = this.fileToChannel(filePath);
      
      // Cache the state
      this.stateCache.set(filePath, data);
      
      // Broadcast to clients
      if (!initial) {
        this.broadcast(channel, data);
      }
    } catch (err) {
      console.error(`[AthenaRT] Error reading ${filePath}:`, err.message);
    }
  }

  // Broadcast update to all subscribed clients
  broadcast(channel, data) {
    const message = { channel, data, timestamp: Date.now() };
    
    for (const [clientId, client] of this.clients) {
      if (client.channels.includes('*') || client.channels.includes(channel)) {
        try {
          this.sendEvent(client.res, 'update', message);
        } catch (err) {
          console.error(`[AthenaRT] Error sending to ${clientId}:`, err.message);
          this.clients.delete(clientId);
        }
      }
    }
    
    console.log(`[AthenaRT] Broadcast ${channel} to ${this.clients.size} clients`);
    this.emit('broadcast', channel, data);
  }

  // Convert file path to channel name
  fileToChannel(filePath) {
    const name = basename(filePath, '.json');
    return name.replace(/-/g, '_');
  }

  // Start heartbeat to keep connections alive
  startHeartbeat() {
    setInterval(() => {
      for (const [clientId, client] of this.clients) {
        try {
          client.res.write(': heartbeat\n\n');
        } catch (err) {
          this.clients.delete(clientId);
        }
      }
    }, HEARTBEAT_INTERVAL);
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new AthenaRealtimeServer();
  server.start();
}

export default AthenaRealtimeServer;

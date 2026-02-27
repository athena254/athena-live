#!/usr/bin/env python3
"""
Queue WebSocket Server - Real-time queue updates
Location: scripts/queue_websocket.py
Purpose: Push queue changes to dashboard instantly via WebSocket
"""

import asyncio
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Set
import websockets
from websockets.server import WebSocketServerProtocol

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
QUEUE_FILE = MEMORY_DIR / 'agent-queue.json'
AGENT_STATUS_FILE = MEMORY_DIR / 'agent-status.json'

# Connected clients
clients: Set[WebSocketServerProtocol] = set()

# Last known state for change detection
last_queue_hash = None
last_status_hash = None


def get_json_hash(filepath: Path) -> str:
    """Get a hash of JSON file contents for change detection."""
    try:
        with open(filepath, 'r') as f:
            return str(hash(f.read()))
    except FileNotFoundError:
        return ""


def load_json(filepath: Path) -> dict:
    """Load JSON file safely."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def get_queue_update() -> dict:
    """Get current queue state for broadcast."""
    queue = load_json(QUEUE_FILE)
    agent_status = load_json(AGENT_STATUS_FILE)
    
    tasks = queue.get('tasks', [])
    stats = queue.get('stats', {})
    
    # Build update message
    summary = {
        'totalTasks': len(tasks),
        'pending': stats.get('byStatus', {}).get('PENDING', 0),
        'inProgress': stats.get('byStatus', {}).get('IN_PROGRESS', 0) + stats.get('byStatus', {}).get('ASSIGNED', 0),
        'completed': stats.get('byStatus', {}).get('COMPLETED', 0),
        'failed': stats.get('byStatus', {}).get('FAILED', 0),
    }
    
    # Priority counts
    by_priority = stats.get('byPriority', {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0})
    
    # Active tasks
    active_tasks = [
        {
            'id': t['id'],
            'type': t.get('type'),
            'status': t.get('status'),
            'priority': t.get('priority'),
            'assignee': t.get('assignee'),
            'created': t.get('created')
        }
        for t in tasks
        if t.get('status') in ['PENDING', 'ASSIGNED', 'IN_PROGRESS']
    ]
    
    # Agent load
    agent_load = {}
    for agent_id, agent_data in agent_status.get('agents', {}).items():
        agent_load[agent_id] = {
            'status': agent_data.get('status', 'UNKNOWN'),
            'load': agent_data.get('load', 0.0),
            'currentTask': agent_data.get('currentTask')
        }
    
    return {
        'type': 'queue_update',
        'timestamp': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'summary': summary,
        'byPriority': by_priority,
        'activeTasks': active_tasks,
        'agentLoad': agent_load
    }


async def broadcast_update(message: dict):
    """Broadcast update to all connected clients."""
    if clients:
        message_json = json.dumps(message)
        await asyncio.gather(
            *[client.send(message_json) for client in clients],
            return_exceptions=True
        )


async def handler(websocket: WebSocketServerProtocol, path: str):
    """Handle WebSocket connection."""
    # Register client
    clients.add(websocket)
    print(f"[WS] Client connected. Total: {len(clients)}")
    
    try:
        # Send initial state
        initial_update = get_queue_update()
        initial_update['type'] = 'initial_state'
        await websocket.send(json.dumps(initial_update))
        
        # Listen for client messages (if any)
        async for message in websocket:
            try:
                data = json.loads(message)
                # Handle client commands
                if data.get('type') == 'ping':
                    await websocket.send(json.dumps({'type': 'pong'}))
                elif data.get('type') == 'refresh':
                    update = get_queue_update()
                    update['type'] = 'refresh_response'
                    await websocket.send(json.dumps(update))
            except json.JSONDecodeError:
                pass
    
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.discard(websocket)
        print(f"[WS] Client disconnected. Total: {len(clients)}")


async def watch_for_changes():
    """Watch queue files for changes and broadcast updates."""
    global last_queue_hash, last_status_hash
    
    while True:
        await asyncio.sleep(1)  # Check every second
        
        # Check for queue changes
        current_queue_hash = get_json_hash(QUEUE_FILE)
        current_status_hash = get_json_hash(AGENT_STATUS_FILE)
        
        if current_queue_hash != last_queue_hash or current_status_hash != last_status_hash:
            last_queue_hash = current_queue_hash
            last_status_hash = current_status_hash
            
            if clients:  # Only broadcast if there are clients
                update = get_queue_update()
                print(f"[WS] Broadcasting update to {len(clients)} clients")
                await broadcast_update(update)


async def main(host: str = 'localhost', port: int = 8765):
    """Start WebSocket server with file watcher."""
    print(f"[WS] Starting WebSocket server on ws://{host}:{port}")
    print("[WS] Queue file watcher active")
    
    # Initialize hashes
    global last_queue_hash, last_status_hash
    last_queue_hash = get_json_hash(QUEUE_FILE)
    last_status_hash = get_json_hash(AGENT_STATUS_FILE)
    
    # Start server and watcher
    server = await websockets.serve(handler, host, port)
    
    # Run watcher in background
    asyncio.create_task(watch_for_changes())
    
    print(f"[WS] Server ready. Connect to ws://{host}:{port}")
    
    # Keep running
    await server.wait_closed()


if __name__ == '__main__':
    import sys
    
    host = 'localhost'
    port = 8765
    
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    
    try:
        asyncio.run(main(host, port))
    except KeyboardInterrupt:
        print("\n[WS] Server stopped")

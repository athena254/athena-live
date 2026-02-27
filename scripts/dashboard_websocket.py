#!/usr/bin/env python3
"""
Athena Dashboard WebSocket Server
Real-time updates for the Athena Live dashboard
Location: scripts/dashboard_websocket.py
"""

import asyncio
import json
import random
from datetime import datetime
from pathlib import Path

try:
    import websockets
    from websockets.server import serve
except ImportError:
    print("Installing websockets...")
    import subprocess
    subprocess.run(["pip", "install", "websockets"], check=True)
    import websockets
    from websockets.server import serve

# Configuration
HOST = "localhost"
PORT = 8765
WORKSPACE = Path(__file__).parent.parent / ".openclaw" / "workspace"
MEMORY_DIR = WORKSPACE / "memory"

# Agent activities for simulation
AGENT_ACTIVITIES = {
    "athena": ["Coordinating tasks", "Processing queue", "Syncing agents", "Routing requests"],
    "sterling": ["Analyzing project", "Placing bid", "Optimizing strategy", "Checking budget"],
    "ishtar": ["Researching PAI", "Synthesizing knowledge", "Running analysis", "Generating insights"],
    "themis": ["Enforcing policy", "Running compliance", "Auditing actions", "Checking rules"],
    "felicity": ["Refactoring code", "Running tests", "Creating component", "Reviewing PR"],
    "prometheus": ["Running automation", "Processing pipeline", "Scheduling task", "Checking integrations"],
    "nexus": ["Updating knowledge", "Learning patterns", "Cross-referencing", "Training model"],
    "delver": ["Researching topic", "Analyzing sources", "Writing report", "Verifying facts"],
    "squire": ["Processing request", "Setting reminder", "Fetching info", "Handling query"],
    "cisco": ["Monitoring security", "Checking logs", "Running audit", "Scanning threats"]
}

# Connected clients
clients = set()

async def broadcast(message):
    """Broadcast message to all connected clients"""
    if clients:
        await asyncio.gather(*[client.send(message) for client in clients])

async def generate_agent_update():
    """Generate a random agent update"""
    agent = random.choice(list(AGENT_ACTIVITIES.keys()))
    activity = random.choice(AGENT_ACTIVITIES[agent])
    
    return {
        "type": "agent_update",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data": {
            "agent": agent,
            "status": random.choice(["active", "idle", "working"]),
            "activity": activity,
            "progress": random.randint(0, 100)
        }
    }

async def generate_queue_update():
    """Generate queue statistics update"""
    return {
        "type": "queue_update",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data": {
            "pending": random.randint(1, 10),
            "in_progress": random.randint(1, 5),
            "completed": random.randint(100, 200),
            "failed": random.randint(0, 3)
        }
    }

async def generate_revenue_update():
    """Generate revenue update"""
    return {
        "type": "revenue_update",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data": {
            "today": round(random.uniform(50, 200), 2),
            "week": round(random.uniform(300, 800), 2),
            "month": round(random.uniform(1500, 3000), 2),
            "active_bids": random.randint(15, 30),
            "win_rate": round(random.uniform(30, 45), 1)
        }
    }

async def generate_notification():
    """Generate a notification"""
    templates = [
        "New task assigned to {agent}",
        "{agent} completed a task",
        "Bid won on project #{id}",
        "New project matches your skills",
        "Weekly report generated",
        "Security scan completed"
    ]
    
    return {
        "type": "notification",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "data": {
            "id": f"notif_{random.randint(1000, 9999)}",
            "message": random.choice(templates).format(
                agent=random.choice(list(AGENT_ACTIVITIES.keys())).title(),
                id=random.randint(10000, 99999)
            ),
            "level": random.choice(["info", "success", "warning"]),
            "read": False
        }
    }

async def read_queue_file():
    """Read actual queue data from file"""
    try:
        queue_file = MEMORY_DIR / "agent-queue.json"
        if queue_file.exists():
            with open(queue_file) as f:
                return json.load(f)
    except Exception as e:
        print(f"Error reading queue file: {e}")
    return None

async def update_loop():
    """Main update loop - broadcasts updates to all clients"""
    while True:
        try:
            # Agent update (every cycle)
            update = await generate_agent_update()
            await broadcast(json.dumps(update))
            print(f"[WS] {update['data']['agent']}: {update['data']['activity']}")
            
            await asyncio.sleep(15)  # 15 second interval
            
            # Queue update (every other cycle)
            if random.random() > 0.5:
                update = await generate_queue_update()
                await broadcast(json.dumps(update))
            
            await asyncio.sleep(15)
            
            # Revenue update (occasionally)
            if random.random() > 0.7:
                update = await generate_revenue_update()
                await broadcast(json.dumps(update))
            
            await asyncio.sleep(10)
            
            # Notification (occasionally)
            if random.random() > 0.6:
                update = await generate_notification()
                await broadcast(json.dumps(update))
                print(f"[WS] Notification: {update['data']['message']}")
            
            await asyncio.sleep(20)  # Total ~60 seconds per cycle
            
        except Exception as e:
            print(f"Error in update loop: {e}")
            await asyncio.sleep(5)

async def handle_client(websocket, path):
    """Handle client connection"""
    clients.add(websocket)
    client_ip = websocket.remote_address[0] if websocket.remote_address else "unknown"
    print(f"[WS] Client connected: {client_ip} ({len(clients)} total)")
    
    try:
        # Send initial state
        initial = {
            "type": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "data": {
                "message": "Connected to Athena Dashboard",
                "clients": len(clients)
            }
        }
        await websocket.send(json.dumps(initial))
        
        # Handle incoming messages (if any)
        async for message in websocket:
            try:
                data = json.loads(message)
                print(f"[WS] Received: {data}")
                
                # Handle specific commands
                if data.get("command") == "get_queue":
                    queue = await read_queue_file()
                    response = {
                        "type": "queue_data",
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "data": queue
                    }
                    await websocket.send(json.dumps(response))
                    
            except json.JSONDecodeError:
                print(f"[WS] Invalid JSON received")
                
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        clients.remove(websocket)
        print(f"[WS] Client disconnected ({len(clients)} remaining)")

async def main():
    """Start WebSocket server"""
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║              Athena Dashboard WebSocket Server               ║
╠══════════════════════════════════════════════════════════════╣
║  Host: {HOST:<54} ║
║  Port: {PORT:<54} ║
║  Status: Running                                              ║
║                                                              ║
║  Endpoints:                                                  ║
║    ws://{HOST}:{PORT} - WebSocket connection               ║
║                                                              ║
║  Message Types:                                              ║
║    - agent_update: Agent status changes                      ║
║    - queue_update: Queue statistics                          ║
║    - revenue_update: Revenue tracking                        ║
║    - notification: User notifications                        ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Start update loop in background
    asyncio.create_task(update_loop())
    
    # Start server
    async with serve(handle_client, HOST, PORT):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[WS] Server stopped")

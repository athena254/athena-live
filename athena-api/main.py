"""
Athena Live API - Real-time agent status & dashboard backend
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import asyncio
import json
import os

app = FastAPI(title="Athena Live API", version="1.0.0")

# CORS for dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agent definitions
AGENTS = {
    "athena": {"name": "Athena", "emoji": "🦉", "color": "#8b5cf6", "role": "Central Orchestrator"},
    "sterling": {"name": "Sterling", "emoji": "💰", "color": "#fbbf24", "role": "Finance & Bids"},
    "ishtar": {"name": "Ishtar", "emoji": "💕", "color": "#6366f1", "role": "Personal Assistant"},
    "themis": {"name": "THEMIS", "emoji": "⚖️", "color": "#14b8a6", "role": "Research Agent"},
    "felicity": {"name": "Felicity", "emoji": "🌸", "color": "#ec4899", "role": "Wellbeing Agent"},
    "prometheus": {"name": "Prometheus", "emoji": "🔥", "color": "#f97316", "role": "DevOps Agent"},
    "nexus": {"name": "Nexus", "emoji": "🌐", "color": "#06b6d4", "role": "Network Agent"},
    "delver": {"name": "Delver", "emoji": "⛏️", "color": "#3b82f6", "role": "Deep Research"},
    "squire": {"name": "Squire", "emoji": "🗡️", "color": "#22c55e", "role": "Task Agent"},
    "cisco": {"name": "Cisco", "emoji": "📡", "color": "#ef4444", "role": "Communication"},
    "kratos": {"name": "Kratos", "emoji": "⚔️", "color": "#10b981", "role": "Security Agent"},
    "apollo": {"name": "Apollo", "emoji": "🌞", "color": "#8b5cf6", "role": "Scheduler Agent"},
    "hermes": {"name": "Hermes", "emoji": "⚡", "color": "#f59e0b", "role": "Messenger Agent"},
}

# Agent states (in-memory, would be DB in production)
agent_states = {
    agent_id: {
        **agent_data,
        "status": "idle",
        "last_active": datetime.utcnow().isoformat(),
        "tasks_completed": 0,
        "current_task": None,
    }
    for agent_id, agent_data in AGENTS.items()
}

# WebSocket connections
connected_clients = []

class AgentStatus(BaseModel):
    agent_id: str
    status: str  # active, idle, offline
    current_task: Optional[str] = None
    tasks_completed: int = 0

class TelemetryEvent(BaseModel):
    agent_id: str
    event_type: str
    data: dict

@app.get("/")
async def root():
    return {"name": "Athena Live API", "status": "operational", "agents": len(AGENTS)}

@app.get("/agents")
async def get_all_agents():
    """Get all agent statuses"""
    return agent_states

@app.get("/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get specific agent status"""
    if agent_id not in agent_states:
        return {"error": "Agent not found"}, 404
    return agent_states[agent_id]

@app.post("/agents/{agent_id}/status")
async def update_agent_status(agent_id: str, status: AgentStatus):
    """Update agent status (for agents to report)"""
    if agent_id not in agent_states:
        return {"error": "Agent not found"}, 404
    
    agent_states[agent_id]["status"] = status.status
    agent_states[agent_id]["current_task"] = status.current_task
    agent_states[agent_id]["tasks_completed"] = status.tasks_completed
    agent_states[agent_id]["last_active"] = datetime.utcnow().isoformat()
    
    # Broadcast update to WebSocket clients
    await broadcast_update(agent_id, agent_states[agent_id])
    
    return {"success": True, "agent": agent_states[agent_id]}

@app.post("/telemetry")
async def receive_telemetry(event: TelemetryEvent):
    """Receive telemetry from agents"""
    agent_id = event.agent_id
    if agent_id in agent_states:
        agent_states[agent_id]["last_active"] = datetime.utcnow().isoformat()
        if event.event_type == "task_start":
            agent_states[agent_id]["status"] = "active"
            agent_states[agent_id]["current_task"] = event.data.get("task", "Unknown task")
        elif event.event_type == "task_complete":
            agent_states[agent_id]["tasks_completed"] += 1
            agent_states[agent_id]["status"] = "idle"
            agent_states[agent_id]["current_task"] = None
        await broadcast_update(agent_id, agent_states[agent_id])
    return {"received": True}

@app.get("/metrics")
async def get_metrics():
    """Get system-wide metrics"""
    active_count = sum(1 for a in agent_states.values() if a["status"] == "active")
    total_tasks = sum(a["tasks_completed"] for a in agent_states.values())
    
    return {
        "total_agents": len(AGENTS),
        "active_agents": active_count,
        "idle_agents": len(AGENTS) - active_count,
        "total_tasks_completed": total_tasks,
        "timestamp": datetime.utcnow().isoformat(),
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await websocket.accept()
    connected_clients.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "data": data})
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

async def broadcast_update(agent_id: str, data: dict):
    """Broadcast agent update to all connected WebSocket clients"""
    message = json.dumps({
        "type": "agent_update",
        "agent_id": agent_id,
        "data": data,
        "timestamp": datetime.utcnow().isoformat()
    })
    for client in connected_clients:
        try:
            await client.send_text(message)
        except:
            pass

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_agent_activity())

async def simulate_agent_activity():
    """Simulate some agent activity for demo purposes"""
    import random
    while True:
        await asyncio.sleep(30)
        agent_id = random.choice(list(AGENTS.keys()))
        agent_states[agent_id]["status"] = "active"
        agent_states[agent_id]["last_active"] = datetime.utcnow().isoformat()
        agent_states[agent_id]["current_task"] = "Processing request..."
        await broadcast_update(agent_id, agent_states[agent_id])
        
        await asyncio.sleep(10)
        agent_states[agent_id]["status"] = "idle"
        agent_states[agent_id]["tasks_completed"] += 1
        agent_states[agent_id]["current_task"] = None
        await broadcast_update(agent_id, agent_states[agent_id])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

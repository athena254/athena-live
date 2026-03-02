#!/usr/bin/env python3
"""
Agent Poller - Fetches real status from running agents and updates the API
"""
import httpx
import asyncio
import os
from datetime import datetime

API_BASE = "http://localhost:8000"

# OpenClaw agent endpoints (would be configured per agent)
AGENT_ENDPOINTS = {
    "athena": "http://localhost:8080/status",
    "sterling": "http://localhost:8081/status",
    "ishtar": "http://localhost:8082/status",
    # Add more as agents come online
}

async def poll_agent(agent_id: str, endpoint: str):
    """Poll a single agent for status"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(endpoint)
            if resp.status_code == 200:
                data = resp.json()
                # Update API
                await client.post(f"{API_BASE}/agents/{agent_id}/status", json={
                    "agent_id": agent_id,
                    "status": data.get("status", "active"),
                    "current_task": data.get("current_task"),
                    "tasks_completed": data.get("tasks_completed", 0)
                })
                return True
    except Exception as e:
        # Agent offline, update status
        async with httpx.AsyncClient() as client:
            await client.post(f"{API_BASE}/agents/{agent_id}/status", json={
                "agent_id": agent_id,
                "status": "offline",
                "current_task": None,
                "tasks_completed": 0
            })
    return False

async def poll_all_agents():
    """Poll all configured agents"""
    tasks = [
        poll_agent(agent_id, endpoint)
        for agent_id, endpoint in AGENT_ENDPOINTS.items()
    ]
    results = await asyncio.gather(*tasks)
    return sum(1 for r in results if r)

async def main():
    """Main polling loop"""
    print(f"[{datetime.utcnow().isoformat()}] Agent Poller started")
    while True:
        online = await poll_all_agents()
        print(f"[{datetime.utcnow().isoformat()}] Polled {len(AGENT_ENDPOINTS)} agents, {online} online")
        await asyncio.sleep(30)  # Poll every 30 seconds

if __name__ == "__main__":
    asyncio.run(main())

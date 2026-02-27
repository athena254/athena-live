#!/usr/bin/env python3
"""
Queue Processor - Process pending tasks on heartbeat
Location: scripts/queue_processor.py
Called by: Athena heartbeat (via HEARTBEAT.md)
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
QUEUE_FILE = MEMORY_DIR / 'agent-queue.json'
AGENT_STATUS_FILE = MEMORY_DIR / 'agent-status.json'


def load_json(filepath: Path) -> dict:
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def save_json(filepath: Path, data: dict) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def cleanup_expired_leases() -> int:
    """Clean up expired task leases."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    now = datetime.utcnow()
    expired_count = 0
    
    for task in tasks:
        if task.get('status') == 'ASSIGNED' and task.get('lease'):
            expires_str = task['lease'].get('expiresAt', '')
            if expires_str:
                try:
                    expires = datetime.fromisoformat(expires_str.rstrip('Z'))
                    if now > expires:
                        task['status'] = 'PENDING'
                        task['lease'] = None
                        task['history'].append({
                            'at': now.isoformat() + 'Z',
                            'event': 'LEASE_EXPIRED'
                        })
                        expired_count += 1
                except ValueError:
                    pass
    
    if expired_count > 0:
        queue['updated'] = now.isoformat() + 'Z'
        save_json(QUEUE_FILE, queue)
    
    return expired_count


def auto_assign_tasks() -> list:
    """Auto-assign pending tasks to available agents based on capabilities."""
    queue = load_json(QUEUE_FILE)
    agent_status = load_json(AGENT_STATUS_FILE)
    
    tasks = queue.get('tasks', [])
    agents = agent_status.get('agents', {})
    
    # Find idle agents
    idle_agents = [
        agent_id for agent_id, data in agents.items()
        if data.get('status') == 'IDLE' and data.get('available', True)
    ]
    
    if not idle_agents:
        return []
    
    # Find pending tasks (sorted by priority)
    priority_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
    pending = [
        t for t in tasks
        if t.get('status') == 'PENDING' and not t.get('assignee')
    ]
    pending.sort(key=lambda t: priority_order.get(t.get('priority', 'MEDIUM'), 99))
    
    if not pending:
        return []
    
    # Match tasks to agents based on capabilities
    agent_capabilities = {
        'athena': ['ORCHESTRATION', 'RESEARCH', 'GENERAL'],
        'sterling': ['FINANCE', 'BIDDING', 'UPWORK'],
        'ishtar': ['RESEARCH', 'PAI', 'DOCUMENTATION'],
        'delver': ['RESEARCH', 'DEEP_DIVE', 'ANALYSIS'],
        'squire': ['TASKS', 'ORGANIZATION', 'REMINDERS'],
        'felicity': ['CREATIVE', 'CONTENT', 'ART'],
        'prometheus': ['MONITORING', 'ALERTS', 'HEALTH'],
        'cisco': ['COMMUNICATION', 'MESSAGES', 'NOTIFICATIONS'],
        'themis': ['JUDGMENT', 'REVIEW', 'DECISIONS']
    }
    
    assigned = []
    now = datetime.utcnow()
    
    for task in pending[:len(idle_agents)]:
        task_type = task.get('type', 'GENERAL')
        
        # Find best agent for task
        best_agent = None
        for agent_id in idle_agents:
            caps = agent_capabilities.get(agent_id, ['GENERAL'])
            if task_type in caps or 'GENERAL' in caps:
                best_agent = agent_id
                break
        
        if best_agent:
            task['status'] = 'ASSIGNED'
            task['assignee'] = best_agent
            task['lease'] = {
                'owner': best_agent,
                'expiresAt': now.replace(hour=now.hour + 1).isoformat() + 'Z'
            }
            task['history'].append({
                'at': now.isoformat() + 'Z',
                'event': 'AUTO_ASSIGNED',
                'by': 'queue_processor'
            })
            
            # Update agent status
            if best_agent in agents:
                agents[best_agent]['status'] = 'BUSY'
                agents[best_agent]['currentTask'] = task['id']
            
            idle_agents.remove(best_agent)
            assigned.append({'task_id': task['id'], 'agent': best_agent})
    
    if assigned:
        queue['updated'] = now.isoformat() + 'Z'
        save_json(QUEUE_FILE, queue)
        agent_status['updated'] = now.isoformat() + 'Z'
        save_json(AGENT_STATUS_FILE, agent_status)
    
    return assigned


def process_queue() -> dict:
    """Main queue processing function."""
    results = {
        'expired_leases': cleanup_expired_leases(),
        'auto_assigned': auto_assign_tasks(),
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }
    return results


# CLI interface
if __name__ == '__main__':
    result = process_queue()
    
    if result['expired_leases'] > 0:
        print(f"✓ Cleaned up {result['expired_leases']} expired leases")
    
    if result['auto_assigned']:
        for assignment in result['auto_assigned']:
            print(f"✓ Auto-assigned {assignment['task_id']} to {assignment['agent']}")
    
    if not result['expired_leases'] and not result['auto_assigned']:
        print("Queue processed: no actions needed")

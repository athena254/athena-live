#!/usr/bin/env python3
"""
Task Coordinator - Athena's Main Orchestration Loop
Location: scripts/task_coordinator.py
"""

import json
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'

# Import modules
sys.path.insert(0, str(WORKSPACE_ROOT / 'scripts'))
from queue_manager import (
    get_next_task, assign_task, start_task, complete_task, fail_task,
    cleanup_expired_leases, get_queue_stats, list_tasks, save_json, load_json
)
from orchestration_rules import (
    select_agent_for_task, route_request, get_available_agents,
    load_agent_status, save_rules
)


def get_agent_for_task_type(task_type: str) -> Optional[str]:
    """Get the best agent for a task type."""
    return select_agent_for_task(task_type, 'MEDIUM')


def process_pending_tasks() -> Dict:
    """Process pending tasks from the queue."""
    results = {
        'processed': 0,
        'assigned': 0,
        'failed': 0,
        'tasks': []
    }
    
    # Clean up expired leases first
    cleanup_expired_leases()
    
    # Get next task
    task = get_next_task()
    
    if not task:
        return results
    
    # Select agent
    agent_id = select_agent_for_task(
        task['type'],
        task['priority'],
        task.get('context', {})
    )
    
    if agent_id:
        # Assign task
        assign_task(task['id'], agent_id)
        results['assigned'] += 1
        results['tasks'].append({
            'taskId': task['id'],
            'type': task['type'],
            'assignedTo': agent_id,
            'status': 'ASSIGNED'
        })
    else:
        # No agent available - keep pending
        results['tasks'].append({
            'taskId': task['id'],
            'type': task['type'],
            'assignedTo': None,
            'status': 'NO_AGENT_AVAILABLE'
        })
    
    results['processed'] += 1
    return results


def check_agent_health() -> Dict:
    """Check health of all agents."""
    status = load_agent_status()
    health = {
        'total': 0,
        'healthy': 0,
        'idle': 0,
        'busy': 0,
        'error': 0,
        'offline': 0,
        'staleHeartbeats': []
    }
    
    now = datetime.utcnow()
    stale_threshold = timedelta(minutes=30)
    
    for agent_id, agent in status.get('agents', {}).items():
        health['total'] += 1
        
        last_hb = agent.get('lastHeartbeat')
        if last_hb:
            try:
                hb_time = datetime.fromisoformat(last_hb.rstrip('Z'))
                if now - hb_time > stale_threshold:
                    health['staleHeartbeats'].append(agent_id)
            except:
                pass
        
        agent_status = agent.get('status', 'UNKNOWN')
        if agent_status == 'IDLE':
            health['idle'] += 1
            health['healthy'] += 1
        elif agent_status == 'BUSY':
            health['busy'] += 1
            health['healthy'] += 1
        elif agent_status == 'ERROR':
            health['error'] += 1
        elif agent_status == 'OFFLINE':
            health['offline'] += 1
    
    return health


def get_system_status() -> Dict:
    """Get overall system status."""
    queue_stats = get_queue_stats()
    agent_health = check_agent_health()
    
    return {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'queue': {
            'pending': queue_stats.get('byStatus', {}).get('PENDING', 0),
            'assigned': queue_stats.get('byStatus', {}).get('ASSIGNED', 0),
            'inProgress': queue_stats.get('byStatus', {}).get('IN_PROGRESS', 0),
            'completed': queue_stats.get('totalProcessed', 0),
            'failed': queue_stats.get('byStatus', {}).get('FAILED', 0)
        },
        'agents': agent_health,
        'health': 'HEALTHY' if agent_health['error'] == 0 and agent_health['offline'] == 0 else 'DEGRADED'
    }


def balance_load() -> Dict:
    """Balance load across agents."""
    status = load_agent_status()
    actions = []
    
    # Find overloaded agents
    overloaded = []
    underloaded = []
    
    for agent_id, agent in status.get('agents', {}).items():
        load = agent.get('load', 0)
        if load > 0.8:
            overloaded.append((agent_id, load))
        elif load < 0.3 and agent.get('status') == 'IDLE':
            underloaded.append((agent_id, load))
    
    # Suggest rebalancing
    if overloaded:
        actions.append({
            'type': 'OVERLOADED_AGENTS',
            'agents': [{'id': a[0], 'load': a[1]} for a in overloaded]
        })
    
    if underloaded:
        actions.append({
            'type': 'AVAILABLE_AGENTS',
            'agents': [{'id': a[0], 'load': a[1]} for a in underloaded]
        })
    
    return {
        'overloaded': len(overloaded),
        'underloaded': len(underloaded),
        'actions': actions
    }


def generate_daily_summary() -> Dict:
    """Generate summary of today's activity."""
    queue_stats = get_queue_stats()
    tasks = list_tasks()
    
    today = datetime.utcnow().strftime('%Y-%m-%d')
    today_tasks = [t for t in tasks if t.get('created', '').startswith(today)]
    
    completed = [t for t in today_tasks if t['status'] == 'COMPLETED']
    failed = [t for t in today_tasks if t['status'] == 'FAILED']
    pending = [t for t in today_tasks if t['status'] in ['PENDING', 'ASSIGNED', 'IN_PROGRESS']]
    
    by_type = {}
    for task in today_tasks:
        t_type = task.get('type', 'UNKNOWN')
        by_type[t_type] = by_type.get(t_type, 0) + 1
    
    by_agent = {}
    for task in completed:
        agent = task.get('assignee', 'unassigned')
        by_agent[agent] = by_agent.get(agent, 0) + 1
    
    return {
        'date': today,
        'total': len(today_tasks),
        'completed': len(completed),
        'failed': len(failed),
        'pending': len(pending),
        'avgCompletionTimeMs': queue_stats.get('avgCompletionTimeMs', 0),
        'byType': by_type,
        'byAgent': by_agent
    }


def coordinate_handoff(from_agent: str, to_agent: str, context: Dict) -> Dict:
    """Coordinate handoff between agents."""
    status = load_agent_status()
    
    # Verify agents exist
    if from_agent not in status.get('agents', {}):
        return {'success': False, 'error': f'Agent {from_agent} not found'}
    if to_agent not in status.get('agents', {}):
        return {'success': False, 'error': f'Agent {to_agent} not found'}
    
    # Verify receiving agent is available
    if status['agents'][to_agent].get('status') != 'IDLE':
        return {'success': False, 'error': f'Agent {to_agent} is not available'}
    
    # Log handoff
    global_state = load_json(MEMORY_DIR / 'global-state.json')
    global_state.setdefault('coordination', {})
    global_state['coordination']['agentMessages'] = global_state['coordination'].get('agentMessages', 0) + 1
    global_state['coordination']['successfulHandoffs'] = global_state['coordination'].get('successfulHandoffs', 0) + 1
    global_state['updated'] = datetime.utcnow().isoformat() + 'Z'
    save_json(MEMORY_DIR / 'global-state.json', global_state)
    
    return {
        'success': True,
        'from': from_agent,
        'to': to_agent,
        'context': context,
        'timestamp': datetime.utcnow().isoformat() + 'Z'
    }


# CLI interface
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: task_coordinator.py <command> [args]")
        print("Commands: process, status, health, balance, summary, handoff")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'process':
        results = process_pending_tasks()
        print(json.dumps(results, indent=2))
    
    elif cmd == 'status':
        status = get_system_status()
        print(json.dumps(status, indent=2))
    
    elif cmd == 'health':
        health = check_agent_health()
        print(json.dumps(health, indent=2))
    
    elif cmd == 'balance':
        result = balance_load()
        print(json.dumps(result, indent=2))
    
    elif cmd == 'summary':
        summary = generate_daily_summary()
        print(json.dumps(summary, indent=2))
    
    elif cmd == 'handoff':
        if len(sys.argv) < 5:
            print("Usage: handoff <from_agent> <to_agent> <context_json>")
            sys.exit(1)
        result = coordinate_handoff(
            sys.argv[2],
            sys.argv[3],
            json.loads(sys.argv[4])
        )
        print(json.dumps(result, indent=2))
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

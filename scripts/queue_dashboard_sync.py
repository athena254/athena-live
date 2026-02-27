#!/usr/bin/env python3
"""
Queue Dashboard Sync - Syncs queue stats to Athena Live dashboard
Location: scripts/queue_dashboard_sync.py
"""

import json
import sys
import os
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
QUEUE_FILE = MEMORY_DIR / 'agent-queue.json'
AGENT_STATUS_FILE = MEMORY_DIR / 'agent-status.json'
DASHBOARD_API_DIR = WORKSPACE_ROOT / 'athena-live' / 'api'
QUEUE_STATS_FILE = DASHBOARD_API_DIR / 'queue-stats.json'


def load_json(filepath: Path) -> dict:
    """Load JSON file safely."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def save_json(filepath: Path, data: dict) -> None:
    """Save JSON file."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def sync_queue_stats() -> dict:
    """Sync queue stats to dashboard API."""
    queue = load_json(QUEUE_FILE)
    agent_status = load_json(AGENT_STATUS_FILE)
    
    tasks = queue.get('tasks', [])
    stats = queue.get('stats', {})
    
    # Calculate summary
    summary = {
        'totalTasks': len(tasks),
        'pending': stats.get('byStatus', {}).get('PENDING', 0),
        'inProgress': stats.get('byStatus', {}).get('IN_PROGRESS', 0) + stats.get('byStatus', {}).get('ASSIGNED', 0),
        'completed': stats.get('byStatus', {}).get('COMPLETED', 0),
        'failed': stats.get('byStatus', {}).get('FAILED', 0),
        'avgCompletionTimeMs': stats.get('avgCompletionTimeMs', 0)
    }
    
    # By priority
    by_priority = stats.get('byPriority', {'CRITICAL': 0, 'HIGH': 0, 'MEDIUM': 0, 'LOW': 0})
    
    # By type
    type_counter = Counter(t.get('type', 'UNKNOWN') for t in tasks if t.get('status') in ['PENDING', 'ASSIGNED', 'IN_PROGRESS'])
    by_type = dict(type_counter)
    
    # Agent load
    agent_load = {}
    for agent_id, agent_data in agent_status.get('agents', {}).items():
        agent_load[agent_id] = {
            'status': agent_data.get('status', 'UNKNOWN'),
            'load': agent_data.get('load', 0.0),
            'currentTask': agent_data.get('currentTask')
        }
    
    # Recent activity (last 10 events from task history)
    recent_activity = []
    for task in sorted(tasks, key=lambda t: t.get('created', ''), reverse=True)[:10]:
        if task.get('history'):
            latest = task['history'][-1]
            recent_activity.append({
                'taskId': task['id'],
                'type': task.get('type'),
                'event': latest.get('event'),
                'at': latest.get('at'),
                'by': latest.get('by')
            })
    
    dashboard_data = {
        'generated': datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z'),
        'summary': summary,
        'byPriority': by_priority,
        'byType': by_type,
        'agentLoad': agent_load,
        'recentActivity': recent_activity
    }
    
    save_json(QUEUE_STATS_FILE, dashboard_data)
    
    return dashboard_data


# CLI interface
if __name__ == '__main__':
    result = sync_queue_stats()
    print(f"✓ Synced queue stats to dashboard")
    print(f"  Total tasks: {result['summary']['totalTasks']}")
    print(f"  Pending: {result['summary']['pending']}")
    print(f"  In Progress: {result['summary']['inProgress']}")
    print(f"  Completed: {result['summary']['completed']}")

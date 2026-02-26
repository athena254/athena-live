#!/usr/bin/env python3
"""
Queue Manager - Task Queue Operations for Athena Multi-Agent System
Location: scripts/queue_manager.py
"""

import json
import uuid
import sys
import os
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, List, Any

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
QUEUE_FILE = MEMORY_DIR / 'agent-queue.json'
AGENT_STATUS_FILE = MEMORY_DIR / 'agent-status.json'
GLOBAL_STATE_FILE = MEMORY_DIR / 'global-state.json'

PRIORITY_ORDER = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
LEASE_TTL_MINUTES = 10


def load_json(filepath: Path) -> Dict:
    """Load JSON file safely."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError as e:
        print(f"Error decoding {filepath}: {e}", file=sys.stderr)
        return {}


def save_json(filepath: Path, data: Dict) -> None:
    """Save JSON file with formatting."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"✓ Saved {filepath.name}")


def generate_task_id() -> str:
    """Generate unique task ID."""
    return f"task_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"


def create_task(
    task_type: str,
    priority: str,
    requester: str,
    input_data: Any,
    assignee: Optional[str] = None,
    deadline: Optional[str] = None,
    dependencies: Optional[List[str]] = None,
    tags: Optional[List[str]] = None,
    context: Optional[Dict] = None,
    max_retries: int = 3
) -> Dict:
    """Create a new task object."""
    now = datetime.utcnow().isoformat() + 'Z'
    
    task = {
        'id': generate_task_id(),
        'type': task_type,
        'status': 'PENDING',
        'priority': priority,
        'created': now,
        'deadline': deadline,
        'assignee': assignee,
        'requester': requester,
        'input': input_data,
        'output': None,
        'error': None,
        'retryCount': 0,
        'maxRetries': max_retries,
        'dependencies': dependencies or [],
        'tags': tags or [],
        'context': context or {},
        'history': [{'at': now, 'event': 'CREATED', 'by': requester}]
    }
    
    return task


def add_task(task: Dict) -> bool:
    """Add task to queue."""
    queue = load_json(QUEUE_FILE)
    
    if 'tasks' not in queue:
        queue['tasks'] = []
    if 'indexes' not in queue:
        queue['indexes'] = {
            'byStatus': {'PENDING': [], 'ASSIGNED': [], 'IN_PROGRESS': [], 'COMPLETED': [], 'FAILED': [], 'CANCELLED': []},
            'byAssignee': {},
            'byPriority': {'CRITICAL': [], 'HIGH': [], 'MEDIUM': [], 'LOW': []}
        }
    
    queue['tasks'].append(task)
    
    # Update indexes
    queue['indexes']['byStatus']['PENDING'].append(task['id'])
    queue['indexes']['byPriority'].get(task['priority'], []).append(task['id'])
    
    # Update stats
    queue['stats']['byStatus']['PENDING'] = queue['stats']['byStatus'].get('PENDING', 0) + 1
    queue['stats']['byPriority'][task['priority']] = queue['stats']['byPriority'].get(task['priority'], 0) + 1
    
    queue['updated'] = datetime.utcnow().isoformat() + 'Z'
    save_json(QUEUE_FILE, queue)
    
    return True


def get_next_task() -> Optional[Dict]:
    """Get next task to process (highest priority, earliest deadline)."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    # Filter pending tasks without dependencies
    pending = [t for t in tasks if t['status'] == 'PENDING']
    
    # Check dependencies
    ready = []
    for task in pending:
        deps_met = all(
            any(t['id'] == dep_id and t['status'] == 'COMPLETED' for t in tasks)
            for dep_id in task.get('dependencies', [])
        )
        if deps_met:
            ready.append(task)
    
    if not ready:
        return None
    
    # Sort by priority, then deadline
    def sort_key(t):
        priority_score = PRIORITY_ORDER.get(t['priority'], 99)
        deadline_score = t.get('deadline') or '9999-99-99'
        return (priority_score, deadline_score)
    
    ready.sort(key=sort_key)
    return ready[0]


def assign_task(task_id: str, agent_id: str) -> bool:
    """Assign task to an agent."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        print(f"Task {task_id} not found", file=sys.stderr)
        return False
    
    task['status'] = 'ASSIGNED'
    task['assignee'] = agent_id
    task['lease'] = {
        'owner': agent_id,
        'expiresAt': (datetime.utcnow() + timedelta(minutes=LEASE_TTL_MINUTES)).isoformat() + 'Z'
    }
    task['history'].append({
        'at': datetime.utcnow().isoformat() + 'Z',
        'event': 'ASSIGNED',
        'by': agent_id
    })
    
    # Update indexes
    if task_id in queue['indexes']['byStatus']['PENDING']:
        queue['indexes']['byStatus']['PENDING'].remove(task_id)
    queue['indexes']['byStatus']['ASSIGNED'].append(task_id)
    
    if agent_id not in queue['indexes']['byAssignee']:
        queue['indexes']['byAssignee'][agent_id] = []
    queue['indexes']['byAssignee'][agent_id].append(task_id)
    
    # Update stats
    queue['stats']['byStatus']['PENDING'] = max(0, queue['stats']['byStatus'].get('PENDING', 0) - 1)
    queue['stats']['byStatus']['ASSIGNED'] = queue['stats']['byStatus'].get('ASSIGNED', 0) + 1
    
    queue['updated'] = datetime.utcnow().isoformat() + 'Z'
    save_json(QUEUE_FILE, queue)
    
    # Update agent status
    update_agent_task(agent_id, task_id)
    
    return True


def start_task(task_id: str, agent_id: str) -> bool:
    """Mark task as in progress."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return False
    
    task['status'] = 'IN_PROGRESS'
    task['history'].append({
        'at': datetime.utcnow().isoformat() + 'Z',
        'event': 'STARTED',
        'by': agent_id
    })
    
    # Update indexes
    if task_id in queue['indexes']['byStatus']['ASSIGNED']:
        queue['indexes']['byStatus']['ASSIGNED'].remove(task_id)
    queue['indexes']['byStatus']['IN_PROGRESS'].append(task_id)
    
    queue['stats']['byStatus']['ASSIGNED'] = max(0, queue['stats']['byStatus'].get('ASSIGNED', 0) - 1)
    queue['stats']['byStatus']['IN_PROGRESS'] = queue['stats']['byStatus'].get('IN_PROGRESS', 0) + 1
    
    queue['updated'] = datetime.utcnow().isoformat() + 'Z'
    save_json(QUEUE_FILE, queue)
    
    return True


def complete_task(task_id: str, output: Any, agent_id: str) -> bool:
    """Mark task as completed."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return False
    
    now = datetime.utcnow().isoformat() + 'Z'
    created = datetime.fromisoformat(task['created'].rstrip('Z'))
    duration_ms = int((datetime.utcnow() - created).total_seconds() * 1000)
    
    task['status'] = 'COMPLETED'
    task['output'] = output
    task['history'].append({
        'at': now,
        'event': 'COMPLETED',
        'by': agent_id
    })
    
    # Update indexes
    for status in ['PENDING', 'ASSIGNED', 'IN_PROGRESS']:
        if task_id in queue['indexes']['byStatus'].get(status, []):
            queue['indexes']['byStatus'][status].remove(task_id)
    queue['indexes']['byStatus']['COMPLETED'].append(task_id)
    
    # Update stats
    old_status = task.get('previousStatus', 'IN_PROGRESS')
    queue['stats']['byStatus'][old_status] = max(0, queue['stats']['byStatus'].get(old_status, 0) - 1)
    queue['stats']['byStatus']['COMPLETED'] = queue['stats']['byStatus'].get('COMPLETED', 0) + 1
    queue['stats']['totalProcessed'] = queue['stats'].get('totalProcessed', 0) + 1
    
    # Update average completion time
    total = queue['stats']['totalProcessed']
    old_avg = queue['stats'].get('avgCompletionTimeMs', 0)
    queue['stats']['avgCompletionTimeMs'] = int((old_avg * (total - 1) + duration_ms) / total)
    queue['stats']['lastProcessedAt'] = now
    
    queue['updated'] = now
    save_json(QUEUE_FILE, queue)
    
    # Clear agent task
    update_agent_task(agent_id, None)
    
    return True


def fail_task(task_id: str, error: str, agent_id: str, retry: bool = True) -> bool:
    """Mark task as failed."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    task = next((t for t in tasks if t['id'] == task_id), None)
    if not task:
        return False
    
    now = datetime.utcnow().isoformat() + 'Z'
    
    if retry and task['retryCount'] < task['maxRetries']:
        task['status'] = 'PENDING'
        task['retryCount'] += 1
        task['error'] = error
        task['history'].append({
            'at': now,
            'event': f'RETRY_{task["retryCount"]}',
            'by': agent_id
        })
    else:
        task['status'] = 'FAILED'
        task['error'] = error
        task['history'].append({
            'at': now,
            'event': 'FAILED',
            'by': agent_id
        })
        queue['stats']['byStatus']['FAILED'] = queue['stats']['byStatus'].get('FAILED', 0) + 1
    
    queue['updated'] = now
    save_json(QUEUE_FILE, queue)
    
    return True


def update_agent_task(agent_id: str, task_id: Optional[str]) -> None:
    """Update agent's current task."""
    status = load_json(AGENT_STATUS_FILE)
    
    if agent_id in status.get('agents', {}):
        status['agents'][agent_id]['currentTask'] = task_id
        status['agents'][agent_id]['lastHeartbeat'] = datetime.utcnow().isoformat() + 'Z'
        
        if task_id:
            status['agents'][agent_id]['status'] = 'BUSY'
            status['agents'][agent_id]['load'] = min(1.0, status['agents'][agent_id].get('load', 0) + 0.2)
        else:
            status['agents'][agent_id]['status'] = 'IDLE'
            status['agents'][agent_id]['load'] = 0.0
        
        # Update health metrics
        busy = sum(1 for a in status['agents'].values() if a.get('status') == 'BUSY')
        idle = sum(1 for a in status['agents'].values() if a.get('status') == 'IDLE')
        status['healthMetrics']['busyAgents'] = busy
        status['healthMetrics']['idleAgents'] = idle
        
        status['updated'] = datetime.utcnow().isoformat() + 'Z'
        save_json(AGENT_STATUS_FILE, status)


def cleanup_expired_leases() -> List[str]:
    """Clean up expired task leases."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    now = datetime.utcnow()
    expired = []
    
    for task in tasks:
        if task['status'] == 'ASSIGNED' and task.get('lease'):
            expires = datetime.fromisoformat(task['lease']['expiresAt'].rstrip('Z'))
            if now > expires:
                task['status'] = 'PENDING'
                task['lease'] = None
                task['history'].append({
                    'at': now.isoformat() + 'Z',
                    'event': 'LEASE_EXPIRED'
                })
                expired.append(task['id'])
    
    if expired:
        queue['updated'] = now.isoformat() + 'Z'
        save_json(QUEUE_FILE, queue)
    
    return expired


def get_queue_stats() -> Dict:
    """Get queue statistics."""
    queue = load_json(QUEUE_FILE)
    return queue.get('stats', {})


def list_tasks(status: Optional[str] = None, assignee: Optional[str] = None) -> List[Dict]:
    """List tasks with optional filters."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    if status:
        tasks = [t for t in tasks if t['status'] == status]
    if assignee:
        tasks = [t for t in tasks if t.get('assignee') == assignee]
    
    return tasks


# CLI interface
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: queue_manager.py <command> [args]")
        print("Commands: add, next, assign, start, complete, fail, stats, list, cleanup")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'add':
        # Example: queue_manager.py add RESEARCH HIGH athena '{"topic": "PAI hooks"}'
        if len(sys.argv) < 5:
            print("Usage: add <type> <priority> <requester> <input_json> [assignee] [deadline]")
            sys.exit(1)
        
        task_type = sys.argv[2]
        priority = sys.argv[3]
        requester = sys.argv[4]
        input_data = json.loads(sys.argv[5]) if len(sys.argv) > 5 else {}
        assignee = sys.argv[6] if len(sys.argv) > 6 else None
        deadline = sys.argv[7] if len(sys.argv) > 7 else None
        
        task = create_task(task_type, priority, requester, input_data, assignee, deadline)
        add_task(task)
        print(f"✓ Created task: {task['id']}")
    
    elif cmd == 'next':
        task = get_next_task()
        if task:
            print(json.dumps(task, indent=2))
        else:
            print("No pending tasks")
    
    elif cmd == 'assign':
        if len(sys.argv) < 4:
            print("Usage: assign <task_id> <agent_id>")
            sys.exit(1)
        assign_task(sys.argv[2], sys.argv[3])
        print(f"✓ Assigned {sys.argv[2]} to {sys.argv[3]}")
    
    elif cmd == 'start':
        if len(sys.argv) < 4:
            print("Usage: start <task_id> <agent_id>")
            sys.exit(1)
        start_task(sys.argv[2], sys.argv[3])
        print(f"✓ Started {sys.argv[2]}")
    
    elif cmd == 'complete':
        if len(sys.argv) < 4:
            print("Usage: complete <task_id> <agent_id> [output_json]")
            sys.exit(1)
        output = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {'status': 'done'}
        complete_task(sys.argv[2], output, sys.argv[3])
        print(f"✓ Completed {sys.argv[2]}")
    
    elif cmd == 'fail':
        if len(sys.argv) < 5:
            print("Usage: fail <task_id> <agent_id> <error_message>")
            sys.exit(1)
        fail_task(sys.argv[2], sys.argv[4], sys.argv[3])
        print(f"✓ Failed {sys.argv[2]}: {sys.argv[4]}")
    
    elif cmd == 'stats':
        stats = get_queue_stats()
        print(json.dumps(stats, indent=2))
    
    elif cmd == 'list':
        status = sys.argv[2] if len(sys.argv) > 2 else None
        assignee = sys.argv[3] if len(sys.argv) > 3 else None
        tasks = list_tasks(status, assignee)
        print(json.dumps(tasks, indent=2))
    
    elif cmd == 'cleanup':
        expired = cleanup_expired_leases()
        print(f"✓ Cleaned up {len(expired)} expired leases: {expired}")
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

#!/usr/bin/env python3
"""
Task Archiver - Archive completed/failed tasks for persistence
Location: scripts/task_archiver.py
Runs: Monthly via cron (first day of each month at 00:00 UTC)
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
ARCHIVE_DIR = MEMORY_DIR / 'archive' / 'tasks'
QUEUE_FILE = MEMORY_DIR / 'agent-queue.json'


def load_json(filepath: Path) -> Dict:
    """Load JSON file safely."""
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}


def save_json(filepath: Path, data: Dict) -> None:
    """Save JSON file."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)


def archive_tasks(older_than_days: int = 30) -> Dict:
    """Archive tasks older than specified days."""
    queue = load_json(QUEUE_FILE)
    tasks = queue.get('tasks', [])
    
    now = datetime.utcnow()
    cutoff = now - timedelta(days=older_than_days)
    
    # Find tasks to archive
    to_archive = []
    to_keep = []
    
    for task in tasks:
        # Only archive completed or failed tasks
        if task.get('status') not in ['COMPLETED', 'FAILED', 'CANCELLED']:
            to_keep.append(task)
            continue
        
        # Check age
        created_str = task.get('created', '')
        if created_str:
            try:
                created = datetime.fromisoformat(created_str.rstrip('Z'))
                if created < cutoff:
                    to_archive.append(task)
                else:
                    to_keep.append(task)
            except ValueError:
                to_keep.append(task)
        else:
            to_keep.append(task)
    
    if not to_archive:
        return {'archived': 0, 'kept': len(to_keep)}
    
    # Create archive file
    archive_month = (now - timedelta(days=older_than_days)).strftime('%Y-%m')
    archive_file = ARCHIVE_DIR / f'tasks-{archive_month}.json'
    
    # Load existing archive or create new
    if archive_file.exists():
        archive_data = load_json(archive_file)
        existing_ids = {t['id'] for t in archive_data.get('tasks', [])}
        # Add only new tasks
        for task in to_archive:
            if task['id'] not in existing_ids:
                archive_data['tasks'].append(task)
    else:
        archive_data = {
            'month': archive_month,
            'archivedAt': now.isoformat() + 'Z',
            'tasks': to_archive
        }
    
    save_json(archive_file, archive_data)
    
    # Update queue file
    queue['tasks'] = to_keep
    
    # Rebuild indexes
    queue['indexes'] = {
        'byStatus': {'PENDING': [], 'ASSIGNED': [], 'IN_PROGRESS': [], 'COMPLETED': [], 'FAILED': [], 'CANCELLED': []},
        'byAssignee': {},
        'byPriority': {'CRITICAL': [], 'HIGH': [], 'MEDIUM': [], 'LOW': []}
    }
    
    for task in to_keep:
        queue['indexes']['byStatus'][task.get('status', 'PENDING')].append(task['id'])
        queue['indexes']['byPriority'][task.get('priority', 'MEDIUM')].append(task['id'])
        if task.get('assignee'):
            if task['assignee'] not in queue['indexes']['byAssignee']:
                queue['indexes']['byAssignee'][task['assignee']] = []
            queue['indexes']['byAssignee'][task['assignee']].append(task['id'])
    
    # Update stats
    queue['stats']['byStatus'] = {status: len(ids) for status, ids in queue['indexes']['byStatus'].items()}
    queue['stats']['byPriority'] = {pri: len(ids) for pri, ids in queue['indexes']['byPriority'].items()}
    queue['updated'] = now.isoformat() + 'Z'
    
    save_json(QUEUE_FILE, queue)
    
    return {
        'archived': len(to_archive),
        'kept': len(to_keep),
        'archiveFile': str(archive_file)
    }


def list_archives() -> List[Dict]:
    """List all archive files."""
    archives = []
    if ARCHIVE_DIR.exists():
        for f in sorted(ARCHIVE_DIR.glob('tasks-*.json')):
            data = load_json(f)
            archives.append({
                'file': f.name,
                'month': data.get('month', 'unknown'),
                'taskCount': len(data.get('tasks', []))
            })
    return archives


def restore_archive(month: str) -> bool:
    """Restore tasks from an archive back to active queue."""
    archive_file = ARCHIVE_DIR / f'tasks-{month}.json'
    if not archive_file.exists():
        print(f"Archive not found: {archive_file}")
        return False
    
    archive_data = load_json(archive_file)
    queue = load_json(QUEUE_FILE)
    
    # Add archived tasks back to queue
    existing_ids = {t['id'] for t in queue.get('tasks', [])}
    for task in archive_data.get('tasks', []):
        if task['id'] not in existing_ids:
            queue['tasks'].append(task)
    
    save_json(QUEUE_FILE, queue)
    print(f"Restored {len(archive_data.get('tasks', []))} tasks from {month}")
    return True


# CLI interface
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: task_archiver.py <command> [args]")
        print("Commands:")
        print("  archive [days]  - Archive tasks older than N days (default 30)")
        print("  list            - List all archive files")
        print("  restore <month> - Restore tasks from archive (YYYY-MM)")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'archive':
        days = int(sys.argv[2]) if len(sys.argv) > 2 else 30
        result = archive_tasks(days)
        print(f"✓ Archived {result['archived']} tasks, kept {result['kept']} active")
        if result['archived'] > 0:
            print(f"  Archive file: {result['archiveFile']}")
    
    elif cmd == 'list':
        archives = list_archives()
        if archives:
            print("Archives:")
            for a in archives:
                print(f"  {a['file']}: {a['taskCount']} tasks ({a['month']})")
        else:
            print("No archives found")
    
    elif cmd == 'restore':
        if len(sys.argv) < 3:
            print("Usage: task_archiver.py restore <YYYY-MM>")
            sys.exit(1)
        restore_archive(sys.argv[2])
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)

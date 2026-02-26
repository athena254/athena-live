#!/usr/bin/env python3
"""
Queue Hook Handlers - OpenClaw Hook Integration for Task Queue
Location: scripts/hook_handlers.py
"""

import json
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
HOOKS_DIR = WORKSPACE_ROOT / 'hooks'

# Import modules
sys.path.insert(0, str(WORKSPACE_ROOT / 'scripts'))
from queue_manager import add_task, create_task, assign_task
from orchestration_rules import route_request


def handle_incoming_message(event: Dict) -> Dict:
    """Handle incoming message events - route to appropriate agent."""
    message = event.get('message', {})
    channel = event.get('channel', 'unknown')
    sender = message.get('from', 'unknown')
    text = message.get('text', '')
    
    # Detect task type from message content
    task_type = detect_task_type(text)
    priority = detect_priority(text)
    
    # Route to queue
    task_id, agent_id = route_request(
        request_type=task_type,
        priority=priority,
        requester=sender,
        input_data={
            'message': text,
            'channel': channel,
            'event': event
        },
        context={
            'source': 'hook',
            'channel': channel
        }
    )
    
    return {
        'action': 'routed',
        'taskId': task_id,
        'assignedTo': agent_id,
        'type': task_type
    }


def detect_task_type(text: str) -> str:
    """Detect task type from message content."""
    text_lower = text.lower()
    
    # Finance keywords
    if any(kw in text_lower for kw in ['budget', 'finance', 'bid', 'invoice', 'payment']):
        return 'FINANCE'
    
    # Research keywords
    if any(kw in text_lower for kw in ['research', 'investigate', 'find out', 'analyze', 'study']):
        return 'RESEARCH'
    
    # Client/prospect keywords
    if any(kw in text_lower for kw in ['client', 'prospect', 'lead', 'customer', 'outreach']):
        return 'PROSPECTING'
    
    # Trading keywords
    if any(kw in text_lower for kw in ['crypto', 'bitcoin', 'eth', 'defi', 'trade', 'token']):
        return 'TRADING'
    
    # Support keywords
    if any(kw in text_lower for kw in ['help', 'support', 'stressed', 'anxious', 'overwhelmed']):
        return 'SUPPORT'
    
    # Task management keywords
    if any(kw in text_lower for kw in ['remind', 'schedule', 'todo', 'task', 'deadline']):
        return 'TASK_MGMT'
    
    # Content keywords
    if any(kw in text_lower for kw in ['write', 'content', 'post', 'article', 'blog']):
        return 'CONTENT'
    
    # Planning keywords
    if any(kw in text_lower for kw in ['plan', 'roadmap', 'milestone', 'sprint', 'project']):
        return 'PLANNING'
    
    # Testing keywords
    if any(kw in text_lower for kw in ['test', 'qa', 'bug', 'verify', 'validate']):
        return 'TESTING'
    
    # Default
    return 'EXECUTION'


def detect_priority(text: str) -> str:
    """Detect priority from message content."""
    text_lower = text.lower()
    
    # Critical indicators
    if any(kw in text_lower for kw in ['urgent', 'critical', 'emergency', 'asap', 'immediately']):
        return 'CRITICAL'
    
    # High indicators
    if any(kw in text_lower for kw in ['important', 'high priority', 'priority', 'soon', 'today']):
        return 'HIGH'
    
    # Low indicators
    if any(kw in text_lower for kw in ['when you can', 'low priority', 'eventually', 'someday']):
        return 'LOW'
    
    # Default
    return 'MEDIUM'


def handle_cron_task(event: Dict) -> Dict:
    """Handle cron-triggered tasks."""
    job_id = event.get('jobId', 'unknown')
    job_name = event.get('jobName', 'unknown')
    task_type = event.get('taskType', 'EXECUTION')
    input_data = event.get('input', {})
    
    # Create task
    task = create_task(
        task_type=task_type,
        priority=event.get('priority', 'MEDIUM'),
        requester=f'cron:{job_id}',
        input_data=input_data,
        context={
            'source': 'cron',
            'jobId': job_id,
            'jobName': job_name
        }
    )
    
    add_task(task)
    
    return {
        'action': 'queued',
        'taskId': task['id'],
        'jobId': job_id
    }


def handle_agent_completion(event: Dict) -> Dict:
    """Handle agent task completion - trigger follow-up tasks."""
    from queue_manager import complete_task
    
    task_id = event.get('taskId')
    agent_id = event.get('agentId')
    output = event.get('output', {})
    
    if task_id and agent_id:
        complete_task(task_id, output, agent_id)
    
    # Check for follow-up tasks
    follow_ups = event.get('followUps', [])
    created = []
    
    for follow_up in follow_ups:
        task = create_task(
            task_type=follow_up.get('type', 'EXECUTION'),
            priority=follow_up.get('priority', 'MEDIUM'),
            requester=agent_id,
            input_data=follow_up.get('input', {}),
            dependencies=[task_id] if follow_up.get('dependsOnSource') else []
        )
        add_task(task)
        created.append(task['id'])
    
    return {
        'action': 'completed',
        'taskId': task_id,
        'followUpsCreated': len(created)
    }


def handle_webhook(event: Dict) -> Dict:
    """Handle external webhook events."""
    source = event.get('source', 'unknown')
    event_type = event.get('type', 'unknown')
    
    # Route to appropriate agent based on source
    task_type_map = {
        'beelancer': 'PROSPECTING',
        'github': 'EXECUTION',
        'stripe': 'FINANCE',
        'calendar': 'TASK_MGMT',
        'email': 'CLIENT_COMM'
    }
    
    task_type = task_type_map.get(source, 'EXECUTION')
    
    task_id, agent_id = route_request(
        request_type=task_type,
        priority=event.get('priority', 'MEDIUM'),
        requester=f'webhook:{source}',
        input_data=event.get('data', {}),
        context={
            'source': 'webhook',
            'webhookSource': source,
            'webhookType': event_type
        }
    )
    
    return {
        'action': 'routed',
        'taskId': task_id,
        'assignedTo': agent_id,
        'source': source
    }


# CLI interface for testing
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: hook_handlers.py <type> <event_json>")
        print("Types: message, cron, completion, webhook")
        sys.exit(1)
    
    hook_type = sys.argv[1]
    event = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    
    handlers = {
        'message': handle_incoming_message,
        'cron': handle_cron_task,
        'completion': handle_agent_completion,
        'webhook': handle_webhook
    }
    
    handler = handlers.get(hook_type)
    if handler:
        result = handler(event)
        print(json.dumps(result, indent=2))
    else:
        print(f"Unknown hook type: {hook_type}")
        sys.exit(1)

#!/usr/bin/env python3
"""
Orchestration Rules Engine - Task Routing for Athena Multi-Agent System
Location: scripts/orchestration_rules.py
"""

import json
import re
import sys
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple

# Constants
WORKSPACE_ROOT = Path(os.environ.get('OPENCLAW_WORKSPACE', Path.home() / '.openclaw' / 'workspace'))
MEMORY_DIR = WORKSPACE_ROOT / 'memory'
RULES_FILE = MEMORY_DIR / 'orchestration-rules.json'
AGENT_STATUS_FILE = MEMORY_DIR / 'agent-status.json'

# Import queue manager
sys.path.insert(0, str(WORKSPACE_ROOT / 'scripts'))
from queue_manager import add_task, create_task, get_next_task, assign_task


def load_rules() -> Dict:
    """Load orchestration rules."""
    try:
        with open(RULES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'version': '1.0', 'rules': [], 'defaultAssignments': {}}


def save_rules(rules: Dict) -> None:
    """Save orchestration rules."""
    RULES_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(RULES_FILE, 'w') as f:
        json.dump(rules, f, indent=2)


def load_agent_status() -> Dict:
    """Load agent status."""
    try:
        with open(AGENT_STATUS_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'agents': {}}


def get_available_agents(capability: Optional[str] = None) -> List[Dict]:
    """Get list of available agents, optionally filtered by capability."""
    status = load_agent_status()
    agents = []
    
    for agent_id, agent_data in status.get('agents', {}).items():
        if agent_data.get('status') == 'IDLE':
            if capability is None or capability in agent_data.get('capabilities', []):
                agents.append({
                    'id': agent_id,
                    'name': agent_data.get('name', agent_id),
                    'load': agent_data.get('load', 0),
                    'capabilities': agent_data.get('capabilities', [])
                })
    
    # Sort by load (lowest first)
    agents.sort(key=lambda a: a['load'])
    return agents


def match_rule(trigger: Dict, context: Dict) -> bool:
    """Check if a rule's trigger matches the context."""
    for key, condition in trigger.items():
        if key not in context:
            return False
        
        value = context[key]
        
        # Simple equality
        if isinstance(condition, str) or isinstance(condition, (int, float, bool)):
            if value != condition:
                return False
        
        # Complex conditions
        elif isinstance(condition, dict):
            if 'eq' in condition and value != condition['eq']:
                return False
            if 'ne' in condition and value == condition['ne']:
                return False
            if 'gt' in condition and not (value > condition['gt']):
                return False
            if 'lt' in condition and not (value < condition['lt']):
                return False
            if 'gte' in condition and not (value >= condition['gte']):
                return False
            if 'lte' in condition and not (value <= condition['lte']):
                return False
            if 'in' in condition and value not in condition['in']:
                return False
            if 'nin' in condition and value in condition['nin']:
                return False
            if 'contains' in condition and condition['contains'] not in str(value):
                return False
            if 'regex' in condition and not re.search(condition['regex'], str(value)):
                return False
    
    return True


def find_matching_rule(context: Dict, rules: Optional[Dict] = None) -> Optional[Dict]:
    """Find the first rule that matches the context."""
    if rules is None:
        rules = load_rules()
    
    for rule in rules.get('rules', []):
        if match_rule(rule.get('trigger', {}), context):
            return rule
    
    return None


def select_agent_for_task(
    task_type: str,
    priority: str,
    context: Optional[Dict] = None,
    preferred_agent: Optional[str] = None
) -> Optional[str]:
    """Select the best agent for a task."""
    
    # If preferred agent is specified and available
    if preferred_agent:
        status = load_agent_status()
        if preferred_agent in status.get('agents', {}):
            agent = status['agents'][preferred_agent]
            if agent.get('status') == 'IDLE':
                return preferred_agent
    
    # Check orchestration rules
    rule_context = {
        'type': task_type,
        'priority': priority,
        **(context or {})
    }
    
    rule = find_matching_rule(rule_context)
    if rule:
        action = rule.get('action', {})
        assign_to = action.get('assignTo')
        
        if assign_to:
            status = load_agent_status()
            if isinstance(assign_to, list):
                # Pick first available from list
                for agent_id in assign_to:
                    if agent_id in status.get('agents', {}):
                        if status['agents'][agent_id].get('status') == 'IDLE':
                            return agent_id
            else:
                if assign_to in status.get('agents', {}):
                    if status['agents'][assign_to].get('status') == 'IDLE':
                        return assign_to
    
    # Default assignments by task type
    defaults = {
        'RESEARCH': ['ishtar', 'delver'],
        'FINANCE': ['sterling'],
        'PROSPECTING': ['apollo'],
        'CLIENT_COMM': ['hermes'],
        'TASK_MGMT': ['squire'],
        'CONTENT': ['talia'],
        'TESTING': ['chiron'],
        'NOTIFICATION': ['cisco'],
        'SUPPORT': ['felicity'],
        'PLANNING': ['prometheus'],
        'TRADING': ['kratos'],
        'MEMORY': ['mnemosyne'],
        'COMPLIANCE': ['themis'],
        'ANALYSIS': ['delver', 'ishtar'],
        'EXECUTION': ['athena']
    }
    
    candidates = defaults.get(task_type, [])
    for agent_id in candidates:
        agents = get_available_agents()
        for agent in agents:
            if agent['id'] == agent_id:
                return agent_id
    
    # Fallback: pick any available agent
    available = get_available_agents()
    if available:
        return available[0]['id']
    
    return None


def route_request(
    request_type: str,
    priority: str,
    requester: str,
    input_data: Any,
    context: Optional[Dict] = None,
    deadline: Optional[str] = None
) -> Tuple[Optional[str], Optional[str]]:
    """Route a request to the appropriate agent via task queue."""
    
    # Select agent
    agent_id = select_agent_for_task(request_type, priority, context)
    
    # Create task
    task = create_task(
        task_type=request_type,
        priority=priority,
        requester=requester,
        input_data=input_data,
        assignee=agent_id,
        deadline=deadline,
        context=context
    )
    
    # Add to queue
    add_task(task)
    
    # Assign if agent selected
    if agent_id:
        assign_task(task['id'], agent_id)
    
    return task['id'], agent_id


def create_default_rules() -> Dict:
    """Create default orchestration rules."""
    return {
        'version': '1.0',
        'updated': datetime.utcnow().isoformat() + 'Z',
        'rules': [
            # Finance rules
            {
                'id': 'rule_finance_auto',
                'name': 'Auto-bid Finance Tasks',
                'trigger': {
                    'type': 'FINANCE',
                    'subType': 'auto_bid'
                },
                'action': {
                    'assignTo': 'sterling',
                    'priority': 'HIGH',
                    'notify': []
                },
                'enabled': True
            },
            {
                'id': 'rule_finance_large',
                'name': 'Large Budget Review',
                'trigger': {
                    'type': 'FINANCE',
                    'amount': {'gt': 10000}
                },
                'action': {
                    'assignTo': 'sterling',
                    'priority': 'CRITICAL',
                    'notify': ['dis']
                },
                'enabled': True
            },
            
            # Research rules
            {
                'id': 'rule_research_pai',
                'name': 'PAI Research to Ishtar',
                'trigger': {
                    'type': 'RESEARCH',
                    'topic': {'regex': '(?i)\\bpai\\b'}
                },
                'action': {
                    'assignTo': 'ishtar',
                    'priority': 'MEDIUM',
                    'deadline': '4h'
                },
                'enabled': True
            },
            {
                'id': 'rule_research_general',
                'name': 'General Research to Delver',
                'trigger': {
                    'type': 'RESEARCH'
                },
                'action': {
                    'assignTo': 'delver',
                    'priority': 'MEDIUM'
                },
                'enabled': True
            },
            
            # Client/Prospect rules
            {
                'id': 'rule_new_prospect',
                'name': 'New Prospect Routing',
                'trigger': {
                    'type': 'PROSPECTING',
                    'source': 'beelancer'
                },
                'action': {
                    'assignTo': 'apollo',
                    'priority': 'HIGH',
                    'notify': ['hermes']
                },
                'enabled': True
            },
            {
                'id': 'rule_client_comm',
                'name': 'Client Communication',
                'trigger': {
                    'type': 'CLIENT_COMM'
                },
                'action': {
                    'assignTo': 'hermes',
                    'priority': 'HIGH'
                },
                'enabled': True
            },
            
            # Critical alerts
            {
                'id': 'rule_critical',
                'name': 'Critical Priority Override',
                'trigger': {
                    'priority': 'CRITICAL'
                },
                'action': {
                    'assignTo': 'athena',
                    'notify': ['dis']
                },
                'enabled': True
            },
            
            # Trading rules
            {
                'id': 'rule_trading',
                'name': 'Crypto/DeFi Trading',
                'trigger': {
                    'type': 'TRADING'
                },
                'action': {
                    'assignTo': 'kratos',
                    'priority': 'HIGH',
                    'notify': ['sterling']
                },
                'enabled': True
            },
            
            # Compliance
            {
                'id': 'rule_compliance',
                'name': 'Compliance Tasks',
                'trigger': {
                    'type': 'COMPLIANCE'
                },
                'action': {
                    'assignTo': 'themis',
                    'priority': 'HIGH',
                    'notify': ['dis']
                },
                'enabled': True
            }
        ],
        'defaultAssignments': {
            'RESEARCH': 'delver',
            'FINANCE': 'sterling',
            'PROSPECTING': 'apollo',
            'CLIENT_COMM': 'hermes',
            'TASK_MGMT': 'squire',
            'CONTENT': 'talia',
            'TESTING': 'chiron',
            'NOTIFICATION': 'cisco',
            'SUPPORT': 'felicity',
            'PLANNING': 'prometheus',
            'TRADING': 'kratos',
            'MEMORY': 'mnemosyne',
            'COMPLIANCE': 'themis',
            'ANALYSIS': 'delver'
        }
    }


# CLI interface
if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: orchestration_rules.py <command> [args]")
        print("Commands: init, route, select, list, agents")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == 'init':
        rules = create_default_rules()
        save_rules(rules)
        print(f"✓ Created default rules at {RULES_FILE}")
    
    elif cmd == 'route':
        if len(sys.argv) < 5:
            print("Usage: route <type> <priority> <requester> <input_json>")
            sys.exit(1)
        
        request_type = sys.argv[2]
        priority = sys.argv[3]
        requester = sys.argv[4]
        input_data = json.loads(sys.argv[5]) if len(sys.argv) > 5 else {}
        
        task_id, agent_id = route_request(request_type, priority, requester, input_data)
        print(f"✓ Routed to {agent_id}: task {task_id}")
    
    elif cmd == 'select':
        if len(sys.argv) < 4:
            print("Usage: select <type> <priority>")
            sys.exit(1)
        
        task_type = sys.argv[2]
        priority = sys.argv[3]
        agent_id = select_agent_for_task(task_type, priority)
        print(f"Selected agent: {agent_id}")
    
    elif cmd == 'list':
        rules = load_rules()
        print(json.dumps(rules, indent=2))
    
    elif cmd == 'agents':
        capability = sys.argv[2] if len(sys.argv) > 2 else None
        agents = get_available_agents(capability)
        print(json.dumps(agents, indent=2))
    
    else:
        print(f"Unknown command: {cmd}")
        sys.exit(1)
